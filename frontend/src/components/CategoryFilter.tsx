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
    <div className="w-full overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-2 min-w-max pb-1">
        <button
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 border ${
            selectedCategory === 'all'
              ? 'bg-[#006241] text-white border-[#006241] shadow-sm shadow-[#006241]/20 scale-[1.02]'
              : 'bg-[#f2f0eb] text-[#212121] border-transparent hover:bg-[#e6e2da] hover:text-[#006241]'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>Tất cả món</span>
          <span
            className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
              selectedCategory === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-white/80 text-[#595959]'
            }`}
          >
            {totalProductsCount}
          </span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          const count = cat._count?.products ?? 0;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 border ${
                isSelected
                  ? 'bg-[#006241] text-white border-[#006241] shadow-sm shadow-[#006241]/20 scale-[1.02]'
                  : 'bg-[#f2f0eb] text-[#212121] border-transparent hover:bg-[#e6e2da] hover:text-[#006241]'
              }`}
            >
              {getCategoryIcon(cat.slug)}
              <span>{cat.name}</span>
              {count > 0 && (
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-white/80 text-[#595959]'
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
