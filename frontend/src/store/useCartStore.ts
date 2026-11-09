import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AppliedVoucher, CartItem, CustomOrderItem } from '../types';

export interface CartTotals {
  totalItems: number;
  subtotal: number;
  discountAmount: number;
  finalAmount: number;
  voucherEligible: boolean;
}

export interface CartStoreState {
  items: CartItem[];
  appliedVoucher: AppliedVoucher | null;
  addItem: (item: CustomOrderItem) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  incrementQuantity: (cartItemId: string) => void;
  decrementQuantity: (cartItemId: string) => void;
  removeItem: (cartItemId: string) => void;
  applyVoucher: (voucher: AppliedVoucher) => void;
  clearVoucher: () => void;
  clearCart: () => void;
}

export function buildCartItemKey(item: CustomOrderItem): string {
  const toppingSignature = [...item.selectedToppings]
    .map((topping) => topping.id)
    .sort()
    .join(',');
  const normalizedNote = (item.note ?? '').trim().toLowerCase();
  return `${item.productId}::${item.selectedSize.id}::${toppingSignature}::${normalizedNote}`;
}

export function calculateCartTotals(
  items: CartItem[],
  appliedVoucher: AppliedVoucher | null
): CartTotals {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  if (!appliedVoucher) {
    return {
      totalItems,
      subtotal,
      discountAmount: 0,
      finalAmount: subtotal,
      voucherEligible: true,
    };
  }

  if (subtotal <= 0 || subtotal < appliedVoucher.minOrderAmount) {
    return {
      totalItems,
      subtotal,
      discountAmount: 0,
      finalAmount: subtotal,
      voucherEligible: false,
    };
  }

  const rawDiscount = Math.floor((subtotal * appliedVoucher.discountPercent) / 100);
  const discountAmount = Math.min(rawDiscount, appliedVoucher.maxDiscount, subtotal);
  const finalAmount = Math.max(0, subtotal - discountAmount);

  return {
    totalItems,
    subtotal,
    discountAmount,
    finalAmount,
    voucherEligible: true,
  };
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set) => ({
      items: [],
      appliedVoucher: null,
      addItem: (incomingItem) =>
        set((state) => {
          const cartItemId = buildCartItemKey(incomingItem);
          const safeQuantity = Math.max(1, incomingItem.quantity);
          const existingIndex = state.items.findIndex((item) => item.cartItemId === cartItemId);

          if (existingIndex === -1) {
            const newItem: CartItem = {
              ...incomingItem,
              cartItemId,
              quantity: safeQuantity,
              totalPrice: incomingItem.unitPrice * safeQuantity,
            };
            return { items: [...state.items, newItem] };
          }

          const updatedItems = state.items.map((item, index) => {
            if (index !== existingIndex) {
              return item;
            }
            const nextQuantity = item.quantity + safeQuantity;
            return {
              ...item,
              quantity: nextQuantity,
              totalPrice: item.unitPrice * nextQuantity,
            };
          });
          return { items: updatedItems };
        }),
      updateQuantity: (cartItemId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.cartItemId !== cartItemId),
            };
          }
          return {
            items: state.items.map((item) =>
              item.cartItemId === cartItemId
                ? {
                    ...item,
                    quantity,
                    totalPrice: item.unitPrice * quantity,
                  }
                : item
            ),
          };
        }),
      incrementQuantity: (cartItemId) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (item.cartItemId !== cartItemId) {
              return item;
            }
            const nextQuantity = item.quantity + 1;
            return {
              ...item,
              quantity: nextQuantity,
              totalPrice: item.unitPrice * nextQuantity,
            };
          }),
        })),
      decrementQuantity: (cartItemId) =>
        set((state) => ({
          items: state.items
            .map((item) => {
              if (item.cartItemId !== cartItemId) {
                return item;
              }
              const nextQuantity = item.quantity - 1;
              if (nextQuantity <= 0) {
                return null;
              }
              return {
                ...item,
                quantity: nextQuantity,
                totalPrice: item.unitPrice * nextQuantity,
              };
            })
            .filter((item): item is CartItem => item !== null),
        })),
      removeItem: (cartItemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.cartItemId !== cartItemId),
        })),
      applyVoucher: (voucher) =>
        set(() => ({
          appliedVoucher: voucher,
        })),
      clearVoucher: () =>
        set(() => ({
          appliedVoucher: null,
        })),
      clearCart: () =>
        set(() => ({
          items: [],
          appliedVoucher: null,
        })),
    }),
    {
      name: 'brewlite-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        appliedVoucher: state.appliedVoucher,
      }),
    }
  )
);
