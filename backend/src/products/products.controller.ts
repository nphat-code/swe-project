import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getProducts(@Query('category') categorySlug?: string) {
    return this.productsService.findAll(categorySlug);
  }

  @Get('categories')
  async getCategories() {
    return this.productsService.findAllCategories();
  }

  @Get('toppings')
  async getToppings() {
    return this.productsService.findAllToppings();
  }

  @Get(':id')
  async getProductById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }
}
