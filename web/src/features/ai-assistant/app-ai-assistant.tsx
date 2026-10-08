'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconSparkles,
  IconMicrophone,
  IconMessageChatbot,
  IconSearch,
  IconChartLine,
  IconX,
  IconChevronDown,
  IconMaximize,
  IconMinimize,
} from '@tabler/icons-react';
import { AssistantSearch } from './assistant-search';
import { AssistantVoice } from './assistant-voice';
import { AssistantChat } from './assistant-chat';
import { AssistantGraphsView } from './assistant-graphs-view';
import { useAiAssistant } from './use-ai-assistant';
import { Kbd } from '@/components/ui/kbd';
import engineState from '@/data/nexus-engine-state.json';

export function AppAiAssistant() {
  const router = useRouter();
  const {
    isOpen,
    activeTab,
    initialChatPrompt,
    open,
    close,
    toggle,
    setActiveTab,
    setInitialChatPrompt,
  } = useAiAssistant();

  const [isMaximized, setIsMaximized] = useState(false);

  // Keyboard Shortcuts: Cmd+K opens search; Cmd+J toggles assistant; Cmd+G opens graphs; Escape closes it
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
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        open('graphs');
      } else if (e.key === 'Escape' && isOpen) {
        close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, open, close, toggle]);

  const telemetry = engineState.telemetry;

  return (
    <>
      {/* Floating Utilitarian Action Launcher - Fixed on the Bottom Center */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
        <button
          onClick={() => toggle()}
          aria-expanded={isOpen}
          aria-label="Toggle Autonomous AI Decision Copilot"
          className={`group flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border transition-colors shadow-lg ${
            isOpen
              ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
              : 'bg-zinc-950/95 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white'
          }`}
        >
          {/* Static Status Dot (no cartoon pulse) */}
          <div className="relative flex items-center justify-center">
            <span className="size-2 rounded-full bg-emerald-400" />
          </div>

          {/* Title in stark monospace */}
          <div className="flex items-center gap-1.5 text-xs font-mono font-medium tracking-tight">
            <span>NEXUS COPILOT</span>
          </div>

          {/* Quick shortcuts */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-800 text-[10px] text-zinc-500 font-mono">
            <span className="hidden sm:inline">Telemetry &amp; Actions</span>
            <Kbd className="text-[9px] px-1.5 py-0.5 bg-zinc-900 border-zinc-800 text-zinc-400">
              ⌘K
            </Kbd>
          </div>
        </button>
      </div>

      {/* Backdrop blur when Coach Window is open */}
      {isOpen && (
        <div
          onClick={close}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Enlarged Minimalist Assistant Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className={`fixed z-50 rounded-xl border border-zinc-700/80 bg-zinc-950/95 backdrop-blur-md text-zinc-100 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] ring-1 ring-white/10 overflow-hidden flex flex-col transition-all duration-200 animate-in fade-in zoom-in-95 ${
            isMaximized
              ? 'inset-3 sm:inset-6 w-auto h-auto max-w-none max-h-none'
              : 'bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 w-[96vw] max-w-5xl h-[720px] max-h-[88vh]'
          }`}
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/40 shrink-0">
            {/* System Title & Live Engine Badge */}
            <div className="flex items-center gap-2.5">
              <div className="size-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <IconSparkles className="size-3.5 text-emerald-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-zinc-100 tracking-tight">
                  NEXUS DECISION COPILOT
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400">
                  CYC-9482 · LIVE
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-emerald-800/40 bg-emerald-950/30 text-emerald-400 font-semibold">
                  gemini-3.8-flash
                </span>
              </div>
            </div>

            {/* Clean Tab Switcher: Chat (Terminal), Graphs, Voice, Search */}
            <div className="flex items-center gap-1 p-0.5 rounded border border-zinc-800 bg-zinc-950">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-mono transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <IconMessageChatbot className="size-3 text-emerald-400" />
                <span>Terminal &amp; Stream</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('graphs')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-mono transition-colors ${
                  activeTab === 'graphs'
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <IconChartLine className="size-3 text-cyan-400" />
                <span>Visualizer</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('voice')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-mono transition-colors ${
                  activeTab === 'voice'
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <IconMicrophone className="size-3 text-zinc-400" />
                <span>Audio Briefing</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-mono transition-colors ${
                  activeTab === 'search'
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <IconSearch className="size-3 text-zinc-400" />
                <span>Search</span>
              </button>
            </div>

            {/* Window Controls: Maximize / Minimize / Close */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsMaximized(!isMaximized)}
                className="size-7 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 flex items-center justify-center transition-colors"
                title={isMaximized ? 'Restore window' : 'Maximize window'}
              >
                {isMaximized ? (
                  <IconMinimize className="size-3.5" />
                ) : (
                  <IconMaximize className="size-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={close}
                className="size-7 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 flex items-center justify-center transition-colors"
                title="Close Assistant (Esc)"
              >
                <IconX className="size-4" />
              </button>
            </div>
          </div>

          {/* Real-time Telemetry Status Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 py-2 border-b border-zinc-800/80 bg-zinc-950 font-mono text-[10px] shrink-0">
            <div className="flex items-center justify-between sm:justify-start sm:gap-2">
              <span className="text-zinc-500 uppercase">Blended ROAS:</span>
              <span className="font-bold text-emerald-400">{telemetry.blendedRoas30d}x</span>
              <span className="text-zinc-600 text-[9px]">(Target: {telemetry.targetRoas}x)</span>
            </div>
            <div className="flex items-center justify-between sm:justify-start sm:gap-2">
              <span className="text-zinc-500 uppercase">30D Realized Margin:</span>
              <span className="font-bold text-zinc-200">${(telemetry.totalMargin30d / 1_000_000).toFixed(1)}M</span>
            </div>
            <div className="flex items-center justify-between sm:justify-start sm:gap-2">
              <span className="text-zinc-500 uppercase">Capital Reallocated:</span>
              <span className="font-bold text-cyan-400">${(telemetry.reallocationCapitalMoved / 1_000_000).toFixed(2)}M</span>
            </div>
            <div className="flex items-center justify-between sm:justify-start sm:gap-2">
              <span className="text-zinc-500 uppercase">Active Stockout:</span>
              <span className="font-bold text-rose-400">1 SKU (AF1 '07)</span>
            </div>
          </div>

          {/* Active Tab View */}
          <div className="flex-1 min-h-0 bg-zinc-950 overflow-hidden">
            {activeTab === 'chat' && (
              <AssistantChat
                router={router}
                initialPrompt={initialChatPrompt}
                onClearInitialPrompt={() => setInitialChatPrompt(undefined)}
              />
            )}
            {activeTab === 'graphs' && (
              <AssistantGraphsView
                router={router}
                onSwitchToChat={(prompt) => {
                  setInitialChatPrompt(prompt);
                  setActiveTab('chat');
                }}
              />
            )}
            {activeTab === 'voice' && <AssistantVoice router={router} />}
            {activeTab === 'search' && <AssistantSearch />}
          </div>

          {/* Minimalist Sub-Footer */}
          <div className="px-4 py-1.5 bg-zinc-900/40 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-500 shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="size-1 rounded-full bg-emerald-500" />
              <span>Engine: PostgreSQL 16 &amp; DuckDB Telemetry Ledger · Scipy SLSQP Optimization</span>
            </span>
            <button
              type="button"
              onClick={close}
              className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
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
