import React, { useState } from 'react';
import {
  Moon,
  Sun,
  User,
  Bell,
  Shield,
  Download,
  RotateCcw,
  Trash2,
  Check,
  Sparkles,
  CopyCheck,
} from 'lucide-react';
import { useSyncPulse } from '../context/SyncPulseContext';
import { ExtractedItem, ReminderOffset } from '../types';

export const SettingsPage: React.FC = () => {
  const {
    student,
    updateStudent,
    settings,
    updateSettings,
    darkMode,
    toggleDarkMode,
    resetToSampleData,
    clearAllData,
    loadDemoMode,
    clearDemoData,
    hasDemoData,
    showToast,
    chats,
    items,
    messages,
    summaries,
    addItems,
    requestNotificationPermission,
    setIsNotificationModalOpen,
  } = useSyncPulse();

  // Profile local form state
  const [name, setName] = useState(student.name);
  const [university, setUniversity] = useState(student.university);
  const [major, setMajor] = useState(student.major);
  const [semester, setSemester] = useState(student.semester);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudent({ name, university, major, semester });
  };

  const handleExportJSON = () => {
    const backupData = {
      student,
      settings,
      chats,
      items,
      messages,
      summaries,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SyncPulse_Data_Model_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Your complete study hub data model has been downloaded!');
  };

  // Quick interactive test for deduplication rule:
  const handleTestDeduplication = () => {
    const targetChat = chats[0] || { id: 'chat-1' };
    const existingFirst = items.find((i) => i.chatId === targetChat.id);

    if (existingFirst) {
      // Create duplicate with very similar title (case variation + minor whitespace) and same deadline
      const duplicateCandidate: ExtractedItem = {
        id: `dup-${Date.now()}`,
        chatId: existingFirst.chatId,
        type: existingFirst.type,
        title: existingFirst.title.toLowerCase() + ' ', // case-insensitive similar title
        details: 'Duplicate candidate attempt',
        sender: 'Test Bot',
        sourceMessage: 'Testing deduplication rule',
        deadline: existingFirst.deadline, // same deadline
        done: false,
        createdAt: new Date().toISOString(),
        priority: existingFirst.priority,
      };

      const result = addItems([duplicateCandidate]);
      if (result.skippedCount > 0) {
        showToast(`Deduplication passed: Skipped duplicate "${duplicateCandidate.title}"`);
      }
    } else {
      showToast('Load sample data first to test the deduplication rule');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Personalize your student profile, quiet hours, and chat detection rules.
        </p>
      </div>

      {/* 1. Theme & Appearance Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              {darkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                App Appearance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch between clean light view and night study dark theme
              </p>
            </div>
          </div>

          <button
            onClick={toggleDarkMode}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer min-h-[44px] transition-colors"
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Student Profile Form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Student Profile
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Used to customize course codes and semester dates
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                College or University
              </label>
              <input
                type="text"
                required
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Major / Field of Study
              </label>
              <input
                type="text"
                required
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Current Semester & Year
              </label>
              <input
                type="text"
                required
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-xs sm:text-sm rounded-xl shadow-xs min-h-[44px] cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Student Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Notifications & Quiet Hours */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Notifications & Quiet Hours
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Control when SyncPulse sends morning briefings and urgent pings
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Morning Study Briefing
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sends a daily rundown of today's classes, exams, and tasks at {settings.digestTime} AM.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.morningDigest}
              onChange={(e) => updateSettings({ morningDigest: e.target.checked })}
              className="w-5 h-5 rounded text-indigo-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Urgent Chat Alerts
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Immediately notify if someone announces a room change or quiz postponement.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.urgentAlerts}
              onChange={(e) => updateSettings({ urgentAlerts: e.target.checked })}
              className="w-5 h-5 rounded text-indigo-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Night Quiet Hours (11:00 PM – 7:30 AM)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mute non-urgent chat notifications during sleep hours.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.quietHoursEnabled}
              onChange={(e) => updateSettings({ quietHoursEnabled: e.target.checked })}
              className="w-5 h-5 rounded text-indigo-600 cursor-pointer"
            />
          </div>

          {/* Default Reminders before Deadlines */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 gap-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Default Reminder for New Deadlines
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automatically schedule a reminder when tasks and exam dates are extracted.
              </p>
            </div>
            <select
              value={settings.defaultReminderOffset || '1d'}
              onChange={(e) =>
                updateSettings({ defaultReminderOffset: e.target.value as ReminderOffset })
              }
              className="px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[40px] cursor-pointer"
            >
              <option value="1d">1 day before</option>
              <option value="3h">3 hours before</option>
              <option value="1h">1 hour before</option>
              <option value="none">No default reminder</option>
            </select>
          </div>

          {/* Browser Notification Permission */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Browser Push Notifications
                </h4>
                {typeof window !== 'undefined' && 'Notification' in window && (
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      Notification.permission === 'granted'
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                        : Notification.permission === 'denied'
                        ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                        : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {Notification.permission === 'granted'
                      ? 'Enabled ✓'
                      : Notification.permission === 'denied'
                      ? 'Blocked'
                      : 'Not enabled'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Shows system popups when assignment and exam reminders trigger.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsNotificationModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer min-h-[38px] flex items-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Configure Alerts</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Data Management & Deduplication Tester */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Data Management & Deduplication
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage chats, items, and verify automatic deduplication rules
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={loadDemoMode}
            className="min-h-[48px] px-4 py-3 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Load Demo Chats (CSE-4 & Project Team)</span>
          </button>

          <button
            onClick={clearDemoData}
            disabled={!hasDemoData}
            className="min-h-[48px] px-4 py-3 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Remove demo chats and their tasks/dates"
          >
            <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Clear Demo Data</span>
          </button>

          <button
            onClick={handleTestDeduplication}
            className="min-h-[48px] px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            title="Attempts to add an item with the same type, similar title, and same deadline to verify it gets skipped"
          >
            <CopyCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Test Deduplication Rule</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="min-h-[48px] px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Backup Data Model (.json)</span>
          </button>

          <button
            onClick={clearAllData}
            className="sm:col-span-2 min-h-[48px] px-5 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            title="Wipe data to test all empty states"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
