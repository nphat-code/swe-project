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
      className="group relative flex flex-col bg-stone-900/60 hover:bg-stone-900/90 border border-stone-800/80 hover:border-amber-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-amber-950/20 hover:-translate-y-1 cursor-pointer"
    >
      {/* Product Image */}
      <div className="relative w-full aspect-[4/3] bg-stone-950 overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-60" />

        {/* Category Pill Tag */}
        {product.category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide bg-stone-950/70 text-amber-300 border border-amber-500/20 backdrop-blur-sm">
            {product.category.name}
          </span>
        )}
      </div>

      {/* Product Content */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 justify-between">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-stone-100 group-hover:text-amber-400 transition-colors line-clamp-1 mb-1.5">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 line-clamp-2 leading-relaxed mb-4">
            {product.description}
          </p>
        </div>

        {/* Footer: Price + Sizes + Add Button */}
        <div className="pt-3 border-t border-stone-800/60 flex items-center justify-between mt-auto">
          <div>
            <span className="text-xs text-stone-400 block">Giá từ</span>
            <span className="text-base sm:text-lg font-black text-amber-400">
              {formatCurrency(product.basePrice)}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all duration-150"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Chọn</span>
          </button>
        </div>
      </div>
    </div>
  );
};
