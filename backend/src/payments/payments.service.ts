import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Payment, PaymentStatus, Prisma, Product, Role } from '@prisma/client';
import { SafeUser } from '../auth/types/auth.types';
import { assertTransition } from '../orders/order-state-machine';
import { OrderWithDetails } from '../orders/orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

export interface ProcessPaymentResult {
  success: boolean;
  idempotentReplay: boolean;
  message: string;
  payment: Payment;
  order: OrderWithDetails;
  loyaltyPointsEarned: number;
  loyaltyPointsBalance: number | null;
}

type PaymentWithOrderDetails = Payment & {
  order: OrderWithDetails & {
    user: { loyaltyPoints: number } | null;
  };
};

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

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
}

