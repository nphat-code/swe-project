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
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-stone-200/80 transition-all duration-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#006241] flex items-center justify-center text-white shadow-md shadow-[#006241]/25 group-hover:scale-105 transition-transform duration-200">
              <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#1e3932] group-hover:text-[#006241] transition-colors">
                Brew<span className="text-[#006241]">Lite</span>
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenCart}
              type="button"
              className="relative flex items-center gap-2.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-[#f2f0eb] hover:bg-[#d4e9e2] text-[#1e3932] hover:text-[#006241] transition-all duration-200 active:scale-95 group shadow-2xs font-semibold"
              aria-label="Giỏ hàng"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-[#1e3932] group-hover:text-[#006241] transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#006241] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm font-bold hidden xs:inline">
                Giỏ hàng
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
