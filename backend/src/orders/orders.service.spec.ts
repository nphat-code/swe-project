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
import { VouchersService } from '../vouchers/vouchers.service';
import { OrdersService } from './orders.service';

describe('OrdersService (INT-ORD01 / FR-05 / FR-11)', () => {
  let service: OrdersService;
  let prisma: PrismaService;
  let vouchersService: VouchersService;

  const customerUser: SafeUser = {
    id: 'user-customer-1',
    email: 'customer@brewlite.vn',
    fullName: 'Nguyễn Minh Khách',
    phone: '0901234567',
    role: Role.CUSTOMER,
    loyaltyPoints: 25,
    createdAt: new Date('2026-11-01T00:00:00.000Z'),
  };

  const staffUser: SafeUser = {
    ...customerUser,
    id: 'user-staff-1',
    email: 'barista@brewlite.vn',
    role: Role.STAFF,
  };

  const mockProduct = {
    id: 'prod-1',
    name: 'Cà Phê Sữa Đá Sài Gòn',
    slug: 'ca-phe-sua-da-sai-gon',
    description: 'Cà phê phin đậm đà',
    basePrice: 32000,
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5',
    isAvailable: true,
    stock: 10,
    version: 1,
    categoryId: 'cat-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    sizes: [
      { id: 'size-s', name: 'Nhỏ (S)', code: 'S', extraPrice: 0, isDefault: true, productId: 'prod-1' },
      { id: 'size-m', name: 'Vừa (M)', code: 'M', extraPrice: 6000, isDefault: false, productId: 'prod-1' },
    ],
  };

  const mockToppings = [
    {
      id: 'top-1',
      name: 'Trân châu hoàng kim',
      price: 8000,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockPrismaTx = {
    product: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    topping: {
      findMany: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockPrismaService = {
    ...mockPrismaTx,
    $transaction: jest.fn((callback: (tx: typeof mockPrismaTx) => Promise<unknown>) =>
      callback(mockPrismaTx),
    ),
  };

  const mockVouchersService = {
    applyVoucherDiscount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: VouchersService,
          useValue: mockVouchersService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);
    vouchersService = module.get<VouchersService>(VouchersService);
    jest.clearAllMocks();
  });

  it('should calculate prices strictly from DB, apply voucher, and create PENDING order', async () => {
    mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);
    mockPrismaService.topping.findMany.mockResolvedValue(mockToppings);
    mockVouchersService.applyVoucherDiscount.mockResolvedValue({
      voucher: { code: 'BREWLITEFIRST' },
      discountAmount: 18400,
      finalAmount: 73600,
    });
    mockPrismaService.order.create.mockImplementation(async ({ data }) => ({
      id: 'order-1',
      ...data,
      items: data.items.create,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await service.createOrder(customerUser, {
      items: [
        {
          productId: 'prod-1',
          sizeId: 'size-m',
          toppingIds: ['top-1', 'top-1'],
          quantity: 2,
          note: 'Ít đá',
        },
      ],
      voucherCode: 'BREWLITEFIRST',
    });

    expect(vouchersService.applyVoucherDiscount).toHaveBeenCalledWith('BREWLITEFIRST', 92000);
    expect(prisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: customerUser.id,
          customerName: 'Nguyễn Minh Khách',
          customerPhone: '0901234567',
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.UNPAID,
          totalAmount: 92000,
          discountAmount: 18400,
          finalAmount: 73600,
          note: 'Cà Phê Sữa Đá Sài Gòn (Vừa (M)): Ít đá',
        }),
      }),
    );
    expect(result.totalAmount).toBe(92000);
    expect(result.finalAmount).toBe(73600);
    expect(result.items[0].unitPrice).toBe(46000);
  });

  it('should resolve sizeCode or default size and handle products without sizes', async () => {
    const productNoSizes = { ...mockProduct, id: 'prod-nosize', sizes: [] };
    mockPrismaService.product.findMany.mockResolvedValue([mockProduct, productNoSizes]);
    mockPrismaService.order.create.mockImplementation(async ({ data }) => ({
      id: 'order-2',
      ...data,
      items: data.items.create,
    }));

    const result = await service.createOrder(
      { ...customerUser, phone: null },
      {
        items: [
          { productId: 'prod-1', sizeCode: 'm', quantity: 1 },
          { productId: 'prod-nosize', quantity: 1 },
        ],
      },
    );

    expect(result.customerPhone).toBe('0000000000');
    expect(result.totalAmount).toBe(38000 + 32000);
    expect(result.items[0].sizeName).toBe('Vừa (M)');
    expect(result.items[1].sizeName).toBe('Tiêu chuẩn');
  });

  it('should throw NotFoundException when product does not exist', async () => {
    mockPrismaService.product.findMany.mockResolvedValue([]);
    mockPrismaService.topping.findMany.mockResolvedValue([]);

    await expect(
      service.createOrder(customerUser, {
        items: [{ productId: 'missing-prod', quantity: 1 }],
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when product is unavailable or size/topping is invalid', async () => {
    mockPrismaService.product.findMany.mockResolvedValueOnce([
      { ...mockProduct, isAvailable: false },
    ]);
    await expect(
      service.createOrder(customerUser, {
        items: [{ productId: 'prod-1', quantity: 1 }],
      }),
    ).rejects.toThrow(BadRequestException);

    mockPrismaService.product.findMany.mockResolvedValueOnce([mockProduct]);
    await expect(
      service.createOrder(customerUser, {
        items: [{ productId: 'prod-1', sizeId: 'wrong-size', quantity: 1 }],
      }),
    ).rejects.toThrow(BadRequestException);

    mockPrismaService.product.findMany.mockResolvedValueOnce([mockProduct]);
    mockPrismaService.topping.findMany.mockResolvedValueOnce([]);
    await expect(
      service.createOrder(customerUser, {
        items: [{ productId: 'prod-1', toppingIds: ['missing-top'], quantity: 1 }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should aggregate quantities across line items and throw ConflictException when stock is insufficient', async () => {
    mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);

    await expect(
      service.createOrder(customerUser, {
        items: [
          { productId: 'prod-1', sizeCode: 'S', quantity: 6 },
          { productId: 'prod-1', sizeCode: 'M', quantity: 5 },
        ],
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should retry orderNumber collision P2002 cleanly', async () => {
    mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);
    const p2002OrderNumberError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed on orderNumber',
      {
        code: 'P2002',
        clientVersion: '6.19.3',
        meta: { target: ['orderNumber'] },
      },
    );
    mockPrismaService.order.create
      .mockRejectedValueOnce(p2002OrderNumberError)
      .mockResolvedValueOnce({ id: 'order-retry-ok', items: [] });

    const result = await service.createOrder(customerUser, {
      items: [{ productId: 'prod-1', quantity: 1 }],
    });

    expect(prisma.order.create).toHaveBeenCalledTimes(2);
    expect(result.id).toBe('order-retry-ok');
  });

  it('should return user order history in descending order for getMyOrders', async () => {
    const mockOrders = [{ id: 'order-1', userId: customerUser.id, items: [], payments: [] }];
    mockPrismaService.order.findMany.mockResolvedValue(mockOrders);

    const result = await service.getMyOrders(customerUser.id);

    expect(prisma.order.findMany).toHaveBeenCalledWith({
      where: { userId: customerUser.id },
      include: { items: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toEqual(mockOrders);
  });

  it('should enforce ownership check in getOrderById', async () => {
    mockPrismaService.order.findUnique.mockResolvedValueOnce(null);
    await expect(service.getOrderById('missing-order', customerUser)).rejects.toThrow(
      NotFoundException,
    );

    const someoneElsesOrder = {
      id: 'order-99',
      userId: 'other-user-id',
      items: [],
      payments: [],
    };
    mockPrismaService.order.findUnique.mockResolvedValueOnce(someoneElsesOrder);
    await expect(service.getOrderById('order-99', customerUser)).rejects.toThrow(
      ForbiddenException,
    );

    mockPrismaService.order.findUnique.mockResolvedValueOnce(someoneElsesOrder);
    const staffResult = await service.getOrderById('order-99', staffUser);
    expect(staffResult).toEqual(someoneElsesOrder);
  });

  it('should allow staff to advance order through Barista workflow using assertTransition', async () => {
    const paidOrder = {
      id: 'order-paid-1',
      userId: customerUser.id,
      status: OrderStatus.PAID,
      paymentStatus: PaymentStatus.PAID,
      items: [],
      payments: [],
    };
    const preparingOrder = { ...paidOrder, status: OrderStatus.PREPARING };

    mockPrismaService.order.findUnique.mockResolvedValueOnce(paidOrder);
    mockPrismaService.order.updateMany.mockResolvedValueOnce({ count: 1 });
    mockPrismaService.order.findUniqueOrThrow.mockResolvedValueOnce(preparingOrder);

    const result = await service.updateOrderStatus(
      'order-paid-1',
      OrderStatus.PREPARING,
      staffUser,
    );

    expect(mockPrismaService.order.updateMany).toHaveBeenCalledWith({
      where: { id: 'order-paid-1', status: OrderStatus.PAID },
      data: { status: OrderStatus.PREPARING },
    });
    expect(result.status).toBe(OrderStatus.PREPARING);
  });

  it('should sync paymentStatus when transitioning PENDING <-> PAYMENT_FAILED or to PAID', async () => {
    const failedOrder = {
      id: 'order-fail-1',
      userId: customerUser.id,
      status: OrderStatus.PAYMENT_FAILED,
      paymentStatus: PaymentStatus.FAILED,
      items: [],
      payments: [],
    };
    const retriedOrder = {
      ...failedOrder,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
    };

    mockPrismaService.order.findUnique.mockResolvedValueOnce(failedOrder);
    mockPrismaService.order.updateMany.mockResolvedValueOnce({ count: 1 });
    mockPrismaService.order.findUniqueOrThrow.mockResolvedValueOnce(retriedOrder);

    const result = await service.updateOrderStatus(
      'order-fail-1',
      OrderStatus.PENDING,
      customerUser,
    );

    expect(mockPrismaService.order.updateMany).toHaveBeenCalledWith({
      where: { id: 'order-fail-1', status: OrderStatus.PAYMENT_FAILED },
      data: {
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,
      },
    });
    expect(result.paymentStatus).toBe(PaymentStatus.UNPAID);
  });

  it('should reject invalid state transitions and enforce customer RBAC restrictions', async () => {
    mockPrismaService.order.findUnique.mockResolvedValueOnce(null);
    await expect(
      service.updateOrderStatus('missing-order', OrderStatus.CANCELLED, customerUser),
    ).rejects.toThrow(NotFoundException);

    mockPrismaService.order.findUnique.mockResolvedValueOnce({
      id: 'order-other',
      userId: 'other-user-id',
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
      items: [],
      payments: [],
    });
    await expect(
      service.updateOrderStatus('order-other', OrderStatus.CANCELLED, customerUser),
    ).rejects.toThrow(ForbiddenException);

    mockPrismaService.order.findUnique.mockResolvedValueOnce({
      id: 'order-own-pending',
      userId: customerUser.id,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
      items: [],
      payments: [],
    });
    await expect(
      service.updateOrderStatus('order-own-pending', OrderStatus.PAID, customerUser),
    ).rejects.toThrow(ForbiddenException);

    mockPrismaService.order.findUnique.mockResolvedValueOnce({
      id: 'order-own-preparing',
      userId: customerUser.id,
      status: OrderStatus.PREPARING,
      paymentStatus: PaymentStatus.PAID,
      items: [],
      payments: [],
    });
    await expect(
      service.updateOrderStatus('order-own-preparing', OrderStatus.CANCELLED, customerUser),
    ).rejects.toThrow(BadRequestException);

    mockPrismaService.order.findUnique.mockResolvedValueOnce({
      id: 'order-completed',
      userId: customerUser.id,
      status: OrderStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
      items: [],
      payments: [],
    });
    await expect(
      service.updateOrderStatus('order-completed', OrderStatus.PAID, staffUser),
    ).rejects.toThrow(BadRequestException);
  });

  it('should restore aggregated product stock when cancelling a confirmed PAID order', async () => {
    const paidOrderWithItems = {
      id: 'order-paid-cancel',
      userId: customerUser.id,
      status: OrderStatus.PAID,
      paymentStatus: PaymentStatus.PAID,
      items: [
        { productId: 'prod-1', quantity: 2 },
        { productId: 'prod-1', quantity: 1 },
        { productId: 'prod-2', quantity: 3 },
      ],
      payments: [{ id: 'pay-1', status: PaymentStatus.PAID }],
    };

    mockPrismaService.order.findUnique.mockResolvedValueOnce(paidOrderWithItems);
    mockPrismaService.product.update.mockResolvedValue({});
    mockPrismaService.order.updateMany.mockResolvedValueOnce({ count: 1 });
    mockPrismaService.order.findUniqueOrThrow.mockResolvedValueOnce({
      ...paidOrderWithItems,
      status: OrderStatus.CANCELLED,
    });

    const result = await service.updateOrderStatus(
      'order-paid-cancel',
      OrderStatus.CANCELLED,
      customerUser,
    );

    expect(mockPrismaService.product.update).toHaveBeenCalledTimes(2);
    expect(mockPrismaService.product.update).toHaveBeenCalledWith({
      where: { id: 'prod-1' },
      data: { stock: { increment: 3 }, version: { increment: 1 } },
    });
    expect(mockPrismaService.product.update).toHaveBeenCalledWith({
      where: { id: 'prod-2' },
      data: { stock: { increment: 3 }, version: { increment: 1 } },
    });
    expect(result.status).toBe(OrderStatus.CANCELLED);
  });

  it('should throw ConflictException on concurrent order status mutation race', async () => {
    mockPrismaService.order.findUnique.mockResolvedValueOnce({
      id: 'order-race',
      userId: customerUser.id,
      status: OrderStatus.PAID,
      paymentStatus: PaymentStatus.PAID,
      items: [],
      payments: [],
    });
    mockPrismaService.order.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(
      service.updateOrderStatus('order-race', OrderStatus.PREPARING, staffUser),
    ).rejects.toThrow(ConflictException);
  });
});
