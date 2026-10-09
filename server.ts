import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '15mb' }));

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Initialize Google GenAI with recommended telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ChatMessageInput {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

interface SummariseBatchRequest {
  batchIndex: number;
  totalBatches: number;
  today: string;
  messages: ChatMessageInput[];
}

/**
 * Safely parse JSON output from model, stripping any potential markdown code fences.
 */
function cleanAndParseJSON(raw: string): any {
  if (!raw) throw new Error('Empty response from model');
  let cleaned = raw.trim();
  // Strip markdown code fences if present
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  cleaned = cleaned.trim();
  return JSON.parse(cleaned);
}

/**
 * POST /api/summarise-batch
 * Accepts a batch of messages and calls Gemini to extract to-dos, dates, and notices.
 */
app.post('/api/summarise-batch', async (req: Request, res: Response) => {
  try {
    const { batchIndex, totalBatches, today, messages } = req.body as SummariseBatchRequest;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.json({
        success: true,
        data: {
          items: [],
          casualCount: 0,
          casualHighlights: [],
        },
      });
    }

    const todayStr = today || new Date().toISOString().split('T')[0];

    const systemInstruction = `You are an assistant that reads student group chat messages and extracts only important academic and schedule information. Classify each relevant message into exactly one category:
- 'date': exams, major submission deadlines, holidays, or milestones without a scheduled call/meeting.
- 'meeting': classes, lectures, viva sessions, study group meetups, Zoom/Teams/Meet video calls, project syncs, office hours, and events with a specific time (e.g., "meet at 4pm in the library", "Zoom call tomorrow 7pm", "viva postponed to 3pm").
- 'assignment': homework, submissions, projects, labs, problem sets, anything students must complete.
- 'notice': campus announcements, rule changes, fee circulars, timetable changes.

For 'meeting' items:
- 'startTime': ISO 8601 timestamp string (e.g., "2026-10-15T16:00:00.000Z") calculated using today's date (${todayStr}) and message timestamp.
- 'endTime': ISO 8601 timestamp string or null if not stated.
- 'location': Physical room/building or virtual platform (e.g., "Library Room 302", "Hall 4", "Zoom"), or null.
- 'meetingLink': URL for online calls (e.g. https://zoom.us/j/..., https://meet.google.com/...) or null.
- 'attendees': Array of attendee names or groups mentioned (e.g., ["TA David", "Group 3"]), or [].
- 'isAllDay': Set to true IF only a date was given with no specific hour/time.
- 'isRescheduled': Set to true IF a message updates/changes an earlier meeting time (e.g., "meeting shifted to 5pm", "call rescheduled to Friday", "moved from 4pm to 5pm"). Include the updated startTime.

Ignore casual chatter, greetings, memes, and short replies like 'ok' or 'thanks'. Resolve relative dates such as 'tomorrow' or 'next Monday' using today's date (${todayStr}).

Return ONLY valid JSON, no markdown codeblocks, matching this JSON schema:
{
  "items": [
    {
      "type": "date" | "meeting" | "assignment" | "notice",
      "title": string,
      "details": string,
      "deadline": string | null,
      "startTime": string | null,
      "endTime": string | null,
      "location": string | null,
      "meetingLink": string | null,
      "attendees": string[],
      "isAllDay": boolean,
      "isRescheduled": boolean,
      "sender": string,
      "sourceMessage": string,
      "priority": "low" | "medium" | "high"
    }
  ],
  "casualCount": number,
  "casualHighlights": string[] (max 3 short lines)
}`;

    // Format chat messages for model
    const formattedMessages = messages
      .map((m, idx) => `[${idx + 1}] (${m.timestamp}) ${m.sender}: ${m.text}`)
      .join('\n');

    const prompt = `Student chat messages to analyze (Batch ${Number(batchIndex) + 1} of ${totalBatches}):\n\n${formattedMessages}`;

    let parsedResult: any = null;
    let attempts = 0;

    // Retry once if invalid JSON or transient failure
    while (attempts < 2 && !parsedResult) {
      attempts++;
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const rawText = response.text || '';
        const parsed = cleanAndParseJSON(rawText);

        if (parsed && typeof parsed === 'object') {
          // Normalize items
          const items = Array.isArray(parsed.items)
            ? parsed.items.map((it: any) => {
                const itemType = ['date', 'assignment', 'notice', 'meeting'].includes(it.type)
                  ? it.type
                  : 'notice';
                const startTime =
                  it.startTime && typeof it.startTime === 'string' ? it.startTime : null;
                const deadline =
                  it.deadline && typeof it.deadline === 'string'
                    ? it.deadline
                    : itemType === 'meeting' && startTime
                    ? startTime
                    : null;

                return {
                  type: itemType,
                  title: String(it.title || 'Untitled Notice').slice(0, 100),
                  details: String(it.details || it.title || ''),
                  deadline,
                  startTime,
                  endTime: it.endTime && typeof it.endTime === 'string' ? it.endTime : null,
                  location: it.location && typeof it.location === 'string' ? it.location : null,
                  meetingLink:
                    it.meetingLink && typeof it.meetingLink === 'string' ? it.meetingLink : null,
                  attendees: Array.isArray(it.attendees)
                    ? it.attendees.map((a: any) => String(a).trim()).filter(Boolean)
                    : [],
                  isAllDay: Boolean(it.isAllDay),
                  isRescheduled: Boolean(it.isRescheduled),
                  sender: String(it.sender || 'Classmate'),
                  sourceMessage: String(it.sourceMessage || it.details || it.title || ''),
                  priority: ['low', 'medium', 'high'].includes(it.priority)
                    ? it.priority
                    : 'medium',
                };
              })
            : [];

          parsedResult = {
            items,
            casualCount: typeof parsed.casualCount === 'number' ? parsed.casualCount : 0,
            casualHighlights: Array.isArray(parsed.casualHighlights)
              ? parsed.casualHighlights.slice(0, 3).map((h: any) => String(h))
              : [],
          };
        }
      } catch (callErr) {
        if (attempts >= 2) {
          throw callErr;
        }
      }
    }

    if (!parsedResult) {
      throw new Error('Failed to obtain parsed result from model');
    }

    return res.json({
      success: true,
      data: parsedResult,
    });
  } catch (err) {
    // Never expose raw API errors or keys to client
    return res.status(500).json({
      success: false,
      error: "Couldn't summarise right now. Try again.",
    });
  }
});

// Configure Vite middleware in development or serve built files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`SyncPulse server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
