'use client';

import React, { useEffect } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  Coffee,
  Home,
  Sparkles,
  X,
} from 'lucide-react';
import { formatCurrency } from '../lib/api';
import {
  formatOrderTimestamp,
  getOrderStatusPresentation,
  getPaymentMethodLabel,
} from '../lib/orderDisplay';
import { ProcessPaymentResponse } from '../types';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  result: ProcessPaymentResponse | null;
  onClose: () => void;
  onViewHistory: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  result,
  onClose,
  onViewHistory,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !result) {
    return null;
  }

  const { order, payment, loyaltyPointsEarned, loyaltyPointsBalance, idempotentReplay } = result;
  const statusPresentation = getOrderStatusPresentation(order.status);

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Xác nhận đặt hàng thành công"
        className="w-full sm:max-w-lg max-h-[92vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-200"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2.5 sm:hidden flex-shrink-0" />

        <div className="px-5 pt-2 sm:pt-5 pb-4 border-b border-stone-100 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#d4e9e2] text-[#006241] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#1e3932]">
                Đặt hàng thành công
              </h2>
              <p className="text-xs text-[#595959]">
                Mời tới quầy lấy nước • BrewLite Express
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng màn hình xác nhận"
            className="p-1.5 rounded-full bg-[#f2f0eb] hover:bg-stone-200 text-stone-500 hover:text-[#1e3932] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="rounded-2xl bg-gradient-to-br from-[#1e3932] to-[#006241] text-white p-5 space-y-3 shadow-lg shadow-[#006241]/20">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#d4e9e2]">
                  Mã đơn hàng
                </p>
                <p className="text-2xl sm:text-3xl font-black tracking-tight mt-0.5">
                  {order.orderNumber}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-white text-[#006241] text-xs font-black">
                {statusPresentation.label}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#d4e9e2] pt-2 border-t border-white/15">
              <Coffee className="w-4 h-4 flex-shrink-0 text-[#cba258]" />
              <span>
                Đơn hàng đang được chuẩn bị ({statusPresentation.label}). Mời tới quầy lấy nước khi hoàn tất!
              </span>
            </div>
          </div>

          {idempotentReplay && (
            <div className="px-3.5 py-2.5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold">
              Giao dịch này đã được xác nhận trước đó (không trừ tiền 2 lần).
            </div>
          )}

          {loyaltyPointsEarned > 0 && (
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#f2f0eb] border border-[#cba258]/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white text-[#cba258] flex items-center justify-center shadow-2xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#1e3932]">
                    Tích lũy điểm thành viên
                  </p>
                  <p className="text-[11px] text-[#595959]">
                    {loyaltyPointsBalance !== null
                      ? `Số dư hiện tại: ${loyaltyPointsBalance} điểm`
                      : 'Điểm thưởng đã được ghi nhận vào tài khoản'}
                  </p>
                </div>
              </div>
              <span className="text-sm font-black text-[#006241] bg-[#d4e9e2] px-3 py-1 rounded-full">
                +{loyaltyPointsEarned} điểm
              </span>
            </div>
          )}

          <div className="rounded-2xl border border-stone-200/80 bg-[#f9f9f9] p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[#595959]">
              <span>Phương thức</span>
              <span className="font-bold text-[#1e3932]">
                {getPaymentMethodLabel(payment.method)}
              </span>
            </div>
            {payment.transactionId && (
              <div className="flex items-center justify-between text-[#595959] gap-2">
                <span>Mã giao dịch</span>
                <span className="font-mono font-semibold text-[#1e3932] truncate">
                  {payment.transactionId}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-[#595959]">
              <span>Thời gian thanh toán</span>
              <span className="font-semibold text-[#1e3932]">
                {formatOrderTimestamp(payment.paidAt ?? order.updatedAt)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#595959]">
              <span>Người nhận</span>
              <span className="font-semibold text-[#1e3932]">
                {order.customerName} • {order.customerPhone}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200/80 p-4 space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#1e3932]">
              Chi tiết món ({order.items.length})
            </h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 text-xs border-b border-stone-100 pb-2 last:border-none last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-[#1e3932]">
                      {item.quantity}x {item.productName} ({item.sizeName})
                    </p>
                    {Array.isArray(item.toppings) && item.toppings.length > 0 && (
                      <p className="text-[11px] text-[#595959]">
                        Topping: {item.toppings.map((topping) => topping.name).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-[#1e3932] flex-shrink-0">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-200 space-y-1 text-xs">
              {order.discountAmount > 0 && (
                <div className="flex items-center justify-between text-[#006241]">
                  <span>Giảm giá ưu đãi</span>
                  <span className="font-bold">-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm font-black text-[#1e3932]">
                <span>Đã thanh toán</span>
                <span className="text-[#006241]">{formatCurrency(order.finalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 border-t border-stone-200 bg-white grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={onViewHistory}
            className="w-full py-3 rounded-full border border-[#006241] text-[#006241] hover:bg-[#d4e9e2]/40 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Xem lịch sử đơn</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-full bg-[#006241] hover:bg-[#00754a] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#006241]/25 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Về trang chủ</span>
          </button>
        </div>
      </div>
    </div>
  );
};

