import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Clock,
  Trash2,
  Download,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useSyncPulse } from '../context/SyncPulseContext';
import { ExtractedItem, ItemPriority } from '../types';
import { EmptyState } from '../components/EmptyState';
import { DeadlineBadge } from '../components/DeadlineBadge';
import { ReminderSelector } from '../components/ReminderSelector';

export const ImportantDatesPage: React.FC = () => {
  const {
    items,
    chats,
    addItems,
    deleteItem,
    toggleDone,
    showToast,
    setItemReminder,
    requestNotificationPermission,
  } = useSyncPulse();

  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [chatFilter, setChatFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Date form state
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [chatId, setChatId] = useState(chats[0]?.id || '');
  const [priority, setPriority] = useState<ItemPriority>('high');
  const [details, setDetails] = useState('');

  const dateItems = items
    .filter((i) => i.type === 'date')
    .filter((i) => (priorityFilter === 'all' ? true : i.priority === priorityFilter))
    .filter((i) => (chatFilter === 'all' ? true : i.chatId === chatFilter))
    .sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

  const getChatName = (cId: string) => chats.find((c) => c.id === cId)?.name || 'Class Chat';

  const handleAddDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deadline.trim()) return;

    const chosenChatId = chatId || chats[0]?.id || 'chat-demo';
    const candidateItem: ExtractedItem = {
      id: `item-date-${Date.now()}`,
      chatId: chosenChatId,
      type: 'date',
      title: title.trim(),
      details: details.trim(),
      sender: 'Self Added',
      sourceMessage: `Date added for ${title.trim()}`,
      deadline: new Date(deadline).toISOString(),
      done: false,
      createdAt: new Date().toISOString(),
      priority,
    };

    addItems([candidateItem]);

    setTitle('');
    setDeadline('');
    setDetails('');
    setIsModalOpen(false);
  };

  // Export to standard .ics iCalendar file for Google/Apple Calendar
  const handleExportICS = () => {
    const dates = items.filter((i) => i.type === 'date');
    if (dates.length === 0) return;

    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//SyncPulse//AI Chat Hub//EN\nCALSCALE:GREGORIAN\n`;

    dates.forEach((d) => {
      const cleanDate = (d.deadline ? d.deadline.slice(0, 10) : '20261016').replace(/-/g, '');
      icsContent += `BEGIN:VEVENT\nSUMMARY:[${getChatName(d.chatId)}] ${d.title}\nDTSTART;VALUE=DATE:${cleanDate}\nDESCRIPTION:${d.details || 'SyncPulse Date'}\nSTATUS:CONFIRMED\nEND:VEVENT\n`;
    });

    icsContent += `END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'SyncPulse_Important_Dates.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Calendar file downloaded! Import it into Google or Apple Calendar.');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Important Dates
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Exams, quizzes, project deadlines, and campus schedule reminders.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {items.some((i) => i.type === 'date') && (
            <button
              onClick={handleExportICS}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
            >
              <Download className="w-4 h-4 text-indigo-500" />
              <span>Export to Calendar (.ics)</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Important Date</span>
          </button>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit">
          {(['all', 'high', 'medium', 'low'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer min-h-[36px] ${
                priorityFilter === p
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p === 'all' ? 'All Priorities' : p}
            </button>
          ))}
        </div>

        {/* Chat Filter */}
        {chats.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Filter by Chat:
            </label>
            <select
              value={chatFilter}
              onChange={(e) => setChatFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 min-h-[36px] focus:outline-none"
            >
              <option value="all">All Chats</option>
              {chats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Dates Timeline List or Empty State */}
      {items.filter((i) => i.type === 'date').length === 0 ? (
        <EmptyState
          icon={Calendar}
          text="No exams, quizzes, or deadlines on your calendar yet."
          actionText="Add an Important Date"
          onAction={() => setIsModalOpen(true)}
        />
      ) : dateItems.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 my-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            No events found matching your filter.
          </p>
          <button
            onClick={() => {
              setPriorityFilter('all');
              setChatFilter('all');
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium cursor-pointer min-h-[40px]"
          >
            Show All Dates
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {dateItems.map((d) => {
            const dateObj = d.deadline ? new Date(d.deadline) : null;
            const monthStr = dateObj ? dateObj.toLocaleDateString('en-US', { month: 'short' }) : 'TBA';
            const dayStr = dateObj ? dateObj.toLocaleDateString('en-US', { day: '2-digit' }) : '—';
            const weekdayStr = dateObj ? dateObj.toLocaleDateString('en-US', { weekday: 'short' }) : '';

            return (
              <div
                key={d.id}
                className={`p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
                  d.done
                    ? 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 opacity-70'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800'
                }`}
              >
                {/* Left Side: Date Block & Details */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex flex-col items-center justify-center shrink-0 text-indigo-700 dark:text-indigo-300">
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {monthStr}
                    </span>
                    <span className="text-lg font-black leading-none">{dayStr}</span>
                    <span className="text-[9px] text-slate-400 leading-none mt-0.5">
                      {weekdayStr}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {getChatName(d.chatId)}
                      </span>
                      {(d.chatId.startsWith('chat-demo') || chats.find((c) => c.id === d.chatId)?.source === 'demo') && (
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded-md flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Demo data
                        </span>
                      )}
                      {/* Color-coded deadline badge */}
                      {d.deadline && (
                        <DeadlineBadge deadline={d.deadline} done={d.done} size="sm" />
                      )}
                      <span className="text-slate-400">·</span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg capitalize ${
                          d.priority === 'high'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : d.priority === 'medium'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {d.priority} priority
                      </span>
                      {d.done && (
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-base font-bold leading-snug ${
                        d.done
                          ? 'line-through text-slate-500 dark:text-slate-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {d.title}
                    </h3>

                    {d.details && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {d.details}
                      </p>
                    )}

                    {d.sourceMessage && (
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        From: "{d.sourceMessage}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Side: Actions & Reminder */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {d.deadline && (
                    <ReminderSelector
                      currentOffset={d.reminderOffset}
                      onSelectOffset={(offset) => setItemReminder(d.id, offset)}
                      onRequestPermission={requestNotificationPermission}
                      disabled={d.done}
                    />
                  )}

                  <button
                    onClick={() => toggleDone(d.id)}
                    aria-label={`Mark as ${d.done ? 'pending' : 'completed'}`}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer min-h-[40px] flex items-center gap-1.5 ${
                      d.done
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{d.done ? 'Mark Pending' : 'Mark Done'}</span>
                  </button>

                  <button
                    onClick={() => deleteItem(d.id)}
                    aria-label="Delete date"
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 hover:border-rose-200 dark:hover:border-rose-800 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD IMPORTANT DATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Add Important Date
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track midterms, quizzes, and project submission days
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Event / Exam Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm 1: Mechanics & Heat"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Date & Time
                  </label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ItemPriority)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Class Chat
                </label>
                <select
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                >
                  {chats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Location / Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Science Hall 301. Bring scientific calculator & Student ID"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium rounded-xl min-h-[44px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-sm rounded-xl shadow-xs min-h-[44px] cursor-pointer"
                >
                  Save Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
