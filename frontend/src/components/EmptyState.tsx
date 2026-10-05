import React from 'react';
import { Coffee, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  onReset?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'Không tìm thấy món nước nào phù hợp.',
  onReset,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-[#f2f0eb]/60 border border-dashed border-stone-300 rounded-3xl my-6">
      <div className="w-16 h-16 rounded-full bg-[#d4e9e2] flex items-center justify-center text-[#006241] mb-4 shadow-sm">
        <Coffee className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-[#1e3932] mb-1">Chưa có món phù hợp</h3>
      <p className="text-sm text-[#595959] max-w-md mb-6">{message}</p>
      {onReset && (
        <button
          onClick={onReset}
          type="button"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#006241] hover:bg-[#00754a] text-white text-sm font-bold transition-all shadow-sm active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Xem tất cả món</span>
        </button>
      )}
    </div>
  );
};
