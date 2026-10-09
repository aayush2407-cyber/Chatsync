import React from 'react';
import { Bell, ShieldCheck, CheckCircle2, X } from 'lucide-react';

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllow: () => void;
}

export const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({
  isOpen,
  onClose,
  onAllow,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#1D2112] rounded-3xl p-6 sm:p-7 max-w-md w-full border border-[#E3E6D3] dark:border-[#2B321A] shadow-2xl space-y-5">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF1DC] dark:bg-[#283017] text-[#6B7A2A] dark:text-[#9AAE3C] flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7059] hover:text-[#2B2F1E] dark:hover:text-[#EEF1DC] rounded-xl min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-[#2B2F1E] dark:text-[#EEF1DC]">
            Never miss an assignment deadline
          </h3>
          <p className="text-xs sm:text-sm text-[#6B7059] dark:text-[#A4AA8E] leading-relaxed">
            SyncPulse can alert you before assignments, lab records, and exams are due — even when you aren&apos;t actively looking at the app.
          </p>
        </div>

        <div className="bg-[#F7F8F2] dark:bg-[#14170D] rounded-2xl p-3.5 space-y-2 border border-[#E3E6D3] dark:border-[#2B321A] text-xs">
          <div className="flex items-center gap-2 text-[#2B2F1E] dark:text-[#EEF1DC]">
            <CheckCircle2 className="w-4 h-4 text-[#6B7A2A] dark:text-[#9AAE3C] shrink-0" />
            <span>Reminders 1 hour, 3 hours, or 1 day before due times</span>
          </div>
          <div className="flex items-center gap-2 text-[#2B2F1E] dark:text-[#EEF1DC]">
            <CheckCircle2 className="w-4 h-4 text-[#6B7A2A] dark:text-[#9AAE3C] shrink-0" />
            <span>Zero spam: only the deadlines and reminders you configure</span>
          </div>
          <div className="flex items-center gap-2 text-[#2B2F1E] dark:text-[#EEF1DC]">
            <ShieldCheck className="w-4 h-4 text-[#6B7A2A] dark:text-[#9AAE3C] shrink-0" />
            <span>Safe &amp; private: notifications run directly on your device</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onAllow}
            className="w-full sm:flex-1 py-3 px-4 bg-[#6B7A2A] hover:bg-[#5A6823] active:bg-[#4A561C] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
          >
            <Bell className="w-4 h-4" />
            <span>Enable Notifications</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-4 rounded-xl border border-[#E3E6D3] dark:border-[#2B321A] text-[#2B2F1E] dark:text-[#EEF1DC] hover:bg-[#EEF1DC] dark:hover:bg-[#283017] text-xs sm:text-sm font-semibold transition-colors cursor-pointer min-h-[44px]"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};
