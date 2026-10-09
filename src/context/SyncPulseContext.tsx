import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Chat,
  ChatSource,
  Message,
  ExtractedItem,
  Summary,
  StudentProfile,
  StudentSettings,
  NavTab,
  ReminderOffset,
} from '../types';
import {
  initialChats,
  initialMessages,
  initialItems,
  initialSummaries,
  initialStudent,
  initialSettings,
} from '../data/sampleData';
import { generateDemoData } from '../data/demoDataGenerator';
import { ParsedChatResult } from '../utils/chatParsers';
import { getReminderTriggerTime } from '../utils/deadlines';
import {
  generateSingleItemICS,
  generateAllUpcomingICS,
  downloadICS,
} from '../utils/calendarExport';

export interface ImportSummaryResult {
  chatId: string;
  chatName: string;
  source: ChatSource;
  newCount: number;
  existingCount: number;
  totalMessages: number;
  dateRange: string;
}

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'info';
}

interface SyncPulseContextType {
  // Navigation & Theme
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Student Profile & Settings
  student: StudentProfile;
  updateStudent: (student: Partial<StudentProfile>) => void;
  settings: StudentSettings;
  updateSettings: (settings: Partial<StudentSettings>) => void;

  // Chats
  chats: Chat[];
  addChat: (chat: Omit<Chat, 'id' | 'processedMessageHashes'> & { id?: string; processedMessageHashes?: string[] }) => void;
  deleteChat: (id: string) => void;

  // Messages
  messages: Message[];
  addMessages: (newMessages: Message[]) => void;
  deleteMessage: (id: string) => void;

  // Extracted Items (Universal To-Do & Schedule model)
  items: ExtractedItem[];
  addItems: (newItems: ExtractedItem[]) => { addedCount: number; skippedCount: number };
  toggleDone: (itemId: string) => void;
  updateItem: (item: ExtractedItem) => void;
  deleteItem: (itemId: string) => void;

  // File Import & Smart Summarize
  importChatFromParser: (parsed: ParsedChatResult) => ImportSummaryResult;
  summarizeChat: (chatId: string) => void;

  // AI Summarisation with Gemini API
  isSummarising: boolean;
  summarisingProgress: string;
  summariseError: string | null;
  activeSummaryView: { summary: Summary; items: ExtractedItem[]; chatName: string } | null;
  setActiveSummaryView: (val: { summary: Summary; items: ExtractedItem[]; chatName: string } | null) => void;
  summariseChatAI: (chatId: string) => Promise<void>;
  summariseAllChatsAI: () => Promise<void>;
  retryLastSummarise: () => void;
  closeProgressModal: () => void;
  selectedChatId: string | null;
  setSelectedChatId: (id: string | null) => void;

  // Summaries
  summaries: Summary[];
  saveSummary: (summary: Summary) => void;

  // AI Scan & Reset
  isScanning: boolean;
  runAIScan: () => void;
  resetToSampleData: () => void;
  clearAllData: () => void;
  deleteAllData: () => void;
  disconnectAllSources: () => void;

  // First-time Onboarding
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (val: boolean) => void;
  completeOnboarding: () => void;

  // Demo Mode
  loadDemoMode: () => void;
  clearDemoData: () => void;
  hasDemoData: boolean;

  // Toasts
  toasts: Toast[];
  showToast: (message: string) => void;
  removeToast: (id: string) => void;

  // Reminders & Browser Notifications
  setItemReminder: (itemId: string, offset: ReminderOffset) => void;
  isNotificationModalOpen: boolean;
  setIsNotificationModalOpen: (val: boolean) => void;
  requestNotificationPermission: () => Promise<boolean>;
  checkDueReminders: () => void;

  // Calendar Integration
  toggleItemAlarm: (itemId: string) => void;
  toggleItemCalendarSync: (itemId: string) => void;
  exportItemCalendar: (item: ExtractedItem) => void;
  exportAllUpcomingCalendar: () => void;
}

const STORAGE_KEY = 'syncpulse_app_state_v2';

// String similarity helper for deduplication rule
export function areTitlesVerySimilar(t1: string, t2: string): boolean {
  if (!t1 || !t2) return false;
  const clean1 = t1.toLowerCase().trim().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ');
  const clean2 = t2.toLowerCase().trim().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ');
  
  if (clean1 === clean2) return true;
  if (clean1.length > 5 && clean2.length > 5 && (clean1.includes(clean2) || clean2.includes(clean1))) return true;

  // Word token overlap (Jaccard similarity >= 0.70)
  const tokens1 = new Set(clean1.split(' ').filter((w) => w.length > 1));
  const tokens2 = new Set(clean2.split(' ').filter((w) => w.length > 1));
  
  if (tokens1.size === 0 || tokens2.size === 0) return false;

  let intersection = 0;
  for (const t of tokens1) {
    if (tokens2.has(t)) intersection++;
  }

  const union = new Set([...tokens1, ...tokens2]).size;
  const similarity = intersection / union;
  return similarity >= 0.7;
}

