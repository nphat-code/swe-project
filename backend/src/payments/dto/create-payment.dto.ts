import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const ALLOWED_PAYMENT_METHODS = [
  'WALLET',
  'CARD',
  'MOCK_WALLET',
  'MOCK_MOMO',
  'MOCK_VNPAY',
] as const;

function trimRequiredString({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

function trimOptionalUpperString({ value }: TransformFnParams): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed.toUpperCase();
}

function trimOptionalString({ value }: TransformFnParams): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function normalizeOptionalBoolean({ value }: TransformFnParams): unknown {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (value === true || value === 'true') {
    return true;
  }
  if (value === false || value === 'false') {
    return false;
  }
  return value;
}

export class CreatePaymentDto {
  @ApiProperty({ example: 'order-uuid-1' })
  @Transform(trimRequiredString)
  @IsString({ message: 'Mã đơn hàng phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Vui lòng cung cấp mã đơn hàng' })
  orderId: string;

  @ApiPropertyOptional({ enum: ALLOWED_PAYMENT_METHODS, default: 'WALLET' })
  @Transform(trimOptionalUpperString)
  @IsOptional()
  @IsString({ message: 'Phương thức thanh toán phải là chuỗi ký tự' })
  @IsIn(ALLOWED_PAYMENT_METHODS, { message: 'Phương thức thanh toán không được hỗ trợ' })
  method?: string;

  @ApiPropertyOptional({ example: 'pay-key-uuid-123' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString({ message: 'Khóa Idempotency phải là chuỗi ký tự' })
  @MaxLength(128, { message: 'Khóa Idempotency không vượt quá 128 ký tự' })
  idempotencyKey?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @Transform(normalizeOptionalBoolean)
  @IsOptional()
  @IsBoolean({ message: 'Giá trị simulateFailure phải là boolean' })
  simulateFailure?: boolean;
}

