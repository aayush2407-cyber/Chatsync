import React, { useState, useEffect } from 'react';
import {
  Link2,
  Sparkles,
  CalendarCheck2,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  ShieldCheck,
  Bell,
  MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSyncPulse } from '../context/SyncPulseContext';

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, completeOnboarding, setActiveTab } = useSyncPulse();
  const [currentStep, setCurrentStep] = useState(0);

  // Keyboard accessibility: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOnboardingOpen) return;
      if (e.key === 'Escape') {
        completeOnboarding();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOnboardingOpen, completeOnboarding]);

  if (!isOnboardingOpen) return null;

  const screens = [
    {
      step: 1,
      badge: 'Step 1 of 3',
      title: 'Connect a chat',
      tagline: 'Bring your student groups into one clean hub',
      description:
        'Upload your WhatsApp or Telegram export files (.txt / .zip) or connect Discord and Slack channels. Only the specific chats you import are ever accessed.',
      icon: Link2,
      color: 'olive',
      visual: (
        <div className="flex flex-wrap items-center justify-center gap-2.5 py-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] border border-[#DDE3BE] dark:border-[#384221] text-xs font-semibold">
            <MessageSquare className="w-3.5 h-3.5 text-[#6B7A2A]" /> WhatsApp (.txt / .zip)
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] border border-[#DDE3BE] dark:border-[#384221] text-xs font-semibold">
            <MessageSquare className="w-3.5 h-3.5 text-[#7E9130]" /> Telegram (.json)
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] border border-[#DDE3BE] dark:border-[#384221] text-xs font-semibold">
            <MessageSquare className="w-3.5 h-3.5 text-[#5A6823]" /> Discord & Slack
          </span>
        </div>
      ),
      tip: 'Private chats are never touched. You control exactly what gets imported.',
    },
    {
      step: 2,
      badge: 'Step 2 of 3',
      title: 'Tap Summarise',
      tagline: 'AI separates assignments from casual chat noise',
      description:
        'College groups can have hundreds of memes, greetings, and random banter. SyncPulse sends messages to Gemini only to extract deadlines, exams, homework, and circulars.',
      icon: Sparkles,
      color: 'olive',
      visual: (
        <div className="w-full max-w-xs mx-auto py-2 space-y-2">
          <div className="p-2.5 rounded-xl bg-[#F7F8F2] dark:bg-[#14170D] text-[11px] text-[#6B7059] line-through truncate flex items-center justify-between border border-[#E3E6D3] dark:border-[#2B321A]">
            <span>"Who has the textbook pdf?"</span>
            <span className="text-[10px] text-[#6B7059] no-underline">Ignored (casual)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#EEF1DC] dark:bg-[#283017] text-[11px] text-[#3F4A16] dark:text-[#EEF1DC] border border-[#DDE3BE] dark:border-[#384221] flex items-center justify-between font-medium">
            <span>"Midterm moved to Thursday 2PM"</span>
            <span className="text-[10px] bg-[#6B7A2A] text-white px-2 py-0.5 rounded-md font-bold">Important Date</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#EEF1DC] dark:bg-[#283017] text-[11px] text-[#3F4A16] dark:text-[#EEF1DC] border border-[#DDE3BE] dark:border-[#384221] flex items-center justify-between font-medium">
            <span>"Submit Lab Report 4 before Friday"</span>
            <span className="text-[10px] bg-[#5A6823] text-white px-2 py-0.5 rounded-md font-bold">Assignment</span>
          </div>
        </div>
      ),
      tip: 'Messages are processed strictly for classification and discarded immediately after.',
    },
    {
      step: 3,
      badge: 'Step 3 of 3',
      title: 'Never miss a deadline',
      tagline: 'Clear countdowns, to-dos, and morning briefings',
      description:
        'Your extracted homework, lab tests, and dates are organized into prioritized lists with color-coded badges, customizable reminders, and morning study briefings.',
      icon: CalendarCheck2,
      color: 'olive',
      visual: (
        <div className="flex flex-col gap-2 py-3 max-w-xs mx-auto">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#1D2112] border border-[#E3E6D3] dark:border-[#2B321A] shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C0392B]" />
              <span className="text-xs font-semibold text-[#2B2F1E] dark:text-[#EEF1DC]">CS 201 Problem Set</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FEF2F2] dark:bg-[#2A1215] text-[#C0392B]">
              Due in 4h
            </span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#1D2112] border border-[#E3E6D3] dark:border-[#2B321A] shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D98324]" />
              <span className="text-xs font-semibold text-[#2B2F1E] dark:text-[#EEF1DC]">Math Quiz #2</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FEFCE8] dark:bg-[#28220A] text-[#D98324]">
              Tomorrow
            </span>
          </div>
        </div>
      ),
      tip: 'All data stays private in your browser. You can wipe everything with one click in Settings.',
    },
  ];

  const current = screens[currentStep];
  const Icon = current.icon;

  const handleNext = () => {
    if (currentStep < screens.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeOnboarding();
      setActiveTab('connect');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1D2112] rounded-3xl border border-[#E3E6D3] dark:border-[#2B321A] shadow-2xl overflow-hidden my-auto">
        {/* Top bar with progress and Skip */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E3E6D3] dark:border-[#2B321A]">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5" aria-label={`Step ${currentStep + 1} of 3`}>
              {screens.map((s, idx) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentStep
                      ? 'w-7 bg-[#6B7A2A] dark:bg-[#9AAE3C]'
                      : 'w-2 bg-[#E3E6D3] dark:bg-[#2B321A] hover:bg-[#DDE3BE]'
                  }`}
                  aria-label={`Go to step ${idx + 1}`}
                />
              ))}
            </div>
            <span className="text-[11px] font-semibold text-[#6B7059] dark:text-[#A4AA8E] ml-1">
              {current.badge}
            </span>
          </div>

          <button
            type="button"
            onClick={completeOnboarding}
            className="text-xs font-semibold text-[#6B7059] dark:text-[#A4AA8E] hover:text-[#2B2F1E] dark:hover:text-[#EEF1DC] px-2 py-1 rounded-lg hover:bg-[#EEF1DC] dark:hover:bg-[#283017] transition-colors cursor-pointer min-h-[36px] flex items-center gap-1"
            aria-label="Skip onboarding"
          >
            <span>Skip</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content area with animated transition */}
        <div className="p-5 sm:p-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 text-center sm:text-left"
            >
              {/* Header Icon + Titles */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs bg-[#EEF1DC] dark:bg-[#283017] text-[#6B7A2A] dark:text-[#9AAE3C] border border-[#DDE3BE] dark:border-[#384221]">
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h2
                    id="onboarding-title"
                    className="text-xl sm:text-2xl font-bold text-[#2B2F1E] dark:text-[#EEF1DC]"
                  >
                    {current.title}
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-[#6B7A2A] dark:text-[#9AAE3C] mt-0.5">
                    {current.tagline}
                  </p>
                </div>
              </div>

              {/* Graphic / Visual Demonstration */}
              <div className="bg-[#F7F8F2] dark:bg-[#14170D] rounded-2xl p-4 border border-[#E3E6D3] dark:border-[#2B321A] my-3">
                {current.visual}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#6B7059] dark:text-[#A4AA8E] leading-relaxed">
                {current.description}
              </p>

              {/* Privacy highlight footer note */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#EEF1DC]/60 dark:bg-[#283017]/60 text-[11px] text-[#3F4A16] dark:text-[#EEF1DC] text-left border border-[#DDE3BE] dark:border-[#384221]">
                <ShieldCheck className="w-4 h-4 text-[#6B7A2A] dark:text-[#9AAE3C] shrink-0" />
                <span>{current.tip}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="px-5 sm:px-7 py-4 bg-[#F7F8F2] dark:bg-[#14170D] border-t border-[#E3E6D3] dark:border-[#2B321A] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-4 py-2.5 rounded-xl border border-[#E3E6D3] dark:border-[#2B321A] text-xs sm:text-sm font-semibold text-[#2B2F1E] dark:text-[#EEF1DC] hover:bg-white dark:hover:bg-[#1D2112] disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px] flex items-center gap-1.5 cursor-pointer"
            aria-label="Previous step"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-[#6B7A2A] hover:bg-[#5A6823] active:bg-[#4A561C] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors min-h-[44px] flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6B7A2A] focus:ring-offset-2"
            aria-label={currentStep === screens.length - 1 ? 'Get Started with SyncPulse' : 'Next step'}
          >
            <span>{currentStep === screens.length - 1 ? 'Get Started' : 'Next'}</span>
            {currentStep === screens.length - 1 ? (
              <Check className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
