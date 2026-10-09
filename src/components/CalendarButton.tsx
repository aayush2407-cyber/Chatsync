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
      ? 'bg-[#6B7A2A] hover:bg-[#5A6823] active:bg-[#4A561C] text-white font-semibold'
      : variant === 'ghost'
      ? 'text-[#6B7059] dark:text-[#A4AA8E] hover:bg-[#EEF1DC] dark:hover:bg-[#283017]'
      : isSynced
      ? 'border border-[#6B7A2A] bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] font-medium'
      : 'border border-[#E3E6D3] dark:border-[#2B321A] text-[#2B2F1E] dark:text-[#EEF1DC] hover:bg-[#EEF1DC] dark:hover:bg-[#283017]';

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        aria-label={`Add ${item.title} to calendar`}
        className={`rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px] font-medium shrink-0 ${basePadding} ${variantClass} ${className}`}
        title={isSynced ? 'Synced to calendar — click to view options' : 'Add to Calendar'}
      >
        <Calendar className={`w-3.5 h-3.5 ${isSynced ? 'text-[#6B7A2A] dark:text-[#9AAE3C]' : 'text-[#6B7A2A]'}`} />
        {showLabel && (
          <span>{isSynced ? 'Synced' : 'Add to Calendar'}</span>
        )}
        {isSynced && (
          <Check className="w-3 h-3 text-[#6B7A2A] dark:text-[#9AAE3C] stroke-[3]" />
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
