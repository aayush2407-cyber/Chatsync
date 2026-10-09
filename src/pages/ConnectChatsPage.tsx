import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  FileArchive,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Radio,
  Trash2,
  Clock,
  MessageSquare,
  AlertCircle,
  Share2,
  FileCode2,
  Send,
  Hash,
} from 'lucide-react';
import { useSyncPulse } from '../context/SyncPulseContext';
import { ChatSource } from '../types';
import {
  parseWhatsAppExport,
  parseTelegramExport,
  extractTextFromZip,
  cleanChatName,
} from '../utils/chatParsers';
import { ImportSummaryResult } from '../context/SyncPulseContext';
import { EmptyState } from '../components/EmptyState';

export const ConnectChatsPage: React.FC = () => {
  const {
    chats,
    messages,
    deleteChat,
    loadDemoMode,
    hasDemoData,
    importChatFromParser,
    summarizeChat,
    setActiveTab,
    showToast,
  } = useSyncPulse();

  const [activeSource, setActiveSource] = useState<ChatSource>('whatsapp');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  // Success Card state after import
  const [lastImportResult, setLastImportResult] = useState<ImportSummaryResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process incoming File (.txt, .zip, or .json)
  const processImportFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const fileName = file.name;
      const lowerName = fileName.toLowerCase();

      if (activeSource === 'whatsapp') {
        let textContent = '';
        let targetName = fileName;

        if (lowerName.endsWith('.zip')) {
          const extracted = await extractTextFromZip(file);
          textContent = extracted.text;
          // Prefer outer zip name for chat name if inner is generic like _chat.txt
          targetName = fileName;
        } else if (lowerName.endsWith('.txt')) {
          textContent = await file.text();
        } else {
          throw new Error('Please upload a WhatsApp .txt export or .zip file.');
        }

        if (!textContent.trim()) {
          throw new Error('The selected WhatsApp export file appears to be empty.');
        }

        const parsed = parseWhatsAppExport(textContent, targetName);
        if (parsed.messages.length === 0) {
          throw new Error(
            'Could not find any messages in this file. Please verify it is a valid WhatsApp chat export.'
          );
        }

        const result = importChatFromParser(parsed);
        setLastImportResult(result);
      } else if (activeSource === 'telegram') {
        if (!lowerName.endsWith('.json')) {
          throw new Error('Please upload Telegram’s exported result.json file.');
        }

        const jsonText = await file.text();
        const parsed = parseTelegramExport(jsonText, fileName);

        if (parsed.messages.length === 0) {
          throw new Error(
            'Could not find any messages in this JSON file. Please make sure you exported chat history in Telegram Desktop.'
          );
        }

        const result = importChatFromParser(parsed);
        setLastImportResult(result);
      } else {
        // Slack / Discord generic text or JSON import
        const textContent = await file.text();
        const parsed = parseWhatsAppExport(textContent, fileName);
        parsed.source = activeSource;
        const result = importChatFromParser(parsed);
        setLastImportResult(result);
      }
    } catch (err: any) {
      console.error('Import error:', err);
      setErrorMessage(err.message || 'Failed to parse chat file. Please check the file format.');
      showToast(err.message || 'Import failed');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImportFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImportFile(file);
    }
  };

  const handleSummariseNow = () => {
    if (!lastImportResult) return;
    summarizeChat(lastImportResult.chatId);
    setActiveTab('dashboard');
  };

  const handleViewChat = () => {
    setActiveTab('chats');
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Connect Chats
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Import your WhatsApp and Telegram class groups in 3 simple steps without any technical setup.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadDemoMode}
            className="px-3.5 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
            title="Load CSE-4 Class Group and Project Team sample chats"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Try demo mode</span>
          </button>

          <button
            onClick={() => setHowItWorksOpen(!howItWorksOpen)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
          >
            <HelpCircle className="w-4 h-4 text-indigo-500" />
            <span>How It Works</span>
          </button>
        </div>
      </div>

      {/* Demo Banner if no demo chats loaded */}
      {!hasDemoData && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-200/60 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Don't have an export handy right now?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Load 2 realistic sample chats: "CSE-4 Class Group" (60 messages) and "Project Team" (30 messages).
              </p>
            </div>
          </div>

          <button
            onClick={loadDemoMode}
            className="self-start sm:self-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shrink-0 cursor-pointer min-h-[38px] transition-colors"
          >
            Try demo mode
          </button>
        </div>
      )}

      {/* How it works simple guide accordion */}
      {howItWorksOpen && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 space-y-3 shadow-sm">
          <h3 className="font-bold text-sm text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
            <Radio className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            How SyncPulse Imports Your Class Chats
          </h3>
          <p className="text-xs leading-relaxed">
            WhatsApp and Telegram allow you to export chat logs directly as text or zip files. When you upload or share the export to SyncPulse, our local AI engine extracts deadlines, exams, and announcements while skipping casual chatter, sticker replies, and memes.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <strong className="block text-slate-900 dark:text-white mb-1">100% Private</strong>
              <span>Chats are parsed directly in your browser and stored in your device's local memory.</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <strong className="block text-slate-900 dark:text-white mb-1">Safe Re-imports</strong>
              <span>Export the same chat weeks later — SyncPulse only adds new messages without duplicates.</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <strong className="block text-slate-900 dark:text-white mb-1">Smart Deduplication</strong>
              <span>If someone posts the same exam date twice, it appears on your calendar only once.</span>
            </div>
          </div>
        </div>
      )}

      {/* POST-IMPORT SUCCESS CARD */}
      {lastImportResult && (
        <div className="p-6 rounded-3xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  Import Successful
                </span>
                <span className="text-emerald-400">·</span>
                <span className="text-xs text-slate-600 dark:text-slate-300 capitalize">
                  {lastImportResult.source}
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {lastImportResult.chatName}
              </h2>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                {lastImportResult.newCount > 0 ? (
                  <>
                    <strong className="text-emerald-700 dark:text-emerald-400">
                      {lastImportResult.newCount} new messages added
                    </strong>
                    {lastImportResult.existingCount > 0 && (
                      <span>, {lastImportResult.existingCount} already processed</span>
                    )}
                  </>
                ) : (
                  <span>All {lastImportResult.existingCount} messages were already processed.</span>
                )}
                {' · '}
                <span>Date range: {lastImportResult.dateRange}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={handleSummariseNow}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer min-h-[44px] shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>Summarise now</span>
            </button>

            <button
              onClick={handleViewChat}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
            >
              <span>View chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* FOUR LARGE SOURCE CARDS */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">
          1. Choose Your Chat Source
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: WhatsApp */}
          <button
            type="button"
            onClick={() => {
              setActiveSource('whatsapp');
              setErrorMessage(null);
            }}
            className={`p-5 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[140px] ${
              activeSource === 'whatsapp'
                ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/20'
                : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold text-base shadow-xs">
                  WA
                </div>
                {activeSource === 'whatsapp' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                WhatsApp
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                Export chat without media (.txt or .zip)
              </p>
            </div>

            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Ready to Import</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </button>

          {/* Card 2: Telegram */}
          <button
            type="button"
            onClick={() => {
              setActiveSource('telegram');
              setErrorMessage(null);
            }}
            className={`p-5 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[140px] ${
              activeSource === 'telegram'
                ? 'border-sky-500 bg-sky-50/40 dark:bg-sky-950/20 shadow-md ring-2 ring-sky-500/20'
                : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-bold text-base shadow-xs">
                  TG
                </div>
                {activeSource === 'telegram' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                )}
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Telegram
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                Export chat history as JSON (result.json)
              </p>
            </div>

            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
              <span>Ready to Import</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </button>

          {/* Card 3: Slack */}
          <button
            type="button"
            onClick={() => {
              setActiveSource('slack');
              setErrorMessage(null);
            }}
            className={`p-5 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[140px] ${
              activeSource === 'slack'
                ? 'border-violet-500 bg-violet-50/40 dark:bg-violet-950/20 shadow-md ring-2 ring-violet-500/20'
                : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-2xl bg-violet-500 text-white flex items-center justify-center font-bold text-base shadow-xs">
                  SL
                </div>
                {activeSource === 'slack' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
                )}
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Slack
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                Workspace channel export (.txt or JSON)
              </p>
            </div>

            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-violet-600 dark:text-violet-400">
              <span>Channel Sync</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </button>

          {/* Card 4: Discord */}
          <button
            type="button"
            onClick={() => {
              setActiveSource('discord');
              setErrorMessage(null);
            }}
            className={`p-5 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[140px] ${
              activeSource === 'discord'
                ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-md ring-2 ring-indigo-500/20'
                : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                  DC
                </div>
                {activeSource === 'discord' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                )}
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Discord
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                Channel transcript or bot export
              </p>
            </div>

            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
              <span>Channel Sync</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </button>
        </div>
      </div>

      {/* IMPORT WORKSPACE FOR SELECTED SOURCE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        {/* Source Title & Guides */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full bg-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white capitalize">
              {activeSource === 'whatsapp'
                ? 'WhatsApp Chat Import'
                : activeSource === 'telegram'
                ? 'Telegram Chat Import'
                : `${activeSource} Chat Import`}
            </h2>
          </div>

          {/* 3-Step Guide for WhatsApp */}
          {activeSource === 'whatsapp' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                How to export from WhatsApp:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">
                    Open the class group chat in WhatsApp
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">
                    Tap Menu &gt; More &gt; <strong>Export chat</strong> &gt; <strong>Without media</strong>
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">
                    Share directly to this app or upload the <strong>.txt / .zip</strong> file below
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 3-Step Guide for Telegram */}
          {activeSource === 'telegram' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                How to export from Telegram Desktop:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">
                    Open the chat in Telegram Desktop
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">
                    Click ⋮ top-right &gt; <strong>Export chat history</strong>
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">
                    Select <strong>Machine-readable JSON</strong> and upload <strong>result.json</strong> below
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Slack & Discord Guide */}
          {(activeSource === 'slack' || activeSource === 'discord') && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Import from {activeSource}:
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Upload your exported channel log as a text (.txt) or JSON (.json) file. SyncPulse will parse timestamps, sender names, and automatically extract assignments and deadlines.
              </p>
            </div>
          )}
        </div>

        {/* DRAG AND DROP ZONE */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
            isDragging
              ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 bg-slate-50/30 dark:bg-slate-900/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={
              activeSource === 'whatsapp'
                ? '.txt,.zip,text/plain,application/zip,application/x-zip-compressed'
                : activeSource === 'telegram'
                ? '.json,application/json'
                : '.txt,.json,.zip'
            }
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
            {activeSource === 'whatsapp' ? (
              <FileArchive className="w-8 h-8" />
            ) : activeSource === 'telegram' ? (
              <FileCode2 className="w-8 h-8" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
            {isProcessing ? 'Parsing chat export...' : 'Drag and drop your exported chat here'}
          </h3>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-5 max-w-md">
            {activeSource === 'whatsapp'
              ? 'Accepts WhatsApp .txt exports or .zip files (we automatically extract the text inside)'
              : activeSource === 'telegram'
              ? 'Accepts Telegram result.json chat export files'
              : 'Accepts .txt, .json, or .zip channel exports'}
          </p>

          <button
            type="button"
            disabled={isProcessing}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer min-h-[44px] flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{isProcessing ? 'Processing...' : 'Choose file'}</span>
          </button>
        </div>

        {/* Error notice if file parsing failed */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-rose-800 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold mb-0.5">Could not import file</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Android Share Target Tip */}
        <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Share2 className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>
            <strong>Android Tip:</strong> In WhatsApp, when you tap "Export chat", you can directly select <strong>SyncPulse</strong> from your phone's share menu!
          </span>
        </div>
      </div>

      {/* CONNECTED CHATS LIST */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Connected Chats ({chats.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active class channels being monitored for deadlines and to-dos
            </p>
          </div>
        </div>

        {chats.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            text="You haven't linked any study groups yet."
            actionText="Try Demo Mode"
            onAction={loadDemoMode}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chats.map((chat) => {
              const chatMessagesCount = messages.filter((m) => m.chatId === chat.id).length;
              const isDemo = chat.source === 'demo' || chat.id.startsWith('chat-demo');

              return (
                <div
                  key={chat.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-200 dark:hover:border-indigo-800 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-xs uppercase shadow-xs shrink-0 ${
                            chat.source === 'whatsapp'
                              ? 'bg-emerald-500'
                              : chat.source === 'telegram'
                              ? 'bg-sky-500'
                              : chat.source === 'slack'
                              ? 'bg-violet-500'
                              : chat.source === 'discord'
                              ? 'bg-indigo-600'
                              : 'bg-amber-500'
                          }`}
                        >
                          {chat.source.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                              {chat.source}
                            </span>
                            {isDemo && (
                              <>
                                <span className="text-slate-400">·</span>
                                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded-md flex items-center gap-1">
                                  <Sparkles className="w-2.5 h-2.5" /> Demo data
                                </span>
                              </>
                            )}
                          </div>
                          <h3 className="font-bold text-base text-slate-900 dark:text-white mt-0.5 leading-snug">
                            {chat.name}
                          </h3>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteChat(chat.id)}
                        aria-label={`Disconnect ${chat.name}`}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
                      <span>{chatMessagesCount} messages stored</span>
                      <span>·</span>
                      <span>{chat.processedMessageHashes.length} hashes tracked</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Imported {new Date(chat.lastImportedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          summarizeChat(chat.id);
                          setActiveTab('dashboard');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold text-xs hover:bg-indigo-100 cursor-pointer min-h-[30px]"
                      >
                        Summarise
                      </button>
                      <button
                        onClick={() => setActiveTab('chats')}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer min-h-[30px] flex items-center"
                      >
                        View &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
