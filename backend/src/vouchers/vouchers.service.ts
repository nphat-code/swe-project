import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Voucher } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface VoucherDiscountResult {
  voucher: Voucher;
  discountAmount: number;
  finalAmount: number;
}

@Injectable()
export class VouchersService {
  constructor(private readonly prisma: PrismaService) {}

  async validateCode(rawCode: string, subtotal?: number): Promise<Voucher> {
    const normalizedCode = rawCode.trim().toUpperCase();
    if (!normalizedCode) {
      throw new BadRequestException('Vui lòng nhập mã giảm giá');
    }

    const voucher = await this.prisma.voucher.findUnique({
      where: { code: normalizedCode },
    });

    if (!voucher) {
      throw new NotFoundException('Mã giảm giá không tồn tại');
    }

    if (!voucher.isActive) {
      throw new BadRequestException('Mã giảm giá hiện đang tạm ngưng');
    }

    if (voucher.validUntil && voucher.validUntil.getTime() < Date.now()) {
      throw new BadRequestException('Mã giảm giá đã hết hạn sử dụng');
    }

    if (typeof subtotal === 'number' && subtotal < voucher.minOrderAmount) {
      throw new BadRequestException(
        `Đơn hàng tối thiểu ${voucher.minOrderAmount}đ để áp dụng mã ${voucher.code}`,
      );
    }

    return voucher;
  }

  async applyVoucherDiscount(rawCode: string, subtotal: number): Promise<VoucherDiscountResult> {
    const voucher = await this.validateCode(rawCode, subtotal);
    const rawDiscount = Math.floor((subtotal * voucher.discountPercent) / 100);
    const discountAmount = Math.min(rawDiscount, voucher.maxDiscount, subtotal);
    const finalAmount = Math.max(0, subtotal - discountAmount);

    return {
      voucher,
      discountAmount,
      finalAmount,
    };
  }
}
