'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Coffee,
  Eye,
  EyeOff,
  Loader2,
  X,
} from 'lucide-react';
import { loginUser, registerUser } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { AuthUser } from '../types';

type AuthMode = 'login' | 'register';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
  onSuccess?: (user: AuthUser) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s]{8,15}$/;

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const setAuth = useAuthStore((state) => state.setAuth);

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleSwitchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrorMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const normalizedEmail = email.trim();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setErrorMessage('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }

    if (mode === 'register') {
      if (fullName.trim().length < 2) {
        setErrorMessage('Họ tên phải có ít nhất 2 ký tự');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự');
        return;
      }
      if (phone.trim() && !PHONE_REGEX.test(phone.trim())) {
        setErrorMessage('Số điện thoại không hợp lệ (8-15 chữ số)');
        return;
      }
    } else if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu');
      return;
    }

    setIsSubmitting(true);
    try {
      const response =
        mode === 'login'
          ? await loginUser({ email: normalizedEmail, password })
          : await registerUser({
              email: normalizedEmail,
              password,
              fullName: fullName.trim(),
              phone: phone.trim() || undefined,
            });

      setAuth(response);
      onSuccess?.(response.user);
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Xác thực tài khoản thất bại'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle =
    mode === 'login' ? 'Đăng nhập BrewLite' : 'Đăng ký thành viên BrewLite';

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={modalTitle}
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-200"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2.5 sm:hidden" />

        <div className="px-5 pt-3 sm:pt-5 pb-4 border-b border-stone-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#006241] text-white flex items-center justify-center shadow-md shadow-[#006241]/25">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#1e3932]">
                {modalTitle}
              </h2>
              <p className="text-xs text-[#595959]">
                Đặt món không tiền mặt & tích điểm thưởng tự động
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ tài khoản"
            className="p-1.5 rounded-full bg-[#f2f0eb] hover:bg-stone-200 text-stone-500 hover:text-[#1e3932] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-full bg-[#f2f0eb]">
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className={`py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#006241] shadow-xs'
                  : 'text-[#595959] hover:text-[#1e3932]'
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('register')}
              className={`py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                mode === 'register'
                  ? 'bg-white text-[#006241] shadow-xs'
                  : 'text-[#595959] hover:text-[#1e3932]'
              }`}
            >
              Đăng ký
            </button>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label
                  htmlFor="auth-fullname"
                  className="block text-xs font-bold text-[#1e3932]"
                >
                  Họ và tên
                </label>
                <input
                  id="auth-fullname"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Nguyễn Minh Khách"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f9f9f9] border border-stone-200 focus:border-[#006241] focus:bg-white text-sm text-[#212121] placeholder-stone-400 outline-none"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="auth-email"
                className="block text-xs font-bold text-[#1e3932]"
              >
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="customer@brewlite.vn"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#f9f9f9] border border-stone-200 focus:border-[#006241] focus:bg-white text-sm text-[#212121] placeholder-stone-400 outline-none"
              />
            </div>

            {mode === 'register' && (
              <div className="space-y-1.5">
                <label
                  htmlFor="auth-phone"
                  className="block text-xs font-bold text-[#1e3932]"
                >
                  Số điện thoại <span className="text-[#595959] font-normal">(tùy chọn)</span>
                </label>
                <input
                  id="auth-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="0901234567"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f9f9f9] border border-stone-200 focus:border-[#006241] focus:bg-white text-sm text-[#212121] placeholder-stone-400 outline-none"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="auth-password"
                className="block text-xs font-bold text-[#1e3932]"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  required
                  className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-[#f9f9f9] border border-stone-200 focus:border-[#006241] focus:bg-white text-sm text-[#212121] placeholder-stone-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#1e3932] p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-full bg-[#006241] hover:bg-[#00754a] disabled:opacity-60 text-white font-bold text-sm sm:text-base shadow-md shadow-[#006241]/25 transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
