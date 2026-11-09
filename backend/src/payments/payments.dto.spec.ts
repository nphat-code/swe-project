import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePaymentDto } from './dto/create-payment.dto';

describe('CreatePaymentDto', () => {
  it('should normalize orderId, uppercase method, and preserve boolean simulateFailure strings', async () => {
    const dto = plainToInstance(CreatePaymentDto, {
      orderId: '  order-123  ',
      method: ' card ',
      idempotencyKey: '  idem-key-1  ',
      simulateFailure: 'false',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.orderId).toBe('order-123');
    expect(dto.method).toBe('CARD');
    expect(dto.idempotencyKey).toBe('idem-key-1');
    expect(dto.simulateFailure).toBe(false);
  });

  it('should accept minimal payload with optional fields omitted or boolean true', async () => {
    const dto = plainToInstance(CreatePaymentDto, {
      orderId: 'order-456',
      simulateFailure: 'true',
      idempotencyKey: '   ',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.simulateFailure).toBe(true);
    expect(dto.idempotencyKey).toBeUndefined();
  });

  it('should reject blank orderId, unsupported method, non-boolean flag, and long key', async () => {
    const invalidDto = plainToInstance(CreatePaymentDto, {
      orderId: '   ',
      method: 'CASH',
      simulateFailure: 'not-a-bool',
      idempotencyKey: 'k'.repeat(129),
    });

    const errors = await validate(invalidDto);
    const props = errors.map((err) => err.property);

    expect(props).toEqual(
      expect.arrayContaining(['orderId', 'method', 'simulateFailure', 'idempotencyKey']),
    );
  });
});

