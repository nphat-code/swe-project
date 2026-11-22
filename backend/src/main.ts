import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configuredOrigins = (process.env.FRONTEND_URL ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$/.test(origin)) {
        return callback(null, true);
      }
      if (configuredOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      callback(new Error(`Origin ${origin} is not allowed by CORS`), false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('BrewLite API')
    .setDescription('BrewLite Cashless Coffee Ordering System - REST API Documentation')
    .setVersion('1.0')
    .addTag('auth', 'Đăng ký, đăng nhập và xác thực JWT')
    .addTag('products', 'Quản lý đồ uống, danh mục và topping')
    .addTag('vouchers', 'Kiểm tra và áp dụng mã khuyến mãi')
    .addTag('orders', 'Khởi tạo và tra cứu lịch sử đơn hàng')
    .addTag('payments', 'Thanh toán không tiền mặt idempotent và tích điểm loyalty')
    .addTag('system', 'Giám sát hệ thống')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 BrewLite Backend running on: http://localhost:${port}`);
  console.log(`📑 Swagger Documentation available at: http://localhost:${port}/api`);
}

bootstrap();
