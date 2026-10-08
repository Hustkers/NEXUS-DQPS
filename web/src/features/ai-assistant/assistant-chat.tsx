'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  IconSend,
  IconCode,
  IconCheck,
  IconSparkles,
  IconTrash,
  IconChevronDown,
  IconChevronRight,
  IconBolt,
  IconChartBar,
  IconChartLine,
  IconBox,
  IconCpu,
  IconMicrophone,
  IconMicrophoneOff,
  IconAlertTriangle,
  IconShieldCheck,
  IconArrowRight,
  IconFileText,
  IconWorld,
  IconMapPin,
  IconCurrencyDollar,
} from '@tabler/icons-react';
import { executeAssistantTurn } from './tools';
import { AssistantGraphRenderer, type AssistantGraphConfig } from './assistant-graph-renderer';
import { toast } from 'sonner';

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
  graph?: AssistantGraphConfig;
}

interface AssistantChatProps {
  onToolExecuted?: (toolName: string, result: any) => void;
  router?: any;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm-init',
    sender: 'assistant',
    text: 'NEXUS Autonomous Decision Engine online [Cycle CYC-9482]. Real-time telemetry connected to PostgreSQL & DuckDB. Direct tool execution ready for budget reallocations, multi-channel ROAS telemetry, SKU inventory audits, and Google Cloud Vertex AI reasoning.',
    timestamp: '11:46:03 UTC',
  },
];

