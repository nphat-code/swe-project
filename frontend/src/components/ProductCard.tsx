'use client';

import React from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../lib/api';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
}) => {
  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group relative flex flex-row sm:flex-col bg-white hover:bg-brand-oat/40 border border-brand-cream/90 rounded-2xl sm:rounded-card p-3 sm:p-0 gap-3.5 sm:gap-0 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-brand-espresso/5 sm:hover:-translate-y-1 cursor-pointer active:scale-[0.99] sm:active:scale-100"
    >
      {/* Product Image: Compact Square on Mobile (~96px), Aspect 4/3 on Desktop */}
      <div className="relative w-24 h-24 sm:w-full sm:aspect-[4/3] flex-shrink-0 bg-brand-oat rounded-xl sm:rounded-none overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 96px, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-stone-900/30 via-transparent to-transparent opacity-40" />

        {/* Category Pill Tag (Desktop only) */}
        {product.category && (
          <span className="hidden sm:inline-block absolute top-3 left-3 px-2.5 py-1 rounded-pill text-[11px] font-semibold tracking-wide bg-white/95 text-brand-espresso border border-brand-cream shadow-xs backdrop-blur-sm">
            {product.category.name}
          </span>
        )}
      </div>

      {/* Product Content */}
      <div className="flex flex-col flex-1 min-w-0 justify-between sm:p-5">
        <div>
          {/* Small Category Badge on Mobile */}
          {product.category && (
            <div className="sm:hidden mb-1">
              <span className="text-[10px] font-semibold text-brand-terracotta bg-brand-cream/70 px-2 py-0.5 rounded-pill">
                {product.category.name}
              </span>
            </div>
          )}
          <h3 className="font-bold text-sm sm:text-lg text-brand-espresso group-hover:text-brand-terracotta transition-colors line-clamp-1 mb-0.5 sm:mb-1.5">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-content-muted line-clamp-1 sm:line-clamp-2 leading-relaxed sm:mb-4">
            {product.description}
          </p>
        </div>

        {/* Footer: Price + Add Button */}
        <div className="flex items-center justify-between mt-2 sm:mt-auto pt-0 sm:pt-3 sm:border-t sm:border-brand-cream/80">
          <div>
            <span className="hidden sm:block text-[11px] text-content-muted font-medium">Giá từ</span>
            <span className="text-sm sm:text-lg font-black text-brand-terracotta">
              {formatCurrency(product.basePrice)}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="flex items-center justify-center gap-1 w-8 h-8 sm:w-auto sm:h-auto sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl bg-brand-terracotta hover:bg-[#b34f2a] text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-terracotta/20 active:scale-90 sm:active:scale-95 transition-all duration-150"
            aria-label={`Chọn món ${product.name}`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Chọn</span>
          </button>
        </div>
      </div>
    </div>
  );
};
