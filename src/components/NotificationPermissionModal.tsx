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
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Never miss an assignment deadline
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            SyncPulse can alert you before assignments, lab records, and exams are due — even when you aren&apos;t actively looking at the app.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 space-y-2 border border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Reminders 1 hour, 3 hours, or 1 day before due times</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Zero spam: only the deadlines and reminders you configure</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Safe &amp; private: notifications run directly on your device</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onAllow}
            className="w-full sm:flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
          >
            <Bell className="w-4 h-4" />
            <span>Enable Notifications</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer min-h-[44px]"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};
