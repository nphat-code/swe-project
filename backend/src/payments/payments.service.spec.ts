import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus, PaymentStatus, Prisma, Role } from '@prisma/client';
import { SafeUser } from '../auth/types/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from './payments.service';

describe('PaymentsService (Task 8 & Task 10.2/10.3/10.4)', () => {
  let service: PaymentsService;

  const customerUser: SafeUser = {
    id: 'user-customer-1',
    email: 'customer@brewlite.vn',
    fullName: 'Nguyễn Minh Khách',
    phone: '0901234567',
    role: Role.CUSTOMER,
    loyaltyPoints: 25,
    createdAt: new Date('2026-11-01T00:00:00.000Z'),
  };

  const baseOrder = {
    id: 'order-1',
    orderNumber: '#104200',
    userId: 'user-customer-1',
    customerName: 'Nguyễn Minh Khách',
    customerPhone: '0901234567',
    note: null,
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.UNPAID,
    paymentMethod: 'MOCK_WALLET',
    totalAmount: 92000,
    discountAmount: 18400,
    finalAmount: 73600,
    idempotencyKey: null,
    items: [
      { id: 'item-1', orderId: 'order-1', productId: 'prod-2', quantity: 1 },
      { id: 'item-2', orderId: 'order-1', productId: 'prod-1', quantity: 2 },
      { id: 'item-3', orderId: 'order-1', productId: 'prod-1', quantity: 1 },
    ],
    payments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const product1 = {
    id: 'prod-1',
    name: 'Cà Phê Sữa Đá Sài Gòn',
    isAvailable: true,
    stock: 20,
    version: 3,
  };

  const product2 = {
    id: 'prod-2',
    name: 'Trà Đào Cam Sả Tươi',
    isAvailable: true,
    stock: 15,
    version: 2,
  };

  const mockPrismaTx = {
    order: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    payment: {
      create: jest.fn(),
    },
    user: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockPrismaService = {
    ...mockPrismaTx,
    payment: {
      ...mockPrismaTx.payment,
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((callback: (tx: typeof mockPrismaTx) => Promise<unknown>) =>
      callback(mockPrismaTx),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    jest.clearAllMocks();
  });

  it('should require an Idempotency-Key in either header or body', async () => {
    await expect(
      service.processPayment(customerUser, { orderId: 'order-1', method: 'WALLET' }, '   '),
    ).rejects.toThrow(BadRequestException);
  });

  it('should return cached result idempotently without charging or touching stock again', async () => {
    const cachedPayment = {
      id: 'pay-cached-1',
      orderId: 'order-1',
      idempotencyKey: 'idem-same-key',
      amount: 73600,
      method: 'WALLET',
      status: PaymentStatus.PAID,
      transactionId: 'TXN-CACHED',
      paidAt: new Date(),
      createdAt: new Date(),
      order: {
        ...baseOrder,
        status: OrderStatus.PAID,
        paymentStatus: PaymentStatus.PAID,
        user: { loyaltyPoints: 32 },
      },
    };
    mockPrismaService.payment.findUnique.mockResolvedValueOnce(cachedPayment);

    const result = await service.processPayment(
      customerUser,
      { orderId: 'order-1', method: 'WALLET', idempotencyKey: 'body-ignored' },
      'idem-same-key',
    );

    expect(mockPrismaService.payment.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { idempotencyKey: 'idem-same-key' },
      }),
    );
    expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    expect(result.idempotentReplay).toBe(true);
    expect(result.success).toBe(true);
    expect(result.loyaltyPointsEarned).toBe(7);
    expect(result.loyaltyPointsBalance).toBe(32);
    expect(result.payment.id).toBe('pay-cached-1');
  });

  it('should reject cross-user or mismatched-order idempotency key collisions', async () => {
    mockPrismaService.payment.findUnique.mockResolvedValueOnce({
      id: 'pay-other',
      orderId: 'order-other',
      status: PaymentStatus.PAID,
      order: {
        ...baseOrder,
        id: 'order-other',
        userId: 'another-customer',
        user: { loyaltyPoints: 10 },
      },
    });

    await expect(
      service.processPayment(customerUser, { orderId: 'order-other' }, 'shared-key'),
    ).rejects.toThrow(ConflictException);

    mockPrismaService.payment.findUnique.mockResolvedValueOnce({
      id: 'pay-own-diff-order',
      orderId: 'order-A',
      status: PaymentStatus.PAID,
      order: {
        ...baseOrder,
        id: 'order-A',
        userId: customerUser.id,
        user: { loyaltyPoints: 10 },
      },
    });

    await expect(
      service.processPayment(customerUser, { orderId: 'order-B' }, 'key-of-order-A'),
    ).rejects.toThrow(ConflictException);
  });

  it('should process valid payment with aggregated optimistic stock locking and award loyalty points', async () => {
    mockPrismaService.payment.findUnique.mockResolvedValueOnce(null);
    mockPrismaTx.order.findUnique.mockResolvedValueOnce(baseOrder);
    mockPrismaTx.product.findMany.mockResolvedValueOnce([product1, product2]);
    mockPrismaTx.product.updateMany.mockResolvedValue({ count: 1 });
    mockPrismaTx.order.updateMany.mockResolvedValueOnce({ count: 1 });
    const createdPayment = {
      id: 'pay-new-1',
      orderId: 'order-1',
      idempotencyKey: 'idem-new-1',
      amount: 73600,
      method: 'CARD',
      status: PaymentStatus.PAID,
      transactionId: 'TXN-NEW',
      paidAt: new Date(),
      createdAt: new Date(),
    };
    mockPrismaTx.payment.create.mockResolvedValueOnce(createdPayment);
    mockPrismaTx.user.update.mockResolvedValueOnce({ loyaltyPoints: 32 });
    const updatedOrder = {
      ...baseOrder,
      status: OrderStatus.PAID,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: 'CARD',
      payments: [createdPayment],
    };
    mockPrismaTx.order.findUniqueOrThrow.mockResolvedValueOnce(updatedOrder);

    const result = await service.processPayment(
      customerUser,
      { orderId: 'order-1', method: 'CARD', idempotencyKey: 'body-fallback' },
      'idem-new-1',
    );

    expect(mockPrismaTx.product.updateMany).toHaveBeenNthCalledWith(1, {
      where: {
        id: 'prod-1',
        isAvailable: true,
        version: 3,
        stock: { gte: 3 },
      },
      data: {
        stock: { decrement: 3 },
        version: { increment: 1 },
      },
    });
    expect(mockPrismaTx.product.updateMany).toHaveBeenNthCalledWith(2, {
      where: {
        id: 'prod-2',
        isAvailable: true,
        version: 2,
        stock: { gte: 1 },
      },
      data: {
        stock: { decrement: 1 },
        version: { increment: 1 },
      },
    });
    expect(mockPrismaTx.user.update).toHaveBeenCalledWith({
      where: { id: 'user-customer-1' },
      data: { loyaltyPoints: { increment: 7 } },
      select: { loyaltyPoints: true },
    });
    expect(result.success).toBe(true);
    expect(result.idempotentReplay).toBe(false);
    expect(result.loyaltyPointsEarned).toBe(7);
    expect(result.loyaltyPointsBalance).toBe(32);
    expect(result.order.status).toBe(OrderStatus.PAID);
  });

  it('should record PAYMENT_FAILED without decrementing stock or awarding points when simulateFailure is true', async () => {
    mockPrismaService.payment.findUnique.mockResolvedValueOnce(null);
    mockPrismaTx.order.findUnique.mockResolvedValueOnce(baseOrder);
    mockPrismaTx.order.updateMany.mockResolvedValueOnce({ count: 1 });
    const failedPayment = {
      id: 'pay-fail-1',
      orderId: 'order-1',
      idempotencyKey: 'idem-fail-1',
      amount: 73600,
      method: 'WALLET',
      status: PaymentStatus.FAILED,
      transactionId: null,
      paidAt: null,
      createdAt: new Date(),
    };
    mockPrismaTx.payment.create.mockResolvedValueOnce(failedPayment);
    mockPrismaTx.user.findUnique.mockResolvedValueOnce({ loyaltyPoints: 25 });
    mockPrismaTx.order.findUniqueOrThrow.mockResolvedValueOnce({
      ...baseOrder,
      status: OrderStatus.PAYMENT_FAILED,
      paymentStatus: PaymentStatus.FAILED,
      payments: [failedPayment],
    });

    const result = await service.processPayment(
      customerUser,
      { orderId: 'order-1', method: 'WALLET', simulateFailure: true },
      'idem-fail-1',
    );

    expect(mockPrismaTx.product.updateMany).not.toHaveBeenCalled();
    expect(mockPrismaTx.user.update).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.loyaltyPointsEarned).toBe(0);
    expect(result.loyaltyPointsBalance).toBe(25);
    expect(result.order.status).toBe(OrderStatus.PAYMENT_FAILED);
  });

  it('should allow retrying payment cleanly on a PAYMENT_FAILED order', async () => {
    const failedOrder = {
      ...baseOrder,
      status: OrderStatus.PAYMENT_FAILED,
      paymentStatus: PaymentStatus.FAILED,
      finalAmount: 8000,
    };
    mockPrismaService.payment.findUnique.mockResolvedValueOnce(null);
    mockPrismaTx.order.findUnique.mockResolvedValueOnce(failedOrder);
    mockPrismaTx.product.findMany.mockResolvedValueOnce([product1, product2]);
    mockPrismaTx.product.updateMany.mockResolvedValue({ count: 1 });
    mockPrismaTx.order.updateMany.mockResolvedValueOnce({ count: 1 });
    mockPrismaTx.payment.create.mockResolvedValueOnce({
      id: 'pay-retry-ok',
      status: PaymentStatus.PAID,
    });
    mockPrismaTx.user.findUnique.mockResolvedValueOnce({ loyaltyPoints: 25 });
    mockPrismaTx.order.findUniqueOrThrow.mockResolvedValueOnce({
      ...failedOrder,
      status: OrderStatus.PAID,
      paymentStatus: PaymentStatus.PAID,
    });

    const result = await service.processPayment(
      customerUser,
      { orderId: 'order-1', idempotencyKey: 'retry-key-2' },
    );

    expect(mockPrismaTx.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order-1', status: OrderStatus.PAYMENT_FAILED },
      }),
    );
    expect(mockPrismaTx.user.update).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.loyaltyPointsEarned).toBe(0);
  });

  it('should throw ConflictException when stock is insufficient or optimistic version mismatches', async () => {
    mockPrismaService.payment.findUnique.mockResolvedValueOnce(null);
    mockPrismaTx.order.findUnique.mockResolvedValueOnce(baseOrder);
    mockPrismaTx.product.findMany.mockResolvedValueOnce([
      { ...product1, stock: 2 },
      product2,
    ]);

    await expect(
      service.processPayment(customerUser, { orderId: 'order-1' }, 'idem-low-stock'),
    ).rejects.toThrow(ConflictException);

    mockPrismaService.payment.findUnique.mockResolvedValueOnce(null);
    mockPrismaTx.order.findUnique.mockResolvedValueOnce(baseOrder);
    mockPrismaTx.product.findMany.mockResolvedValueOnce([product1, product2]);
    mockPrismaTx.product.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(
      service.processPayment(customerUser, { orderId: 'order-1' }, 'idem-version-conflict'),
    ).rejects.toThrow(ConflictException);
  });

  it('should validate order existence, ownership, availability, and State Machine guards', async () => {
    mockPrismaService.payment.findUnique.mockResolvedValueOnce(null);
    mockPrismaTx.order.findUnique.mockResolvedValueOnce(null);
    await expect(
      service.processPayment(customerUser, { orderId: 'missing' }, 'key-1'),
    ).rejects.toThrow(NotFoundException);

    mockPrismaService.payment.findUnique.mockResolvedValueOnce(null);
    mockPrismaTx.order.findUnique.mockResolvedValueOnce({
      ...baseOrder,
      userId: 'other-user',
    });
    await expect(
      service.processPayment(customerUser, { orderId: 'order-1' }, 'key-2'),
    ).rejects.toThrow(ForbiddenException);

    mockPrismaService.payment.findUnique.mockResolvedValueOnce(null);
    mockPrismaTx.order.findUnique.mockResolvedValueOnce({
      ...baseOrder,
      status: OrderStatus.PAID,
    });
    await expect(
      service.processPayment(customerUser, { orderId: 'order-1' }, 'key-3'),
    ).rejects.toThrow(BadRequestException);

    mockPrismaService.payment.findUnique.mockResolvedValueOnce(null);
    mockPrismaTx.order.findUnique.mockResolvedValueOnce(baseOrder);
    mockPrismaTx.product.findMany.mockResolvedValueOnce([
      { ...product1, isAvailable: false },
      product2,
    ]);
    await expect(
      service.processPayment(customerUser, { orderId: 'order-1' }, 'key-4'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should recover idempotently if parallel request commits first with P2002 on idempotencyKey', async () => {
    const p2002IdempotencyError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed on idempotencyKey',
      {
        code: 'P2002',
        clientVersion: '6.19.3',
        meta: { target: ['idempotencyKey'] },
      },
    );
    const winningPayment = {
      id: 'pay-winner',
      orderId: 'order-1',
      idempotencyKey: 'race-idem-key',
      amount: 73600,
      method: 'WALLET',
      status: PaymentStatus.PAID,
      transactionId: 'TXN-WINNER',
      paidAt: new Date(),
      createdAt: new Date(),
      order: {
        ...baseOrder,
        status: OrderStatus.PAID,
        paymentStatus: PaymentStatus.PAID,
        user: { loyaltyPoints: 32 },
      },
    };

    mockPrismaService.payment.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(winningPayment);
    mockPrismaService.$transaction.mockRejectedValueOnce(p2002IdempotencyError);

    const result = await service.processPayment(
      customerUser,
      { orderId: 'order-1', method: 'WALLET' },
      'race-idem-key',
    );

    expect(result.idempotentReplay).toBe(true);
    expect(result.payment.id).toBe('pay-winner');
    expect(result.loyaltyPointsEarned).toBe(7);
  });

  it('should also recover idempotently when parallel request hits ConflictException while winning same-key tx commits', async () => {
    const winningPayment = {
      id: 'pay-winner-conflict',
      orderId: 'order-1',
      idempotencyKey: 'race-conflict-key',
      amount: 73600,
      method: 'WALLET',
      status: PaymentStatus.PAID,
      transactionId: 'TXN-WINNER-2',
      paidAt: new Date(),
      createdAt: new Date(),
      order: {
        ...baseOrder,
        status: OrderStatus.PAID,
        paymentStatus: PaymentStatus.PAID,
        user: { loyaltyPoints: 32 },
      },
    };

    mockPrismaService.payment.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(winningPayment);
    mockPrismaTx.order.findUnique.mockResolvedValueOnce(baseOrder);
    mockPrismaTx.product.findMany.mockResolvedValueOnce([product1, product2]);
    mockPrismaTx.product.updateMany.mockResolvedValueOnce({ count: 0 });

    const result = await service.processPayment(
      customerUser,
      { orderId: 'order-1', method: 'WALLET' },
      'race-conflict-key',
    );

    expect(result.idempotentReplay).toBe(true);
    expect(result.payment.id).toBe('pay-winner-conflict');
  });
});

