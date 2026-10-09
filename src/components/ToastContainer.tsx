import React from 'react';
import { useSyncPulse } from '../context/SyncPulseContext';
import { CheckCircle2, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useSyncPulse();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between gap-3 p-3.5 bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 rounded-2xl shadow-xl border border-slate-800 dark:border-slate-200 transition-all text-sm"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span className="font-medium text-xs sm:text-sm">{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 text-slate-400 hover:text-white dark:hover:text-slate-900 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
