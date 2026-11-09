import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Voucher } from '@prisma/client';
import { VouchersService } from './vouchers.service';

@ApiTags('vouchers')
@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Get('validate')
  @ApiOperation({ summary: 'Kiểm tra tính hợp lệ của mã giảm giá' })
  @ApiQuery({ name: 'code', required: true, description: 'Mã voucher (vd: BREWLITEFIRST)' })
  @ApiQuery({ name: 'subtotal', required: false, description: 'Tổng tiền tạm tính để kiểm tra ngưỡng tối thiểu' })
  async validateVoucher(
    @Query('code') code?: string,
    @Query('subtotal') subtotalRaw?: string,
  ): Promise<Voucher> {
    if (!code || !code.trim()) {
      throw new BadRequestException('Vui lòng nhập mã giảm giá');
    }

    let parsedSubtotal: number | undefined;
    if (subtotalRaw !== undefined && subtotalRaw !== '') {
      const numeric = Number(subtotalRaw);
      if (!Number.isFinite(numeric) || numeric < 0) {
        throw new BadRequestException('Giá trị tạm tính không hợp lệ');
      }
      parsedSubtotal = numeric;
    }

    return this.vouchersService.validateCode(code, parsedSubtotal);
  }
}
