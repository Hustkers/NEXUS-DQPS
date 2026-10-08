'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  IconMicrophone,
  IconMicrophoneOff,
  IconVolume,
  IconVolumeOff,
  IconPlayerPlay,
  IconPlayerStop,
  IconBolt,
  IconChartBar,
  IconBox,
  IconAlertTriangle,
  IconCheck,
} from '@tabler/icons-react';
import { executeAssistantTurn } from './tools';
import { toast } from 'sonner';

interface AssistantVoiceProps {
  onToolExecuted?: (toolName: string, result: any) => void;
  router?: any;
}

export function AssistantVoice({ onToolExecuted, router }: AssistantVoiceProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastAction, setLastAction] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Text-To-Speech Synthesis using Web Speech API
  const speakText = (text: string, onEnd?: () => void) => {
    if (voiceMuted || typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

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

  const handleStopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Start Briefing Routine
  const handleStartBriefing = () => {
    setIsListening(false);
    const briefText =
      'Executive Briefing: ROAS on Meta Advantage Plus dropped due to Hero SKU stockout in Shopify. Recommending immediate reallocation of $800 to Google Search and Amazon. Projected margin recovery: +$1,148. Do you authorize this directive?';

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
      setLastAction(`Executed: ${toolCall.name}()`);
      if (onToolExecuted) onToolExecuted(toolCall.name, toolCall.result);
    }

    setTranscript(replyText);
    speakText(replyText);
  };

  return (
    <div className="flex flex-col h-full p-4 sm:p-5 font-mono text-xs space-y-4 overflow-y-auto">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/30">
        <div className="flex items-center gap-2.5">
          <span
            className={`size-2 rounded-full ${
              isSpeaking
                ? 'bg-emerald-400'
                : isListening
                ? 'bg-cyan-400'
                : 'bg-zinc-600'
            }`}
          />
          <span className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
            {isSpeaking
              ? 'Audio Engine: Synthesizing Situation Report'
              : isListening
              ? 'Audio Engine: Listening for Verbal Directives'
              : 'Audio Engine: Standby'}
          </span>
        </div>

        {/* Mute Control */}
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
          className="size-7 text-zinc-400 hover:text-zinc-100"
          title={voiceMuted ? 'Unmute speech playback' : 'Mute speech playback'}
        >
          {voiceMuted ? <IconVolumeOff className="size-3.5" /> : <IconVolume className="size-3.5" />}
        </Button>
      </div>

      {/* Situation Data Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/60">
          <span className="text-[9px] text-zinc-500 block uppercase">Situation Detected</span>
          <span className="font-semibold text-rose-400">Meta SKU Stockout</span>
        </div>
        <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/60">
          <span className="text-[9px] text-zinc-500 block uppercase">Daily Spend Wasted</span>
          <span className="font-semibold text-zinc-200">$800 / day</span>
        </div>
        <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/60">
          <span className="text-[9px] text-zinc-500 block uppercase">Proposed Redirection</span>
          <span className="font-semibold text-emerald-400">Google + Amazon</span>
        </div>
        <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/60">
          <span className="text-[9px] text-zinc-500 block uppercase">Projected Yield</span>
          <span className="font-bold text-emerald-400 text-xs">+$1,148 / day</span>
        </div>
      </div>

      {/* Transcript Log Area */}
      <div className="flex-1 min-h-[140px] rounded-lg border border-zinc-800 bg-zinc-900/20 p-4 flex flex-col justify-between">
        <div>
          <span className="text-[10px] text-zinc-500 block uppercase mb-1.5 font-bold">
            Verbal Audio Stream &amp; Transcript
          </span>
          {transcript ? (
            <p className="font-sans text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">
              {transcript}
            </p>
          ) : (
            <p className="text-zinc-500 italic text-xs">
              Click "Start Situation Briefing" to listen to an executive summary, or trigger voice directives below.
            </p>
          )}
        </div>

        {lastAction && (
          <div className="mt-3 pt-2 border-t border-zinc-800/80 text-[10px] text-emerald-400 flex items-center gap-1.5">
            <IconCheck className="size-3" />
            <span>{lastAction}</span>
          </div>
        )}
      </div>

      {/* Executive Audio Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-zinc-800">
        {isSpeaking ? (
          <Button
            size="sm"
            onClick={handleStopSpeaking}
            className="h-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-[11px] gap-1.5 px-3 rounded"
          >
            <IconPlayerStop className="size-3.5" />
            <span>Stop Audio</span>
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleStartBriefing}
            disabled={isListening}
            className="h-8 bg-zinc-100 hover:bg-white text-zinc-900 font-mono text-[11px] font-semibold gap-1.5 px-3 rounded transition-colors"
          >
            <IconPlayerPlay className="size-3.5" />
            <span>Start Situation Briefing</span>
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={isListening ? stopListening : startListening}
          className={`h-8 font-mono text-[11px] gap-1.5 px-3 rounded border-zinc-800 transition-colors ${
            isListening ? 'border-cyan-500 text-cyan-400 bg-cyan-950/40' : 'text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          {isListening ? (
            <>
              <IconMicrophoneOff className="size-3.5 text-cyan-400" />
              <span>Stop Listening</span>
            </>
          ) : (
            <>
              <IconMicrophone className="size-3.5 text-zinc-400" />
              <span>Voice Dictation</span>
            </>
          )}
        </Button>
      </div>

      {/* Verbal Command Shortcuts */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold block">
          One-Click Verbal Directives
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleVoiceCommand('Authorize reallocation directive')}
            className="flex items-center gap-2 p-2 rounded border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-200 transition-colors text-left text-[11px]"
          >
            <IconBolt className="size-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">"Authorize reallocation"</span>
          </button>

          <button
            type="button"
            onClick={() => handleVoiceCommand('Query blended ROAS and channel metrics')}
            className="flex items-center gap-2 p-2 rounded border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-200 transition-colors text-left text-[11px]"
          >
            <IconChartBar className="size-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">"Query blended ROAS"</span>
          </button>

          <button
            type="button"
            onClick={() => handleVoiceCommand('Check inventory stockout status for Hero SKU')}
            className="flex items-center gap-2 p-2 rounded border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-200 transition-colors text-left text-[11px]"
          >
            <IconBox className="size-3.5 text-rose-400 shrink-0" />
            <span className="truncate">"Check Hero SKU stockout"</span>
          </button>

          <button
            type="button"
            onClick={() => handleVoiceCommand('Inject operational shock scenario')}
            className="flex items-center gap-2 p-2 rounded border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-200 transition-colors text-left text-[11px]"
          >
            <IconAlertTriangle className="size-3.5 text-amber-400 shrink-0" />
            <span className="truncate">"Inject shock scenario"</span>
          </button>
        </div>
      </div>
    </div>
  );
}
