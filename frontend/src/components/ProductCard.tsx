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
      className="group relative flex flex-col bg-white hover:bg-brand-oat/40 border border-brand-cream/90 rounded-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-brand-espresso/5 hover:-translate-y-1 cursor-pointer"
    >
      {/* Product Image */}
      <div className="relative w-full aspect-[4/3] bg-brand-oat overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 via-transparent to-transparent opacity-40" />

        {/* Category Pill Tag */}
        {product.category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-pill text-[11px] font-semibold tracking-wide bg-white/95 text-brand-espresso border border-brand-cream shadow-sm backdrop-blur-sm">
            {product.category.name}
          </span>
        )}
      </div>

      {/* Product Content */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 justify-between">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-brand-espresso group-hover:text-brand-terracotta transition-colors line-clamp-1 mb-1.5">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-content-muted line-clamp-2 leading-relaxed mb-4">
            {product.description}
          </p>
        </div>

        {/* Footer: Price + Add Button */}
        <div className="pt-3 border-t border-brand-cream/80 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[11px] text-content-muted block font-medium">Giá từ</span>
            <span className="text-base sm:text-lg font-black text-brand-terracotta">
              {formatCurrency(product.basePrice)}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-brand-terracotta hover:bg-[#b34f2a] text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-terracotta/20 active:scale-95 transition-all duration-150"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Chọn</span>
          </button>
        </div>
      </div>
    </div>
  );
};
