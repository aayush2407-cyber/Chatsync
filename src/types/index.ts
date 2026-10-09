export type ChatSource = 'whatsapp' | 'telegram' | 'slack' | 'discord' | 'demo';

export interface Chat {
  id: string;
  name: string;
  source: ChatSource;
  lastImportedAt: string;
  processedMessageHashes: string[];
  summarisedMessageIds?: string[];
}

export interface Message {
  id: string;
  chatId: string;
  sender: string;
  text: string;
  timestamp: string;
  hash: string;
}

export type ReminderStatus = 'pending' | 'triggered' | 'done';

export interface MessageReminder {
  id: string;
  messageId: string;
  chatId: string;
  remindAt: string; // ISO string
  note: string;
  status: ReminderStatus;
  createdAt: string;
  title?: string;
  deadline?: string | null;
  sourceText?: string;
  sender?: string;
}

export type ExtractedItemType = 'date' | 'assignment' | 'notice' | 'meeting';
export type ItemPriority = 'low' | 'medium' | 'high';
export type ReminderOffset = '1d' | '3h' | '1h' | 'none';

export interface ExtractedItem {
  id: string;
  chatId: string;
  type: ExtractedItemType;
  title: string;
  details: string;
  sender: string;
  sourceMessage: string;
  deadline: string | null; // ISO string or null
  done: boolean;
  createdAt: string;
  priority: ItemPriority;
  reminderOffset?: ReminderOffset;
  reminderTriggered?: boolean;

  // Meeting specific fields:
  startTime?: string | null; // ISO string
  endTime?: string | null; // ISO string or null
  location?: string | null; // string or null
  meetingLink?: string | null; // string or null
  attendees?: string[];
  isAllDay?: boolean;
  isRescheduled?: boolean;
  rescheduledReason?: string | null;

  // Calendar integration fields:
  ringAlarm?: boolean;
  calendarEventId?: string | null;
  isCalendarSynced?: boolean;
}

export interface Summary {
  id: string;
  chatId: string;
  createdAt: string;
  casualCount: number;
  dateCount: number;
  assignmentCount: number;
  noticeCount: number;
  meetingCount?: number;
  casualHighlights: string[];
}

export interface StudentProfile {
  name: string;
  university: string;
  major: string;
  semester: string;
}

export interface StudentSettings {
  morningDigest: boolean;
  digestTime: string;
  eveningDigest: boolean;
  eveningDigestTime: string;
  smartNudgesEnabled: boolean;
  urgentAlerts: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  autoExtractDates: boolean;
  autoExtractTasks: boolean;
  defaultReminderOffset: ReminderOffset;
  browserNotificationsEnabled: boolean;
  autoCalendarSync: boolean;
  defaultAlarmsEnabled: boolean;
}

export type NavTab = 
  | 'dashboard'
  | 'agenda'
  | 'connect'
  | 'chats'
  | 'dates'
  | 'assignments'
  | 'notices'
  | 'settings'
  | 'privacy';
