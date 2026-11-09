'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CreditCard,
  KeyRound,
  Loader2,
  ShieldCheck,
  Sparkles,
  Tag,
  Wallet,
  X,
} from 'lucide-react';
import {
  createOrder,
  formatCurrency,
  generateIdempotencyKey,
  processPayment,
  validateVoucherCode,
} from '../lib/api';
import { calculateCartTotals, useCartStore } from '../store/useCartStore';
import {
  AuthUser,
  CreateOrderPayload,
  OrderRecord,
  PaymentMethod,
  ProcessPaymentResponse,
} from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  user: AuthUser;
  accessToken: string;
  retryOrder?: OrderRecord | null;
  onClose: () => void;
  onPaymentSuccess: (result: ProcessPaymentResponse) => void;
  onPaymentFailed?: (order: OrderRecord) => void;
}

const PHONE_REGEX = /^[0-9+\-\s]{8,15}$/;
const QUICK_VOUCHERS = ['BREWLITEFIRST', 'COFFEELOVER'] as const;

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  user,
  accessToken,
  retryOrder = null,
  onClose,
  onPaymentSuccess,
  onPaymentFailed,
}) => {
  const items = useCartStore((state) => state.items);
  const appliedVoucher = useCartStore((state) => state.appliedVoucher);
  const applyVoucher = useCartStore((state) => state.applyVoucher);
  const clearVoucher = useCartStore((state) => state.clearVoucher);
  const clearCart = useCartStore((state) => state.clearCart);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    retryOrder?.paymentMethod === 'CARD' ? 'CARD' : 'WALLET'
  );
  const [simulateFailure, setSimulateFailure] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>(
    retryOrder?.customerName ?? user.fullName
  );
  const [customerPhone, setCustomerPhone] = useState<string>(
    retryOrder?.customerPhone ?? user.phone ?? ''
  );
  const [orderNote, setOrderNote] = useState<string>(retryOrder?.note ?? '');
  const [voucherInput, setVoucherInput] = useState<string>('');
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState<boolean>(false);
  const [activeOrder, setActiveOrder] = useState<OrderRecord | null>(retryOrder);
  const [failedOrder, setFailedOrder] = useState<OrderRecord | null>(
    retryOrder?.status === 'PAYMENT_FAILED' ? retryOrder : null
  );
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => generateIdempotencyKey());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cartTotals = useMemo(
    () => calculateCartTotals(items, appliedVoucher),
    [items, appliedVoucher]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) {
    return null;
  }

  const displaySubtotal = activeOrder ? activeOrder.totalAmount : cartTotals.subtotal;
  const displayDiscount = activeOrder ? activeOrder.discountAmount : cartTotals.discountAmount;
  const displayFinalAmount = activeOrder ? activeOrder.finalAmount : cartTotals.finalAmount;
  const earnedPointsPreview = Math.floor(displayFinalAmount / 10000);
  const isLockedOrder = Boolean(activeOrder);

  const handleApplyVoucher = async (rawCode: string) => {
    setVoucherError(null);
    setIsApplyingVoucher(true);
    try {
      const voucher = await validateVoucherCode(rawCode, cartTotals.subtotal);
      applyVoucher(voucher);
      setVoucherInput('');
    } catch (error) {
      setVoucherError(
        error instanceof Error ? error.message : 'Không thể áp dụng mã giảm giá'
      );
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleConfirmPayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setErrorMessage(null);
    const trimmedPhone = customerPhone.trim();
    if (!isLockedOrder && trimmedPhone.length > 0 && !PHONE_REGEX.test(trimmedPhone)) {
      setErrorMessage('Số điện thoại không hợp lệ (8-15 chữ số)');
      return;
    }

    if (!activeOrder && items.length === 0) {
      setErrorMessage('Giỏ hàng hiện đang trống, vui lòng chọn đồ uống trước khi thanh toán');
      return;
    }

    setIsSubmitting(true);
    try {
      let targetOrder = activeOrder;
      if (!targetOrder) {
        const orderPayload: CreateOrderPayload = {
          items: items.map((item) => ({
            productId: item.productId,
            sizeId:
              item.selectedSize.id && item.selectedSize.id !== 'default'
                ? item.selectedSize.id
                : undefined,
            sizeCode: item.selectedSize.code || item.selectedSize.sizeCode,
            toppingIds: item.selectedToppings.map((topping) => topping.id),
            quantity: item.quantity,
            note: item.note?.trim() || undefined,
          })),
          voucherCode:
            appliedVoucher && cartTotals.voucherEligible ? appliedVoucher.code : undefined,
          customerName: customerName.trim() || user.fullName,
          customerPhone: trimmedPhone || undefined,
          paymentMethod,
          note: orderNote.trim() || undefined,
        };
        targetOrder = await createOrder(accessToken, orderPayload);
        setActiveOrder(targetOrder);
      }

      const paymentResult = await processPayment(accessToken, {
        orderId: targetOrder.id,
        method: paymentMethod,
        idempotencyKey,
        simulateFailure,
      });

      if (paymentResult.success) {
        if (!retryOrder) {
          clearCart();
        }
        onPaymentSuccess(paymentResult);
        return;
      }

      setActiveOrder(paymentResult.order);
      setFailedOrder(paymentResult.order);
      setIdempotencyKey(generateIdempotencyKey());
      setErrorMessage(
        `Thanh toán cho đơn ${paymentResult.order.orderNumber} không thành công (${paymentResult.order.status}). Giỏ hàng của bạn vẫn được giữ nguyên, hãy tắt chế độ lỗi và thử thanh toán lại.`
      );
      onPaymentFailed?.(paymentResult.order);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Đã xảy ra lỗi khi thanh toán, vui lòng thử lại'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Thanh toán đơn hàng"
        className="w-full sm:max-w-lg max-h-[92vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-200"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2.5 sm:hidden flex-shrink-0" />

        <div className="px-5 pt-2 sm:pt-5 pb-4 border-b border-stone-200/80 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#d4e9e2] text-[#006241] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#1e3932]">
                {activeOrder ? `Thanh toán đơn ${activeOrder.orderNumber}` : 'Thanh toán không tiền mặt'}
              </h2>
              <p className="text-xs text-[#595959]">
                Xác nhận nhanh tại quầy • Bảo vệ Idempotency-Key
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Đóng cửa sổ thanh toán"
            className="p-1.5 rounded-full bg-[#f2f0eb] hover:bg-stone-200 disabled:opacity-45 text-stone-500 hover:text-[#1e3932] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirmPayment} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-5 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {errorMessage && (
              <div
                role="alert"
                className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold leading-relaxed"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {failedOrder && (
              <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                <span>Trạng thái đơn {failedOrder.orderNumber} hiện tại:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-black">
                  {failedOrder.status}
                </span>
              </div>
            )}

            <div className="rounded-2xl border border-stone-200/80 bg-[#f9f9f9] p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1e3932]">
                  Tóm tắt đơn hàng
                </h3>
                <span className="text-xs font-bold text-[#006241]">
                  {activeOrder
                    ? `${activeOrder.items.reduce((sum, item) => sum + item.quantity, 0)} ly`
                    : `${cartTotals.totalItems} ly`}
                </span>
              </div>

              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {activeOrder
                  ? activeOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-3 text-xs border-b border-stone-200/60 pb-1.5 last:border-none last:pb-0"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-[#1e3932] truncate">
                            {item.quantity}x {item.productName} ({item.sizeName})
                          </p>
                          {Array.isArray(item.toppings) && item.toppings.length > 0 && (
                            <p className="text-[11px] text-[#595959] truncate">
                              + {item.toppings.map((topping) => topping.name).join(', ')}
                            </p>
                          )}
                        </div>
                        <span className="font-bold text-[#1e3932] flex-shrink-0">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                    ))
                  : items.map((item) => (
                      <div
                        key={item.cartItemId}
                        className="flex items-start justify-between gap-3 text-xs border-b border-stone-200/60 pb-1.5 last:border-none last:pb-0"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-[#1e3932] truncate">
                            {item.quantity}x {item.productName} ({item.selectedSize.name})
                          </p>
                          {item.selectedToppings.length > 0 && (
                            <p className="text-[11px] text-[#595959] truncate">
                              + {item.selectedToppings.map((topping) => topping.name).join(', ')}
                            </p>
                          )}
                        </div>
                        <span className="font-bold text-[#1e3932] flex-shrink-0">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    ))}
              </div>
            </div>

            {!isLockedOrder && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1e3932]">
                  <Tag className="w-3.5 h-3.5 text-[#006241]" />
                  <span>Mã giảm giá</span>
                </div>

                {appliedVoucher ? (
                  <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-[#d4e9e2]/55 border border-[#006241]/30">
                    <div className="min-w-0">
                      <span className="text-xs font-black text-[#006241] block">
                        {appliedVoucher.code} (-{appliedVoucher.discountPercent}%)
                      </span>
                      <span className="text-[11px] text-[#1e3932] line-clamp-1">
                        {appliedVoucher.description}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        clearVoucher();
                        setVoucherError(null);
                      }}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2.5 py-1 rounded-full bg-white border border-rose-200 flex-shrink-0"
                    >
                      Bỏ mã
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherInput}
                        onChange={(event) => {
                          setVoucherInput(event.target.value);
                          if (voucherError) setVoucherError(null);
                        }}
                        placeholder="Nhập mã (BREWLITEFIRST / COFFEELOVER)"
                        aria-label="Mã giảm giá thanh toán"
                        className="flex-1 min-w-0 px-3.5 py-2 rounded-xl bg-[#f9f9f9] border border-stone-200 focus:border-[#006241] focus:bg-white text-xs text-[#212121] placeholder-stone-400 outline-none uppercase"
                      />
                      <button
                        type="button"
                        disabled={isApplyingVoucher || voucherInput.trim().length === 0}
                        onClick={() => void handleApplyVoucher(voucherInput)}
                        className="px-4 py-2 rounded-xl bg-[#1e3932] hover:bg-[#006241] disabled:opacity-45 text-white font-bold text-xs transition-colors flex-shrink-0"
                      >
                        {isApplyingVoucher ? 'Đang kiểm...' : 'Áp dụng'}
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-[#595959]">Áp nhanh:</span>
                      {QUICK_VOUCHERS.map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => void handleApplyVoucher(code)}
                          className="text-[11px] font-bold text-[#006241] bg-[#d4e9e2]/60 hover:bg-[#d4e9e2] px-2.5 py-0.5 rounded-full transition-colors"
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                    {voucherError && (
                      <p role="alert" className="text-[11px] font-semibold text-rose-600">
                        {voucherError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {!isLockedOrder && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="checkout-name" className="block text-xs font-bold text-[#1e3932]">
                    Người nhận tại quầy
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Tên khách hàng"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#f9f9f9] border border-stone-200 focus:border-[#006241] focus:bg-white text-xs sm:text-sm text-[#212121] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="checkout-phone" className="block text-xs font-bold text-[#1e3932]">
                    Số điện thoại
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    placeholder="0901234567"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#f9f9f9] border border-stone-200 focus:border-[#006241] focus:bg-white text-xs sm:text-sm text-[#212121] outline-none"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="checkout-note" className="block text-xs font-bold text-[#1e3932]">
                    Ghi chú cho Barista <span className="text-[#595959] font-normal">(tùy chọn)</span>
                  </label>
                  <input
                    id="checkout-note"
                    type="text"
                    maxLength={250}
                    value={orderNote}
                    onChange={(event) => setOrderNote(event.target.value)}
                    placeholder="Ví dụ: Lấy sau 10 phút, đựng riêng đá..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#f9f9f9] border border-stone-200 focus:border-[#006241] focus:bg-white text-xs sm:text-sm text-[#212121] outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              <p className="text-xs font-bold text-[#1e3932]">
                Phương thức thanh toán (Không dùng tiền mặt)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'WALLET'
                      ? 'border-[#006241] bg-[#d4e9e2]/35'
                      : 'border-stone-200 bg-white hover:border-[#006241]/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="WALLET"
                    checked={paymentMethod === 'WALLET'}
                    onChange={() => setPaymentMethod('WALLET')}
                    className="sr-only"
                  />
                  <div className="w-9 h-9 rounded-full bg-[#d4e9e2] text-[#006241] flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs sm:text-sm font-black text-[#1e3932]">
                      Ví điện tử
                    </span>
                    <span className="block text-[11px] text-[#595959]">MoMo / VNPay QR</span>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'CARD'
                      ? 'border-[#006241] bg-[#d4e9e2]/35'
                      : 'border-stone-200 bg-white hover:border-[#006241]/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                    className="sr-only"
                  />
                  <div className="w-9 h-9 rounded-full bg-[#f2f0eb] text-[#1e3932] flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs sm:text-sm font-black text-[#1e3932]">
                      Thẻ ngân hàng
                    </span>
                    <span className="block text-[11px] text-[#595959]">Visa / Napas / ATM</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200/90 bg-[#f2f0eb]/60 p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="checkout-simulate-failure"
                  className="flex items-center gap-2.5 text-xs font-bold text-[#1e3932] cursor-pointer"
                >
                  <input
                    id="checkout-simulate-failure"
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(event) => setSimulateFailure(event.target.checked)}
                    className="w-4 h-4 rounded accent-[#006241]"
                  />
                  <span>Mô phỏng thanh toán thất bại (PAYMENT_FAILED)</span>
                </label>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 ${
                    simulateFailure
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-[#d4e9e2] text-[#006241]'
                  }`}
                >
                  {simulateFailure ? 'Thất bại' : 'Thành công'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-[#595959] font-mono break-all">
                <KeyRound className="w-3.5 h-3.5 text-[#006241] flex-shrink-0" />
                <span>Idempotency-Key: {idempotencyKey}</span>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 border-t border-stone-200 bg-white space-y-3 flex-shrink-0 shadow-lg">
            <div className="space-y-1 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-[#595959]">
                <span>Tạm tính</span>
                <span className="font-semibold text-[#1e3932]">
                  {formatCurrency(displaySubtotal)}
                </span>
              </div>
              {displayDiscount > 0 && (
                <div className="flex items-center justify-between text-[#006241]">
                  <span>Giảm giá ưu đãi</span>
                  <span className="font-bold">-{formatCurrency(displayDiscount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                <span className="font-bold text-[#1e3932] text-sm sm:text-base">Tổng thanh toán</span>
                <span className="font-black text-[#006241] text-base sm:text-lg">
                  {formatCurrency(displayFinalAmount)}
                </span>
              </div>
            </div>

            {earnedPointsPreview > 0 && !simulateFailure && (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#1e3932] bg-[#f2f0eb] px-3 py-1.5 rounded-xl">
                <Sparkles className="w-3.5 h-3.5 text-[#cba258]" />
                <span>Nhận ngay +{earnedPointsPreview} điểm thưởng sau khi thanh toán</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-full bg-[#006241] hover:bg-[#00754a] disabled:opacity-60 text-white font-bold text-sm sm:text-base shadow-md shadow-[#006241]/25 transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý giao dịch...</span>
                </>
              ) : (
                <>
                  <span>{failedOrder ? 'Thử thanh toán lại' : 'Xác nhận trả'}</span>
                  <span>•</span>
                  <span className="font-black">{formatCurrency(displayFinalAmount)}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

