import {
  AppliedVoucher,
  AuthResponse,
  AuthUser,
  Category,
  LoginPayload,
  Product,
  RegisterPayload,
  Topping,
} from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const PREVIEW_VOUCHERS: Record<string, AppliedVoucher> = {
  BREWLITEFIRST: {
    code: 'BREWLITEFIRST',
    description: 'Giảm 20% cho đơn hàng đầu tiên (Tối đa 30k)',
    discountPercent: 20,
    maxDiscount: 30000,
    minOrderAmount: 40000,
  },
  COFFEELOVER: {
    code: 'COFFEELOVER',
    description: 'Giảm 10% cho tín đồ cà phê mọi đơn hàng',
    discountPercent: 10,
    maxDiscount: 25000,
    minOrderAmount: 50000,
  },
};

async function extractApiErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(body?.message) && body.message.length > 0) {
      return String(body.message[0]);
    }
    if (typeof body?.message === 'string' && body.message.trim().length > 0) {
      return body.message;
    }
  } catch {
    return fallback;
  }
  return fallback;
}

async function fetchWithRetry(input: string, init?: RequestInit, maxRetries = 4): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(input, init);
      if (response.ok || attempt === maxRetries || response.status < 500) {
        return response;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  return fetch(input, init);
}

export async function fetchProducts(categorySlug?: string): Promise<Product[]> {
  try {
    const url = new URL(`${API_BASE_URL}/products`);
    if (categorySlug && categorySlug !== 'all') {
      url.searchParams.append('category', categorySlug);
    }

    const res = await fetchWithRetry(url.toString(), {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Lỗi tải danh sách sản phẩm: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Fetch products error:', error);
    return [];
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetchWithRetry(`${API_BASE_URL}/products/categories`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Lỗi tải danh mục: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Fetch categories error:', error);
    return [];
  }
}

export async function fetchToppings(): Promise<Topping[]> {
  try {
    const res = await fetchWithRetry(`${API_BASE_URL}/products/toppings`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Lỗi tải topping: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Fetch toppings error:', error);
    return [];
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const res = await fetchWithRetry(`${API_BASE_URL}/products/${id}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error(`Fetch product ${id} error:`, error);
    return null;
  }
}

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: payload.email.trim(),
      password: payload.password,
      fullName: payload.fullName.trim(),
      phone: payload.phone?.trim() || undefined,
    }),
  });

  if (!response.ok) {
    const message = await extractApiErrorMessage(response, 'Đăng ký tài khoản thất bại');
    throw new Error(message);
  }

  return (await response.json()) as AuthResponse;
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: payload.email.trim(),
      password: payload.password,
    }),
  });

  if (!response.ok) {
    const message = await extractApiErrorMessage(
      response,
      'Email hoặc mật khẩu không chính xác'
    );
    throw new Error(message);
  }

  return (await response.json()) as AuthResponse;
}

export async function fetchCurrentUser(accessToken: string): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await extractApiErrorMessage(
      response,
      'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại'
    );
    throw new Error(message);
  }

  return (await response.json()) as AuthUser;
}

export async function validateVoucherCode(
  code: string,
  subtotal: number
): Promise<AppliedVoucher> {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) {
    throw new Error('Vui lòng nhập mã giảm giá');
  }

  const assertMinOrderAmount = (voucher: AppliedVoucher): AppliedVoucher => {
    if (subtotal < voucher.minOrderAmount) {
      throw new Error(
        `Đơn tối thiểu ${formatCurrency(voucher.minOrderAmount)} để áp dụng mã ${voucher.code}`
      );
    }
    return voucher;
  };

  try {
    const response = await fetch(
      `${API_BASE_URL}/vouchers/validate?code=${encodeURIComponent(normalizedCode)}`,
      { cache: 'no-store' }
    );

    if (response.ok) {
      const voucher = (await response.json()) as AppliedVoucher;
      return assertMinOrderAmount(voucher);
    }

    const message = await extractApiErrorMessage(response, 'Mã giảm giá không hợp lệ');
    if (response.status === 404 && message.startsWith('Cannot GET')) {
      const preview = PREVIEW_VOUCHERS[normalizedCode];
      if (!preview) {
        throw new Error('Mã giảm giá không hợp lệ hoặc đã hết hạn');
      }
      return assertMinOrderAmount(preview);
    }

    throw new Error(message);
  } catch (error) {
    if (error instanceof Error && error.message !== 'Failed to fetch') {
      throw error;
    }
    const preview = PREVIEW_VOUCHERS[normalizedCode];
    if (!preview) {
      throw new Error('Mã giảm giá không hợp lệ hoặc không thể kiểm tra lúc này');
    }
    return assertMinOrderAmount(preview);
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}
