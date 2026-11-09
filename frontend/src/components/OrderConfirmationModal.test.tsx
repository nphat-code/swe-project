import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ProcessPaymentResponse } from '../types';
import { OrderConfirmationModal } from './OrderConfirmationModal';

describe('OrderConfirmationModal', () => {
  const sampleResult: ProcessPaymentResponse = {
    success: true,
    idempotentReplay: false,
    message: 'Thanh toán thành công',
    payment: {
      id: 'pay-1',
      orderId: 'order-1',
      idempotencyKey: 'idem-1042',
      amount: 123000,
      method: 'WALLET',
      status: 'PAID',
      transactionId: 'TXN-1042-OK',
      paidAt: '2026-11-09T10:15:00.000Z',
      createdAt: '2026-11-09T10:15:00.000Z',
    },
    order: {
      id: 'order-1',
      orderNumber: '#104299',
      userId: 'user-1',
      customerName: 'Nguyễn Minh Khách',
      customerPhone: '0901234567',
      note: null,
      status: 'PAID',
      paymentStatus: 'PAID',
      paymentMethod: 'WALLET',
      totalAmount: 150000,
      discountAmount: 27000,
      finalAmount: 123000,
      items: [
        {
          id: 'item-1',
          orderId: 'order-1',
          productId: 'prod-1',
          productName: 'Cappuccino Nóng',
          sizeName: 'Vừa (M)',
          unitPrice: 45000,
          quantity: 1,
          subtotal: 45000,
          toppings: [{ name: 'Kem phô mai', price: 10000 }],
          createdAt: '2026-11-09T10:14:00.000Z',
        },
      ],
      createdAt: '2026-11-09T10:14:00.000Z',
      updatedAt: '2026-11-09T10:15:00.000Z',
    },
    loyaltyPointsEarned: 12,
    loyaltyPointsBalance: 37,
  };

  it('displays dynamic order number, PAID status, pickup instruction, loyalty points, and handles navigation actions', () => {
    const onClose = jest.fn();
    const onViewHistory = jest.fn();

    render(
      <OrderConfirmationModal
        isOpen={true}
        result={sampleResult}
        onClose={onClose}
        onViewHistory={onViewHistory}
      />
    );

    expect(screen.getByText('Đặt hàng thành công')).toBeInTheDocument();
    expect(screen.getByText('#104299')).toBeInTheDocument();
    expect(screen.getByText('Trạng thái: PAID')).toBeInTheDocument();
    expect(screen.getAllByText(/Mời tới quầy lấy nước/i).length).toBeGreaterThan(0);
    expect(screen.getByText('+12 điểm')).toBeInTheDocument();
    expect(screen.getByText('Số dư hiện tại: 37 điểm')).toBeInTheDocument();
    expect(screen.getByText('TXN-1042-OK')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Xem lịch sử đơn/i }));
    expect(onViewHistory).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Về trang chủ/i }));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

