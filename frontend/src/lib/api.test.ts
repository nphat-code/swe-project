import {
  fetchCategories,
  fetchProductById,
  fetchProducts,
  fetchToppings,
  formatCurrency,
} from './api';

describe('API Utils - formatCurrency', () => {
  it('formats integer VND currency correctly', () => {
    const formatted = formatCurrency(29000);
    expect(formatted).toContain('29.000');
    expect(formatted).toContain('₫');
  });

  it('formats zero amount correctly', () => {
    const formatted = formatCurrency(0);
    expect(formatted).toContain('0');
    expect(formatted).toContain('₫');
  });

  it('formats large amount correctly', () => {
    const formatted = formatCurrency(1250000);
    expect(formatted).toContain('1.250.000');
    expect(formatted).toContain('₫');
  });
});

describe('API Client', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.useFakeTimers();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('fetchProducts fetches all products and supports category filtering', async () => {
    const mockProducts = [{ id: 'prod-1', name: 'Cà phê sữa' }];
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockProducts,
    });

    const allResult = await fetchProducts();
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/products',
      { cache: 'no-store' }
    );
    expect(allResult).toEqual(mockProducts);

    await fetchProducts('ca-phe-viet');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/products?category=ca-phe-viet',
      { cache: 'no-store' }
    );
  });

  it('fetchProducts returns empty array on 4xx error without retrying', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
    });

    const result = await fetchProducts();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
    consoleSpy.mockRestore();
  });

  it('fetchCategories returns categories from backend', async () => {
    const mockCategories = [{ id: 'cat-1', name: 'Cà phê Việt Nam', slug: 'ca-phe-viet' }];
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockCategories,
    });

    const result = await fetchCategories();

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/products/categories',
      { cache: 'no-store' }
    );
    expect(result).toEqual(mockCategories);
  });

  it('fetchToppings returns toppings from backend', async () => {
    const mockToppings = [{ id: 'top-1', name: 'Trân châu hoàng kim', price: 8000 }];
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockToppings,
    });

    const result = await fetchToppings();

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/products/toppings',
      { cache: 'no-store' }
    );
    expect(result).toEqual(mockToppings);
  });

  it('fetchProductById returns product detail when found and null when 404', async () => {
    const mockDetail = { id: 'prod-1', name: 'Bạc xỉu' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockDetail,
    });

    const found = await fetchProductById('prod-1');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/products/prod-1',
      { cache: 'no-store' }
    );
    expect(found).toEqual(mockDetail);

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const missing = await fetchProductById('missing-id');
    expect(missing).toBeNull();
  });

  it('fetchCategories retries on network error and falls back to empty array', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network down'));

    const promise = fetchCategories();
    await jest.runAllTimersAsync();
    const result = await promise;

    expect(global.fetch).toHaveBeenCalledTimes(5);
    expect(result).toEqual([]);
    consoleSpy.mockRestore();
  });
});
