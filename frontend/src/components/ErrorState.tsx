import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng hoặc thử lại sau.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-red-50/50 border border-red-200/80 rounded-3xl my-6">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4 shadow-sm">
        <WifiOff className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-red-950 mb-1">Lỗi kết nối máy chủ</h3>
      <p className="text-sm text-red-700/80 max-w-md mb-6">{message}</p>
      <button
        onClick={onRetry}
        type="button"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all shadow-sm active:scale-95"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Thử lại kết nối</span>
      </button>
    </div>
  );
};
