import { ExtractedItem, Chat, StudentSettings } from '../types';

/**
 * Format a Date object to UTC string for iCalendar: YYYYMMDDTHHmmssZ
 */
export function formatToICSDate(date: Date): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

/**
 * Format a Date object to all-day format: YYYYMMDD
 */
export function formatToICSAllDay(date: Date): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate())
  );
}

/**
 * Escape text for iCalendar RFC 5545
 */
export function escapeICSText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

export interface ItemCalendarTimes {
  isAllDay: boolean;
  start: Date;
  end: Date;
}

/**
 * Calculate accurate start and end dates according to item type:
 * - default 1 hour for meetings
 * - all-day for date-only items
 * - deadline time for assignments
 */
export function calculateItemCalendarTimes(item: ExtractedItem): ItemCalendarTimes {
  const isMeeting = item.type === 'meeting';
  const isAssignment = item.type === 'assignment';
  const rawTime = item.startTime || item.deadline;
  const baseDate = rawTime ? new Date(rawTime) : new Date();

  // If flagged as all-day or date has no time specified
  if (item.isAllDay || (!item.startTime && item.type === 'date')) {
    const start = new Date(baseDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1); // Exclusive end date for all-day in RFC 5545
    return { isAllDay: true, start, end };
  }

  if (isMeeting) {
    const start = new Date(baseDate);
    let end: Date;
    if (item.endTime) {
      end = new Date(item.endTime);
    } else {
      // Default 1 hour for meetings
      end = new Date(start.getTime() + 60 * 60 * 1000);
    }
    return { isAllDay: false, start, end };
  }

  if (isAssignment) {
    // For assignments, event ends at the deadline time; starts 1 hour prior
    const end = new Date(baseDate);
    const start = new Date(end.getTime() - 60 * 60 * 1000);
    return { isAllDay: false, start, end };
  }

  // Generic date/notice item
  const start = new Date(baseDate);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return { isAllDay: false, start, end };
}

/**
 * Generate built-in VALARM blocks so phone's calendar app rings:
 * User's default reminders: 1 day before, 1 hour before, 10 minutes before
 */
export function generateValarms(itemTitle: string, ringAlarm: boolean = true): string {
  if (!ringAlarm) return '';

  const cleanTitle = escapeICSText(itemTitle);
  return [
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:SyncPulse Reminder: ${cleanTitle} is tomorrow`,
    'TRIGGER:-P1D',
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:SyncPulse Reminder: ${cleanTitle} in 1 hour`,
    'TRIGGER:-PT1H',
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:SyncPulse Alarm: ${cleanTitle} starting soon!`,
    'TRIGGER:-PT10M',
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:AUDIO',
    'TRIGGER:-PT10M',
    'ATTACH;VALUE=URI:Chord',
    'END:VALARM',
  ].join('\r\n') + '\r\n';
}

/**
 * Generate VEVENT block for a single item
 */
export function generateVEvent(
  item: ExtractedItem,
  chatName: string = 'Class Group',
  options?: { ringAlarm?: boolean }
): string {
  const { isAllDay, start, end } = calculateItemCalendarTimes(item);
  const ringAlarm = options?.ringAlarm !== undefined ? options.ringAlarm : (item.ringAlarm ?? true);

  const uid = `syncpulse-${item.id}-${start.getTime()}@syncpulse.app`;
  const dtStamp = formatToICSDate(new Date());

  const summary = `[${chatName}] ${item.title}`;
  let description = `${item.details || item.title}\n\nType: ${item.type.toUpperCase()}`;
  if (item.priority) {
    description += `\nPriority: ${item.priority.toUpperCase()}`;
  }
  if (item.meetingLink) {
    description += `\nMeeting Link: ${item.meetingLink}`;
  }
  if (item.location) {
    description += `\nLocation: ${item.location}`;
  }
  if (item.sourceMessage) {
    description += `\nSource: "${item.sourceMessage}"`;
  }
  description += '\n\nOrganized by SyncPulse AI Chat Hub';

  const lines = [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
  ];

  if (isAllDay) {
    lines.push(`DTSTART;VALUE=DATE:${formatToICSAllDay(start)}`);
    lines.push(`DTEND;VALUE=DATE:${formatToICSAllDay(end)}`);
  } else {
    lines.push(`DTSTART:${formatToICSDate(start)}`);
    lines.push(`DTEND:${formatToICSDate(end)}`);
  }

  lines.push(`SUMMARY:${escapeICSText(summary)}`);
  lines.push(`DESCRIPTION:${escapeICSText(description)}`);

  if (item.location) {
    lines.push(`LOCATION:${escapeICSText(item.location)}`);
  } else if (item.meetingLink) {
    lines.push(`LOCATION:${escapeICSText(item.meetingLink)}`);
  }

  if (item.meetingLink) {
    lines.push(`URL:${item.meetingLink}`);
  }

  lines.push('STATUS:CONFIRMED');

  // Add VALARM notifications
  const valarms = generateValarms(item.title, ringAlarm);
  if (valarms) {
    lines.push(valarms.trim());
  }

  lines.push('END:VEVENT');

  return lines.join('\r\n');
}

/**
 * Generate full downloadable .ics string for a single item
 */
export function generateSingleItemICS(
  item: ExtractedItem,
  chatName: string = 'Class Group',
  options?: { ringAlarm?: boolean }
): string {
  const vevent = generateVEvent(item, chatName, options);

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SyncPulse//AI Chat Hub//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:SyncPulse - ${escapeICSText(item.title)}`,
    vevent,
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Generate full downloadable .ics string with all unfinished upcoming items
 */
export function generateAllUpcomingICS(
  items: ExtractedItem[],
  chats: Chat[],
  options?: { ringAlarm?: boolean }
): string {
  const upcomingItems = items.filter(
    (item) => !item.done && (item.deadline || item.startTime)
  );

  const getChatName = (chatId: string) =>
    chats.find((c) => c.id === chatId)?.name || 'Class Group';

  const vevents = upcomingItems.map((item) =>
    generateVEvent(item, getChatName(item.chatId), options)
  );

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SyncPulse//AI Chat Hub//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:SyncPulse Upcoming Deadlines & Meetings',
    'X-WR-TIMEZONE:UTC',
    ...vevents,
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Triggers a browser download of the generated .ics file
 */
export function downloadICS(filename: string, icsContent: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Generate Google Calendar URL with prefilled template parameters
 */
export function getGoogleCalendarUrl(
  item: ExtractedItem,
  chatName: string = 'Class Group'
): string {
  const { isAllDay, start, end } = calculateItemCalendarTimes(item);

  const title = `[${chatName}] ${item.title}`;
  let details = item.details || item.title;
  if (item.meetingLink) {
    details += `\n\nJoin Meeting: ${item.meetingLink}`;
  }
  if (item.sourceMessage) {
    details += `\nChat source: "${item.sourceMessage}"`;
  }
  details += '\nAdded via SyncPulse AI Chat Hub';

  const location = item.location || item.meetingLink || '';

  const datesParam = isAllDay
    ? `${formatToICSAllDay(start)}/${formatToICSAllDay(end)}`
    : `${formatToICSDate(start)}/${formatToICSDate(end)}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: datesParam,
    details,
    location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
