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
  Unplug,
  ShieldCheck,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Smartphone,
  ExternalLink,
  Clock,
  CheckCircle2,
  MessageSquare,
  ChevronDown,
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
    deleteAllData,
    disconnectAllSources,
    setIsOnboardingOpen,
    setActiveTab,
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
    exportAllUpcomingCalendar,
    messageReminders,
    snoozeMessageReminder,
    toggleMessageReminderDone,
    deleteMessageReminder,
    openChatForReminder,
    setIsRemindersDrawerOpen,
  } = useSyncPulse();

  // Profile local form state
  const [name, setName] = useState(student.name);
  const [university, setUniversity] = useState(student.university);
  const [major, setMajor] = useState(student.major);
  const [semester, setSemester] = useState(student.semester);

  // Reminders section local filter state
  const [reminderFilter, setReminderFilter] = useState<'all' | 'pending' | 'done'>('pending');
  const [activeSnoozeId, setActiveSnoozeId] = useState<string | null>(null);

  // Danger modal confirmations
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

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

      {/* Reminders Management Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Chat Reminders
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage, snooze, complete, or delete your scheduled message reminders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsRemindersDrawerOpen(true)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[38px] flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Open Drawer</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setReminderFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              reminderFilter === 'pending'
                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Pending ({messageReminders.filter((r) => r.status === 'pending' || r.status === 'triggered').length})
          </button>
          <button
            type="button"
            onClick={() => setReminderFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              reminderFilter === 'all'
                ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All ({messageReminders.length})
          </button>
          <button
            type="button"
            onClick={() => setReminderFilter('done')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              reminderFilter === 'done'
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Completed ({messageReminders.filter((r) => r.status === 'done').length})
          </button>
        </div>

        {/* Reminders List */}
        <div className="space-y-3">
          {messageReminders
            .filter((r) => {
              if (reminderFilter === 'pending') return r.status === 'pending' || r.status === 'triggered';
              if (reminderFilter === 'done') return r.status === 'done';
              return true;
            })
            .length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2">
              <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {reminderFilter === 'pending'
                  ? 'No pending reminders right now.'
                  : reminderFilter === 'done'
                  ? 'No completed reminders yet.'
                  : 'No reminders have been created.'}
              </p>
              <p className="text-xs text-slate-400">
                Open any chat in the <button onClick={() => setActiveTab('chats')} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Chats tab</button> and tap "Remind me" on a message.
              </p>
            </div>
          ) : (
            messageReminders
              .filter((r) => {
                if (reminderFilter === 'pending') return r.status === 'pending' || r.status === 'triggered';
                if (reminderFilter === 'done') return r.status === 'done';
                return true;
              })
              .map((r) => {
                const chat = chats.find((c) => c.id === r.chatId);
                const chatName = chat?.name || 'Class Chat';
                const isDone = r.status === 'done';
                const remindDate = new Date(r.remindAt);

                return (
                  <div
                    key={r.id}
                    className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                      isDone
                        ? 'bg-slate-50/60 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-80'
                        : r.status === 'triggered'
                        ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {chatName}
                        </span>
                        {r.sender && (
                          <>
                            <span className="text-slate-300 dark:text-slate-700">·</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {r.sender}
                            </span>
                          </>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isDone
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            : r.status === 'triggered'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {isDone ? 'Done' : r.status === 'triggered' ? 'Triggered' : 'Scheduled'}
                      </span>
                    </div>

                    <div>
                      <h4
                        className={`text-sm font-semibold text-slate-900 dark:text-white ${
                          isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                        }`}
                      >
                        {r.title || r.sourceText?.slice(0, 60) || 'Reminder'}
                      </h4>

                      {r.note && (
                        <p className="mt-1 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 rounded-lg px-2.5 py-1 font-medium border border-amber-200/50 dark:border-amber-800/50">
                          Note: {r.note}
                        </p>
                      )}

                      {r.sourceText && !r.note && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2">
                          "{r.sourceText}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {remindDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                          {remindDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </span>

                      {r.deadline && (
                        <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            Due {new Date(r.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Actions: Snooze, Mark done, Open chat, Delete */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-1 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        {/* Toggle Done */}
                        <button
                          type="button"
                          onClick={() => toggleMessageReminderDone(r.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer min-h-[34px] transition-colors ${
                            isDone
                              ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isDone ? 'Reopen' : 'Mark Done'}</span>
                        </button>

                        {/* Snooze options */}
                        {!isDone && (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setActiveSnoozeId(activeSnoozeId === r.id ? null : r.id)}
                              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer min-h-[34px]"
                            >
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              <span>Snooze</span>
                              <ChevronDown className="w-3 h-3 text-slate-400" />
                            </button>

                            {activeSnoozeId === r.id && (
                              <div className="absolute bottom-full mb-1 left-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-1.5 min-w-[130px] z-30 space-y-0.5 animate-in fade-in">
                                <button
                                  type="button"
                                  onClick={() => {
                                    snoozeMessageReminder(r.id, 10);
                                    setActiveSnoozeId(null);
                                  }}
                                  className="w-full text-left px-2.5 py-1 rounded-md text-xs text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 cursor-pointer"
                                >
                                  10 minutes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    snoozeMessageReminder(r.id, 60);
                                    setActiveSnoozeId(null);
                                  }}
                                  className="w-full text-left px-2.5 py-1 rounded-md text-xs text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 cursor-pointer"
                                >
                                  1 hour
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    snoozeMessageReminder(r.id, 1440);
                                    setActiveSnoozeId(null);
                                  }}
                                  className="w-full text-left px-2.5 py-1 rounded-md text-xs text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 cursor-pointer"
                                >
                                  Tomorrow
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Open Chat */}
                        <button
                          type="button"
                          onClick={() => openChatForReminder(r)}
                          className="px-2.5 py-1.5 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-xs font-semibold flex items-center gap-1 cursor-pointer min-h-[34px]"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Open chat</span>
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => deleteMessageReminder(r.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer min-h-[34px] min-w-[34px] flex items-center justify-center"
                          title="Delete reminder"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* 4. Calendar Integration, Google Calendar Auto-Sync & Alarms */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Calendar Integration & Auto-Sync
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sync assignments, deadlines, and meetings directly with your phone and Google Calendar
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={exportAllUpcomingCalendar}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer min-h-[40px] shrink-0 self-start sm:self-center"
            title="Download all upcoming deadlines and meetings in one .ics file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export All Upcoming (.ics)</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Google Calendar Auto-Sync (Coming soon) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Google Calendar Auto-Sync
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Coming soon
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                  Automatically sync newly detected deadlines and meetings to your Google Calendar without manual downloads.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  showToast(
                    'Google Calendar cloud auto-sync is coming soon! In the meantime, use the "Add to Calendar" button to download .ics files or open prefilled Google Calendar templates.'
                  )
                }
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer min-h-[40px] shrink-0"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>Connect Google Calendar</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold ml-1">(Coming soon)</span>
              </button>
            </div>

            {/* Option in Settings: Automatically add new deadlines and meetings to my calendar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Automatically add new deadlines and meetings to my calendar
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  When enabled, any item extracted by AI is automatically prepared with calendar sync event tags.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoCalendarSync}
                onChange={(e) => {
                  updateSettings({ autoCalendarSync: e.target.checked });
                  showToast(
                    e.target.checked
                      ? 'Auto-calendar sync preference enabled for new items'
                      : 'Auto-calendar sync turned off'
                  );
                }}
                className="w-5 h-5 rounded text-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Alarm option default */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
            <div>
              <div className="flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Built-in Calendar Alarms (VALARM)
                </h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Your phone's calendar will ring at the reminder times (1 day before, 1 hour before, and 10 minutes before).
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.defaultAlarmsEnabled}
              onChange={(e) => {
                updateSettings({ defaultAlarmsEnabled: e.target.checked });
                showToast(
                  e.target.checked
                    ? 'Calendar alarms enabled: exported events will ring your phone'
                    : 'Calendar alarms disabled for exports'
                );
              }}
              className="w-5 h-5 rounded text-indigo-600 cursor-pointer"
            />
          </div>

          {/* Note for Android and iPhone users on how to make calendar notifications loud */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <Smartphone className="w-4 h-4 text-indigo-500" />
              <span>How to make calendar alarms ring loudly on your phone</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white mb-1">
                  📱 iPhone / iPad (iOS):
                </p>
                <p className="text-[11px] leading-relaxed">
                  Go to <strong>Settings &gt; Notifications &gt; Calendar</strong>.
                  Turn on <strong>Allow Notifications</strong>, set Alert style to <strong>Banners or Alerts</strong>, and tap <strong>Sounds</strong> to choose a loud chime. Ensure Silent mode is unmuted.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white mb-1">
                  🤖 Android:
                </p>
                <p className="text-[11px] leading-relaxed">
                  Go to <strong>Settings &gt; Apps &gt; Calendar &gt; Notifications</strong>.
                  Set notification importance to <strong>Alerting / High</strong>, tap <strong>Event reminders &gt; Sound</strong>, and select a prominent alarm sound. Turn off battery optimization for Calendar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Onboarding Guide & Walkthrough Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                New User Onboarding
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review the 3-step guide: Connect a chat, Tap Summarise, and Never miss a deadline
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOnboardingOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors min-h-[44px]"
            aria-label="Replay the 3-step onboarding walkthrough"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Replay Guide</span>
          </button>
        </div>
      </div>

      {/* 5. Privacy & Data Protection Link Card */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-indigo-950/30 rounded-3xl p-6 border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Privacy, Local Storage & AI Guardrails
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Only selected chats are processed. AI extracts tasks and dates only. Nothing is ever shared with other users.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors min-h-[44px] shrink-0"
            aria-label="Open detailed privacy policy"
          >
            <span>Read Privacy Page</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6. Data Management, Disconnect & Wipe Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Data Management & Danger Zone
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage backups, disconnect sources, or wipe local application memory
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={loadDemoMode}
            className="min-h-[46px] px-4 py-2.5 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Load Demo Chats</span>
          </button>

          <button
            type="button"
            onClick={clearDemoData}
            disabled={!hasDemoData}
            className="min-h-[46px] px-4 py-2.5 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-100/60 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Clear Demo Data</span>
          </button>

          <button
            type="button"
            onClick={handleTestDeduplication}
            className="min-h-[46px] px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <CopyCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Test Deduplication Rule</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="min-h-[46px] px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Backup Data Model (.json)</span>
          </button>
        </div>

        {/* Explicit Disconnect and Delete Buttons */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setShowDisconnectModal(true)}
            className="min-h-[48px] px-4 py-3 rounded-2xl border border-amber-300 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label="Disconnect all chat sources"
          >
            <Unplug className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Disconnect all sources</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteAllModal(true)}
            className="min-h-[48px] px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
            aria-label="Delete all my data"
          >
            <Trash2 className="w-4 h-4 text-white" />
            <span>Delete all my data</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal: Disconnect all sources */}
      {showDisconnectModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="disconnect-modal-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Unplug className="w-6 h-6" />
            </div>
            <div>
              <h3 id="disconnect-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                Disconnect all chat sources?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                This will remove all connected WhatsApp, Discord, Slack, and Telegram imports and clear all raw messages from your device. Extracted to-do items will be retained.
              </p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDisconnectModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  disconnectAllSources();
                  setShowDisconnectModal(false);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold transition-colors min-h-[44px] cursor-pointer"
              >
                Yes, Disconnect Sources
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete all my data */}
      {showDeleteAllModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-all-modal-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 id="delete-all-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                Delete all your data permanently?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                This will wipe all connected chats, raw messages, extracted assignments, exam dates, circulars, and summaries from this browser. This action cannot be reversed.
              </p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteAllModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAllData();
                  setShowDeleteAllModal(false);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs sm:text-sm font-semibold transition-colors min-h-[44px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
