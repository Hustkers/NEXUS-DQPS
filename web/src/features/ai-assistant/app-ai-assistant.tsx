'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  IconSparkles,
  IconMicrophone,
  IconMessageChatbot,
  IconSearch,
  IconX,
  IconChevronUp,
} from '@tabler/icons-react';
import { AssistantSearch } from './assistant-search';
import { AssistantVoice } from './assistant-voice';
import { AssistantChat } from './assistant-chat';
import { useAiAssistant } from './use-ai-assistant';
import { Kbd } from '@/components/ui/kbd';

export function AppAiAssistant() {
  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const { isOpen, activeTab, open, close, toggle, setActiveTab } = useAiAssistant();

  // Keyboard Shortcuts: Cmd+K opens search; Cmd+J toggles assistant; Escape closes it
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable
      ) {
        if (e.key === 'Escape' && isOpen) {
          close();
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        open('search');
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        toggle();
      } else if (e.key === 'Escape' && isOpen) {
        close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, open, close, toggle]);

  return (
    <>
      {/* Floating Action Button - Positioned in the Top Right (on non-dashboard pages; on dashboard it is in the header) */}
      {!isDashboard && (
        <div className="fixed top-3.5 right-4 sm:right-6 z-50 pointer-events-auto">
          <button
            onClick={() => toggle()}
            aria-expanded={isOpen}
            aria-label="Toggle AppWide AI Assistant"
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 shadow-xl backdrop-blur-xl ${
              isOpen
                ? 'bg-zinc-900 border-emerald-500/70 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-2 ring-emerald-500/20'
                : 'bg-zinc-950/85 hover:bg-zinc-900/95 border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
            }`}
          >
            {/* Icons + Title */}
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium tracking-tight">
              <IconSparkles className="size-3.5 text-emerald-400" />
              <span>AI Copilot</span>
            </div>

            {/* Shortcut hint */}
            <div className="flex items-center gap-1 pl-1 border-l border-zinc-800 text-[10px] text-zinc-400 font-mono">
              <Kbd className="text-[9px] px-1 py-0 bg-zinc-800/80 border-zinc-700 text-zinc-300">
                ⌘K
              </Kbd>
            </div>
          </button>
        </div>
      )}

      {/* Floating Minimalist Assistant Modal / Dock - Dropping from Top Right */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed top-14 sm:top-16 right-4 sm:right-6 z-50 w-[94vw] max-w-lg md:max-w-xl rounded-2xl border border-zinc-800/90 bg-zinc-950/95 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(16,185,129,0.12)] text-zinc-100 overflow-hidden flex flex-col origin-top-right animate-in fade-in slide-in-from-top-4 duration-200"
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/60">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center">
                <IconSparkles className="size-3.5 text-emerald-400" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold font-mono text-zinc-100">
                  NEXUS Assistant
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border border-emerald-500/40 bg-emerald-950/40 text-emerald-300">
                  Autonomous
                </span>
              </div>
            </div>

            {/* Tab Switcher: Search vs Voice vs Chat */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg border border-zinc-800 bg-zinc-950/80">
              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono transition-all ${
                  activeTab === 'search'
                    ? 'bg-zinc-800 text-emerald-400 shadow-xs font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <IconSearch className="size-3" />
                <span>Search</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('voice')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono transition-all ${
                  activeTab === 'voice'
                    ? 'bg-zinc-800 text-emerald-400 shadow-xs font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <IconMicrophone className="size-3" />
                <span>Voice</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono transition-all ${
                  activeTab === 'chat'
                    ? 'bg-zinc-800 text-emerald-400 shadow-xs font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <IconMessageChatbot className="size-3" />
                <span>Chatbot</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={close}
              className="size-7 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 flex items-center justify-center transition-colors"
              title="Close Assistant (Esc)"
            >
              <IconX className="size-4" />
            </button>
          </div>

          {/* Active Tab View */}
          <div className="flex-1 min-h-0 bg-zinc-950/50">
            {activeTab === 'search' && <AssistantSearch />}
            {activeTab === 'voice' && <AssistantVoice router={router} />}
            {activeTab === 'chat' && <AssistantChat router={router} />}
          </div>

          {/* Footer Bar */}
          <div className="px-4 py-1.5 bg-zinc-900/40 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>
              Search &amp; Omnibar · ElevenLabs Voice · Autonomous Tools
            </span>
            <button
              type="button"
              onClick={close}
              className="text-zinc-400 hover:text-zinc-200 flex items-center gap-0.5"
            >
              <span>Close</span>
              <IconChevronUp className="size-3" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
