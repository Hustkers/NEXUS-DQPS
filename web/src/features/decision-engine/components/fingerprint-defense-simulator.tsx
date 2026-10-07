'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  IconShieldCheck,
  IconShieldX,
  IconShieldExclamation,
  IconRefresh,
  IconCheck,
  IconX,
  IconFlame,
  IconBrandSafari,
  IconBrandFirefox,
  IconWorld,
  IconTerminal,
  IconInfoCircle
} from '@tabler/icons-react';

interface DefenseProfile {
  id: string;
  name: string;
  browser: string;
  icon: string;
  privacyScore: number; // 0-100
  usabilityScore: number; // 0-100
  trackingMitigation: string;
  mechanism: string;
  effects: {
    canvasBehavior: string;
    webglBehavior: string;
    audioBehavior: string;
    screenBehavior: string;
    crossDomainMatchRate: string;
  };
}

const DEFENSE_PROFILES: DefenseProfile[] = [
  {
    id: 'unprotected',
    name: 'Unprotected Default (Chrome / Edge)',
    browser: 'Standard Blink Engine',
    icon: 'chrome',
    privacyScore: 12,
    usabilityScore: 100,
    trackingMitigation: 'None. Complete hardware transparency.',
    mechanism: 'Full native hardware exposure. Subpixel rasterizer and WebGL drivers expose 33.5 bits entropy.',
    effects: {
      canvasBehavior: 'Deterministic reproducible hash (cv2_8f4a19e2)',
      webglBehavior: 'Unmasked GPU chip exposed (Apple M3 / NVIDIA RTX)',
      audioBehavior: 'Deterministic float32 DSP audio waveform',
      screenBehavior: 'Exact multi-monitor pixel dimensions & DPI ratio',
      crossDomainMatchRate: '99.8% Deterministic Accuracy'
    }
  },
  {
    id: 'brave',
    name: 'Brave Browser (Farbling Noise)',
    browser: 'Brave Shield v2',
    icon: 'brave',
    privacyScore: 84,
    usabilityScore: 94,
    trackingMitigation: 'Session-randomized subtle canvas & audio farbling.',
    mechanism:
      'Injects minute pseudo-random noise into canvas getImageData (±1 LSB channel jitter) and Web Audio buffers. Keeps websites functional while breaking cross-domain hash consistency.',
    effects: {
      canvasBehavior: 'Randomized per-session hash (Farbling perturbation)',
      webglBehavior: 'Shader precision perturbed with minute noise',
      audioBehavior: 'Audio oscillator buffer jittered with micro-noise',
      screenBehavior: 'Native resolution permitted for layout fidelity',
      crossDomainMatchRate: 'Fails to link (< 8% match certainty)'
    }
  },
  {
    id: 'firefox',
    name: 'Firefox RFP (Resist Fingerprinting)',
    browser: 'Firefox with privacy.resistFingerprinting',
    icon: 'firefox',
    privacyScore: 92,
    usabilityScore: 78,
    trackingMitigation: 'Spoofed system metrics & permission gating.',
    mechanism:
      'Tor Uplink integration. Prompts user before allowing canvas reads, clamps hardwareConcurrency to 2, rounds screen resolution to 1000×800, and forces UTC timezone.',
    effects: {
      canvasBehavior: 'Blank white buffer or user permission prompt',
      webglBehavior: 'Masked to generic "Mesa / Generic Renderer"',
      audioBehavior: 'High-pass audio compressor clamped to zero output',
      screenBehavior: 'Clamped to rounded 1000×800 window boundaries',
      crossDomainMatchRate: 'Blocked (< 2% match certainty)'
    }
  },
  {
    id: 'safari',
    name: 'Apple Safari (ITP + Private Relay)',
    browser: 'WebKit Safari 18.2',
    icon: 'safari',
    privacyScore: 76,
    usabilityScore: 96,
    trackingMitigation: '24h storage cap, CNAME uncloaking, dual-hop proxy.',
    mechanism:
      'Caps script-written cookies to 24 hours, uncloaks 3rd-party CNAME DNS tracking records, and routes IP traffic through Cloudflare/Fastly dual-hop proxy relays.',
    effects: {
      canvasBehavior: 'Partially normalized font lists & antialiasing',
      webglBehavior: 'Generic Metal GPU string exposed',
      audioBehavior: 'Standard WebAudio execution permitted',
      screenBehavior: 'Native display resolution preserved',
      crossDomainMatchRate: '34% match (IP obfuscated, hardware still vulnerable)'
    }
  },
  {
    id: 'tor',
    name: 'Tor Browser (Total Uniformity)',
    browser: 'Tor 14.0 (Firefox ESR)',
    icon: 'tor',
    privacyScore: 99,
    usabilityScore: 52,
    trackingMitigation: 'Zero-entropy crowd uniformity.',
    mechanism:
      'Every single Tor user in the world shares the exact same user-agent, window dimensions, font set, and system clock. Fingerprinting is mathematically defeated because entropy H ≈ 0.',
    effects: {
      canvasBehavior: 'Strictly blocked (100% blank white canvas)',
      webglBehavior: 'Completely disabled by default',
      audioBehavior: 'Disabled (AudioContext throws permission denied)',
      screenBehavior: 'Strict letterboxing with rounded increments',
      crossDomainMatchRate: '0.0% (Crowd anonymity achieved)'
    }
  }
];

