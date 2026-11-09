import {
  createOrder,
  fetchCategories,
  fetchCurrentUser,
  fetchMyOrders,
  fetchProductById,
  fetchProducts,
  fetchToppings,
  formatCurrency,
  generateIdempotencyKey,
  loginUser,
  processPayment,
  registerUser,
  updateOrderStatus,
  validateVoucherCode,
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

  it('loginUser posts credentials and surfaces backend error messages cleanly', async () => {
    const authResponse = {
      accessToken: 'jwt-123',
      user: { id: 'u1', email: 'customer@brewlite.vn', fullName: 'Khách mẫu' },
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => authResponse,
    });

    const okResult = await loginUser({
      email: ' customer@brewlite.vn ',
      password: 'BrewLite@2026',
    });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer@brewlite.vn', password: 'BrewLite@2026' }),
    });
    expect(okResult).toEqual(authResponse);

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Email hoặc mật khẩu không chính xác' }),
    });

    await expect(
      loginUser({ email: 'customer@brewlite.vn', password: 'wrong' })
    ).rejects.toThrow('Email hoặc mật khẩu không chính xác');
  });

  it('registerUser and fetchCurrentUser communicate with auth endpoints', async () => {
    const authResponse = {
      accessToken: 'jwt-new',
      user: { id: 'u2', email: 'new@brewlite.vn', fullName: 'An Nguyễn' },
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => authResponse,
    });

    const registered = await registerUser({
      email: 'new@brewlite.vn',
      password: 'BrewLite@2026',
      fullName: 'An Nguyễn',
      phone: '',
    });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'new@brewlite.vn',
        password: 'BrewLite@2026',
        fullName: 'An Nguyễn',
      }),
    });
    expect(registered).toEqual(authResponse);

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => authResponse.user,
    });

    const profile = await fetchCurrentUser('jwt-new');
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/auth/me', {
      headers: { Authorization: 'Bearer jwt-new' },
      cache: 'no-store',
    });
    expect(profile).toEqual(authResponse.user);
  });

  it('validateVoucherCode uses server response or preview fallback when endpoint is missing', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Cannot GET /vouchers/validate?code=BREWLITEFIRST' }),
    });

    const fallbackVoucher = await validateVoucherCode('brewlitefirst', 60000);
    expect(fallbackVoucher.code).toBe('BREWLITEFIRST');
    expect(fallbackVoucher.discountPercent).toBe(20);

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Cannot GET /vouchers/validate?code=BREWLITEFIRST' }),
    });

    await expect(validateVoucherCode('BREWLITEFIRST', 25000)).rejects.toThrow(
      /Đơn tối thiểu/i
    );
  });

  it('generateIdempotencyKey returns unique keys and checkout APIs send Bearer and Idempotency-Key headers', async () => {
    const keyA = generateIdempotencyKey();
    const keyB = generateIdempotencyKey();
    expect(keyA.length).toBeGreaterThan(8);
    expect(keyA).not.toBe(keyB);

    const mockOrder = { id: 'ord-1', orderNumber: '#777111', status: 'PENDING' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => mockOrder,
    });

    const createdOrder = await createOrder('jwt-token', {
      items: [{ productId: 'prod-1', quantity: 1 }],
      paymentMethod: 'WALLET',
    });
    expect(createdOrder).toEqual(mockOrder);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer jwt-token',
      },
      body: JSON.stringify({
        items: [{ productId: 'prod-1', quantity: 1 }],
        paymentMethod: 'WALLET',
      }),
    });

    const mockPaymentResult = { success: true, order: { ...mockOrder, status: 'PAID' } };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockPaymentResult,
    });

    const paymentResult = await processPayment('jwt-token', {
      orderId: 'ord-1',
      method: 'CARD',
      idempotencyKey: 'idem-key-123',
      simulateFailure: false,
    });
    expect(paymentResult).toEqual(mockPaymentResult);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer jwt-token',
        'Idempotency-Key': 'idem-key-123',
      },
      body: JSON.stringify({
        orderId: 'ord-1',
        method: 'CARD',
        idempotencyKey: 'idem-key-123',
        simulateFailure: false,
      }),
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [mockOrder],
    });
    const history = await fetchMyOrders('jwt-token');
    expect(history).toEqual([mockOrder]);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/orders/me', {
      headers: { Authorization: 'Bearer jwt-token' },
      cache: 'no-store',
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ...mockOrder, status: 'CANCELLED' }),
    });
    const cancelled = await updateOrderStatus('jwt-token', 'ord-1', 'CANCELLED');
    expect(cancelled.status).toBe('CANCELLED');
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/orders/ord-1/status', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer jwt-token',
      },
      body: JSON.stringify({ status: 'CANCELLED' }),
    });
  });
});
