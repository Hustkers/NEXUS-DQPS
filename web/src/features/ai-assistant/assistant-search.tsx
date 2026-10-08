'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconSearch,
  IconArrowRight,
  IconBolt,
  IconChartBar,
  IconBox,
  IconAlertTriangle,
  IconMicrophone,
  IconMessageChatbot,
  IconCompass,
  IconCpu,
} from '@tabler/icons-react';
import { navGroups } from '@/config/nav-config';
import { ASSISTANT_TOOLS } from './tools';
import { useAiAssistant } from './use-ai-assistant';
import { Kbd } from '@/components/ui/kbd';

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Navigation' | 'Autonomous Action' | 'Voice & AI';
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

export function AssistantSearch() {
  const router = useRouter();
  const { close, setActiveTab, searchQuery, setSearchQuery } = useAiAssistant();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const searchItems = useMemo<SearchItem[]>(() => {
    const items: SearchItem[] = [];

    // 1. Navigation items from navGroups
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.url && item.url !== '#') {
          items.push({
            id: `nav-${item.url}`,
            title: item.title,
            subtitle: `Navigate to ${item.title} (${group.label})`,
            category: 'Navigation',
            icon: <IconCompass className="size-4 text-zinc-400" />,
            shortcut: item.shortcut ? item.shortcut.join(' ') : undefined,
            action: () => {
              router.push(item.url);
              close();
            },
          });
        }
      }
    }

    // 2. Autonomous Tool Actions
    items.push({
      id: 'tool-auth',
      title: 'Authorize Budget Reallocation',
      subtitle: 'Execute atomic budget shift from stocked-out Meta Hero SKU to Google & Amazon (+$1,148/day margin)',
      category: 'Autonomous Action',
      icon: <IconBolt className="size-4 text-emerald-400" />,
      shortcut: '↵',
      action: async () => {
        await ASSISTANT_TOOLS.authorize_reallocation.execute({});
        close();
      },
    });

    items.push({
      id: 'tool-roas',
      title: 'Audit Multi-Channel ROAS Telemetry',
      subtitle: 'Inspect live blended ROAS (12.06x), POAS (7.64x), and 24h spend deployment',
      category: 'Autonomous Action',
      icon: <IconChartBar className="size-4 text-cyan-400" />,
      action: () => {
        setActiveTab('chat');
      },
    });

    items.push({
      id: 'tool-inventory',
      title: 'Audit SKU Stockout & Supply Risk',
      subtitle: 'Audit inventory burn velocity & detect ad campaigns spending on zero stock',
      category: 'Autonomous Action',
      icon: <IconBox className="size-4 text-rose-400" />,
      action: () => {
        setActiveTab('chat');
      },
    });

    items.push({
      id: 'tool-shock',
      title: 'Simulate Operational Shock Scenario',
      subtitle: 'Inject stockout cascade scenario and evaluate fail-safe mitigation',
      category: 'Autonomous Action',
      icon: <IconAlertTriangle className="size-4 text-amber-400" />,
      action: async () => {
        await ASSISTANT_TOOLS.trigger_scenario.execute({ scenarioType: 'stockout_cascade' });
        close();
      },
    });

    // 3. AI & Voice Directives
    items.push({
      id: 'ai-voice-briefing',
      title: 'Start Executive Audio Briefing',
      subtitle: 'Listen to spoken situation report and issue verbal authorization',
      category: 'Voice & AI',
      icon: <IconMicrophone className="size-4 text-zinc-300" />,
      action: () => {
        setActiveTab('voice');
      },
    });

    items.push({
      id: 'ai-copilot-chat',
      title: 'Terminal Telemetry Copilot',
      subtitle: 'Direct function calling with full ledger receipts and Recharts telemetry graphs',
      category: 'Voice & AI',
      icon: <IconMessageChatbot className="size-4 text-emerald-400" />,
      action: () => {
        setActiveTab('chat');
      },
    });

    items.push({
      id: 'tool-vertex-ai',
      title: 'Google Cloud Vertex AI Telemetry',
      subtitle: 'Inspect Vertex AI connection status (gemini-3.8-flash via ADC)',
      category: 'Voice & AI',
      icon: <IconCpu className="size-4 text-emerald-400" />,
      action: () => {
        setSearchQuery('Check Google Cloud Vertex AI status');
        setActiveTab('chat');
      },
    });

    return items;
  }, [router, close, setActiveTab, setSearchQuery]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return searchItems;
    const q = searchQuery.toLowerCase();
    return searchItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [searchItems, searchQuery]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  return (
    <div className="flex flex-col h-full text-xs font-mono">
      {/* Search Omnibar Input */}
      <div className="relative p-3 border-b border-zinc-800 bg-zinc-950">
        <IconSearch className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
        <input
          ref={inputRef}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search navigation routes, execute autonomous actions, or query metrics..."
          className="w-full h-10 pl-10 pr-4 rounded border border-zinc-800 bg-zinc-900/70 text-zinc-100 placeholder:text-zinc-500 text-xs font-mono focus:outline-hidden focus:border-zinc-600 transition-colors"
        />
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 scroll-smooth">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-500 text-center gap-2">
            <IconSearch className="size-6 text-zinc-600" />
            <p className="text-xs">No matching routes or actions found.</p>
            <p className="text-[11px] text-zinc-600">
              Try searching for "reallocation", "ledger", "stockout", or "voice".
            </p>
          </div>
        ) : (
          filteredItems.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.action}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full flex items-center justify-between p-3 rounded text-left transition-colors border ${
                  isSelected
                    ? 'bg-zinc-850/90 border-zinc-700 text-zinc-100'
                    : 'border-transparent hover:bg-zinc-900/50 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`size-7 rounded flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-zinc-950 border-zinc-700'
                        : 'bg-zinc-900 border-zinc-800'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-zinc-100 truncate font-mono">
                        {item.title}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400 font-mono">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate font-sans mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pl-2">
                  {item.shortcut && (
                    <Kbd className="text-[9px] px-1.5 py-0.5 bg-zinc-900 border-zinc-800 text-zinc-400 uppercase">
                      {item.shortcut}
                    </Kbd>
                  )}
                  {isSelected && <IconArrowRight className="size-3 text-emerald-400" />}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Keyboard Helper Footer */}
      <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-[10px] text-zinc-500 font-mono shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Kbd className="text-[9px] px-1 py-0">↑↓</Kbd> Navigate
          </span>
          <span className="flex items-center gap-1">
            <Kbd className="text-[9px] px-1 py-0">↵</Kbd> Select
          </span>
          <span className="flex items-center gap-1">
            <Kbd className="text-[9px] px-1 py-0">esc</Kbd> Close
          </span>
        </div>
        <span className="text-zinc-400">
          {filteredItems.length} directives available
        </span>
      </div>
    </div>
  );
}
