import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ProductDetailModal } from './ProductDetailModal';
import { Product, Topping } from '../types';

const mockToppings: Topping[] = [
  { id: 'top-1', name: 'Trân châu hoàng kim', price: 8000, isAvailable: true },
  { id: 'top-2', name: 'Kem phô mai Macchiato', price: 12000, isAvailable: true },
];

const mockProduct: Product = {
  id: 'prod-01',
  name: 'Cà Phê Sữa Đá Sài Gòn',
  slug: 'ca-phe-sua-da-sai-gon',
  description: 'Cà phê phin truyền thống hòa quyện cùng sữa đặc béo ngọt.',
  basePrice: 32000,
  imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5',
  categoryId: 'cat-01',
  isAvailable: true,
  category: {
    id: 'cat-01',
    name: 'Cà phê Việt Nam',
    slug: 'ca-phe-viet',
    displayOrder: 1,
  },
  sizes: [
    { id: 'size-s', name: 'Nhỏ (S)', code: 'S', extraPrice: 0 },
    { id: 'size-m', name: 'Vừa (M)', code: 'M', extraPrice: 6000 },
    { id: 'size-l', name: 'Lớn (L)', code: 'L', extraPrice: 10000 },
  ],
};

describe('ProductDetailModal Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    document.body.style.overflow = 'unset';
  });

  it('does not render when isOpen is false or product is null', () => {
    const { container } = render(
      <ProductDetailModal
        product={null}
        allToppings={mockToppings}
        isOpen={false}
        onClose={jest.fn()}
        onAddToCart={jest.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders product details, sizes, toppings and calculates initial price', () => {
    render(
      <ProductDetailModal
        product={mockProduct}
        allToppings={mockToppings}
        isOpen={true}
        onClose={jest.fn()}
        onAddToCart={jest.fn()}
      />
    );

    expect(screen.getByRole('dialog', { name: 'Cà Phê Sữa Đá Sài Gòn' })).toBeInTheDocument();
    expect(screen.getByText('Cà phê Việt Nam')).toBeInTheDocument();
    expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nhỏ \(S\)/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Thêm vào đơn hàng/i })).toHaveTextContent('32.000');
  });

  it('recalculates price dynamically when selecting size, toppings, and quantity', () => {
    render(
      <ProductDetailModal
        product={mockProduct}
        allToppings={mockToppings}
        isOpen={true}
        onClose={jest.fn()}
        onAddToCart={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Vừa \(M\)/i }));
    expect(screen.getByRole('button', { name: /Vừa \(M\)/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Thêm vào đơn hàng/i })).toHaveTextContent('38.000');

    const toppingOne = screen.getByRole('checkbox', { name: /Trân châu hoàng kim/i });
    const toppingTwo = screen.getByRole('checkbox', { name: /Kem phô mai Macchiato/i });

    fireEvent.click(toppingOne);
    expect(toppingOne).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('Đã chọn 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Thêm vào đơn hàng/i })).toHaveTextContent('46.000');

    fireEvent.click(toppingTwo);
    expect(screen.getByText('Đã chọn 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Thêm vào đơn hàng/i })).toHaveTextContent('58.000');

    fireEvent.click(toppingOne);
    expect(screen.getByText('Đã chọn 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Thêm vào đơn hàng/i })).toHaveTextContent('50.000');

    const increaseBtn = screen.getByRole('button', { name: 'Tăng số lượng' });
    const decreaseBtn = screen.getByRole('button', { name: 'Giảm số lượng' });

    expect(decreaseBtn).toBeDisabled();
    fireEvent.click(increaseBtn);
    expect(decreaseBtn).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /Thêm vào đơn hàng/i })).toHaveTextContent('100.000');

    fireEvent.click(decreaseBtn);
    expect(decreaseBtn).toBeDisabled();
    expect(screen.getByRole('button', { name: /Thêm vào đơn hàng/i })).toHaveTextContent('50.000');
  });

  it('submits complete CustomOrderItem with note and prevents duplicate submission', () => {
    const handleAddToCart = jest.fn();
    const handleClose = jest.fn();

    render(
      <ProductDetailModal
        product={mockProduct}
        allToppings={mockToppings}
        isOpen={true}
        onClose={handleClose}
        onAddToCart={handleAddToCart}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Lớn \(L\)/i }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Trân châu hoàng kim/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Tăng số lượng' }));
    fireEvent.change(screen.getByPlaceholderText(/Ít đá/i), {
      target: { value: '  Ít đá, 50% đường  ' },
    });

    const submitButton = screen.getByRole('button', { name: /Thêm vào đơn hàng/i });
    fireEvent.click(submitButton);

    expect(screen.getByText('Đã thêm vào giỏ!')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    fireEvent.click(submitButton);

    act(() => {
      jest.advanceTimersByTime(450);
    });

    expect(handleAddToCart).toHaveBeenCalledTimes(1);
    expect(handleAddToCart).toHaveBeenCalledWith({
      productId: 'prod-01',
      productName: 'Cà Phê Sữa Đá Sài Gòn',
      productImage: mockProduct.imageUrl,
      categoryName: 'Cà phê Việt Nam',
      basePrice: 32000,
      selectedSize: { id: 'size-l', name: 'Lớn (L)', code: 'L', extraPrice: 10000 },
      selectedToppings: [{ id: 'top-1', name: 'Trân châu hoàng kim', price: 8000 }],
      quantity: 2,
      note: 'Ít đá, 50% đường',
      unitPrice: 50000,
      totalPrice: 100000,
    });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('closes modal via close button or Escape key', () => {
    const handleClose = jest.fn();
    render(
      <ProductDetailModal
        product={mockProduct}
        allToppings={mockToppings}
        isOpen={true}
        onClose={handleClose}
        onAddToCart={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});

