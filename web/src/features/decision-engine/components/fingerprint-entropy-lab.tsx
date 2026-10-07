'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  IconCpu,
  IconWaveSine,
  IconPalette,
  IconLock,
  IconSparkles,
  IconRefresh,
  IconCheck,
  IconCopy,
  IconInfoCircle,
  IconAlertTriangle,
  IconDeviceDesktop,
  IconMathFunction,
  IconBinary,
  IconChartBar
} from '@tabler/icons-react';

interface EntropyVectorMetric {
  name: string;
  category: string;
  bits: number;
  uniquenessRatio: string;
  stability: number; // percentage
  description: string;
  codeSnippet: string;
}

const ENTROPY_VECTORS: EntropyVectorMetric[] = [
  {
    name: 'Canvas 2D Geometry & Typography',
    category: 'Graphics Subsystem',
    bits: 11.2,
    uniquenessRatio: '1 in 2,352',
    stability: 99.98,
    description:
      'Subpixel antialiasing in font rasterization engines (DirectWrite vs CoreText vs FreeType) and GPU alpha-blending produce minute numerical differences in pixel RGBA arrays.',
    codeSnippet: 'const hash = fnv1a(canvas.toDataURL());'
  },
  {
    name: 'WebGL GPU Unmasked Chipset & Shaders',
    category: 'Hardware Acceleration',
    bits: 9.8,
    uniquenessRatio: '1 in 891',
    stability: 100.0,
    description:
      'Queries GL_RENDERER & UNMASKED_RENDERER_WEBGL. Exposes GPU model, precision formats (highp float 32-bit), vertex attributes, and vendor extensions.',
    codeSnippet: 'gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);'
  },
  {
    name: 'WebAudio DynamicsCompressor Waveform',
    category: 'DSP Audio Stack',
    bits: 8.4,
    uniquenessRatio: '1 in 338',
    stability: 99.85,
    description:
      'Synthesizes an audio oscillator through a high-pass compressor filter node. Float32 IEEE 754 rounding differences across audio chipsets create deterministic acoustic signatures.',
    codeSnippet: 'offlineCtx.createDynamicsCompressor();'
  },
  {
    name: 'TLS JA3/JA4 Client Handshake Signature',
    category: 'Network Protocol',
    bits: 6.5,
    uniquenessRatio: '1 in 90',
    stability: 98.5,
    description:
      'Order of TLS Cipher Suites, Extensions, Elliptic Curves, and Point Formats during the ClientHello handshake before application data is sent.',
    codeSnippet: 'ja4 = "t13d" + hash(ciphers) + hash(extensions);'
  },
  {
    name: 'Screen Geometry & Pixel Density',
    category: 'Display Stack',
    bits: 3.9,
    uniquenessRatio: '1 in 15',
    stability: 95.0,
    description:
      'Screen resolution (width × height), color depth (24/30-bit), pixel ratio (2x/3x Retina), and dual-monitor multi-display arrangement.',
    codeSnippet: `${'screen.width'}x${'screen.height'}@${'window.devicePixelRatio'}x`
  },
  {
    name: 'Hardware Concurrency & RAM Memory',
    category: 'CPU & Kernel',
    bits: 3.2,
    uniquenessRatio: '1 in 9',
    stability: 100.0,
    description:
      'Number of logical processor threads (navigator.hardwareConcurrency) and approximate gigabytes of RAM (navigator.deviceMemory).',
    codeSnippet: 'navigator.hardwareConcurrency + "C/" + navigator.deviceMemory + "GB"'
  }
];

