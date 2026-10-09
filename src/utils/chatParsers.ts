import JSZip from 'jszip';
import { Message, ChatSource } from '../types';

export interface ParsedChatResult {
  chatName: string;
  source: ChatSource;
  messages: Omit<Message, 'chatId'>[];
  totalParsed: number;
  dateRange: {
    firstDate: string | null;
    lastDate: string | null;
    formatted: string;
  };
}

// Compute deterministic hash for a message (sender + timestamp + text)
export function computeMessageHash(sender: string, timestamp: string, text: string): string {
  const normalized = `${sender.trim()}:::${timestamp.trim()}:::${text.trim()}`;
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `hash-${Math.abs(hash).toString(36)}-${normalized.length}`;
}

// Clean chat name from file name
export function cleanChatName(fileName: string): string {
  let name = fileName.replace(/\.(txt|zip|json)$/i, '');
  // Strip "WhatsApp Chat with " or "WhatsApp Chat - "
  name = name.replace(/^WhatsApp Chat (with|-)\s*/i, '');
  // Strip "Chat with " or "Telegram - "
  name = name.replace(/^(Chat with|Telegram -|Telegram Chat with)\s*/i, '');
  // If result is generic like "_chat" or "result", fallback
  if (name.toLowerCase() === '_chat' || name.toLowerCase() === 'result') {
    return 'Imported Class Chat';
  }
  return name.trim() || 'Imported Chat';
}

/**
 * Detect date format (DD/MM vs MM/DD) automatically from message text
 */
function detectDateFormat(lines: string[]): 'DMY' | 'MDY' {
  let dmyVotes = 0;
  let mdyVotes = 0;

  const datePattern = /(\d{1,2})[/\.-](\d{1,2})[/\.-](\d{2,4})/;

  for (const line of lines.slice(0, 300)) {
    const match = line.match(datePattern);
    if (match) {
      const part1 = parseInt(match[1], 10);
      const part2 = parseInt(match[2], 10);

      if (part1 > 12 && part2 <= 12) {
        dmyVotes += 5; // part1 is day, part2 is month
      } else if (part2 > 12 && part1 <= 12) {
        mdyVotes += 5; // part1 is month, part2 is day
      }
    }
  }

  return mdyVotes > dmyVotes ? 'MDY' : 'DMY';
}

/**
 * Standardize timestamp to ISO string when possible
 */
function parseWhatsAppTimestamp(
  datePart: string,
  timePart: string,
  dateFormat: 'DMY' | 'MDY'
): string {
  try {
    const dParts = datePart.split(/[/\.-]/).map((p) => parseInt(p, 10));
    let day: number, month: number, year: number;

    if (dateFormat === 'DMY') {
      day = dParts[0];
      month = dParts[1] - 1;
      year = dParts[2];
    } else {
      month = dParts[0] - 1;
      day = dParts[1];
      year = dParts[2];
    }

    if (year < 100) year += 2000;

    // Parse time: "9:45 pm", "21:45:12", "09:45 AM"
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    const isPM = /pm/i.test(timePart);
    const isAM = /am/i.test(timePart);
    const cleanTime = timePart.replace(/[^\d:]/g, '');
    const tParts = cleanTime.split(':').map((p) => parseInt(p, 10));

    hours = tParts[0] || 0;
    minutes = tParts[1] || 0;
    seconds = tParts[2] || 0;

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    const parsedDate = new Date(year, month, day, hours, minutes, seconds);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString();
    }
  } catch {
    // fallback to current time
  }
  return new Date().toISOString();
}

/**
 * Filter out WhatsApp system messages
 */
function isWhatsAppSystemMessage(text: string, sender: string): boolean {
  if (!sender) return true;
  const sysPhrases = [
    'Messages and calls are end-to-end encrypted',
    'created group',
    'joined using this group',
    'was added',
    'added',
    'left',
    'removed',
    'changed the subject to',
    'changed this group',
    'changed the group description',
    'Security code changed',
    'Waiting for this message. This may take a while.',
    'You were added',
    'This chat is with a business account',
  ];

  return sysPhrases.some(
    (phrase) =>
      text.toLowerCase().includes(phrase.toLowerCase()) ||
      sender.toLowerCase().includes(phrase.toLowerCase())
  );
}

/**
 * PARSE WHATSAPP CHAT EXPORT (.txt content)
 * Supports:
 * - "12/03/2026, 9:45 pm - Rahul: message"
 * - "[12/03/2026, 21:45:12] Rahul: message"
 * - Multi-line messages
 * - DD/MM and MM/DD auto detection
 * - System message filtering
 */
