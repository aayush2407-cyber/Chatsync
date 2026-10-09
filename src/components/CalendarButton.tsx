import React, { useState } from 'react';
import { Calendar, Check, Download } from 'lucide-react';
import { ExtractedItem } from '../types';
import { CalendarModal } from './CalendarModal';

interface CalendarButtonProps {
  item: ExtractedItem;
  className?: string;
  size?: 'sm' | 'md';
  variant?: 'outline' | 'ghost' | 'primary';
  showLabel?: boolean;
}

export const CalendarButton: React.FC<CalendarButtonProps> = ({
  item,
  className = '',
  size = 'sm',
  variant = 'outline',
  showLabel = true,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Only display if the item has a deadline or start time
  if (!item.deadline && !item.startTime) {
    return null;
  }

  const isSynced = Boolean(item.isCalendarSynced);

  const basePadding =
    size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm';

  const variantClass =
    variant === 'primary'
      ? 'bg-indigo-600 hover:bg-indigo-700 text-white font-semibold'
      : variant === 'ghost'
      ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
      : isSynced
      ? 'border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-medium'
      : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800';

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        aria-label={`Add ${item.title} to calendar`}
        className={`rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px] font-medium shrink-0 ${basePadding} ${variantClass} ${className}`}
        title={isSynced ? 'Synced to calendar — click to view options' : 'Add to Calendar'}
      >
        <Calendar className={`w-3.5 h-3.5 ${isSynced ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-500'}`} />
        {showLabel && (
          <span>{isSynced ? 'Synced' : 'Add to Calendar'}</span>
        )}
        {isSynced && (
          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
        )}
      </button>

      {isModalOpen && (
        <CalendarModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          item={item}
        />
      )}
    </>
  );
};
