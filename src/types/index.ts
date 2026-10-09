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

export type ExtractedItemType = 'date' | 'assignment' | 'notice';
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
}

export interface Summary {
  id: string;
  chatId: string;
  createdAt: string;
  casualCount: number;
  dateCount: number;
  assignmentCount: number;
  noticeCount: number;
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
  urgentAlerts: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  autoExtractDates: boolean;
  autoExtractTasks: boolean;
  defaultReminderOffset: ReminderOffset;
  browserNotificationsEnabled: boolean;
}

export type NavTab = 
  | 'dashboard'
  | 'connect'
  | 'chats'
  | 'dates'
  | 'assignments'
  | 'notices'
  | 'settings';
