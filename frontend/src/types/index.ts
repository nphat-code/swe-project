export interface ProductSize {
  id: string;
  name: string;
  code?: string;
  sizeCode?: string;
  extraPrice: number;
}

export interface Topping {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  categoryId: string;
  isAvailable: boolean;
  category?: Category;
  sizes: ProductSize[];
  availableToppings?: Topping[];
}

export interface SelectedTopping {
  id: string;
  name: string;
  price: number;
}

export interface CustomOrderItem {
  productId: string;
  productName: string;
  productImage: string;
  categoryName?: string;
  basePrice: number;
  selectedSize: ProductSize;
  selectedToppings: SelectedTopping[];
  quantity: number;
  note?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface CartItem extends CustomOrderItem {
  cartItemId: string;
}

export interface AppliedVoucher {
  code: string;
  description: string;
  discountPercent: number;
  maxDiscount: number;
  minOrderAmount: number;
}

export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  loyaltyPoints: number;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'PAYMENT_FAILED';

export type PaymentStatus = 'UNPAID' | 'PAID' | 'FAILED';

export type PaymentMethod = 'WALLET' | 'CARD' | 'MOCK_WALLET' | 'MOCK_MOMO' | 'MOCK_VNPAY';

export interface OrderItemToppingSummary {
  id?: string;
  name: string;
  price: number;
}

export interface OrderItemRecord {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  sizeName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  toppings?: OrderItemToppingSummary[] | null;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  idempotencyKey: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  transactionId: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  userId: string | null;
  customerName: string;
  customerPhone: string;
  note: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  idempotencyKey?: string | null;
  items: OrderItemRecord[];
  payments?: PaymentRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemPayload {
  productId: string;
  sizeId?: string;
  sizeCode?: string;
  toppingIds?: string[];
  quantity: number;
  note?: string;
}

export interface CreateOrderPayload {
  items: CreateOrderItemPayload[];
  voucherCode?: string;
  customerName?: string;
  customerPhone?: string;
  paymentMethod?: PaymentMethod;
  note?: string;
}

export interface ProcessPaymentPayload {
  orderId: string;
  method: PaymentMethod;
  idempotencyKey: string;
  simulateFailure?: boolean;
}

export interface ProcessPaymentResponse {
  success: boolean;
  idempotentReplay: boolean;
  message: string;
  payment: PaymentRecord;
  order: OrderRecord;
  loyaltyPointsEarned: number;
  loyaltyPointsBalance: number | null;
}
