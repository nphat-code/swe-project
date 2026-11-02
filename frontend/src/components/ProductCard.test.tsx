import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from './ProductCard';
import { Product } from '../types';

const mockProduct: Product = {
  id: 'prod-01',
  name: 'Cà Phê Sữa Đá Sài Gòn',
  slug: 'ca-phe-sua-da-sai-gon',
  description: 'Cà phê phin truyền thống thơm ngon đậm đà',
  basePrice: 32000,
  imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd',
  categoryId: 'cat-01',
  isAvailable: true,
  category: {
    id: 'cat-01',
    name: 'Cà phê Việt Nam',
    slug: 'ca-phe-viet',
    displayOrder: 1,
  },
  sizes: [
    { id: 'size-01', name: 'Nhỏ (S)', code: 'S', extraPrice: 0 },
    { id: 'size-02', name: 'Vừa (M)', code: 'M', extraPrice: 6000 },
  ],
};

describe('ProductCard Component', () => {
  it('renders complete product info including image, name, description, category badge, and formatted price', () => {
    const handleSelect = jest.fn();
    render(<ProductCard product={mockProduct} onSelectProduct={handleSelect} />);

    const image = screen.getByAltText('Cà Phê Sữa Đá Sài Gòn');
    expect(image).toBeInTheDocument();

    expect(screen.getByText('Cà Phê Sữa Đá Sài Gòn')).toBeInTheDocument();
    expect(screen.getByText('Cà phê phin truyền thống thơm ngon đậm đà')).toBeInTheDocument();
    expect(screen.getByText('Cà phê Việt Nam')).toBeInTheDocument();
    expect(screen.getByText(/32\.000/)).toBeInTheDocument();
  });

  it('triggers onSelectProduct when clicking the select button and includes proper aria-label', () => {
    const handleSelect = jest.fn();
    render(<ProductCard product={mockProduct} onSelectProduct={handleSelect} />);

    const button = screen.getByRole('button', { name: /chọn món cà phê sữa đá sài gòn/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');

    fireEvent.click(button);
    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(mockProduct);
  });

  it('triggers onSelectProduct when clicking the card container', () => {
    const handleSelect = jest.fn();
    render(<ProductCard product={mockProduct} onSelectProduct={handleSelect} />);

    const cardHeading = screen.getByText('Cà Phê Sữa Đá Sài Gòn');
    fireEvent.click(cardHeading);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(mockProduct);
  });

  it('renders correctly without category badge when category is undefined', () => {
    const productWithoutCategory: Product = {
      ...mockProduct,
      category: undefined,
    };
    render(<ProductCard product={productWithoutCategory} onSelectProduct={jest.fn()} />);

    expect(screen.getByText('Cà Phê Sữa Đá Sài Gòn')).toBeInTheDocument();
    expect(screen.queryByText('Cà phê Việt Nam')).not.toBeInTheDocument();
  });
});
