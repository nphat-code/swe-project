import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

export interface HealthStatusResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  database: {
    status: 'up' | 'down';
    latencyMs?: number;
    message?: string;
  };
}

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): { message: string; version: string } {
    return {
      message: 'Hello from BrewLite Backend API!',
      version: '1.0.0',
    };
  }

  async getHealth(): Promise<HealthStatusResponse> {
    const startedAt = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          status: 'up',
          latencyMs: Date.now() - startedAt,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Database connection failed';
      throw new ServiceUnavailableException({
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          status: 'down',
          message,
        },
      });
    }
  }
}