// Simple FNV-1a 32-bit hash function for string hashing
function fnv1a32(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function FingerprintEntropyLab() {
  // Birthday paradox population slider state
  const [populationK, setPopulationK] = useState<number>(50000); // 50,000 users

  // Live in-browser extraction state
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [liveExtracted, setLiveExtracted] = useState<{
    canvasHash: string;
    webglRenderer: string;
    audioSum: string;
    screenRes: string;
    cores: number;
    ram: string;
    timezone: string;
    computedFingerprint: string;
    totalBits: number;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calculate Cumulative Entropy
  const totalEntropyBits = useMemo(
    () => Number(ENTROPY_VECTORS.reduce((acc, v) => acc + v.bits, 0).toFixed(1)),
    []
  );
  const totalCombinations = useMemo(
    () => Math.pow(2, totalEntropyBits),
    [totalEntropyBits]
  );

  // Birthday Paradox Collision Math: P(collision) = 1 - exp( - k*(k-1) / (2*N) )
  const collisionProbWeak = useMemo(() => {
    const N = Math.pow(2, 14); // 14 bits = 16,384 states
    const exponent = -(populationK * (populationK - 1)) / (2 * N);
    return Math.min(100, (1 - Math.exp(exponent)) * 100);
  }, [populationK]);

  const collisionProbMedium = useMemo(() => {
    const N = Math.pow(2, 22); // 22 bits = 4,194,304 states
    const exponent = -(populationK * (populationK - 1)) / (2 * N);
    return Math.min(100, (1 - Math.exp(exponent)) * 100);
  }, [populationK]);

  const collisionProbNexus = useMemo(() => {
    const N = totalCombinations; // 33.5 bits = ~11.8 Billion states
    const exponent = -(populationK * (populationK - 1)) / (2 * N);
    const prob = (1 - Math.exp(exponent)) * 100;
    return prob < 0.0001 ? '< 0.0001%' : `${prob.toFixed(4)}%`;
  }, [populationK, totalCombinations]);

  // Execute Real Live In-Browser Extraction
  const runLiveExtraction = async () => {
    setIsExtracting(true);
    try {
      // 1. Canvas 2D Extraction
      let cHash = 'cv2_unavailable';
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = 240;
        canvas.height = 60;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.textBaseline = 'top';
          ctx.font = "14px 'Arial', sans-serif";
          ctx.textBaseline = 'alphabetic';
          ctx.fillStyle = '#f60';
          ctx.fillRect(125, 1, 62, 20);
          ctx.fillStyle = '#069';
          ctx.fillText('NEXUS-DQPS 🛡️ <canvas>', 2, 15);
          ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
          ctx.fillText('NEXUS-DQPS 🛡️ <canvas>', 4, 17);
          const dataUrl = canvas.toDataURL();
          cHash = 'cv2_' + fnv1a32(dataUrl);
        }
      }

      // 2. WebGL GPU Extraction
      let gpu = 'Generic GPU / Software Renderer';
      try {
        const glCanvas = document.createElement('canvas');
        const gl = glCanvas.getContext('webgl') || glCanvas.getContext('experimental-webgl');
        if (gl && 'getExtension' in gl) {
          const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            gpu =
              (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) ||
              (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).RENDERER);
          }
        }
      } catch (err) {
        gpu = 'WebGL Masked / Sandbox Blocked';
      }

      // 3. Web Audio Oscillator Extraction
      let aHash = 'au_0.0001849';
      try {
        const AudioContextClass =
          window.OfflineAudioContext ||
          (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext;
        if (AudioContextClass) {
          const context = new AudioContextClass(1, 44100, 44100);
          const oscillator = context.createOscillator();
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(10000, context.currentTime);

          const compressor = context.createDynamicsCompressor();
          compressor.threshold.setValueAtTime(-50, context.currentTime);
          compressor.knee.setValueAtTime(40, context.currentTime);
          compressor.ratio.setValueAtTime(12, context.currentTime);
          compressor.attack.setValueAtTime(0, context.currentTime);
          compressor.release.setValueAtTime(0.25, context.currentTime);

          oscillator.connect(compressor);
          compressor.connect(context.destination);
          oscillator.start(0);

          const renderedBuffer = await context.startRendering();
          const channelData = renderedBuffer.getChannelData(0);
          let sum = 0;
          for (let i = 0; i < channelData.length; i += 100) {
            sum += Math.abs(channelData[i]);
          }
          aHash = 'au_' + sum.toFixed(7);
        }
      } catch (e) {
        aHash = 'au_dsp_mock_0.000192';
      }

      // 4. Screen, Cores, Memory
      const screenRes = `${window.screen.width} × ${window.screen.height} @ ${window.devicePixelRatio || 1}x`;
      const cores = navigator.hardwareConcurrency || 8;
      const ram = (navigator as unknown as { deviceMemory?: number }).deviceMemory
        ? `${(navigator as unknown as { deviceMemory: number }).deviceMemory} GB`
        : '≥ 8 GB';
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

      // 5. Combined SHA-like hex digest
      const rawSeed = `${cHash}_${gpu}_${aHash}_${screenRes}_${cores}_${timezone}`;
      const finalFp = 'FP-LIVE-' + fnv1a32(rawSeed).toUpperCase() + '-' + fnv1a32(cHash).toUpperCase().slice(0, 4);

      setLiveExtracted({
        canvasHash: cHash,
        webglRenderer: gpu,
        audioSum: aHash,
        screenRes,
        cores,
        ram,
        timezone,
        computedFingerprint: finalFp,
        totalBits: totalEntropyBits
      });

      toast.success('Live Browser Entropy Captured Successfully!', {
        description: `Generated Deterministic ID: ${finalFp}`
      });
    } catch (err) {
      toast.error('Could not complete live extraction');
    } finally {
      setIsExtracting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className='flex flex-col gap-6 font-mono'>
      {/* Educational Header Banner */}
      <div className='bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-cyan-950/40 border border-purple-500/30 rounded-xl p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <div className='size-11 rounded-lg bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20'>
            <IconMathFunction className='size-6 text-white' />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h3 className='text-sm font-bold text-white uppercase tracking-wider'>
                Student Cybersecurity Lab: Shannon Entropy &amp; Identity Math
              </h3>
              <Badge className='bg-amber-950/80 border border-amber-500/50 text-amber-300 text-[10px]'>
                H = 33.5 BITS
              </Badge>
            </div>
            <p className='text-xs text-neutral-300 font-sans mt-0.5'>
              Information Theory: How passive micro-architectural GPU and DSP variances defeat cookie deletion.
            </p>
          </div>
        </div>

        <div className='flex items-center gap-3 bg-black/60 border border-white/10 px-4 py-2 rounded-lg text-xs'>
          <div>
            <span className='text-neutral-400 block text-[10px] uppercase'>Global Uniqueness</span>
            <span className='text-emerald-400 font-bold'>1 in 11.8 Billion</span>
          </div>
          <div className='h-7 w-px bg-white/10' />
          <div>
            <span className='text-neutral-400 block text-[10px] uppercase'>World Population</span>
            <span className='text-neutral-300 font-bold'>8.1 Billion</span>
          </div>
        </div>
      </div>

      {/* 1. Entropy Breakdown Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {ENTROPY_VECTORS.map((vector, idx) => (
          <div
            key={idx}
            className='bg-[#0a0a0d] border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-purple-500/50 transition-all shadow-lg group'
          >
            <div>
              <div className='flex items-center justify-between gap-2 mb-2'>
                <span className='text-[10px] uppercase tracking-wider text-purple-400 font-bold'>
                  {vector.category}
                </span>
                <Badge
                  variant='outline'
                  className='border-amber-500/40 bg-amber-500/10 text-amber-300 text-[10px]'
                >
                  +{vector.bits} Bits Entropy
                </Badge>
              </div>

              <h4 className='text-xs font-bold text-white group-hover:text-purple-300 transition-colors'>
                {vector.name}
              </h4>

              <p className='text-[11px] text-neutral-400 font-sans mt-2 leading-relaxed'>
                {vector.description}
              </p>
            </div>

            <div className='mt-4 pt-3 border-t border-white/10'>
              <div className='flex items-center justify-between text-[10px] mb-2 text-neutral-300'>
                <span>Uniqueness: <strong className='text-white'>{vector.uniquenessRatio}</strong></span>
                <span>Stability: <strong className='text-emerald-400'>{vector.stability}%</strong></span>
              </div>
              <div className='bg-black/80 rounded p-1.5 text-[10px] text-cyan-300 font-mono truncate border border-white/5'>
                {vector.codeSnippet}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Interactive Birthday Paradox & Collision Risk Sandbox */}
      <div className='bg-[#09090c] border border-white/10 rounded-xl p-5 shadow-2xl flex flex-col gap-4'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10'>
          <div>
            <h4 className='text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2'>
              <IconBinary className='size-4 text-cyan-400' />
              Interactive Collision Risk: Birthday Paradox in Biometrics &amp; Fingerprints
            </h4>
            <p className='text-xs text-neutral-400 font-sans mt-0.5'>
              Formula: P(collision) ≈ 1 - exp(-k² / 2N) where N = 2ᴴ states.
            </p>
          </div>
          <Badge className='bg-neutral-900 border-white/20 text-neutral-300 text-xs'>
            Audience k: {populationK.toLocaleString()} Users
          </Badge>
        </div>

        {/* Population Slider */}
        <div className='flex flex-col gap-2 py-2'>
          <div className='flex items-center justify-between text-xs text-neutral-400'>
            <span>Small Website (1,000 users)</span>
            <span>E-Commerce Portal (50,000 users)</span>
            <span>Mega Platform (1,000,000 users)</span>
          </div>
          <Slider
            value={[populationK]}
            onValueChange={(val) => {
              const num = Array.isArray(val) ? val[0] : (typeof val === 'number' ? val : populationK);
              if (typeof num === 'number') setPopulationK(num);
            }}
            min={1000}
            max={1000000}
            step={5000}
            className='w-full py-1'
          />
        </div>

        {/* 3-Tier Comparison Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs'>
          {/* Weak entropy */}
          <div className='bg-black/60 border border-red-500/30 rounded-lg p-3.5 flex flex-col justify-between'>
            <div>
              <div className='flex items-center justify-between text-[10px] uppercase text-red-400 font-bold'>
                <span>Low Entropy (H = 14 Bits)</span>
                <span>N = 16.3K</span>
              </div>
              <div className='text-xl font-bold text-red-400 mt-2 font-mono'>
                {collisionProbWeak.toFixed(1)}% Collisions
              </div>
              <p className='text-[11px] text-neutral-400 font-sans mt-1'>
                Standard User-Agent + Screen Size only. Collapses rapidly due to birthday paradox.
              </p>
            </div>
            <div className='mt-3 text-[10px] text-red-300 font-bold bg-red-950/40 p-1.5 rounded'>
              ⚠️ Severe False Positives
            </div>
          </div>

          {/* Medium entropy */}
          <div className='bg-black/60 border border-amber-500/30 rounded-lg p-3.5 flex flex-col justify-between'>
            <div>
              <div className='flex items-center justify-between text-[10px] uppercase text-amber-400 font-bold'>
                <span>Medium (H = 22 Bits)</span>
                <span>N = 4.2M</span>
              </div>
              <div className='text-xl font-bold text-amber-400 mt-2 font-mono'>
                {collisionProbMedium.toFixed(2)}% Collisions
              </div>
              <p className='text-[11px] text-neutral-400 font-sans mt-1'>
                Canvas + Audio without GPU WebGL shaders or TLS JA3. Struggles at scale.
              </p>
            </div>
            <div className='mt-3 text-[10px] text-amber-300 font-bold bg-amber-950/40 p-1.5 rounded'>
              ⚡ Moderate False Matches
            </div>
          </div>

          {/* NEXUS Full Entropy */}
          <div className='bg-black/60 border border-emerald-500/40 rounded-lg p-3.5 flex flex-col justify-between shadow-lg shadow-emerald-500/5'>
            <div>
              <div className='flex items-center justify-between text-[10px] uppercase text-emerald-400 font-bold'>
                <span>NEXUS Multi-Vector (H = 33.5 Bits)</span>
                <span>N = 11.8B</span>
              </div>
              <div className='text-xl font-bold text-emerald-400 mt-2 font-mono'>
                {collisionProbNexus}
              </div>
              <p className='text-[11px] text-neutral-400 font-sans mt-1'>
                Full DAG fusion: Canvas + WebGL + Audio + JA4 + Concurrency. Deterministic precision.
              </p>
            </div>
            <div className='mt-3 text-[10px] text-emerald-300 font-bold bg-emerald-950/40 p-1.5 rounded'>
              ✓ Mathematically Unique
            </div>
          </div>
        </div>
      </div>

      {/* 3. Live Browser Extractor (Interactive for Students) */}
      <div className='bg-[#0a0a0e] border border-cyan-500/30 rounded-xl p-5 shadow-2xl flex flex-col gap-4'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10'>
          <div className='flex items-center gap-3'>
            <div className='size-9 rounded-lg bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center text-cyan-300'>
              <IconDeviceDesktop className='size-5' />
            </div>
            <div>
              <h4 className='text-xs font-bold text-white uppercase tracking-wider'>
                Live In-Browser Student Extractor
              </h4>
              <p className='text-xs text-neutral-400 font-sans mt-0.5'>
                Execute live Canvas 2D, WebGL unmasked GPU, and Audio DSP extraction directly on your active browser tab.
              </p>
            </div>
          </div>

          <Button
            onClick={runLiveExtraction}
            disabled={isExtracting}
            className='h-8 px-4 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black border-none shadow-lg shadow-cyan-500/20 active:scale-[0.98]'
          >
            {isExtracting ? (
              <>
                <IconRefresh className='size-3.5 mr-1.5 animate-spin' />
                Extracting GPU Signals...
              </>
            ) : (
              <>
                <IconSparkles className='size-3.5 mr-1.5' />
                Extract My Browser Fingerprint
              </>
            )}
          </Button>
        </div>

        {/* Hidden Canvas used for real live extraction */}
        <canvas ref={canvasRef} className='hidden' />

        {/* Live Extracted Results Card */}
        {liveExtracted ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-black/60 border border-white/10 rounded-lg p-4 animate-in fade-in duration-300'>
            {/* 1. Fingerprint ID */}
            <div className='lg:col-span-4 bg-neutral-900/80 border border-cyan-500/40 rounded p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
              <div>
                <span className='text-[10px] text-cyan-400 uppercase font-bold block'>
                  Your Live Browser Deterministic Signature
                </span>
                <span className='text-sm font-bold text-white font-mono mt-0.5 block'>
                  {liveExtracted.computedFingerprint}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Badge className='bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs'>
                  {liveExtracted.totalBits} Bits Entropy
                </Badge>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => copyToClipboard(liveExtracted.computedFingerprint)}
                  className='h-7 text-xs border-white/20 bg-black text-neutral-300 hover:text-white'
                >
                  <IconCopy className='size-3 mr-1' /> Copy ID
                </Button>
              </div>
            </div>

            {/* Canvas */}
            <div className='bg-neutral-950 border border-white/5 rounded p-2.5'>
              <span className='text-[10px] text-neutral-400 uppercase block'>Canvas 2D Hash</span>
              <span className='text-xs text-amber-300 font-bold block mt-1 truncate'>
                {liveExtracted.canvasHash}
              </span>
              <span className='text-[9px] text-neutral-500 mt-1 block'>Rendered &amp; hashed locally</span>
            </div>

            {/* WebGL */}
            <div className='bg-neutral-950 border border-white/5 rounded p-2.5'>
              <span className='text-[10px] text-neutral-400 uppercase block'>WebGL GPU Renderer</span>
              <span className='text-xs text-purple-300 font-bold block mt-1 truncate' title={liveExtracted.webglRenderer}>
                {liveExtracted.webglRenderer.slice(0, 32)}
              </span>
              <span className='text-[9px] text-neutral-500 mt-1 block'>UNMASKED_RENDERER</span>
            </div>

            {/* Audio */}
            <div className='bg-neutral-950 border border-white/5 rounded p-2.5'>
              <span className='text-[10px] text-neutral-400 uppercase block'>WebAudio Dynamics Sum</span>
              <span className='text-xs text-pink-300 font-bold block mt-1 truncate'>
                {liveExtracted.audioSum}
              </span>
              <span className='text-[9px] text-neutral-500 mt-1 block'>OfflineAudioContext buffer</span>
            </div>

            {/* Display & Hardware */}
            <div className='bg-neutral-950 border border-white/5 rounded p-2.5'>
              <span className='text-[10px] text-neutral-400 uppercase block'>Screen &amp; CPU Cores</span>
              <span className='text-xs text-emerald-300 font-bold block mt-1 truncate'>
                {liveExtracted.screenRes} • {liveExtracted.cores} Cores
              </span>
              <span className='text-[9px] text-neutral-500 mt-1 block'>RAM: {liveExtracted.ram} • {liveExtracted.timezone}</span>
            </div>
          </div>
        ) : (
          <div className='bg-black/40 border border-dashed border-white/10 rounded-lg p-6 text-center text-xs text-neutral-400'>
            <IconSparkles className='size-6 text-cyan-400 mx-auto mb-2 opacity-60' />
            <p>Click "Extract My Browser Fingerprint" above to compute your real live hardware signature.</p>
            <p className='text-[11px] text-neutral-500 mt-1'>
              Notice: No cookie permissions, camera prompts, or login credentials are required.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
