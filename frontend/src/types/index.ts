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
