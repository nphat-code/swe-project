import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Home from './page';
import * as api from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { Category, Product, Topping } from '../types';

jest.mock('../lib/api', () => {
  const actual = jest.requireActual('../lib/api');
  return {
    ...actual,
    fetchCategories: jest.fn(),
    fetchProducts: jest.fn(),
    fetchToppings: jest.fn(),
    loginUser: jest.fn(),
    fetchCurrentUser: jest.fn(),
  };
});

const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Cà phê Việt Nam', slug: 'ca-phe-viet', displayOrder: 1, _count: { products: 1 } },
  { id: 'cat-2', name: 'Đá Xay & Thức Uống Đá', slug: 'da-xay', displayOrder: 2, _count: { products: 1 } },
];

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Cà Phê Sữa Đá Sài Gòn',
    slug: 'ca-phe-sua-da-sai-gon',
    description: 'Cà phê phin đậm đà.',
    basePrice: 32000,
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5',
    categoryId: 'cat-1',
    isAvailable: true,
    category: mockCategories[0],
    sizes: [
      { id: 's-1', name: 'Nhỏ (S)', code: 'S', extraPrice: 0 },
      { id: 'm-1', name: 'Vừa (M)', code: 'M', extraPrice: 6000 },
    ],
  },
  {
    id: 'prod-2',
    name: 'Matcha Đá Xay Kem Whipping',
    slug: 'matcha-da-xay-kem-whipping',
    description: 'Bột trà xanh Nhật Bản.',
    basePrice: 52000,
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a',
    categoryId: 'cat-2',
    isAvailable: true,
    category: mockCategories[1],
    sizes: [
      { id: 's-2', name: 'Nhỏ (S)', code: 'S', extraPrice: 0 },
      { id: 'm-2', name: 'Vừa (M)', code: 'M', extraPrice: 6000 },
    ],
  },
];

const mockToppings: Topping[] = [
  { id: 'top-1', name: 'Trân châu hoàng kim', price: 8000, isAvailable: true },
];

describe('Home Page (Sprint 1 + Sprint 2 Cart & Auth Flow)', () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.getState().clearCart();
    useAuthStore.getState().logout();
    jest.clearAllMocks();
  });

  it('displays loading skeletons initially, renders products, filters by category and search, and supports empty reset', async () => {
    (api.fetchCategories as jest.Mock).mockResolvedValue(mockCategories);
    (api.fetchProducts as jest.Mock).mockResolvedValue(mockProducts);
    (api.fetchToppings as jest.Mock).mockResolvedValue(mockToppings);

    const { container } = render(<Home />);

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);

    expect(await screen.findByText('Cà Phê Sữa Đá Sài Gòn')).toBeInTheDocument();
    expect(screen.getByText('Matcha Đá Xay Kem Whipping')).toBeInTheDocument();
    expect(screen.getByText('2 món')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Đá Xay & Thức Uống Đá/i }));
    expect(screen.queryByText('Cà Phê Sữa Đá Sài Gòn')).not.toBeInTheDocument();
    expect(screen.getByText('Matcha Đá Xay Kem Whipping')).toBeInTheDocument();
    expect(screen.getByText('1 món')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Tất cả món/i }));
    expect(screen.getByText('2 món')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Tìm món đồ uống bạn yêu thích/i);
    fireEvent.change(searchInput, { target: { value: 'không tồn tại' } });

    expect(screen.getByText('Chưa có món phù hợp')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Xem tất cả món/i }));

    expect(screen.getByText('Cà Phê Sữa Đá Sài Gòn')).toBeInTheDocument();
    expect(screen.getByText('Matcha Đá Xay Kem Whipping')).toBeInTheDocument();
  });

  it('renders ErrorState when backend returns empty data and recovers on retry', async () => {
    (api.fetchCategories as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(mockCategories);
    (api.fetchProducts as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(mockProducts);
    (api.fetchToppings as jest.Mock).mockResolvedValue(mockToppings);

    render(<Home />);

    expect(await screen.findByText('Lỗi kết nối máy chủ')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Thử lại kết nối/i }));

    expect(await screen.findByText('Cà Phê Sữa Đá Sài Gòn')).toBeInTheDocument();
  });

  it('opens ProductDetailModal, updates Zustand cart badge, and manages items in CartDrawer', async () => {
    jest.useFakeTimers();
    (api.fetchCategories as jest.Mock).mockResolvedValue(mockCategories);
    (api.fetchProducts as jest.Mock).mockResolvedValue(mockProducts);
    (api.fetchToppings as jest.Mock).mockResolvedValue(mockToppings);

    render(<Home />);

    expect(await screen.findByText('Cà Phê Sữa Đá Sài Gòn')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Chọn món Cà Phê Sữa Đá Sài Gòn/i }));

    const dialog = screen.getByRole('dialog', { name: 'Cà Phê Sữa Đá Sài Gòn' });
    expect(dialog).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Vừa \(M\)/i }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Trân châu hoàng kim/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Tăng số lượng' }));
    fireEvent.click(screen.getByRole('button', { name: /Thêm vào đơn hàng/i }));

    act(() => {
      jest.advanceTimersByTime(450);
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(
      screen.getByText('Đã thêm 2x Cà Phê Sữa Đá Sài Gòn (Vừa (M)) vào giỏ hàng!')
    ).toBeInTheDocument();

    const cartButton = screen.getByRole('button', { name: 'Giỏ hàng' });
    expect(cartButton).toHaveTextContent('2');

    fireEvent.click(cartButton);
    expect(screen.getByRole('dialog', { name: 'Giỏ hàng của bạn' })).toBeInTheDocument();
    expect(screen.getByText('Size: Vừa (M)')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Tăng số lượng Cà Phê Sữa Đá Sài Gòn/i }));
    expect(cartButton).toHaveTextContent('3');

    jest.useRealTimers();
  });

  it('opens AuthModal from Header, logs in, renders user profile badge, and logs out', async () => {
    const authResponse = {
      accessToken: 'jwt-demo-token',
      user: {
        id: 'user-1',
        email: 'customer@brewlite.vn',
        fullName: 'Nguyễn Minh Khách',
        phone: '0901234567',
        role: 'CUSTOMER' as const,
        loyaltyPoints: 25,
        createdAt: '2026-11-09T03:00:00.000Z',
      },
    };

    (api.fetchCategories as jest.Mock).mockResolvedValue(mockCategories);
    (api.fetchProducts as jest.Mock).mockResolvedValue(mockProducts);
    (api.fetchToppings as jest.Mock).mockResolvedValue(mockToppings);
    (api.loginUser as jest.Mock).mockResolvedValue(authResponse);
    (api.fetchCurrentUser as jest.Mock).mockResolvedValue(authResponse.user);

    render(<Home />);
    expect(await screen.findByText('Cà Phê Sữa Đá Sài Gòn')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    expect(screen.getByRole('dialog', { name: 'Đăng nhập BrewLite' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Điền nhanh tài khoản mẫu/i }));
    const loginButtons = screen.getAllByRole('button', { name: 'Đăng nhập' });
    fireEvent.click(loginButtons[loginButtons.length - 1]);

    expect(await screen.findByText('Nguyễn Minh Khách')).toBeInTheDocument();
    expect(screen.getByText('25 điểm')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Đăng xuất' }));
    expect(screen.queryByText('Nguyễn Minh Khách')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đăng nhập' })).toBeInTheDocument();
  });
});
