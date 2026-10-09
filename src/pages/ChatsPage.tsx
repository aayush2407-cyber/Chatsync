import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Plus,
  Trash2,
  CheckCircle,
  Calendar,
  Bell,
  Sparkles,
  X,
  Send,
  MessageCircle,
  ArrowLeft,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useSyncPulse } from '../context/SyncPulseContext';
import { ChatSource, ExtractedItemType, ItemPriority, Message, ExtractedItem, Chat } from '../types';
import { EmptyState } from '../components/EmptyState';

export const ChatsPage: React.FC = () => {
  const {
    messages,
    chats,
    addMessages,
    deleteMessage,
    addItems,
    items,
    summaries,
    loadDemoMode,
    summariseChatAI,
    summariseAllChatsAI,
    isSummarising,
    setActiveSummaryView,
    setActiveTab,
    selectedChatId,
    setSelectedChatId,
  } = useSyncPulse();

  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | ChatSource>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for paste/simulate message
  const [senderName, setSenderName] = useState('Prof. Alan Turing');
  const [newChatId, setNewChatId] = useState(chats[0]?.id || 'custom-chat');
  const [messageText, setMessageText] = useState(
    'Reminder: Problem Set 3 is due this Friday at 11:59 PM. Submit your solution via Canvas!'
  );
  const [selectedType, setSelectedType] = useState<ExtractedItemType>('assignment');
  const [selectedPriority, setSelectedPriority] = useState<ItemPriority>('medium');

  const selectedChat = chats.find((c) => c.id === selectedChatId) || null;

  // Calculate unsummarised count for a given chat
  const getUnsummarisedCount = (chat: Chat) => {
    const chatMsgs = messages.filter((m) => m.chatId === chat.id);
    const summarisedSet = new Set(chat.summarisedMessageIds || []);
    return chatMsgs.filter((m) => !summarisedSet.has(m.id)).length;
  };

  const getChatMessages = (cId: string) => messages.filter((m) => m.chatId === cId);

  // Filter messages in selected chat
  const currentChatMessages = selectedChat
    ? getChatMessages(selectedChat.id).filter((msg) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return msg.text.toLowerCase().includes(q) || msg.sender.toLowerCase().includes(q);
      })
    : [];

  // Filter chats in chat list view
  const filteredChats = chats.filter((c) => {
    const matchesSource = sourceFilter === 'all' || c.source === sourceFilter;
    const matchesSearch =
      !searchQuery.trim() || c.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSource && matchesSearch;
  });

  const handleCreateMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const chosenChatId = selectedChatId || newChatId || chats[0]?.id || 'chat-demo';
    const nowIso = new Date().toISOString();
    const simpleHash = `h-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      chatId: chosenChatId,
      sender: senderName.trim() || 'Classmate',
      text: messageText.trim(),
      timestamp: nowIso,
      hash: simpleHash,
    };

    addMessages([newMsg]);

    // Also auto-extract item
    const newItem: ExtractedItem = {
      id: `item-${Date.now()}`,
      chatId: chosenChatId,
      type: selectedType,
      title: messageText.slice(0, 48),
      details: messageText,
      sender: newMsg.sender,
      sourceMessage: newMsg.text,
      deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
      done: false,
      createdAt: nowIso,
      priority: selectedPriority,
    };

    addItems([newItem]);

    setMessageText('');
    setIsModalOpen(false);
  };

  const handleConvert = (msg: Message, type: ExtractedItemType) => {
    const nowIso = new Date().toISOString();
    const candidateItem: ExtractedItem = {
      id: `item-${Date.now()}`,
      chatId: msg.chatId,
      type,
      title: msg.text.slice(0, 50),
      details: msg.text,
      sender: msg.sender,
      sourceMessage: msg.text,
      deadline: new Date(Date.now() + 86400000 * 4).toISOString(),
      done: false,
      createdAt: nowIso,
      priority: 'medium',
    };

    addItems([candidateItem]);
  };

  const handleOpenLatestSummary = (chat: Chat) => {
    const summary = summaries.find((s) => s.chatId === chat.id);
    const chatItems = items.filter((i) => i.chatId === chat.id);
    if (summary) {
      setActiveSummaryView({
        summary,
        items: chatItems,
        chatName: chat.name,
      });
    } else {
      summariseChatAI(chat.id);
    }
  };

  // If no chats exist at all
  if (chats.length === 0) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Class Chats
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Read messages across your WhatsApp, Telegram, Slack, and Discord groups.
          </p>
        </div>

        <EmptyState
          icon={MessageSquare}
          text="You haven't linked any study groups yet."
          actionText="Connect a Chat"
          onAction={() => setActiveTab('connect')}
        />
      </div>
    );
  }

  // 1. OPENED CHAT VIEW: If a chat is selected
  if (selectedChat) {
    const unsummarisedCount = getUnsummarisedCount(selectedChat);
    const chatSummary = summaries.find((s) => s.chatId === selectedChat.id);
    const chatItems = items.filter((i) => i.chatId === selectedChat.id);

    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-150">
        {/* Back and Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedChatId(null)}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 shadow-xs"
              title="Back to all chats"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {selectedChat.source}
                </span>
                {(selectedChat.source === 'demo' || selectedChat.id.startsWith('chat-demo')) && (
                  <>
                    <span className="text-slate-400">·</span>
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded-md flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Demo data
                    </span>
                  </>
                )}
                <span className="text-slate-400">·</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {currentChatMessages.length} messages
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                {selectedChat.name}
              </h1>
            </div>
          </div>

          {/* Prominent Action Strip */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {chatSummary && (
              <button
                type="button"
                onClick={() => handleOpenLatestSummary(selectedChat)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold cursor-pointer min-h-[44px] flex items-center gap-1.5 transition-colors"
              >
                <span>View Summary</span>
              </button>
            )}

            {/* PROMINENT SUMMARISE BUTTON */}
            <button
              type="button"
              onClick={() => summariseChatAI(selectedChat.id)}
              disabled={isSummarising}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer min-h-[44px]"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>
                {unsummarisedCount > 0
                  ? `Summarise (${unsummarisedCount} new)`
                  : 'Summarise'}
              </span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Add a message"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Within Chat */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`Search messages in ${selectedChat.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
          />
        </div>

        {/* Message Stream */}
        {currentChatMessages.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 my-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {searchQuery ? 'No messages match your search in this chat.' : 'No messages in this chat yet.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium min-h-[40px] cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {currentChatMessages.map((msg) => {
              const isSummarised = selectedChat.summarisedMessageIds?.includes(msg.id);
              const isExtracted = chatItems.some((i) => i.sourceMessage === msg.text);

              return (
                <div
                  key={msg.id}
                  className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-800 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                        {msg.sender.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {msg.sender}
                          </span>
                          {isSummarised ? (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                              Summarised
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                              New
                            </span>
                          )}
                          {isExtracted && (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                              <CheckCircle className="w-3 h-3" /> Extracted
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteMessage(msg.id)}
                      aria-label="Delete message"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed pl-10 whitespace-pre-wrap">
                    {msg.text}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-1.5 pl-10 flex-wrap">
                    <button
                      onClick={() => handleConvert(msg, 'assignment')}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors flex items-center gap-1 cursor-pointer min-h-[32px]"
                      title="Save as assignment task"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>To Assignment</span>
                    </button>
                    <button
                      onClick={() => handleConvert(msg, 'date')}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors flex items-center gap-1 cursor-pointer min-h-[32px]"
                      title="Save as important date"
                    >
                      <Calendar className="w-3 h-3" />
                      <span>To Date</span>
                    </button>
                    <button
                      onClick={() => handleConvert(msg, 'notice')}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors flex items-center gap-1 cursor-pointer min-h-[32px]"
                      title="Save as notice"
                    >
                      <Bell className="w-3 h-3" />
                      <span>To Notice</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal for adding message */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add Class Message
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateMessage} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Sender Name
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Message Text
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 min-h-[40px] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold min-h-[40px] cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Message</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. CHATS LIST VIEW: When no single chat is open
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Class Chats
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Select a class group to view messages and generate an AI to-do summary.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={summariseAllChatsAI}
            disabled={isSummarising}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer min-h-[44px]"
            title="Summarise all active class chats with Gemini"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Summarise All Chats</span>
          </button>

          <button
            onClick={loadDemoMode}
            className="px-3.5 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
            title="Load CSE-4 and Project Team sample chats"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Try demo mode</span>
          </button>
        </div>
      </div>

      {/* Filter by Platform and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search class chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'whatsapp', 'telegram', 'slack', 'discord'] as const).map((src) => (
            <button
              key={src}
              onClick={() => setSourceFilter(src)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer min-h-[38px] ${
                sourceFilter === src
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {src}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Chats */}
      {filteredChats.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 my-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            No chats found matching your search.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSourceFilter('all');
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium min-h-[40px] cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredChats.map((chat) => {
            const chatMsgs = getChatMessages(chat.id);
            const unsummarisedCount = getUnsummarisedCount(chat);
            const isDemo = chat.source === 'demo' || chat.id.startsWith('chat-demo');
            const summary = summaries.find((s) => s.chatId === chat.id);

            return (
              <div
                key={chat.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm uppercase shadow-xs shrink-0 ${
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

                        <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mt-0.5 leading-snug">
                          {chat.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    <span>{chatMsgs.length} messages</span>
                    <span>·</span>
                    {unsummarisedCount > 0 ? (
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                        {unsummarisedCount} unsummarised
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                        All summarised ✓
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {summary ? (
                    <button
                      onClick={() => handleOpenLatestSummary(chat)}
                      className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer min-h-[40px] flex items-center gap-1"
                    >
                      <span>View Summary</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">Ready to summarise</span>
                  )}

                  <div className="flex items-center gap-2">
                    {/* Summarise button */}
                    <button
                      type="button"
                      onClick={() => summariseChatAI(chat.id)}
                      disabled={isSummarising}
                      className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer min-h-[40px]"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Summarise</span>
                    </button>

                    {/* Open Chat */}
                    <button
                      type="button"
                      onClick={() => setSelectedChatId(chat.id)}
                      className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer min-h-[40px]"
                    >
                      <span>Open</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
