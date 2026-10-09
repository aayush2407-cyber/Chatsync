import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarClock,
  Link2,
  MessageSquare,
  Calendar,
  CheckSquare,
  Bell,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Sparkles,
  Menu,
  X,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useSyncPulse } from '../context/SyncPulseContext';
import { NavTab } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ElementType;
  badgeCount?: number;
}

export const Navigation: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    darkMode,
    toggleDarkMode,
    isScanning,
    runAIScan,
    items,
    messages,
    messageReminders,
    setIsRemindersDrawerOpen,
  } = useSyncPulse();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingRemindersCount = messageReminders.filter(
    (r) => r.status === 'pending' || r.status === 'triggered'
  ).length;

  const pendingAssignments = items.filter((i) => i.type === 'assignment' && !i.done).length;
  const upcomingDates = items.filter((i) => i.type === 'date' && !i.done).length;
  const activeNotices = items.filter((i) => i.type === 'notice').length;
  const agendaCount =
    items.filter((i) => !i.done && (i.deadline || i.startTime)).length +
    messageReminders.filter((r) => r.status === 'pending').length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda', icon: CalendarClock, badgeCount: agendaCount > 0 ? agendaCount : undefined },
    { id: 'connect', label: 'Connect Chats', icon: Link2 },
    { id: 'chats', label: 'Chats', icon: MessageSquare, badgeCount: messages.length > 0 ? messages.length : undefined },
    { id: 'dates', label: 'Important Dates', icon: Calendar, badgeCount: upcomingDates > 0 ? upcomingDates : undefined },
    { id: 'assignments', label: 'Assignments', icon: CheckSquare, badgeCount: pendingAssignments > 0 ? pendingAssignments : undefined },
    { id: 'notices', label: 'Notices', icon: Bell, badgeCount: activeNotices > 0 ? activeNotices : undefined },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
    { id: 'privacy', label: 'Privacy', icon: ShieldCheck },
  ];

  return (
    <>
      {/* DESKTOP TOP BAR & TABS */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#1D2112]/95 backdrop-blur-md border-b border-[#E3E6D3] dark:border-[#2B321A] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Zone 1: Brand & Tagline */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6B7A2A] to-[#3F4A16] flex items-center justify-center text-white shadow-sm shadow-[#6B7A2A]/20 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold tracking-tight text-[#3F4A16] dark:text-[#EEF1DC] block leading-tight">
                    SyncPulse
                  </span>
                  <span className="hidden sm:block text-[11px] font-semibold text-[#6B7A2A] dark:text-[#9AAE3C] leading-none uppercase tracking-wider">
                    AI Chat Hub
                  </span>
                </div>
              </button>
            </div>

            {/* Zone 2: Desktop Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all cursor-pointer min-h-[40px] ${
                      isActive
                        ? 'bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] font-semibold shadow-xs'
                        : 'text-[#6B7059] dark:text-[#A4AA8E] hover:text-[#2B2F1E] dark:hover:text-[#EEF1DC] hover:bg-[#EEF1DC]/50 dark:hover:bg-[#283017]/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#6B7A2A] dark:text-[#9AAE3C]' : 'text-[#6B7059] dark:text-[#A4AA8E]'}`} />
                    <span>{item.label}</span>
                    {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums ${
                        isActive
                          ? 'bg-[#6B7A2A] text-white dark:bg-[#9AAE3C] dark:text-[#14170D]'
                          : 'bg-[#DDE3BE] text-[#3F4A16] dark:bg-[#384221] dark:text-[#DDE3BE]'
                      }`}>
                        {item.badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Actions (Scan Chats + PWA Install + Reminders Bell + Dark Mode) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <PWAInstallButton className="hidden md:flex" />

              <button
                onClick={runAIScan}
                disabled={isScanning}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#6B7A2A] hover:bg-[#5A6823] active:bg-[#4A561C] text-white shadow-xs transition-colors cursor-pointer disabled:opacity-75 min-h-[40px]"
                title="Scan all connected chats for to-dos and deadlines"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Scanning...' : 'Scan Chats'}</span>
              </button>

              {/* Reminders Drawer Trigger */}
              <button
                onClick={() => setIsRemindersDrawerOpen(true)}
                aria-label="View all reminders"
                className="relative p-2.5 rounded-xl text-[#6B7059] dark:text-[#A4AA8E] hover:bg-[#EEF1DC]/60 dark:hover:bg-[#283017]/60 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                title={`Class Reminders (${pendingRemindersCount} pending)`}
              >
                <Bell className={`w-5 h-5 ${pendingRemindersCount > 0 ? 'text-[#D98324] fill-[#D98324]/20' : ''}`} />
                {pendingRemindersCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-[#D98324] text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums ring-2 ring-white dark:ring-[#1D2112] shadow-xs">
                    {pendingRemindersCount}
                  </span>
                )}
              </button>

              <button
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
                className="p-2.5 rounded-xl text-[#6B7059] dark:text-[#A4AA8E] hover:bg-[#EEF1DC]/60 dark:hover:bg-[#283017]/60 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              >
                {darkMode ? <Sun className="w-5 h-5 text-[#C9A227]" /> : <Moon className="w-5 h-5 text-[#3F4A16] dark:text-[#EEF1DC]" />}
              </button>

              {/* Mobile menu toggle for full list */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle mobile menu"
                className="lg:hidden p-2.5 rounded-xl text-[#6B7059] dark:text-[#A4AA8E] hover:bg-[#EEF1DC]/60 dark:hover:bg-[#283017]/60 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal scroll tabs on tablet/medium screen if not in desktop */}
        <div className="lg:hidden border-t border-[#E3E6D3] dark:border-[#2B321A] overflow-x-auto scrollbar-none py-2 px-4 flex gap-1.5 items-center bg-white dark:bg-[#1D2112]">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                  isActive
                    ? 'bg-[#6B7A2A] text-white font-semibold shadow-xs'
                    : 'bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#DDE3BE] hover:bg-[#DDE3BE] dark:hover:bg-[#343C1F]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* MOBILE FULL DRAWER MODAL (when hamburger clicked) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-white dark:bg-[#1D2112] rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto border-t border-[#E3E6D3] dark:border-[#2B321A] shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#E3E6D3] dark:border-[#2B321A] mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#3F4A16] dark:text-[#EEF1DC]">SyncPulse Navigation</h3>
                <p className="text-xs text-[#6B7059] dark:text-[#A4AA8E]">All 7 areas of your study hub</p>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl text-[#6B7059] hover:bg-[#EEF1DC] dark:hover:bg-[#283017] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5 text-[#3F4A16] dark:text-[#EEF1DC]" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 mb-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl min-h-[52px] text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] font-semibold'
                        : 'text-[#2B2F1E] dark:text-[#EEF1DC] hover:bg-[#F7F8F2] dark:hover:bg-[#283017]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isActive
                          ? 'bg-[#6B7A2A] text-white'
                          : 'bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#DDE3BE]'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-base">{item.label}</span>
                    </div>

                    {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#DDE3BE] dark:bg-[#384221] text-[#3F4A16] dark:text-[#EEF1DC] tabular-nums">
                        {item.badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                runAIScan();
                setMobileMenuOpen(false);
              }}
              disabled={isScanning}
              className="w-full py-3.5 px-4 rounded-xl bg-[#6B7A2A] hover:bg-[#5A6823] active:bg-[#4A561C] text-white font-medium text-sm flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning Chats...' : 'Scan All Class Chats'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MOBILE FIXED BOTTOM TAB BAR (Thumb zone) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#1D2112]/95 backdrop-blur-md border-t border-[#E3E6D3] dark:border-[#2B321A] pb-safe">
        <div className="grid grid-cols-5 items-center h-16 px-1">
          {/* Tab 1: Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-[#6B7A2A] dark:text-[#9AAE3C] font-semibold'
                : 'text-[#6B7059] dark:text-[#A4AA8E] hover:text-[#2B2F1E] dark:hover:text-[#EEF1DC]'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-1 leading-tight tracking-tight">Home</span>
          </button>

          {/* Tab 2: Agenda */}
          <button
            onClick={() => setActiveTab('agenda')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer relative ${
              activeTab === 'agenda'
                ? 'text-[#6B7A2A] dark:text-[#9AAE3C] font-semibold'
                : 'text-[#6B7059] dark:text-[#A4AA8E] hover:text-[#2B2F1E] dark:hover:text-[#EEF1DC]'
            }`}
          >
            <div className="relative">
              <CalendarClock className="w-5 h-5" />
              {agendaCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-[#6B7A2A] text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {agendaCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 leading-tight tracking-tight">Agenda</span>
          </button>

          {/* Tab 3: Chats */}
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer relative ${
              activeTab === 'chats'
                ? 'text-[#6B7A2A] dark:text-[#9AAE3C] font-semibold'
                : 'text-[#6B7059] dark:text-[#A4AA8E] hover:text-[#2B2F1E] dark:hover:text-[#EEF1DC]'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] mt-1 leading-tight tracking-tight">Chats</span>
          </button>

          {/* Tab 4: Tasks (Assignments) */}
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer relative ${
              activeTab === 'assignments'
                ? 'text-[#6B7A2A] dark:text-[#9AAE3C] font-semibold'
                : 'text-[#6B7059] dark:text-[#A4AA8E] hover:text-[#2B2F1E] dark:hover:text-[#EEF1DC]'
            }`}
          >
            <div className="relative">
              <CheckSquare className="w-5 h-5" />
              {pendingAssignments > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-[#6B7A2A] text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {pendingAssignments}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 leading-tight tracking-tight">Tasks</span>
          </button>

          {/* Tab 5: More (Dates, Notices, Connect, Settings, Privacy) */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer relative ${
              activeTab === 'dates' || activeTab === 'connect' || activeTab === 'notices' || activeTab === 'settings' || activeTab === 'privacy'
                ? 'text-[#6B7A2A] dark:text-[#9AAE3C] font-semibold'
                : 'text-[#6B7059] dark:text-[#A4AA8E] hover:text-[#2B2F1E] dark:hover:text-[#EEF1DC]'
            }`}
          >
            <div className="relative">
              <Menu className="w-5 h-5" />
              {activeNotices > 0 && (
                <span className="absolute -top-1 -right-2 w-2 h-2 bg-[#6B7A2A] rounded-full" />
              )}
            </div>
            <span className="text-[10px] mt-1 leading-tight tracking-tight">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
