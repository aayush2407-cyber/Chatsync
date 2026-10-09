import React, { useState } from 'react';
import {
  LayoutDashboard,
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
  } = useSyncPulse();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingAssignments = items.filter((i) => i.type === 'assignment' && !i.done).length;
  const upcomingDates = items.filter((i) => i.type === 'date' && !i.done).length;
  const activeNotices = items.filter((i) => i.type === 'notice').length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
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
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Zone 1: Brand & Tagline */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white block leading-tight">
                    SyncPulse
                  </span>
                  <span className="hidden sm:block text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-none">
                    AI Chat Hub
                  </span>
                </div>
              </button>
            </div>

            {/* Zone 2: Desktop Navigation Tabs (all 7 tabs) */}
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
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{item.label}</span>
                    {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums ${
                        isActive
                          ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {item.badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Actions (Scan Chats + Dark Mode) */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={runAIScan}
                disabled={isScanning}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-75 min-h-[40px]"
                title="Scan all connected chats for to-dos and deadlines"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Scanning...' : 'Scan Chats'}</span>
              </button>

              <button
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
                className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              >
                {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Mobile menu toggle for full list */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle mobile menu"
                className="lg:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal scroll tabs on tablet/medium screen if not in desktop */}
        <div className="lg:hidden border-t border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-none py-2 px-4 flex gap-1.5 items-center">
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
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
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
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto border-t border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">SyncPulse Navigation</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">All 7 areas of your study hub</p>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
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
                    className={`flex items-center justify-between p-3.5 rounded-2xl min-h-[52px] text-left transition-all ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-base">{item.label}</span>
                    </div>

                    {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 tabular-nums">
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
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 text-white font-medium text-sm flex items-center justify-center gap-2 min-h-[48px]"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning Chats...' : 'Scan All Class Chats'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MOBILE FIXED BOTTOM TAB BAR (Thumb zone) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="grid grid-cols-5 items-center h-16 px-1">
          {/* Tab 1: Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-1 leading-tight tracking-tight">Home</span>
          </button>

          {/* Tab 2: Chats */}
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer relative ${
              activeTab === 'chats'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] mt-1 leading-tight tracking-tight">Chats</span>
          </button>

          {/* Tab 3: Assignments */}
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer relative ${
              activeTab === 'assignments'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <CheckSquare className="w-5 h-5" />
              {pendingAssignments > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-indigo-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {pendingAssignments}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 leading-tight tracking-tight">Tasks</span>
          </button>

          {/* Tab 4: Important Dates */}
          <button
            onClick={() => setActiveTab('dates')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
              activeTab === 'dates'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] mt-1 leading-tight tracking-tight">Dates</span>
          </button>

          {/* Tab 5: More (Notices, Connect, Settings) */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer relative ${
              activeTab === 'connect' || activeTab === 'notices' || activeTab === 'settings' || activeTab === 'privacy'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Menu className="w-5 h-5" />
              {activeNotices > 0 && (
                <span className="absolute -top-1 -right-2 w-2 h-2 bg-indigo-600 rounded-full" />
              )}
            </div>
            <span className="text-[10px] mt-1 leading-tight tracking-tight">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
