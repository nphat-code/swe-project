'use client';

import React from 'react';
import { Coffee, LogIn, LogOut, ShoppingBag, Sparkles, User } from 'lucide-react';
import Link from 'next/link';
import { AuthUser } from '../types';

interface HeaderProps {
  cartCount?: number;
  onOpenCart?: () => void;
  user?: AuthUser | null;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount = 0,
  onOpenCart,
  user = null,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-stone-200/80 transition-all duration-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#006241] flex items-center justify-center text-white shadow-md shadow-[#006241]/25 group-hover:scale-105 transition-transform duration-200">
              <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-2xl font-black tracking-tight text-[#1e3932] group-hover:text-[#006241] transition-colors">
                Brew<span className="text-[#006241]">Lite</span>
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-[#f2f0eb] pl-2.5 pr-1.5 py-1 sm:py-1.5 rounded-full min-w-0">
                <User className="w-4 h-4 text-[#006241] flex-shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-[#1e3932] truncate max-w-[96px] sm:max-w-[160px]">
                  {user.fullName}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-[#006241] bg-[#d4e9e2] px-2 py-0.5 rounded-full flex-shrink-0">
                  <Sparkles className="w-3 h-3 text-[#cba258]" />
                  {user.loyaltyPoints} điểm
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  aria-label="Đăng xuất"
                  className="p-1.5 rounded-full bg-white hover:bg-rose-50 text-stone-500 hover:text-rose-600 transition-colors flex-shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                aria-label="Đăng nhập"
                className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full border border-stone-200 bg-white hover:border-[#006241] hover:bg-[#d4e9e2]/30 text-[#1e3932] hover:text-[#006241] transition-all duration-200 active:scale-95 text-xs sm:text-sm font-bold flex-shrink-0"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </button>
            )}

            <button
              onClick={onOpenCart}
              type="button"
              className="relative flex items-center gap-2.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-[#f2f0eb] hover:bg-[#d4e9e2] text-[#1e3932] hover:text-[#006241] transition-all duration-200 active:scale-95 group shadow-2xs font-semibold flex-shrink-0"
              aria-label="Giỏ hàng"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-[#1e3932] group-hover:text-[#006241] transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#006241] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm font-bold hidden sm:inline">
                Giỏ hàng
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
