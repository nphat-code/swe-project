import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/types/auth.types';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService, ProcessPaymentResult } from './payments.service';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xử lý thanh toán không tiền mặt idempotent kèm khóa lạc quan tồn kho và tích điểm Loyalty',
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description: 'Khóa idempotency duy nhất cho mỗi lần thanh toán (ưu tiên hơn body)',
  })
  async processPayment(
    @Request() req: AuthenticatedRequest,
    @Body() createPaymentDto: CreatePaymentDto,
    @Headers('idempotency-key') headerIdempotencyKey?: string,
  ): Promise<ProcessPaymentResult> {
    return this.paymentsService.processPayment(req.user, createPaymentDto, headerIdempotencyKey);
  }
}

