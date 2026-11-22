import { OrderStatus } from '../types';

export interface OrderStatusPresentation {
  code: OrderStatus;
  label: string;
  badgeClassName: string;
}

const ORDER_STATUS_META: Record<OrderStatus, OrderStatusPresentation> = {
  PENDING: {
    code: 'PENDING',
    label: 'Chờ thanh toán',
    badgeClassName: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  PAYMENT_FAILED: {
    code: 'PAYMENT_FAILED',
    label: 'Thanh toán thất bại',
    badgeClassName: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  PAID: {
    code: 'PAID',
    label: 'Đã thanh toán',
    badgeClassName: 'bg-[#d4e9e2] text-[#006241] border-[#006241]/30',
  },
  PREPARING: {
    code: 'PREPARING',
    label: 'Đang pha chế',
    badgeClassName: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  READY: {
    code: 'READY',
    label: 'Sẵn sàng nhận tại quầy',
    badgeClassName: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  COMPLETED: {
    code: 'COMPLETED',
    label: 'Hoàn tất',
    badgeClassName: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  CANCELLED: {
    code: 'CANCELLED',
    label: 'Đã hủy',
    badgeClassName: 'bg-stone-100 text-stone-600 border-stone-200',
  },
};

export function getOrderStatusPresentation(status: OrderStatus): OrderStatusPresentation {
  return ORDER_STATUS_META[status] ?? ORDER_STATUS_META.PENDING;
}

export function getPaymentMethodLabel(method: string): string {
  const normalized = method.trim().toUpperCase();
  if (normalized === 'PAYOS_VIETQR') {
    return 'Chuyển khoản VietQR';
  }
  if (normalized === 'WALLET' || normalized === 'MOCK_WALLET') {
    return 'Ví điện tử';
  }
  if (normalized === 'CARD') {
    return 'Thẻ ngân hàng';
  }
  if (normalized === 'MOCK_MOMO') {
    return 'Ví MoMo';
  }
  if (normalized === 'MOCK_VNPAY') {
    return 'VNPay';
  }
  return method;
}

export function formatOrderTimestamp(isoString: string): string {
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) {
    return isoString;
  }
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsed);
}

