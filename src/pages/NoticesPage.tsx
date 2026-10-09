import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  CheckCheck,
  AlertTriangle,
  Info,
  Clock,
  X,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useSyncPulse } from '../context/SyncPulseContext';
import { ExtractedItem, ItemPriority } from '../types';
import { EmptyState } from '../components/EmptyState';

export const NoticesPage: React.FC = () => {
  const {
    items,
    chats,
    addItems,
    deleteItem,
    toggleDone,
    showToast,
  } = useSyncPulse();

  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [chatFilter, setChatFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Notice form
  const [title, setTitle] = useState('');
  const [chatId, setChatId] = useState(chats[0]?.id || '');
  const [details, setDetails] = useState('');
  const [priority, setPriority] = useState<ItemPriority>('medium');

  const getChatName = (cId: string) => chats.find((c) => c.id === cId)?.name || 'Class Chat';

  const noticeItems = items
    .filter((i) => i.type === 'notice')
    .filter((n) => (filterPriority === 'all' ? true : n.priority === filterPriority))
    .filter((n) => (chatFilter === 'all' ? true : n.chatId === chatFilter));

  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !details.trim()) return;

    const chosenChatId = chatId || chats[0]?.id || 'chat-demo';
    const nowIso = new Date().toISOString();

    const candidateItem: ExtractedItem = {
      id: `item-not-${Date.now()}`,
      chatId: chosenChatId,
      type: 'notice',
      title: title.trim(),
      details: details.trim(),
      sender: 'Course Announcement',
      sourceMessage: `Notice posted: ${title.trim()}`,
      deadline: null,
      done: false,
      createdAt: nowIso,
      priority,
    };

    addItems([candidateItem]);

    setTitle('');
    setDetails('');
    setIsModalOpen(false);
  };

  const handleMarkAllRead = () => {
    const unread = items.filter((i) => i.type === 'notice' && !i.done);
    unread.forEach((n) => toggleDone(n.id));
    showToast('All notices marked as read');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Class Notices
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Important announcements, room shifts, TA notes, and campus updates.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {items.some((i) => i.type === 'notice' && !i.done) && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Mark All as Read</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Post Notice</span>
          </button>
        </div>
      </div>

      {/* Priority & Chat Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit">
          {(['all', 'high', 'medium', 'low'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer min-h-[36px] ${
                filterPriority === p
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p === 'all' ? 'All Notices' : `${p} priority`}
            </button>
          ))}
        </div>

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
      </div>

      {/* Notices List or Empty State */}
      {items.filter((i) => i.type === 'notice').length === 0 ? (
        <EmptyState
          icon={Bell}
          text="No campus or classroom announcements right now."
          actionText="Post a Notice"
          onAction={() => setIsModalOpen(true)}
        />
      ) : noticeItems.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 my-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            No notices found in this filter category.
          </p>
          <button
            onClick={() => {
              setFilterPriority('all');
              setChatFilter('all');
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium cursor-pointer min-h-[40px]"
          >
            Show All Notices
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {noticeItems.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.done) toggleDone(n.id);
              }}
              className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer shadow-sm ${
                !n.done
                  ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      n.priority === 'high'
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                        : n.priority === 'medium'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                        : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    {n.priority === 'high' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {getChatName(n.chatId)}
                      </span>
                      {(n.chatId.startsWith('chat-demo') || chats.find((c) => c.id === n.chatId)?.source === 'demo') && (
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded-md flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Demo data
                        </span>
                      )}
                      <span className="text-slate-400">·</span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md capitalize ${
                          n.priority === 'high'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                            : n.priority === 'medium'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {n.priority}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-xs text-slate-400">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>

                      {!n.done && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {n.title}
                    </h3>

                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                      {n.details}
                    </p>

                    {n.sourceMessage && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="line-clamp-1">Original chat: "{n.sourceMessage}"</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(n.id);
                    }}
                    aria-label="Delete notice"
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POST NOTICE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Post Class Notice
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Save an announcement, room change, or professor note
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Notice Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab 4 Moved to Room 302"
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
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ItemPriority)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High (Urgent / Room Change)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Announcement Details
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Bring your lab manual and safety goggles. Equipment will be provided at the door."
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
                  Post Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
