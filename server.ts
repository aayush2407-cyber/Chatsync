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

    const systemInstruction = `You are an assistant that reads student group chat messages and extracts only important information. Classify each relevant message into exactly one category: 'date' (exams, events, meetings, holidays, important days), 'assignment' (homework, submissions, projects, labs, anything students must do), 'notice' (announcements, rule changes, fees, circulars, timetable changes). Ignore casual talk, greetings, memes and replies like 'ok' or 'thanks'. Resolve relative dates such as 'tomorrow' or 'next Monday' using today's date, which is ${todayStr}, and the message timestamp. Return ONLY valid JSON, no markdown, in this shape: { items: [{ type, title, details, deadline (ISO 8601 or null), sender, sourceMessage, priority }], casualCount: number, casualHighlights: string[] (max 3 short lines) }. If a message updates an earlier one (for example a changed deadline), return the latest version only.`;

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
            ? parsed.items.map((it: any) => ({
                type: ['date', 'assignment', 'notice'].includes(it.type) ? it.type : 'notice',
                title: String(it.title || 'Untitled Notice').slice(0, 100),
                details: String(it.details || it.title || ''),
                deadline: it.deadline && typeof it.deadline === 'string' ? it.deadline : null,
                sender: String(it.sender || 'Classmate'),
                sourceMessage: String(it.sourceMessage || it.details || it.title || ''),
                priority: ['low', 'medium', 'high'].includes(it.priority) ? it.priority : 'medium',
              }))
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
