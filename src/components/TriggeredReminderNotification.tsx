import React, { useState } from 'react';
import {
  Bell,
  Check,
  Clock,
  MessageSquare,
  X,
  ChevronDown,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useSyncPulse } from '../context/SyncPulseContext';

export const TriggeredReminderNotification: React.FC = () => {
  const {
    activeTriggeredReminder,
    dismissTriggeredReminder,
    snoozeMessageReminder,
    toggleMessageReminderDone,
    openChatForReminder,
    chats,
  } = useSyncPulse();

  const [isSnoozeMenuOpen, setIsSnoozeMenuOpen] = useState(false);

  if (!activeTriggeredReminder) return null;

  const chat = chats.find((c) => c.id === activeTriggeredReminder.chatId);
  const chatName = chat?.name || 'Class Chat';

  const handleDone = () => {
    toggleMessageReminderDone(activeTriggeredReminder.id);
    dismissTriggeredReminder();
  };

  const handleSnooze = (minutes: number) => {
    snoozeMessageReminder(activeTriggeredReminder.id, minutes);
    setIsSnoozeMenuOpen(false);
  };

  const handleOpenChat = () => {
    openChatForReminder(activeTriggeredReminder);
  };

  return (
    <aside
      aria-label="Reminder alert"
      className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-in slide-in-from-top-4 fade-in duration-200"
    >
      <div className="bg-white dark:bg-[#1D2112] border-2 border-[#6B7A2A] rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* Glow ambient highlight */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-[#6B7A2A]/10 rounded-full blur-xl pointer-events-none" />

        {/* Top header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-2xl bg-[#D98324] text-white flex items-center justify-center shadow-md shadow-[#D98324]/20">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#C0392B] rounded-full ring-2 ring-white dark:ring-[#1D2112] animate-ping" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D98324]">
                  Reminder Due
                </span>
                <span className="text-[#E3E6D3] dark:text-[#2B321A]">·</span>
                <span className="text-xs text-[#6B7059] dark:text-[#A4AA8E] truncate max-w-[150px]">
                  {chatName}
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#2B2F1E] dark:text-[#EEF1DC] line-clamp-1">
                {activeTriggeredReminder.title || 'Class Chat Reminder'}
              </h4>
            </div>
          </div>

          <button
            onClick={dismissTriggeredReminder}
            className="p-1 text-[#6B7059] hover:text-[#2B2F1E] dark:hover:text-[#EEF1DC] rounded-lg min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content detail & deadline */}
        <div className="mt-2.5 space-y-1.5 pl-11">
          {activeTriggeredReminder.deadline && (
            <div className="flex items-center gap-1.5 text-xs text-[#C0392B] font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              <span>Deadline: {new Date(activeTriggeredReminder.deadline).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}</span>
            </div>
          )}

          {activeTriggeredReminder.note ? (
            <p className="text-xs text-[#854D0E] dark:text-[#FEF08A] font-medium bg-[#FEFCE8] dark:bg-[#28220A] border border-[#FEF08A] dark:border-[#854D0E] rounded-xl px-2.5 py-1.5">
              💡 {activeTriggeredReminder.note}
            </p>
          ) : activeTriggeredReminder.sourceText ? (
            <p className="text-xs text-[#6B7059] dark:text-[#A4AA8E] italic line-clamp-2">
              "{activeTriggeredReminder.sourceText}"
            </p>
          ) : null}
        </div>

        {/* Required 3 Action Buttons: "Done", "Snooze", "Open chat" */}
        <div className="mt-4 pt-3 border-t border-[#E3E6D3] dark:border-[#2B321A] flex items-center justify-between gap-1.5 flex-wrap">
          {/* 1. Done button */}
          <button
            onClick={handleDone}
            className="px-3 py-1.5 rounded-xl bg-[#6B7A2A] hover:bg-[#5A6823] text-white text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer min-h-[36px] transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>

          {/* 2. Snooze dropdown / action */}
          <div className="relative">
            <button
              onClick={() => setIsSnoozeMenuOpen(!isSnoozeMenuOpen)}
              className="px-2.5 py-1.5 rounded-xl border border-[#E3E6D3] dark:border-[#2B321A] text-[#2B2F1E] dark:text-[#EEF1DC] hover:bg-[#EEF1DC] dark:hover:bg-[#283017] text-xs font-semibold flex items-center gap-1 cursor-pointer min-h-[36px] transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-[#D98324]" />
              <span>Snooze</span>
              <ChevronDown className="w-3 h-3 text-[#6B7059]" />
            </button>

            {isSnoozeMenuOpen && (
              <div className="absolute bottom-full mb-1 left-0 bg-white dark:bg-[#1D2112] border border-[#E3E6D3] dark:border-[#2B321A] rounded-2xl shadow-xl p-1.5 min-w-[130px] z-20 space-y-0.5 animate-in fade-in duration-150">
                <button
                  onClick={() => handleSnooze(10)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#2B2F1E] dark:text-[#EEF1DC] hover:bg-[#EEF1DC] dark:hover:bg-[#283017] hover:text-[#3F4A16] cursor-pointer"
                >
                  10 minutes
                </button>
                <button
                  onClick={() => handleSnooze(60)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#2B2F1E] dark:text-[#EEF1DC] hover:bg-[#EEF1DC] dark:hover:bg-[#283017] hover:text-[#3F4A16] cursor-pointer"
                >
                  1 hour
                </button>
                <button
                  onClick={() => handleSnooze(1440)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#2B2F1E] dark:text-[#EEF1DC] hover:bg-[#EEF1DC] dark:hover:bg-[#283017] hover:text-[#3F4A16] cursor-pointer"
                >
                  Tomorrow
                </button>
              </div>
            )}
          </div>

          {/* 3. Open chat button */}
          <button
            onClick={handleOpenChat}
            className="px-3 py-1.5 rounded-xl bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] hover:bg-[#DDE3BE] dark:hover:bg-[#343C1F] text-xs font-semibold flex items-center gap-1 cursor-pointer min-h-[36px] transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open chat</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
