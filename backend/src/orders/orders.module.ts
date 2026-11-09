import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { VouchersModule } from '../vouchers/vouchers.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [AuthModule, VouchersModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
