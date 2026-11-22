import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

const ALLOWED_PAYMENT_METHODS = [
  'WALLET',
  'CARD',
  'MOCK_WALLET',
  'MOCK_MOMO',
  'MOCK_VNPAY',
  'PAYOS_VIETQR',
] as const;

function trimOptionalString({ value }: TransformFnParams): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

export class CreateOrderItemDto {
  @ApiProperty({ example: 'prod-uuid-1' })
  @IsString({ message: 'Mã sản phẩm phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Vui lòng cung cấp mã sản phẩm' })
  productId: string;

  @ApiPropertyOptional({ example: 'size-uuid-m' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString({ message: 'Mã kích cỡ phải là chuỗi ký tự' })
  sizeId?: string;

  @ApiPropertyOptional({ example: 'M' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString({ message: 'Mã code kích cỡ phải là chuỗi ký tự' })
  sizeCode?: string;

  @ApiPropertyOptional({ example: ['topping-uuid-1'], type: [String] })
  @IsOptional()
  @IsArray({ message: 'Danh sách topping phải là mảng' })
  @IsString({ each: true, message: 'Mỗi mã topping phải là chuỗi ký tự' })
  toppingIds?: string[];

  @ApiProperty({ example: 2, minimum: 1, maximum: 99 })
  @Type(() => Number)
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng tối thiểu là 1' })
  @Max(99, { message: 'Số lượng tối đa cho mỗi dòng món là 99' })
  quantity: number;

  @ApiPropertyOptional({ example: 'Ít đá, 50% đường' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  @MaxLength(200, { message: 'Ghi chú không vượt quá 200 ký tự' })
  note?: string;
}

export class CreateOrderDto {
  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray({ message: 'Danh sách món phải là mảng' })
  @ArrayMinSize(1, { message: 'Đơn hàng phải có ít nhất 1 món đồ uống' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiPropertyOptional({ example: 'BREWLITEFIRST' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString({ message: 'Mã giảm giá phải là chuỗi ký tự' })
  @MaxLength(50, { message: 'Mã giảm giá không vượt quá 50 ký tự' })
  voucherCode?: string;

  @ApiPropertyOptional({ example: 'Nguyễn Minh Khách' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString({ message: 'Tên khách hàng phải là chuỗi ký tự' })
  @MaxLength(100, { message: 'Tên khách hàng không vượt quá 100 ký tự' })
  customerName?: string;

  @ApiPropertyOptional({ example: '0901234567' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @Matches(/^[0-9+\-\s]{8,15}$/, { message: 'Số điện thoại không hợp lệ' })
  customerPhone?: string;

  @ApiPropertyOptional({ enum: ALLOWED_PAYMENT_METHODS, default: 'MOCK_WALLET' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString({ message: 'Phương thức thanh toán phải là chuỗi ký tự' })
  @IsIn(ALLOWED_PAYMENT_METHODS, { message: 'Phương thức thanh toán không được hỗ trợ' })
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 'Lấy tại quầy lúc 9h30' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString({ message: 'Ghi chú đơn hàng phải là chuỗi ký tự' })
  @MaxLength(300, { message: 'Ghi chú đơn hàng không vượt quá 300 ký tự' })
  note?: string;
}
