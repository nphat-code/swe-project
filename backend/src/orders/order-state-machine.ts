import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

const ORDER_STATUS_TRANSITIONS: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.PAYMENT_FAILED, OrderStatus.CANCELLED],
  [OrderStatus.PAYMENT_FAILED]: [OrderStatus.PENDING, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.READY],
  [OrderStatus.READY]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
};

export function getAllowedTransitions(status: OrderStatus): readonly OrderStatus[] {
  return ORDER_STATUS_TRANSITIONS[status];
}

export function canTransition(currentStatus: OrderStatus, targetStatus: OrderStatus): boolean {
  const allowedTargets = ORDER_STATUS_TRANSITIONS[currentStatus];
  return Boolean(allowedTargets && allowedTargets.includes(targetStatus));
}

export function assertTransition(currentStatus: OrderStatus, targetStatus: OrderStatus): void {
  if (!canTransition(currentStatus, targetStatus)) {
    throw new BadRequestException(
      `Không thể chuyển trạng thái đơn hàng từ ${currentStatus} sang ${targetStatus}`,
    );
  }
}
