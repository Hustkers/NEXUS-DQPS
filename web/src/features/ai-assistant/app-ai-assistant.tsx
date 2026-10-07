'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconSparkles,
  IconMicrophone,
  IconMessageChatbot,
  IconX,
  IconChevronDown,
} from '@tabler/icons-react';
import { AssistantVoice } from './assistant-voice';
import { AssistantChat } from './assistant-chat';
import { Kbd } from '@/components/ui/kbd';

export function AppAiAssistant() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'voice' | 'chat'>('voice');
  const [hasNewExecution, setHasNewExecution] = useState(false);

  // Global Keyboard Shortcut: Cmd/Ctrl + J toggles the AI assistant; Escape closes it
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        const target = e.target as HTMLElement | null;
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target?.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleToolExecuted = (_toolName: string, _result: any) => {
    setHasNewExecution(true);
    setTimeout(() => setHasNewExecution(false), 3000);
  };

  return (
    <>
      {/* Floating Action Button - Bottom Middle of Screen */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle AppWide AI Assistant"
          className={`group flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all duration-300 shadow-2xl backdrop-blur-xl ${
            isOpen
              ? 'bg-zinc-900 border-emerald-500/70 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.25)] ring-2 ring-emerald-500/20'
              : 'bg-zinc-950/85 hover:bg-zinc-900/95 border-zinc-800 hover:border-zinc-700 text-zinc-100 hover:text-white shadow-[0_10px_30px_rgba(0,0,0,0.6)]'
          }`}
        >
          {/* Animated Status Beacon */}
          <div className="relative flex items-center justify-center">
            <span
              className={`size-2 rounded-full transition-all duration-300 ${
                hasNewExecution
                  ? 'bg-emerald-400 animate-ping'
                  : isOpen
                  ? 'bg-emerald-400'
                  : 'bg-emerald-500 group-hover:scale-125'
              }`}
            />
            <span className="absolute size-3.5 rounded-full bg-emerald-500/20 animate-pulse pointer-events-none" />
          </div>

          {/* Icons + Title */}
          <div className="flex items-center gap-1.5 text-xs font-mono font-medium tracking-tight">
            <IconSparkles className="size-3.5 text-emerald-400" />
            <span>NEXUS AI</span>
          </div>

          {/* Mode Badges */}
          <div className="flex items-center gap-1 pl-1 border-l border-zinc-800 text-[10px] text-zinc-400 font-mono">
            <span className="hidden sm:inline">Voice &amp; Tools</span>
            <Kbd className="hidden md:inline-flex text-[9px] px-1 py-0 bg-zinc-800/80 border-zinc-700 text-zinc-300">
              ⌘J
            </Kbd>
          </div>
        </button>
      </div>

      {/* Floating Minimalist Assistant Modal / Dock */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed bottom-18 left-1/2 -translate-x-1/2 z-50 w-[94vw] max-w-lg md:max-w-xl rounded-2xl border border-zinc-800/90 bg-zinc-950/95 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(16,185,129,0.12)] text-zinc-100 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/60">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center">
                <IconSparkles className="size-3.5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold font-mono text-zinc-100">
                    NEXUS Copilot
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border border-emerald-500/40 bg-emerald-950/40 text-emerald-300">
                    Autonomous
                  </span>
                </div>
              </div>
            </div>

            {/* Tab Switcher: Voice vs Chat */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg border border-zinc-800 bg-zinc-950/80">
              <button
                onClick={() => setActiveTab('voice')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
                  activeTab === 'voice'
                    ? 'bg-zinc-800 text-emerald-400 shadow-xs font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <IconMicrophone className="size-3" />
                <span>Voice AI</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
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
              onClick={() => setIsOpen(false)}
              className="size-7 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 flex items-center justify-center transition-colors"
              title="Close Assistant (Esc)"
            >
              <IconX className="size-4" />
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-h-0 bg-zinc-950/50">
            {activeTab === 'voice' ? (
              <AssistantVoice onToolExecuted={handleToolExecuted} router={router} />
            ) : (
              <AssistantChat onToolExecuted={handleToolExecuted} router={router} />
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-4 py-1.5 bg-zinc-900/40 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span className="flex items-center gap-1">
              <span className="size-1 rounded-full bg-emerald-500" />
              ElevenLabs Conversational Engine · Tool Calling Active
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-zinc-200 flex items-center gap-0.5"
            >
              <span>Minimize</span>
              <IconChevronDown className="size-3" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
