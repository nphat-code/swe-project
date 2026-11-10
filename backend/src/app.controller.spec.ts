import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let controller: AppController;
  let prismaService: { $queryRaw: jest.Mock };

  beforeEach(async () => {
    prismaService = {
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should return welcome message and API version', () => {
    expect(controller.getHello()).toEqual({
      message: 'Hello from BrewLite Backend API!',
      version: '1.0.0',
    });
  });

  it('should return health status with database connectivity latency', async () => {
    const health = await controller.getHealth();

    expect(prismaService.$queryRaw).toHaveBeenCalledTimes(1);
    expect(health.status).toBe('ok');
    expect(health.database.status).toBe('up');
    expect(typeof health.database.latencyMs).toBe('number');
    expect(health.database.latencyMs).toBeGreaterThanOrEqual(0);
    expect(typeof health.uptime).toBe('number');
    expect(health.uptime).toBeGreaterThanOrEqual(0);
    expect(Number.isNaN(Date.parse(health.timestamp))).toBe(false);
  });

  it('should throw ServiceUnavailableException when database ping fails', async () => {
    prismaService.$queryRaw.mockRejectedValueOnce(new Error('Connection refused'));

    await expect(controller.getHealth()).rejects.toThrow(ServiceUnavailableException);
  });
});

