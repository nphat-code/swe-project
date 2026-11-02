import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState Component', () => {
  it('renders default message when no props provided', () => {
    render(<EmptyState />);
    expect(screen.getByText('Chưa có món phù hợp')).toBeInTheDocument();
    expect(screen.getByText('Không tìm thấy món nước nào phù hợp.')).toBeInTheDocument();
  });

  it('renders custom message and triggers onReset callback', () => {
    const handleReset = jest.fn();
    render(
      <EmptyState
        message="Không có đồ uống nào khớp với từ khóa abac."
        onReset={handleReset}
      />
    );

    expect(screen.getByText('Không có đồ uống nào khớp với từ khóa abac.')).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /xem tất cả món/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
