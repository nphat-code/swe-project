import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as api from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { AuthModal } from './AuthModal';

jest.mock('../lib/api', () => {
  const actual = jest.requireActual('../lib/api');
  return {
    ...actual,
    loginUser: jest.fn(),
    registerUser: jest.fn(),
  };
});

describe('AuthModal', () => {
  const onClose = jest.fn();
  const onSuccess = jest.fn();

  const mockAuthResponse = {
    accessToken: 'jwt-token-xyz',
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

  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().logout();
    jest.clearAllMocks();
  });

  it('logs in user with email and password into Zustand store', async () => {
    (api.loginUser as jest.Mock).mockResolvedValue(mockAuthResponse);

    render(<AuthModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'customer@brewlite.vn' },
    });
    fireEvent.change(screen.getByLabelText('Mật khẩu'), {
      target: { value: 'BrewLite@2026' },
    });
    expect(screen.queryByRole('button', { name: /Điền nhanh tài khoản mẫu/i })).not.toBeInTheDocument();

    const submitButtons = screen.getAllByRole('button', { name: 'Đăng nhập' });
    fireEvent.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(api.loginUser).toHaveBeenCalledWith({
        email: 'customer@brewlite.vn',
        password: 'BrewLite@2026',
      });
    });

    expect(useAuthStore.getState().accessToken).toBe('jwt-token-xyz');
    expect(onSuccess).toHaveBeenCalledWith(mockAuthResponse.user);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('switches to register tab, validates fields, and surfaces backend error messages', async () => {
    (api.registerUser as jest.Mock).mockRejectedValue(
      new Error('Email đã được sử dụng để đăng ký tài khoản')
    );

    render(<AuthModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    fireEvent.click(screen.getByRole('button', { name: 'Đăng ký' }));

    fireEvent.change(screen.getByLabelText('Họ và tên'), {
      target: { value: 'Nguyễn Văn An' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'customer@brewlite.vn' },
    });
    fireEvent.change(screen.getByLabelText('Mật khẩu'), {
      target: { value: '123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Mật khẩu phải có ít nhất 6 ký tự'
    );
    expect(api.registerUser).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Mật khẩu'), {
      target: { value: 'BrewLite@2026' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Email đã được sử dụng để đăng ký tài khoản'
      );
    });
    expect(onClose).not.toHaveBeenCalled();
  });
});
