import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  CheckSquare,
  Bell,
  MessageCircle,
  X,
  Clock,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Circle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Video,
  MapPin,
  RotateCw,
} from 'lucide-react';
import { ExtractedItem, Summary } from '../types';
import { useSyncPulse } from '../context/SyncPulseContext';
import { DeadlineBadge } from './DeadlineBadge';
import { CalendarButton } from './CalendarButton';

interface SummaryViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: Summary | null;
  items: ExtractedItem[];
  chatName: string;
}

export const SummaryViewModal: React.FC<SummaryViewModalProps> = ({
  isOpen,
  onClose,
  summary,
  items,
  chatName,
}) => {
  const { toggleDone, setActiveTab } = useSyncPulse();

  // Collapsible section open states (all open by default)
  const [casualOpen, setCasualOpen] = useState(true);
  const [meetingsOpen, setMeetingsOpen] = useState(true);
  const [datesOpen, setDatesOpen] = useState(true);
  const [assignmentsOpen, setAssignmentsOpen] = useState(true);
  const [noticesOpen, setNoticesOpen] = useState(true);

  // Original message preview modal state
  const [previewItem, setPreviewItem] = useState<ExtractedItem | null>(null);

  if (!isOpen || !summary) return null;

  const meetingItems = items.filter((i) => i.type === 'meeting');
  const dateItems = items.filter((i) => i.type === 'date');
  const assignmentItems = items.filter((i) => i.type === 'assignment');
  const noticeItems = items.filter((i) => i.type === 'notice');

  const formatDeadline = (iso: string | null) => {
    if (!iso) return null;
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-white dark:bg-[#1D2112] rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl border border-[#E3E6D3] dark:border-[#2B321A] my-auto">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[#E3E6D3] dark:border-[#2B321A] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#6B7A2A] text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7A2A] dark:text-[#9AAE3C]">
                    AI Chat Summary
                  </span>
                  <span className="text-[#6B7059]">·</span>
                  <span className="text-xs text-[#6B7059] dark:text-[#A4AA8E]">
                    {new Date(summary.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#2B2F1E] dark:text-[#EEF1DC]">
                  {chatName}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-[#6B7059] hover:text-[#2B2F1E] dark:hover:text-[#EEF1DC] hover:bg-[#EEF1DC] dark:hover:bg-[#283017] rounded-xl transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close Summary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="bg-[#F7F8F2] dark:bg-[#14170D] px-5 sm:px-6 py-3 border-b border-[#E3E6D3] dark:border-[#2B321A] grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs shrink-0">
            <div className="text-[#6B7059] dark:text-[#A4AA8E]">
              <strong className="text-[#2B2F1E] dark:text-[#EEF1DC] text-sm block">
                {summary.casualCount}
              </strong>
              <span>Casual filtered</span>
            </div>
            <div className="text-[#6B7059] dark:text-[#A4AA8E]">
              <strong className="text-[#6B7A2A] dark:text-[#9AAE3C] text-sm block">
                {meetingItems.length}
              </strong>
              <span>Meetings</span>
            </div>
            <div className="text-[#6B7059] dark:text-[#A4AA8E]">
              <strong className="text-[#6B7A2A] dark:text-[#9AAE3C] text-sm block">
                {dateItems.length}
              </strong>
              <span>Important Dates</span>
            </div>
            <div className="text-[#6B7059] dark:text-[#A4AA8E]">
              <strong className="text-[#6B7A2A] dark:text-[#9AAE3C] text-sm block">
                {assignmentItems.length}
              </strong>
              <span>Assignments</span>
            </div>
            <div className="text-[#6B7059] dark:text-[#A4AA8E]">
              <strong className="text-[#D98324] text-sm block">
                {noticeItems.length}
              </strong>
              <span>Notices</span>
            </div>
          </div>

          {/* Scrollable Content Body with 4 Collapsible Groups */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
            {/* GROUP 1: Casual Talk */}
            <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setCasualOpen(!casualOpen)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer min-h-[50px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                    <MessageCircle className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        Casual Talk
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {summary.casualCount} messages filtered
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Jokes, memes, greetings, and short replies filtered out to save you time
                    </p>
                  </div>
                </div>

                <div className="text-slate-400 p-1">
                  {casualOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {casualOpen && (
                <div className="p-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20 space-y-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sample highlights skipped:
                  </p>
                  {summary.casualHighlights && summary.casualHighlights.length > 0 ? (
                    <div className="space-y-2">
                      {summary.casualHighlights.map((hl, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 italic flex items-center gap-2"
                        >
                          <span className="text-slate-400 select-none">“</span>
                          <span className="flex-1">{hl}</span>
                          <span className="text-slate-400 select-none">”</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No significant casual highlights.</p>
                  )}
                </div>
              )}
            </div>

            {/* GROUP 2: Important Dates */}
            <div className="border border-[#E3E6D3] dark:border-[#2B321A] rounded-2xl bg-white dark:bg-[#1D2112] overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setDatesOpen(!datesOpen)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#F7F8F2] dark:hover:bg-[#14170D] transition-colors cursor-pointer min-h-[50px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#EEF1DC] dark:bg-[#283017] text-[#6B7A2A] dark:text-[#9AAE3C] flex items-center justify-center font-bold text-xs">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#2B2F1E] dark:text-[#EEF1DC]">
                        Important Dates
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC]">
                        {dateItems.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B7059] dark:text-[#A4AA8E]">
                      Exams, scheduled meetings, review sessions, and academic calendar dates
                    </p>
                  </div>
                </div>

                <div className="text-[#6B7059] p-1">
                  {datesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {datesOpen && (
                <div className="p-4 pt-2 border-t border-[#E3E6D3] dark:border-[#2B321A] space-y-3">
                  {dateItems.length === 0 ? (
                    <p className="text-xs text-[#6B7059] italic text-center py-2">
                      No important dates found in this chat.
                    </p>
                  ) : (
                    dateItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-[#F7F8F2] dark:bg-[#14170D] border border-[#E3E6D3] dark:border-[#2B321A] space-y-2 hover:border-[#6B7A2A] dark:hover:border-[#9AAE3C] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-bold text-sm text-[#2B2F1E] dark:text-[#EEF1DC] leading-snug">
                            {item.title}
                          </h4>
                          {item.priority === 'high' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#FEF2F2] dark:bg-[#2A1215] text-[#C0392B] shrink-0">
                              High Priority
                            </span>
                          )}
                        </div>

                        {item.details && (
                          <p className="text-xs text-[#6B7059] dark:text-[#A4AA8E] leading-relaxed">
                            {item.details}
                          </p>
                        )}

                        <div className="pt-2 border-t border-[#E3E6D3] dark:border-[#2B321A] flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B7059] dark:text-[#A4AA8E]">
                          <div className="flex items-center gap-2 flex-wrap">
                            {item.deadline && (
                              <DeadlineBadge deadline={item.deadline} done={item.done} size="sm" />
                            )}
                            <span>From: <strong>{item.sender}</strong></span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            className="text-xs font-semibold text-[#6B7A2A] dark:text-[#9AAE3C] hover:underline flex items-center gap-1 cursor-pointer min-h-[32px]"
                          >
                            <span>View original message</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* GROUP: Scheduled Meetings & Viva Calls */}
            <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setMeetingsOpen(!meetingsOpen)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer min-h-[50px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        Meetings & Class Calls
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        {meetingItems.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Lectures, viva oral sessions, Zoom/Meet video calls, and group study syncs
                    </p>
                  </div>
                </div>

                <div className="text-slate-400 p-1">
                  {meetingsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {meetingsOpen && (
                <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                  {meetingItems.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-2">
                      No meetings or calls found in this chat.
                    </p>
                  ) : (
                    meetingItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60 space-y-2 hover:border-emerald-400 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                Meeting
                              </span>
                              {item.isRescheduled && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                                  <RotateCw className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                  <span>Rescheduled</span>
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                              {item.title}
                            </h4>
                          </div>

                          {item.meetingLink && (
                            <a
                              href={item.meetingLink.startsWith('http') ? item.meetingLink : `https://${item.meetingLink}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors shrink-0"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Join</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                            </a>
                          )}
                        </div>

                        {/* Location & Time */}
                        <div className="flex items-center gap-3 flex-wrap text-xs text-slate-600 dark:text-slate-300">
                          {item.startTime && (
                            <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-200">
                              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>
                                {new Date(item.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                {item.endTime ? ` – ${new Date(item.endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : ''}
                              </span>
                            </div>
                          )}
                          {item.location && (
                            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span>{item.location}</span>
                            </div>
                          )}
                        </div>

                        {item.details && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {item.details}
                          </p>
                        )}

                        <div className="pt-2 border-t border-slate-200/40 dark:border-slate-700/40 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span>From: <strong>{item.sender}</strong></span>
                          <div className="flex items-center gap-2">
                            <CalendarButton item={item} size="sm" />
                            <button
                              type="button"
                              onClick={() => setPreviewItem(item)}
                              className="text-xs font-semibold text-[#6B7A2A] dark:text-[#9AAE3C] hover:underline flex items-center gap-1 cursor-pointer min-h-[32px]"
                            >
                              <span>Original message</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setAssignmentsOpen(!assignmentsOpen)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer min-h-[50px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        Important Assignments
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        {assignmentItems.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Problem sets, homework, lab submissions, and tasks to complete
                    </p>
                  </div>
                </div>

                <div className="text-slate-400 p-1">
                  {assignmentsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {assignmentsOpen && (
                <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                  {assignmentItems.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-2">
                      No assignments found in this chat.
                    </p>
                  ) : (
                    assignmentItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border transition-all space-y-2 ${
                          item.done
                            ? 'bg-slate-50/40 dark:bg-slate-800/20 border-slate-200/40 dark:border-slate-800/40 opacity-70'
                            : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 hover:border-emerald-300 dark:hover:border-emerald-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={() => toggleDone(item.id)}
                              className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 cursor-pointer min-h-[30px] min-w-[30px] transition-colors ${
                                item.done
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                              }`}
                            >
                              {item.done ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <Circle className="w-3 h-3 text-transparent" />
                              )}
                            </button>
                            <h4
                              className={`font-bold text-sm leading-snug ${
                                item.done
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {item.title}
                            </h4>
                          </div>

                          {item.priority === 'high' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 shrink-0">
                              High Priority
                            </span>
                          )}
                        </div>

                        {item.details && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8">
                            {item.details}
                          </p>
                        )}

                        <div className="pt-2 border-t border-slate-200/40 dark:border-slate-700/40 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 pl-8">
                          <div className="flex items-center gap-2 flex-wrap">
                            {item.deadline && (
                              <DeadlineBadge deadline={item.deadline} done={item.done} size="sm" />
                            )}
                            <span>From: <strong>{item.sender}</strong></span>
                          </div>

                          <div className="flex items-center gap-2">
                            <CalendarButton item={item} size="sm" />
                            <button
                              type="button"
                              onClick={() => setPreviewItem(item)}
                              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer min-h-[32px]"
                            >
                              <span>Original message</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* GROUP 4: Important Notices */}
            <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setNoticesOpen(!noticesOpen)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer min-h-[50px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        Important Notices
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                        {noticeItems.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Campus holidays, room changes, fee payment dates, and department announcements
                    </p>
                  </div>
                </div>

                <div className="text-slate-400 p-1">
                  {noticesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {noticesOpen && (
                <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                  {noticeItems.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-2">
                      No notices found in this chat.
                    </p>
                  ) : (
                    noticeItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                            {item.title}
                          </h4>
                          {item.priority === 'high' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 shrink-0">
                              High Priority
                            </span>
                          )}
                        </div>

                        {item.details && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {item.details}
                          </p>
                        )}

                        <div className="pt-2 border-t border-slate-200/40 dark:border-slate-700/40 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-3 flex-wrap">
                            {item.deadline && (
                              <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                                <Clock className="w-3.5 h-3.5" />
                                {formatDeadline(item.deadline)}
                              </span>
                            )}
                            <span>From: <strong>{item.sender}</strong></span>
                          </div>

                          <div className="flex items-center gap-2">
                            <CalendarButton item={item} size="sm" />
                            <button
                              type="button"
                              onClick={() => setPreviewItem(item)}
                              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer min-h-[32px]"
                            >
                              <span>Original message</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Navigation CTA */}
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              All items are saved to your Dashboard and To-Do list.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActiveTab('assignments');
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer min-h-[40px]"
              >
                View Assignments
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActiveTab('dashboard');
                }}
                className="px-4 py-2 rounded-xl bg-[#6B7A2A] hover:bg-[#5A6823] text-white text-xs font-semibold transition-colors cursor-pointer min-h-[40px] flex items-center gap-1.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Original Message Preview Popup */}
      {previewItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#1D2112] rounded-3xl p-6 max-w-lg w-full border border-[#E3E6D3] dark:border-[#2B321A] shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7A2A] dark:text-[#9AAE3C]">
                  Original Chat Message
                </span>
                <h3 className="text-base font-bold text-[#2B2F1E] dark:text-[#EEF1DC] mt-0.5">
                  Sent by {previewItem.sender}
                </h3>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1.5 text-[#6B7059] hover:text-[#2B2F1E] dark:hover:text-[#EEF1DC] rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F8F2] dark:bg-[#14170D] border border-[#E3E6D3] dark:border-[#2B321A] text-[#2B2F1E] dark:text-[#EEF1DC] text-sm leading-relaxed whitespace-pre-wrap font-mono">
              {previewItem.sourceMessage || previewItem.details || previewItem.title}
            </div>

            <div className="text-xs text-[#6B7059] dark:text-[#A4AA8E] space-y-1">
              <p>
                <strong>Extracted Category:</strong>{' '}
                <span className="capitalize">{previewItem.type}</span>
              </p>
              {previewItem.deadline && (
                <p>
                  <strong>Resolved Deadline:</strong> {formatDeadline(previewItem.deadline)}
                </p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 bg-[#6B7A2A] hover:bg-[#5A6823] text-white rounded-xl text-xs font-semibold cursor-pointer min-h-[40px]"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
