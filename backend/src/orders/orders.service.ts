import { randomInt } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Order,
  OrderItem,
  OrderStatus,
  Payment,
  PaymentStatus,
  Prisma,
  Product,
  Role,
  SizeOption,
  Topping,
} from '@prisma/client';
import { SafeUser } from '../auth/types/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { VouchersService } from '../vouchers/vouchers.service';
import { CreateOrderDto, CreateOrderItemDto } from './dto/create-order.dto';
import { assertTransition } from './order-state-machine';

type ProductWithSizes = Product & { sizes: SizeOption[] };

export type OrderWithDetails = Order & {
  items: OrderItem[];
  payments: Payment[];
};

interface ResolvedOrderItemData {
  productId: string;
  productName: string;
  sizeName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  toppings: Prisma.InputJsonValue;
}

const MAX_ORDER_NUMBER_ATTEMPTS = 3;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vouchersService: VouchersService,
  ) {}

  private generateOrderNumber(): string {
    return `#${randomInt(100000, 999999)}`;
  }

  private resolveSize(
    product: ProductWithSizes,
    itemDto: CreateOrderItemDto,
  ): { sizeName: string; extraPrice: number } {
    if (product.sizes.length === 0) {
      return { sizeName: 'Tiêu chuẩn', extraPrice: 0 };
    }

    if (itemDto.sizeId && itemDto.sizeId !== 'default') {
      const matchedById = product.sizes.find((size) => size.id === itemDto.sizeId);
      if (!matchedById) {
        throw new BadRequestException(`Kích cỡ không hợp lệ cho món "${product.name}"`);
      }
      return { sizeName: matchedById.name, extraPrice: matchedById.extraPrice };
    }

    if (itemDto.sizeCode) {
      const normalizedCode = itemDto.sizeCode.trim().toUpperCase();
      const matchedByCode = product.sizes.find(
        (size) => size.code.toUpperCase() === normalizedCode,
      );
      if (!matchedByCode) {
        throw new BadRequestException(`Kích cỡ "${itemDto.sizeCode}" không tồn tại cho "${product.name}"`);
      }
      return { sizeName: matchedByCode.name, extraPrice: matchedByCode.extraPrice };
    }

    const defaultSize = product.sizes.find((size) => size.isDefault) ?? product.sizes[0];
    return { sizeName: defaultSize.name, extraPrice: defaultSize.extraPrice };
  }

  private resolveToppings(
    toppingIds: string[] | undefined,
    toppingMap: Map<string, Topping>,
  ): {
    selectedToppings: Array<{ id: string; name: string; price: number }>;
    toppingsExtra: number;
  } {
    const uniqueIds = Array.from(new Set(toppingIds ?? []));
    const selectedToppings = uniqueIds.map((toppingId) => {
      const topping = toppingMap.get(toppingId);
      if (!topping) {
        throw new BadRequestException(`Topping "${toppingId}" không tồn tại hoặc tạm ngưng phục vụ`);
      }
      return {
        id: topping.id,
        name: topping.name,
        price: topping.price,
      };
    });

    const toppingsExtra = selectedToppings.reduce((sum, topping) => sum + topping.price, 0);
    return { selectedToppings, toppingsExtra };
  }

  private isOrderNumberCollision(error: unknown): boolean {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
      return false;
    }
    const target = error.meta?.target;
    if (Array.isArray(target)) {
      return target.includes('orderNumber');
    }
    return String(target ?? '').includes('orderNumber');
  }

  async createOrder(user: SafeUser, dto: CreateOrderDto): Promise<Order & { items: OrderItem[] }> {
    const requestedQuantityByProduct = new Map<string, number>();
    const toppingIdSet = new Set<string>();

    for (const item of dto.items) {
      const currentQty = requestedQuantityByProduct.get(item.productId) ?? 0;
      requestedQuantityByProduct.set(item.productId, currentQty + item.quantity);
      for (const toppingId of item.toppingIds ?? []) {
        toppingIdSet.add(toppingId);
      }
    }

    const uniqueProductIds = Array.from(requestedQuantityByProduct.keys());
    const uniqueToppingIds = Array.from(toppingIdSet);

    const [products, toppings] = await Promise.all([
      this.prisma.product.findMany({
        where: { id: { in: uniqueProductIds } },
        include: { sizes: true },
      }),
      uniqueToppingIds.length > 0
        ? this.prisma.topping.findMany({
            where: { id: { in: uniqueToppingIds }, isAvailable: true },
          })
        : Promise.resolve([]),
    ]);

    const productMap = new Map<string, ProductWithSizes>(
      products.map((product) => [product.id, product]),
    );
    const toppingMap = new Map<string, Topping>(
      toppings.map((topping) => [topping.id, topping]),
    );

    for (const [productId, totalRequestedQty] of requestedQuantityByProduct.entries()) {
      const product = productMap.get(productId);
      if (!product) {
        throw new NotFoundException(`Không tìm thấy sản phẩm với mã "${productId}"`);
      }
      if (!product.isAvailable) {
        throw new BadRequestException(`Sản phẩm "${product.name}" hiện đang tạm ngưng phục vụ`);
      }
      if (product.stock < totalRequestedQty) {
        throw new ConflictException(
          `Sản phẩm "${product.name}" không đủ tồn kho (còn ${product.stock}, yêu cầu ${totalRequestedQty})`,
        );
      }
    }

    const itemNotes: string[] = [];
    const resolvedItems: ResolvedOrderItemData[] = dto.items.map((itemDto) => {
      const product = productMap.get(itemDto.productId) as ProductWithSizes;
      const { sizeName, extraPrice } = this.resolveSize(product, itemDto);
      const { selectedToppings, toppingsExtra } = this.resolveToppings(
        itemDto.toppingIds,
        toppingMap,
      );

      const unitPrice = product.basePrice + extraPrice + toppingsExtra;
      const subtotal = unitPrice * itemDto.quantity;

      const trimmedNote = itemDto.note?.trim();
      if (trimmedNote) {
        itemNotes.push(`${product.name} (${sizeName}): ${trimmedNote}`);
      }

      return {
        productId: product.id,
        productName: product.name,
        sizeName,
        unitPrice,
        quantity: itemDto.quantity,
        subtotal,
        toppings: selectedToppings,
      };
    });

    const totalAmount = resolvedItems.reduce((sum, item) => sum + item.subtotal, 0);

    let discountAmount = 0;
    let finalAmount = totalAmount;
    if (dto.voucherCode?.trim()) {
      const voucherResult = await this.vouchersService.applyVoucherDiscount(
        dto.voucherCode,
        totalAmount,
      );
      discountAmount = voucherResult.discountAmount;
      finalAmount = voucherResult.finalAmount;
    }

    const combinedNotes = [dto.note?.trim(), ...itemNotes]
      .filter((part): part is string => Boolean(part && part.length > 0))
      .join(' | ');

    const customerName = dto.customerName?.trim() || user.fullName;
    const customerPhone = dto.customerPhone?.trim() || user.phone || '0000000000';
    const paymentMethod = dto.paymentMethod || 'MOCK_WALLET';

    for (let attempt = 0; attempt < MAX_ORDER_NUMBER_ATTEMPTS; attempt++) {
      try {
        return await this.prisma.order.create({
          data: {
            orderNumber: this.generateOrderNumber(),
            userId: user.id,
            customerName,
            customerPhone,
            note: combinedNotes || null,
            status: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.UNPAID,
            paymentMethod,
            totalAmount,
            discountAmount,
            finalAmount,
            items: {
              create: resolvedItems,
            },
          },
          include: {
            items: true,
          },
        });
      } catch (error) {
        if (this.isOrderNumberCollision(error) && attempt < MAX_ORDER_NUMBER_ATTEMPTS - 1) {
          continue;
        }
        throw error;
      }
    }

    throw new ConflictException('Không thể khởi tạo mã đơn hàng mới, vui lòng thử lại');
  }

  async getMyOrders(userId: string): Promise<OrderWithDetails[]> {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(orderId: string, requester: SafeUser): Promise<OrderWithDetails> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    if (requester.role === Role.CUSTOMER && order.userId !== requester.id) {
      throw new ForbiddenException('Bạn không có quyền truy cập đơn hàng này');
    }

    return order;
  }

  private resolveNextPaymentStatus(targetStatus: OrderStatus): PaymentStatus | undefined {
    if (targetStatus === OrderStatus.PAID) {
      return PaymentStatus.PAID;
    }
    if (targetStatus === OrderStatus.PAYMENT_FAILED) {
      return PaymentStatus.FAILED;
    }
    if (targetStatus === OrderStatus.PENDING) {
      return PaymentStatus.UNPAID;
    }
    return undefined;
  }

  async updateOrderStatus(
    orderId: string,
    targetStatus: OrderStatus,
    requester: SafeUser,
  ): Promise<OrderWithDetails> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          payments: true,
        },
      });

      if (!order) {
        throw new NotFoundException('Không tìm thấy đơn hàng');
      }

      if (requester.role === Role.CUSTOMER) {
        if (order.userId !== requester.id) {
          throw new ForbiddenException('Bạn không có quyền cập nhật đơn hàng này');
        }
        const customerAllowedTargets: readonly OrderStatus[] = [
          OrderStatus.CANCELLED,
          OrderStatus.PENDING,
        ];
        if (!customerAllowedTargets.includes(targetStatus)) {
          throw new ForbiddenException(
            'Khách hàng không có quyền chuyển đơn hàng sang trạng thái này',
          );
        }
      }

      assertTransition(order.status, targetStatus);

      const hasConfirmedPaidPayment = order.payments.some(
        (payment) => payment.status === PaymentStatus.PAID,
      );

      if (
        order.status === OrderStatus.PAID &&
        targetStatus === OrderStatus.CANCELLED &&
        hasConfirmedPaidPayment
      ) {
        const restoreQuantityByProduct = new Map<string, number>();
        for (const item of order.items) {
          const currentQty = restoreQuantityByProduct.get(item.productId) ?? 0;
          restoreQuantityByProduct.set(item.productId, currentQty + item.quantity);
        }

        for (const [productId, quantity] of restoreQuantityByProduct.entries()) {
          await tx.product.update({
            where: { id: productId },
            data: {
              stock: { increment: quantity },
              version: { increment: 1 },
            },
          });
        }
      }

      const nextPaymentStatus = this.resolveNextPaymentStatus(targetStatus);
      const updated = await tx.order.updateMany({
        where: {
          id: orderId,
          status: order.status,
        },
        data: {
          status: targetStatus,
          ...(nextPaymentStatus ? { paymentStatus: nextPaymentStatus } : {}),
        },
      });

      if (updated.count === 0) {
        throw new ConflictException(
          'Trạng thái đơn hàng đã được cập nhật trước đó, vui lòng tải lại và thử lại',
        );
      }

      return tx.order.findUniqueOrThrow({
        where: { id: orderId },
        include: {
          items: true,
          payments: true,
        },
      });
    });
  }
}
