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
      color: 'indigo',
      visual: (
        <div className="flex flex-wrap items-center justify-center gap-2.5 py-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
            <MessageSquare className="w-3.5 h-3.5" /> WhatsApp (.txt / .zip)
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-semibold">
            <MessageSquare className="w-3.5 h-3.5" /> Telegram (.json)
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold">
            <MessageSquare className="w-3.5 h-3.5" /> Discord & Slack
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
      color: 'violet',
      visual: (
        <div className="w-full max-w-xs mx-auto py-2 space-y-2">
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-[11px] text-slate-500 line-through truncate flex items-center justify-between">
            <span>"Who has the textbook pdf?"</span>
            <span className="text-[10px] text-slate-400 no-underline">Ignored (casual)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[11px] text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between font-medium">
            <span>"Midterm moved to Thursday 2PM"</span>
            <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-md font-bold">Important Date</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[11px] text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between font-medium">
            <span>"Submit Lab Report 4 before Friday"</span>
            <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-md font-bold">Assignment</span>
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
      color: 'emerald',
      visual: (
        <div className="flex flex-col gap-2 py-3 max-w-xs mx-auto">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">CS 201 Problem Set</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
              Due in 4h
            </span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">Math Quiz #2</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
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
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
        {/* Top bar with progress and Skip */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5" aria-label={`Step ${currentStep + 1} of 3`}>
              {screens.map((s, idx) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentStep
                      ? 'w-7 bg-indigo-600 dark:bg-indigo-500'
                      : 'w-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'
                  }`}
                  aria-label={`Go to step ${idx + 1}`}
                />
              ))}
            </div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 ml-1">
              {current.badge}
            </span>
          </div>

          <button
            type="button"
            onClick={completeOnboarding}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[36px] flex items-center gap-1"
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
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    current.color === 'indigo'
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50'
                      : current.color === 'violet'
                      ? 'bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-900/50'
                      : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                  }`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h2
                    id="onboarding-title"
                    className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white"
                  >
                    {current.title}
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {current.tagline}
                  </p>
                </div>
              </div>

              {/* Graphic / Visual Demonstration */}
              <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 my-3">
                {current.visual}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {current.description}
              </p>

              {/* Privacy highlight footer note */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-[11px] text-slate-500 dark:text-slate-400 text-left">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{current.tip}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="px-5 sm:px-7 py-4 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px] flex items-center gap-1.5 cursor-pointer"
            aria-label="Previous step"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors min-h-[44px] flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
