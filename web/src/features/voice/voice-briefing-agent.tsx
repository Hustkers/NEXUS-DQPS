'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  IconRobot,
  IconMicrophone,
  IconVolume2,
  IconMessage2,
  IconCheck,
  IconLoader2
} from '@tabler/icons-react';
import { toast } from 'sonner';

export interface VoiceAgentProps {
  onAuthorizePlan?: (planId: string) => void;
  activeDirectiveId?: string;
}

export function VoiceBriefingAgent({
  onAuthorizePlan,
  activeDirectiveId = 'dir_meta_hero_shoe',
}: VoiceAgentProps) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'agent' | 'user'; text: string; time: string }>>([
    {
      sender: 'agent',
      text: 'NEXUS Autonomous Intelligence initialized. Monitoring 15 campaigns across Meta, Google, and Amazon.',
      time: '12:00:00',
    },
  ]);
  const [inputText, setInputText] = useState('');

  // Audio waveform animation timer
  const [waveHeights, setWaveHeights] = useState([12, 24, 18, 32, 20, 28, 14]);

  useEffect(() => {
    let interval: any;
    if (isSpeaking || isListening) {
      interval = setInterval(() => {
        setWaveHeights(waveHeights.map(() => Math.floor(Math.random() * 28) + 8));
      }, 120);
    } else {
      setWaveHeights([8, 12, 10, 14, 10, 12, 8]);
    }
    return () => clearInterval(interval);
  }, [isSpeaking, isListening]);

  const handleStartBriefing = () => {
    setIsSessionActive(true);
    setIsSpeaking(true);

    const briefingText =
      'Executive Briefing: ROAS on Meta Advantage Plus collapsed by 66% due to Hero SKU stockout in Shopify. Recommending immediate reallocation: shift ₹800 to Google Zoom Fly and Amazon Air Max. Projected margin recovery: +₹1,148. Do you authorize reallocation?';

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: 'agent', text: briefingText, time: new Date().toLocaleTimeString() },
      ]);
      setIsSpeaking(false);
      setIsListening(true);
      toast.info('Voice Agent listening: say "Authorize reallocation" or use chat fallback.');
    }, 2500);
  };

  const handleUserSpokenApproval = (userText: string = 'Authorize reallocation') => {
    setIsListening(false);
    setIsSpeaking(true);
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText, time: new Date().toLocaleTimeString() },
    ]);

    setTimeout(() => {
      const confirmText = 'Directive approved. Dispatched to Meta Graph API & Google Ads API. Budget shifts executed successfully.';
      setMessages((prev) => [
        ...prev,
        { sender: 'agent', text: confirmText, time: new Date().toLocaleTimeString() },
      ]);
      setIsSpeaking(false);
      setIsSessionActive(false);

      if (onAuthorizePlan) {
        onAuthorizePlan(activeDirectiveId);
      }
      toast.success('Directive executed via voice authorization!');
    }, 1800);
  };

  const handleSendTextMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const txt = inputText.trim();
    setInputText('');

    if (txt.toLowerCase().includes('auth') || txt.toLowerCase().includes('approve') || txt.toLowerCase().includes('yes')) {
      handleUserSpokenApproval(txt);
    } else {
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: txt, time: new Date().toLocaleTimeString() },
        { sender: 'agent', text: `Command received: "${txt}". Awaiting executive authorization directive.`, time: new Date().toLocaleTimeString() }
      ]);
    }
  };

  return (
    <Card className="p-4 border-border/40 bg-card/70 backdrop-blur-md relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Animated Pulsing Voice Avatar */}
          <div
            className={`h-11 w-11 rounded-full flex items-center justify-center border transition-all duration-300 relative ${
              isSpeaking
                ? 'bg-emerald-500/20 border-emerald-500/60 shadow-[0_0_20px_rgba(52,211,153,0.5)]'
                : isListening
                ? 'bg-indigo-500/20 border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.5)]'
                : 'bg-secondary/40 border-border/50'
            }`}
          >
            {isSpeaking ? (
              <IconVolume2 className="h-5 w-5 text-emerald-400 animate-pulse" />
            ) : isListening ? (
              <IconMicrophone className="h-5 w-5 text-indigo-400 animate-bounce" />
            ) : (
              <IconRobot className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">ElevenLabs Executive Voice AI</span>
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  isSpeaking
                    ? 'border-emerald-500 text-emerald-400'
                    : isListening
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {isSpeaking ? 'Speaking Briefing...' : isListening ? 'Listening for Command...' : 'Agent Standby'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Bidirectional WebSockets • Persona: D2C Chief Operating Intelligence
            </p>
          </div>
        </div>

        {/* Real-time Audio Waveform Visualizer */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1 h-8 px-3 bg-background/50 rounded-lg border border-border/30">
            {waveHeights.map((h, i) => (
              <div
                key={i}
                style={{ height: `${h}px` }}
                className={`w-1 rounded-full transition-all duration-100 ${
                  isSpeaking ? 'bg-emerald-400' : isListening ? 'bg-indigo-400' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {!isSessionActive ? (
              <Button
                size="sm"
                onClick={handleStartBriefing}
                className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 font-medium shadow-sm"
              >
                <IconVolume2 className="h-3.5 w-3.5" />
                Trigger Voice Briefing
              </Button>
            ) : isListening ? (
              <Button
                size="sm"
                onClick={() => handleUserSpokenApproval('Authorize reallocation')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 font-medium shadow-sm animate-pulse"
              >
                <IconCheck className="h-3.5 w-3.5" />
                Authorize Reallocation
              </Button>
            ) : (
              <Button size="sm" disabled variant="outline" className="gap-2">
                <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                Synthesizing Speech...
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => setChatOpen(!chatOpen)}
              className="gap-1.5"
            >
              <IconMessage2 className="h-3.5 w-3.5" />
              Chat Fallback
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Fallback Modal / Drawer */}
      {chatOpen && (
        <div className="mt-4 pt-3 border-t border-border/30">
          <div className="max-h-48 overflow-y-auto space-y-2 mb-3 text-xs pr-2">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg max-w-[85%] ${
                  m.sender === 'agent'
                    ? 'bg-secondary/60 text-foreground ml-0'
                    : 'bg-indigo-600/30 text-indigo-200 ml-auto border border-indigo-500/30'
                }`}
              >
                <div className="text-[10px] text-muted-foreground mb-0.5 font-mono">
                  {m.sender === 'agent' ? 'NEXUS Voice Agent' : 'Executive (You)'} • {m.time}
                </div>
                <div>{m.text}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendTextMessage} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type verbal command (e.g. 'Authorize reallocation')..."
              className="flex-1 bg-background border border-border/50 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <Button size="sm" type="submit" variant="secondary" className="text-xs">
              Send Command
            </Button>
          </form>
        </div>
      )}
    </Card>
  );
}
