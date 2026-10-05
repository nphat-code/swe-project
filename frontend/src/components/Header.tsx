'use client';

import React from 'react';
import { Coffee, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  cartCount?: number;
  onOpenCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ cartCount = 0, onOpenCart }) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-surface/90 border-b border-brand-cream/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-card bg-gradient-to-tr from-brand-espresso to-brand-terracotta flex items-center justify-center text-white shadow-md shadow-brand-terracotta/20 group-hover:scale-105 transition-transform duration-200">
              <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-brand-espresso group-hover:text-brand-terracotta transition-colors">
              Brew<span className="text-brand-terracotta">Lite</span>
            </span>
          </Link>

          {/* Right Action: Cart button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenCart}
              type="button"
              className="relative flex items-center gap-2.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-brand-oat hover:bg-brand-cream border border-brand-cream text-brand-espresso transition-all duration-200 active:scale-95 group shadow-sm"
              aria-label="Giỏ hàng"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-brand-espresso group-hover:text-brand-terracotta transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-terracotta text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-brand-espresso group-hover:text-brand-terracotta hidden xs:inline">
                Giỏ hàng
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
