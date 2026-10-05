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
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-brand-oat/60 border border-dashed border-brand-cream rounded-3xl my-6">
      <div className="w-16 h-16 rounded-2xl bg-brand-cream border border-brand-cream/80 flex items-center justify-center text-brand-terracotta mb-4 shadow-sm">
        <Coffee className="w-8 h-8 opacity-80" />
      </div>
      <h3 className="text-lg font-bold text-brand-espresso mb-1">Menu chưa có món này</h3>
      <p className="text-sm text-content-muted max-w-md mb-6">{message}</p>
      {onReset && (
        <button
          onClick={onReset}
          type="button"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-espresso hover:bg-[#2a170d] text-white text-sm font-semibold transition-all shadow-sm active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Xem tất cả món</span>
        </button>
      )}
    </div>
  );
};
