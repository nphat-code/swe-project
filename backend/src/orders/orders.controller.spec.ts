import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus, PaymentStatus, Role } from '@prisma/client';
import { SafeUser } from '../auth/types/auth.types';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockUser: SafeUser = {
    id: 'user-1',
    email: 'customer@brewlite.vn',
    fullName: 'Nguyễn Minh Khách',
    phone: '0901234567',
    role: Role.CUSTOMER,
    loyaltyPoints: 25,
    createdAt: new Date('2026-11-01T00:00:00.000Z'),
  };

  const mockOrder = {
    id: 'order-1',
    orderNumber: '#104200',
    userId: 'user-1',
    customerName: 'Nguyễn Minh Khách',
    customerPhone: '0901234567',
    note: null,
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.UNPAID,
    paymentMethod: 'MOCK_WALLET',
    totalAmount: 38000,
    discountAmount: 0,
    finalAmount: 38000,
    idempotencyKey: null,
    items: [],
    payments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrdersService = {
    createOrder: jest.fn(),
    getMyOrders: jest.fn(),
    getOrderById: jest.fn(),
    updateOrderStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  it('should call createOrder with authenticated user and payload', async () => {
    mockOrdersService.createOrder.mockResolvedValue(mockOrder);
    const dto = { items: [{ productId: 'prod-1', quantity: 1 }] };

    const result = await controller.createOrder({ user: mockUser }, dto);

    expect(service.createOrder).toHaveBeenCalledWith(mockUser, dto);
    expect(result).toEqual(mockOrder);
  });

  it('should call getMyOrders with authenticated user id', async () => {
    mockOrdersService.getMyOrders.mockResolvedValue([mockOrder]);

    const result = await controller.getMyOrders({ user: mockUser });

    expect(service.getMyOrders).toHaveBeenCalledWith('user-1');
    expect(result).toEqual([mockOrder]);
  });

  it('should call getOrderById with order id and authenticated user', async () => {
    mockOrdersService.getOrderById.mockResolvedValue(mockOrder);

    const result = await controller.getOrderById('order-1', { user: mockUser });

    expect(service.getOrderById).toHaveBeenCalledWith('order-1', mockUser);
    expect(result).toEqual(mockOrder);
  });

  it('should call updateOrderStatus with order id, target status, and authenticated user', async () => {
    const updatedOrder = { ...mockOrder, status: OrderStatus.CANCELLED };
    mockOrdersService.updateOrderStatus.mockResolvedValue(updatedOrder);

    const result = await controller.updateOrderStatus(
      'order-1',
      { status: OrderStatus.CANCELLED },
      { user: mockUser },
    );

    expect(service.updateOrderStatus).toHaveBeenCalledWith(
      'order-1',
      OrderStatus.CANCELLED,
      mockUser,
    );
    expect(result).toEqual(updatedOrder);
  });
});
