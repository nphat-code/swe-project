import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorState } from './ErrorState';

describe('ErrorState Component', () => {
  it('renders default error message and triggers onRetry', () => {
    const handleRetry = jest.fn();
    render(<ErrorState onRetry={handleRetry} />);

    expect(screen.getByText('Lỗi kết nối máy chủ')).toBeInTheDocument();
    expect(
      screen.getByText('Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng hoặc thử lại sau.')
    ).toBeInTheDocument();

    const button = screen.getByRole('button', { name: /thử lại kết nối/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('renders custom error message', () => {
    const handleRetry = jest.fn();
    render(
      <ErrorState
        message="Máy chủ bảo trì tạm thời"
        onRetry={handleRetry}
      />
    );

    expect(screen.getByText('Máy chủ bảo trì tạm thời')).toBeInTheDocument();
  });
});
