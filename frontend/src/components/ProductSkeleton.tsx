import React from 'react';

export const ProductSkeleton: React.FC = () => {
  return (
    <div className="flex flex-row sm:flex-col items-center bg-white border border-stone-200/70 rounded-2xl p-3 sm:p-5 gap-3.5 sm:gap-2 overflow-hidden animate-pulse shadow-2xs">
      <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full flex-shrink-0 bg-stone-200/80" />

      <div className="flex flex-col flex-1 min-w-0 justify-between w-full sm:items-center space-y-2">
        <div className="space-y-1.5 w-full sm:flex sm:flex-col sm:items-center">
          <div className="h-3.5 bg-stone-200/80 rounded-full w-16" />
          <div className="h-4 sm:h-5 bg-stone-200 rounded-md w-3/4" />
          <div className="h-3 bg-stone-200/60 rounded-md w-full sm:w-2/3" />
        </div>

        <div className="flex items-center justify-between sm:justify-center sm:gap-3 w-full pt-1">
          <div className="h-4 bg-stone-200 rounded-md w-16" />
          <div className="w-8 h-8 sm:w-20 sm:h-7 bg-stone-200/80 rounded-full" />
        </div>
      </div>
    </div>
  );
};
