import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  Bell,
  ArrowRight,
  MessageSquare,
  RefreshCw,
  Plus,
  Compass,
  AlertTriangle,
  Circle,
  Clock,
} from 'lucide-react';
import { useSyncPulse } from '../context/SyncPulseContext';
import { EmptyState } from '../components/EmptyState';
import { DeadlineBadge } from '../components/DeadlineBadge';
import { ReminderSelector } from '../components/ReminderSelector';
import { needsAttentionToday, isDueThisWeek } from '../utils/deadlines';

export const DashboardPage: React.FC = () => {
  const {
    student,
    chats,
    items,
    messages,
    summaries,
    toggleDone,
    setActiveTab,
    runAIScan,
    isScanning,
    summariseAllChatsAI,
    isSummarising,
    loadDemoMode,
    hasDemoData,
    setItemReminder,
    requestNotificationPermission,
  } = useSyncPulse();

  const assignments = items.filter((i) => i.type === 'assignment');
  const dates = items.filter((i) => i.type === 'date');
  const notices = items.filter((i) => i.type === 'notice');

  const pendingAssignments = assignments.filter((a) => !a.done);
  const totalCasualIgnored = summaries.reduce((acc, s) => acc + s.casualCount, 0);

  // Check if totally empty
  const isTotallyEmpty = chats.length === 0 && items.length === 0 && messages.length === 0;

  if (isTotallyEmpty) {
    return (
      <div className="py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome to SyncPulse
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-md mx-auto">
            AI Chat Hub: turn class chats into a clear to-do list.
          </p>
        </div>
        <EmptyState
          icon={Compass}
          text="No class updates yet. Connect your study groups to turn chat chaos into clear to-dos."
          actionText="Connect Your First Chat"
          onAction={() => setActiveTab('connect')}
        />
      </div>
    );
  }

  const getChatName = (chatId: string) => {
    return chats.find((c) => c.id === chatId)?.name || 'Class Group';
  };

  // Warning banner calculations: anything overdue or due within 24 hours
  const urgentAttentionItems = items.filter(
    (item) => !item.done && needsAttentionToday(item.deadline, item.done)
  );
  const attentionCount = urgentAttentionItems.length;

  // 4 Cards calculations
  const deadlinesThisWeekItems = items.filter(
    (item) => !item.done && isDueThisWeek(item.deadline, item.done)
  );

  // Next up list: 5 nearest unfinished deadlines
  const nextUpItems = items
    .filter((item) => !item.done && item.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* 1. TOP WARNING BANNER (When anything is overdue or due within 24 hours) */}
      {attentionCount > 0 && (
        <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 dark:from-rose-950/80 dark:via-amber-950/50 dark:to-rose-950/80 border-2 border-rose-300 dark:border-rose-800 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-rose-950 dark:text-rose-100 flex items-center gap-2">
                <span>
                  {attentionCount} {attentionCount === 1 ? 'assignment needs' : 'assignments need'} attention today
                </span>
              </div>
              <p className="text-xs sm:text-sm text-rose-800 dark:text-rose-300 font-medium">
                {urgentAttentionItems.filter((i) => new Date(i.deadline!).getTime() < Date.now()).length > 0
                  ? 'Urgent: Some deadlines are overdue or expiring within 24 hours!'
                  : 'Due in less than 24 hours. Review and complete your tasks now.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              onClick={() => setActiveTab('assignments')}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow cursor-pointer min-h-[44px] flex items-center gap-2"
            >
              <span>Open urgent items</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Welcome Header & AI Pulse Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-indigo-300 text-xs sm:text-sm font-semibold mb-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
            <span>AI Chat Hub Active</span>
            <span aria-hidden="true">·</span>
            <span>{student.semester}</span>
            {totalCasualIgnored > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-300 font-normal">
                  {totalCasualIgnored} casual chats filtered out
                </span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 text-white">
            Hello, {student.name.split(' ')[0]} 👋
          </h1>
          <p className="text-indigo-100/90 text-sm sm:text-base mb-6 leading-relaxed">
            Turn class chats into a clear to-do list. We have organized deadlines and reminders from your WhatsApp, Telegram, Slack, and Discord study groups.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={summariseAllChatsAI}
              disabled={isSummarising}
              className="px-5 py-2.5 rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer min-h-[44px]"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Summarise all chats</span>
            </button>

            <button
              onClick={runAIScan}
              disabled={isScanning}
              className="px-4 py-2.5 rounded-xl bg-indigo-500/30 hover:bg-indigo-500/40 text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer min-h-[44px] flex items-center gap-1.5 border border-indigo-400/40"
            >
              <RefreshCw className={`w-4 h-4 text-indigo-200 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Quick Scan'}</span>
            </button>

            {!hasDemoData && (
              <button
                onClick={loadDemoMode}
                className="px-4 py-2.5 rounded-xl bg-indigo-500/30 hover:bg-indigo-500/40 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer min-h-[44px] flex items-center gap-1.5 border border-indigo-400/40"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Try demo mode</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('chats')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer min-h-[44px] flex items-center gap-1.5"
            >
              <span>View Chat Stream ({messages.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Soft background glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 3. FOUR CARDS: Pending assignments, Deadlines this week, Latest notices, Chats connected */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Pending assignments */}
        <button
          onClick={() => setActiveTab('assignments')}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-left hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Pending assignments
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {pendingAssignments.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>{assignments.filter((a) => a.done).length} completed</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline">View →</span>
          </div>
        </button>

        {/* Card 2: Deadlines this week */}
        <button
          onClick={() => setActiveTab('dates')}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-left hover:border-amber-300 dark:hover:border-amber-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Deadlines this week
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {deadlinesThisWeekItems.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Exams & submissions</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold group-hover:underline">View →</span>
          </div>
        </button>

        {/* Card 3: Latest notices */}
        <button
          onClick={() => setActiveTab('notices')}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-left hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Latest notices
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {notices.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Circulars & circulars</span>
            <span className="text-violet-600 dark:text-violet-400 font-semibold group-hover:underline">View →</span>
          </div>
        </button>

        {/* Card 4: Chats connected */}
        <button
          onClick={() => setActiveTab('chats')}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-left hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Chats connected
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {chats.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>{messages.length} messages</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline">Open →</span>
          </div>
        </button>
      </div>

      {/* 4. MAIN SPLIT: "NEXT UP" (5 NEAREST UNFINISHED DEADLINES) + CHAT SUMMARIES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: "Next up" list showing the 5 nearest unfinished deadlines */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Next up
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                The 5 nearest unfinished deadlines across all your classes
              </p>
            </div>
            <button
              onClick={() => setActiveTab('assignments')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer min-h-[36px]"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {nextUpItems.length === 0 ? (
            <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                You’re all caught up!
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                No unfinished deadlines right now. New deadlines from imported class chats will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {nextUpItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-850/80 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => toggleDone(item.id)}
                      aria-label={`Mark ${item.title} done`}
                      className="mt-0.5 w-6 h-6 rounded-lg border border-slate-300 dark:border-slate-600 hover:border-indigo-500 flex items-center justify-center shrink-0 cursor-pointer min-h-[36px] min-w-[36px] transition-colors"
                    >
                      <Circle className="w-3.5 h-3.5 text-transparent" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {/* Colour-coded deadline badge */}
                        <DeadlineBadge deadline={item.deadline} done={item.done} size="sm" />

                        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                          {getChatName(item.chatId)}
                        </span>

                        {(item.chatId.startsWith('chat-demo') ||
                          chats.find((c) => c.id === item.chatId)?.source === 'demo') && (
                          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded-md flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> Demo data
                          </span>
                        )}

                        <span className="text-[11px] text-slate-400 capitalize">
                          · {item.type}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {item.title}
                      </h3>

                      {item.details && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {item.details}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Reminder Selector */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <ReminderSelector
                      currentOffset={item.reminderOffset}
                      onSelectOffset={(offset) => setItemReminder(item.id, offset)}
                      onRequestPermission={requestNotificationPermission}
                    />

                    <button
                      onClick={() => setActiveTab(item.type === 'assignment' ? 'assignments' : 'dates')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Open details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Showing top 5 nearest deadlines</span>
            <button
              onClick={() => setActiveTab('assignments')}
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              See all tasks ({assignments.length}) →
            </button>
          </div>
        </div>

        {/* Right Column: Latest Notices & Chat Summaries */}
        <div className="lg:col-span-4 space-y-6">
          {/* Latest Notices */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-violet-500" />
                  <span>Important Notices</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  From university faculty & circulars
                </p>
              </div>
              <button
                onClick={() => setActiveTab('notices')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer min-h-[36px] flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {notices.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                No circulars or notices extracted yet.
              </p>
            ) : (
              <div className="space-y-3">
                {notices.slice(0, 3).map((notice) => (
                  <div
                    key={notice.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-violet-700 dark:text-violet-300">
                        {getChatName(notice.chatId)}
                      </span>
                      <span className="text-slate-400">{notice.sender}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white leading-snug">
                      {notice.title}
                    </h4>
                    {notice.details && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {notice.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat Summary Highlights */}
          {summaries.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>Filtered Casual Chat</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Casual messages skipped by AI
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {summaries.slice(0, 2).map((sum) => (
                  <div
                    key={sum.id}
                    className="p-3 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1 text-[11px]">
                      <span className="font-bold text-indigo-950 dark:text-indigo-200">
                        {getChatName(sum.chatId)}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {sum.casualCount} casual chats skipped
                      </span>
                    </div>

                    {sum.casualHighlights.length > 0 && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                        "{sum.casualHighlights[0]}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
