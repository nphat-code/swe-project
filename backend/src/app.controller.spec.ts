import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should return welcome message and API version', () => {
    expect(controller.getHello()).toEqual({
      message: 'Hello from BrewLite Backend API!',
      version: '1.0.0',
    });
  });

  it('should return health status with uptime and timestamp', () => {
    const health = controller.getHealth();

    expect(health.status).toBe('ok');
    expect(typeof health.uptime).toBe('number');
    expect(health.uptime).toBeGreaterThanOrEqual(0);
    expect(Number.isNaN(Date.parse(health.timestamp))).toBe(false);
  });
});

