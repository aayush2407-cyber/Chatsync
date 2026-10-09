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
  Video,
  MapPin,
  Users,
  ExternalLink,
  RotateCw,
  CalendarCheck,
} from 'lucide-react';
import { useSyncPulse } from '../context/SyncPulseContext';
import { ExtractedItem, ItemPriority, ExtractedItemType } from '../types';
import { EmptyState } from '../components/EmptyState';
import { DeadlineBadge } from '../components/DeadlineBadge';
import { ReminderSelector } from '../components/ReminderSelector';
import { CalendarButton } from '../components/CalendarButton';
import { ItemRowSkeleton } from '../components/SkeletonLoader';

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
    exportAllUpcomingCalendar,
    isScanning,
  } = useSyncPulse();

  // Tab: 'all' | 'dates' | 'meetings'
  const [activeCategory, setActiveCategory] = useState<'all' | 'dates' | 'meetings'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [chatFilter, setChatFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Date / Meeting form state
  const [itemType, setItemType] = useState<ExtractedItemType>('meeting');
  const [title, setTitle] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [attendeesStr, setAttendeesStr] = useState('');
  const [chatId, setChatId] = useState(chats[0]?.id || '');
  const [priority, setPriority] = useState<ItemPriority>('high');
  const [details, setDetails] = useState('');

  const allScheduleItems = items.filter((i) => i.type === 'date' || i.type === 'meeting');
  const dateOnlyCount = items.filter((i) => i.type === 'date').length;
  const meetingOnlyCount = items.filter((i) => i.type === 'meeting').length;

  const displayedItems = items
    .filter((i) => {
      if (activeCategory === 'dates') return i.type === 'date';
      if (activeCategory === 'meetings') return i.type === 'meeting';
      return i.type === 'date' || i.type === 'meeting';
    })
    .filter((i) => (priorityFilter === 'all' ? true : i.priority === priorityFilter))
    .filter((i) => (chatFilter === 'all' ? true : i.chatId === chatFilter))
    .sort((a, b) => {
      const timeA = a.startTime || a.deadline;
      const timeB = b.startTime || b.deadline;
      if (!timeA) return 1;
      if (!timeB) return -1;
      return new Date(timeA).getTime() - new Date(timeB).getTime();
    });

  const getChatName = (cId: string) => chats.find((c) => c.id === cId)?.name || 'Class Chat';

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const chosenChatId = chatId || chats[0]?.id || 'chat-demo';
    const computedDeadline =
      itemType === 'meeting'
        ? startTime
          ? new Date(startTime).toISOString()
          : deadlineDate
          ? new Date(deadlineDate).toISOString()
          : new Date().toISOString()
        : deadlineDate
        ? new Date(deadlineDate).toISOString()
        : new Date().toISOString();

    const candidateItem: ExtractedItem = {
      id: `item-${itemType}-${Date.now()}`,
      chatId: chosenChatId,
      type: itemType,
      title: title.trim(),
      details: details.trim(),
      sender: 'Self Added',
      sourceMessage: `${itemType === 'meeting' ? 'Meeting' : 'Date'} added: ${title.trim()}`,
      deadline: computedDeadline,
      startTime: itemType === 'meeting' && startTime ? new Date(startTime).toISOString() : null,
      endTime: itemType === 'meeting' && endTime ? new Date(endTime).toISOString() : null,
      location: itemType === 'meeting' && location.trim() ? location.trim() : null,
      meetingLink: itemType === 'meeting' && meetingLink.trim() ? meetingLink.trim() : null,
      attendees:
        itemType === 'meeting' && attendeesStr.trim()
          ? attendeesStr.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      isAllDay: itemType === 'meeting' && !startTime,
      isRescheduled: false,
      done: false,
      createdAt: new Date().toISOString(),
      priority,
    };

    addItems([candidateItem]);

    // Reset form
    setTitle('');
    setDeadlineDate('');
    setStartTime('');
    setEndTime('');
    setLocation('');
    setMeetingLink('');
    setAttendeesStr('');
    setDetails('');
    setIsModalOpen(false);
  };

  // Export to standard .ics iCalendar file for Google/Apple Calendar
  const handleExportICS = () => {
    if (allScheduleItems.length === 0) return;

    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//SyncPulse//AI Chat Hub//EN\nCALSCALE:GREGORIAN\n`;

    allScheduleItems.forEach((d) => {
      const dtValue = d.startTime || d.deadline;
      const cleanDate = (dtValue ? dtValue.slice(0, 10) : '20261016').replace(/-/g, '');
      icsContent += `BEGIN:VEVENT\nSUMMARY:[${getChatName(d.chatId)}] ${d.title}\nDTSTART;VALUE=DATE:${cleanDate}\n`;
      if (d.location) icsContent += `LOCATION:${d.location}\n`;
      if (d.meetingLink) icsContent += `URL:${d.meetingLink}\n`;
      icsContent += `DESCRIPTION:${d.details || 'SyncPulse Calendar Item'}\nSTATUS:CONFIRMED\nEND:VEVENT\n`;
    });

    icsContent += `END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'SyncPulse_Schedule_and_Meetings.ics');
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
            Schedule & Meetings
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Exams, deadlines, classes, viva sessions, group video calls, and meetups.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {allScheduleItems.length > 0 && (
            <button
              onClick={exportAllUpcomingCalendar}
              className="px-3.5 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
              aria-label="Add all upcoming dates and meetings to calendar (.ics)"
              title="Export all unfinished upcoming items to calendar with alarms"
            >
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Add all upcoming to calendar</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer min-h-[44px]"
            aria-label="Add a new important date or meeting"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event or Meeting</span>
          </button>
        </div>
      </div>

      {/* Primary Category Tabs: All, Meetings, Exams/Dates */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition-colors min-h-[40px] shrink-0 ${
            activeCategory === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>All Schedule</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums ${
              activeCategory === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {allScheduleItems.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('meetings')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition-colors min-h-[40px] shrink-0 ${
            activeCategory === 'meetings'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Meetings</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums ${
              activeCategory === 'meetings'
                ? 'bg-white/20 text-white'
                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            {meetingOnlyCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('dates')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition-colors min-h-[40px] shrink-0 ${
            activeCategory === 'dates'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Exams & Milestones</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums ${
              activeCategory === 'dates'
                ? 'bg-white/20 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {dateOnlyCount}
          </span>
        </button>
      </div>

      {/* Filter Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit">
          {(['all', 'high', 'medium', 'low'] as const).map((p) => (
            <button
              key={p}
              type="button"
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
            <label htmlFor="filter-chat" className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Filter by Chat:
            </label>
            <select
              id="filter-chat"
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

      {/* Timeline List or Empty State */}
      {isScanning ? (
        <div className="space-y-3.5">
          <ItemRowSkeleton />
          <ItemRowSkeleton />
          <ItemRowSkeleton />
        </div>
      ) : allScheduleItems.length === 0 ? (
        <EmptyState
          icon={Calendar}
          text="No exams, quizzes, or meetings on your calendar yet."
          actionText="Add a Meeting or Date"
          onAction={() => setIsModalOpen(true)}
        />
      ) : displayedItems.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 my-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            No {activeCategory === 'meetings' ? 'meetings' : 'events'} found matching your current filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setPriorityFilter('all');
              setChatFilter('all');
              setActiveCategory('all');
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium cursor-pointer min-h-[40px]"
          >
            Show All Events
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {displayedItems.map((d) => {
            const isMeeting = d.type === 'meeting';
            const timeSource = d.startTime || d.deadline;
            const dateObj = timeSource ? new Date(timeSource) : null;
            const monthStr = dateObj ? dateObj.toLocaleDateString('en-US', { month: 'short' }) : 'TBA';
            const dayStr = dateObj ? dateObj.toLocaleDateString('en-US', { day: '2-digit' }) : '—';
            const weekdayStr = dateObj ? dateObj.toLocaleDateString('en-US', { weekday: 'short' }) : '';

            const timeFormatted = d.isAllDay
              ? 'All-day'
              : dateObj
              ? dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
              : null;

            const endTimeFormatted = d.endTime
              ? new Date(d.endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
              : null;

            return (
              <div
                key={d.id}
                className={`p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
                  d.done
                    ? 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 opacity-70'
                    : isMeeting
                    ? 'border-indigo-200/90 dark:border-indigo-900/60 hover:border-indigo-400 dark:hover:border-indigo-700'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800'
                }`}
              >
                {/* Left Side: Date / Time Block & Details */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div
                    className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center shrink-0 ${
                      isMeeting
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-100 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {monthStr}
                    </span>
                    <span className="text-lg font-black leading-none">{dayStr}</span>
                    <span className="text-[9px] text-slate-400 leading-none mt-0.5">
                      {weekdayStr}
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {/* Type Badge: Meeting vs Date */}
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          isMeeting
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                        }`}
                      >
                        {isMeeting ? <Video className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                        <span>{isMeeting ? 'Meeting' : 'Date'}</span>
                      </span>

                      {/* Rescheduled Badge */}
                      {d.isRescheduled && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/90 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80 flex items-center gap-1">
                          <RotateCw className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>Rescheduled</span>
                        </span>
                      )}

                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[180px]">
                        {getChatName(d.chatId)}
                      </span>

                      {(d.chatId.startsWith('chat-demo') ||
                        chats.find((c) => c.id === d.chatId)?.source === 'demo') && (
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded-md flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Demo data
                        </span>
                      )}

                      {/* Deadline Countdown badge */}
                      {d.deadline && (
                        <DeadlineBadge deadline={d.deadline} done={d.done} size="sm" />
                      )}

                      {/* Priority */}
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize ${
                          d.priority === 'high'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : d.priority === 'medium'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {d.priority}
                      </span>

                      {/* Synced with Calendar Badge */}
                      {d.isCalendarSynced && (
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1"
                          title="Synced to calendar"
                        >
                          <Calendar className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Synced</span>
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

                    {/* Time & Location details */}
                    <div className="flex items-center gap-3 flex-wrap text-xs text-slate-600 dark:text-slate-300 pt-0.5">
                      {timeFormatted && (
                        <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-200">
                          <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>
                            {timeFormatted}
                            {endTimeFormatted ? ` – ${endTimeFormatted}` : ''}
                          </span>
                        </div>
                      )}

                      {d.location && (
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{d.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Attendees */}
                    {d.attendees && d.attendees.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          Attendees:
                        </span>
                        {d.attendees.map((att) => (
                          <span
                            key={att}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold"
                          >
                            {att}
                          </span>
                        ))}
                      </div>
                    )}

                    {d.details && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 leading-relaxed">
                        {d.details}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Side: Action Strip (Join Link + Reminders + Checkmark + Delete) */}
                <div className="flex items-center gap-2 flex-wrap shrink-0 self-start md:self-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800 w-full md:w-auto justify-end">
                  {/* Join Link Button when meetingLink exists */}
                  {d.meetingLink && (
                    <a
                      href={d.meetingLink.startsWith('http') ? d.meetingLink : `https://${d.meetingLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors min-h-[40px] cursor-pointer"
                      aria-label={`Join meeting for ${d.title}`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Meeting</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>
                  )}

                  <ReminderSelector
                    currentOffset={d.reminderOffset || 'none'}
                    onSelectOffset={(offset) => setItemReminder(d.id, offset)}
                    onRequestPermission={requestNotificationPermission}
                  />

                  <CalendarButton item={d} />

                  <button
                    type="button"
                    onClick={() => toggleDone(d.id)}
                    aria-label={`Mark ${d.title} as ${d.done ? 'incomplete' : 'completed'}`}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer min-h-[40px] ${
                      d.done
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{d.done ? 'Done' : 'Mark Done'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteItem(d.id)}
                    aria-label={`Delete ${d.title}`}
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

      {/* ADD IMPORTANT DATE / MEETING MODAL */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-modal-title"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <div>
                <h3 id="add-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                  Add Event or Meeting
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track lectures, viva evaluations, group syncs, and exam dates
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {/* Type Switcher: Meeting vs Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setItemType('meeting')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer min-h-[40px] ${
                      itemType === 'meeting'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Meeting / Call / Viva</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setItemType('date')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer min-h-[40px] ${
                      itemType === 'date'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Exam / Milestone Date</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  {itemType === 'meeting' ? 'Meeting Title' : 'Exam / Event Title'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    itemType === 'meeting'
                      ? 'e.g. Compiler Lab Viva Session'
                      : 'e.g. Midterm 1: Mechanics & Heat'
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                />
              </div>

              {itemType === 'meeting' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Start Time
                      </label>
                      <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        End Time (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Location / Room
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Library Room 302 or Online"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Meeting Link (Zoom / Meet)
                      </label>
                      <input
                        type="url"
                        placeholder="https://meet.google.com/..."
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Attendees (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TA David, Priya, Marcus"
                      value={attendeesStr}
                      onChange={(e) => setAttendeesStr(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
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
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Details / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Prepare questions for TA or review syllabus prerequisites"
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
                  Save {itemType === 'meeting' ? 'Meeting' : 'Date'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
