import React from 'react';
import { SyncPulseProvider, useSyncPulse } from './context/SyncPulseContext';
import { Navigation } from './components/Navigation';
import { ToastContainer } from './components/ToastContainer';
import { SummaryViewModal } from './components/SummaryViewModal';
import { SummariseProgressModal } from './components/SummariseProgressModal';
import { NotificationPermissionModal } from './components/NotificationPermissionModal';
import { OnboardingModal } from './components/OnboardingModal';
import { MessageReminderModal } from './components/MessageReminderModal';
import { TriggeredReminderNotification } from './components/TriggeredReminderNotification';
import { RemindersDrawer } from './components/RemindersDrawer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DashboardPage } from './pages/DashboardPage';
import { AgendaPage } from './pages/AgendaPage';
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
    activeReminderModalState,
    closeReminderModal,
  } = useSyncPulse();

  return (
    <div className="min-h-screen bg-[#F7F8F2] dark:bg-[#14170D] text-[#2B2F1E] dark:text-[#EEF1DC] flex flex-col font-sans transition-colors duration-150">
      {/* Navigation: Top tabs on desktop, bottom bar on mobile */}
      <Navigation />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12">
        {activeTab === 'dashboard' && <DashboardPage />}
        {activeTab === 'agenda' && <AgendaPage />}
        {activeTab === 'connect' && <ConnectChatsPage />}
        {activeTab === 'chats' && <ChatsPage />}
        {activeTab === 'dates' && <ImportantDatesPage />}
        {activeTab === 'assignments' && <AssignmentsPage />}
        {activeTab === 'notices' && <NoticesPage />}
        {activeTab === 'settings' && <SettingsPage />}
        {activeTab === 'privacy' && <PrivacyPage />}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-[#E3E6D3] dark:border-[#2B321A] py-6 text-center text-xs text-[#6B7059] dark:text-[#A4AA8E] hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium text-[#3F4A16] dark:text-[#EEF1DC]">
            SyncPulse — AI Chat Hub: turn class chats into a clear to-do list.
          </p>
          <div className="flex items-center gap-4 text-[#6B7059] dark:text-[#A4AA8E]">
            <span>For students in WhatsApp, Discord, Slack, & Telegram groups.</span>
            <span>•</span>
            <button
              onClick={() => setActiveTab('privacy')}
              className="text-[#6B7A2A] dark:text-[#9AAE3C] hover:underline cursor-pointer font-medium"
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

      {/* In-Chat Message Reminder Sheet/Modal */}
      <MessageReminderModal
        isOpen={activeReminderModalState.isOpen}
        onClose={closeReminderModal}
        message={activeReminderModalState.message}
        item={activeReminderModalState.item}
      />

      {/* Triggered Reminder Popup Notification ("Done", "Snooze", "Open chat") */}
      <TriggeredReminderNotification />

      {/* All Reminders Slide-Out Drawer */}
      <RemindersDrawer />

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
