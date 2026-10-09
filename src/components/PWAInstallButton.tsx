import React, { useState } from 'react';
import { Download, Smartphone, X, Sparkles, Share, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 rounded-xl bg-[#6B7A2A] hover:bg-[#5A6823] active:bg-[#4A561C] px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition cursor-pointer min-h-[36px] ${className}`}
        title="Install SyncPulse on your device"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-xl border border-[#E3E6D3] dark:border-[#2B321A] px-3 py-1.5 text-xs font-semibold text-[#2B2F1E] dark:text-[#EEF1DC] hover:bg-[#EEF1DC] dark:hover:bg-[#283017] transition cursor-pointer min-h-[36px] ${className}`}
          title="Install SyncPulse on iOS"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#6B7A2A] dark:text-[#9AAE3C]" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1D2112] p-6 shadow-2xl border border-[#E3E6D3] dark:border-[#2B321A] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E3E6D3] dark:border-[#2B321A]">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#6B7A2A] dark:text-[#9AAE3C]" />
                  <h3 className="text-base font-bold text-[#2B2F1E] dark:text-[#EEF1DC]">
                    Install on iPhone & iPad
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 text-[#6B7059] hover:text-[#2B2F1E] dark:hover:text-[#EEF1DC] rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-[#6B7059] dark:text-[#A4AA8E]">
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F7F8F2] dark:bg-[#14170D] border border-[#E3E6D3] dark:border-[#2B321A]">
                  <div className="w-6 h-6 rounded-lg bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] flex items-center justify-center font-bold shrink-0">
                    1
                  </div>
                  <p>
                    Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline mx-0.5 text-[#6B7A2A]" /> at the bottom or top of your Safari browser bar.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F7F8F2] dark:bg-[#14170D] border border-[#E3E6D3] dark:border-[#2B321A]">
                  <div className="w-6 h-6 rounded-lg bg-[#EEF1DC] dark:bg-[#283017] text-[#3F4A16] dark:text-[#EEF1DC] flex items-center justify-center font-bold shrink-0">
                    2
                  </div>
                  <p>
                    Scroll down in the action sheet and select <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-[#6B7A2A]" />.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-[#6B7A2A] hover:bg-[#5A6823] active:bg-[#4A561C] py-2.5 text-xs font-bold text-white transition cursor-pointer min-h-[40px]"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
