import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockedHash = bcrypt.hash as unknown as jest.Mock<
    Promise<string>,
    [string | Buffer, string | number]
  >;
  const mockedCompare = bcrypt.compare as unknown as jest.Mock<
    Promise<boolean>,
    [string | Buffer, string]
  >;

  const now = new Date('2026-11-09T03:00:00.000Z');

  const safeUser = {
    id: 'user-1',
    email: 'customer@brewlite.vn',
    fullName: 'Nguyễn Minh Phát',
    phone: '0901234567',
    role: Role.CUSTOMER,
    loyaltyPoints: 25,
    createdAt: now,
  };

  const fullUserRecord = {
    ...safeUser,
    password: '$2b$10$hashedpasswordvalue',
    updatedAt: now,
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should hash password with salt rounds 10, create user, and return accessToken without password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockedHash.mockResolvedValue('$2b$10$newhash');
      mockPrismaService.user.create.mockResolvedValue(safeUser);
      mockJwtService.signAsync.mockResolvedValue('signed-jwt-token');

      const result = await service.register({
        email: '  Customer@BrewLite.vn  ',
        password: 'BrewLite@2026',
        fullName: '  Nguyễn Minh Phát  ',
        phone: ' 0901234567 ',
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'customer@brewlite.vn' },
      });
      expect(mockedHash).toHaveBeenCalledWith('BrewLite@2026', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'customer@brewlite.vn',
          password: '$2b$10$newhash',
          fullName: 'Nguyễn Minh Phát',
          phone: '0901234567',
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          loyaltyPoints: true,
          createdAt: true,
        },
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: safeUser.id,
        email: safeUser.email,
        role: safeUser.role,
      });
      expect(result).toEqual({
        accessToken: 'signed-jwt-token',
        user: safeUser,
      });
      expect(result.user).not.toHaveProperty('password');
    });

    it('should store null when phone is omitted or empty', async () => {
      const userWithoutPhone = { ...safeUser, phone: null };
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockedHash.mockResolvedValue('$2b$10$newhash');
      mockPrismaService.user.create.mockResolvedValue(userWithoutPhone);
      mockJwtService.signAsync.mockResolvedValue('signed-jwt-token');

      const result = await service.register({
        email: 'newuser@brewlite.vn',
        password: 'BrewLite@2026',
        fullName: 'Trần Thu Hà',
      });

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            phone: null,
          }),
        }),
      );
      expect(result.user.phone).toBeNull();
    });

    it('should throw ConflictException when email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(fullUserRecord);

      await expect(
        service.register({
          email: 'customer@brewlite.vn',
          password: 'BrewLite@2026',
          fullName: 'Nguyễn Minh Phát',
        }),
      ).rejects.toThrow(ConflictException);

      expect(mockedHash).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when prisma raises unique constraint error P2002', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockedHash.mockResolvedValue('$2b$10$newhash');
      const p2002Error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '6.19.3',
      });
      mockPrismaService.user.create.mockRejectedValue(p2002Error);

      await expect(
        service.register({
          email: 'customer@brewlite.vn',
          password: 'BrewLite@2026',
          fullName: 'Nguyễn Minh Phát',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should rethrow unexpected errors during user creation', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockedHash.mockResolvedValue('$2b$10$newhash');
      mockPrismaService.user.create.mockRejectedValue(new Error('Database connection failed'));

      await expect(
        service.register({
          email: 'customer@brewlite.vn',
          password: 'BrewLite@2026',
          fullName: 'Nguyễn Minh Phát',
        }),
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('login', () => {
    it('should authenticate valid credentials and return accessToken with safe user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(fullUserRecord);
      mockedCompare.mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('signed-login-token');

      const result = await service.login({
        email: '  Customer@BrewLite.vn ',
        password: 'BrewLite@2026',
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'customer@brewlite.vn' },
      });
      expect(mockedCompare).toHaveBeenCalledWith('BrewLite@2026', fullUserRecord.password);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: safeUser.id,
        email: safeUser.email,
        role: safeUser.role,
      });
      expect(result).toEqual({
        accessToken: 'signed-login-token',
        user: safeUser,
      });
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'missing@brewlite.vn',
          password: 'BrewLite@2026',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockedCompare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(fullUserRecord);
      mockedCompare.mockResolvedValue(false);

      await expect(
        service.login({
          email: 'customer@brewlite.vn',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return safe user profile when user exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(safeUser);

      const result = await service.getProfile('user-1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          loyaltyPoints: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(safeUser);
    });

    it('should throw UnauthorizedException when user profile is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('missing-user-id')).rejects.toThrow(UnauthorizedException);
    });
  });
});
