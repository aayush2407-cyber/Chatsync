import React, { useState, useMemo } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  Calendar,
  Clock,
  Video,
  CheckSquare,
  Bell,
  MessageSquare,
  Filter,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useSyncPulse } from '../context/SyncPulseContext';
import { ExtractedItem, MessageReminder } from '../types';
import { CalendarButton } from '../components/CalendarButton';
import { EmptyState } from '../components/EmptyState';

export type AgendaDayGroup = 'Overdue' | 'Today' | 'Tomorrow' | 'This week' | 'Later';

export interface AgendaRowItem {
  id: string;
  sourceType: 'item' | 'reminder';
  itemType: 'assignment' | 'meeting' | 'date' | 'reminder' | 'notice';
  title: string;
  details: string;
  chatId: string;
  chatName: string;
  sender: string;
  time: Date;
  timeFormatted: string;
  group: AgendaDayGroup;
  timeLeft: string;
  done: boolean;
  rawItem?: ExtractedItem;
  rawReminder?: MessageReminder;
  messageId?: string;
}

export const AgendaPage: React.FC = () => {
  const {
    items,
    messageReminders,
    chats,
    messages,
    toggleDone,
    toggleMessageReminderDone,
    openChatForMessage,
    openReminderModalForMessage,
    setActiveTab,
    setSelectedChatId,
  } = useSyncPulse();

  const [typeFilter, setTypeFilter] = useState<'all' | 'assignment' | 'meeting' | 'date' | 'reminder'>('all');
  const [showCompleted, setShowCompleted] = useState(false);

  // Build unified chronological timeline
  const timelineItems = useMemo<AgendaRowItem[]>(() => {
    const now = new Date();
    const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nowEnd = new Date(nowStart.getTime() + 86400000 - 1);
    const tomorrowStart = new Date(nowStart.getTime() + 86400000);
    const tomorrowEnd = new Date(tomorrowStart.getTime() + 86400000 - 1);
    const weekEnd = new Date(nowStart.getTime() + 7 * 86400000);

    const rows: AgendaRowItem[] = [];

    // Helper to calculate relative group and timeLeft string
    const getGroupAndLeft = (targetDate: Date, isDone: boolean): { group: AgendaDayGroup; timeLeft: string } => {
      const diffMs = targetDate.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (!isDone && targetDate.getTime() < nowStart.getTime()) {
        const daysAgo = Math.max(1, Math.floor(Math.abs(diffHours) / 24));
        return {
          group: 'Overdue',
          timeLeft: `Overdue by ${daysAgo} ${daysAgo === 1 ? 'day' : 'days'}`,
        };
      }

      if (targetDate >= nowStart && targetDate <= nowEnd) {
        if (diffMs > 0) {
          const hours = Math.floor(diffHours);
          if (hours < 1) {
            const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
            return { group: 'Today', timeLeft: `in ${mins} mins` };
          }
          return { group: 'Today', timeLeft: `in ${hours} ${hours === 1 ? 'hour' : 'hours'}` };
        }
        return { group: 'Today', timeLeft: 'Today' };
      }

      if (targetDate >= tomorrowStart && targetDate <= tomorrowEnd) {
        return {
          group: 'Tomorrow',
          timeLeft: `Tomorrow at ${targetDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`,
        };
      }

      if (targetDate > tomorrowEnd && targetDate <= weekEnd) {
        const days = Math.round(diffHours / 24);
        return {
          group: 'This week',
          timeLeft: `in ${days} days (${targetDate.toLocaleDateString([], { weekday: 'short' })})`,
        };
      }

      return {
        group: 'Later',
        timeLeft: targetDate.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      };
    };

    // 1. Process Extracted Items (assignments, meetings, dates, notices)
    items.forEach((item) => {
      const dateStr = item.startTime || item.deadline;
      if (!dateStr) return; // Skip undated notices from chronological agenda
      const itemDate = new Date(dateStr);
      if (isNaN(itemDate.getTime())) return;

      const chat = chats.find((c) => c.id === item.chatId);
      const chatName = chat?.name || 'Class Chat';

      // Match with chat message ID if available
      const matchedMsg = messages.find(
        (m) => m.chatId === item.chatId && (m.text === item.sourceMessage || m.text.includes(item.title))
      );

      const { group, timeLeft } = getGroupAndLeft(itemDate, item.done);

      rows.push({
        id: `agenda-item-${item.id}`,
        sourceType: 'item',
        itemType: item.type,
        title: item.title,
        details: item.details,
        chatId: item.chatId,
        chatName,
        sender: item.sender,
        time: itemDate,
        timeFormatted: item.isAllDay
          ? 'All Day'
          : itemDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        group,
        timeLeft,
        done: item.done,
        rawItem: item,
        messageId: matchedMsg?.id,
      });
    });

    // 2. Process in-chat Message Reminders
    messageReminders.forEach((r) => {
      const remindDate = new Date(r.remindAt);
      if (isNaN(remindDate.getTime())) return;

      const chat = chats.find((c) => c.id === r.chatId);
      const chatName = chat?.name || 'Class Chat';
      const isDone = r.status === 'done';

      const { group, timeLeft } = getGroupAndLeft(remindDate, isDone);

      rows.push({
        id: `agenda-rem-${r.id}`,
        sourceType: 'reminder',
        itemType: 'reminder',
        title: r.title || r.note || r.sourceText?.slice(0, 50) || 'Message Reminder',
        details: r.note || r.sourceText || '',
        chatId: r.chatId,
        chatName,
        sender: r.sender || 'Reminder',
        time: remindDate,
        timeFormatted: remindDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        group,
        timeLeft,
        done: isDone,
        rawReminder: r,
        messageId: r.messageId,
      });
    });

    // Sort chronologically ascending by scheduled time
    return rows.sort((a, b) => a.time.getTime() - b.time.getTime());
  }, [items, messageReminders, chats, messages]);

  // Filter items
  const filteredTimeline = useMemo(() => {
    return timelineItems.filter((row) => {
      if (!showCompleted && row.done) return false;
      if (typeFilter !== 'all' && row.itemType !== typeFilter) return false;
      return true;
    });
  }, [timelineItems, typeFilter, showCompleted]);

  // Group by day order
  const dayGroups: { group: AgendaDayGroup; items: AgendaRowItem[] }[] = useMemo(() => {
    const order: AgendaDayGroup[] = ['Overdue', 'Today', 'Tomorrow', 'This week', 'Later'];
    return order
      .map((g) => ({
        group: g,
        items: filteredTimeline.filter((item) => item.group === g),
      }))
      .filter((g) => g.items.length > 0);
  }, [filteredTimeline]);

  // Stats counters
  const overdueCount = timelineItems.filter((i) => i.group === 'Overdue' && !i.done).length;
  const todayCount = timelineItems.filter((i) => i.group === 'Today' && !i.done).length;
  const tomorrowCount = timelineItems.filter((i) => i.group === 'Tomorrow' && !i.done).length;
  const weekCount = timelineItems.filter((i) => (i.group === 'Today' || i.group === 'Tomorrow' || i.group === 'This week') && !i.done).length;
  const doneTotal = timelineItems.filter((i) => i.done).length;

  const handleToggle = (row: AgendaRowItem) => {
    if (row.sourceType === 'item' && row.rawItem) {
      toggleDone(row.rawItem.id);
    } else if (row.sourceType === 'reminder' && row.rawReminder) {
      toggleMessageReminderDone(row.rawReminder.id);
    }
  };

  const handleOpenOriginalMessage = (row: AgendaRowItem) => {
    openChatForMessage(row.chatId, row.messageId);
  };

  const handleOpenRemindMe = (row: AgendaRowItem) => {
    if (row.rawItem) {
      // Find matching message or mock
      const msg = messages.find((m) => m.chatId === row.chatId && m.text.includes(row.rawItem!.title)) || {
        id: `mock-msg-${Date.now()}`,
        chatId: row.chatId,
        sender: row.sender,
        text: row.rawItem.details || row.rawItem.title,
        timestamp: row.time.toISOString(),
        hash: 'h-agenda',
      };
      openReminderModalForMessage(msg, row.rawItem);
    } else if (row.rawReminder) {
      const msg = messages.find((m) => m.id === row.rawReminder!.messageId) || {
        id: row.rawReminder.messageId,
        chatId: row.rawReminder.chatId,
        sender: row.rawReminder.sender || 'Sender',
        text: row.rawReminder.sourceText || row.rawReminder.title || '',
        timestamp: row.time.toISOString(),
        hash: 'h-agenda-rem',
      };
      openReminderModalForMessage(msg, null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto pb-16 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E6D3] dark:border-[#2B321A]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B7A2A] dark:text-[#9AAE3C] bg-[#EEF1DC] dark:bg-[#283017] px-2 py-0.5 rounded-lg flex items-center gap-1">
              <CalendarClock className="w-3.5 h-3.5" /> Chronological Timeline
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#3F4A16] dark:text-[#EEF1DC] mt-1">
            Agenda
          </h1>
          <p className="text-sm text-[#6B7059] dark:text-[#A4AA8E] mt-0.5">
            Everything upcoming across all your class chats in one unified timeline — nothing gets missed.
          </p>
        </div>

        {/* Quick actions & Toggle Completed */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-2 text-xs font-semibold text-[#2B2F1E] dark:text-[#EEF1DC] bg-white dark:bg-[#1D2112] border border-[#E3E6D3] dark:border-[#2B321A] px-3 py-2 rounded-xl cursor-pointer shadow-xs min-h-[40px]">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="w-4 h-4 rounded text-[#6B7A2A] focus:ring-[#6B7A2A] cursor-pointer"
            />
            <span>Show Completed ({doneTotal})</span>
          </label>
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`p-4 rounded-2xl border transition-all ${
          overdueCount > 0
            ? 'bg-[#FEF2F2] dark:bg-[#2A1215] border-[#FCA5A5] dark:border-[#7F1D1D] text-[#C0392B] dark:text-[#FCA5A5]'
            : 'bg-white dark:bg-[#1D2112] border-[#E3E6D3] dark:border-[#2B321A] text-[#2B2F1E] dark:text-[#EEF1DC]'
        }`}>
          <div className="text-xs font-bold uppercase tracking-wider text-[#C0392B] flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Overdue
          </div>
          <div className="text-2xl font-bold mt-1 tabular-nums">{overdueCount}</div>
          <div className="text-[11px] text-[#6B7059] dark:text-[#A4AA8E]">Needs attention</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1D2112] border border-[#E3E6D3] dark:border-[#2B321A] shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-[#D98324] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Due Today
          </div>
          <div className="text-2xl font-bold mt-1 tabular-nums text-[#2B2F1E] dark:text-[#EEF1DC]">
            {todayCount}
          </div>
          <div className="text-[11px] text-[#6B7059] dark:text-[#A4AA8E]">Scheduled today</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1D2112] border border-[#E3E6D3] dark:border-[#2B321A] shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-[#6B7A2A] dark:text-[#9AAE3C] flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Tomorrow
          </div>
          <div className="text-2xl font-bold mt-1 tabular-nums text-[#2B2F1E] dark:text-[#EEF1DC]">
            {tomorrowCount}
          </div>
          <div className="text-[11px] text-[#6B7059] dark:text-[#A4AA8E]">Next 24-48 hours</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1D2112] border border-[#E3E6D3] dark:border-[#2B321A] shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-[#6B7A2A] dark:text-[#9AAE3C] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </div>
          <div className="text-2xl font-bold mt-1 tabular-nums text-[#2B2F1E] dark:text-[#EEF1DC]">
            {doneTotal}
          </div>
          <div className="text-[11px] text-[#6B7059] dark:text-[#A4AA8E]">Tasks finished</div>
        </div>
      </div>

      {/* Filter Tabs by Type */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => setTypeFilter('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer min-h-[38px] ${
            typeFilter === 'all'
              ? 'bg-[#6B7A2A] text-white shadow-xs'
              : 'bg-white dark:bg-[#1D2112] border border-[#E3E6D3] dark:border-[#2B321A] text-[#6B7059] dark:text-[#A4AA8E] hover:bg-[#EEF1DC] dark:hover:bg-[#283017]'
          }`}
        >
          All Items ({timelineItems.length})
        </button>

        <button
          onClick={() => setTypeFilter('assignment')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer min-h-[38px] flex items-center gap-1.5 ${
            typeFilter === 'assignment'
              ? 'bg-[#6B7A2A] text-white shadow-xs'
              : 'bg-white dark:bg-[#1D2112] border border-[#E3E6D3] dark:border-[#2B321A] text-[#6B7059] dark:text-[#A4AA8E] hover:bg-[#EEF1DC] dark:hover:bg-[#283017]'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Assignments ({timelineItems.filter((i) => i.itemType === 'assignment').length})</span>
        </button>

        <button
          onClick={() => setTypeFilter('meeting')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer min-h-[38px] flex items-center gap-1.5 ${
            typeFilter === 'meeting'
              ? 'bg-[#6B7A2A] text-white shadow-xs'
              : 'bg-white dark:bg-[#1D2112] border border-[#E3E6D3] dark:border-[#2B321A] text-[#6B7059] dark:text-[#A4AA8E] hover:bg-[#EEF1DC] dark:hover:bg-[#283017]'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Meetings ({timelineItems.filter((i) => i.itemType === 'meeting').length})</span>
        </button>

        <button
          onClick={() => setTypeFilter('date')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer min-h-[38px] flex items-center gap-1.5 ${
            typeFilter === 'date'
              ? 'bg-[#6B7A2A] text-white shadow-xs'
              : 'bg-white dark:bg-[#1D2112] border border-[#E3E6D3] dark:border-[#2B321A] text-[#6B7059] dark:text-[#A4AA8E] hover:bg-[#EEF1DC] dark:hover:bg-[#283017]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Important Dates ({timelineItems.filter((i) => i.itemType === 'date').length})</span>
        </button>

        <button
          onClick={() => setTypeFilter('reminder')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer min-h-[38px] flex items-center gap-1.5 ${
            typeFilter === 'reminder'
              ? 'bg-[#6B7A2A] text-white shadow-xs'
              : 'bg-white dark:bg-[#1D2112] border border-[#E3E6D3] dark:border-[#2B321A] text-[#6B7059] dark:text-[#A4AA8E] hover:bg-[#EEF1DC] dark:hover:bg-[#283017]'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Reminders ({timelineItems.filter((i) => i.itemType === 'reminder').length})</span>
        </button>
      </div>

      {/* Main Chronological Timeline grouped by Day */}
      {dayGroups.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          text={
            typeFilter === 'all'
              ? 'No upcoming items in your agenda right now!'
              : `No upcoming ${typeFilter}s found.`
          }
          actionText="Connect a Chat or Scan"
          onAction={() => setActiveTab('chats')}
        />
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {dayGroups.map(({ group, items: groupItems }) => {
            const isOverdueGroup = group === 'Overdue';
            const isTodayGroup = group === 'Today';

            return (
              <section key={group} className="space-y-3">
                {/* Day Header Badge */}
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 ${
                      isOverdueGroup
                        ? 'bg-[#FEF2F2] dark:bg-[#2A1215] text-[#C0392B] border border-[#FCA5A5] dark:border-[#7F1D1D]'
                        : isTodayGroup
                        ? 'bg-[#FEFCE8] dark:bg-[#28220A] text-[#78350F] dark:text-[#FEF08A] border border-[#FEF08A] dark:border-[#854D0E] ring-2 ring-[#D98324]/20'
                        : group === 'Tomorrow'
                        ? 'bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] border border-[#DDE3BE] dark:border-[#384221]'
                        : 'bg-white dark:bg-[#1D2112] text-[#3F4A16] dark:text-[#EEF1DC] border border-[#E3E6D3] dark:border-[#2B321A]'
                    }`}
                  >
                    {isOverdueGroup && <AlertTriangle className="w-3.5 h-3.5 text-[#C0392B]" />}
                    {isTodayGroup && <Sparkles className="w-3.5 h-3.5 text-[#D98324]" />}
                    <span>{group}</span>
                    <span className="text-[10px] font-normal opacity-75">
                      ({groupItems.length} {groupItems.length === 1 ? 'item' : 'items'})
                    </span>
                  </span>
                  <div className="flex-1 h-px bg-[#E3E6D3] dark:bg-[#2B321A]" />
                </div>

                {/* Items in Day Group */}
                <div className="space-y-2.5">
                  {groupItems.map((row) => {
                    const isAssignment = row.itemType === 'assignment';
                    const isMeeting = row.itemType === 'meeting';
                    const isDate = row.itemType === 'date';
                    const isReminder = row.itemType === 'reminder';

                    return (
                      <div
                        key={row.id}
                        className={`p-4 sm:p-4.5 rounded-2xl border transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-3.5 shadow-xs ${
                          row.done
                            ? 'bg-[#F7F8F2] dark:bg-[#14170D] border-[#E3E6D3] dark:border-[#2B321A] opacity-60'
                            : isOverdueGroup
                            ? 'bg-[#FEF2F2]/60 dark:bg-[#2A1215]/40 border-[#FCA5A5] dark:border-[#7F1D1D] hover:border-[#C0392B]'
                            : isTodayGroup
                            ? 'bg-white dark:bg-[#1D2112] border-[#E3E6D3] dark:border-[#2B321A] hover:border-[#6B7A2A]'
                            : 'bg-white dark:bg-[#1D2112] border-[#E3E6D3] dark:border-[#2B321A] hover:border-[#6B7A2A] dark:hover:border-[#9AAE3C]'
                        }`}
                      >
                        {/* Left Side: Checkbox + Time + Coloured Type Icon + Title/Details */}
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          {/* Checkbox (done) */}
                          <button
                            type="button"
                            onClick={() => handleToggle(row)}
                            className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                              row.done
                                ? 'bg-[#6B7A2A] border-[#6B7A2A] text-white'
                                : 'border-[#E3E6D3] dark:border-[#384221] hover:border-[#6B7A2A] bg-white dark:bg-[#1D2112]'
                            }`}
                            aria-label={row.done ? 'Mark incomplete' : 'Mark done'}
                            title={row.done ? 'Mark incomplete' : 'Mark done'}
                          >
                            {row.done && <Check className="w-4 h-4 stroke-[3]" />}
                          </button>

                          {/* Time on the left */}
                          <div className="w-16 sm:w-20 shrink-0 text-left">
                            <span className="text-xs font-bold text-[#2B2F1E] dark:text-[#EEF1DC] tabular-nums block leading-tight">
                              {row.timeFormatted}
                            </span>
                            <span className="text-[10px] text-[#6B7059] dark:text-[#A4AA8E] block truncate">
                              {row.time.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>

                          {/* Coloured icon per type */}
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isAssignment
                                ? 'bg-[#EEF1DC] dark:bg-[#283017] text-[#6B7A2A] dark:text-[#9AAE3C]'
                                : isMeeting
                                ? 'bg-[#DDE3BE] dark:bg-[#343C1F] text-[#3F4A16] dark:text-[#EEF1DC]'
                                : isDate
                                ? 'bg-[#EEF1DC] dark:bg-[#283017] text-[#6B7A2A] dark:text-[#9AAE3C]'
                                : 'bg-[#FEF08A] dark:bg-[#382F10] text-[#78350F] dark:text-[#FEF08A]'
                            }`}
                            title={`Type: ${row.itemType}`}
                          >
                            {isAssignment && <CheckSquare className="w-4 h-4" />}
                            {isMeeting && <Video className="w-4 h-4" />}
                            {isDate && <Calendar className="w-4 h-4" />}
                            {isReminder && <Bell className="w-4 h-4" />}
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3
                                className={`text-sm font-bold text-[#2B2F1E] dark:text-[#EEF1DC] leading-snug ${
                                  row.done ? 'line-through text-[#6B7059] dark:text-[#A4AA8E]' : ''
                                }`}
                              >
                                {row.title}
                              </h3>

                              <span className="text-[11px] font-semibold text-[#6B7A2A] dark:text-[#9AAE3C] bg-[#EEF1DC] dark:bg-[#283017] px-2 py-0.5 rounded-md truncate max-w-[140px]">
                                {row.chatName}
                              </span>

                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isOverdueGroup
                                    ? 'bg-[#FEF2F2] dark:bg-[#2A1215] text-[#C0392B]'
                                    : 'bg-[#F7F8F2] dark:bg-[#14170D] text-[#6B7059] dark:text-[#A4AA8E]'
                                }`}
                              >
                                {row.timeLeft}
                              </span>
                            </div>

                            {row.details && row.details !== row.title && (
                              <p className="text-xs text-[#6B7059] dark:text-[#A4AA8E] mt-0.5 line-clamp-1">
                                {row.details}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right Side: Quick Action Buttons */}
                        <div className="flex items-center gap-1.5 self-end md:self-center shrink-0 pl-10 md:pl-0">
                          {/* 1. Add to calendar */}
                          {row.rawItem ? (
                            <CalendarButton item={row.rawItem} size="sm" />
                          ) : null}

                          {/* 2. Remind me */}
                          <button
                            type="button"
                            onClick={() => handleOpenRemindMe(row)}
                            className="px-2.5 py-1.5 rounded-xl border border-[#E3E6D3] dark:border-[#2B321A] hover:bg-[#EEF1DC] dark:hover:bg-[#283017] text-[#2B2F1E] dark:text-[#EEF1DC] text-xs font-semibold flex items-center gap-1 cursor-pointer min-h-[36px] transition-colors"
                            title="Set or edit reminder"
                          >
                            <Bell className="w-3.5 h-3.5 text-[#D98324]" />
                            <span className="hidden sm:inline">Remind me</span>
                          </button>

                          {/* 3. Open original message */}
                          <button
                            type="button"
                            onClick={() => handleOpenOriginalMessage(row)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] hover:bg-[#DDE3BE] dark:hover:bg-[#343C1F] text-xs font-semibold flex items-center gap-1 cursor-pointer min-h-[36px] transition-colors"
                            title="Jump to original message in chat"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Open message</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
