'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ClipboardList,
  Coffee,
  CreditCard,
  Loader2,
  RefreshCw,
  X,
  XCircle,
} from 'lucide-react';
import { fetchMyOrders, formatCurrency, updateOrderStatus } from '../lib/api';
import {
  formatOrderTimestamp,
  getOrderStatusPresentation,
  getPaymentMethodLabel,
} from '../lib/orderDisplay';
import { OrderRecord } from '../types';

interface OrderHistoryModalProps {
  isOpen: boolean;
  accessToken: string;
  onClose: () => void;
  onRetryPayment: (order: OrderRecord) => void;
  onOrderUpdated?: (order: OrderRecord) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  accessToken,
  onClose,
  onRetryPayment,
  onOrderUpdated,
}) => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !accessToken) {
      return;
    }

    let isCancelled = false;
    document.body.style.overflow = 'hidden';

    fetchMyOrders(accessToken)
      .then((data) => {
        if (!isCancelled) {
          setOrders(data);
          setErrorMessage(null);
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Không thể tải lịch sử đơn hàng'
          );
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      isCancelled = true;
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, accessToken, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleRefresh = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setActionError(null);
    try {
      const data = await fetchMyOrders(accessToken);
      setOrders(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Không thể tải lịch sử đơn hàng'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (order: OrderRecord) => {
    setActionError(null);
    setCancellingOrderId(order.id);
    try {
      const updated = await updateOrderStatus(accessToken, order.id, 'CANCELLED');
      setOrders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      onOrderUpdated?.(updated);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Không thể hủy đơn hàng lúc này'
      );
    } finally {
      setCancellingOrderId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Lịch sử đơn hàng"
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-stone-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#d4e9e2] text-[#006241] flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#1e3932]">
                Lịch sử đơn hàng
              </h2>
              <p className="text-xs font-medium text-[#595959]">
                Theo dõi trạng thái & thanh toán lại đơn lỗi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => void handleRefresh()}
              aria-label="Làm mới lịch sử đơn hàng"
              className="p-2 rounded-full bg-[#f2f0eb] hover:bg-[#d4e9e2] disabled:opacity-50 text-[#1e3932] hover:text-[#006241] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng lịch sử đơn hàng"
              className="p-1.5 rounded-full bg-[#f2f0eb] hover:bg-stone-200 text-stone-500 hover:text-[#1e3932] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {actionError && (
            <div
              role="alert"
              className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl border border-stone-200/80 bg-[#f9f9f9] animate-pulse space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 rounded bg-stone-200" />
                    <div className="h-5 w-28 rounded-full bg-stone-200" />
                  </div>
                  <div className="h-3 w-3/4 rounded bg-stone-200" />
                  <div className="h-4 w-32 rounded bg-stone-200" />
                </div>
              ))}
            </div>
          ) : errorMessage ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-[#1e3932]">{errorMessage}</p>
              <button
                type="button"
                onClick={() => void handleRefresh()}
                className="px-5 py-2 rounded-full bg-[#006241] hover:bg-[#00754a] text-white text-xs font-bold transition-colors"
              >
                Thử tải lại
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#f2f0eb] text-[#006241] flex items-center justify-center">
                <Coffee className="w-8 h-8 opacity-80" />
              </div>
              <div className="space-y-1 max-w-xs">
                <h3 className="text-base font-black text-[#1e3932]">
                  Bạn chưa có đơn hàng nào
                </h3>
                <p className="text-xs text-[#595959] leading-relaxed">
                  Hãy chọn những thức uống yêu thích từ thực đơn để bắt đầu tích điểm cùng BrewLite.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-[#006241] hover:bg-[#00754a] text-white font-bold text-xs shadow-md shadow-[#006241]/25 transition-colors"
              >
                Khám phá thực đơn
              </button>
            </div>
          ) : (
            orders.map((order) => {
              const statusMeta = getOrderStatusPresentation(order.status);
              const canRetryPayment =
                order.status === 'PAYMENT_FAILED' || order.status === 'PENDING';
              const canCancel =
                order.status === 'PENDING' ||
                order.status === 'PAYMENT_FAILED' ||
                order.status === 'PAID';
              const isCancelling = cancellingOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl border border-stone-200/80 bg-[#f9f9f9]/80 space-y-3 hover:border-[#006241]/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#1e3932]">
                          {order.orderNumber}
                        </span>
                        <span className="text-[11px] font-semibold text-[#595959]">
                          {getPaymentMethodLabel(order.paymentMethod)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#595959] mt-0.5">
                        {formatOrderTimestamp(order.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${statusMeta.badgeClassName}`}
                    >
                      {statusMeta.label} ({order.status})
                    </span>
                  </div>

                  <div className="space-y-1.5 border-t border-stone-200/70 pt-2.5">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1e3932] truncate">
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
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-200/70">
                    <div>
                      {order.discountAmount > 0 && (
                        <p className="text-[11px] text-[#006241] font-semibold">
                          Đã giảm {formatCurrency(order.discountAmount)}
                        </p>
                      )}
                      <p className="text-sm font-black text-[#006241]">
                        Tổng: {formatCurrency(order.finalAmount)}
                      </p>
                    </div>

                    {(canRetryPayment || canCancel) && (
                      <div className="flex items-center gap-2">
                        {canRetryPayment && (
                          <button
                            type="button"
                            onClick={() => onRetryPayment(order)}
                            className="px-3.5 py-1.5 rounded-full bg-[#006241] hover:bg-[#00754a] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Thanh toán lại</span>
                          </button>
                        )}
                        {canCancel && (
                          <button
                            type="button"
                            disabled={isCancelling}
                            onClick={() => void handleCancelOrder(order)}
                            className="px-3 py-1.5 rounded-full border border-rose-200 bg-white hover:bg-rose-50 disabled:opacity-50 text-rose-600 text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            {isCancelling ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                            <span>Hủy đơn</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

