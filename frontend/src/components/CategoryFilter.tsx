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
          className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-pill text-xs sm:text-sm font-semibold transition-all duration-200 border ${
            selectedCategory === 'all'
              ? 'bg-brand-espresso text-white border-brand-espresso shadow-md shadow-brand-espresso/20 scale-[1.02]'
              : 'bg-brand-oat text-content-primary border-brand-cream/80 hover:bg-brand-cream hover:text-brand-espresso'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>Tất cả món</span>
          <span
            className={`ml-1 px-2 py-0.5 rounded-pill text-[11px] font-bold ${
              selectedCategory === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-brand-cream text-brand-espresso'
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
              className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-pill text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                isSelected
                  ? 'bg-brand-espresso text-white border-brand-espresso shadow-md shadow-brand-espresso/20 scale-[1.02]'
                  : 'bg-brand-oat text-content-primary border-brand-cream/80 hover:bg-brand-cream hover:text-brand-espresso'
              }`}
            >
              {getCategoryIcon(cat.slug)}
              <span>{cat.name}</span>
              {count > 0 && (
                <span
                  className={`ml-1 px-2 py-0.5 rounded-pill text-[11px] font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-brand-cream text-brand-espresso'
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
