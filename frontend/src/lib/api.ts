import { Product, Category, Topping } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}