export function FingerprintDefenseSimulator() {
  const [selectedDefenseId, setSelectedDefenseId] = useState<string>('brave');
  const [isSimulatingReload, setIsSimulatingReload] = useState<boolean>(false);
  const [reloadCount, setReloadCount] = useState<number>(1);

  const currentProfile =
    DEFENSE_PROFILES.find((p) => p.id === selectedDefenseId) || DEFENSE_PROFILES[1];

  const handleSimulateReload = () => {
    setIsSimulatingReload(true);
    setTimeout(() => {
      setReloadCount((prev) => prev + 1);
      setIsSimulatingReload(false);
    }, 450);
  };

  // Generate dynamic hash based on defense profile and reload count
  const dynamicCanvasHash = (() => {
    if (selectedDefenseId === 'unprotected') {
      return 'cv2_8f4a19e2c0b7 (Deterministic across all reloads)';
    }
    if (selectedDefenseId === 'brave') {
      const hashes = [
        'cv2_9e12ab77f4c1',
        'cv2_18df39a0552b',
        'cv2_7c4193b2184e',
        'cv2_04ad88f192b0'
      ];
      return `${hashes[reloadCount % hashes.length]} (Randomized by Farbling #00${reloadCount})`;
    }
    if (selectedDefenseId === 'firefox') {
      return '000000000000 (Blocked by RFP User Prompt)';
    }
    if (selectedDefenseId === 'safari') {
      return 'cv2_8f4a19e2c0b7 (Standard WebKit Canvas)';
    }
    return 'BLOCKED_BY_TOR (White pixel buffer)';
  })();

  return (
    <div className='flex flex-col gap-6 font-mono'>
      {/* Educational Header */}
      <div className='bg-[#09090c] border border-white/10 rounded-xl p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <div className='size-11 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20'>
            <IconShieldCheck className='size-6 text-white' />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h3 className='text-sm font-bold text-white uppercase tracking-wider'>
                Student Privacy Defense Simulator: Farbling vs Uniformity
              </h3>
              <Badge className='bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px]'>
                DEFENSIVE CYBERSECURITY
              </Badge>
            </div>
            <p className='text-xs text-neutral-400 font-sans mt-0.5'>
              Compare how modern browsers counter hardware fingerprinting: Noise Injection, Uniformity, and Storage Caps.
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            onClick={handleSimulateReload}
            disabled={isSimulatingReload}
            className='h-8 px-3 text-xs bg-purple-600 hover:bg-purple-500 text-white font-mono border-none shadow-lg'
          >
            <IconRefresh className={cn('size-3.5 mr-1.5', isSimulatingReload && 'animate-spin')} />
            Simulate Page Reload ({reloadCount})
          </Button>
        </div>
      </div>

      {/* Defense Profile Selector Tabs */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5'>
        {DEFENSE_PROFILES.map((profile) => {
          const isSelected = profile.id === selectedDefenseId;
          return (
            <button
              key={profile.id}
              onClick={() => setSelectedDefenseId(profile.id)}
              className={cn(
                'p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2',
                isSelected
                  ? 'bg-neutral-900 border-emerald-500 shadow-lg shadow-emerald-500/10'
                  : 'bg-[#0a0a0d] border-white/10 hover:border-white/20 opacity-70 hover:opacity-100'
              )}
            >
              <div>
                <span className='text-[10px] text-neutral-400 uppercase tracking-widest block font-bold'>
                  {profile.browser}
                </span>
                <span className='text-xs font-bold text-white block mt-0.5'>{profile.name.split(' (')[0]}</span>
              </div>

              <div className='flex items-center justify-between text-[11px] pt-2 border-t border-white/5'>
                <span className='text-emerald-400 font-bold'>Privacy {profile.privacyScore}%</span>
                <span className='text-cyan-400'>{profile.usabilityScore}% UX</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Inspection Matrix of Active Defense */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-5'>
        {/* Profile Overview (Cols 1-7) */}
        <div className='lg:col-span-7 bg-[#08080b] border border-white/10 rounded-xl p-5 shadow-2xl flex flex-col gap-4'>
          <div className='flex items-start justify-between gap-3 pb-3 border-b border-white/10'>
            <div>
              <h4 className='text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2'>
                {currentProfile.privacyScore >= 80 ? (
                  <IconShieldCheck className='size-5 text-emerald-400' />
                ) : currentProfile.privacyScore >= 50 ? (
                  <IconShieldExclamation className='size-5 text-amber-400' />
                ) : (
                  <IconShieldX className='size-5 text-red-400' />
                )}
                {currentProfile.name}
              </h4>
              <p className='text-xs text-neutral-400 font-sans mt-1'>
                {currentProfile.trackingMitigation}
              </p>
            </div>

            <Badge
              className={cn(
                'text-xs font-mono border',
                currentProfile.privacyScore >= 80
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                  : 'bg-red-950/80 border-red-500/50 text-red-300'
              )}
            >
              {currentProfile.privacyScore}% Defense
            </Badge>
          </div>

          <div className='bg-black/60 border border-white/10 rounded-lg p-3.5'>
            <span className='text-[10px] text-purple-400 uppercase font-bold block mb-1'>
              Core Anti-Tracking Mechanism
            </span>
            <p className='text-xs text-neutral-200 font-sans leading-relaxed'>
              {currentProfile.mechanism}
            </p>
          </div>

          {/* Real-time Dynamic Hash Output */}
          <div className='bg-black/80 border border-cyan-500/30 rounded-lg p-3.5'>
            <div className='flex items-center justify-between text-[10px] uppercase font-bold text-cyan-400 mb-1'>
              <span>Observed Canvas 2D Hash Output</span>
              <span>Session #{reloadCount}</span>
            </div>
            <div className='text-xs text-emerald-300 font-mono font-bold bg-neutral-900/90 p-2 rounded border border-white/5 truncate'>
              {dynamicCanvasHash}
            </div>
            <p className='text-[10px] text-neutral-400 font-sans mt-1.5'>
              {selectedDefenseId === 'brave'
                ? 'Notice how each reload produces a distinct pseudo-random hash due to Brave farbling, breaking tracker persistence.'
                : selectedDefenseId === 'unprotected'
                ? 'Notice how the hash remains 100% frozen and identical across sessions, allowing passive third-party tracking.'
                : 'Notice how access is either normalized or blocked completely to preserve user privacy.'}
            </p>
          </div>

          {/* Behavior Breakdown List */}
          <div className='divide-y divide-white/5 bg-black/40 border border-white/5 rounded-lg text-xs'>
            <div className='p-2.5 flex items-center justify-between gap-2'>
              <span className='text-neutral-400'>Canvas Subsystem:</span>
              <span className='text-white font-bold text-right truncate max-w-[280px]'>
                {currentProfile.effects.canvasBehavior}
              </span>
            </div>
            <div className='p-2.5 flex items-center justify-between gap-2'>
              <span className='text-neutral-400'>WebGL GPU Pipeline:</span>
              <span className='text-white font-bold text-right truncate max-w-[280px]'>
                {currentProfile.effects.webglBehavior}
              </span>
            </div>
            <div className='p-2.5 flex items-center justify-between gap-2'>
              <span className='text-neutral-400'>WebAudio Oscillator:</span>
              <span className='text-white font-bold text-right truncate max-w-[280px]'>
                {currentProfile.effects.audioBehavior}
              </span>
            </div>
            <div className='p-2.5 flex items-center justify-between gap-2'>
              <span className='text-neutral-400'>Screen Dimensions:</span>
              <span className='text-white font-bold text-right truncate max-w-[280px]'>
                {currentProfile.effects.screenBehavior}
              </span>
            </div>
          </div>
        </div>

        {/* Defense vs UX Tradeoff Dial (Cols 8-12) */}
        <div className='lg:col-span-5 bg-[#08080b] border border-white/10 rounded-xl p-5 shadow-2xl flex flex-col justify-between gap-4'>
          <div>
            <h4 className='text-xs font-bold text-white uppercase tracking-wider pb-3 border-b border-white/10'>
              Privacy vs Usability Trade-Off Matrix
            </h4>

            {/* Privacy Score Bar */}
            <div className='mt-4 flex flex-col gap-1.5'>
              <div className='flex items-center justify-between text-xs'>
                <span className='text-neutral-400'>Tracking Resistance Score</span>
                <span className='text-emerald-400 font-bold'>{currentProfile.privacyScore}/100</span>
              </div>
              <div className='w-full h-2 bg-neutral-900 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500'
                  style={{ width: `${currentProfile.privacyScore}%` }}
                />
              </div>
            </div>

            {/* Usability Score Bar */}
            <div className='mt-4 flex flex-col gap-1.5'>
              <div className='flex items-center justify-between text-xs'>
                <span className='text-neutral-400'>Web Usability (Zero Breakage)</span>
                <span className='text-cyan-400 font-bold'>{currentProfile.usabilityScore}/100</span>
              </div>
              <div className='w-full h-2 bg-neutral-900 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-gradient-to-r from-cyan-500 to-indigo-400 transition-all duration-500'
                  style={{ width: `${currentProfile.usabilityScore}%` }}
                />
              </div>
            </div>

            {/* Identity Linkage Certainty */}
            <div className='mt-6 bg-black/60 border border-white/10 rounded-lg p-3 text-xs'>
              <span className='text-[10px] text-neutral-400 uppercase font-bold block'>
                Attribution Linkage Verdict
              </span>
              <span
                className={cn(
                  'text-sm font-bold block mt-1 font-mono',
                  currentProfile.privacyScore >= 80 ? 'text-red-400' : 'text-emerald-400'
                )}
              >
                {currentProfile.effects.crossDomainMatchRate}
              </span>
              <p className='text-[11px] text-neutral-400 font-sans mt-1.5 leading-relaxed'>
                {currentProfile.privacyScore >= 80
                  ? 'Identity Graph edges break. Advertisers cannot connect YouTube ads to Amazon purchases deterministically without client logins.'
                  : 'Identity Graph successfully stitches disparate web sessions into a unified entity with > 99% confidence.'}
              </p>
            </div>
          </div>

          <div className='p-3 bg-purple-950/20 border border-purple-500/20 rounded-lg text-[11px] text-purple-200 font-sans'>
            💡 <strong>Student Tip:</strong> Farbling is widely considered the gold standard for consumer browsers because it prevents tracking while keeping 3D WebGL games, Google Maps, and audio apps 100% operational.
          </div>
        </div>
      </div>
    </div>
  );
}
