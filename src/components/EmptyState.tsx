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
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white dark:bg-[#1D2112] border border-[#E3E6D3] dark:border-[#2B321A] rounded-3xl shadow-sm my-6 max-w-xl mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-[#EEF1DC] dark:bg-[#283017] text-[#6B7A2A] dark:text-[#9AAE3C] flex items-center justify-center mb-4 transition-transform hover:scale-105">
        <Icon className="w-8 h-8" />
      </div>

      <p className="text-base sm:text-lg font-medium text-[#2B2F1E] dark:text-[#EEF1DC] mb-6 max-w-md">
        {text}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <button
          onClick={onAction}
          className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-[#6B7A2A] hover:bg-[#5A6823] active:bg-[#4A561C] text-white font-medium text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center cursor-pointer"
        >
          {actionText}
        </button>

        {showDemoAction && (
          <button
            onClick={loadDemoMode}
            className="w-full sm:w-auto min-h-[48px] px-5 py-3 text-[#3F4A16] dark:text-[#EEF1DC] bg-[#EEF1DC] dark:bg-[#283017] hover:bg-[#DDE3BE] dark:hover:bg-[#343C1F] text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#6B7A2A] dark:text-[#9AAE3C]" />
            <span>Try demo mode</span>
          </button>
        )}
      </div>
    </div>
  );
};
