import React, { useState } from 'react';
import {
  Calendar,
  Download,
  ExternalLink,
  Bell,
  BellOff,
  Check,
  CheckCircle2,
  X,
  Smartphone,
  Info,
  Clock,
  MapPin,
  Video,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ExtractedItem, Chat } from '../types';
import { useSyncPulse } from '../context/SyncPulseContext';
import {
  generateSingleItemICS,
  downloadICS,
  getGoogleCalendarUrl,
  calculateItemCalendarTimes,
} from '../utils/calendarExport';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ExtractedItem | null;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const { chats, toggleItemAlarm, toggleItemCalendarSync, settings, showToast } =
    useSyncPulse();

  const [showPhoneHelp, setShowPhoneHelp] = useState(false);

  if (!isOpen || !item) return null;

  const chat = chats.find((c) => c.id === item.chatId);
  const chatName = chat?.name || 'Class Group';

  const isAlarmOn = item.ringAlarm ?? settings.defaultAlarmsEnabled;
  const isSynced = Boolean(item.isCalendarSynced);

  const { isAllDay, start, end } = calculateItemCalendarTimes(item);

  // Format date and time
  const dateFormatted = start.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const timeFormatted = isAllDay
    ? 'All-day event'
    : `${start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} – ${end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;

  const handleDownloadICS = () => {
    const ics = generateSingleItemICS(item, chatName, { ringAlarm: isAlarmOn });
    const cleanTitle = item.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    downloadICS(`${cleanTitle}.ics`, ics);

    // Auto-mark as synced
    if (!item.isCalendarSynced) {
      toggleItemCalendarSync(item.id);
    }
    showToast(`Downloaded .ics for "${item.title}"`);
  };

  const handleOpenGoogleCalendar = () => {
    const url = getGoogleCalendarUrl(item, chatName);
    window.open(url, '_blank', 'noopener,noreferrer');

    // Auto-mark as synced
    if (!item.isCalendarSynced) {
      toggleItemCalendarSync(item.id);
    }
    showToast('Opened in Google Calendar');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-modal-title"
    >
      <div className="bg-white dark:bg-[#1D2112] rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-[#E3E6D3] dark:border-[#2B321A] shadow-2xl relative my-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E3E6D3] dark:border-[#2B321A]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EEF1DC] dark:bg-[#283017] border border-[#DDE3BE] dark:border-[#384221] text-[#6B7A2A] dark:text-[#9AAE3C] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="calendar-modal-title"
                className="text-lg font-bold text-[#2B2F1E] dark:text-[#EEF1DC]"
              >
                Add to Calendar
              </h2>
              <p className="text-xs text-[#6B7059] dark:text-[#A4AA8E]">
                Sync with Apple Calendar, Google Calendar, or Outlook
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close calendar options"
            className="p-2 text-[#6B7059] hover:text-[#2B2F1E] dark:hover:text-[#EEF1DC] rounded-xl min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Event Preview Card */}
        <div className="my-5 p-4 rounded-2xl bg-[#F7F8F2] dark:bg-[#14170D] border border-[#E3E6D3] dark:border-[#2B321A] space-y-2">
          <div className="flex items-center gap-2 flex-wrap text-xs font-semibold">
            <span className="text-[#6B7A2A] dark:text-[#9AAE3C] font-bold">
              {chatName}
            </span>
            <span className="text-[#6B7059]">·</span>
            <span className="capitalize text-[#6B7059] dark:text-[#A4AA8E]">
              {item.type}
            </span>
            {isSynced && (
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-[#6B7A2A] dark:text-[#9AAE3C] bg-[#EEF1DC] dark:bg-[#283017] px-2 py-0.5 rounded-full border border-[#DDE3BE] dark:border-[#384221]">
                <CheckCircle2 className="w-3 h-3" /> Synced
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-[#2B2F1E] dark:text-[#EEF1DC] leading-snug">
            {item.title}
          </h3>

          <div className="flex items-center gap-3 text-xs text-[#6B7059] dark:text-[#A4AA8E] flex-wrap pt-1">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#6B7A2A] shrink-0" />
              <span>
                {dateFormatted} · {timeFormatted}
              </span>
            </div>

            {item.location && (
              <div className="flex items-center gap-1 text-[#6B7059] dark:text-[#A4AA8E]">
                <MapPin className="w-3.5 h-3.5 text-[#C0392B] shrink-0" />
                <span>{item.location}</span>
              </div>
            )}

            {item.meetingLink && (
              <div className="flex items-center gap-1 text-[#6B7A2A] dark:text-[#9AAE3C]">
                <Video className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[200px]">Online Meeting</span>
              </div>
            )}
          </div>
        </div>

        {/* Alarm Toggle Card */}
        <div className="mb-5 p-4 rounded-2xl bg-[#FEFCE8] dark:bg-[#28220A] border border-[#FEF08A] dark:border-[#854D0E]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-[#FEF08A] dark:bg-[#713F12] text-[#854D0E] dark:text-[#FEF08A] shrink-0 mt-0.5">
                {isAlarmOn ? (
                  <Bell className="w-4 h-4" />
                ) : (
                  <BellOff className="w-4 h-4" />
                )}
              </div>
              <div>
                <span className="text-sm font-bold text-[#713F12] dark:text-[#FEF08A] block">
                  Ring an alarm
                </span>
                <p className="text-xs text-[#854D0E] dark:text-[#CA8A04] mt-0.5">
                  Your phone's calendar will ring at the reminder times.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isAlarmOn}
              onClick={() => toggleItemAlarm(item.id)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#6B7A2A] focus:ring-offset-2 ${
                isAlarmOn ? 'bg-[#6B7A2A]' : 'bg-[#E3E6D3] dark:bg-[#2B321A]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isAlarmOn ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-[#FEF08A]/60 dark:border-[#854D0E]/60 flex items-center justify-between text-[11px] text-[#854D0E] dark:text-[#FEF08A]">
            <span>Built-in triggers: 1 day, 1 hour, and 10 mins before</span>
            <span className="font-semibold">{isAlarmOn ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Download .ics Button */}
          <button
            onClick={handleDownloadICS}
            className="w-full py-3 px-4 rounded-xl bg-[#6B7A2A] hover:bg-[#5A6823] active:bg-[#4A561C] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer min-h-[46px]"
          >
            <Download className="w-4 h-4" />
            <span>Download .ics (Apple Calendar / Outlook / Phone)</span>
          </button>

          {/* Add to Google Calendar Button */}
          <button
            onClick={handleOpenGoogleCalendar}
            className="w-full py-3 px-4 rounded-xl border border-[#E3E6D3] dark:border-[#2B321A] hover:bg-[#EEF1DC] dark:hover:bg-[#283017] text-[#2B2F1E] dark:text-[#EEF1DC] font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[46px]"
          >
            <ExternalLink className="w-4 h-4 text-[#6B7A2A]" />
            <span>Add to Google Calendar (Browser)</span>
          </button>

          {/* Calendar Sync Toggle Button */}
          <button
            onClick={() => toggleItemCalendarSync(item.id)}
            className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[40px] ${
              isSynced
                ? 'border-[#6B7A2A] bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC]'
                : 'border-[#E3E6D3] dark:border-[#2B321A] text-[#6B7059] dark:text-[#A4AA8E] hover:bg-[#EEF1DC] dark:hover:bg-[#283017]'
            }`}
          >
            {isSynced ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#6B7A2A] dark:text-[#9AAE3C]" />
                <span>Marked as Synced (Event ID: {item.calendarEventId || 'cal-synced'})</span>
              </>
            ) : (
              <>
                <Calendar className="w-3.5 h-3.5 text-[#6B7059]" />
                <span>Mark as Synced in Calendar</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile Loud Notification Help Accordion */}
        <div className="mt-4 pt-4 border-t border-[#E3E6D3] dark:border-[#2B321A]">
          <button
            type="button"
            onClick={() => setShowPhoneHelp(!showPhoneHelp)}
            className="w-full flex items-center justify-between text-left text-xs font-semibold text-[#6B7059] dark:text-[#A4AA8E] hover:text-[#2B2F1E] dark:hover:text-[#EEF1DC] transition-colors cursor-pointer py-1"
          >
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#6B7A2A]" />
              <span>How to make calendar alarms ring loudly on your phone</span>
            </span>
            {showPhoneHelp ? (
              <ChevronUp className="w-4 h-4 text-[#6B7059]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#6B7059]" />
            )}
          </button>

          {showPhoneHelp && (
            <div className="mt-2.5 p-3.5 rounded-2xl bg-[#F7F8F2] dark:bg-[#14170D] text-xs text-[#6B7059] dark:text-[#A4AA8E] space-y-2.5 animate-in fade-in">
              <div>
                <p className="font-bold text-[#2B2F1E] dark:text-[#EEF1DC] flex items-center gap-1">
                  📱 iPhone (iOS):
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-[#6B7059] dark:text-[#A4AA8E]">
                  Open <strong>Settings &gt; Notifications &gt; Calendar</strong>.
                  Turn on <strong>Allow Notifications</strong>, set Alert Style to <strong>Banners or Alerts</strong>, and tap <strong>Sounds</strong> to select a loud ringtone. Make sure your phone's physical Silent switch is off or Ring volume is up.
                </p>
              </div>

              <div className="pt-2 border-t border-[#E3E6D3] dark:border-[#2B321A]">
                <p className="font-bold text-[#2B2F1E] dark:text-[#EEF1DC] flex items-center gap-1">
                  🤖 Android:
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-[#6B7059] dark:text-[#A4AA8E]">
                  Open <strong>Settings &gt; Apps &gt; Calendar &gt; Notifications</strong>.
                  Ensure notifications are set to <strong>Alerting</strong> (not Silent). Tap <strong>Event Reminders &gt; Sound</strong> and choose a loud alarm sound. Also verify Battery Saver doesn't restrict Calendar.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
