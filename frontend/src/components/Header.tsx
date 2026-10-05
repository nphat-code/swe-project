'use client';

import React from 'react';
import { Coffee, ShoppingBag, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  cartCount?: number;
  onOpenCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ cartCount = 0, onOpenCart }) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-stone-950/80 border-b border-stone-800/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-900/30 group-hover:scale-105 transition-transform duration-200">
              <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-stone-100 group-hover:text-amber-400 transition-colors">
                  Brew<span className="text-amber-500">Lite</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Sparkles className="w-3 h-3 mr-1" /> Cashless Coffee
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">Đặt cà phê tức thì • Không tiền mặt</p>
            </div>
          </Link>

          {/* Right Action: Cart button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenCart}
              type="button"
              className="relative flex items-center gap-2.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700/60 hover:border-amber-500/50 text-stone-200 transition-all duration-200 active:scale-95 group shadow-sm"
              aria-label="Giỏ hàng"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-stone-300 group-hover:text-amber-400 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm font-medium text-stone-300 group-hover:text-white hidden xs:inline">
                Giỏ hàng
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
