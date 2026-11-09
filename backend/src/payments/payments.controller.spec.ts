import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus, PaymentStatus, Role } from '@prisma/client';
import { SafeUser } from '../auth/types/auth.types';
import { PaymentsController } from './payments.controller';
import { PaymentsService, ProcessPaymentResult } from './payments.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  const mockUser: SafeUser = {
    id: 'user-1',
    email: 'customer@brewlite.vn',
    fullName: 'Nguyễn Minh Khách',
    phone: '0901234567',
    role: Role.CUSTOMER,
    loyaltyPoints: 25,
    createdAt: new Date('2026-11-01T00:00:00.000Z'),
  };

  const mockResult: ProcessPaymentResult = {
    success: true,
    idempotentReplay: false,
    message: 'Thanh toán thành công, đơn hàng đã chuyển sang trạng thái PAID',
    payment: {
      id: 'pay-1',
      orderId: 'order-1',
      idempotencyKey: 'idem-1',
      amount: 65600,
      method: 'WALLET',
      status: PaymentStatus.PAID,
      transactionId: 'TXN-1',
      paidAt: new Date(),
      createdAt: new Date(),
    },
    order: {
      id: 'order-1',
      orderNumber: '#104200',
      userId: 'user-1',
      customerName: 'Nguyễn Minh Khách',
      customerPhone: '0901234567',
      note: null,
      status: OrderStatus.PAID,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: 'WALLET',
      totalAmount: 82000,
      discountAmount: 16400,
      finalAmount: 65600,
      idempotencyKey: 'idem-1',
      items: [],
      payments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    loyaltyPointsEarned: 6,
    loyaltyPointsBalance: 31,
  };

  const mockPaymentsService = {
    processPayment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    service = module.get<PaymentsService>(PaymentsService);
    jest.clearAllMocks();
  });

  it('should forward requester, dto, and Idempotency-Key header to PaymentsService', async () => {
    mockPaymentsService.processPayment.mockResolvedValue(mockResult);
    const dto = { orderId: 'order-1', method: 'WALLET' };

    const result = await controller.processPayment({ user: mockUser }, dto, 'header-idem-key');

    expect(service.processPayment).toHaveBeenCalledWith(mockUser, dto, 'header-idem-key');
    expect(result).toEqual(mockResult);
  });
});

