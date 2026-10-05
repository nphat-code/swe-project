'use client';

import React from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../lib/api';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  priority = false,
}) => {
  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group relative flex flex-row sm:flex-col items-center bg-white hover:bg-[#f9f9f9] border border-stone-200/80 hover:border-[#006241]/40 rounded-2xl p-3 sm:p-5 gap-3.5 sm:gap-2 overflow-hidden transition-all duration-300 hover:shadow-lg sm:hover:shadow-xl hover:shadow-stone-900/5 sm:hover:-translate-y-1 cursor-pointer active:scale-[0.99] sm:active:scale-100 h-full justify-between"
    >
      {/* Starbucks Iconic Circular Image: Ảnh tròn đặc trưng */}
      <div className="relative w-20 h-20 sm:w-32 sm:h-32 rounded-full overflow-hidden flex-shrink-0 bg-[#f2f0eb] shadow-md border-2 sm:border-4 border-white ring-1 ring-stone-200/70 group-hover:ring-[#006241]/30 transition-all duration-300">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 80px, 128px"
          className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          priority={priority}
          loading={priority ? undefined : 'lazy'}
        />
      </div>

      {/* Product Content */}
      <div className="flex flex-col flex-1 min-w-0 justify-between w-full sm:text-center">
        <div>
          {/* Category Tag */}
          {product.category && (
            <div className="mb-1">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#006241] bg-[#d4e9e2] px-2 py-0.5 rounded-full inline-block">
                {product.category.name}
              </span>
            </div>
          )}
          <h3 className="font-bold text-sm sm:text-base text-[#1e3932] group-hover:text-[#006241] transition-colors line-clamp-2 sm:h-12 flex items-center sm:justify-center mb-0.5 sm:mb-1">
            {product.name}
          </h3>
          <p className="text-xs text-[#595959] line-clamp-1 sm:line-clamp-2 leading-relaxed sm:h-9 sm:mb-2 sm:px-1">
            {product.description}
          </p>
        </div>

        {/* Footer: Price + Add Button (Pixel-perfect bottom alignment) */}
        <div className="flex items-center justify-between sm:justify-center sm:gap-3 mt-2 sm:mt-auto pt-1 sm:pt-2 border-t border-stone-100 sm:border-transparent">
          <div>
            <span className="text-sm sm:text-base font-black text-[#006241]">
              {formatCurrency(product.basePrice)}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="flex items-center justify-center gap-1.5 w-8 h-8 sm:w-auto sm:h-auto sm:px-4 sm:py-1.5 rounded-full bg-[#006241] hover:bg-[#00754a] text-white font-bold text-xs shadow-md shadow-[#006241]/20 active:scale-90 sm:active:scale-95 transition-all duration-150"
            aria-label={`Chọn món ${product.name}`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Chọn món</span>
          </button>
        </div>
      </div>
    </div>
  );
};
