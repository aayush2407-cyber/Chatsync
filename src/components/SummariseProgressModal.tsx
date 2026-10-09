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
      <div className="bg-white dark:bg-[#1D2112] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E3E6D3] dark:border-[#2B321A] text-center space-y-5">
        {isLoading ? (
          <>
            <div className="w-16 h-16 rounded-3xl bg-[#EEF1DC] dark:bg-[#283017] text-[#6B7A2A] dark:text-[#9AAE3C] flex items-center justify-center mx-auto shadow-inner">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#2B2F1E] dark:text-[#EEF1DC]">
                Reading your chat...
              </h3>
              <p className="text-xs sm:text-sm text-[#6B7059] dark:text-[#A4AA8E] leading-relaxed">
                {progressText || 'Extracting deadlines, assignments, and announcements with AI.'}
              </p>
            </div>

            {/* Subtle animated bar */}
            <div className="w-full bg-[#E3E6D3] dark:bg-[#2B321A] rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#6B7A2A] h-1.5 rounded-full animate-pulse w-3/4 mx-auto" />
            </div>

            <p className="text-[11px] text-[#6B7059] dark:text-[#A4AA8E]">
              Casual messages and memes are automatically filtered out.
            </p>
          </>
        ) : error ? (
          <>
            <div className="w-16 h-16 rounded-3xl bg-[#FEF2F2] dark:bg-[#2A1215] text-[#C0392B] flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#2B2F1E] dark:text-[#EEF1DC]">
                Could not summarise right now
              </h3>
              <p className="text-xs sm:text-sm text-[#C0392B] leading-relaxed">
                Couldn't summarise right now. Try again.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#E3E6D3] dark:border-[#2B321A] hover:bg-[#EEF1DC] dark:hover:bg-[#283017] text-xs font-semibold text-[#2B2F1E] dark:text-[#EEF1DC] min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={onRetry}
                className="px-5 py-2.5 rounded-xl bg-[#6B7A2A] hover:bg-[#5A6823] active:bg-[#4A561C] text-white text-xs font-semibold min-h-[44px] cursor-pointer flex items-center gap-1.5 shadow-xs"
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
