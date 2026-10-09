import React from 'react';
import { SyncPulseProvider, useSyncPulse } from './context/SyncPulseContext';
import { Navigation } from './components/Navigation';
import { ToastContainer } from './components/ToastContainer';
import { SummaryViewModal } from './components/SummaryViewModal';
import { SummariseProgressModal } from './components/SummariseProgressModal';
import { NotificationPermissionModal } from './components/NotificationPermissionModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DashboardPage } from './pages/DashboardPage';
import { ConnectChatsPage } from './pages/ConnectChatsPage';
import { ChatsPage } from './pages/ChatsPage';
import { ImportantDatesPage } from './pages/ImportantDatesPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { NoticesPage } from './pages/NoticesPage';
import { SettingsPage } from './pages/SettingsPage';
import { PrivacyPage } from './pages/PrivacyPage';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activeSummaryView,
    setActiveSummaryView,
    isSummarising,
    summarisingProgress,
    summariseError,
    retryLastSummarise,
    closeProgressModal,
    isNotificationModalOpen,
    setIsNotificationModalOpen,
    requestNotificationPermission,
  } = useSyncPulse();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
      {/* Navigation: Top tabs on desktop, bottom bar on mobile */}
      <Navigation />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12">
        {activeTab === 'dashboard' && <DashboardPage />}
        {activeTab === 'connect' && <ConnectChatsPage />}
        {activeTab === 'chats' && <ChatsPage />}
        {activeTab === 'dates' && <ImportantDatesPage />}
        {activeTab === 'assignments' && <AssignmentsPage />}
        {activeTab === 'notices' && <NoticesPage />}
        {activeTab === 'settings' && <SettingsPage />}
        {activeTab === 'privacy' && <PrivacyPage />}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium text-slate-600 dark:text-slate-300">
            SyncPulse — AI Chat Hub: turn class chats into a clear to-do list.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>For students in WhatsApp, Discord, Slack, & Telegram groups.</span>
            <span>•</span>
            <button
              onClick={() => setActiveTab('privacy')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium"
            >
              Privacy & AI Policy
            </button>
          </div>
        </div>
      </footer>

      {/* First-Time 3-Screen Onboarding Modal */}
      <OnboardingModal />

      {/* AI Summary View Modal */}
      <SummaryViewModal
        isOpen={Boolean(activeSummaryView)}
        onClose={() => setActiveSummaryView(null)}
        summary={activeSummaryView?.summary || null}
        items={activeSummaryView?.items || []}
        chatName={activeSummaryView?.chatName || 'Class Chat'}
      />

      {/* AI Summarisation Progress & Error Modal */}
      <SummariseProgressModal
        isLoading={isSummarising}
        progressText={summarisingProgress}
        error={summariseError}
        onRetry={retryLastSummarise}
        onClose={closeProgressModal}
      />

      {/* Browser Notification Permission Modal */}
      <NotificationPermissionModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onAllow={() => requestNotificationPermission()}
      />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <SyncPulseProvider>
        <AppContent />
      </SyncPulseProvider>
    </ErrorBoundary>
  );
}
