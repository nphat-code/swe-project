import React from 'react';

export const ProductSkeleton: React.FC = () => {
  return (
    <div className="flex flex-row sm:flex-col bg-white border border-brand-cream rounded-2xl sm:rounded-card p-3 sm:p-0 gap-3.5 sm:gap-0 overflow-hidden animate-pulse shadow-xs">
      {/* Image Skeleton */}
      <div className="w-24 h-24 sm:w-full sm:aspect-[4/3] flex-shrink-0 bg-brand-cream/60 rounded-xl sm:rounded-none" />

      {/* Content Skeleton */}
      <div className="flex flex-col flex-1 min-w-0 justify-between sm:p-5 space-y-2 sm:space-y-4">
        <div className="space-y-1.5 sm:space-y-2.5">
          <div className="h-4 sm:h-5 bg-brand-cream rounded-md w-3/4" />
          <div className="h-3 sm:h-3.5 bg-brand-oat rounded-md w-full" />
        </div>

        <div className="flex items-center justify-between sm:pt-3 sm:border-t sm:border-brand-cream/80">
          <div className="h-4 sm:h-6 bg-brand-cream rounded-md w-16 sm:w-20" />
          <div className="w-8 h-8 sm:w-16 sm:h-8 bg-brand-cream/80 rounded-lg sm:rounded-xl" />
        </div>
      </div>
    </div>
  );
};
