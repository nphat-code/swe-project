'use client';

import React from 'react';
import { Category } from '../types';
import { Coffee, Flame, Sparkles, CupSoda, CakeSlice, GlassWater } from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  totalProductsCount: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  totalProductsCount,
}) => {
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'ca-phe-viet':
        return <Coffee className="w-4 h-4" />;
      case 'ca-phe-may':
        return <Flame className="w-4 h-4" />;
      case 'tra-trai-cay':
        return <Sparkles className="w-4 h-4" />;
      case 'tra-sua-da-xay':
        return <CupSoda className="w-4 h-4" />;
      case 'banh-ngot':
        return <CakeSlice className="w-4 h-4" />;
      default:
        return <GlassWater className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-2 sm:gap-3 min-w-max pb-1">
        {/* Nút 'Tất cả' */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 border ${
            selectedCategory === 'all'
              ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-500/20 scale-[1.02]'
              : 'bg-stone-900/80 text-stone-300 border-stone-800 hover:border-stone-700 hover:text-white hover:bg-stone-800'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>Tất cả món</span>
          <span
            className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
              selectedCategory === 'all'
                ? 'bg-stone-950/20 text-stone-950'
                : 'bg-stone-800 text-stone-400'
            }`}
          >
            {totalProductsCount}
          </span>
        </button>

        {/* Danh sách danh mục từ Database */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          const count = cat._count?.products ?? 0;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                isSelected
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-500/20 scale-[1.02]'
                  : 'bg-stone-900/80 text-stone-300 border-stone-800 hover:border-stone-700 hover:text-white hover:bg-stone-800'
              }`}
            >
              {getCategoryIcon(cat.slug)}
              <span>{cat.name}</span>
              {count > 0 && (
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isSelected
                      ? 'bg-stone-950/20 text-stone-950'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
