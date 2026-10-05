'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { X, Plus, Minus, Check, Sparkles } from 'lucide-react';
import { Product, ProductSize, Topping, CustomOrderItem } from '../types';
import { formatCurrency } from '../lib/api';

interface ProductDetailModalProps {
  product: Product | null;
  allToppings: Topping[];
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (customItem: CustomOrderItem) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  allToppings,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0) {
        const defaultSize = product.sizes.find((s) => s.extraPrice === 0) || product.sizes[0];
        setSelectedSize(defaultSize);
      } else {
        setSelectedSize(null);
      }
      setSelectedToppings([]);
      setQuantity(1);
      setNote('');
      setIsSuccess(false);
    }
  }, [product]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const availableToppings = useMemo(() => {
    if (product?.availableToppings && product.availableToppings.length > 0) {
      return product.availableToppings;
    }
    return allToppings;
  }, [product, allToppings]);

  const unitPrice = useMemo(() => {
    if (!product) return 0;
    const sizeExtra = selectedSize?.extraPrice ?? 0;
    const toppingsExtra = selectedToppings.reduce((sum, t) => sum + t.price, 0);
    return product.basePrice + sizeExtra + toppingsExtra;
  }, [product, selectedSize, selectedToppings]);

  const totalPrice = useMemo(() => {
    return unitPrice * quantity;
  }, [unitPrice, quantity]);

  if (!isOpen || !product) return null;

  const handleToggleTopping = (topping: Topping) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((t) => t.id === topping.id);
      if (exists) {
        return prev.filter((t) => t.id !== topping.id);
      } else {
        return [...prev, topping];
      }
    });
  };

  const handleIncreaseQuantity = () => {
    setQuantity((q) => q + 1);
  };

  const handleDecreaseQuantity = () => {
    setQuantity((q) => (q > 1 ? q - 1 : 1));
  };

  const handleConfirmAddToCart = () => {
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      alert('Vui lòng chọn kích cỡ đồ uống!');
      return;
    }

    const customItem: CustomOrderItem = {
      productId: product.id,
      productName: product.name,
      productImage: product.imageUrl,
      categoryName: product.category?.name,
      basePrice: product.basePrice,
      selectedSize: selectedSize || { id: 'default', name: 'Tiêu chuẩn', sizeCode: 'M', extraPrice: 0 },
      selectedToppings: selectedToppings.map((t) => ({ id: t.id, name: t.name, price: t.price })),
      quantity,
      note: note.trim() || undefined,
      unitPrice,
      totalPrice,
    };

    setIsSuccess(true);
    setTimeout(() => {
      onAddToCart(customItem);
      onClose();
    }, 450);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden transition-all duration-300 transform animate-in slide-in-from-bottom-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2.5 sm:hidden" />

        <div className="relative px-4 sm:px-5 pt-2.5 sm:pt-5 pb-3 border-b border-stone-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative w-14 h-14 sm:w-18 sm:h-18 rounded-full overflow-hidden flex-shrink-0 bg-[#f2f0eb] shadow-md border-2 border-white ring-1 ring-stone-200">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="72px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              {product.category && (
                <span className="text-[10px] font-bold text-[#006241] bg-[#d4e9e2] px-2 py-0.5 rounded-full inline-block mb-1">
                  {product.category.name}
                </span>
              )}
              <h2 className="text-sm sm:text-base font-black text-[#1e3932] leading-snug line-clamp-2">
                {product.name}
              </h2>
              <span className="text-xs sm:text-sm font-bold text-[#006241] mt-0.5 block">
                Giá gốc: {formatCurrency(product.basePrice)}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#f2f0eb] hover:bg-stone-200 text-stone-500 hover:text-[#1e3932] transition-colors flex-shrink-0"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-6 text-sm text-[#212121]">
          {product.description && (
            <p className="text-xs sm:text-sm text-[#595959] leading-relaxed bg-[#f9f9f9] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-stone-100">
              {product.description}
            </p>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#1e3932] text-sm sm:text-base flex items-center gap-1.5">
                  <span>Chọn kích cỡ</span>
                  <span className="text-[11px] font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                    Bắt buộc
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize?.id === size.id;
                  const displayCode = size.code || size.sizeCode || size.name.charAt(0);
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`flex flex-col items-center justify-center py-2.5 px-1.5 sm:p-3 rounded-2xl border text-center transition-all duration-150 ${
                        isSelected
                          ? 'border-2 border-[#006241] bg-[#d4e9e2]/30 shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-black text-[11px] sm:text-xs mb-1 ${
                          isSelected
                            ? 'bg-[#006241] text-white'
                            : 'bg-[#f2f0eb] text-[#1e3932]'
                        }`}
                      >
                        {displayCode}
                      </span>
                      <span className="font-bold text-[11px] sm:text-xs text-[#1e3932] truncate max-w-full">
                        {size.name}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-semibold text-[#006241] mt-0.5">
                        {size.extraPrice === 0 ? '+ 0 ₫' : `+ ${formatCurrency(size.extraPrice)}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {availableToppings && availableToppings.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#1e3932] text-sm sm:text-base flex items-center gap-1.5">
                  <span>Thêm topping</span>
                  <span className="text-[11px] font-semibold text-[#595959] bg-stone-100 px-2 py-0.5 rounded-full">
                    Tùy chọn
                  </span>
                </h3>
                {selectedToppings.length > 0 && (
                  <span className="text-xs font-bold text-[#006241]">
                    Đã chọn {selectedToppings.length}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {availableToppings.map((topping) => {
                  const isChecked = selectedToppings.some((t) => t.id === topping.id);
                  return (
                    <label
                      key={topping.id}
                      onClick={() => handleToggleTopping(topping)}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all duration-150 ${
                        isChecked
                          ? 'border-[#006241] bg-[#d4e9e2]/20'
                          : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                            isChecked
                              ? 'bg-[#006241] border-[#006241] text-white'
                              : 'border-stone-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="font-semibold text-xs sm:text-sm text-[#1e3932]">
                          {topping.name}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#006241]">
                        + {formatCurrency(topping.price)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-bold text-[#1e3932] text-sm sm:text-base">
              Ghi chú cho Barista
            </h3>
            <input
              type="text"
              placeholder="Ví dụ: Ít đá, 50% đường, để riêng topping..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#f9f9f9] border border-stone-200 focus:border-[#006241] focus:bg-white text-xs sm:text-sm text-[#212121] placeholder-stone-400 outline-none transition-all"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <span className="font-bold text-[#1e3932] text-sm sm:text-base">Số lượng ly:</span>
            <div className="flex items-center gap-3 bg-[#f2f0eb] px-3 py-1.5 rounded-full">
              <button
                type="button"
                onClick={handleDecreaseQuantity}
                disabled={quantity <= 1}
                className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#1e3932] disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs hover:bg-[#d4e9e2] transition-colors active:scale-90"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-black text-sm text-[#1e3932] w-5 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncreaseQuantity}
                className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#1e3932] shadow-2xs hover:bg-[#d4e9e2] transition-colors active:scale-90"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white border-t border-stone-100 shadow-lg">
          <button
            type="button"
            onClick={handleConfirmAddToCart}
            className={`w-full py-3.5 rounded-full font-bold text-sm sm:text-base text-white flex items-center justify-center gap-2 shadow-md transition-all duration-200 active:scale-98 ${
              isSuccess
                ? 'bg-emerald-600 shadow-emerald-600/30'
                : 'bg-[#006241] hover:bg-[#00754a] shadow-[#006241]/25'
            }`}
          >
            {isSuccess ? (
              <>
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>Đã thêm vào giỏ!</span>
              </>
            ) : (
              <>
                <span>Thêm vào đơn hàng</span>
                <span>•</span>
                <span className="font-black">{formatCurrency(totalPrice)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
