import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findAllToppings() {
    return this.prisma.topping.findMany({
      where: { isAvailable: true },
      orderBy: { price: 'asc' },
    });
  }
}
