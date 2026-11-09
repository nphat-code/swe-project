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
