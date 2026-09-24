import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách sản phẩm, có thể lọc theo category slug
   */
  async findAll(categorySlug?: string) {
    const where: any = { isAvailable: true };

    if (categorySlug && categorySlug !== 'all') {
      where.category = {
        slug: categorySlug,
      };
    }

    return this.prisma.product.findMany({
      where,
      include: {
        category: true,
        sizes: {
          orderBy: { extraPrice: 'asc' },
        },
      },
      orderBy: [
        { category: { displayOrder: 'asc' } },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Lấy chi tiết sản phẩm theo ID kèm sizes và danh sách toppings khả dụng
   */
  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        sizes: {
          orderBy: { extraPrice: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm có ID ${id}`);
    }

    const availableToppings = await this.prisma.topping.findMany({
      where: { isAvailable: true },
      orderBy: { price: 'asc' },
    });

    return {
      ...product,
      availableToppings,
    };
  }

  /**
   * Lấy danh sách danh mục kèm số lượng sản phẩm
   */
  async findAllCategories() {
    return this.prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  /**
   * Lấy danh sách toppings
   */
  async findAllToppings() {
    return this.prisma.topping.findMany({
      where: { isAvailable: true },
      orderBy: { price: 'asc' },
    });
  }
}
