import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Order, OrderItem } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/types/auth.types';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderWithDetails, OrdersService } from './orders.service';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Khởi tạo đơn hàng mới (tính giá server-side, áp voucher, trạng thái PENDING)' })
  async createOrder(
    @Request() req: AuthenticatedRequest,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<Order & { items: OrderItem[] }> {
    return this.ordersService.createOrder(req.user, createOrderDto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Lấy danh sách lịch sử đơn hàng của người dùng đang đăng nhập' })
  async getMyOrders(@Request() req: AuthenticatedRequest): Promise<OrderWithDetails[]> {
    return this.ordersService.getMyOrders(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một đơn hàng theo ID' })
  @ApiParam({ name: 'id', description: 'ID đơn hàng (UUID)' })
  async getOrderById(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<OrderWithDetails> {
    return this.ordersService.getOrderById(id, req.user);
  }
}
