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
          <h1 className="text-2xl sm:text-3xl font-bold text-[#3F4A16] dark:text-[#EEF1DC]">
            Connect Chats
          </h1>
          <p className="text-sm text-[#6B7059] dark:text-[#A4AA8E] mt-1">
            Import your WhatsApp and Telegram class groups in 3 simple steps without any technical setup.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadDemoMode}
            className="px-3.5 py-2.5 rounded-xl bg-[#EEF1DC] dark:bg-[#283017] hover:bg-[#DDE3BE] dark:hover:bg-[#343C1F] text-[#3F4A16] dark:text-[#EEF1DC] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
            title="Load CSE-4 Class Group and Project Team sample chats"
          >
            <Sparkles className="w-4 h-4 text-[#6B7A2A] dark:text-[#9AAE3C]" />
            <span>Try demo mode</span>
          </button>

          <button
            onClick={() => setHowItWorksOpen(!howItWorksOpen)}
            className="px-3.5 py-2.5 rounded-xl border border-[#E3E6D3] dark:border-[#2B321A] text-[#2B2F1E] dark:text-[#EEF1DC] hover:bg-[#EEF1DC] dark:hover:bg-[#283017] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
          >
            <HelpCircle className="w-4 h-4 text-[#6B7A2A] dark:text-[#9AAE3C]" />
            <span>How It Works</span>
          </button>
        </div>
      </div>

      {/* Demo Banner if no demo chats loaded */}
      {!hasDemoData && (
        <div className="p-4 sm:p-5 rounded-3xl bg-[#EEF1DC]/60 dark:bg-[#283017]/60 border border-[#DDE3BE] dark:border-[#384221] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6B7A2A] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#3F4A16] dark:text-[#EEF1DC]">
                Don't have an export handy right now?
              </h3>
              <p className="text-xs text-[#6B7059] dark:text-[#A4AA8E]">
                Load 2 realistic sample chats: "CSE-4 Class Group" (60 messages) and "Project Team" (30 messages).
              </p>
            </div>
          </div>

          <button
            onClick={loadDemoMode}
            className="self-start sm:self-center px-4 py-2 rounded-xl bg-[#6B7A2A] hover:bg-[#5A6823] active:bg-[#4A561C] text-white text-xs font-semibold shrink-0 cursor-pointer min-h-[38px] transition-colors"
          >
            Try demo mode
          </button>
        </div>
      )}

      {/* How it works simple guide accordion */}
      {howItWorksOpen && (
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1D2112] border border-[#E3E6D3] dark:border-[#2B321A] text-[#2B2F1E] dark:text-[#EEF1DC] space-y-3 shadow-sm">
          <h3 className="font-bold text-sm text-[#3F4A16] dark:text-[#EEF1DC] flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#6B7A2A] dark:text-[#9AAE3C]" />
            How SyncPulse Imports Your Class Chats
          </h3>
          <p className="text-xs leading-relaxed text-[#6B7059] dark:text-[#A4AA8E]">
            WhatsApp and Telegram allow you to export chat logs directly as text or zip files. When you upload or share the export to SyncPulse, our local AI engine extracts deadlines, exams, and announcements while skipping casual chatter, sticker replies, and memes.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-2xl bg-[#F7F8F2] dark:bg-[#14170D] border border-[#E3E6D3] dark:border-[#2B321A]">
              <strong className="block text-[#3F4A16] dark:text-[#EEF1DC] mb-1">100% Private</strong>
              <span className="text-[#6B7059] dark:text-[#A4AA8E]">Chats are parsed directly in your browser and stored in your device's local memory.</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#F7F8F2] dark:bg-[#14170D] border border-[#E3E6D3] dark:border-[#2B321A]">
              <strong className="block text-[#3F4A16] dark:text-[#EEF1DC] mb-1">Safe Re-imports</strong>
              <span className="text-[#6B7059] dark:text-[#A4AA8E]">Export the same chat weeks later — SyncPulse only adds new messages without duplicates.</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#F7F8F2] dark:bg-[#14170D] border border-[#E3E6D3] dark:border-[#2B321A]">
              <strong className="block text-[#3F4A16] dark:text-[#EEF1DC] mb-1">Smart Deduplication</strong>
              <span className="text-[#6B7059] dark:text-[#A4AA8E]">If someone posts the same exam date twice, it appears on your calendar only once.</span>
            </div>
          </div>
        </div>
      )}

      {/* POST-IMPORT SUCCESS CARD */}
      {lastImportResult && (
        <div className="p-6 rounded-3xl bg-[#EEF1DC] dark:bg-[#283017] border border-[#DDE3BE] dark:border-[#384221] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#6B7A2A] text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#3F4A16] dark:text-[#EEF1DC] uppercase tracking-wider">
                  Import Successful
                </span>
                <span className="text-[#6B7A2A]">·</span>
                <span className="text-xs text-[#6B7059] dark:text-[#A4AA8E] capitalize">
                  {lastImportResult.source}
                </span>
              </div>

              <h2 className="text-lg font-bold text-[#2B2F1E] dark:text-[#EEF1DC]">
                {lastImportResult.chatName}
              </h2>

              <p className="text-xs text-[#6B7059] dark:text-[#A4AA8E]">
                {lastImportResult.newCount > 0 ? (
                  <>
                    <strong className="text-[#3F4A16] dark:text-[#EEF1DC]">
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
              className="px-5 py-2.5 rounded-xl bg-[#6B7A2A] hover:bg-[#5A6823] active:bg-[#4A561C] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer min-h-[44px] shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>Summarise now</span>
            </button>

            <button
              onClick={handleViewChat}
              className="px-4 py-2.5 rounded-xl border border-[#E3E6D3] dark:border-[#2B321A] bg-white dark:bg-[#1D2112] hover:bg-[#EEF1DC] dark:hover:bg-[#283017] text-[#2B2F1E] dark:text-[#EEF1DC] font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
            >
              <span>View chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* FOUR LARGE SOURCE CARDS */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#6B7059] dark:text-[#A4AA8E] mb-3">
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
            className={`p-5 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[140px] bg-white dark:bg-[#1D2112] ${
              activeSource === 'whatsapp'
                ? 'border-[#6B7A2A] shadow-md ring-2 ring-[#6B7A2A]/20'
                : 'border-[#E3E6D3] dark:border-[#2B321A] hover:border-[#6B7A2A] shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-2xl bg-[#6B7A2A] text-white flex items-center justify-center font-bold text-base shadow-xs">
                  WA
                </div>
                {activeSource === 'whatsapp' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6B7A2A] animate-pulse" />
                )}
              </div>
              <h3 className="font-bold text-base text-[#2B2F1E] dark:text-[#EEF1DC]">
                WhatsApp
              </h3>
              <p className="text-xs text-[#6B7059] dark:text-[#A4AA8E] mt-1 leading-snug">
                Export chat without media (.txt or .zip)
              </p>
            </div>

            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-[#6B7A2A] dark:text-[#9AAE3C]">
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
            className={`p-5 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[140px] bg-white dark:bg-[#1D2112] ${
              activeSource === 'telegram'
                ? 'border-[#6B7A2A] shadow-md ring-2 ring-[#6B7A2A]/20'
                : 'border-[#E3E6D3] dark:border-[#2B321A] hover:border-[#6B7A2A] shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-2xl bg-[#7E9130] text-white flex items-center justify-center font-bold text-base shadow-xs">
                  TG
                </div>
                {activeSource === 'telegram' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6B7A2A] animate-pulse" />
                )}
              </div>
              <h3 className="font-bold text-base text-[#2B2F1E] dark:text-[#EEF1DC]">
                Telegram
              </h3>
              <p className="text-xs text-[#6B7059] dark:text-[#A4AA8E] mt-1 leading-snug">
                Export chat history as JSON (result.json)
              </p>
            </div>

            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-[#6B7A2A] dark:text-[#9AAE3C]">
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
            className={`p-5 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[140px] bg-white dark:bg-[#1D2112] ${
              activeSource === 'slack'
                ? 'border-[#6B7A2A] shadow-md ring-2 ring-[#6B7A2A]/20'
                : 'border-[#E3E6D3] dark:border-[#2B321A] hover:border-[#6B7A2A] shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-2xl bg-[#5A6823] text-white flex items-center justify-center font-bold text-base shadow-xs">
                  SL
                </div>
                {activeSource === 'slack' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6B7A2A] animate-pulse" />
                )}
              </div>
              <h3 className="font-bold text-base text-[#2B2F1E] dark:text-[#EEF1DC]">
                Slack
              </h3>
              <p className="text-xs text-[#6B7059] dark:text-[#A4AA8E] mt-1 leading-snug">
                Workspace channel export (.txt or JSON)
              </p>
            </div>

            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-[#6B7A2A] dark:text-[#9AAE3C]">
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
            className={`p-5 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[140px] bg-white dark:bg-[#1D2112] ${
              activeSource === 'discord'
                ? 'border-[#6B7A2A] shadow-md ring-2 ring-[#6B7A2A]/20'
                : 'border-[#E3E6D3] dark:border-[#2B321A] hover:border-[#6B7A2A] shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-2xl bg-[#3F4A16] text-white flex items-center justify-center font-bold text-base shadow-xs">
                  DC
                </div>
                {activeSource === 'discord' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6B7A2A] animate-pulse" />
                )}
              </div>
              <h3 className="font-bold text-base text-[#2B2F1E] dark:text-[#EEF1DC]">
                Discord
              </h3>
              <p className="text-xs text-[#6B7059] dark:text-[#A4AA8E] mt-1 leading-snug">
                Channel transcript or bot export
              </p>
            </div>

            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-[#6B7A2A] dark:text-[#9AAE3C]">
              <span>Channel Sync</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </button>
        </div>
      </div>

      {/* IMPORT WORKSPACE FOR SELECTED SOURCE */}
      <div className="bg-white dark:bg-[#1D2112] rounded-3xl p-6 sm:p-8 border border-[#E3E6D3] dark:border-[#2B321A] shadow-sm space-y-6">
        {/* Source Title & Guides */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full bg-[#6B7A2A]" />
            <h2 className="text-lg font-bold text-[#3F4A16] dark:text-[#EEF1DC] capitalize">
              {activeSource === 'whatsapp'
                ? 'WhatsApp Chat Import'
                : activeSource === 'telegram'
                ? 'Telegram Chat Import'
                : `${activeSource} Chat Import`}
            </h2>
          </div>

          {/* 3-Step Guide for WhatsApp */}
          {activeSource === 'whatsapp' && (
            <div className="p-4 rounded-2xl bg-[#F7F8F2] dark:bg-[#14170D] border border-[#E3E6D3] dark:border-[#2B321A] mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7059] dark:text-[#A4AA8E] mb-3">
                How to export from WhatsApp:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <span className="text-[#2B2F1E] dark:text-[#EEF1DC]">
                    Open the class group chat in WhatsApp
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <span className="text-[#2B2F1E] dark:text-[#EEF1DC]">
                    Tap Menu &gt; More &gt; <strong>Export chat</strong> &gt; <strong>Without media</strong>
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <span className="text-[#2B2F1E] dark:text-[#EEF1DC]">
                    Share directly to this app or upload the <strong>.txt / .zip</strong> file below
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 3-Step Guide for Telegram */}
          {activeSource === 'telegram' && (
            <div className="p-4 rounded-2xl bg-[#F7F8F2] dark:bg-[#14170D] border border-[#E3E6D3] dark:border-[#2B321A] mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7059] dark:text-[#A4AA8E] mb-3">
                How to export from Telegram Desktop:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <span className="text-[#2B2F1E] dark:text-[#EEF1DC]">
                    Open the chat in Telegram Desktop
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <span className="text-[#2B2F1E] dark:text-[#EEF1DC]">
                    Click ⋮ top-right &gt; <strong>Export chat history</strong>
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <span className="text-[#2B2F1E] dark:text-[#EEF1DC]">
                    Select <strong>Machine-readable JSON</strong> and upload <strong>result.json</strong> below
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Slack & Discord Guide */}
          {(activeSource === 'slack' || activeSource === 'discord') && (
            <div className="p-4 rounded-2xl bg-[#F7F8F2] dark:bg-[#14170D] border border-[#E3E6D3] dark:border-[#2B321A] mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7059] dark:text-[#A4AA8E] mb-2">
                Import from {activeSource}:
              </h3>
              <p className="text-xs text-[#6B7059] dark:text-[#A4AA8E] leading-relaxed">
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
              ? 'border-[#6B7A2A] bg-[#EEF1DC]/60 dark:bg-[#283017]/60 scale-[1.01]'
              : 'border-[#E3E6D3] dark:border-[#2B321A] hover:border-[#6B7A2A] hover:bg-[#EEF1DC]/30 dark:hover:bg-[#283017]/30 bg-[#F7F8F2] dark:bg-[#14170D]'
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

          <div className="w-16 h-16 rounded-3xl bg-[#EEF1DC] dark:bg-[#283017] text-[#6B7A2A] dark:text-[#9AAE3C] flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
            {activeSource === 'whatsapp' ? (
              <FileArchive className="w-8 h-8" />
            ) : activeSource === 'telegram' ? (
              <FileCode2 className="w-8 h-8" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[#2B2F1E] dark:text-[#EEF1DC] mb-1">
            {isProcessing ? 'Parsing chat export...' : 'Drag and drop your exported chat here'}
          </h3>

          <p className="text-xs sm:text-sm text-[#6B7059] dark:text-[#A4AA8E] mb-5 max-w-md">
            {activeSource === 'whatsapp'
              ? 'Accepts WhatsApp .txt exports or .zip files (we automatically extract the text inside)'
              : activeSource === 'telegram'
              ? 'Accepts Telegram result.json chat export files'
              : 'Accepts .txt, .json, or .zip channel exports'}
          </p>

          <button
            type="button"
            disabled={isProcessing}
            className="px-6 py-3 bg-[#6B7A2A] hover:bg-[#5A6823] active:bg-[#4A561C] text-white font-medium text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer min-h-[44px] flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{isProcessing ? 'Processing...' : 'Choose file'}</span>
          </button>
        </div>

        {/* Error notice if file parsing failed */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-[#FEF2F2] dark:bg-[#2A1215] border border-[#FCA5A5] dark:border-[#7F1D1D] flex items-start gap-3 text-[#C0392B] text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold mb-0.5">Could not import file</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Android Share Target Tip */}
        <div className="flex items-center gap-2.5 text-xs text-[#6B7059] dark:text-[#A4AA8E] pt-2 border-t border-[#E3E6D3] dark:border-[#2B321A]">
          <Share2 className="w-4 h-4 text-[#6B7A2A] shrink-0" />
          <span>
            <strong>Android Tip:</strong> In WhatsApp, when you tap "Export chat", you can directly select <strong>SyncPulse</strong> from your phone's share menu!
          </span>
        </div>
      </div>

      {/* CONNECTED CHATS LIST */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#3F4A16] dark:text-[#EEF1DC]">
              Connected Chats ({chats.length})
            </h2>
            <p className="text-xs text-[#6B7059] dark:text-[#A4AA8E]">
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
                  className="bg-white dark:bg-[#1D2112] rounded-3xl p-5 border border-[#E3E6D3] dark:border-[#2B321A] shadow-sm flex flex-col justify-between hover:border-[#6B7A2A] dark:hover:border-[#9AAE3C] transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-xs uppercase shadow-xs shrink-0 ${
                            chat.source === 'whatsapp'
                              ? 'bg-[#6B7A2A]'
                              : chat.source === 'telegram'
                              ? 'bg-[#7E9130]'
                              : chat.source === 'slack'
                              ? 'bg-[#5A6823]'
                              : chat.source === 'discord'
                              ? 'bg-[#3F4A16]'
                              : 'bg-[#6B7A2A]'
                          }`}
                        >
                          {chat.source.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7A2A] dark:text-[#9AAE3C]">
                              {chat.source}
                            </span>
                            {isDemo && (
                              <>
                                <span className="text-[#6B7059]">·</span>
                                <span className="text-[10px] font-semibold text-[#6B7A2A] dark:text-[#9AAE3C] bg-[#EEF1DC] dark:bg-[#283017] px-1.5 py-0.2 rounded-md flex items-center gap-1">
                                  <Sparkles className="w-2.5 h-2.5" /> Demo data
                                </span>
                              </>
                            )}
                          </div>
                          <h3 className="font-bold text-base text-[#2B2F1E] dark:text-[#EEF1DC] mt-0.5 leading-snug">
                            {chat.name}
                          </h3>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteChat(chat.id)}
                        aria-label={`Disconnect ${chat.name}`}
                        className="p-2 text-[#6B7059] hover:text-[#C0392B] hover:bg-[#FEF2F2] dark:hover:bg-[#2A1215] rounded-xl transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#6B7059] dark:text-[#A4AA8E] mt-2">
                      <span>{chatMessagesCount} messages stored</span>
                      <span>·</span>
                      <span>{chat.processedMessageHashes.length} hashes tracked</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#E3E6D3] dark:border-[#2B321A] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-[#6B7059] dark:text-[#A4AA8E]">
                      <Clock className="w-3.5 h-3.5 text-[#6B7059]" />
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
                        className="px-2.5 py-1 rounded-lg bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] font-semibold text-xs hover:bg-[#DDE3BE] cursor-pointer min-h-[30px]"
                      >
                        Summarise
                      </button>
                      <button
                        onClick={() => setActiveTab('chats')}
                        className="text-xs font-semibold text-[#6B7A2A] dark:text-[#9AAE3C] hover:underline cursor-pointer min-h-[30px] flex items-center"
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
