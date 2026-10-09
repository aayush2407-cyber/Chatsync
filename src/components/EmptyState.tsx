import React from 'react';
import { LucideIcon, Sparkles } from 'lucide-react';
import { useSyncPulse } from '../context/SyncPulseContext';

interface EmptyStateProps {
  icon: LucideIcon;
  text: string;
  actionText: string;
  onAction: () => void;
  showDemoAction?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  text,
  actionText,
  onAction,
  showDemoAction = true,
}) => {
  const { loadDemoMode } = useSyncPulse();

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl shadow-sm my-6 max-w-xl mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 transition-transform hover:scale-105">
        <Icon className="w-8 h-8" />
      </div>

      <p className="text-base sm:text-lg font-medium text-slate-700 dark:text-slate-200 mb-6 max-w-md">
        {text}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <button
          onClick={onAction}
          className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center cursor-pointer"
        >
          {actionText}
        </button>

        {showDemoAction && (
          <button
            onClick={loadDemoMode}
            className="w-full sm:w-auto min-h-[48px] px-5 py-3 text-indigo-600 dark:text-indigo-300 hover:text-indigo-700 dark:hover:text-white bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Try demo mode</span>
          </button>
        )}
      </div>
    </div>
  );
};
