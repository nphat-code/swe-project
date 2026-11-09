import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { VouchersService } from './vouchers.service';

describe('VouchersService', () => {
  let service: VouchersService;
  let prisma: PrismaService;

  const activeVoucher = {
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

  const mockPrismaService = {
    voucher: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VouchersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<VouchersService>(VouchersService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should normalize code and return active voucher when valid', async () => {
    mockPrismaService.voucher.findUnique.mockResolvedValue(activeVoucher);

    const result = await service.validateCode('  brewlitefirst ', 60000);

    expect(prisma.voucher.findUnique).toHaveBeenCalledWith({
      where: { code: 'BREWLITEFIRST' },
    });
    expect(result).toEqual(activeVoucher);
  });

  it('should throw BadRequestException when code is blank', async () => {
    await expect(service.validateCode('   ')).rejects.toThrow(BadRequestException);
    expect(prisma.voucher.findUnique).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when voucher does not exist', async () => {
    mockPrismaService.voucher.findUnique.mockResolvedValue(null);

    await expect(service.validateCode('UNKNOWN')).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when voucher is inactive or expired or below minOrderAmount', async () => {
    mockPrismaService.voucher.findUnique.mockResolvedValueOnce({
      ...activeVoucher,
      isActive: false,
    });
    await expect(service.validateCode('BREWLITEFIRST')).rejects.toThrow(BadRequestException);

    mockPrismaService.voucher.findUnique.mockResolvedValueOnce({
      ...activeVoucher,
      validUntil: new Date('2020-01-01T00:00:00.000Z'),
    });
    await expect(service.validateCode('BREWLITEFIRST')).rejects.toThrow(BadRequestException);

    mockPrismaService.voucher.findUnique.mockResolvedValueOnce(activeVoucher);
    await expect(service.validateCode('BREWLITEFIRST', 30000)).rejects.toThrow(BadRequestException);
  });

  it('should compute percentage discount capped by maxDiscount', async () => {
    mockPrismaService.voucher.findUnique.mockResolvedValue(activeVoucher);

    const smallOrderResult = await service.applyVoucherDiscount('BREWLITEFIRST', 50000);
    expect(smallOrderResult.discountAmount).toBe(10000);
    expect(smallOrderResult.finalAmount).toBe(40000);

    const largeOrderResult = await service.applyVoucherDiscount('BREWLITEFIRST', 200000);
    expect(largeOrderResult.discountAmount).toBe(30000);
    expect(largeOrderResult.finalAmount).toBe(170000);
  });
});
