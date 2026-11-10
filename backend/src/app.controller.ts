import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService, HealthStatusResponse } from './app.service';

@ApiTags('system')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Thông điệp chào mừng và phiên bản API' })
  getHello() {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Kiểm tra trạng thái sức khỏe hệ thống và kết nối PostgreSQL' })
  @ApiResponse({ status: 200, description: 'Hệ thống và CSDL hoạt động bình thường' })
  @ApiResponse({ status: 503, description: 'Không thể kết nối cơ sở dữ liệu' })
  getHealth(): Promise<HealthStatusResponse> {
    return this.appService.getHealth();
  }
}
