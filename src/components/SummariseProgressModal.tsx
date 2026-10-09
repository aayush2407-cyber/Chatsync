import React from 'react';
import { RefreshCw, AlertCircle, Sparkles, X } from 'lucide-react';

interface SummariseProgressModalProps {
  isLoading: boolean;
  progressText: string;
  error: string | null;
  onRetry: () => void;
  onClose: () => void;
}

export const SummariseProgressModal: React.FC<SummariseProgressModalProps> = ({
  isLoading,
  progressText,
  error,
  onRetry,
  onClose,
}) => {
  if (!isLoading && !error) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-5">
        {isLoading ? (
          <>
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Reading your chat...
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {progressText || 'Extracting deadlines, assignments, and announcements with AI.'}
              </p>
            </div>

            {/* Subtle animated bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-600 h-1.5 rounded-full animate-pulse w-3/4 mx-auto" />
            </div>

            <p className="text-[11px] text-slate-400">
              Casual messages and memes are automatically filtered out.
            </p>
          </>
        ) : error ? (
          <>
            <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Could not summarise right now
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Couldn't summarise right now. Try again.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={onRetry}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold min-h-[44px] cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
