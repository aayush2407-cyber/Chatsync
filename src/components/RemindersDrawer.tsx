import React, { useState } from 'react';
import {
  Bell,
  Clock,
  CheckCircle2,
  Trash2,
  X,
  MessageSquare,
  Calendar,
  AlertCircle,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useSyncPulse } from '../context/SyncPulseContext';
import { MessageReminder } from '../types';

export const RemindersDrawer: React.FC = () => {
  const {
    isRemindersDrawerOpen,
    setIsRemindersDrawerOpen,
    messageReminders,
    snoozeMessageReminder,
    toggleMessageReminderDone,
    deleteMessageReminder,
    openChatForReminder,
    chats,
  } = useSyncPulse();

  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('pending');
  const [activeSnoozeId, setActiveSnoozeId] = useState<string | null>(null);

  if (!isRemindersDrawerOpen) return null;

  const filteredReminders = messageReminders.filter((r) => {
    if (filter === 'pending') return r.status === 'pending' || r.status === 'triggered';
    if (filter === 'done') return r.status === 'done';
    return true;
  });

  const pendingCount = messageReminders.filter(
    (r) => r.status === 'pending' || r.status === 'triggered'
  ).length;
  const doneCount = messageReminders.filter((r) => r.status === 'done').length;

  const handleSnooze = (id: string, minutes: number) => {
    snoozeMessageReminder(id, minutes);
    setActiveSnoozeId(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminders-drawer-title"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 id="reminders-drawer-title" className="text-base font-bold text-slate-900 dark:text-white">
                Class Reminders
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {pendingCount} pending · {doneCount} completed
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsRemindersDrawerOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
            aria-label="Close reminders drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'pending'
                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All ({messageReminders.length})
          </button>
          <button
            onClick={() => setFilter('done')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'done'
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Done ({doneCount})
          </button>
        </div>

        {/* Reminders List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filteredReminders.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {filter === 'pending'
                  ? 'No pending reminders right now.'
                  : filter === 'done'
                  ? 'No completed reminders yet.'
                  : 'No reminders created yet.'}
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Hover over any chat message and tap the bell icon to set a reminder!
              </p>
            </div>
          ) : (
            filteredReminders.map((reminder) => {
              const chat = chats.find((c) => c.id === reminder.chatId);
              const chatName = chat?.name || 'Class Chat';
              const isDone = reminder.status === 'done';
              const remindDate = new Date(reminder.remindAt);
              const isPast = remindDate.getTime() < Date.now();

              return (
                <div
                  key={reminder.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                    isDone
                      ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
                      : reminder.status === 'triggered' || isPast
                      ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200/90 dark:border-slate-700 shadow-xs'
                  }`}
                >
                  {/* Top metadata */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        {chatName}
                      </span>
                      {reminder.sender && (
                        <>
                          <span className="text-slate-300 dark:text-slate-700">·</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {reminder.sender}
                          </span>
                        </>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isDone
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          : reminder.status === 'triggered' || isPast
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {isDone ? 'Completed' : isPast ? 'Due Now' : 'Scheduled'}
                    </span>
                  </div>

                  {/* Title / snippet */}
                  <div>
                    <h4
                      className={`text-xs sm:text-sm font-semibold text-slate-900 dark:text-white ${
                        isDone ? 'line-through text-slate-500 dark:text-slate-400' : ''
                      }`}
                    >
                      {reminder.title || reminder.sourceText?.slice(0, 50) || 'Reminder'}
                    </h4>

                    {reminder.note && (
                      <p className="mt-1 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 rounded-lg px-2 py-1 font-medium border border-amber-200/50 dark:border-amber-800/50">
                        Note: {reminder.note}
                      </p>
                    )}

                    {reminder.sourceText && !reminder.note && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2">
                        "{reminder.sourceText}"
                      </p>
                    )}
                  </div>

                  {/* Remind time info */}
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {remindDate.toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        at{' '}
                        {remindDate.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </span>

                    {reminder.deadline && (
                      <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          Due{' '}
                          {new Date(reminder.deadline).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-1 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      {/* Mark Done / Reopen */}
                      <button
                        onClick={() => toggleMessageReminderDone(reminder.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer min-h-[32px] transition-colors ${
                          isDone
                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isDone ? 'Reopen' : 'Done'}</span>
                      </button>

                      {/* Snooze button & menu */}
                      {!isDone && (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveSnoozeId(
                                activeSnoozeId === reminder.id ? null : reminder.id
                              )
                            }
                            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer min-h-[32px]"
                          >
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span>Snooze</span>
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                          </button>

                          {activeSnoozeId === reminder.id && (
                            <div className="absolute bottom-full mb-1 left-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-1 min-w-[120px] z-30 space-y-0.5 animate-in fade-in">
                              <button
                                onClick={() => handleSnooze(reminder.id, 10)}
                                className="w-full text-left px-2 py-1 rounded-md text-xs text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 cursor-pointer"
                              >
                                10 min
                              </button>
                              <button
                                onClick={() => handleSnooze(reminder.id, 60)}
                                className="w-full text-left px-2 py-1 rounded-md text-xs text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 cursor-pointer"
                              >
                                1 hour
                              </button>
                              <button
                                onClick={() => handleSnooze(reminder.id, 1440)}
                                className="w-full text-left px-2 py-1 rounded-md text-xs text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 cursor-pointer"
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
                        onClick={() => openChatForReminder(reminder)}
                        className="px-2 py-1 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-xs font-semibold flex items-center gap-1 cursor-pointer min-h-[32px]"
                        title="Jump to message in chat"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Open chat</span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => deleteMessageReminder(reminder.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
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
    </div>
  );
};
