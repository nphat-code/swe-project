import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as api from '../lib/api';
import { useCartStore } from '../store/useCartStore';
import { AuthUser, OrderRecord, ProcessPaymentResponse } from '../types';
import { CheckoutModal } from './CheckoutModal';

jest.mock('../lib/api', () => {
  const actual = jest.requireActual('../lib/api');
  return {
    ...actual,
    createOrder: jest.fn(),
    processPayment: jest.fn(),
    validateVoucherCode: jest.fn(),
  };
});

describe('CheckoutModal', () => {
  const user: AuthUser = {
    id: 'user-1',
    email: 'customer@brewlite.vn',
    fullName: 'Nguyễn Minh Khách',
    phone: '0901234567',
    role: 'CUSTOMER',
    loyaltyPoints: 10,
    createdAt: '2026-11-01T00:00:00.000Z',
  };

  const pendingOrder: OrderRecord = {
    id: 'order-1',
    orderNumber: '#551234',
    userId: 'user-1',
    customerName: 'Nguyễn Minh Khách',
    customerPhone: '0901234567',
    note: null,
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    paymentMethod: 'CARD',
    totalAmount: 76000,
    discountAmount: 0,
    finalAmount: 76000,
    items: [
      {
        id: 'item-1',
        orderId: 'order-1',
        productId: 'prod-1',
        productName: 'Americano Đá Tươi Mát',
        sizeName: 'Nhỏ (S)',
        unitPrice: 38000,
        quantity: 2,
        subtotal: 76000,
        toppings: [],
        createdAt: '2026-11-09T10:00:00.000Z',
      },
    ],
    createdAt: '2026-11-09T10:00:00.000Z',
    updatedAt: '2026-11-09T10:00:00.000Z',
  };

  beforeEach(() => {
    localStorage.clear();
    useCartStore.getState().clearCart();
    useCartStore.getState().addItem({
      productId: 'prod-1',
      productName: 'Americano Đá Tươi Mát',
      productImage: 'https://images.unsplash.com/photo-1551030173-122aabc4489c',
      basePrice: 38000,
      selectedSize: { id: 'size-s', name: 'Nhỏ (S)', code: 'S', extraPrice: 0 },
      selectedToppings: [],
      quantity: 2,
      unitPrice: 38000,
      totalPrice: 76000,
    });
    jest.clearAllMocks();
  });

  it('creates order, processes payment with Idempotency-Key, clears cart, and invokes onPaymentSuccess', async () => {
    const onClose = jest.fn();
    const onPaymentSuccess = jest.fn();
    const paidResponse: ProcessPaymentResponse = {
      success: true,
      idempotentReplay: false,
      message: 'Thanh toán thành công',
      payment: {
        id: 'pay-1',
        orderId: 'order-1',
        idempotencyKey: 'key-1',
        amount: 76000,
        method: 'CARD',
        status: 'PAID',
        transactionId: 'TXN-1001',
        paidAt: '2026-11-09T10:01:00.000Z',
        createdAt: '2026-11-09T10:01:00.000Z',
      },
      order: {
        ...pendingOrder,
        status: 'PAID',
        paymentStatus: 'PAID',
      },
      loyaltyPointsEarned: 7,
      loyaltyPointsBalance: 17,
    };

    (api.createOrder as jest.Mock).mockResolvedValueOnce(pendingOrder);
    (api.processPayment as jest.Mock).mockResolvedValueOnce(paidResponse);

    render(
      <CheckoutModal
        isOpen={true}
        user={user}
        accessToken="jwt-token"
        onClose={onClose}
        onPaymentSuccess={onPaymentSuccess}
      />
    );

    expect(screen.getByText(/Americano Đá Tươi Mát/i)).toBeInTheDocument();
    expect(screen.getByText(/Idempotency-Key:/i)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Thẻ ngân hàng/i));
    fireEvent.click(screen.getByRole('button', { name: /Xác nhận trả/i }));

    await waitFor(() => {
      expect(api.createOrder).toHaveBeenCalledWith(
        'jwt-token',
        expect.objectContaining({
          paymentMethod: 'CARD',
          items: [
            expect.objectContaining({
              productId: 'prod-1',
              sizeId: 'size-s',
              sizeCode: 'S',
              quantity: 2,
            }),
          ],
        })
      );
    });

    await waitFor(() => {
      expect(api.processPayment).toHaveBeenCalledWith(
        'jwt-token',
        expect.objectContaining({
          orderId: 'order-1',
          method: 'CARD',
          simulateFailure: false,
          idempotencyKey: expect.any(String),
        })
      );
    });

    expect(onPaymentSuccess).toHaveBeenCalledWith(paidResponse);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('preserves cart on PAYMENT_FAILED and reuses the same order when retrying', async () => {
    const onClose = jest.fn();
    const onPaymentSuccess = jest.fn();
    const onPaymentFailed = jest.fn();

    const failedOrder: OrderRecord = {
      ...pendingOrder,
      status: 'PAYMENT_FAILED',
      paymentStatus: 'FAILED',
      paymentMethod: 'WALLET',
    };

    const failedResponse: ProcessPaymentResponse = {
      success: false,
      idempotentReplay: false,
      message: 'Thanh toán thất bại',
      payment: {
        id: 'pay-fail',
        orderId: 'order-1',
        idempotencyKey: 'key-fail',
        amount: 76000,
        method: 'WALLET',
        status: 'FAILED',
        transactionId: null,
        paidAt: null,
        createdAt: '2026-11-09T10:01:00.000Z',
      },
      order: failedOrder,
      loyaltyPointsEarned: 0,
      loyaltyPointsBalance: 10,
    };

    const paidResponse: ProcessPaymentResponse = {
      success: true,
      idempotentReplay: false,
      message: 'Thanh toán thành công',
      payment: {
        id: 'pay-ok',
        orderId: 'order-1',
        idempotencyKey: 'key-ok',
        amount: 76000,
        method: 'WALLET',
        status: 'PAID',
        transactionId: 'TXN-OK',
        paidAt: '2026-11-09T10:02:00.000Z',
        createdAt: '2026-11-09T10:02:00.000Z',
      },
      order: {
        ...pendingOrder,
        status: 'PAID',
        paymentStatus: 'PAID',
      },
      loyaltyPointsEarned: 7,
      loyaltyPointsBalance: 17,
    };

    (api.createOrder as jest.Mock).mockResolvedValueOnce(pendingOrder);
    (api.processPayment as jest.Mock)
      .mockResolvedValueOnce(failedResponse)
      .mockResolvedValueOnce(paidResponse);

    render(
      <CheckoutModal
        isOpen={true}
        user={user}
        accessToken="jwt-token"
        onClose={onClose}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentFailed={onPaymentFailed}
      />
    );

    const failToggle = screen.getByLabelText(/Mô phỏng thanh toán thất bại/i);
    fireEvent.click(failToggle);
    fireEvent.click(screen.getByRole('button', { name: /Xác nhận trả/i }));

    expect(
      await screen.findByText(/Thanh toán cho đơn #551234 không thành công \(PAYMENT_FAILED\)/i)
    ).toBeInTheDocument();
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(onPaymentFailed).toHaveBeenCalledWith(failedOrder);

    fireEvent.click(failToggle);
    fireEvent.click(screen.getByRole('button', { name: /Thử thanh toán lại/i }));

    await waitFor(() => {
      expect(onPaymentSuccess).toHaveBeenCalledWith(paidResponse);
    });
    expect(api.createOrder).toHaveBeenCalledTimes(1);
    expect(api.processPayment).toHaveBeenCalledTimes(2);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('retries existing order from history without recreating order or clearing cart', async () => {
    const onClose = jest.fn();
    const onPaymentSuccess = jest.fn();
    const retryOrder: OrderRecord = {
      ...pendingOrder,
      id: 'history-order-99',
      orderNumber: '#889900',
      status: 'PAYMENT_FAILED',
      paymentStatus: 'FAILED',
    };

    const paidResponse: ProcessPaymentResponse = {
      success: true,
      idempotentReplay: false,
      message: 'Thanh toán thành công',
      payment: {
        id: 'pay-99',
        orderId: 'history-order-99',
        idempotencyKey: 'retry-key',
        amount: 76000,
        method: 'WALLET',
        status: 'PAID',
        transactionId: 'TXN-99',
        paidAt: '2026-11-09T10:05:00.000Z',
        createdAt: '2026-11-09T10:05:00.000Z',
      },
      order: {
        ...retryOrder,
        status: 'PAID',
        paymentStatus: 'PAID',
      },
      loyaltyPointsEarned: 7,
      loyaltyPointsBalance: 17,
    };

    (api.processPayment as jest.Mock).mockResolvedValueOnce(paidResponse);

    render(
      <CheckoutModal
        isOpen={true}
        user={user}
        accessToken="jwt-token"
        retryOrder={retryOrder}
        onClose={onClose}
        onPaymentSuccess={onPaymentSuccess}
      />
    );

    expect(screen.getByText(/Thanh toán đơn #889900/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Thử thanh toán lại/i }));

    await waitFor(() => {
      expect(onPaymentSuccess).toHaveBeenCalledWith(paidResponse);
    });
    expect(api.createOrder).not.toHaveBeenCalled();
    expect(useCartStore.getState().items).toHaveLength(1);
  });
});

