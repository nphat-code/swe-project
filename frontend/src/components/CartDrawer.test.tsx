import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as api from '../lib/api';
import { useCartStore } from '../store/useCartStore';
import { CartDrawer } from './CartDrawer';

jest.mock('../lib/api', () => {
  const actual = jest.requireActual('../lib/api');
  return {
    ...actual,
    validateVoucherCode: jest.fn(),
  };
});

describe('CartDrawer', () => {
  const onClose = jest.fn();
  const onRequireAuth = jest.fn();
  const onProceedCheckout = jest.fn();

  beforeEach(() => {
    localStorage.clear();
    useCartStore.getState().clearCart();
    jest.clearAllMocks();
  });

  it('renders empty state when cart has no items and closes on explore CTA', () => {
    render(
      <CartDrawer
        isOpen={true}
        onClose={onClose}
        isAuthenticated={false}
        onRequireAuth={onRequireAuth}
        onProceedCheckout={onProceedCheckout}
      />
    );

    expect(screen.getByText('Giỏ hàng hiện đang trống')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Khám phá thực đơn' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('manages quantities, applies voucher, and routes guest to auth', async () => {
    useCartStore.getState().addItem({
      productId: 'prod-1',
      productName: 'Bạc Xỉu 3 Tầng Đặc Biệt',
      productImage: 'https://images.unsplash.com/photo-1579992357154-faf4bde95b3d',
      basePrice: 35000,
      selectedSize: { id: 'size-m', name: 'Vừa (M)', code: 'M', extraPrice: 6000 },
      selectedToppings: [{ id: 'top-1', name: 'Trân châu hoàng kim', price: 8000 }],
      quantity: 1,
      note: 'Ít ngọt',
      unitPrice: 49000,
      totalPrice: 49000,
    });

    (api.validateVoucherCode as jest.Mock).mockResolvedValue({
      code: 'BREWLITEFIRST',
      description: 'Giảm 20% cho đơn hàng đầu tiên (Tối đa 30k)',
      discountPercent: 20,
      maxDiscount: 30000,
      minOrderAmount: 40000,
    });

    render(
      <CartDrawer
        isOpen={true}
        onClose={onClose}
        isAuthenticated={false}
        onRequireAuth={onRequireAuth}
        onProceedCheckout={onProceedCheckout}
      />
    );

    expect(screen.getByText('Bạc Xỉu 3 Tầng Đặc Biệt')).toBeInTheDocument();
    expect(screen.getByText('Size: Vừa (M)')).toBeInTheDocument();
    expect(screen.getByText('Ghi chú: Ít ngọt')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Tăng số lượng Bạc Xỉu 3 Tầng Đặc Biệt/i }));
    expect(screen.getByText('Tạm tính (2 ly)')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Mã giảm giá'), {
      target: { value: 'BREWLITEFIRST' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Áp dụng' }));

    await waitFor(() => {
      expect(screen.getByText('Giảm giá (BREWLITEFIRST)')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Đăng nhập để thanh toán/i }));
    expect(onRequireAuth).toHaveBeenCalledTimes(1);
  });

  it('triggers onProceedCheckout when authenticated and closes on Escape', () => {
    useCartStore.getState().addItem({
      productId: 'prod-1',
      productName: 'Americano Đá Tươi Mát',
      productImage: 'https://images.unsplash.com/photo-1551030173-122aabc4489c',
      basePrice: 38000,
      selectedSize: { id: 'size-s', name: 'Nhỏ (S)', code: 'S', extraPrice: 0 },
      selectedToppings: [],
      quantity: 2,
      unitPrice: 38000,
      totalPrice: 76000,
    });

    render(
      <CartDrawer
        isOpen={true}
        onClose={onClose}
        isAuthenticated={true}
        onRequireAuth={onRequireAuth}
        onProceedCheckout={onProceedCheckout}
      />
    );

    expect(screen.getByText(/Dự kiến tích \+7 điểm thành viên/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Tiến hành thanh toán/i }));
    expect(onProceedCheckout).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
