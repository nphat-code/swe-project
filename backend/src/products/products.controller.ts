import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách đồ uống (hỗ trợ lọc theo danh mục)' })
  @ApiQuery({ name: 'category', required: false, description: 'Slug của danh mục đồ uống' })
  async getProducts(@Query('category') categorySlug?: string) {
    return this.productsService.findAll(categorySlug);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Lấy danh sách tất cả các danh mục đồ uống' })
  async getCategories() {
    return this.productsService.findAllCategories();
  }

  @Get('toppings')
  @ApiOperation({ summary: 'Lấy danh sách tất cả các loại topping khả dụng' })
  async getToppings() {
    return this.productsService.findAllToppings();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết đồ uống kèm size và topping' })
  @ApiParam({ name: 'id', description: 'ID đồ uống (UUID)' })
  async getProductById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }
}
