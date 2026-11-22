import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { OrderStatus, Payment, PaymentStatus, Prisma, Product, Role } from '@prisma/client';
import { SafeUser } from '../auth/types/auth.types';
import { assertTransition } from '../orders/order-state-machine';
import { OrderWithDetails } from '../orders/orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PayosService } from './payos.service';

export interface ProcessPaymentResult {
  success: boolean;
  idempotentReplay: boolean;
  message: string;
  payment: Payment;
  order: OrderWithDetails;
  loyaltyPointsEarned: number;
  loyaltyPointsBalance: number | null;
}

export interface PayosCheckoutResponse {
  orderId: string;
  orderCode: number;
  amount: number;
  description: string;
  bin: string;
  accountNumber: string;
  accountName: string;
  checkoutUrl: string;
  qrCode: string;
}

export interface PayosSyncResponse {
  paid: boolean;
  payosStatus: string;
  paymentResult?: ProcessPaymentResult;
}

type PaymentWithOrderDetails = Payment & {
  order: OrderWithDetails & {
    user: { loyaltyPoints: number } | null;
  };
};

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly payosService?: PayosService,
  ) {}

  private calculateLoyaltyPoints(finalAmount: number): number {
    if (finalAmount <= 0) {
      return 0;
    }
    return Math.floor(finalAmount / 10000);
  }

  private isIdempotencyKeyCollision(error: unknown): boolean {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
      return false;
    }
    const target = error.meta?.target;
    if (Array.isArray(target)) {
      return target.includes('idempotencyKey');
    }
    return String(target ?? '').includes('idempotencyKey');
  }

  private buildReplayResult(
    existingPayment: PaymentWithOrderDetails,
    requestedOrderId: string,
    requester: SafeUser,
  ): ProcessPaymentResult {
    if (requester.role === Role.CUSTOMER && existingPayment.order.userId !== requester.id) {
      throw new ConflictException('Khóa Idempotency-Key đã được sử dụng bởi giao dịch khác');
    }

    if (existingPayment.orderId !== requestedOrderId) {
      throw new ConflictException('Khóa Idempotency-Key này đã gắn với một đơn hàng khác');
    }

    const succeeded = existingPayment.status === PaymentStatus.PAID;
    const loyaltyPointsEarned =
      succeeded && existingPayment.order.userId
        ? this.calculateLoyaltyPoints(existingPayment.order.finalAmount)
        : 0;
    const { user: orderUser, ...orderWithoutUser } = existingPayment.order;
    const { order: _omittedOrder, ...paymentRecord } = existingPayment;
    void _omittedOrder;

    return {
      success: succeeded,
      idempotentReplay: true,
      message: succeeded
        ? 'Giao dịch đã được xử lý trước đó (Idempotent replay)'
        : 'Giao dịch thất bại đã được ghi nhận trước đó (Idempotent replay)',
      payment: paymentRecord,
      order: orderWithoutUser,
      loyaltyPointsEarned,
      loyaltyPointsBalance: orderUser ? orderUser.loyaltyPoints : null,
    };
  }

  private async findExistingPaymentByKey(
    idempotencyKey: string,
  ): Promise<PaymentWithOrderDetails | null> {
    return this.prisma.payment.findUnique({
      where: { idempotencyKey },
      include: {
        order: {
          include: {
            items: true,
            payments: true,
            user: {
              select: { loyaltyPoints: true },
            },
          },
        },
      },
    });
  }

  async processPayment(
    requester: SafeUser,
    dto: CreatePaymentDto,
    headerIdempotencyKey?: string,
  ): Promise<ProcessPaymentResult> {
    const idempotencyKey = (headerIdempotencyKey?.trim() || dto.idempotencyKey?.trim() || '');
    if (!idempotencyKey) {
      throw new BadRequestException(
        'Vui lòng cung cấp khóa Idempotency-Key trong header hoặc body để đảm bảo an toàn thanh toán',
      );
    }

    const existingPayment = await this.findExistingPaymentByKey(idempotencyKey);
    if (existingPayment) {
      return this.buildReplayResult(existingPayment, dto.orderId, requester);
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: dto.orderId },
          include: {
            items: true,
            payments: true,
          },
        });

        if (!order) {
          throw new NotFoundException('Không tìm thấy đơn hàng');
        }

        if (requester.role === Role.CUSTOMER && order.userId !== requester.id) {
          throw new ForbiddenException('Bạn không có quyền thanh toán đơn hàng này');
        }

        const shouldFail = Boolean(dto.simulateFailure);
        const targetOrderStatus = shouldFail ? OrderStatus.PAYMENT_FAILED : OrderStatus.PAID;
        const targetPaymentStatus = shouldFail ? PaymentStatus.FAILED : PaymentStatus.PAID;

        if (order.status === OrderStatus.PAYMENT_FAILED) {
          assertTransition(order.status, OrderStatus.PENDING);
          assertTransition(OrderStatus.PENDING, targetOrderStatus);
        } else {
          assertTransition(order.status, targetOrderStatus);
        }

        if (targetOrderStatus === OrderStatus.PAID) {
          const quantityByProduct = new Map<string, number>();
          for (const item of order.items) {
            const currentQty = quantityByProduct.get(item.productId) ?? 0;
            quantityByProduct.set(item.productId, currentQty + item.quantity);
          }

          const sortedProductIds = Array.from(quantityByProduct.keys()).sort();
          if (sortedProductIds.length > 0) {
            const products = await tx.product.findMany({
              where: { id: { in: sortedProductIds } },
            });
            const productMap = new Map<string, Product>(
              products.map((product) => [product.id, product]),
            );

            for (const productId of sortedProductIds) {
              const requiredQty = quantityByProduct.get(productId) ?? 0;
              const product = productMap.get(productId);

              if (!product) {
                throw new NotFoundException(`Không tìm thấy sản phẩm "${productId}" trong đơn hàng`);
              }

              if (!product.isAvailable) {
                throw new BadRequestException(`Sản phẩm "${product.name}" hiện đã tạm ngưng phục vụ`);
              }

              if (product.stock < requiredQty) {
                throw new ConflictException(
                  `Sản phẩm "${product.name}" không đủ tồn kho (còn ${product.stock}, yêu cầu ${requiredQty})`,
                );
              }

              const lockUpdate = await tx.product.updateMany({
                where: {
                  id: productId,
                  isAvailable: true,
                  version: product.version,
                  stock: { gte: requiredQty },
                },
                data: {
                  stock: { decrement: requiredQty },
                  version: { increment: 1 },
                },
              });

              if (lockUpdate.count === 0) {
                throw new ConflictException(
                  `Xung đột tồn kho đồng thời cho sản phẩm "${product.name}", vui lòng thử lại`,
                );
              }
            }
          }
        }

        const resolvedMethod = dto.method || order.paymentMethod || 'WALLET';
        const paidAt = targetOrderStatus === OrderStatus.PAID ? new Date() : null;
        const transactionId =
          targetOrderStatus === OrderStatus.PAID
            ? `TXN-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`
            : null;

        const orderUpdate = await tx.order.updateMany({
          where: {
            id: order.id,
            status: order.status,
          },
          data: {
            status: targetOrderStatus,
            paymentStatus: targetPaymentStatus,
            paymentMethod: resolvedMethod,
            ...(targetOrderStatus === OrderStatus.PAID ? { idempotencyKey } : {}),
          },
        });

        if (orderUpdate.count === 0) {
          throw new ConflictException(
            'Đơn hàng đang được xử lý bởi yêu cầu khác, vui lòng kiểm tra lại lịch sử đơn',
          );
        }

        const createdPayment = await tx.payment.create({
          data: {
            orderId: order.id,
            idempotencyKey,
            amount: order.finalAmount,
            method: resolvedMethod,
            status: targetPaymentStatus,
            transactionId,
            paidAt,
          },
        });

        let loyaltyPointsEarned = 0;
        let loyaltyPointsBalance: number | null = null;

        if (order.userId) {
          if (targetOrderStatus === OrderStatus.PAID) {
            const earned = this.calculateLoyaltyPoints(order.finalAmount);
            loyaltyPointsEarned = earned;
            if (earned > 0) {
              const updatedUser = await tx.user.update({
                where: { id: order.userId },
                data: {
                  loyaltyPoints: { increment: earned },
                },
                select: { loyaltyPoints: true },
              });
              loyaltyPointsBalance = updatedUser.loyaltyPoints;
            } else {
              const existingUser = await tx.user.findUnique({
                where: { id: order.userId },
                select: { loyaltyPoints: true },
              });
              loyaltyPointsBalance = existingUser ? existingUser.loyaltyPoints : null;
            }
          } else {
            const existingUser = await tx.user.findUnique({
              where: { id: order.userId },
              select: { loyaltyPoints: true },
            });
            loyaltyPointsBalance = existingUser ? existingUser.loyaltyPoints : null;
          }
        }

        const updatedOrder = await tx.order.findUniqueOrThrow({
          where: { id: order.id },
          include: {
            items: true,
            payments: true,
          },
        });

        return {
          success: targetOrderStatus === OrderStatus.PAID,
          idempotentReplay: false,
          message:
            targetOrderStatus === OrderStatus.PAID
              ? 'Thanh toán thành công, đơn hàng đã chuyển sang trạng thái PAID'
              : 'Thanh toán không thành công, đơn hàng được đánh dấu PAYMENT_FAILED',
          payment: createdPayment,
          order: updatedOrder,
          loyaltyPointsEarned,
          loyaltyPointsBalance,
        };
      });
    } catch (error) {
      if (error instanceof ConflictException || this.isIdempotencyKeyCollision(error)) {
        const winningPayment = await this.findExistingPaymentByKey(idempotencyKey);
        if (winningPayment) {
          return this.buildReplayResult(winningPayment, dto.orderId, requester);
        }
      }
      throw error;
    }
  }

  private getRequiredPayosService(): PayosService {
    if (!this.payosService) {
      throw new ServiceUnavailableException('Dịch vụ PayOS chưa được khởi tạo');
    }
    return this.payosService;
  }

  private async deductInventoryWithOptimisticLock(
    tx: Prisma.TransactionClient,
    order: OrderWithDetails,
  ): Promise<void> {
    const quantityByProduct = new Map<string, number>();
    for (const item of order.items) {
      const currentQty = quantityByProduct.get(item.productId) ?? 0;
      quantityByProduct.set(item.productId, currentQty + item.quantity);
    }

    const sortedProductIds = Array.from(quantityByProduct.keys()).sort();
    if (sortedProductIds.length === 0) {
      return;
    }

    const products = await tx.product.findMany({
      where: { id: { in: sortedProductIds } },
    });
    const productMap = new Map<string, Product>(products.map((p) => [p.id, p]));

    for (const productId of sortedProductIds) {
      const requiredQty = quantityByProduct.get(productId) ?? 0;
      const product = productMap.get(productId);

      if (!product) {
        throw new NotFoundException(`Không tìm thấy sản phẩm "${productId}" trong đơn hàng`);
      }
      if (!product.isAvailable) {
        throw new BadRequestException(`Sản phẩm "${product.name}" hiện đã tạm ngưng phục vụ`);
      }
      if (product.stock < requiredQty) {
        throw new ConflictException(
          `Sản phẩm "${product.name}" không đủ tồn kho (còn ${product.stock}, yêu cầu ${requiredQty})`,
        );
      }

      const lockUpdate = await tx.product.updateMany({
        where: {
          id: productId,
          isAvailable: true,
          version: product.version,
          stock: { gte: requiredQty },
        },
        data: {
          stock: { decrement: requiredQty },
          version: { increment: 1 },
        },
      });

      if (lockUpdate.count === 0) {
        throw new ConflictException(
          `Xung đột tồn kho đồng thời cho sản phẩm "${product.name}", vui lòng thử lại`,
        );
      }
    }
  }

  private async settleOrderLoyaltyPoints(
    tx: Prisma.TransactionClient,
    userId: string | null,
    finalAmount: number,
  ): Promise<{ earned: number; balance: number | null }> {
    if (!userId) {
      return { earned: 0, balance: null };
    }
    const earned = this.calculateLoyaltyPoints(finalAmount);
    if (earned > 0) {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { loyaltyPoints: { increment: earned } },
        select: { loyaltyPoints: true },
      });
      return { earned, balance: updatedUser.loyaltyPoints };
    }
    const existingUser = await tx.user.findUnique({
      where: { id: userId },
      select: { loyaltyPoints: true },
    });
    return { earned: 0, balance: existingUser ? existingUser.loyaltyPoints : null };
  }

  private async finalizePayosPayment(paymentId: string): Promise<ProcessPaymentResult> {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: {
          order: {
            include: {
              items: true,
              payments: true,
              user: { select: { loyaltyPoints: true } },
            },
          },
        },
      });

      if (!payment) {
        throw new NotFoundException('Không tìm thấy giao dịch PayOS');
      }

      if (payment.status === PaymentStatus.PAID && payment.order.status === OrderStatus.PAID) {
        const { user: orderUser, ...orderWithoutUser } = payment.order;
        const { order: _omitted, ...paymentOnly } = payment;
        void _omitted;
        return {
          success: true,
          idempotentReplay: true,
          message: 'Giao dịch PayOS đã được xác nhận trước đó',
          payment: paymentOnly,
          order: orderWithoutUser,
          loyaltyPointsEarned: payment.order.userId
            ? this.calculateLoyaltyPoints(payment.order.finalAmount)
            : 0,
          loyaltyPointsBalance: orderUser ? orderUser.loyaltyPoints : null,
        };
      }

      const order = payment.order;
      if (order.status === OrderStatus.PAYMENT_FAILED) {
        assertTransition(order.status, OrderStatus.PENDING);
        assertTransition(OrderStatus.PENDING, OrderStatus.PAID);
      } else {
        assertTransition(order.status, OrderStatus.PAID);
      }

      await this.deductInventoryWithOptimisticLock(tx, order);

      const orderUpdate = await tx.order.updateMany({
        where: { id: order.id, status: order.status },
        data: {
          status: OrderStatus.PAID,
          paymentStatus: PaymentStatus.PAID,
          paymentMethod: 'PAYOS_VIETQR',
          idempotencyKey: payment.idempotencyKey,
        },
      });

      if (orderUpdate.count === 0) {
        throw new ConflictException('Đơn hàng đã được cập nhật bởi giao dịch khác');
      }

      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
        },
      });

      const loyalty = await this.settleOrderLoyaltyPoints(tx, order.userId, order.finalAmount);

      const updatedOrder = await tx.order.findUniqueOrThrow({
        where: { id: order.id },
        include: { items: true, payments: true },
      });

      return {
        success: true,
        idempotentReplay: false,
        message: 'Thanh toán VietQR (PayOS) thành công',
        payment: updatedPayment,
        order: updatedOrder,
        loyaltyPointsEarned: loyalty.earned,
        loyaltyPointsBalance: loyalty.balance,
      };
    });
  }

  async createPayosPayment(
    requester: SafeUser,
    dto: CreatePaymentDto,
    headerIdempotencyKey?: string,
  ): Promise<PayosCheckoutResponse> {
    const payos = this.getRequiredPayosService();
    const idempotencyKey = (headerIdempotencyKey?.trim() || dto.idempotencyKey?.trim() || '');
    if (!idempotencyKey) {
      throw new BadRequestException('Vui lòng cung cấp Idempotency-Key để tạo mã thanh toán VietQR');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { items: true, payments: true },
    });
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
    if (requester.role === Role.CUSTOMER && order.userId !== requester.id) {
      throw new ForbiddenException('Bạn không có quyền thanh toán đơn hàng này');
    }
    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException('Đơn hàng này đã được thanh toán thành công');
    }
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PAYMENT_FAILED) {
      throw new BadRequestException(`Không thể tạo mã thanh toán cho đơn ở trạng thái ${order.status}`);
    }

    const existingPayos = await this.prisma.payment.findUnique({
      where: { idempotencyKey },
    });

    const frontendBase = (process.env.FRONTEND_URL || 'http://localhost:3000')
      .split(',')[0]
      .trim()
      .replace(/\/+$/, '');

    const orderCode =
      existingPayos?.transactionId && /^\d+$/.test(existingPayos.transactionId)
        ? Number(existingPayos.transactionId)
        : Number(`${Date.now()}${Math.floor(Math.random() * 90 + 10)}`.slice(-12));

    const cleanOrderCodeText = order.orderNumber.replace(/[^a-zA-Z0-9]/g, '');
    const description = `BREWLITE ${cleanOrderCodeText}`.slice(0, 25);

    const linkData = await payos.createPaymentLink({
      orderCode,
      amount: order.finalAmount,
      description,
      returnUrl: `${frontendBase}/?payos=success&orderId=${order.id}`,
      cancelUrl: `${frontendBase}/?payos=cancel&orderId=${order.id}`,
    });

    if (!existingPayos) {
      await this.prisma.payment.create({
        data: {
          orderId: order.id,
          idempotencyKey,
          amount: order.finalAmount,
          method: 'PAYOS_VIETQR',
          status: PaymentStatus.UNPAID,
          transactionId: String(orderCode),
        },
      });
    }

    return {
      orderId: order.id,
      orderCode: linkData.orderCode,
      amount: linkData.amount,
      description: linkData.description,
      bin: linkData.bin,
      accountNumber: linkData.accountNumber,
      accountName: linkData.accountName,
      checkoutUrl: linkData.checkoutUrl,
      qrCode: linkData.qrCode,
    };
  }

  async handlePayosWebhook(payload: Record<string, unknown>): Promise<{ success: boolean }> {
    const payos = this.getRequiredPayosService();
    const rawData = payload.data;
    const signature = typeof payload.signature === 'string' ? payload.signature : '';

    if (!rawData || typeof rawData !== 'object' || Array.isArray(rawData)) {
      return { success: true };
    }

    const dataObj = rawData as Record<string, unknown>;
    const orderCodeVal = dataObj.orderCode;
    if (orderCodeVal === 123 || orderCodeVal === '123') {
      return { success: true };
    }

    if (!payos.verifyWebhookSignature(dataObj, signature)) {
      throw new BadRequestException('Chữ ký Webhook PayOS không hợp lệ');
    }

    if (payload.code !== '00' || payload.success !== true) {
      return { success: true };
    }

    const payment = await this.prisma.payment.findFirst({
      where: {
        transactionId: String(orderCodeVal),
        method: 'PAYOS_VIETQR',
      },
    });

    if (!payment) {
      return { success: true };
    }

    await this.finalizePayosPayment(payment.id);
    return { success: true };
  }

  async syncPayosPayment(requester: SafeUser, orderId: string): Promise<PayosSyncResponse> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        user: { select: { loyaltyPoints: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
    if (requester.role === Role.CUSTOMER && order.userId !== requester.id) {
      throw new ForbiddenException('Bạn không có quyền kiểm tra đơn hàng này');
    }

    if (order.status === OrderStatus.PAID) {
      const paidPayment =
        order.payments.find((p) => p.status === PaymentStatus.PAID) ?? order.payments[0];
      const { user: orderUser, ...orderWithoutUser } = order;
      return {
        paid: true,
        payosStatus: 'PAID',
        paymentResult: paidPayment
          ? {
              success: true,
              idempotentReplay: true,
              message: 'Đơn hàng đã được thanh toán thành công',
              payment: paidPayment,
              order: orderWithoutUser,
              loyaltyPointsEarned: order.userId
                ? this.calculateLoyaltyPoints(order.finalAmount)
                : 0,
              loyaltyPointsBalance: orderUser ? orderUser.loyaltyPoints : null,
            }
          : undefined,
      };
    }

    const payosPayment = order.payments.find(
      (p) => p.method === 'PAYOS_VIETQR' && p.transactionId,
    );
    if (!payosPayment?.transactionId) {
      return { paid: false, payosStatus: 'PENDING' };
    }

    const payos = this.getRequiredPayosService();
    const info = await payos.getPaymentRequestInfo(payosPayment.transactionId);

    if (info.status === 'PAID') {
      const paymentResult = await this.finalizePayosPayment(payosPayment.id);
      return {
        paid: true,
        payosStatus: 'PAID',
        paymentResult,
      };
    }

    return {
      paid: false,
      payosStatus: info.status,
    };
  }
}

