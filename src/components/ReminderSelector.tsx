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
            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
        }`}
        title={hasReminder ? `Reminder set: ${currentOffset}` : 'Set a reminder'}
      >
        {hasReminder ? (
          <BellRing className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-bounce" />
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
        <div className="absolute right-0 bottom-full sm:bottom-auto sm:top-full mb-1.5 sm:mb-0 sm:mt-1.5 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-40 animate-in fade-in zoom-in-95">
          <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Set Reminder
            </span>
            <Sparkles className="w-3 h-3 text-amber-500" />
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
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-[10px] text-slate-400">{opt.desc}</div>
                  </div>
                  {isSelected ? (
                    <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  ) : opt.offset === 'none' ? (
                    <BellOff className="w-3 h-3 text-slate-400 shrink-0" />
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
