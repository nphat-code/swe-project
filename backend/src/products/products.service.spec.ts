import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  const mockProduct = {
    id: 'prod-1',
    name: 'Cà phê Phin Đen',
    description: 'Hương vị đậm đà truyền thống',
    basePrice: 29000,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd',
    categoryId: 'cat-1',
    isAvailable: true,
    displayOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: {
      id: 'cat-1',
      name: 'Cà phê Phin',
      slug: 'ca-phe-phin',
      displayOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    sizes: [
      { id: 'size-1', name: 'Nhỏ (S)', extraPrice: 0, isDefault: true, productId: 'prod-1' },
      { id: 'size-2', name: 'Vừa (M)', extraPrice: 6000, isDefault: false, productId: 'prod-1' },
    ],
  };

  const mockToppings = [
    { id: 'top-1', name: 'Trân châu trắng', price: 10000, isAvailable: true },
    { id: 'top-2', name: 'Thạch cà phê', price: 10000, isAvailable: true },
  ];

  const mockCategories = [
    {
      id: 'cat-1',
      name: 'Cà phê Phin',
      slug: 'ca-phe-phin',
      displayOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: { products: 5 },
    },
  ];

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
    },
    topping: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all available products when no category slug is provided', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);

      const result = await service.findAll();

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: { isAvailable: true },
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
      expect(result).toEqual([mockProduct]);
    });

    it('should return all available products when category slug is "all"', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);

      const result = await service.findAll('all');

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: { isAvailable: true },
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
      expect(result).toEqual([mockProduct]);
    });

    it('should filter products by category slug when provided', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);

      const result = await service.findAll('ca-phe-phin');

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: {
          isAvailable: true,
          category: { slug: 'ca-phe-phin' },
        },
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
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('findById', () => {
    it('should return product details with available toppings when product exists', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.topping.findMany.mockResolvedValue(mockToppings);

      const result = await service.findById('prod-1');

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        include: {
          category: true,
          sizes: {
            orderBy: { extraPrice: 'asc' },
          },
        },
      });
      expect(prisma.topping.findMany).toHaveBeenCalledWith({
        where: { isAvailable: true },
        orderBy: { price: 'asc' },
      });
      expect(result).toEqual({
        ...mockProduct,
        availableToppings: mockToppings,
      });
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findById('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllCategories', () => {
    it('should return list of categories ordered by displayOrder', async () => {
      mockPrismaService.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAllCategories();

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { displayOrder: 'asc' },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });
      expect(result).toEqual(mockCategories);
    });
  });

  describe('findAllToppings', () => {
    it('should return all available toppings', async () => {
      mockPrismaService.topping.findMany.mockResolvedValue(mockToppings);

      const result = await service.findAllToppings();

      expect(prisma.topping.findMany).toHaveBeenCalledWith({
        where: { isAvailable: true },
        orderBy: { price: 'asc' },
      });
      expect(result).toEqual(mockToppings);
    });
  });
});
