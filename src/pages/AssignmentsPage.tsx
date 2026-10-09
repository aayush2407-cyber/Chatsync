import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  Trash2,
  CheckCircle2,
  Circle,
  AlertCircle,
  X,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useSyncPulse } from '../context/SyncPulseContext';
import { ExtractedItem, ItemPriority } from '../types';
import { EmptyState } from '../components/EmptyState';
import { DeadlineBadge } from '../components/DeadlineBadge';
import { ReminderSelector } from '../components/ReminderSelector';

export const AssignmentsPage: React.FC = () => {
  const {
    items,
    chats,
    addItems,
    toggleDone,
    deleteItem,
    setItemReminder,
    requestNotificationPermission,
  } = useSyncPulse();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [chatFilter, setChatFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Add Assignment Form State
  const [title, setTitle] = useState('');
  const [chatId, setChatId] = useState(chats[0]?.id || '');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<ItemPriority>('medium');
  const [details, setDetails] = useState('');

  const getChatName = (cId: string) => chats.find((c) => c.id === cId)?.name || 'Class Chat';

  const assignmentItems = items
    .filter((i) => i.type === 'assignment')
    .filter((a) => {
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'pending'
          ? !a.done
          : a.done;
      const matchesChat = chatFilter === 'all' ? true : a.chatId === chatFilter;
      const matchesPriority = priorityFilter === 'all' ? true : a.priority === priorityFilter;
      return matchesStatus && matchesChat && matchesPriority;
    })
    .sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const chosenChatId = chatId || chats[0]?.id || 'chat-demo';
    const nowIso = new Date().toISOString();

    const candidateItem: ExtractedItem = {
      id: `item-asg-${Date.now()}`,
      chatId: chosenChatId,
      type: 'assignment',
      title: title.trim(),
      details: details.trim(),
      sender: 'Self Added',
      sourceMessage: `Task added: ${title.trim()}`,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      done: false,
      createdAt: nowIso,
      priority,
    };

    addItems([candidateItem]);

    setTitle('');
    setDeadline('');
    setDetails('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Assignments
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track homework, problem sets, lab reports, and projects in one clean checklist.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit">
          {(['all', 'pending', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer min-h-[36px] ${
                statusFilter === st
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st === 'pending' ? 'To-Do' : st}
            </button>
          ))}
        </div>

        {/* Chat and Priority filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {chats.length > 0 && (
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
          )}

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 min-h-[36px] focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Assignments List or Empty State */}
      {items.filter((i) => i.type === 'assignment').length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          text="You're all caught up! No assignments on your to-do list."
          actionText="Create a Task"
          onAction={() => setIsModalOpen(true)}
        />
      ) : assignmentItems.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 my-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            No assignments match your selected status or filter.
          </p>
          <button
            onClick={() => {
              setStatusFilter('all');
              setChatFilter('all');
              setPriorityFilter('all');
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium cursor-pointer min-h-[40px]"
          >
            Show All Tasks
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {assignmentItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-sm ${
                item.done
                  ? 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 opacity-70'
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => toggleDone(item.id)}
                    aria-label={`Mark ${item.title} as ${item.done ? 'incomplete' : 'done'}`}
                    className={`mt-1 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 cursor-pointer min-h-[36px] min-w-[36px] transition-colors ${
                      item.done
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                    }`}
                  >
                    {item.done ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-transparent" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {getChatName(item.chatId)}
                      </span>
                      {(item.chatId.startsWith('chat-demo') || chats.find((c) => c.id === item.chatId)?.source === 'demo') && (
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded-md flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Demo data
                        </span>
                      )}
                      {/* Color-coded deadline badge */}
                      {item.deadline && (
                        <DeadlineBadge deadline={item.deadline} done={item.done} size="sm" />
                      )}
                      <span className="text-slate-400">·</span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md capitalize ${
                          item.priority === 'high'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : item.priority === 'medium'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {item.priority} priority
                      </span>
                    </div>

                    <h3
                      className={`text-base font-bold mt-1 leading-snug ${
                        item.done
                          ? 'line-through text-slate-500 dark:text-slate-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {item.title}
                    </h3>

                    {item.details && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {item.details}
                      </p>
                    )}

                    {item.sourceMessage && (
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        Chat message: "{item.sourceMessage}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                  {/* Reminder selector */}
                  {item.deadline && (
                    <ReminderSelector
                      currentOffset={item.reminderOffset}
                      onSelectOffset={(offset) => setItemReminder(item.id, offset)}
                      onRequestPermission={requestNotificationPermission}
                      disabled={item.done}
                    />
                  )}

                  <button
                    onClick={() => deleteItem(item.id)}
                    aria-label="Delete assignment"
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Create Assignment
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add a homework problem set, lab report, or essay
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Problem Set 5: Dynamic Programming"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                  />
                </div>
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
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (Urgent)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Submission Instructions / Details
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Submit PDF to Canvas before 11:59 PM"
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
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
