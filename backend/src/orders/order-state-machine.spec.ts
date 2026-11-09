import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { assertTransition, getAllowedTransitions } from './order-state-machine';

describe('Order State Machine', () => {
  it('should allow valid state transitions according to specification', () => {
    expect(() => assertTransition(OrderStatus.PENDING, OrderStatus.PAID)).not.toThrow();
    expect(() =>
      assertTransition(OrderStatus.PENDING, OrderStatus.PAYMENT_FAILED),
    ).not.toThrow();
    expect(() => assertTransition(OrderStatus.PENDING, OrderStatus.CANCELLED)).not.toThrow();
    expect(() =>
      assertTransition(OrderStatus.PAYMENT_FAILED, OrderStatus.PENDING),
    ).not.toThrow();
    expect(() =>
      assertTransition(OrderStatus.PAYMENT_FAILED, OrderStatus.CANCELLED),
    ).not.toThrow();
    expect(() => assertTransition(OrderStatus.PAID, OrderStatus.PREPARING)).not.toThrow();
    expect(() => assertTransition(OrderStatus.PAID, OrderStatus.CANCELLED)).not.toThrow();
    expect(() => assertTransition(OrderStatus.PREPARING, OrderStatus.READY)).not.toThrow();
    expect(() => assertTransition(OrderStatus.READY, OrderStatus.COMPLETED)).not.toThrow();
  });

  it('should reject invalid state transitions and transitions out of terminal states', () => {
    expect(() => assertTransition(OrderStatus.PENDING, OrderStatus.COMPLETED)).toThrow(
      BadRequestException,
    );
    expect(() => assertTransition(OrderStatus.PENDING, OrderStatus.PREPARING)).toThrow(
      BadRequestException,
    );
    expect(() => assertTransition(OrderStatus.COMPLETED, OrderStatus.PAID)).toThrow(
      BadRequestException,
    );
    expect(() => assertTransition(OrderStatus.CANCELLED, OrderStatus.PAID)).toThrow(
      BadRequestException,
    );
    expect(() => assertTransition(OrderStatus.PREPARING, OrderStatus.CANCELLED)).toThrow(
      BadRequestException,
    );
    expect(getAllowedTransitions(OrderStatus.COMPLETED)).toEqual([]);
    expect(getAllowedTransitions(OrderStatus.CANCELLED)).toEqual([]);
  });
});
