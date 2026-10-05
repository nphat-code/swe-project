'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '../components/Header';
import { CategoryFilter } from '../components/CategoryFilter';
import { ProductCard } from '../components/ProductCard';
import { ProductSkeleton } from '../components/ProductSkeleton';
import { EmptyState } from '../components/EmptyState';
import { Product, Category } from '../types';
import { fetchProducts, fetchCategories } from '../lib/api';
import { Search, X, Sparkles } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cartCount, setCartCount] = useState<number>(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      try {
        const [catsData, prodsData] = await Promise.all([
          fetchCategories(),
          fetchProducts(),
        ]);
        setCategories(catsData);
        setProducts(prodsData);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu khởi tạo:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, []);

  const handleSelectCategory = async (slug: string) => {
    setSelectedCategory(slug);
    setIsLoading(true);
    try {
      const data = await fetchProducts(slug);
      setProducts(data);
    } catch (err) {
      console.error(`Lỗi khi lọc danh mục ${slug}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.name.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const currentCategoryName = useMemo(() => {
    if (selectedCategory === 'all') return 'Tất cả đồ uống';
    const found = categories.find((c) => c.slug === selectedCategory);
    return found ? found.name : 'Danh mục đồ uống';
  }, [selectedCategory, categories]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="min-h-screen bg-surface text-content-primary flex flex-col font-sans selection:bg-brand-cream selection:text-brand-espresso">
      {/* 1. Header */}
      <Header
        cartCount={cartCount}
        onOpenCart={() => alert('🛒 Giỏ hàng sẽ được kết nối ở Task 5!')}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-3.5 sm:py-8 space-y-4 sm:space-y-6">
        {/* 2. Search and Category Filter Section */}
        <section className="space-y-2.5 sm:space-y-4">
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted" />
              <input
                type="text"
                placeholder="Tìm cà phê, trà trái cây, đá xay..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-11 pr-9 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-brand-oat border border-brand-cream/90 focus:border-brand-terracotta focus:bg-white text-xs sm:text-sm text-content-primary placeholder:text-content-muted outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-primary p-1"
                  aria-label="Xóa tìm kiếm"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            totalProductsCount={products.length}
          />
        </section>

        {/* 3. Products Grid Section */}
        <section className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-brand-cream/90 pb-2 sm:pb-3">
            <div className="flex items-baseline gap-2">
              <h2 className="text-base sm:text-2xl font-black text-brand-espresso tracking-tight">
                {currentCategoryName}
              </h2>
              <span className="text-xs sm:text-sm font-bold text-brand-terracotta bg-brand-cream/80 px-2 py-0.5 rounded-pill">
                {filteredProducts.length} món
              </span>
              {searchQuery && (
                <span className="text-xs text-content-muted truncate max-w-[120px] sm:max-w-none">
                  (cho &quot;{searchQuery}&quot;)
                </span>
              )}
            </div>
          </div>

          {/* Content state */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
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
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={handleSelectProduct}
                />
              ))}
            </div>
          )}
        </section>

        {/* 5. Modal Preview (Chuẩn bị cho Task 4) */}
        {selectedProduct && (
          <div
            className="fixed inset-0 z-50 bg-brand-espresso/40 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <div
              className="bg-white border border-brand-cream rounded-card p-6 max-w-md w-full shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-brand-terracotta uppercase tracking-wider">
                    {selectedProduct.category?.name || 'Đồ uống'}
                  </span>
                  <h3 className="text-xl font-bold text-brand-espresso mt-1">
                    {selectedProduct.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-1.5 rounded-full bg-brand-oat hover:bg-brand-cream text-content-muted hover:text-brand-espresso transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
                {selectedProduct.description}
              </p>

              <div className="p-3 rounded-2xl bg-brand-cream/70 border border-brand-cream text-xs text-brand-espresso flex items-center gap-2">
                <Sparkles className="w-4 h-4 flex-shrink-0 text-brand-terracotta" />
                <span>
                  Modal chọn Size (S/M/L) & Topping kèm tính tiền Realtime sẽ được triển khai hoàn chỉnh ở <strong>Task 4</strong>!
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-xs text-content-muted block">Đơn giá khởi điểm</span>
                  <span className="text-lg font-black text-brand-terracotta">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(selectedProduct.basePrice)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCartCount((prev) => prev + 1);
                    setSelectedProduct(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-brand-terracotta hover:bg-[#b34f2a] text-white font-bold text-sm shadow-md shadow-brand-terracotta/20 transition-all active:scale-95"
                >
                  Thêm vào giỏ thử nghiệm
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 6. Footer */}
      <footer className="border-t border-brand-cream bg-brand-oat/50 py-8 mt-12 text-center text-xs text-content-muted space-y-2">
        <p className="font-semibold text-brand-espresso">
          BrewLite — Cashless Coffee Ordering Application
        </p>
        <p>Bài tập lớn môn Công nghệ Phần mềm — ĐH Sài Gòn (Agile Scrum: Sprint 1)</p>
      </footer>
    </div>
  );
}
