import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/types/auth.types';
import { CreatePaymentDto } from './dto/create-payment.dto';
import {
  PayosCheckoutResponse,
  PayosSyncResponse,
  PaymentsService,
  ProcessPaymentResult,
} from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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

  @Post('payos')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Khởi tạo liên kết và mã VietQR thanh toán thật qua cổng PayOS',
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description: 'Khóa idempotency duy nhất cho mỗi phiên tạo mã VietQR',
  })
  async createPayosPayment(
    @Request() req: AuthenticatedRequest,
    @Body() createPaymentDto: CreatePaymentDto,
    @Headers('idempotency-key') headerIdempotencyKey?: string,
  ): Promise<PayosCheckoutResponse> {
    return this.paymentsService.createPayosPayment(
      req.user,
      createPaymentDto,
      headerIdempotencyKey,
    );
  }

  @Get('payos/sync/:orderId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Đồng bộ và xác nhận trạng thái thanh toán PayOS VietQR của đơn hàng',
  })
  async syncPayosPayment(
    @Request() req: AuthenticatedRequest,
    @Param('orderId') orderId: string,
  ): Promise<PayosSyncResponse> {
    return this.paymentsService.syncPayosPayment(req.user, orderId);
  }

  @Post('payos-webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Webhook nhận thông báo giao dịch VietQR từ máy chủ PayOS',
  })
  async handlePayosWebhook(
    @Body() payload: Record<string, unknown>,
  ): Promise<{ success: boolean }> {
    return this.paymentsService.handlePayosWebhook(payload);
  }
}

