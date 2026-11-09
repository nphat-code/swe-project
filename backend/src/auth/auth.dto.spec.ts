import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('Auth DTOs', () => {
  describe('RegisterDto', () => {
    it('should transform and validate valid payload including empty optional phone', async () => {
      const dto = plainToInstance(RegisterDto, {
        email: '  New.User@BrewLite.VN ',
        password: 'BrewLite@2026',
        fullName: '  Nguyễn Văn An  ',
        phone: '   ',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.email).toBe('new.user@brewlite.vn');
      expect(dto.fullName).toBe('Nguyễn Văn An');
      expect(dto.phone).toBeUndefined();
    });

    it('should reject invalid email and short password', async () => {
      const dto = plainToInstance(RegisterDto, {
        email: 'invalid-email',
        password: '123',
        fullName: 'A',
        phone: 'abc',
      });

      const errors = await validate(dto);
      const invalidFields = errors.map((error) => error.property);

      expect(invalidFields).toEqual(
        expect.arrayContaining(['email', 'password', 'fullName', 'phone']),
      );
    });
  });

  describe('LoginDto', () => {
    it('should normalize email and validate valid credentials', async () => {
      const dto = plainToInstance(LoginDto, {
        email: '  CUSTOMER@BrewLite.vn  ',
        password: 'BrewLite@2026',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.email).toBe('customer@brewlite.vn');
    });

    it('should reject empty password and malformed email', async () => {
      const dto = plainToInstance(LoginDto, {
        email: 'not-an-email',
        password: '',
      });

      const errors = await validate(dto);
      const invalidFields = errors.map((error) => error.property);

      expect(invalidFields).toEqual(expect.arrayContaining(['email', 'password']));
    });
  });
});
