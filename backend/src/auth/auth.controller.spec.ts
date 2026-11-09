import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthResponse, SafeUser } from './types/auth.types';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockSafeUser: SafeUser = {
    id: 'user-1',
    email: 'customer@brewlite.vn',
    fullName: 'Nguyễn Minh Phát',
    phone: '0901234567',
    role: Role.CUSTOMER,
    loyaltyPoints: 25,
    createdAt: new Date('2026-11-09T03:00:00.000Z'),
  };

  const mockAuthResponse: AuthResponse = {
    accessToken: 'jwt-access-token',
    user: mockSafeUser,
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register and return access token with user', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResponse);
      const dto = {
        email: 'customer@brewlite.vn',
        password: 'BrewLite@2026',
        fullName: 'Nguyễn Minh Phát',
        phone: '0901234567',
      };

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('login', () => {
    it('should call authService.login and return access token with user', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);
      const dto = {
        email: 'customer@brewlite.vn',
        password: 'BrewLite@2026',
      };

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('getMe', () => {
    it('should call authService.getProfile with authenticated user id', async () => {
      mockAuthService.getProfile.mockResolvedValue(mockSafeUser);

      const result = await controller.getMe({ user: mockSafeUser });

      expect(authService.getProfile).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockSafeUser);
    });
  });
});
