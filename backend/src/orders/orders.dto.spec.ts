import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateOrderDto } from './dto/create-order.dto';

describe('CreateOrderDto', () => {
  it('should validate nested order items and normalize blank optional strings', async () => {
    const dto = plainToInstance(CreateOrderDto, {
      items: [
        {
          productId: 'prod-1',
          sizeId: 'size-m',
          toppingIds: ['top-1'],
          quantity: 2,
          note: '  Ít đá  ',
        },
      ],
      voucherCode: '  ',
      customerName: '  Nguyễn Minh Khách  ',
      customerPhone: '',
      paymentMethod: 'WALLET',
      note: '   ',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.voucherCode).toBeUndefined();
    expect(dto.customerName).toBe('Nguyễn Minh Khách');
    expect(dto.customerPhone).toBeUndefined();
    expect(dto.note).toBeUndefined();
    expect(dto.items[0].note).toBe('Ít đá');
  });

  it('should reject empty items array, invalid quantity, and unsupported payment method', async () => {
    const emptyItemsDto = plainToInstance(CreateOrderDto, {
      items: [],
      paymentMethod: 'CASH',
      customerPhone: 'abc',
    });

    const emptyErrors = await validate(emptyItemsDto);
    const invalidProps = emptyErrors.map((err) => err.property);
    expect(invalidProps).toEqual(
      expect.arrayContaining(['items', 'paymentMethod', 'customerPhone']),
    );

    const invalidNestedDto = plainToInstance(CreateOrderDto, {
      items: [
        {
          productId: '',
          quantity: 0,
        },
      ],
    });
    const nestedErrors = await validate(invalidNestedDto);
    expect(nestedErrors.length).toBeGreaterThan(0);
  });
});
