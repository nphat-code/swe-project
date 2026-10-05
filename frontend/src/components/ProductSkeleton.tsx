import React from 'react';

export const ProductSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col bg-white border border-brand-cream rounded-card overflow-hidden animate-pulse shadow-sm">
      {/* Image Skeleton */}
      <div className="w-full aspect-[4/3] bg-brand-cream/60" />

      {/* Content Skeleton */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-4">
        <div className="space-y-2.5">
          <div className="h-5 bg-brand-cream rounded-md w-3/4" />
          <div className="h-3.5 bg-brand-oat rounded-md w-full" />
          <div className="h-3.5 bg-brand-oat rounded-md w-2/3" />
        </div>

        <div className="pt-3 border-t border-brand-cream/80 flex items-center justify-between">
          <div className="h-6 bg-brand-cream rounded-md w-20" />
          <div className="h-8 bg-brand-cream/80 rounded-xl w-16" />
        </div>
      </div>
    </div>
  );
};