export function AssistantChat({
  onToolExecuted,
  router,
  initialPrompt,
  onClearInitialPrompt,
}: AssistantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const handleSendMessage = useCallback(
    async (textToSend?: string) => {
      const text = (textToSend || inputValue).trim();
      if (!text || isProcessing) return;

      const userMessage: ChatMessage = {
        id: `usr-${Date.now()}`,
        sender: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
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
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          toolCall: response.toolCall,
          graph: response.graph,
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
            text: `Execution failed: ${err.message}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          },
        ]);
      } finally {
        setIsProcessing(false);
      }
    },
    [inputValue, isProcessing, onToolExecuted, router]
  );

  useEffect(() => {
    if (initialPrompt) {
      const timer = setTimeout(() => {
        handleSendMessage(initialPrompt);
        if (onClearInitialPrompt) {
          onClearInitialPrompt();
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialPrompt, handleSendMessage, onClearInitialPrompt]);

  const startVoiceDictation = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.info('Browser microphone dictation unavailable. Please enter command manually.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setInputValue(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (inputValue.trim()) {
          handleSendMessage(inputValue.trim());
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (_e) {
      setIsListening(false);
    }
  };

  const stopVoiceDictation = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setIsListening(false);
  };

  const clearChat = () => {
    setMessages([
      {
        id: `m-${Date.now()}`,
        sender: 'assistant',
        text: 'Session reset. Telemetry stream connected [CYC-9482]. Ready for operator directive.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full font-mono text-xs">
      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scroll-smooth">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          const toolData = m.toolCall?.result?.data;

          return (
            <div key={m.id} className="flex flex-col gap-1.5 w-full">
              {isUser ? (
                /* Stark Terminal Prompt Line for User */
                <div className="flex items-center gap-2.5 py-2 px-3.5 rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-200">
                  <span className="text-emerald-400 font-bold select-none">&gt;</span>
                  <span className="font-medium text-xs text-zinc-100 flex-1">{m.text}</span>
                  <span className="text-[10px] text-zinc-500 font-mono shrink-0">{m.timestamp}</span>
                </div>
              ) : (
                /* Full-Width Dense Bento Panel for Assistant Response */
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-4 space-y-3 text-zinc-200">
                  {/* Assistant Meta Header */}
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="size-4.5 rounded bg-emerald-950 border border-emerald-500/40 flex items-center justify-center">
                        <IconSparkles className="size-3 text-emerald-400" />
                      </div>
                      <span className="text-[11px] font-bold text-zinc-200 tracking-tight">
                        NEXUS COPILOT
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        CYC-9482
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">{m.timestamp}</span>
                  </div>

                  {/* Editorial Text Statement */}
                  <div className="text-[11px] font-sans text-zinc-300 leading-relaxed">
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  </div>

                  {/* SPECIALIZED DATA-BACKED PANELS ACCORDING TO EXECUTED TOOL */}

                  {/* 1. Immutable Ledger Receipt for Reallocation */}
                  {m.toolCall?.name === 'authorize_reallocation' && toolData && (
                    <div className="rounded-md border border-emerald-500/30 bg-emerald-950/10 p-3 space-y-2.5 font-mono text-[10px]">
                      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1.5">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <IconShieldCheck className="size-3.5" />
                          <span>LEDGER AUDIT RECEIPT</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400 text-[9px] font-mono">
                            ID: {toolData.receiptId}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                            {toolData.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-1 text-zinc-300">
                        <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800">
                          <span className="text-[9px] text-zinc-500 block uppercase">Throttled Spend</span>
                          <span className="text-rose-400 font-semibold">{toolData.throttledSpend}</span>
                        </div>
                        <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800">
                          <span className="text-[9px] text-zinc-500 block uppercase">Scaled Channels</span>
                          <span className="text-emerald-400 font-semibold truncate block" title={toolData.scaledSpend}>
                            Google + Amazon
                          </span>
                        </div>
                        <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800">
                          <span className="text-[9px] text-zinc-500 block uppercase">24h Margin Delta</span>
                          <span className="text-emerald-400 font-bold text-xs">{toolData.recoveredMargin}</span>
                        </div>
                        <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800">
                          <span className="text-[9px] text-zinc-500 block uppercase">Annualized Uplift</span>
                          <span className="text-zinc-100 font-bold text-xs">{toolData.annualizedMargin}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-zinc-400 border-t border-zinc-800/80 pt-1.5">
                        <span className="truncate">
                          Commit Hash: <code className="text-zinc-300">{toolData.ledgerHash}</code>
                        </span>
                        <span className="shrink-0 font-medium text-emerald-400">
                          Confidence: {toolData.confidence}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 2. Omnichannel Telemetry Matrix Table */}
                  {m.toolCall?.name === 'get_channel_metrics' && toolData?.platforms && (
                    <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-3 space-y-2 font-mono text-[10px]">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                        <span className="text-zinc-300 font-bold flex items-center gap-1.5">
                          <IconChartBar className="size-3.5 text-cyan-400" />
                          <span>OMNICHANNEL PERFORMANCE MATRIX (30-DAY)</span>
                        </span>
                        <span className="text-emerald-400 font-bold">
                          Blended ROAS: {toolData.blendedRoas}
                        </span>
                      </div>

                      {/* Dense Data Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-800 text-zinc-500 text-[9px] uppercase">
                              <th className="py-1 px-1.5">Channel</th>
                              <th className="py-1 px-1.5 text-right">30D Spend</th>
                              <th className="py-1 px-1.5 text-right">Revenue</th>
                              <th className="py-1 px-1.5 text-right">Net Margin</th>
                              <th className="py-1 px-1.5 text-right">ROAS</th>
                              <th className="py-1 px-1.5 text-right">POAS</th>
                              <th className="py-1 px-1.5 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900 text-zinc-300">
                            {toolData.platforms.map((p: any) => (
                              <tr key={p.key} className="hover:bg-zinc-900/40 transition-colors">
                                <td className="py-1.5 px-1.5 font-medium text-zinc-100">{p.platform}</td>
                                <td className="py-1.5 px-1.5 text-right text-zinc-400">{p.spend30d}</td>
                                <td className="py-1.5 px-1.5 text-right text-zinc-200">{p.revenue30d}</td>
                                <td className="py-1.5 px-1.5 text-right font-semibold text-emerald-400">{p.margin30d}</td>
                                <td className="py-1.5 px-1.5 text-right font-bold text-zinc-100">{p.roas}</td>
                                <td className="py-1.5 px-1.5 text-right text-zinc-400">{p.poas}</td>
                                <td className="py-1.5 px-1.5 text-center">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                      p.status.includes('OPTIMAL')
                                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                                    }`}
                                  >
                                    {p.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-zinc-500 border-t border-zinc-800 pt-1.5">
                        <span>Total 30D Spend: {toolData.totalSpend30d}</span>
                        <span>Total 30D Revenue: {toolData.totalRevenue30d}</span>
                        <span className="text-zinc-300 font-semibold">Total Margin: {toolData.totalMargin30d}</span>
                      </div>
                    </div>
                  )}

                  {/* 3. SKU Inventory & Stockout Diagnostics */}
                  {m.toolCall?.name === 'check_inventory_status' && toolData && (
                    <div className="rounded-md border border-rose-500/30 bg-rose-950/10 p-3 space-y-2.5 font-mono text-[10px]">
                      <div className="flex items-center justify-between border-b border-rose-500/20 pb-1.5">
                        <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                          <IconAlertTriangle className="size-3.5" />
                          <span>STOCKOUT DIAGNOSTIC: {toolData.sku}</span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                          {toolData.severity}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-zinc-300">
                        <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800">
                          <span className="text-[9px] text-zinc-500 block">Product</span>
                          <span className="font-semibold text-zinc-200 truncate block">{toolData.productName}</span>
                        </div>
                        <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800">
                          <span className="text-[9px] text-zinc-500 block">Units on Hand</span>
                          <span className="font-bold text-rose-400 text-xs">{toolData.inventoryOnHand} units</span>
                        </div>
                        <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800">
                          <span className="text-[9px] text-zinc-500 block">Daily Burn Velocity</span>
                          <span className="font-semibold text-zinc-200">{toolData.dailyBurnVelocity}</span>
                        </div>
                        <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800">
                          <span className="text-[9px] text-zinc-500 block">Days of Cover</span>
                          <span className="font-bold text-rose-400 text-xs">{toolData.daysOfCover}</span>
                        </div>
                      </div>

                      <div className="p-2 rounded bg-zinc-950/80 border border-zinc-800 text-[9px] space-y-1">
                        <p className="text-zinc-300">
                          <strong className="text-rose-400">Causal Impact:</strong> {toolData.adSpendImpact}
                        </p>
                        <p className="text-zinc-400">
                          <strong className="text-emerald-400">Recommended Redirection:</strong> {toolData.recommendedAction}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 4. Google Cloud Vertex AI Status Panel */}
                  {m.toolCall?.name === 'check_vertex_ai_status' && toolData && (
                    <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-3 space-y-2 font-mono text-[10px]">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 text-zinc-300">
                        <span className="font-semibold flex items-center gap-1.5">
                          <IconCpu className="size-3.5 text-emerald-400" />
                          <span>GOOGLE CLOUD VERTEX AI TELEMETRY</span>
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          AUTHENTICATED
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-zinc-300 text-[10px]">
                        <div>
                          <span className="text-[9px] text-zinc-500 block">Provider</span>
                          <span className="font-semibold text-zinc-200">{toolData.provider}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-500 block">Reasoning Model</span>
                          <span className="font-semibold text-emerald-400">{toolData.model_name}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-500 block">GCP Region</span>
                          <span className="font-semibold text-zinc-200">{toolData.location}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-500 block">Credentials</span>
                          <span className="font-semibold text-zinc-200">{toolData.auth_method}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. CPM & Auction Clearing Intelligence Panel */}
                  {m.toolCall?.name === 'get_cpm_analytics' && toolData && (
                    <div className="rounded-md border border-cyan-500/30 bg-cyan-950/10 p-3 space-y-2.5 font-mono text-[10px]">
                      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1.5">
                        <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                          <IconCurrencyDollar className="size-3.5" />
                          <span>
                            {toolData.isIndiaTarget
                              ? 'REGIONAL AUCTION TELEMETRY: SOUTH ASIA (INDIA HUB)'
                              : 'GLOBAL CPM AUCTION BENCHMARKS'}
                          </span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                          {toolData.isIndiaTarget && toolData.indiaMetrics
                            ? `CPM: $${toolData.indiaMetrics.cpm.toFixed(2)} / ₹${toolData.indiaMetrics.cpmInr.toLocaleString()}`
                            : '8 HUBS COMPILED'}
                        </span>
                      </div>

                      {toolData.isIndiaTarget && toolData.indiaMetrics ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-zinc-300">
                            <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800">
                              <span className="text-[9px] text-zinc-500 block">India CPM Rate</span>
                              <span className="font-bold text-cyan-400 text-xs">
                                ${toolData.indiaMetrics.cpm.toFixed(2)}
                              </span>
                              <span className="text-[9px] text-zinc-400 block font-sans">
                                ₹{toolData.indiaMetrics.cpmInr.toLocaleString()} / 1k Imp
                              </span>
                            </div>
                            <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800">
                              <span className="text-[9px] text-zinc-500 block">CTR &amp; CPC</span>
                              <span className="font-semibold text-zinc-200">
                                {toolData.indiaMetrics.ctr}% CTR
                              </span>
                              <span className="text-[9px] text-zinc-400 block font-sans">
                                ${toolData.indiaMetrics.cpc.toFixed(2)} CPC (₹{Math.round(toolData.indiaMetrics.cpc * 83)})
                              </span>
                            </div>
                            <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800">
                              <span className="text-[9px] text-zinc-500 block">Realized ROAS</span>
                              <span className="font-bold text-emerald-400 text-xs">
                                {toolData.indiaMetrics.roas}x
                              </span>
                              <span className="text-[9px] text-zinc-400 block font-sans">
                                Margin: {toolData.indiaMetrics.marginPct}%
                              </span>
                            </div>
                            <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800">
                              <span className="text-[9px] text-zinc-500 block">Fulfillment Node</span>
                              <span className="font-semibold text-zinc-200 truncate block text-[9px]">
                                {toolData.indiaMetrics.fulfillmentCenter}
                              </span>
                              <span className="text-[9px] text-emerald-400 block truncate">
                                SKU: {toolData.indiaMetrics.topSku}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-zinc-800 text-zinc-500 text-[9px] uppercase">
                                <th className="py-1 px-1.5">Region / Platform</th>
                                <th className="py-1 px-1.5 text-right">Spend</th>
                                <th className="py-1 px-1.5 text-right">Impressions</th>
                                <th className="py-1 px-1.5 text-right">Effective CPM</th>
                                <th className="py-1 px-1.5 text-right">ROAS</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900 text-zinc-300">
                              {toolData.regionalCpms?.map((r: any) => (
                                <tr key={r.id} className="hover:bg-zinc-900/40">
                                  <td className="py-1 px-1.5 font-medium text-zinc-200">{r.name}</td>
                                  <td className="py-1 px-1.5 text-right text-zinc-400">${r.spend.toLocaleString()}</td>
                                  <td className="py-1 px-1.5 text-right text-zinc-400">{r.impressions.toLocaleString()}</td>
                                  <td className="py-1 px-1.5 text-right font-bold text-cyan-400">${r.cpm.toFixed(2)}</td>
                                  <td className="py-1 px-1.5 text-right font-semibold text-emerald-400">{r.roas}x</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 6. Regional Geographic Telemetry Panel */}
                  {m.toolCall?.name === 'get_regional_telemetry' && toolData && (
                    <div className="rounded-md border border-emerald-500/30 bg-emerald-950/10 p-3 space-y-2.5 font-mono text-[10px]">
                      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1.5">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <IconWorld className="size-3.5" />
                          <span>
                            {toolData.selectedRegion
                              ? `REGIONAL TELEMETRY: ${toolData.selectedRegion.name.toUpperCase()}`
                              : 'GLOBAL GEOGRAPHIC TELEMETRY MATRIX'}
                          </span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          {toolData.selectedRegion
                            ? `ROAS: ${toolData.selectedRegion.roas.toFixed(2)}x`
                            : `TOTAL REV: $${toolData.totalRegionalRevenue?.toLocaleString()}`}
                        </span>
                      </div>

                      {toolData.selectedRegion ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-zinc-300">
                          <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800">
                            <span className="text-[9px] text-zinc-500 block">Ad Spend</span>
                            <span className="font-semibold text-zinc-200">${toolData.selectedRegion.spend.toLocaleString()}</span>
                          </div>
                          <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800">
                            <span className="text-[9px] text-zinc-500 block">Gross Revenue</span>
                            <span className="font-bold text-emerald-400 text-xs">${toolData.selectedRegion.revenue.toLocaleString()}</span>
                          </div>
                          <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800">
                            <span className="text-[9px] text-zinc-500 block">Realized Profit</span>
                            <span className="font-semibold text-emerald-400">${toolData.selectedRegion.profit.toFixed(2)}</span>
                          </div>
                          <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800">
                            <span className="text-[9px] text-zinc-500 block">Fulfillment Hub</span>
                            <span className="font-semibold text-zinc-200 truncate block text-[9px]">{toolData.selectedRegion.fulfillmentCenter}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-zinc-800 text-zinc-500 text-[9px] uppercase">
                                <th className="py-1 px-1.5">Region Hub</th>
                                <th className="py-1 px-1.5 text-right">Spend</th>
                                <th className="py-1 px-1.5 text-right">Revenue</th>
                                <th className="py-1 px-1.5 text-right">Margin %</th>
                                <th className="py-1 px-1.5 text-right">ROAS</th>
                                <th className="py-1 px-1.5 text-left">Fulfillment Node</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900 text-zinc-300">
                              {toolData.allRegions?.map((r: any) => (
                                <tr key={r.id} className="hover:bg-zinc-900/40">
                                  <td className="py-1 px-1.5 font-medium text-zinc-200">{r.name}</td>
                                  <td className="py-1 px-1.5 text-right text-zinc-400">${r.spend.toLocaleString()}</td>
                                  <td className="py-1 px-1.5 text-right text-zinc-200">${r.revenue.toLocaleString()}</td>
                                  <td className="py-1 px-1.5 text-right text-zinc-400">{(r.marginRate * 100).toFixed(0)}%</td>
                                  <td className="py-1 px-1.5 text-right font-bold text-emerald-400">{r.roas.toFixed(2)}x</td>
                                  <td className="py-1 px-1.5 text-zinc-400 truncate max-w-[140px] text-[9px]">{r.fulfillmentCenter}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 7. Campaign Audit Ledger Panel */}
                  {m.toolCall?.name === 'get_campaign_analytics' && toolData?.campaigns && (
                    <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-3 space-y-2 font-mono text-[10px]">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 text-zinc-300">
                        <span className="font-semibold flex items-center gap-1.5">
                          <IconBolt className="size-3.5 text-amber-400" />
                          <span>ACTIVE CAMPAIGN AUDIT LEDGER</span>
                        </span>
                        <span className="text-zinc-400 text-[9px]">
                          Matched: {toolData.matchedCount} of {toolData.totalCampaigns}
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-800 text-zinc-500 text-[9px] uppercase">
                              <th className="py-1 px-1.5">Product</th>
                              <th className="py-1 px-1.5">Platform</th>
                              <th className="py-1 px-1.5 text-right">Daily Spend</th>
                              <th className="py-1 px-1.5 text-right">ROAS</th>
                              <th className="py-1 px-1.5 text-right">Inventory</th>
                              <th className="py-1 px-1.5 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900 text-zinc-300">
                            {toolData.campaigns.map((c: any) => (
                              <tr key={c.campaign} className="hover:bg-zinc-900/40">
                                <td className="py-1 px-1.5 font-medium text-zinc-200">{c.productName}</td>
                                <td className="py-1 px-1.5 uppercase text-zinc-400">{c.platform}</td>
                                <td className="py-1 px-1.5 text-right text-zinc-300">${c.currentDailySpend?.toLocaleString()}</td>
                                <td className="py-1 px-1.5 text-right font-bold text-emerald-400">{c.roas}x</td>
                                <td className="py-1 px-1.5 text-right text-zinc-300">{c.inventory} u</td>
                                <td className="py-1 px-1.5 text-center">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                      c.roasStatus === 'ABOVE_TARGET'
                                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                                    }`}
                                  >
                                    {c.roasStatus}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Inline Recharts Graph (Line Chart or Bar Graph) */}
                  {m.graph && (
                    <div className="mt-2 pt-1">
                      <AssistantGraphRenderer config={m.graph} />
                    </div>
                  )}

                  {/* Verifiable Function Tool Call Header + Expandable Raw JSON */}
                  {m.toolCall && (
                    <div className="pt-2 border-t border-zinc-800/80 font-mono text-[10px]">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedToolId(expandedToolId === m.id ? null : m.id)
                        }
                        className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer py-0.5"
                      >
                        <IconCode className="size-3" />
                        <span>Inspect Raw Tool Payload ({m.toolCall.name})</span>
                        {expandedToolId === m.id ? (
                          <IconChevronDown className="size-3" />
                        ) : (
                          <IconChevronRight className="size-3" />
                        )}
                      </button>

                      {expandedToolId === m.id && (
                        <div className="mt-2 p-2.5 rounded bg-black/90 border border-zinc-800 text-zinc-300 overflow-x-auto text-[9px] max-h-48 leading-relaxed">
                          <pre className="font-mono text-emerald-400 whitespace-pre">
                            {JSON.stringify(m.toolCall.result.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center gap-2 py-2 px-3 rounded border border-zinc-800 bg-zinc-900/40 text-zinc-400 text-[11px] font-mono w-fit animate-pulse">
            <IconSparkles className="size-3.5 text-emerald-400 animate-spin" />
            <span>Computing optimal allocation & querying DuckDB...</span>
          </div>
        )}
      </div>

      {/* Direct Executive Action Chips */}
      <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-950 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <button
          type="button"
          onClick={() => handleSendMessage('Authorize reallocation directive')}
          className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-950/40 text-[10px] font-mono transition-colors"
        >
          <IconBolt className="size-3 text-emerald-400" />
          <span>Authorize Reallocation (+$1,148)</span>
        </button>

        <button
          type="button"
          onClick={() => handleSendMessage('Show ROAS trend line chart')}
          className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded border border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800 text-[10px] font-mono transition-colors"
        >
          <IconChartLine className="size-3 text-cyan-400" />
          <span>ROAS Trajectory</span>
        </button>

        <button
          type="button"
          onClick={() => handleSendMessage('Audit inventory stockout risk')}
          className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded border border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800 text-[10px] font-mono transition-colors"
        >
          <IconBox className="size-3 text-rose-400" />
          <span>SKU Stockout Audit</span>
        </button>

        <button
          type="button"
          onClick={() => handleSendMessage('Render bar graph of channel spend vs margin')}
          className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded border border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800 text-[10px] font-mono transition-colors"
        >
          <IconChartBar className="size-3 text-purple-400" />
          <span>Channel Mix Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => handleSendMessage('Check Google Cloud Vertex AI status')}
          className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded border border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800 text-[10px] font-mono transition-colors"
        >
          <IconCpu className="size-3 text-emerald-400" />
          <span>Vertex AI Status</span>
        </button>

        <button
          type="button"
          onClick={clearChat}
          className="ml-auto shrink-0 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
          title="Reset stream session"
        >
          <IconTrash className="size-3.5" />
        </button>
      </div>

      {/* Terminal Omnibar Command Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center gap-2 shrink-0"
      >
        <div className="relative flex-1 flex items-center">
          <span className="absolute left-3 text-zinc-500 font-bold select-none text-xs">&gt;</span>
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isListening ? 'Listening... Speak directive...' : 'Enter directive (e.g., "Authorize plan", "Query ROAS", "Check stockouts")...'}
            className="w-full h-9 pl-7 pr-10 rounded border border-zinc-800 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500 text-xs font-mono focus:outline-hidden focus:border-zinc-600 transition-colors"
            disabled={isProcessing}
          />

          {/* Inline Microphone Dictation Toggle */}
          <button
            type="button"
            onClick={isListening ? stopVoiceDictation : startVoiceDictation}
            title={isListening ? 'Stop recording' : 'Dictate directive by speech'}
            className={`absolute right-2 p-1 rounded transition-colors ${
              isListening
                ? 'text-rose-400 hover:text-rose-300 bg-rose-950/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {isListening ? (
              <IconMicrophoneOff className="size-4 animate-pulse" />
            ) : (
              <IconMicrophone className="size-4" />
            )}
          </button>
        </div>

        <Button
          type="submit"
          size="sm"
          disabled={!inputValue.trim() || isProcessing}
          className="h-9 px-4 bg-zinc-100 hover:bg-white text-zinc-900 font-mono font-semibold text-xs rounded shrink-0 transition-colors"
        >
          <span>Execute</span>
          <IconSend className="size-3.5 ml-1" />
        </Button>
      </form>
    </div>
  );
}
