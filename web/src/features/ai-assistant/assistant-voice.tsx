'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  IconMicrophone,
  IconMicrophoneOff,
  IconVolume,
  IconVolumeOff,
  IconPlayerPlay,
  IconBolt,
  IconChartBar,
  IconBox,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { executeAssistantTurn } from './tools';
import { toast } from 'sonner';

interface AssistantVoiceProps {
  onToolExecuted?: (toolName: string, result: any) => void;
  router?: any;
}

const DEFAULT_WAVE_HEIGHTS = [6, 10, 14, 8, 12, 16, 10, 12, 8, 14, 10, 6];

export function AssistantVoice({ onToolExecuted, router }: AssistantVoiceProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [waveHeights, setWaveHeights] = useState(DEFAULT_WAVE_HEIGHTS);

  const recognitionRef = useRef<any>(null);

  // Animated Waveform Effect during active speech or listening
  useEffect(() => {
    if (!isSpeaking && !isListening) {
      return;
    }
    const timer = setInterval(() => {
      setWaveHeights(
        Array.from({ length: 12 }, () =>
          isSpeaking ? Math.floor(Math.random() * 32) + 8 : Math.floor(Math.random() * 20) + 6
        )
      );
    }, 90);
    return () => clearInterval(timer);
  }, [isSpeaking, isListening]);

  // Text-To-Speech Synthesis using Web Speech API (synthesizing ElevenLabs Executive profile)
  const speakText = (text: string, onEnd?: () => void) => {
    if (voiceMuted || typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;

      // Select high quality English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.lang.startsWith('en')
      );
      if (preferredVoice) utterance.voice = preferredVoice;

      setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    }
  };

  // Start Briefing Routine
  const handleStartBriefing = () => {
    setIsListening(false);
    const briefText =
      'Executive Briefing: ROAS on Meta Advantage Plus dropped due to Hero SKU stockout in Shopify. Recommending immediate reallocation of ₹800 to Google Search and Amazon. Projected margin recovery: +₹1,148. Do you authorize this directive?';

    setTranscript(briefText);
    speakText(briefText, () => {
      startListening();
    });
  };

  // Browser Microphone Recognition
  const startListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.info('Microphone API not supported in this browser. Use action chips below.');
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
        const text = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setTranscript(text);
      };

      recognition.onend = async () => {
        setIsListening(false);
        if (transcript.trim()) {
          await handleVoiceCommand(transcript);
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

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setIsListening(false);
  };

  // Execute Voice Command via Function Calling
  const handleVoiceCommand = async (commandText: string) => {
    setLastAction(`Processing: "${commandText}"`);
    const { replyText, toolCall } = await executeAssistantTurn(commandText, router);

    if (toolCall) {
      setLastAction(`Executed Tool: ${toolCall.name}`);
      if (onToolExecuted) onToolExecuted(toolCall.name, toolCall.result);
    }

    setTranscript(replyText);
    speakText(replyText);
  };

  return (
    <div className="flex flex-col gap-4 p-4 text-xs font-mono">
      {/* Visual Audio Waveform & Status HUD */}
      <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-zinc-800 bg-zinc-950/70 relative overflow-hidden">
        {/* Glow backdrop */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
            isSpeaking
              ? 'bg-emerald-500/10'
              : isListening
              ? 'bg-cyan-500/10'
              : 'bg-transparent'
          }`}
        />

        {/* Live Audio Frequency Bars */}
        <div className="flex items-center gap-1.5 h-12 mb-3 z-10">
          {waveHeights.map((h, i) => (
            <div
              key={i}
              style={{ height: `${h}px` }}
              className={`w-1.5 rounded-full transition-all duration-100 ${
                isSpeaking
                  ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                  : isListening
                  ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]'
                  : 'bg-zinc-700'
              }`}
            />
          ))}
        </div>

        {/* State Indicator Badge */}
        <div className="flex items-center gap-2 z-10">
          <span
            className={`size-2 rounded-full ${
              isSpeaking
                ? 'bg-emerald-400 animate-pulse'
                : isListening
                ? 'bg-cyan-400 animate-ping'
                : 'bg-zinc-600'
            }`}
          />
          <span className="text-zinc-300 font-semibold uppercase tracking-wider text-[11px]">
            {isSpeaking
              ? 'ElevenLabs AI: Speaking Situation Report'
              : isListening
              ? 'ElevenLabs AI: Listening for Directives...'
              : 'ElevenLabs Voice Engine: Standby'}
          </span>
        </div>

        {lastAction && (
          <span className="mt-2 text-[10px] text-emerald-400/90 z-10 font-mono">
            {lastAction}
          </span>
        )}
      </div>

      {/* Spoken Transcript Area */}
      <div className="min-h-[56px] max-h-24 overflow-y-auto rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-3 text-zinc-300 text-[11px] leading-relaxed">
        {transcript ? (
          <p className="font-sans font-normal text-zinc-200">{transcript}</p>
        ) : (
          <p className="text-zinc-500 italic">
            Click "Executive Briefing" or speak directives like "Authorize reallocation" or "Audit blended ROAS"...
          </p>
        )}
      </div>

      {/* Voice Controls & Mic Trigger */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleStartBriefing}
            disabled={isSpeaking || isListening}
            className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[11px] gap-1.5 px-3 rounded-lg shadow-sm"
          >
            <IconPlayerPlay className="size-3.5" />
            Executive Briefing
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={isListening ? stopListening : startListening}
            className={`h-8 font-mono text-[11px] gap-1.5 px-3 rounded-lg border-zinc-700 ${
              isListening ? 'border-cyan-500 text-cyan-400 bg-cyan-950/40' : 'text-zinc-300'
            }`}
          >
            {isListening ? (
              <>
                <IconMicrophoneOff className="size-3.5 text-cyan-400" />
                Stop Mic
              </>
            ) : (
              <>
                <IconMicrophone className="size-3.5 text-zinc-400" />
                Listen (Mic)
              </>
            )}
          </Button>
        </div>

        {/* Audio Mute Switch */}
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            const next = !voiceMuted;
            setVoiceMuted(next);
            if (next && typeof window !== 'undefined' && window.speechSynthesis) {
              window.speechSynthesis.cancel();
              setIsSpeaking(false);
            }
          }}
          className="size-8 text-zinc-400 hover:text-zinc-100"
          title={voiceMuted ? 'Unmute voice playback' : 'Mute voice playback'}
        >
          {voiceMuted ? <IconVolumeOff className="size-4" /> : <IconVolume className="size-4" />}
        </Button>
      </div>

      {/* Quick Verbal Action Directives (One-click simulation for instant testing) */}
      <div className="flex flex-col gap-1.5 pt-2">
        <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
          Verbal Directive Shortcuts
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleVoiceCommand('Authorize reallocation directive')}
            className="flex items-center gap-2 p-2 rounded-lg border border-emerald-900/60 bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 transition-colors text-left text-[11px]"
          >
            <IconBolt className="size-3.5 shrink-0 text-emerald-400" />
            <span className="truncate">"Authorize reallocation"</span>
          </button>

          <button
            onClick={() => handleVoiceCommand('Query blended ROAS and channel metrics')}
            className="flex items-center gap-2 p-2 rounded-lg border border-cyan-900/60 bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-300 transition-colors text-left text-[11px]"
          >
            <IconChartBar className="size-3.5 shrink-0 text-cyan-400" />
            <span className="truncate">"Audit ROAS & Spend"</span>
          </button>

          <button
            onClick={() => handleVoiceCommand('Check inventory stockout status for Hero SKU')}
            className="flex items-center gap-2 p-2 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 text-zinc-300 transition-colors text-left text-[11px]"
          >
            <IconBox className="size-3.5 shrink-0 text-zinc-400" />
            <span className="truncate">"Check SKU inventory"</span>
          </button>

          <button
            onClick={() => handleVoiceCommand('Inject operational shock scenario')}
            className="flex items-center gap-2 p-2 rounded-lg border border-amber-900/60 bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 transition-colors text-left text-[11px]"
          >
            <IconAlertTriangle className="size-3.5 shrink-0 text-amber-400" />
            <span className="truncate">"Inject shock scenario"</span>
          </button>
        </div>
      </div>
    </div>
  );
}
