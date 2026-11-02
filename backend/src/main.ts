import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$/.test(origin)) {
        return callback(null, true);
      }
      const allowed = process.env.FRONTEND_URL;
      if (allowed && origin === allowed) {
        return callback(null, true);
      }
      callback(null, true);
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
    .setTitle('☕ BrewLite Coffee API')
    .setDescription('Hệ thống đặt đồ uống không dùng tiền mặt BrewLite — Tài liệu kỹ thuật REST API phục vụ phát triển & kiểm thử')
    .setVersion('1.0.0')
    .addTag('products', 'Quản lý thực đơn đồ uống, kích cỡ và danh sách topping')
    .addTag('system', 'Kiểm tra trạng thái hoạt động máy chủ (Health Check)')
    .addBearerAuth()
    .build();

  const customCss = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important; }
    body { background-color: #fbfaf8 !important; }
    .swagger-ui .topbar { display: none !important; }
    .swagger-ui .information-container {
      background: linear-gradient(135deg, #1e3932 0%, #006241 100%) !important;
      padding: 28px 36px !important;
      border-radius: 20px !important;
      color: #ffffff !important;
      box-shadow: 0 10px 25px -5px rgba(0, 98, 65, 0.25) !important;
      margin-top: 20px !important;
      margin-bottom: 24px !important;
    }
    .swagger-ui .information-container .title {
      color: #ffffff !important;
      font-size: 28px !important;
      font-weight: 800 !important;
    }
    .swagger-ui .information-container p, .swagger-ui .information-container a {
      color: #d4e9e2 !important;
      font-size: 14px !important;
    }
    .swagger-ui .information-container .version {
      background-color: #d4e9e2 !important;
      color: #006241 !important;
      font-weight: 700 !important;
      padding: 4px 12px !important;
      border-radius: 9999px !important;
    }
    .swagger-ui .opblock {
      border-radius: 14px !important;
      border: 1px solid #e7ecea !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03) !important;
      margin-bottom: 14px !important;
      overflow: hidden !important;
      transition: all 0.2s ease !important;
    }
    .swagger-ui .opblock:hover {
      box-shadow: 0 6px 16px rgba(0,0,0,0.07) !important;
      transform: translateY(-1px);
    }
    .swagger-ui .opblock.opblock-get {
      background: #f4faf7 !important;
      border-color: #a3e0c7 !important;
    }
    .swagger-ui .opblock.opblock-get .opblock-summary-method {
      background: #006241 !important;
      border-radius: 8px !important;
      font-weight: 700 !important;
    }
    .swagger-ui .opblock.opblock-post {
      background: #fbf8f2 !important;
      border-color: #e6c89c !important;
    }
    .swagger-ui .opblock.opblock-post .opblock-summary-method {
      background: #8c5338 !important;
      border-radius: 8px !important;
      font-weight: 700 !important;
    }
    .swagger-ui .opblock-tag {
      font-size: 18px !important;
      font-weight: 700 !important;
      color: #1e3932 !important;
      border-bottom: 2px solid #e7ecea !important;
      padding: 12px 0 8px 0 !important;
    }
    .swagger-ui .btn.execute {
      background-color: #006241 !important;
      border-color: #006241 !important;
      color: #ffffff !important;
      border-radius: 8px !important;
      font-weight: 600 !important;
      box-shadow: 0 4px 10px rgba(0, 98, 65, 0.3) !important;
    }
    .swagger-ui .btn.try-out__btn {
      border-radius: 8px !important;
      border-color: #006241 !important;
      color: #006241 !important;
      font-weight: 600 !important;
    }
    .swagger-ui select, .swagger-ui input[type=text] {
      border-radius: 8px !important;
    }
  `;

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'BrewLite API Documentation | Swagger UI',
    customCss,
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      displayRequestDuration: true,
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 BrewLite Backend running on: http://localhost:${port}`);
  console.log(`📑 Swagger Documentation available at: http://localhost:${port}/api`);
}

bootstrap();
