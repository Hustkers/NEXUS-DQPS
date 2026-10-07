'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  IconSend,
  IconUser,
  IconCode,
  IconCheck,
  IconSparkles,
  IconTrash,
  IconChevronDown,
  IconChevronRight,
  IconBolt,
  IconChartBar,
  IconBox,
} from '@tabler/icons-react';
import { executeAssistantTurn } from './tools';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  toolCall?: {
    name: string;
    args: any;
    result: any;
  };
}

interface AssistantChatProps {
  onToolExecuted?: (toolName: string, result: any) => void;
  router?: any;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm-init',
    sender: 'assistant',
    text: 'NEXUS Autonomous Copilot online. I possess direct tool-calling capabilities to execute budget reallocations, query live ROAS telemetry, audit inventory levels, and inject simulator shocks.',
    timestamp: 'Just now',
  },
];

export function AssistantChat({ onToolExecuted, router }: AssistantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isProcessing) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    try {
      const response = await executeAssistantTurn(text, router);

      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: response.replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCall: response.toolCall,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (response.toolCall && onToolExecuted) {
        onToolExecuted(response.toolCall.name, response.toolCall.result);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-err-${Date.now()}`,
          sender: 'assistant',
          text: `An error occurred while executing command: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `m-${Date.now()}`,
        sender: 'assistant',
        text: 'Session reset. Telemetry connection active. Ready for executive directives.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[380px] text-xs font-mono">
      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 scroll-smooth">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                {isUser ? (
                  <>
                    <span className="text-[10px] text-zinc-400 font-mono">Operator</span>
                    <IconUser className="size-3 text-zinc-400" />
                  </>
                ) : (
                  <>
                    <IconSparkles className="size-3 text-emerald-400" />
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                      NEXUS Copilot
                    </span>
                  </>
                )}
                <span className="text-[9px] text-zinc-400 font-mono">· {m.timestamp}</span>
              </div>

              <div
                className={`rounded-xl px-3.5 py-2.5 max-w-[92%] leading-relaxed text-[11px] font-sans ${
                  isUser
                    ? 'bg-zinc-800 text-zinc-100 rounded-tr-xs'
                    : 'bg-zinc-900/90 border border-zinc-800 text-zinc-200 rounded-tl-xs shadow-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>

                {/* Self-Contained Function Calling Visualization Card */}
                {m.toolCall && (
                  <div className="mt-2.5 pt-2 border-t border-zinc-800 font-mono text-[10px]">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedToolId(expandedToolId === m.id ? null : m.id)
                      }
                      className="w-full flex items-center justify-between gap-2 p-1.5 rounded-lg bg-zinc-950/80 border border-emerald-500/30 text-emerald-400 cursor-pointer hover:bg-zinc-950 transition-colors text-left"
                    >
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <IconCode className="size-3.5 shrink-0 text-emerald-400" />
                        <span className="font-bold text-zinc-200 truncate">
                          tool: {m.toolCall.name}()
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1 py-0 h-4 border-emerald-500/40 text-emerald-300 bg-emerald-950/40"
                        >
                          <IconCheck className="size-2.5 mr-0.5" />
                          Executed
                        </Badge>
                        {expandedToolId === m.id ? (
                          <IconChevronDown className="size-3 text-zinc-400" />
                        ) : (
                          <IconChevronRight className="size-3 text-zinc-400" />
                        )}
                      </div>
                    </button>

                    {/* Expandable Tool Payload Inspector */}
                    {expandedToolId === m.id && (
                      <div className="mt-1.5 p-2 rounded-lg bg-black/80 border border-zinc-800/80 text-zinc-300 overflow-x-auto text-[10px] leading-tight max-h-36">
                        <p className="text-zinc-400 font-semibold mb-1">Function Output Data:</p>
                        <pre className="font-mono text-emerald-400/90 whitespace-pre">
                          {JSON.stringify(m.toolCall.result.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 text-zinc-400 text-[11px] font-mono w-fit animate-pulse">
            <IconSparkles className="size-3.5 text-emerald-400 animate-spin" />
            <span>Analyzing prompt & invoking autonomous tools...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Function Calls */}
      <div className="px-3 py-1.5 border-t border-zinc-800/80 bg-zinc-950/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => handleSendMessage('Authorize reallocation directive')}
          className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md border border-emerald-900/50 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/40 text-[10px] transition-colors"
        >
          <IconBolt className="size-2.5" />
          Authorize Reallocation
        </button>

        <button
          onClick={() => handleSendMessage('What is our blended ROAS?')}
          className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md border border-cyan-900/50 bg-cyan-950/20 text-cyan-400 hover:bg-cyan-950/40 text-[10px] transition-colors"
        >
          <IconChartBar className="size-2.5" />
          Blended ROAS
        </button>

        <button
          onClick={() => handleSendMessage('Check inventory stockout risk')}
          className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md border border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-850 text-[10px] transition-colors"
        >
          <IconBox className="size-2.5" />
          Stockout Audit
        </button>

        <button
          onClick={clearChat}
          className="ml-auto shrink-0 p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
          title="Clear session history"
        >
          <IconTrash className="size-3" />
        </button>
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center gap-2"
      >
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type directive (e.g., 'Authorize plan', 'Check ROAS')..."
          className="h-8 bg-zinc-900/80 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs font-sans rounded-lg focus-visible:ring-emerald-500"
          disabled={isProcessing}
        />

        <Button
          type="submit"
          size="sm"
          disabled={!inputValue.trim() || isProcessing}
          className="h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shrink-0"
        >
          <IconSend className="size-3.5" />
        </Button>
      </form>
    </div>
  );
}
