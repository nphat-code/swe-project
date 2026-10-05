import React from 'react';

export const ProductSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col bg-stone-900/40 border border-stone-800/60 rounded-2xl overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full aspect-[4/3] bg-stone-800/60" />

      {/* Content Skeleton */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-4">
        <div className="space-y-2.5">
          <div className="h-5 bg-stone-800 rounded-md w-3/4" />
          <div className="h-3.5 bg-stone-800/60 rounded-md w-full" />
          <div className="h-3.5 bg-stone-800/60 rounded-md w-2/3" />
        </div>

        <div className="pt-3 border-t border-stone-800/60 flex items-center justify-between">
          <div className="h-6 bg-stone-800 rounded-md w-20" />
          <div className="h-8 bg-stone-800 rounded-xl w-16" />
        </div>
      </div>
    </div>
  );
};
