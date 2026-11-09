import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtPayload, SafeUser } from './types/auth.types';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prisma: PrismaService;

  const mockSafeUser: SafeUser = {
    id: 'user-1',
    email: 'customer@brewlite.vn',
    fullName: 'Nguyễn Minh Phát',
    phone: '0901234567',
    role: Role.CUSTOMER,
    loyaltyPoints: 25,
    createdAt: new Date('2026-11-09T03:00:00.000Z'),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test_jwt_secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate JWT payload and return safe user without password', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(mockSafeUser);
    const payload: JwtPayload = {
      sub: 'user-1',
      email: 'customer@brewlite.vn',
      role: Role.CUSTOMER,
    };

    const result = await strategy.validate(payload);

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
    expect(result).toEqual(mockSafeUser);
  });

  it('should throw UnauthorizedException when user no longer exists', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);
    const payload: JwtPayload = {
      sub: 'deleted-user-id',
      email: 'deleted@brewlite.vn',
      role: Role.CUSTOMER,
    };

    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });
});
