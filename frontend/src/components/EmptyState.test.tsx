import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState Component', () => {
  it('renders default title, message, and does not render reset button when onReset is omitted', () => {
    render(<EmptyState />);

    expect(screen.getByText('Chưa có món phù hợp')).toBeInTheDocument();
    expect(screen.getByText('Không tìm thấy món nước nào phù hợp.')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders custom search empty message and triggers onReset when clicked', () => {
    const handleReset = jest.fn();
    render(
      <EmptyState
        message="Không có đồ uống nào khớp với từ khóa abac. Hãy thử tìm món khác!"
        onReset={handleReset}
      />
    );

    expect(
      screen.getByText('Không có đồ uống nào khớp với từ khóa abac. Hãy thử tìm món khác!')
    ).toBeInTheDocument();

    const button = screen.getByRole('button', { name: /xem tất cả món/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });

  it('renders category empty message and handles reset callback correctly', () => {
    const handleReset = jest.fn();
    render(
      <EmptyState
        message="Danh mục này hiện chưa có món nào sẵn sàng phục vụ."
        onReset={handleReset}
      />
    );

    expect(screen.getByText('Danh mục này hiện chưa có món nào sẵn sàng phục vụ.')).toBeInTheDocument();

    const button = screen.getByRole('button', { name: /xem tất cả món/i });
    expect(button).toHaveAttribute('type', 'button');

    fireEvent.click(button);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