export function areDeadlinesEqual(d1: string | null, d2: string | null): boolean {
  if (d1 === null && d2 === null) return true;
  if (d1 === null || d2 === null) return false;

  // Compare date strings (matching either exact or YYYY-MM-DD prefix)
  if (d1 === d2) return true;
  const dateOnly1 = d1.slice(0, 10);
  const dateOnly2 = d2.slice(0, 10);
  return dateOnly1 === dateOnly2;
}

const SyncPulseContext = createContext<SyncPulseContextType | undefined>(undefined);

export const SyncPulseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedDark = localStorage.getItem('syncpulse_dark_mode');
      if (savedDark !== null) return savedDark === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [student, setStudent] = useState<StudentProfile>(() => {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY}_student`);
      return data ? JSON.parse(data) : initialStudent;
    } catch {
      return initialStudent;
    }
  });

  const [settings, setSettings] = useState<StudentSettings>(() => {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY}_settings`);
      return data ? JSON.parse(data) : initialSettings;
    } catch {
      return initialSettings;
    }
  });

  const [chats, setChats] = useState<Chat[]>(() => {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY}_chats`);
      return data ? JSON.parse(data) : initialChats;
    } catch {
      return initialChats;
    }
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY}_messages`);
      return data ? JSON.parse(data) : initialMessages;
    } catch {
      return initialMessages;
    }
  });

  const [items, setItems] = useState<ExtractedItem[]>(() => {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY}_items`);
      return data ? JSON.parse(data) : initialItems;
    } catch {
      return initialItems;
    }
  });

  const [summaries, setSummaries] = useState<Summary[]>(() => {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY}_summaries`);
      return data ? JSON.parse(data) : initialSummaries;
    } catch {
      return initialSummaries;
    }
  });

  const [isScanning, setIsScanning] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // AI Summarisation State
  const [isSummarising, setIsSummarising] = useState(false);
  const [summarisingProgress, setSummarisingProgress] = useState('Reading your chat...');
  const [summariseError, setSummariseError] = useState<string | null>(null);
  const [activeSummaryView, setActiveSummaryView] = useState<{
    summary: Summary;
    items: ExtractedItem[];
    chatName: string;
  } | null>(null);
  const [lastSummariseTask, setLastSummariseTask] = useState<{
    type: 'single' | 'all';
    chatId?: string;
  } | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // First-time Onboarding State
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem('syncpulse_onboarding_completed_v1');
      return completed !== 'true';
    }
    return false;
  });

  const completeOnboarding = () => {
    setIsOnboardingOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('syncpulse_onboarding_completed_v1', 'true');
    }
  };

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('syncpulse_dark_mode', String(darkMode));
  }, [darkMode]);

  // Persist state in localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_student`, JSON.stringify(student));
  }, [student]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_chats`, JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_messages`, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_items`, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_summaries`, JSON.stringify(summaries));
  }, [summaries]);

  const showToast = (message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const updateStudent = (fields: Partial<StudentProfile>) => {
    setStudent((prev) => ({ ...prev, ...fields }));
    showToast('Student profile updated');
  };

  const updateSettings = (fields: Partial<StudentSettings>) => {
    setSettings((prev) => ({ ...prev, ...fields }));
    showToast('Preferences updated');
  };

  // STORE ACTION: addChat
  const addChat = (
    chatData: Omit<Chat, 'id' | 'processedMessageHashes'> & {
      id?: string;
      processedMessageHashes?: string[];
    }
  ) => {
    const newChat: Chat = {
      id: chatData.id || `chat-${Date.now()}`,
      name: chatData.name,
      source: chatData.source,
      lastImportedAt: chatData.lastImportedAt || new Date().toISOString(),
      processedMessageHashes: chatData.processedMessageHashes || [],
    };
    setChats((prev) => [newChat, ...prev]);
    showToast(`Added ${newChat.name}`);
  };

  const deleteChat = (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    setMessages((prev) => prev.filter((m) => m.chatId !== id));
    setItems((prev) => prev.filter((i) => i.chatId !== id));
    setSummaries((prev) => prev.filter((s) => s.chatId !== id));
    showToast('Chat removed');
  };

  // STORE ACTION: addMessages
  const addMessages = (newMessages: Message[]) => {
    if (newMessages.length === 0) return;

    // Filter out messages that might already have matching hashes
    setMessages((prev) => {
      const existingHashes = new Set(prev.map((m) => m.hash));
      const filtered = newMessages.filter((m) => !existingHashes.has(m.hash));
      return [...filtered, ...prev];
    });

    // Update processedMessageHashes on corresponding chats
    const hashesByChatId: { [chatId: string]: string[] } = {};
    newMessages.forEach((m) => {
      if (!hashesByChatId[m.chatId]) hashesByChatId[m.chatId] = [];
      hashesByChatId[m.chatId].push(m.hash);
    });

    setChats((prev) =>
      prev.map((c) => {
        const newHashes = hashesByChatId[c.id];
        if (!newHashes || newHashes.length === 0) return c;
        return {
          ...c,
          lastImportedAt: new Date().toISOString(),
          processedMessageHashes: Array.from(
            new Set([...c.processedMessageHashes, ...newHashes])
          ),
        };
      })
    );

    showToast(`Imported ${newMessages.length} chat message${newMessages.length === 1 ? '' : 's'}`);
  };

  const deleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    showToast('Message removed');
  };

  // STORE ACTION: importChatFromParser with hash tracking & re-import deduplication
  const importChatFromParser = (parsed: ParsedChatResult): ImportSummaryResult => {
    const existingChat = chats.find(
      (c) =>
        c.name.trim().toLowerCase() === parsed.chatName.trim().toLowerCase() &&
        c.source === parsed.source
    );

    let targetChatId = existingChat?.id || `chat-${Date.now()}`;
    let newMessages: Message[] = [];
    let existingCount = 0;

    if (existingChat) {
      const existingHashSet = new Set(existingChat.processedMessageHashes || []);
      const toAdd: Message[] = [];

      parsed.messages.forEach((m) => {
        if (existingHashSet.has(m.hash)) {
          existingCount++;
        } else {
          toAdd.push({
            ...m,
            chatId: targetChatId,
          });
        }
      });

      newMessages = toAdd;

      if (newMessages.length > 0) {
        setMessages((prev) => [...newMessages, ...prev]);
      }

      setChats((prev) =>
        prev.map((c) =>
          c.id === existingChat.id
            ? {
                ...c,
                lastImportedAt: new Date().toISOString(),
                processedMessageHashes: Array.from(
                  new Set([...c.processedMessageHashes, ...newMessages.map((m) => m.hash)])
                ),
              }
            : c
        )
      );

      if (existingCount > 0) {
        showToast(`${newMessages.length} new messages added, ${existingCount} already processed`);
      } else {
        showToast(`${newMessages.length} new messages added`);
      }
    } else {
      targetChatId = `chat-${Date.now()}`;
      const allHashes = parsed.messages.map((m) => m.hash);
      const newChatObj: Chat = {
        id: targetChatId,
        name: parsed.chatName,
        source: parsed.source,
        lastImportedAt: new Date().toISOString(),
        processedMessageHashes: allHashes,
      };

      newMessages = parsed.messages.map((m) => ({
        ...m,
        chatId: targetChatId,
      }));

      setChats((prev) => [newChatObj, ...prev]);
      setMessages((prev) => [...newMessages, ...prev]);
      showToast(`Imported ${newMessages.length} messages for ${parsed.chatName}`);
    }

    return {
      chatId: targetChatId,
      chatName: parsed.chatName,
      source: parsed.source,
      newCount: newMessages.length,
      existingCount,
      totalMessages: existingChat
        ? existingChat.processedMessageHashes.length + newMessages.length
        : newMessages.length,
      dateRange: parsed.dateRange.formatted,
    };
  };

  // Split messages into batches of ~150
  const BATCH_SIZE = 150;

  // AI Summarise a single chat with Gemini API
  const summariseChatAI = async (targetChatId: string) => {
    const chatObj = chats.find((c) => c.id === targetChatId);
    if (!chatObj) {
      showToast('Chat not found.');
      return;
    }

    const chatMsgs = messages.filter((m) => m.chatId === targetChatId);
    if (chatMsgs.length === 0) {
      showToast('No messages in this chat to summarise.');
      return;
    }

    // 1. Take only messages that have not been summarised before.
    const summarisedSet = new Set(chatObj.summarisedMessageIds || []);
    let unsummarised = chatMsgs.filter((m) => !summarisedSet.has(m.id));

    // If all messages have been summarised, check if a summary exists
    if (unsummarised.length === 0) {
      const existingSummary = summaries.find((s) => s.chatId === targetChatId);
      const chatItems = items.filter((i) => i.chatId === targetChatId);
      if (existingSummary) {
        setActiveSummaryView({
          summary: existingSummary,
          items: chatItems,
          chatName: chatObj.name,
        });
        showToast('All messages already summarised. Showing latest summary.');
        return;
      }
      unsummarised = chatMsgs;
    }

    // Split them into batches of about 150 messages.
    const batches: Message[][] = [];
    for (let i = 0; i < unsummarised.length; i += BATCH_SIZE) {
      batches.push(unsummarised.slice(i, i + BATCH_SIZE));
    }

    setIsSummarising(true);
    setSummariseError(null);
    setLastSummariseTask({ type: 'single', chatId: targetChatId });

    const collectedCandidates: ExtractedItem[] = [];
    let totalCasualCount = 0;
    const collectedHighlights: string[] = [];
    const processedIds: string[] = [];

    try {
      for (let b = 0; b < batches.length; b++) {
        const batch = batches[b];
        setSummarisingProgress(
          batches.length > 1
            ? `Reading your chat... (Batch ${b + 1} of ${batches.length})`
            : 'Reading your chat...'
        );

        const res = await fetch('/api/summarise-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            batchIndex: b,
            totalBatches: batches.length,
            today: new Date().toISOString().split('T')[0],
            messages: batch.map((m) => ({
              id: m.id,
              sender: m.sender,
              text: m.text,
              timestamp: m.timestamp,
            })),
          }),
        });

        if (!res.ok) {
          throw new Error("Couldn't summarise right now. Try again.");
        }

        const resJson = await res.json();
        if (!resJson.success || !resJson.data) {
          throw new Error("Couldn't summarise right now. Try again.");
        }

        const data = resJson.data;
        totalCasualCount += typeof data.casualCount === 'number' ? data.casualCount : 0;
        if (Array.isArray(data.casualHighlights)) {
          collectedHighlights.push(...data.casualHighlights);
        }

        if (Array.isArray(data.items)) {
          data.items.forEach((it: any) => {
            collectedCandidates.push({
              id: `item-ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              chatId: targetChatId,
              type: it.type,
              title: it.title,
              details: it.details,
              sender: it.sender,
              sourceMessage: it.sourceMessage,
              deadline: it.deadline,
              startTime: it.startTime || null,
              endTime: it.endTime || null,
              location: it.location || null,
              meetingLink: it.meetingLink || null,
              attendees: Array.isArray(it.attendees) ? it.attendees : [],
              isAllDay: Boolean(it.isAllDay),
              isRescheduled: Boolean(it.isRescheduled),
              ringAlarm: settings.defaultAlarmsEnabled,
              isCalendarSynced: settings.autoCalendarSync,
              calendarEventId: settings.autoCalendarSync
                ? `cal-evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
                : null,
              done: false,
              createdAt: new Date().toISOString(),
              priority: it.priority || 'medium',
            });
          });
        }

        batch.forEach((m) => processedIds.push(m.id));
      }

      // 4. Merge results across batches, apply deduplication rule, save items and summary
      if (collectedCandidates.length > 0) {
        addItems(collectedCandidates);
      }

      const newSummary: Summary = {
        id: `sum-${targetChatId}-${Date.now()}`,
        chatId: targetChatId,
        createdAt: new Date().toISOString(),
        casualCount: totalCasualCount,
        dateCount: collectedCandidates.filter((i) => i.type === 'date').length,
        assignmentCount: collectedCandidates.filter((i) => i.type === 'assignment').length,
        noticeCount: collectedCandidates.filter((i) => i.type === 'notice').length,
        casualHighlights: Array.from(new Set(collectedHighlights)).slice(0, 3),
      };

      saveSummary(newSummary);

      // Update chat's summarisedMessageIds
      setChats((prev) =>
        prev.map((c) =>
          c.id === targetChatId
            ? {
                ...c,
                summarisedMessageIds: Array.from(
                  new Set([...(c.summarisedMessageIds || []), ...processedIds])
                ),
              }
            : c
        )
      );

      setIsSummarising(false);
      setActiveSummaryView({
        summary: newSummary,
        items: collectedCandidates,
        chatName: chatObj.name,
      });

      showToast(`AI Summary complete for ${chatObj.name}!`);
    } catch {
      setIsSummarising(false);
      setSummariseError("Couldn't summarise right now. Try again.");
    }
  };

  // AI Summarise all chats
  const summariseAllChatsAI = async () => {
    if (chats.length === 0) {
      showToast('Connect or load chats first to summarise.');
      return;
    }

    setIsSummarising(true);
    setSummariseError(null);
    setLastSummariseTask({ type: 'all' });

    const allExtracted: ExtractedItem[] = [];
    let combinedCasualCount = 0;
    const combinedHighlights: string[] = [];

    try {
      for (let cIdx = 0; cIdx < chats.length; cIdx++) {
        const chat = chats[cIdx];
        const chatMsgs = messages.filter((m) => m.chatId === chat.id);
        if (chatMsgs.length === 0) continue;

        const summarisedSet = new Set(chat.summarisedMessageIds || []);
        let unsummarised = chatMsgs.filter((m) => !summarisedSet.has(m.id));
        if (unsummarised.length === 0) {
          const existingItems = items.filter((i) => i.chatId === chat.id);
          allExtracted.push(...existingItems);
          continue;
        }

        const batches: Message[][] = [];
        for (let i = 0; i < unsummarised.length; i += BATCH_SIZE) {
          batches.push(unsummarised.slice(i, i + BATCH_SIZE));
        }

        const chatProcessedIds: string[] = [];

        for (let b = 0; b < batches.length; b++) {
          const batch = batches[b];
          setSummarisingProgress(
            `Reading ${chat.name}... (Batch ${b + 1} of ${batches.length})`
          );

          const res = await fetch('/api/summarise-batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              batchIndex: b,
              totalBatches: batches.length,
              today: new Date().toISOString().split('T')[0],
              messages: batch.map((m) => ({
                id: m.id,
                sender: m.sender,
                text: m.text,
                timestamp: m.timestamp,
              })),
            }),
          });

          if (!res.ok) {
            throw new Error("Couldn't summarise right now. Try again.");
          }

          const resJson = await res.json();
          if (!resJson.success || !resJson.data) {
            throw new Error("Couldn't summarise right now. Try again.");
          }

          const data = resJson.data;
          combinedCasualCount += typeof data.casualCount === 'number' ? data.casualCount : 0;
          if (Array.isArray(data.casualHighlights)) {
            combinedHighlights.push(...data.casualHighlights);
          }

          if (Array.isArray(data.items)) {
            data.items.forEach((it: any) => {
              allExtracted.push({
                id: `item-ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                chatId: chat.id,
                type: it.type,
                title: it.title,
                details: it.details,
                sender: it.sender,
                sourceMessage: it.sourceMessage,
                deadline: it.deadline,
                startTime: it.startTime || null,
                endTime: it.endTime || null,
                location: it.location || null,
                meetingLink: it.meetingLink || null,
                attendees: Array.isArray(it.attendees) ? it.attendees : [],
                isAllDay: Boolean(it.isAllDay),
                isRescheduled: Boolean(it.isRescheduled),
                ringAlarm: settings.defaultAlarmsEnabled,
                isCalendarSynced: settings.autoCalendarSync,
                calendarEventId: settings.autoCalendarSync
                  ? `cal-evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
                  : null,
                done: false,
                createdAt: new Date().toISOString(),
                priority: it.priority || 'medium',
              });
            });
          }

          batch.forEach((m) => chatProcessedIds.push(m.id));
        }

        setChats((prev) =>
          prev.map((c) =>
            c.id === chat.id
              ? {
                  ...c,
                  summarisedMessageIds: Array.from(
                    new Set([...(c.summarisedMessageIds || []), ...chatProcessedIds])
                  ),
                }
              : c
          )
        );
      }

      if (allExtracted.length > 0) {
        addItems(allExtracted);
      }

      const combinedSummary: Summary = {
        id: `sum-all-${Date.now()}`,
        chatId: 'all-chats',
        createdAt: new Date().toISOString(),
        casualCount: combinedCasualCount,
        dateCount: allExtracted.filter((i) => i.type === 'date').length,
        assignmentCount: allExtracted.filter((i) => i.type === 'assignment').length,
        noticeCount: allExtracted.filter((i) => i.type === 'notice').length,
        casualHighlights: Array.from(new Set(combinedHighlights)).slice(0, 3),
      };

      saveSummary(combinedSummary);
      setIsSummarising(false);
      setActiveSummaryView({
        summary: combinedSummary,
        items: allExtracted,
        chatName: 'All Connected Chats',
      });

      showToast('All chats summarised successfully!');
    } catch {
      setIsSummarising(false);
      setSummariseError("Couldn't summarise right now. Try again.");
    }
  };

  const retryLastSummarise = () => {
    if (lastSummariseTask?.type === 'all') {
      summariseAllChatsAI();
    } else if (lastSummariseTask?.chatId) {
      summariseChatAI(lastSummariseTask.chatId);
    } else {
      closeProgressModal();
    }
  };

  const closeProgressModal = () => {
    setIsSummarising(false);
    setSummariseError(null);
  };

  const summarizeChat = (targetChatId: string) => {
    summariseChatAI(targetChatId);
  };

  // STORE ACTION: addItems with deduplication and meeting reschedule rules
  // Rule 1: For meetings, if an existing meeting with a similar title exists in the same chat,
  // treat time changes ("meeting shifted to 5pm") as an update to the earlier meeting and mark isRescheduled: true.
  // Rule 2: Skip duplicates with exact same type, similar title, and matching date/deadline.
  const addItems = (newItems: ExtractedItem[]) => {
    let addedCount = 0;
    let skippedCount = 0;
    let rescheduledCount = 0;

    setItems((prevItems) => {
      const updatedList = [...prevItems];

      for (const candidate of newItems) {
        // 1. Meeting reschedule check
        if (candidate.type === 'meeting') {
          const existingIndex = updatedList.findIndex((existing) => {
            const sameChat = existing.chatId === candidate.chatId;
            const isMeeting = existing.type === 'meeting';
            const similarTitle = areTitlesVerySimilar(existing.title, candidate.title);
            return sameChat && isMeeting && similarTitle;
          });

          if (existingIndex >= 0) {
            const existing = updatedList[existingIndex];
            const candidateTime = candidate.startTime || candidate.deadline;
            const existingTime = existing.startTime || existing.deadline;
            const isTimeChanged =
              !areDeadlinesEqual(existingTime, candidateTime) || Boolean(candidate.isRescheduled);

            if (isTimeChanged) {
              // Update existing meeting in-place as a rescheduled item
              const updatedMeeting: ExtractedItem = {
                ...existing,
                title: candidate.title || existing.title,
                startTime: candidate.startTime || candidate.deadline || existing.startTime,
                endTime: candidate.endTime ?? existing.endTime,
                deadline: candidate.deadline || candidate.startTime || existing.deadline,
                location: candidate.location ?? existing.location,
                meetingLink: candidate.meetingLink ?? existing.meetingLink,
                attendees:
                  candidate.attendees && candidate.attendees.length > 0
                    ? candidate.attendees
                    : existing.attendees,
                details: candidate.details || existing.details,
                sourceMessage: candidate.sourceMessage || existing.sourceMessage,
                isRescheduled: true,
                rescheduledReason: candidate.details || 'Meeting time updated from chat',
                // Keep and update calendar sync status
                isCalendarSynced: existing.isCalendarSynced ?? settings.autoCalendarSync,
                calendarEventId:
                  existing.calendarEventId ||
                  (settings.autoCalendarSync
                    ? `cal-evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
                    : null),
                ringAlarm: candidate.ringAlarm ?? existing.ringAlarm ?? settings.defaultAlarmsEnabled,
              };
              updatedList[existingIndex] = updatedMeeting;
              rescheduledCount++;
              continue;
            } else {
              // Exact duplicate meeting with unchanged time
              skippedCount++;
              continue;
            }
          }
        }

        // 2. Standard deduplication check for other items
        const isDuplicate = updatedList.some((existing) => {
          const sameChat = existing.chatId === candidate.chatId;
          const sameType = existing.type === candidate.type;
          const sameDeadline = areDeadlinesEqual(existing.deadline, candidate.deadline);
          const similarTitle = areTitlesVerySimilar(existing.title, candidate.title);

          return sameChat && sameType && sameDeadline && similarTitle;
        });

        if (isDuplicate) {
          skippedCount++;
        } else {
          // If autoCalendarSync is enabled, set calendarEventId on new items with dates
          const preparedCandidate: ExtractedItem = {
            ...candidate,
            ringAlarm: candidate.ringAlarm ?? settings.defaultAlarmsEnabled,
            isCalendarSynced:
              candidate.isCalendarSynced ??
              (settings.autoCalendarSync && Boolean(candidate.deadline || candidate.startTime)),
            calendarEventId:
              candidate.calendarEventId ||
              (settings.autoCalendarSync && (candidate.deadline || candidate.startTime)
                ? `cal-evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
                : null),
          };
          updatedList.unshift(preparedCandidate);
          addedCount++;
        }
      }

      return updatedList;
    });

    if (rescheduledCount > 0) {
      showToast(
        `Updated & rescheduled ${rescheduledCount} meeting${rescheduledCount === 1 ? '' : 's'}`
      );
    }

    if (addedCount > 0) {
      showToast(
        `Added ${addedCount} item${addedCount === 1 ? '' : 's'}${
          skippedCount > 0 ? ` (${skippedCount} duplicate${skippedCount === 1 ? '' : 's'} skipped)` : ''
        }`
      );
    } else if (skippedCount > 0 && rescheduledCount === 0) {
      showToast(`${skippedCount} duplicate item${skippedCount === 1 ? '' : 's'} already existed — skipped`);
    }

    return { addedCount, skippedCount };
  };

  // STORE ACTION: toggleDone
  const toggleDone = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const nextDone = !item.done;
          if (item.isCalendarSynced) {
            showToast(
              nextDone
                ? `Completed "${item.title}" & updated calendar event`
                : `Reopened "${item.title}"`
            );
          }
          return { ...item, done: nextDone };
        }
        return item;
      })
    );
  };

  // STORE ACTION: updateItem
  const updateItem = (updated: ExtractedItem) => {
    setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    showToast('Item updated');
  };

  // STORE ACTION: deleteItem
  const deleteItem = (itemId: string) => {
    const target = items.find((i) => i.id === itemId);
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    if (target?.isCalendarSynced) {
      showToast(`Deleted "${target.title}" & removed calendar sync`);
    } else {
      showToast('Item deleted');
    }
  };

  // CALENDAR INTEGRATION ACTIONS
  const toggleItemAlarm = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const currentAlarm = item.ringAlarm ?? settings.defaultAlarmsEnabled;
          const nextAlarm = !currentAlarm;
          showToast(
            nextAlarm
              ? 'Alarm enabled: Phone will ring at reminder times'
              : 'Alarm turned off for this item'
          );
          return { ...item, ringAlarm: nextAlarm };
        }
        return item;
      })
    );
  };

  const toggleItemCalendarSync = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const nextSync = !item.isCalendarSynced;
          const evtId = nextSync
            ? item.calendarEventId || `cal-evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
            : null;
          showToast(
            nextSync
              ? 'Item marked as synced with calendar'
              : 'Removed from calendar sync'
          );
          return { ...item, isCalendarSynced: nextSync, calendarEventId: evtId };
        }
        return item;
      })
    );
  };

  const exportItemCalendar = (item: ExtractedItem) => {
    const chat = chats.find((c) => c.id === item.chatId);
    const chatName = chat?.name || 'Class Group';
    const isAlarm = item.ringAlarm ?? settings.defaultAlarmsEnabled;
    const icsContent = generateSingleItemICS(item, chatName, { ringAlarm: isAlarm });
    const cleanTitle = item.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    downloadICS(`${cleanTitle}.ics`, icsContent);

    // Ensure item has sync flag and event ID
    if (!item.isCalendarSynced) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                isCalendarSynced: true,
                calendarEventId:
                  i.calendarEventId || `cal-evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              }
            : i
        )
      );
    }
    showToast(`Downloaded calendar file for "${item.title}"`);
  };

  const exportAllUpcomingCalendar = () => {
    const upcoming = items.filter((i) => !i.done && (i.deadline || i.startTime));
    if (upcoming.length === 0) {
      showToast('No upcoming unfinished deadlines or meetings to export.');
      return;
    }

    const icsContent = generateAllUpcomingICS(items, chats, {
      ringAlarm: settings.defaultAlarmsEnabled,
    });
    downloadICS('SyncPulse_All_Upcoming.ics', icsContent);

    // Mark all upcoming items as synced
    setItems((prev) =>
      prev.map((i) =>
        !i.done && (i.deadline || i.startTime)
          ? {
              ...i,
              isCalendarSynced: true,
              calendarEventId:
                i.calendarEventId || `cal-evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            }
          : i
      )
    );

    showToast(`Exported ${upcoming.length} upcoming items to SyncPulse_All_Upcoming.ics!`);
  };

  // STORE ACTION: saveSummary
  const saveSummary = (summary: Summary) => {
    setSummaries((prev) => {
      const index = prev.findIndex((s) => s.id === summary.id || s.chatId === summary.chatId);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = summary;
        return updated;
      }
      return [summary, ...prev];
    });
  };

  // Smart pulse scan
  const runAIScan = () => {
    setIsScanning(true);
    showToast('AI is scanning all active chats for to-dos and deadlines...');

    setTimeout(() => {
      const targetChat = chats[0] || { id: 'chat-demo', name: 'CS 101 Announcements' };

      // Candidate items from simulated chat scan
      const candidateScanItems: ExtractedItem[] = [
        {
          id: `scan-${Date.now()}-1`,
          chatId: targetChat.id,
          type: 'assignment',
          title: 'Weekly Homework Problem Set Check',
          details: 'TA announced homework link closes at 5:00 PM on Friday in Canvas.',
          sender: 'TA David Chen',
          sourceMessage: 'Weekly Problem Set is due this Friday before 5pm. Please double check submission formatting.',
          deadline: new Date(Date.now() + 86400000 * 4).toISOString(),
          done: false,
          createdAt: new Date().toISOString(),
          priority: 'high',
        },
        {
          id: `scan-${Date.now()}-2`,
          chatId: targetChat.id,
          type: 'date',
          title: 'Review Session before Midterm',
          details: 'In Turing Hall Room 102. TAs will walk through previous year test problems.',
          sender: 'TA David Chen',
          sourceMessage: 'Midterm review session will be held next Tuesday evening in Room 102.',
          deadline: new Date(Date.now() + 86400000 * 7).toISOString(),
          done: false,
          createdAt: new Date().toISOString(),
          priority: 'medium',
        },
      ];

      addItems(candidateScanItems);

      saveSummary({
        id: `sum-scan-${Date.now()}`,
        chatId: targetChat.id,
        createdAt: new Date().toISOString(),
        casualCount: 14,
        dateCount: 1,
        assignmentCount: 1,
        noticeCount: 0,
        casualHighlights: [
          'Study group comparing lecture problem solutions',
          'Someone asking where to buy lab notebooks on campus',
        ],
      });

      setIsScanning(false);
    }, 1100);
  };

  const resetToSampleData = () => {
    setChats(initialChats);
    setMessages(initialMessages);
    setItems(initialItems);
    setSummaries(initialSummaries);
    setStudent(initialStudent);
    setSettings(initialSettings);
    showToast('Freshman demo data loaded');
  };

  const clearAllData = () => {
    setChats([]);
    setMessages([]);
    setItems([]);
    setSummaries([]);
    showToast('All data cleared. Showing fresh empty states.');
  };

  const deleteAllData = () => {
    setChats([]);
    setMessages([]);
    setItems([]);
    setSummaries([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`${STORAGE_KEY}_chats`);
        localStorage.removeItem(`${STORAGE_KEY}_messages`);
        localStorage.removeItem(`${STORAGE_KEY}_items`);
        localStorage.removeItem(`${STORAGE_KEY}_summaries`);
      } catch {
        // storage ignored
      }
    }
    showToast('All personal data has been completely erased.');
  };

  const disconnectAllSources = () => {
    setChats([]);
    setMessages([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`${STORAGE_KEY}_chats`);
        localStorage.removeItem(`${STORAGE_KEY}_messages`);
      } catch {
        // storage ignored
      }
    }
    showToast('All chat sources disconnected and raw messages cleared.');
  };

  const hasDemoData = chats.some((c) => c.source === 'demo' || c.id.startsWith('chat-demo'));

  const loadDemoMode = () => {
    const demo = generateDemoData();
    // Prepend or replace demo chats cleanly
    setChats((prev) => {
      const nonDemo = prev.filter((c) => c.source !== 'demo' && !c.id.startsWith('chat-demo'));
      return [...demo.chats, ...nonDemo];
    });
    setMessages((prev) => {
      const nonDemo = prev.filter((m) => !m.chatId.startsWith('chat-demo'));
      return [...demo.messages, ...nonDemo];
    });
    setItems((prev) => {
      const nonDemo = prev.filter((i) => !i.chatId.startsWith('chat-demo'));
      return [...demo.items, ...nonDemo];
    });
    setSummaries((prev) => {
      const nonDemo = prev.filter((s) => !s.chatId.startsWith('chat-demo'));
      return [...demo.summaries, ...nonDemo];
    });
    showToast('Demo Mode active! Loaded CSE-4 Class Group & Project Team chats.');
  };

  const clearDemoData = () => {
    setChats((prev) => prev.filter((c) => c.source !== 'demo' && !c.id.startsWith('chat-demo')));
    setMessages((prev) => prev.filter((m) => !m.chatId.startsWith('chat-demo')));
    setItems((prev) => prev.filter((i) => !i.chatId.startsWith('chat-demo')));
    setSummaries((prev) => prev.filter((s) => !s.chatId.startsWith('chat-demo')));
    showToast('Demo chats cleared.');
  };

  // Reminders & Browser Notifications
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [triggeredReminderKeys, setTriggeredReminderKeys] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('syncpulse_triggered_reminders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      showToast('Browser notifications are not supported on this browser.');
      return false;
    }
    if (Notification.permission === 'granted') {
      return true;
    }
    try {
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        showToast('Notifications enabled! You will be alerted before deadlines.');
        setIsNotificationModalOpen(false);
        return true;
      } else {
        showToast('Notifications not granted. In-app reminder toasts will still show.');
        setIsNotificationModalOpen(false);
        return false;
      }
    } catch {
      setIsNotificationModalOpen(false);
      return false;
    }
  };

  const setItemReminder = (itemId: string, offset: ReminderOffset) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, reminderOffset: offset } : item))
    );
    if (offset !== 'none') {
      const offsetText =
        offset === '1d' ? '1 day before' : offset === '3h' ? '3 hours before' : '1 hour before';
      showToast(`Reminder set for ${offsetText}`);
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'default'
      ) {
        setIsNotificationModalOpen(true);
      }
    } else {
      showToast('Reminder removed');
    }
  };

  const checkDueReminders = () => {
    if (typeof window === 'undefined') return;
    const now = Date.now();
    const currentTriggered = new Set(triggeredReminderKeys);
    const newTriggered: string[] = [];

    items.forEach((item) => {
      if (item.done || !item.deadline || !item.reminderOffset || item.reminderOffset === 'none') {
        return;
      }

      const triggerTime = getReminderTriggerTime(item.deadline, item.reminderOffset);
      if (!triggerTime) return;

      const reminderKey = `${item.id}_${item.reminderOffset}`;
      if (now >= triggerTime.getTime() && !currentTriggered.has(reminderKey)) {
        newTriggered.push(reminderKey);

        const offsetLabel =
          item.reminderOffset === '1d'
            ? 'in 1 day'
            : item.reminderOffset === '3h'
            ? 'in 3 hours'
            : 'in 1 hour';

        // In-app toast for each triggered reminder
        showToast(`⏰ Reminder: "${item.title}" is due ${offsetLabel}!`);

        // Browser notification
        if (
          'Notification' in window &&
          Notification.permission === 'granted' &&
          settings.browserNotificationsEnabled
        ) {
          try {
            new Notification(`SyncPulse: ${item.title}`, {
              body: `Due ${new Date(item.deadline).toLocaleString()} · ${item.details || 'Check your class tasks.'}`,
              icon: '/favicon.ico',
            });
          } catch {
            // Suppress notification errors in restricted browser sandbox
          }
        }
      }
    });

    if (newTriggered.length > 0) {
      setTriggeredReminderKeys((prev) => {
        const updated = Array.from(new Set([...prev, ...newTriggered]));
        try {
          localStorage.setItem('syncpulse_triggered_reminders', JSON.stringify(updated));
        } catch {
          // Ignore storage errors
        }
        return updated;
      });
    }
  };

  // Check reminders on mount and every minute (60 seconds)
  useEffect(() => {
    checkDueReminders();

    const interval = setInterval(() => {
      checkDueReminders();
    }, 60000);

    return () => clearInterval(interval);
  }, [items, settings.browserNotificationsEnabled, triggeredReminderKeys]);

  return (
    <SyncPulseContext.Provider
      value={{
        activeTab,
        setActiveTab,
        darkMode,
        toggleDarkMode,
        student,
        updateStudent,
        settings,
        updateSettings,
        chats,
        addChat,
        deleteChat,
        messages,
        addMessages,
        deleteMessage,
        items,
        addItems,
        toggleDone,
        updateItem,
        deleteItem,
        importChatFromParser,
        summarizeChat,
        isSummarising,
        summarisingProgress,
        summariseError,
        activeSummaryView,
        setActiveSummaryView,
        summariseChatAI,
        summariseAllChatsAI,
        retryLastSummarise,
        closeProgressModal,
        selectedChatId,
        setSelectedChatId,
        summaries,
        saveSummary,
        isScanning,
        runAIScan,
        resetToSampleData,
        clearAllData,
        deleteAllData,
        disconnectAllSources,
        isOnboardingOpen,
        setIsOnboardingOpen,
        completeOnboarding,
        loadDemoMode,
        clearDemoData,
        hasDemoData,
        toasts,
        showToast,
        removeToast,
        setItemReminder,
        isNotificationModalOpen,
        setIsNotificationModalOpen,
        requestNotificationPermission,
        checkDueReminders,
        toggleItemAlarm,
        toggleItemCalendarSync,
        exportItemCalendar,
        exportAllUpcomingCalendar,
      }}
    >
      {children}
    </SyncPulseContext.Provider>
  );
};

export const useSyncPulse = () => {
  const context = useContext(SyncPulseContext);
  if (!context) {
    throw new Error('useSyncPulse must be used within a SyncPulseProvider');
  }
  return context;
};
