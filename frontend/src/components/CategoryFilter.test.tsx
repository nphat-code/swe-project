import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryFilter } from './CategoryFilter';
import { Category } from '../types';

const mockCategories: Category[] = [
  { id: 'cat-01', name: 'Cà phê Việt Nam', slug: 'ca-phe-viet', displayOrder: 1, _count: { products: 4 } },
  { id: 'cat-02', name: 'Cà phê Pha Máy', slug: 'ca-phe-may', displayOrder: 2, _count: { products: 3 } },
];

describe('CategoryFilter Component', () => {
  it('renders all category pills and total products count', () => {
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
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('triggers onSelectCategory when a category is clicked', () => {
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
});
