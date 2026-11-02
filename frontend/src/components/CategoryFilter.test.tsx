import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryFilter } from './CategoryFilter';
import { Category } from '../types';

const mockCategories: Category[] = [
  { id: 'cat-01', name: 'Cà phê Việt Nam', slug: 'ca-phe-viet', displayOrder: 1, _count: { products: 4 } },
  { id: 'cat-02', name: 'Cà phê Pha Máy', slug: 'ca-phe-may', displayOrder: 2, _count: { products: 3 } },
  { id: 'cat-03', name: 'Trà & Trái Cây', slug: 'tra-trai-cay', displayOrder: 3, _count: { products: 3 } },
  { id: 'cat-04', name: 'Đá Xay & Thức Uống Đá', slug: 'da-xay', displayOrder: 4, _count: { products: 2 } },
];

describe('CategoryFilter Component', () => {
  it('renders all 4 categories and matches total product count accurately', () => {
    const handleSelect = jest.fn();
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory="all"
        onSelectCategory={handleSelect}
        totalProductsCount={12}
      />
    );

    expect(screen.getByText('Tất cả món')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();

    expect(screen.getByText('Cà phê Việt Nam')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();

    expect(screen.getByText('Cà phê Pha Máy')).toBeInTheDocument();
    expect(screen.getByText('Trà & Trái Cây')).toBeInTheDocument();
    expect(screen.getAllByText('3')).toHaveLength(2);

    expect(screen.getByText('Đá Xay & Thức Uống Đá')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('triggers onSelectCategory when clicking a specific category pill', () => {
    const handleSelect = jest.fn();
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory="all"
        onSelectCategory={handleSelect}
        totalProductsCount={12}
      />
    );

    const categoryButton = screen.getByRole('button', { name: /cà phê việt nam/i });
    fireEvent.click(categoryButton);

    expect(handleSelect).toHaveBeenCalledWith('ca-phe-viet');
  });

  it('triggers onSelectCategory with "all" when clicking Tat ca mon from another category', () => {
    const handleSelect = jest.fn();
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory="ca-phe-viet"
        onSelectCategory={handleSelect}
        totalProductsCount={12}
      />
    );

    const allButton = screen.getByRole('button', { name: /tất cả món/i });
    fireEvent.click(allButton);

    expect(handleSelect).toHaveBeenCalledWith('all');
  });

  it('applies active highlighted styling to selected category pill', () => {
    const handleSelect = jest.fn();
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory="ca-phe-may"
        onSelectCategory={handleSelect}
        totalProductsCount={12}
      />
    );

    const activePill = screen.getByRole('button', { name: /cà phê pha máy/i });
    const inactivePill = screen.getByRole('button', { name: /cà phê việt nam/i });

    expect(activePill.className).toContain('bg-[#006241]');
    expect(inactivePill.className).toContain('bg-[#f2f0eb]');
  });

  it('does not render badge if category product count is zero', () => {
    const categoriesWithZero: Category[] = [
      { id: 'cat-empty', name: 'Bánh Ngọt Mới', slug: 'banh-ngot', displayOrder: 5, _count: { products: 0 } },
    ];
    render(
      <CategoryFilter
        categories={categoriesWithZero}
        selectedCategory="all"
        onSelectCategory={jest.fn()}
        totalProductsCount={12}
      />
    );

    expect(screen.getByText('Bánh Ngọt Mới')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});
