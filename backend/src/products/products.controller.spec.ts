import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

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
  };

  const mockCategories = [
    {
      id: 'cat-1',
      name: 'Cà phê Phin',
      slug: 'ca-phe-phin',
      displayOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockToppings = [
    { id: 'top-1', name: 'Trân châu trắng', price: 10000, isAvailable: true },
  ];

  const mockProductsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findAllCategories: jest.fn(),
    findAllToppings: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProducts', () => {
    it('should call productsService.findAll with category slug', async () => {
      mockProductsService.findAll.mockResolvedValue([mockProduct]);

      const result = await controller.getProducts('ca-phe-phin');

      expect(service.findAll).toHaveBeenCalledWith('ca-phe-phin');
      expect(result).toEqual([mockProduct]);
    });

    it('should call productsService.findAll without category slug when not provided', async () => {
      mockProductsService.findAll.mockResolvedValue([mockProduct]);

      const result = await controller.getProducts();

      expect(service.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('getCategories', () => {
    it('should call productsService.findAllCategories', async () => {
      mockProductsService.findAllCategories.mockResolvedValue(mockCategories);

      const result = await controller.getCategories();

      expect(service.findAllCategories).toHaveBeenCalled();
      expect(result).toEqual(mockCategories);
    });
  });

  describe('getToppings', () => {
    it('should call productsService.findAllToppings', async () => {
      mockProductsService.findAllToppings.mockResolvedValue(mockToppings);

      const result = await controller.getToppings();

      expect(service.findAllToppings).toHaveBeenCalled();
      expect(result).toEqual(mockToppings);
    });
  });

  describe('getProductById', () => {
    it('should call productsService.findById with product ID', async () => {
      mockProductsService.findById.mockResolvedValue(mockProduct);

      const result = await controller.getProductById('prod-1');

      expect(service.findById).toHaveBeenCalledWith('prod-1');
      expect(result).toEqual(mockProduct);
    });
  });
});
