import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { VouchersController } from './vouchers.controller';
import { VouchersService } from './vouchers.service';

describe('VouchersController', () => {
  let controller: VouchersController;
  let service: VouchersService;

  const mockVoucher = {
    id: 'voucher-1',
    code: 'BREWLITEFIRST',
    description: 'Giảm 20% tối đa 30k',
    discountPercent: 20,
    maxDiscount: 30000,
    minOrderAmount: 40000,
    isActive: true,
    validUntil: null,
    createdAt: new Date('2026-11-01T00:00:00.000Z'),
  };

  const mockVouchersService = {
    validateCode: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VouchersController],
      providers: [
        {
          provide: VouchersService,
          useValue: mockVouchersService,
        },
      ],
    }).compile();

    controller = module.get<VouchersController>(VouchersController);
    service = module.get<VouchersService>(VouchersService);
    jest.clearAllMocks();
  });

  it('should validate voucher with optional numeric subtotal', async () => {
    mockVouchersService.validateCode.mockResolvedValue(mockVoucher);

    const result = await controller.validateVoucher('BREWLITEFIRST', '80000');

    expect(service.validateCode).toHaveBeenCalledWith('BREWLITEFIRST', 80000);
    expect(result).toEqual(mockVoucher);
  });

  it('should reject missing code or invalid subtotal query param', async () => {
    await expect(controller.validateVoucher('')).rejects.toThrow(BadRequestException);
    await expect(controller.validateVoucher('BREWLITEFIRST', '-100')).rejects.toThrow(
      BadRequestException,
    );
    await expect(controller.validateVoucher('BREWLITEFIRST', 'abc')).rejects.toThrow(
      BadRequestException,
    );
  });
});
