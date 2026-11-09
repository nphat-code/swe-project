import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as api from '../lib/api';
import { OrderRecord } from '../types';
import { OrderHistoryModal } from './OrderHistoryModal';

jest.mock('../lib/api', () => {
  const actual = jest.requireActual('../lib/api');
  return {
    ...actual,
    fetchMyOrders: jest.fn(),
    updateOrderStatus: jest.fn(),
  };
});

describe('OrderHistoryModal', () => {
  const failedOrder: OrderRecord = {
    id: 'order-fail',
    orderNumber: '#400101',
    userId: 'user-1',
    customerName: 'Nguyễn Minh Khách',
    customerPhone: '0901234567',
    note: null,
    status: 'PAYMENT_FAILED',
    paymentStatus: 'FAILED',
    paymentMethod: 'CARD',
    totalAmount: 45000,
    discountAmount: 0,
    finalAmount: 45000,
    items: [
      {
        id: 'item-1',
        orderId: 'order-fail',
        productId: 'prod-1',
        productName: 'Trà Đào Cam Sả',
        sizeName: 'Lớn (L)',
        unitPrice: 45000,
        quantity: 1,
        subtotal: 45000,
        toppings: [],
        createdAt: '2026-11-09T09:00:00.000Z',
      },
    ],
    createdAt: '2026-11-09T09:00:00.000Z',
    updatedAt: '2026-11-09T09:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows empty state when customer has no orders yet', async () => {
    (api.fetchMyOrders as jest.Mock).mockResolvedValueOnce([]);
    const onClose = jest.fn();

    render(
      <OrderHistoryModal
        isOpen={true}
        accessToken="jwt-token"
        onClose={onClose}
        onRetryPayment={jest.fn()}
      />
    );

    expect(await screen.findByText('Bạn chưa có đơn hàng nào')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Khám phá thực đơn' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders order list, triggers retry payment on PAYMENT_FAILED, and supports cancelling', async () => {
    (api.fetchMyOrders as jest.Mock).mockResolvedValueOnce([failedOrder]);
    (api.updateOrderStatus as jest.Mock).mockResolvedValueOnce({
      ...failedOrder,
      status: 'CANCELLED',
    });

    const onRetryPayment = jest.fn();
    const onOrderUpdated = jest.fn();

    render(
      <OrderHistoryModal
        isOpen={true}
        accessToken="jwt-token"
        onClose={jest.fn()}
        onRetryPayment={onRetryPayment}
        onOrderUpdated={onOrderUpdated}
      />
    );

    expect(await screen.findByText('#400101')).toBeInTheDocument();
    expect(screen.getByText(/PAYMENT_FAILED/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Thanh toán lại/i }));
    expect(onRetryPayment).toHaveBeenCalledWith(failedOrder);

    fireEvent.click(screen.getByRole('button', { name: /Hủy đơn/i }));

    await waitFor(() => {
      expect(api.updateOrderStatus).toHaveBeenCalledWith('jwt-token', 'order-fail', 'CANCELLED');
    });
    expect(await screen.findByText(/CANCELLED/i)).toBeInTheDocument();
    expect(onOrderUpdated).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'order-fail', status: 'CANCELLED' })
    );
  });
});

