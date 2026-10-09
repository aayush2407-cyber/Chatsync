import React, { useState, useRef, useEffect } from 'react';
import { Bell, BellRing, BellOff, Check, Sparkles } from 'lucide-react';
import { ReminderOffset } from '../types';

interface ReminderSelectorProps {
  currentOffset?: ReminderOffset;
  onSelectOffset: (offset: ReminderOffset) => void;
  onRequestPermission?: () => Promise<boolean>;
  disabled?: boolean;
}

export const ReminderSelector: React.FC<ReminderSelectorProps> = ({
  currentOffset = 'none',
  onSelectOffset,
  onRequestPermission,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const options: { offset: ReminderOffset; label: string; desc: string }[] = [
    { offset: '1h', label: '1 hour before', desc: 'Alert 60 minutes prior' },
    { offset: '3h', label: '3 hours before', desc: 'Alert 3 hours prior' },
    { offset: '1d', label: '1 day before', desc: 'Alert 24 hours prior' },
    { offset: 'none', label: 'No reminder', desc: 'Turn off notification' },
  ];

  const handleSelect = async (offset: ReminderOffset) => {
    if (offset !== 'none' && onRequestPermission) {
      await onRequestPermission();
    }
    onSelectOffset(offset);
    setIsOpen(false);
  };

  const hasReminder = currentOffset && currentOffset !== 'none';

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[32px] ${
          hasReminder
            ? 'bg-[#FEF08A] dark:bg-[#713F12] text-[#854D0E] dark:text-[#FEF08A] border border-[#CA8A04]'
            : 'bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] hover:bg-[#DDE3BE] dark:hover:bg-[#343C1F] border border-[#E3E6D3] dark:border-[#2B321A]'
        }`}
        title={hasReminder ? `Reminder set: ${currentOffset}` : 'Set a reminder'}
      >
        {hasReminder ? (
          <BellRing className="w-3.5 h-3.5 text-[#854D0E] dark:text-[#FEF08A] animate-bounce" />
        ) : (
          <Bell className="w-3.5 h-3.5" />
        )}
        <span>
          {currentOffset === '1d'
            ? '1d before'
            : currentOffset === '3h'
            ? '3h before'
            : currentOffset === '1h'
            ? '1h before'
            : 'Reminder'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full sm:bottom-auto sm:top-full mb-1.5 sm:mb-0 sm:mt-1.5 w-56 bg-white dark:bg-[#1D2112] rounded-2xl shadow-xl border border-[#E3E6D3] dark:border-[#2B321A] p-1.5 z-40 animate-in fade-in zoom-in-95">
          <div className="px-2.5 py-1.5 border-b border-[#E3E6D3] dark:border-[#2B321A] flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7059] dark:text-[#A4AA8E]">
              Set Reminder
            </span>
            <Sparkles className="w-3 h-3 text-[#D98324]" />
          </div>

          <div className="py-1 space-y-0.5">
            {options.map((opt) => {
              const isSelected = currentOffset === opt.offset;
              return (
                <button
                  key={opt.offset}
                  type="button"
                  onClick={() => handleSelect(opt.offset)}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] font-semibold'
                      : 'hover:bg-[#EEF1DC]/60 dark:hover:bg-[#283017]/60 text-[#2B2F1E] dark:text-[#EEF1DC]'
                  }`}
                >
                  <div>
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-[10px] text-[#6B7059] dark:text-[#A4AA8E]">{opt.desc}</div>
                  </div>
                  {isSelected ? (
                    <Check className="w-3.5 h-3.5 text-[#6B7A2A] dark:text-[#9AAE3C] shrink-0" />
                  ) : opt.offset === 'none' ? (
                    <BellOff className="w-3 h-3 text-[#6B7059] shrink-0" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
