import { CustomOrderItem } from '../types';
import { buildCartItemKey, calculateCartTotals, useCartStore } from './useCartStore';

const createSampleItem = (overrides: Partial<CustomOrderItem> = {}): CustomOrderItem => ({
  productId: 'prod-1',
  productName: 'Cà Phê Sữa Đá Sài Gòn',
  productImage: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5',
  categoryName: 'Cà phê Việt Nam',
  basePrice: 32000,
  selectedSize: { id: 'size-m', name: 'Vừa (M)', code: 'M', extraPrice: 6000 },
  selectedToppings: [
    { id: 'top-2', name: 'Kem phô mai Macchiato', price: 12000 },
    { id: 'top-1', name: 'Trân châu hoàng kim', price: 8000 },
  ],
  quantity: 1,
  note: 'Ít đá',
  unitPrice: 58000,
  totalPrice: 58000,
  ...overrides,
});

describe('useCartStore (UNIT-CART01)', () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.getState().clearCart();
  });

  it('adds items, builds deterministic key ignoring topping order, and persists to localStorage', () => {
    const first = createSampleItem();
    const secondSameOrderDiffToppingOrder = createSampleItem({
      selectedToppings: [
        { id: 'top-1', name: 'Trân châu hoàng kim', price: 8000 },
        { id: 'top-2', name: 'Kem phô mai Macchiato', price: 12000 },
      ],
      note: '  ít đá  ',
      quantity: 2,
      totalPrice: 116000,
    });

    expect(buildCartItemKey(first)).toBe(buildCartItemKey(secondSameOrderDiffToppingOrder));

    useCartStore.getState().addItem(first);
    useCartStore.getState().addItem(secondSameOrderDiffToppingOrder);

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
    expect(items[0].totalPrice).toBe(174000);

    const persistedRaw = localStorage.getItem('brewlite-cart-storage');
    expect(persistedRaw).not.toBeNull();
    expect(persistedRaw).toContain('Cà Phê Sữa Đá Sài Gòn');
  });

  it('keeps distinct items separate when size, toppings, or note differ', () => {
    const sizeM = createSampleItem();
    const sizeL = createSampleItem({
      selectedSize: { id: 'size-l', name: 'Lớn (L)', code: 'L', extraPrice: 10000 },
      unitPrice: 62000,
      totalPrice: 62000,
    });
    const diffNote = createSampleItem({ note: 'Không đường' });

    useCartStore.getState().addItem(sizeM);
    useCartStore.getState().addItem(sizeL);
    useCartStore.getState().addItem(diffNote);

    expect(useCartStore.getState().items).toHaveLength(3);
  });

  it('increments, decrements, updates quantity, removes item, and removes when quantity hits 0', () => {
    const item = createSampleItem();
    useCartStore.getState().addItem(item);
    const key = useCartStore.getState().items[0].cartItemId;

    useCartStore.getState().incrementQuantity(key);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
    expect(useCartStore.getState().items[0].totalPrice).toBe(116000);

    useCartStore.getState().updateQuantity(key, 4);
    expect(useCartStore.getState().items[0].quantity).toBe(4);
    expect(useCartStore.getState().items[0].totalPrice).toBe(232000);

    useCartStore.getState().decrementQuantity(key);
    expect(useCartStore.getState().items[0].quantity).toBe(3);

    useCartStore.getState().updateQuantity(key, 0);
    expect(useCartStore.getState().items).toHaveLength(0);

    useCartStore.getState().addItem(item);
    const nextKey = useCartStore.getState().items[0].cartItemId;
    useCartStore.getState().decrementQuantity(nextKey);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('calculates totals with voucher cap and minimum order threshold', () => {
    useCartStore.getState().addItem(
      createSampleItem({
        selectedToppings: [],
        unitPrice: 38000,
        totalPrice: 38000,
      })
    );

    const voucher = {
      code: 'BREWLITEFIRST',
      description: 'Giảm 20% tối đa 30k',
      discountPercent: 20,
      maxDiscount: 30000,
      minOrderAmount: 40000,
    };
    useCartStore.getState().applyVoucher(voucher);

    const belowMin = calculateCartTotals(
      useCartStore.getState().items,
      useCartStore.getState().appliedVoucher
    );
    expect(belowMin.subtotal).toBe(38000);
    expect(belowMin.discountAmount).toBe(0);
    expect(belowMin.finalAmount).toBe(38000);
    expect(belowMin.voucherEligible).toBe(false);

    useCartStore.getState().updateQuantity(useCartStore.getState().items[0].cartItemId, 5);
    const cappedTotals = calculateCartTotals(
      useCartStore.getState().items,
      useCartStore.getState().appliedVoucher
    );
    expect(cappedTotals.subtotal).toBe(190000);
    expect(cappedTotals.discountAmount).toBe(30000);
    expect(cappedTotals.finalAmount).toBe(160000);
    expect(cappedTotals.voucherEligible).toBe(true);
  });
});