export function parseWhatsAppExport(content: string, fileName: string): ParsedChatResult {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const dateFormat = detectDateFormat(lines);

  const parsedMessages: Omit<Message, 'chatId'>[] = [];
  let currentMsg: {
    sender: string;
    text: string;
    timestamp: string;
    dateObj: Date;
  } | null = null;

  // Regex format 1: 12/03/2026, 9:45 pm - Rahul: message
  const format1Regex = /^(\d{1,2}[/\.-]\d{1,2}[/\.-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[apAP]\.?[mM]\.?)?)\s*[-–]\s*([^:]+):\s*(.*)$/;

  // Regex format 2: [12/03/2026, 21:45:12] Rahul: message
  const format2Regex = /^\[(\d{1,2}[/\.-]\d{1,2}[/\.-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[apAP]\.?[mM]\.?)?)\]\s*([^:]+):\s*(.*)$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const match1 = line.match(format1Regex);
    const match2 = line.match(format2Regex);
    const match = match1 || match2;

    if (match) {
      // Save previous message if it exists
      if (currentMsg && !isWhatsAppSystemMessage(currentMsg.text, currentMsg.sender)) {
        parsedMessages.push({
          id: `msg-${parsedMessages.length + 1}-${Date.now()}`,
          sender: currentMsg.sender.trim(),
          text: currentMsg.text.trim(),
          timestamp: currentMsg.timestamp,
          hash: computeMessageHash(currentMsg.sender, currentMsg.timestamp, currentMsg.text),
        });
      }

      const datePart = match[1];
      const timePart = match[2];
      const sender = match[3];
      const text = match[4];

      const timestamp = parseWhatsAppTimestamp(datePart, timePart, dateFormat);

      currentMsg = {
        sender,
        text,
        timestamp,
        dateObj: new Date(timestamp),
      };
    } else {
      // Continuation line of multi-line message
      if (currentMsg) {
        currentMsg.text += '\n' + line;
      }
    }
  }

  // Push final message
  if (currentMsg && !isWhatsAppSystemMessage(currentMsg.text, currentMsg.sender)) {
    parsedMessages.push({
      id: `msg-${parsedMessages.length + 1}-${Date.now()}`,
      sender: currentMsg.sender.trim(),
      text: currentMsg.text.trim(),
      timestamp: currentMsg.timestamp,
      hash: computeMessageHash(currentMsg.sender, currentMsg.timestamp, currentMsg.text),
    });
  }

  // Calculate date range
  let firstDate: string | null = null;
  let lastDate: string | null = null;
  let formattedRange = 'Recent messages';

  if (parsedMessages.length > 0) {
    firstDate = parsedMessages[0].timestamp;
    lastDate = parsedMessages[parsedMessages.length - 1].timestamp;

    const d1 = new Date(firstDate);
    const d2 = new Date(lastDate);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    formattedRange = `${d1.toLocaleDateString('en-US', options)} – ${d2.toLocaleDateString(
      'en-US',
      options
    )}`;
  }

  return {
    chatName: cleanChatName(fileName),
    source: 'whatsapp',
    messages: parsedMessages,
    totalParsed: parsedMessages.length,
    dateRange: {
      firstDate,
      lastDate,
      formatted: formattedRange,
    },
  };
}

/**
 * PARSE TELEGRAM EXPORT (result.json)
 * Handles text split into entity arrays
 */
export function parseTelegramExport(jsonContent: string, fileName: string): ParsedChatResult {
  let data: any;
  try {
    data = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
  } catch (err) {
    throw new Error('Invalid JSON file. Please provide a valid Telegram result.json export.');
  }

  const chatName = data.name || cleanChatName(fileName);
  const rawMessages: any[] = Array.isArray(data.messages) ? data.messages : [];

  const parsedMessages: Omit<Message, 'chatId'>[] = [];

  for (const m of rawMessages) {
    if (m.type !== 'message') continue;

    const sender = m.from || m.actor || 'Classmate';
    let text = '';

    // Handle string or array of entity objects/strings
    if (typeof m.text === 'string') {
      text = m.text;
    } else if (Array.isArray(m.text)) {
      text = m.text
        .map((part: any) => {
          if (typeof part === 'string') return part;
          if (part && typeof part.text === 'string') return part.text;
          return '';
        })
        .join('');
    }

    if (!text.trim()) continue;

    const timestamp = m.date ? new Date(m.date).toISOString() : new Date().toISOString();

    parsedMessages.push({
      id: `msg-tg-${parsedMessages.length + 1}-${Date.now()}`,
      sender: sender.trim(),
      text: text.trim(),
      timestamp,
      hash: computeMessageHash(sender, timestamp, text),
    });
  }

  let firstDate: string | null = null;
  let lastDate: string | null = null;
  let formattedRange = 'Recent messages';

  if (parsedMessages.length > 0) {
    firstDate = parsedMessages[0].timestamp;
    lastDate = parsedMessages[parsedMessages.length - 1].timestamp;

    const d1 = new Date(firstDate);
    const d2 = new Date(lastDate);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    formattedRange = `${d1.toLocaleDateString('en-US', options)} – ${d2.toLocaleDateString(
      'en-US',
      options
    )}`;
  }

  return {
    chatName,
    source: 'telegram',
    messages: parsedMessages,
    totalParsed: parsedMessages.length,
    dateRange: {
      firstDate,
      lastDate,
      formatted: formattedRange,
    },
  };
}

/**
 * Handle ZIP files for WhatsApp: extract .txt inside
 */
export async function extractTextFromZip(file: File): Promise<{ text: string; innerName: string }> {
  const zip = await JSZip.loadAsync(file);

  // Look for any .txt file in the zip archive
  let txtFile: any = null;
  let chosenName = file.name;

  zip.forEach((relativePath: string, fileObj: any) => {
    if (!fileObj.dir && relativePath.toLowerCase().endsWith('.txt')) {
      if (!txtFile || relativePath.toLowerCase().includes('chat')) {
        txtFile = fileObj;
        chosenName = relativePath;
      }
    }
  });

  if (!txtFile) {
    throw new Error('No .txt chat export found inside this .zip file.');
  }

  const text = (await txtFile.async('string')) as string;
  return { text, innerName: chosenName };
}
