'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from '../components/Header';
import { CategoryFilter } from '../components/CategoryFilter';
import { ProductCard } from '../components/ProductCard';
import { ProductSkeleton } from '../components/ProductSkeleton';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { Product, Category, Topping, CustomOrderItem } from '../types';
import { fetchProducts, fetchCategories, fetchToppings, formatCurrency } from '../lib/api';
import { Search, X, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CustomOrderItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const applyMenuResult = (catsData: Category[], prodsData: Product[], topsData: Topping[]) => {
    setCategories(catsData);
    setProducts(prodsData);
    setToppings(topsData);
    setHasError(catsData.length === 0 && prodsData.length === 0);
  };

  const handleRetryLoad = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const [catsData, prodsData, topsData] = await Promise.all([
        fetchCategories(),
        fetchProducts(),
        fetchToppings(),
      ]);
      applyMenuResult(catsData, prodsData, topsData);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu khởi tạo:', err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;

    Promise.all([fetchCategories(), fetchProducts(), fetchToppings()])
      .then(([catsData, prodsData, topsData]) => {
        if (isCancelled) return;
        setCategories(catsData);
        setProducts(prodsData);
        setToppings(topsData);
        setHasError(catsData.length === 0 && prodsData.length === 0);
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error('Lỗi khi tải dữ liệu khởi tạo:', err);
        setHasError(true);
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectCategory = (slug: string) => {
    setSelectedCategory(slug);
  };

  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category?.slug === selectedCategory);
    }
    if (!searchQuery.trim()) return result;
    const query = searchQuery.toLowerCase().trim();
    return result.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.name.toLowerCase().includes(query)
    );
  }, [products, selectedCategory, searchQuery]);

  const totalProductsCount = useMemo(() => {
    const sum = categories.reduce((acc, cat) => acc + (cat._count?.products ?? 0), 0);
    return sum > 0 ? sum : products.length;
  }, [categories, products.length]);

  const currentCategoryName = useMemo(() => {
    if (selectedCategory === 'all') return 'Tất cả đồ uống';
    const found = categories.find((c) => c.slug === selectedCategory);
    return found ? found.name : 'Danh mục đồ uống';
  }, [selectedCategory, categories]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleAddToCart = (customItem: CustomOrderItem) => {
    setCartItems((prev) => [...prev, customItem]);
    setToastMessage(`Đã thêm ${customItem.quantity}x ${customItem.productName} (${customItem.selectedSize.name}) vào giỏ hàng!`);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  return (
    <div className="min-h-screen bg-white text-[#212121] flex flex-col font-sans selection:bg-[#d4e9e2] selection:text-[#006241]">
      <Header
        cartCount={cartCount}
        onOpenCart={() => {
          if (cartItems.length === 0) {
            alert('Giỏ hàng hiện đang trống. Hãy chọn món đồ uống yêu thích nhé!');
          } else {
            const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
            alert(`🛒 Giỏ hàng có ${cartCount} ly nước (Tổng: ${formatCurrency(total)}).\nTính năng Quản lý giỏ hàng chi tiết sẽ ra mắt ở Task 5!`);
          }
        }}
      />

      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#006241] text-white px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-3.5 sm:py-8 space-y-4 sm:space-y-6">
        <section className="space-y-2.5 sm:space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Tìm món đồ uống bạn yêu thích..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-11 pr-9 py-2.5 sm:py-3 rounded-full bg-[#f2f0eb] border border-transparent focus:border-[#006241] focus:bg-white text-xs sm:text-sm text-[#212121] placeholder-stone-400 outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                  aria-label="Xóa tìm kiếm"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          </div>

          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            totalProductsCount={totalProductsCount}
          />
        </section>

        <section className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200/80 pb-2 sm:pb-3">
            <div className="flex items-baseline gap-2">
              <h2 className="text-base sm:text-2xl font-black text-[#1e3932] tracking-tight">
                {currentCategoryName}
              </h2>
              <span className="text-xs sm:text-sm font-bold text-[#006241] bg-[#d4e9e2] px-2 py-0.5 rounded-full">
                {filteredProducts.length} món
              </span>
              {searchQuery && (
                <span className="text-xs text-[#595959] truncate max-w-[120px] sm:max-w-none">
                  (cho &quot;{searchQuery}&quot;)
                </span>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
          ) : hasError && products.length === 0 ? (
            <ErrorState
              message="Không thể kết nối đến máy chủ BrewLite. Vui lòng đảm bảo backend đang hoạt động và nhấn thử lại."
              onRetry={handleRetryLoad}
            />
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              message={
                searchQuery
                  ? `Không có đồ uống nào khớp với từ khóa "${searchQuery}". Hãy thử tìm món khác!`
                  : 'Danh mục này hiện chưa có món nào sẵn sàng phục vụ.'
              }
              onReset={() => {
                setSearchQuery('');
                handleSelectCategory('all');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 4}
                  onSelectProduct={handleSelectProduct}
                />
              ))}
            </div>
          )}
        </section>

        {selectedProduct && (
          <ProductDetailModal
            key={selectedProduct.id}
            product={selectedProduct}
            allToppings={toppings}
            isOpen={true}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
          />
        )}
      </main>

      <footer className="border-t border-stone-200/80 bg-[#f2f0eb]/60 py-6 mt-10 text-center text-xs text-[#595959]">
        <p className="font-medium">
          © 2026 BrewLite Coffee Company. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
