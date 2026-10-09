import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Cpu,
  Trash2,
  HardDrive,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useSyncPulse } from '../context/SyncPulseContext';

export const PrivacyPage: React.FC = () => {
  const { setActiveTab, deleteAllData } = useSyncPulse();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [faqOpen, setFaqOpen] = useState<{ [key: string]: boolean }>({
    faq1: true,
  });

  const toggleFaq = (key: string) => {
    setFaqOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDeleteAll = () => {
    deleteAllData();
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto pb-16">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Student Privacy & Trust</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          How SyncPulse Protects Your Privacy
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          We believe student tools should be completely transparent. Here is how your chats are handled in plain, human words—no confusing legal fine print.
        </p>
      </div>

      {/* 3 Core Principles Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1 */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Only Selected Chats
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            SyncPulse only processes the exact chat export or channel you explicitly upload. We never access your personal DMs, contacts, or unselected groups.
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            AI Used Only for Tasks & Dates
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Messages are sent to the AI model strictly to identify assignments, tests, and circulars. The model processes them transiently and never stores them.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <EyeOff className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Nothing Shared With Other Users
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            No public feeds, no shared databases, and zero ad-tracking. Your study schedule, course codes, and classmates remain strictly private to you.
          </p>
        </div>
      </div>

      {/* Deep Dive Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Data Storage & Your Control
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Where your information lives and how you can wipe it anytime
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Stored in Your Browser Only (Local-First)
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Your imported chat history, extracted homework cards, custom reminders, and profile settings are stored securely in your browser's local sandbox (<code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-mono">localStorage</code>). We do not run external tracking servers that keep copies of your messages.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Ephemeral AI Summarisation
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                When you tap <strong>Summarise</strong>, messages are sent through an encrypted HTTPS proxy to Google Gemini with instructions to extract action items only. The AI model returns the extracted list and immediately discards the batch. Your personal messages are never used to train public foundation models.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Total Erase Feature
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                You have an instant "Delete all my data" button right in Settings. Pressing it erases every single chat, message, task, and summary from your browser instantly, leaving zero remnants behind.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Erase or Manage Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            <span>Open Settings & Preferences</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Delete All My Data</span>
          </button>
        </div>
      </div>

      {/* Frequently Asked Privacy Questions */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Frequently Asked Privacy Questions</span>
        </h2>

        <div className="space-y-3">
          {/* FAQ 1 */}
          <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleFaq('faq1')}
              className="w-full p-4 text-left flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition-colors min-h-[48px] cursor-pointer"
            >
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Can my classmates or professors see what I imported?
              </span>
              {faqOpen.faq1 ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>
            {faqOpen.faq1 && (
              <div className="p-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 leading-relaxed bg-white dark:bg-slate-900">
                No. SyncPulse is completely single-user and local-first. There is no shared room, no public account, and no multi-user sync. Only your individual browser has access to the items.
              </div>
            )}
          </div>

          {/* FAQ 2 */}
          <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleFaq('faq2')}
              className="w-full p-4 text-left flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition-colors min-h-[48px] cursor-pointer"
            >
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                What does the AI do with casual talk and memes?
              </span>
              {faqOpen.faq2 ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>
            {faqOpen.faq2 && (
              <div className="p-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 leading-relaxed bg-white dark:bg-slate-900">
                Our strict prompt instructs the model to ignore social chit-chat, jokes, greetings, and side questions. It increments a simple counter (e.g., "Filtered 45 casual messages") and discards the text so only real assignments and dates enter your to-do list.
              </div>
            )}
          </div>

          {/* FAQ 3 */}
          <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleFaq('faq3')}
              className="w-full p-4 text-left flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition-colors min-h-[48px] cursor-pointer"
            >
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                How do I back up or transfer my study schedule?
              </span>
              {faqOpen.faq3 ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>
            {faqOpen.faq3 && (
              <div className="p-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 leading-relaxed bg-white dark:bg-slate-900">
                In Settings, click "Backup Data Model (.json)" to download your complete to-do list, detected dates, and course info onto your laptop or phone.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Delete All Data */}
      {showDeleteConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 id="delete-confirm-title" className="text-lg font-bold text-slate-900 dark:text-white">
                Delete all your data?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                This will permanently remove all connected chats, raw messages, extracted assignments, and scheduled dates from this browser. This cannot be undone.
              </p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAll}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs sm:text-sm font-semibold transition-colors min-h-[44px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
              >
                Yes, Delete All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
