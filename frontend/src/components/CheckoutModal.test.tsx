import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as api from '../lib/api';
import { useCartStore } from '../store/useCartStore';
import { AuthUser, OrderRecord, PayosCheckoutResponse, ProcessPaymentResponse } from '../types';
import { CheckoutModal } from './CheckoutModal';

jest.mock('../lib/api', () => {
  const actual = jest.requireActual('../lib/api');
  return {
    ...actual,
    createOrder: jest.fn(),
    createPayosPayment: jest.fn(),
    syncPayosPayment: jest.fn(),
    validateVoucherCode: jest.fn(),
  };
});

jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,MOCKQR'),
}));

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
    paymentMethod: 'PAYOS_VIETQR',
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

  const payosSession: PayosCheckoutResponse = {
    orderId: 'order-1',
    orderCode: 551234001,
    amount: 76000,
    description: 'BREWLITE 551234',
    qrCode: '00020101021238570010A000000727',
    checkoutUrl: 'https://pay.payos.vn/web/551234001',
    accountName: 'NGUYEN TAN PHAT',
    accountNumber: '0001715061549',
    bin: '970422',
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

  it('creates order with PAYOS_VIETQR, generates QR, syncs payment, clears cart, and invokes onPaymentSuccess', async () => {
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
        method: 'PAYOS_VIETQR',
        status: 'PAID',
        transactionId: '551234001',
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
    (api.createPayosPayment as jest.Mock).mockResolvedValueOnce(payosSession);
    (api.syncPayosPayment as jest.Mock).mockResolvedValueOnce({
      paid: true,
      payosStatus: 'PAID',
      paymentResult: paidResponse,
    });

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
    expect(screen.getByText(/Chuyển khoản nhanh VietQR/i)).toBeInTheDocument();
    expect(screen.queryByText(/Mô phỏng thanh toán thất bại/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Idempotency-Key:/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Tạo mã QR thanh toán/i }));

    await waitFor(() => {
      expect(api.createOrder).toHaveBeenCalledWith(
        'jwt-token',
        expect.objectContaining({
          paymentMethod: 'PAYOS_VIETQR',
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
      expect(api.createPayosPayment).toHaveBeenCalledWith(
        'jwt-token',
        expect.objectContaining({
          orderId: 'order-1',
          idempotencyKey: expect.any(String),
        })
      );
    });

    expect(await screen.findByText(/NGUYEN TAN PHAT/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Tôi đã chuyển khoản/i }));

    await waitFor(() => {
      expect(onPaymentSuccess).toHaveBeenCalledWith(paidResponse);
    });
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('retries existing order from history via PayOS without recreating order or clearing cart', async () => {
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
        method: 'PAYOS_VIETQR',
        status: 'PAID',
        transactionId: '889900001',
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

    (api.createPayosPayment as jest.Mock).mockResolvedValueOnce({
      ...payosSession,
      orderId: 'history-order-99',
    });
    (api.syncPayosPayment as jest.Mock).mockResolvedValueOnce({
      paid: true,
      payosStatus: 'PAID',
      paymentResult: paidResponse,
    });

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

    expect(await screen.findByText(/NGUYEN TAN PHAT/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Tôi đã chuyển khoản/i }));

    await waitFor(() => {
      expect(onPaymentSuccess).toHaveBeenCalledWith(paidResponse);
    });
    expect(api.createOrder).not.toHaveBeenCalled();
    expect(useCartStore.getState().items).toHaveLength(1);
  });
});
