import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  CalendarClock,
  Bell,
  ArrowRight,
  MessageSquare,
  RefreshCw,
  Plus,
  Compass,
  AlertTriangle,
  Circle,
  Clock,
  Video,
  RotateCw,
  ExternalLink,
  Check,
  CheckSquare,
} from 'lucide-react';
import { useSyncPulse } from '../context/SyncPulseContext';
import { EmptyState } from '../components/EmptyState';
import { DeadlineBadge } from '../components/DeadlineBadge';
import { ReminderSelector } from '../components/ReminderSelector';
import { CalendarButton } from '../components/CalendarButton';
import { ItemRowSkeleton } from '../components/SkeletonLoader';
import { needsAttentionToday, isDueThisWeek } from '../utils/deadlines';
import { ExtractedItem, MessageReminder } from '../types';

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
    exportAllUpcomingCalendar,
    messageReminders,
    toggleMessageReminderDone,
    openReminderModalForMessage,
    openChatForMessage,
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
          <h1 className="text-2xl sm:text-3xl font-bold text-[#3F4A16] dark:text-[#EEF1DC] mb-2">
            Welcome to SyncPulse
          </h1>
          <p className="text-[#6B7059] dark:text-[#A4AA8E] text-sm sm:text-base max-w-md mx-auto">
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

  // Today's plan calculations
  const now = new Date();
  const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nowEnd = new Date(nowStart.getTime() + 86400000 - 1);

  const todaysItems = items.filter((item) => {
    const dStr = item.startTime || item.deadline;
    if (!dStr) return false;
    const d = new Date(dStr);
    return !isNaN(d.getTime()) && d >= nowStart && d <= nowEnd;
  });

  const todaysReminders = messageReminders.filter((r) => {
    const d = new Date(r.remindAt);
    return !isNaN(d.getTime()) && d >= nowStart && d <= nowEnd;
  });

  interface TodayPlanRow {
    id: string;
    sourceType: 'item' | 'reminder';
    type: 'assignment' | 'meeting' | 'date' | 'reminder' | 'notice';
    title: string;
    chatId: string;
    chatName: string;
    time: Date;
    timeFormatted: string;
    done: boolean;
    rawItem?: ExtractedItem;
    rawReminder?: MessageReminder;
  }

  const todayPlanRows: TodayPlanRow[] = [
    ...todaysItems.map((item) => {
      const d = new Date(item.startTime || item.deadline!);
      return {
        id: `plan-item-${item.id}`,
        sourceType: 'item' as const,
        type: item.type,
        title: item.title,
        chatId: item.chatId,
        chatName: getChatName(item.chatId),
        time: d,
        timeFormatted: item.isAllDay
          ? 'All Day'
          : d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        done: item.done,
        rawItem: item,
      };
    }),
    ...todaysReminders.map((r) => {
      const d = new Date(r.remindAt);
      return {
        id: `plan-rem-${r.id}`,
        sourceType: 'reminder' as const,
        type: 'reminder' as const,
        title: r.title || r.note || r.sourceText?.slice(0, 48) || 'Message Reminder',
        chatId: r.chatId,
        chatName: getChatName(r.chatId),
        time: d,
        timeFormatted: d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        done: r.status === 'done',
        rawReminder: r,
      };
    }),
  ].sort((a, b) => a.time.getTime() - b.time.getTime());

  const todayCompletedCount = todayPlanRows.filter((r) => r.done).length;

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* 1. TOP WARNING BANNER (When anything is overdue or due within 24 hours) */}
      {attentionCount > 0 && (
        <div className="bg-[#FEFCE8] dark:bg-[#28220A] border-2 border-[#FEF08A] dark:border-[#854D0E] rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#D98324] text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-[#78350F] dark:text-[#FEF08A] flex items-center gap-2">
                <span>
                  {attentionCount} {attentionCount === 1 ? 'assignment needs' : 'assignments need'} attention today
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#C0392B] dark:text-[#F87171] font-semibold">
                {urgentAttentionItems.filter((i) => new Date(i.deadline!).getTime() < Date.now()).length > 0
                  ? 'Urgent: Some deadlines are overdue or expiring within 24 hours!'
                  : 'Due in less than 24 hours. Review and complete your tasks now.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              onClick={() => setActiveTab('assignments')}
              className="px-5 py-2.5 bg-[#C0392B] hover:bg-[#A93226] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer min-h-[44px] flex items-center gap-2"
            >
              <span>Open urgent items</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Welcome Header & AI Pulse Banner */}
      <div className="bg-gradient-to-br from-[#3F4A16] via-[#2E3710] to-[#1D2112] border border-[#5A6823]/40 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-[#DDE3BE] text-xs sm:text-sm font-semibold mb-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#9AAE3C]" />
            <span>AI Chat Hub Active</span>
            <span aria-hidden="true">·</span>
            <span>{student.semester}</span>
            {totalCasualIgnored > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#EEF1DC] font-normal">
                  {totalCasualIgnored} casual chats filtered out
                </span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 text-white">
            Hello, {student.name.split(' ')[0]} 👋
          </h1>
          <p className="text-[#EEF1DC]/90 text-sm sm:text-base mb-6 leading-relaxed">
            Turn class chats into a clear to-do list. We have organized deadlines and reminders from your WhatsApp, Telegram, Slack, and Discord study groups.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={summariseAllChatsAI}
              disabled={isSummarising}
              className="px-5 py-2.5 rounded-xl bg-white text-[#3F4A16] hover:bg-[#EEF1DC] font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer min-h-[44px]"
            >
              <Sparkles className="w-4 h-4 text-[#6B7A2A]" />
              <span>Summarise all chats</span>
            </button>

            <button
              onClick={runAIScan}
              disabled={isScanning}
              className="px-4 py-2.5 rounded-xl bg-[#6B7A2A]/40 hover:bg-[#6B7A2A]/60 text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer min-h-[44px] flex items-center gap-1.5 border border-[#DDE3BE]/30"
            >
              <RefreshCw className={`w-4 h-4 text-[#DDE3BE] ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Quick Scan'}</span>
            </button>

            {!hasDemoData && (
              <button
                onClick={loadDemoMode}
                className="px-4 py-2.5 rounded-xl bg-[#6B7A2A]/40 hover:bg-[#6B7A2A]/60 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer min-h-[44px] flex items-center gap-1.5 border border-[#DDE3BE]/30"
              >
                <Sparkles className="w-4 h-4 text-[#C9A227]" />
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
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#6B7A2A]/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* HIGHLIGHTED "TODAY'S PLAN" SECTION */}
      <section className="bg-white dark:bg-[#1D2112] rounded-3xl p-5 sm:p-6 border border-[#E3E6D3] dark:border-[#2B321A] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E3E6D3] dark:border-[#2B321A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6B7A2A] text-white flex items-center justify-center shadow-xs shrink-0">
              <CalendarClock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-[#3F4A16] dark:text-[#EEF1DC]">
                  Today's plan
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] border border-[#DDE3BE] dark:border-[#384221] tabular-nums">
                  {todayPlanRows.length} {todayPlanRows.length === 1 ? 'item' : 'items'}
                </span>
                {todayPlanRows.length > 0 && (
                  <span className="text-xs text-[#6B7059] dark:text-[#A4AA8E] font-medium">
                    ({todayCompletedCount} of {todayPlanRows.length} completed)
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B7059] dark:text-[#A4AA8E] mt-0.5">
                {now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })} · Scheduled across all your class chats
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('agenda')}
            className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-white dark:bg-[#1D2112] border border-[#E3E6D3] dark:border-[#2B321A] hover:bg-[#EEF1DC] dark:hover:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs min-h-[38px]"
          >
            <span>Open Agenda</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayPlanRows.length === 0 ? (
          <div className="py-6 px-4 bg-[#F7F8F2] dark:bg-[#14170D] rounded-2xl border border-[#E3E6D3] dark:border-[#2B321A] text-center space-y-2">
            <div className="w-9 h-9 rounded-full bg-[#EEF1DC] dark:bg-[#283017] text-[#6B7A2A] dark:text-[#9AAE3C] flex items-center justify-center mx-auto">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <p className="text-sm font-bold text-[#3F4A16] dark:text-[#EEF1DC]">
              Nothing due today — you're completely caught up!
            </p>
            <p className="text-xs text-[#6B7059] dark:text-[#A4AA8E] max-w-md mx-auto">
              Check upcoming deadlines for tomorrow and this week in your full timeline.
            </p>
            <button
              onClick={() => setActiveTab('agenda')}
              className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#6B7A2A] dark:text-[#9AAE3C] hover:underline cursor-pointer"
            >
              <span>View upcoming days in Agenda</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayPlanRows.map((row) => (
              <div
                key={row.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
                  row.done
                    ? 'bg-[#F7F8F2] dark:bg-[#14170D] border-[#E3E6D3] dark:border-[#2B321A] opacity-60'
                    : 'bg-white dark:bg-[#1D2112] border-[#E3E6D3] dark:border-[#2B321A] hover:border-[#6B7A2A] dark:hover:border-[#9AAE3C]'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (row.sourceType === 'item' && row.rawItem) {
                        toggleDone(row.rawItem.id);
                      } else if (row.sourceType === 'reminder' && row.rawReminder) {
                        toggleMessageReminderDone(row.rawReminder.id);
                      }
                    }}
                    className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                      row.done
                        ? 'bg-[#6B7A2A] border-[#6B7A2A] text-white'
                        : 'border-[#E3E6D3] dark:border-[#384221] hover:border-[#6B7A2A] bg-white dark:bg-[#1D2112]'
                    }`}
                    aria-label={row.done ? 'Mark incomplete' : 'Mark done'}
                  >
                    {row.done && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-xs font-bold text-[#2B2F1E] dark:text-[#EEF1DC] tabular-nums">
                        {row.timeFormatted}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          row.type === 'assignment'
                            ? 'bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC]'
                            : row.type === 'meeting'
                            ? 'bg-[#DDE3BE] dark:bg-[#343C1F] text-[#3F4A16] dark:text-[#EEF1DC]'
                            : row.type === 'date'
                            ? 'bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC]'
                            : 'bg-[#FEF08A] dark:bg-[#382F10] text-[#78350F] dark:text-[#FEF08A]'
                        }`}
                      >
                        {row.type}
                      </span>
                      <span className="text-[11px] font-semibold text-[#6B7A2A] dark:text-[#9AAE3C] bg-[#EEF1DC] dark:bg-[#283017] px-2 py-0.5 rounded-md truncate max-w-[140px]">
                        {row.chatName}
                      </span>
                    </div>

                    <h3
                      className={`text-sm font-bold text-[#2B2F1E] dark:text-[#EEF1DC] leading-snug ${
                        row.done ? 'line-through text-[#6B7059] dark:text-[#A4AA8E]' : ''
                      }`}
                    >
                      {row.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  {row.rawItem && <CalendarButton item={row.rawItem} size="sm" />}

                  <button
                    type="button"
                    onClick={() => {
                      if (row.rawItem) {
                        const msg = messages.find(
                          (m) => m.chatId === row.chatId && m.text.includes(row.rawItem!.title)
                        ) || {
                          id: `msg-${row.rawItem.id}`,
                          chatId: row.chatId,
                          sender: row.rawItem.sender,
                          text: row.rawItem.details || row.rawItem.title,
                          timestamp: row.time.toISOString(),
                          hash: 'h-today',
                        };
                        openReminderModalForMessage(msg, row.rawItem);
                      } else if (row.rawReminder) {
                        const msg = messages.find((m) => m.id === row.rawReminder!.messageId) || {
                          id: row.rawReminder.messageId,
                          chatId: row.rawReminder.chatId,
                          sender: row.rawReminder.sender || 'Classmate',
                          text: row.rawReminder.sourceText || row.rawReminder.title || '',
                          timestamp: row.time.toISOString(),
                          hash: 'h-today-rem',
                        };
                        openReminderModalForMessage(msg, null);
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-[#E3E6D3] dark:border-[#2B321A] hover:bg-[#EEF1DC] dark:hover:bg-[#283017] text-[#2B2F1E] dark:text-[#EEF1DC] text-xs font-semibold flex items-center gap-1 cursor-pointer min-h-[34px] transition-colors"
                    title="Remind me"
                  >
                    <Bell className="w-3.5 h-3.5 text-[#D98324]" />
                    <span className="hidden sm:inline">Remind</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (row.rawReminder) {
                        openChatForMessage(row.chatId, row.rawReminder.messageId);
                      } else {
                        openChatForMessage(row.chatId);
                      }
                    }}
                    className="p-1.5 rounded-xl text-[#6B7059] dark:text-[#A4AA8E] hover:text-[#6B7A2A] dark:hover:text-[#9AAE3C] hover:bg-[#EEF1DC]/60 dark:hover:bg-[#283017]/60 transition-colors cursor-pointer min-h-[34px] min-w-[34px] flex items-center justify-center"
                    title="Open message in chat"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. FOUR CARDS: Pending assignments, Deadlines this week, Latest notices, Chats connected */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Pending assignments */}
        <button
          onClick={() => setActiveTab('assignments')}
          className="bg-white dark:bg-[#1D2112] p-4 sm:p-5 rounded-2xl border border-[#E3E6D3] dark:border-[#2B321A] shadow-sm text-left hover:border-[#6B7A2A] dark:hover:border-[#9AAE3C] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#6B7059] dark:text-[#A4AA8E]">
              Pending assignments
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#EEF1DC] dark:bg-[#283017] text-[#6B7A2A] dark:text-[#9AAE3C] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#2B2F1E] dark:text-[#EEF1DC] tabular-nums">
            {pendingAssignments.length}
          </div>
          <div className="text-[11px] text-[#6B7059] dark:text-[#A4AA8E] mt-1 flex items-center justify-between">
            <span>{assignments.filter((a) => a.done).length} completed</span>
            <span className="text-[#6B7A2A] dark:text-[#9AAE3C] font-semibold group-hover:underline">View →</span>
          </div>
        </button>

        {/* Card 2: Deadlines this week */}
        <button
          onClick={() => setActiveTab('dates')}
          className="bg-white dark:bg-[#1D2112] p-4 sm:p-5 rounded-2xl border border-[#E3E6D3] dark:border-[#2B321A] shadow-sm text-left hover:border-[#6B7A2A] dark:hover:border-[#9AAE3C] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#6B7059] dark:text-[#A4AA8E]">
              Deadlines this week
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#EEF1DC] dark:bg-[#283017] text-[#6B7A2A] dark:text-[#9AAE3C] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#2B2F1E] dark:text-[#EEF1DC] tabular-nums">
            {deadlinesThisWeekItems.length}
          </div>
          <div className="text-[11px] text-[#6B7059] dark:text-[#A4AA8E] mt-1 flex items-center justify-between">
            <span>Exams & submissions</span>
            <span className="text-[#6B7A2A] dark:text-[#9AAE3C] font-semibold group-hover:underline">View →</span>
          </div>
        </button>

        {/* Card 3: Latest notices */}
        <button
          onClick={() => setActiveTab('notices')}
          className="bg-white dark:bg-[#1D2112] p-4 sm:p-5 rounded-2xl border border-[#E3E6D3] dark:border-[#2B321A] shadow-sm text-left hover:border-[#6B7A2A] dark:hover:border-[#9AAE3C] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#6B7059] dark:text-[#A4AA8E]">
              Latest notices
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#EEF1DC] dark:bg-[#283017] text-[#6B7A2A] dark:text-[#9AAE3C] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#2B2F1E] dark:text-[#EEF1DC] tabular-nums">
            {notices.length}
          </div>
          <div className="text-[11px] text-[#6B7059] dark:text-[#A4AA8E] mt-1 flex items-center justify-between">
            <span>Circulars & circulars</span>
            <span className="text-[#6B7A2A] dark:text-[#9AAE3C] font-semibold group-hover:underline">View →</span>
          </div>
        </button>

        {/* Card 4: Chats connected */}
        <button
          onClick={() => setActiveTab('chats')}
          className="bg-white dark:bg-[#1D2112] p-4 sm:p-5 rounded-2xl border border-[#E3E6D3] dark:border-[#2B321A] shadow-sm text-left hover:border-[#6B7A2A] dark:hover:border-[#9AAE3C] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#6B7059] dark:text-[#A4AA8E]">
              Chats connected
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#EEF1DC] dark:bg-[#283017] text-[#6B7A2A] dark:text-[#9AAE3C] flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#2B2F1E] dark:text-[#EEF1DC] tabular-nums">
            {chats.length}
          </div>
          <div className="text-[11px] text-[#6B7059] dark:text-[#A4AA8E] mt-1 flex items-center justify-between">
            <span>{messages.length} messages</span>
            <span className="text-[#6B7A2A] dark:text-[#9AAE3C] font-semibold group-hover:underline">Open →</span>
          </div>
        </button>
      </div>

      {/* 4. MAIN SPLIT: "NEXT UP" (5 NEAREST UNFINISHED DEADLINES) + CHAT SUMMARIES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: "Next up" list showing the 5 nearest unfinished deadlines */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1D2112] rounded-3xl p-5 sm:p-6 border border-[#E3E6D3] dark:border-[#2B321A] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#6B7A2A] dark:text-[#9AAE3C]" />
                <h2 className="text-lg font-bold text-[#3F4A16] dark:text-[#EEF1DC]">
                  Next up
                </h2>
              </div>
              <p className="text-xs text-[#6B7059] dark:text-[#A4AA8E] mt-0.5">
                The 5 nearest unfinished deadlines across all your classes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportAllUpcomingCalendar}
                className="px-2.5 py-1.5 rounded-xl border border-[#E3E6D3] dark:border-[#2B321A] bg-white dark:bg-[#1D2112] text-[#3F4A16] dark:text-[#EEF1DC] hover:bg-[#EEF1DC] dark:hover:bg-[#283017] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px]"
                title="Export all unfinished upcoming items to calendar (.ics)"
              >
                <Calendar className="w-3.5 h-3.5 text-[#6B7A2A] dark:text-[#9AAE3C]" />
                <span className="hidden sm:inline">Add all to calendar</span>
                <span className="sm:hidden">Calendar</span>
              </button>

              <button
                onClick={() => setActiveTab('assignments')}
                className="text-xs font-semibold text-[#6B7A2A] dark:text-[#9AAE3C] hover:underline flex items-center gap-1 cursor-pointer min-h-[36px]"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {isScanning ? (
            <div className="space-y-3">
              <ItemRowSkeleton />
              <ItemRowSkeleton />
              <ItemRowSkeleton />
            </div>
          ) : nextUpItems.length === 0 ? (
            <div className="text-center py-10 bg-[#F7F8F2] dark:bg-[#14170D] rounded-2xl border border-dashed border-[#E3E6D3] dark:border-[#2B321A]">
              <CheckCircle2 className="w-8 h-8 text-[#6B7A2A] dark:text-[#9AAE3C] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#3F4A16] dark:text-[#EEF1DC]">
                You’re all caught up!
              </p>
              <p className="text-xs text-[#6B7059] dark:text-[#A4AA8E] mt-1 max-w-sm mx-auto">
                No unfinished deadlines right now. New deadlines from imported class chats will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {nextUpItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 rounded-2xl border border-[#E3E6D3] dark:border-[#2B321A] bg-white dark:bg-[#1D2112] hover:border-[#6B7A2A] dark:hover:border-[#9AAE3C] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => toggleDone(item.id)}
                      aria-label={`Mark ${item.title} done`}
                      className="mt-0.5 w-6 h-6 rounded-lg border border-[#E3E6D3] dark:border-[#384221] hover:border-[#6B7A2A] flex items-center justify-center shrink-0 cursor-pointer min-h-[36px] min-w-[36px] transition-colors"
                    >
                      <Circle className="w-3.5 h-3.5 text-transparent" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {/* Colour-coded deadline badge */}
                        <DeadlineBadge deadline={item.deadline} done={item.done} size="sm" />

                        <span className="text-[11px] font-semibold text-[#6B7A2A] dark:text-[#9AAE3C]">
                          {getChatName(item.chatId)}
                        </span>

                        {(item.chatId.startsWith('chat-demo') ||
                          chats.find((c) => c.id === item.chatId)?.source === 'demo') && (
                          <span className="text-[10px] font-semibold text-[#6B7A2A] dark:text-[#9AAE3C] bg-[#EEF1DC] dark:bg-[#283017] px-1.5 py-0.2 rounded-md flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> Demo data
                          </span>
                        )}

                        {item.type === 'meeting' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#DDE3BE] dark:bg-[#343C1F] text-[#3F4A16] dark:text-[#EEF1DC] flex items-center gap-1">
                            <Video className="w-3 h-3" />
                            <span>Meeting</span>
                          </span>
                        )}

                        {item.isRescheduled && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FEF08A] dark:bg-[#382F10] text-[#78350F] dark:text-[#FEF08A] border border-[#FDE047] dark:border-[#854D0E] flex items-center gap-1">
                            <RotateCw className="w-3 h-3 text-[#D98324]" />
                            <span>Rescheduled</span>
                          </span>
                        )}

                        {item.isCalendarSynced && (
                          <span
                            className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] border border-[#DDE3BE] dark:border-[#384221] flex items-center gap-1"
                            title="Synced to calendar"
                          >
                            <Calendar className="w-2.5 h-2.5 text-[#6B7A2A] dark:text-[#9AAE3C]" />
                            <span>Synced</span>
                          </span>
                        )}

                        <span className="text-[11px] text-[#6B7059] dark:text-[#A4AA8E] capitalize">
                          · {item.type}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-[#2B2F1E] dark:text-[#EEF1DC] leading-snug">
                        {item.title}
                      </h3>

                      {item.details && (
                        <p className="text-xs text-[#6B7059] dark:text-[#A4AA8E] mt-0.5 line-clamp-1">
                          {item.details}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Join Link + Reminder Selector */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {item.meetingLink && (
                      <a
                        href={item.meetingLink.startsWith('http') ? item.meetingLink : `https://${item.meetingLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[#6B7A2A] hover:bg-[#5A6823] active:bg-[#4A561C] text-white font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors min-h-[36px] cursor-pointer"
                        aria-label={`Join meeting for ${item.title}`}
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                      </a>
                    )}

                    <ReminderSelector
                      currentOffset={item.reminderOffset}
                      onSelectOffset={(offset) => setItemReminder(item.id, offset)}
                      onRequestPermission={requestNotificationPermission}
                    />

                    <CalendarButton item={item} />

                    <button
                      onClick={() => setActiveTab(item.type === 'assignment' ? 'assignments' : 'dates')}
                      className="p-1.5 rounded-lg text-[#6B7059] dark:text-[#A4AA8E] hover:text-[#6B7A2A] dark:hover:text-[#9AAE3C] transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Open details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 flex items-center justify-between text-xs text-[#6B7059] dark:text-[#A4AA8E]">
            <span>Showing top 5 nearest deadlines</span>
            <button
              onClick={() => setActiveTab('assignments')}
              className="font-semibold text-[#6B7A2A] dark:text-[#9AAE3C] hover:underline cursor-pointer"
            >
              See all tasks ({assignments.length}) →
            </button>
          </div>
        </div>

        {/* Right Column: Latest Notices & Chat Summaries */}
        <div className="lg:col-span-4 space-y-6">
          {/* Latest Notices */}
          <div className="bg-white dark:bg-[#1D2112] rounded-3xl p-5 sm:p-6 border border-[#E3E6D3] dark:border-[#2B321A] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#3F4A16] dark:text-[#EEF1DC] flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-[#6B7A2A]" />
                  <span>Important Notices</span>
                </h2>
                <p className="text-xs text-[#6B7059] dark:text-[#A4AA8E]">
                  From university faculty & circulars
                </p>
              </div>
              <button
                onClick={() => setActiveTab('notices')}
                className="text-xs font-semibold text-[#6B7A2A] dark:text-[#9AAE3C] hover:underline cursor-pointer min-h-[36px] flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {notices.length === 0 ? (
              <p className="text-xs text-[#6B7059] dark:text-[#A4AA8E] py-4 text-center">
                No circulars or notices extracted yet.
              </p>
            ) : (
              <div className="space-y-3">
                {notices.slice(0, 3).map((notice) => (
                  <div
                    key={notice.id}
                    className="p-3 rounded-2xl bg-[#F7F8F2] dark:bg-[#14170D] border border-[#E3E6D3] dark:border-[#2B321A]"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-[#3F4A16] dark:text-[#EEF1DC]">
                        {getChatName(notice.chatId)}
                      </span>
                      <span className="text-[#6B7059] dark:text-[#A4AA8E]">{notice.sender}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-[#2B2F1E] dark:text-[#EEF1DC] leading-snug">
                      {notice.title}
                    </h4>
                    {notice.details && (
                      <p className="text-[11px] text-[#6B7059] dark:text-[#A4AA8E] mt-1 line-clamp-2">
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
            <div className="bg-white dark:bg-[#1D2112] rounded-3xl p-5 sm:p-6 border border-[#E3E6D3] dark:border-[#2B321A] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#3F4A16] dark:text-[#EEF1DC] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#6B7A2A]" />
                    <span>Filtered Casual Chat</span>
                  </h2>
                  <p className="text-xs text-[#6B7059] dark:text-[#A4AA8E]">
                    Casual messages skipped by AI
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {summaries.slice(0, 2).map((sum) => (
                  <div
                    key={sum.id}
                    className="p-3 rounded-2xl bg-[#EEF1DC]/60 dark:bg-[#283017]/60 border border-[#DDE3BE] dark:border-[#384221] text-xs"
                  >
                    <div className="flex items-center justify-between mb-1 text-[11px]">
                      <span className="font-bold text-[#3F4A16] dark:text-[#EEF1DC]">
                        {getChatName(sum.chatId)}
                      </span>
                      <span className="text-[#6B7059] dark:text-[#A4AA8E]">
                        {sum.casualCount} casual chats skipped
                      </span>
                    </div>

                    {sum.casualHighlights.length > 0 && (
                      <p className="text-[11px] text-[#6B7059] dark:text-[#A4AA8E] italic">
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
