'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  AlertCircle,
  LogIn,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { formatCurrency, validateVoucherCode } from '../lib/api';
import { calculateCartTotals, useCartStore } from '../store/useCartStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onProceedCheckout: () => void;
}

const QUICK_VOUCHERS = ['BREWLITEFIRST', 'COFFEELOVER'] as const;

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  isAuthenticated,
  onRequireAuth,
  onProceedCheckout,
}) => {
  const items = useCartStore((state) => state.items);
  const appliedVoucher = useCartStore((state) => state.appliedVoucher);
  const incrementQuantity = useCartStore((state) => state.incrementQuantity);
  const decrementQuantity = useCartStore((state) => state.decrementQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const applyVoucher = useCartStore((state) => state.applyVoucher);
  const clearVoucher = useCartStore((state) => state.clearVoucher);
  const clearCart = useCartStore((state) => state.clearCart);

  const [voucherInput, setVoucherInput] = useState('');
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

  const totals = useMemo(
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

  if (!isOpen) {
    return null;
  }

  const submitVoucher = async (rawCode: string) => {
    setVoucherError(null);
    setIsApplyingVoucher(true);
    try {
      const voucher = await validateVoucherCode(rawCode, totals.subtotal);
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

  const handleVoucherSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitVoucher(voucherInput);
  };

  const earnedPointsPreview = Math.floor(totals.finalAmount / 10000);

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex justify-end transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Giỏ hàng của bạn"
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-stone-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#d4e9e2] text-[#006241] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#1e3932]">
                Giỏ hàng của bạn
              </h2>
              <p className="text-xs font-medium text-[#595959]">
                {totals.totalItems > 0 ? `${totals.totalItems} ly đang chọn` : 'Chưa có đồ uống nào'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-full transition-colors"
              >
                Xóa tất cả
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng giỏ hàng"
              className="p-1.5 rounded-full bg-[#f2f0eb] hover:bg-stone-200 text-stone-500 hover:text-[#1e3932] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-[#f2f0eb] flex items-center justify-center text-[#006241]">
              <ShoppingBag className="w-10 h-10 opacity-80" />
            </div>
            <div className="space-y-1.5 max-w-xs">
              <h3 className="text-base font-black text-[#1e3932]">
                Giỏ hàng hiện đang trống
              </h3>
              <p className="text-xs sm:text-sm text-[#595959] leading-relaxed">
                Hãy chọn những ly cà phê, trà trái cây hoặc đá xay yêu thích từ thực đơn BrewLite.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-[#006241] hover:bg-[#00754a] text-white font-bold text-sm shadow-md shadow-[#006241]/25 transition-all active:scale-95"
            >
              Khám phá thực đơn
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {items.map((item) => {
                const lineTotal = item.unitPrice * item.quantity;
                return (
                  <div
                    key={item.cartItemId}
                    className="flex gap-3 p-3 rounded-2xl border border-stone-200/80 bg-[#f9f9f9]/70 hover:border-[#006241]/30 transition-colors"
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#f2f0eb] border border-stone-200/60">
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-[#1e3932] truncate">
                            {item.productName}
                          </h3>
                          <p className="text-xs font-semibold text-[#006241] mt-0.5">
                            Size: {item.selectedSize.name}
                          </p>
                          {item.selectedToppings.length > 0 && (
                            <p className="text-[11px] text-[#595959] mt-0.5 line-clamp-2">
                              Topping: {item.selectedToppings.map((t) => t.name).join(', ')}
                            </p>
                          )}
                          {item.note && (
                            <p className="text-[11px] italic text-stone-500 mt-0.5 line-clamp-2">
                              Ghi chú: {item.note}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.cartItemId)}
                          aria-label={`Xóa ${item.productName} khỏi giỏ hàng`}
                          className="p-1.5 rounded-full text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-sm font-black text-[#1e3932]">
                          {formatCurrency(lineTotal)}
                        </span>

                        <div className="flex items-center gap-2 bg-white border border-stone-200 px-2 py-1 rounded-full">
                          <button
                            type="button"
                            onClick={() => decrementQuantity(item.cartItemId)}
                            aria-label={`Giảm số lượng ${item.productName}`}
                            className="w-6 h-6 rounded-full bg-[#f2f0eb] hover:bg-[#d4e9e2] text-[#1e3932] flex items-center justify-center transition-colors active:scale-90"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black text-[#1e3932] min-w-[1.25rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => incrementQuantity(item.cartItemId)}
                            aria-label={`Tăng số lượng ${item.productName}`}
                            className="w-6 h-6 rounded-full bg-[#f2f0eb] hover:bg-[#d4e9e2] text-[#1e3932] flex items-center justify-center transition-colors active:scale-90"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="pt-2 border-t border-stone-200/80 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1e3932]">
                  <Tag className="w-3.5 h-3.5 text-[#006241]" />
                  <span>Mã ưu đãi BrewLite</span>
                </div>

                {appliedVoucher ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-[#d4e9e2]/50 border border-[#006241]/30">
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
                        Hủy mã
                      </button>
                    </div>
                    {!totals.voucherEligible && (
                      <p className="text-[11px] font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>
                          Thêm {formatCurrency(appliedVoucher.minOrderAmount - totals.subtotal)} để đạt mức tối thiểu áp dụng mã
                        </span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <form onSubmit={handleVoucherSubmit} className="flex gap-2">
                      <input
                        type="text"
                        value={voucherInput}
                        onChange={(event) => {
                          setVoucherInput(event.target.value);
                          if (voucherError) setVoucherError(null);
                        }}
                        placeholder="Nhập mã (vd: BREWLITEFIRST)"
                        aria-label="Mã giảm giá"
                        className="flex-1 min-w-0 px-3.5 py-2 rounded-xl bg-[#f9f9f9] border border-stone-200 focus:border-[#006241] focus:bg-white text-xs text-[#212121] placeholder-stone-400 outline-none uppercase"
                      />
                      <button
                        type="submit"
                        disabled={isApplyingVoucher || voucherInput.trim().length === 0}
                        className="px-4 py-2 rounded-xl bg-[#1e3932] hover:bg-[#006241] disabled:opacity-45 text-white font-bold text-xs transition-colors flex-shrink-0"
                      >
                        {isApplyingVoucher ? 'Đang kiểm tra...' : 'Áp dụng'}
                      </button>
                    </form>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-[#595959]">Gợi ý:</span>
                      {QUICK_VOUCHERS.map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            setVoucherInput(code);
                            void submitVoucher(code);
                          }}
                          className="text-[11px] font-bold text-[#006241] bg-[#d4e9e2]/60 hover:bg-[#d4e9e2] px-2.5 py-0.5 rounded-full transition-colors"
                        >
                          {code}
                        </button>
                      ))}
                    </div>

                    {voucherError && (
                      <p
                        role="alert"
                        className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                      >
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{voucherError}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-stone-200 bg-white space-y-3 shadow-lg">
              <div className="space-y-1.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-[#595959]">
                  <span>Tạm tính ({totals.totalItems} ly)</span>
                  <span className="font-semibold text-[#1e3932]">
                    {formatCurrency(totals.subtotal)}
                  </span>
                </div>
                {totals.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-[#006241]">
                    <span>Giảm giá ({appliedVoucher?.code})</span>
                    <span className="font-bold">-{formatCurrency(totals.discountAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1.5 border-t border-stone-100">
                  <span className="font-bold text-[#1e3932] text-sm sm:text-base">
                    Tổng thanh toán
                  </span>
                  <span className="font-black text-[#006241] text-base sm:text-lg">
                    {formatCurrency(totals.finalAmount)}
                  </span>
                </div>
              </div>

              {isAuthenticated && earnedPointsPreview > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#1e3932] bg-[#f2f0eb] px-3 py-1.5 rounded-xl">
                  <Sparkles className="w-3.5 h-3.5 text-[#cba258]" />
                  <span>Dự kiến tích +{earnedPointsPreview} điểm thành viên khi hoàn tất thanh toán</span>
                </div>
              )}

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={onProceedCheckout}
                  className="w-full py-3.5 rounded-full bg-[#006241] hover:bg-[#00754a] text-white font-bold text-sm sm:text-base shadow-md shadow-[#006241]/25 transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <span>Tiến hành thanh toán</span>
                  <span>•</span>
                  <span className="font-black">{formatCurrency(totals.finalAmount)}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onRequireAuth}
                  className="w-full py-3.5 rounded-full bg-[#1e3932] hover:bg-[#006241] text-white font-bold text-sm sm:text-base shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập để thanh toán</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
