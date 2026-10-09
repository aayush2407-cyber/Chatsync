import React, { useState, useEffect } from 'react';
import {
  Bell,
  Clock,
  Calendar,
  X,
  Check,
  Trash2,
  Sparkles,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { Message, ExtractedItem, MessageReminder } from '../types';
import { useSyncPulse } from '../context/SyncPulseContext';

interface MessageReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message | null;
  item?: ExtractedItem | null;
}

export const MessageReminderModal: React.FC<MessageReminderModalProps> = ({
  isOpen,
  onClose,
  message,
  item,
}) => {
  const {
    chats,
    messageReminders,
    addMessageReminder,
    updateMessageReminder,
    deleteMessageReminder,
    snoozeMessageReminder,
    showToast,
  } = useSyncPulse();

  // Find existing reminder linked to this message if one exists
  const existingReminder = message
    ? messageReminders.find((r) => r.messageId === message.id)
    : null;

  // Form states
  const [selectedPreset, setSelectedPreset] = useState<'1h' | 'tonight' | 'tomorrow' | 'custom'>('1h');
  const [customDateTime, setCustomDateTime] = useState('');
  const [note, setNote] = useState('');

  // Calculate preset timestamps
  const getPresetDate = (preset: '1h' | 'tonight' | 'tomorrow'): Date => {
    const now = new Date();
    if (preset === '1h') {
      return new Date(now.getTime() + 60 * 60 * 1000);
    }
    if (preset === 'tonight') {
      const tonight = new Date(now);
      tonight.setHours(20, 0, 0, 0); // 8:00 PM
      // If it is already past 8:00 PM, set to tomorrow 8:00 PM
      if (tonight.getTime() <= now.getTime()) {
        tonight.setDate(tonight.getDate() + 1);
      }
      return tonight;
    }
    if (preset === 'tomorrow') {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0); // 9:00 AM
      return tomorrow;
    }
    return new Date(now.getTime() + 60 * 60 * 1000);
  };

  // Convert Date to datetime-local input string YYYY-MM-DDTHH:mm
  const formatForDateTimeInput = (date: Date): string => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const h = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${y}-${m}-${d}T${h}:${min}`;
  };

  useEffect(() => {
    if (isOpen) {
      if (existingReminder) {
        setNote(existingReminder.note || '');
        setCustomDateTime(formatForDateTimeInput(new Date(existingReminder.remindAt)));
        setSelectedPreset('custom');
      } else {
        // Default note can be empty or suggested based on detected item
        setNote(item?.title ? `Review ${item.title}` : '');
        setSelectedPreset('1h');
        const defaultDate = getPresetDate('1h');
        setCustomDateTime(formatForDateTimeInput(defaultDate));
      }
    }
  }, [isOpen, existingReminder, item]);

  if (!isOpen || !message) return null;

  const chat = chats.find((c) => c.id === message.chatId);
  const chatName = chat?.name || 'Class Chat';

  const handlePresetClick = (preset: '1h' | 'tonight' | 'tomorrow' | 'custom') => {
    setSelectedPreset(preset);
    if (preset !== 'custom') {
      const d = getPresetDate(preset);
      setCustomDateTime(formatForDateTimeInput(d));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetDate: Date;
    if (selectedPreset === 'custom') {
      if (!customDateTime) {
        showToast('Please select a reminder date and time');
        return;
      }
      targetDate = new Date(customDateTime);
      if (isNaN(targetDate.getTime())) {
        showToast('Invalid date format');
        return;
      }
    } else {
      targetDate = getPresetDate(selectedPreset);
    }

    if (targetDate.getTime() <= Date.now()) {
      showToast('Please choose a time in the future');
      return;
    }

    const title = item?.title || message.text.slice(0, 60);
    const deadline = item?.deadline || null;

    if (existingReminder) {
      updateMessageReminder({
        ...existingReminder,
        remindAt: targetDate.toISOString(),
        note: note.trim(),
        status: 'pending',
        title,
        deadline,
      });
      showToast(`Reminder updated for ${targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}!`);
    } else {
      addMessageReminder({
        messageId: message.id,
        chatId: message.chatId,
        remindAt: targetDate.toISOString(),
        note: note.trim(),
        title,
        deadline,
        sourceText: message.text,
        sender: message.sender,
      });
      showToast(`Reminder set for ${targetDate.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}!`);
    }

    onClose();
  };

  const handleDelete = () => {
    if (existingReminder) {
      deleteMessageReminder(existingReminder.id);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminder-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 id="reminder-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                {existingReminder ? 'Edit Reminder' : 'Set Reminder'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {chatName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message preview snippet */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/70 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <span className="font-semibold text-slate-800 dark:text-slate-200">{message.sender}</span>
            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <p className="line-clamp-2 italic text-slate-600 dark:text-slate-300">
            "{message.text}"
          </p>
          {item && (
            <div className="pt-1 flex items-center gap-1.5 text-[11px] text-[#6B7A2A] dark:text-[#9AAE3C] font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>Detected: {item.title}</span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7059] dark:text-[#A4AA8E] mb-2">
              Remind Me When?
            </label>

            {/* Quick choices grid */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handlePresetClick('1h')}
                className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer min-h-[44px] ${
                  selectedPreset === '1h'
                    ? 'border-[#6B7A2A] bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] ring-2 ring-[#6B7A2A]/20'
                    : 'border-[#E3E6D3] dark:border-[#2B321A] hover:bg-[#EEF1DC]/50 dark:hover:bg-[#283017]/50 text-[#2B2F1E] dark:text-[#EEF1DC]'
                }`}
              >
                <Clock className="w-4 h-4 text-[#6B7A2A] shrink-0" />
                <div className="text-left leading-tight">
                  <div>In 1 hour</div>
                  <div className="text-[10px] text-[#6B7059] dark:text-[#A4AA8E] font-normal">
                    {getPresetDate('1h').toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePresetClick('tonight')}
                className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer min-h-[44px] ${
                  selectedPreset === 'tonight'
                    ? 'border-[#6B7A2A] bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] ring-2 ring-[#6B7A2A]/20'
                    : 'border-[#E3E6D3] dark:border-[#2B321A] hover:bg-[#EEF1DC]/50 dark:hover:bg-[#283017]/50 text-[#2B2F1E] dark:text-[#EEF1DC]'
                }`}
              >
                <Bell className="w-4 h-4 text-[#D98324] shrink-0" />
                <div className="text-left leading-tight">
                  <div>Tonight 8 pm</div>
                  <div className="text-[10px] text-[#6B7059] dark:text-[#A4AA8E] font-normal">8:00 PM</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePresetClick('tomorrow')}
                className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer min-h-[44px] ${
                  selectedPreset === 'tomorrow'
                    ? 'border-[#6B7A2A] bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] ring-2 ring-[#6B7A2A]/20'
                    : 'border-[#E3E6D3] dark:border-[#2B321A] hover:bg-[#EEF1DC]/50 dark:hover:bg-[#283017]/50 text-[#2B2F1E] dark:text-[#EEF1DC]'
                }`}
              >
                <Calendar className="w-4 h-4 text-[#6B7A2A] shrink-0" />
                <div className="text-left leading-tight">
                  <div>Tomorrow morning</div>
                  <div className="text-[10px] text-[#6B7059] dark:text-[#A4AA8E] font-normal">9:00 AM</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePresetClick('custom')}
                className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer min-h-[44px] ${
                  selectedPreset === 'custom'
                    ? 'border-[#6B7A2A] bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] ring-2 ring-[#6B7A2A]/20'
                    : 'border-[#E3E6D3] dark:border-[#2B321A] hover:bg-[#EEF1DC]/50 dark:hover:bg-[#283017]/50 text-[#2B2F1E] dark:text-[#EEF1DC]'
                }`}
              >
                <Calendar className="w-4 h-4 text-[#6B7A2A] shrink-0" />
                <div className="text-left leading-tight">
                  <div>Pick date & time</div>
                  <div className="text-[10px] text-[#6B7059] dark:text-[#A4AA8E] font-normal">Custom</div>
                </div>
              </button>
            </div>

            {/* Custom Date/Time input */}
            {selectedPreset === 'custom' && (
              <div className="mt-3 animate-in fade-in duration-150">
                <label className="block text-[11px] font-medium text-[#6B7059] dark:text-[#A4AA8E] mb-1">
                  Choose exact date and time:
                </label>
                <input
                  type="datetime-local"
                  required
                  value={customDateTime}
                  onChange={(e) => setCustomDateTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E6D3] dark:border-[#2B321A] bg-white dark:bg-[#1D2112] text-xs sm:text-sm text-[#2B2F1E] dark:text-[#EEF1DC] focus:outline-none focus:ring-2 focus:ring-[#6B7A2A] min-h-[44px]"
                />
              </div>
            )}
          </div>

          {/* Note field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7059] dark:text-[#A4AA8E] mb-1.5">
              Note (optional)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Ask TA during lab, upload homework zip, print slides..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E6D3] dark:border-[#2B321A] bg-white dark:bg-[#1D2112] text-xs sm:text-sm text-[#2B2F1E] dark:text-[#EEF1DC] focus:outline-none focus:ring-2 focus:ring-[#6B7A2A] placeholder:text-[#6B7059]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            {existingReminder ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 text-[#C0392B] hover:bg-[#FEF2F2] dark:hover:bg-[#2A1215] rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer min-h-[40px] transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl border border-[#E3E6D3] dark:border-[#2B321A] text-xs font-semibold text-[#2B2F1E] dark:text-[#EEF1DC] hover:bg-[#EEF1DC] dark:hover:bg-[#283017] min-h-[40px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#6B7A2A] hover:bg-[#5A6823] active:bg-[#4A561C] text-white rounded-xl text-xs font-semibold min-h-[40px] cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{existingReminder ? 'Update Reminder' : 'Set Reminder'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
