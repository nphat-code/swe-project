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
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-stone-900/30 border border-dashed border-stone-800 rounded-3xl my-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4">
        <Coffee className="w-8 h-8 opacity-70" />
      </div>
      <h3 className="text-lg font-bold text-stone-200 mb-1">Menu chưa có món này</h3>
      <p className="text-sm text-stone-400 max-w-md mb-6">{message}</p>
      {onReset && (
        <button
          onClick={onReset}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm font-semibold transition-colors border border-stone-700 active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Xem tất cả món</span>
        </button>
      )}
    </div>
  );
};
