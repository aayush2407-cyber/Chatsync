import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-10 h-10 rounded-2xl" />
        <Skeleton className="w-14 h-5 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-24 h-4 rounded-md" />
        <Skeleton className="w-16 h-7 rounded-lg" />
      </div>
      <Skeleton className="w-full h-3 rounded-md" />
    </div>
  );
};

export const ItemRowSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start gap-3 sm:gap-4">
      <Skeleton className="w-6 h-6 rounded-lg shrink-0 mt-0.5" />
      <div className="flex-1 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="w-1/2 h-5 rounded-md" />
          <Skeleton className="w-20 h-5 rounded-full" />
        </div>
        <Skeleton className="w-3/4 h-3.5 rounded-md" />
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="w-24 h-4 rounded-md" />
          <Skeleton className="w-16 h-4 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export const ChatCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-11 h-11 rounded-2xl" />
          <div className="space-y-1.5">
            <Skeleton className="w-32 h-4 rounded-md" />
            <Skeleton className="w-20 h-3 rounded-md" />
          </div>
        </div>
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
      <Skeleton className="w-full h-8 rounded-xl" />
    </div>
  );
};
