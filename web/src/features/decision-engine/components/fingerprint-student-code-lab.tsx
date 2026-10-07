'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  IconCode,
  IconCopy,
  IconCheck,
  IconBrandJavascript,
  IconTerminal,
  IconCpu,
  IconMathFunction,
  IconFileCode,
  IconSparkles
} from '@tabler/icons-react';

interface CodeSnippet {
  id: string;
  title: string;
  category: string;
  description: string;
  language: string;
  code: string;
}

const SNIPPETS: CodeSnippet[] = [
  {
    id: 'canvas-extractor',
    title: '1. Deterministic Canvas 2D Extractor',
    category: 'Computer Graphics & Fonts',
    description:
      'Draws complex typography, emoji, winding rules, and alpha gradients. The resulting PNG byte buffer varies deterministically across OS font rasterizers.',
    language: 'typescript',
    code: `/**
 * Canvas 2D Entropy Extractor
 * Exploits sub-pixel anti-aliasing variations in DirectWrite (Win), CoreText (macOS), and FreeType (Linux).
 */
export function extractCanvasFingerprint(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 240;
  canvas.height = 60;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return 'canvas_unsupported';

  // 1. Geometry fill with winding rule
  ctx.rect(0, 0, 10, 10);
  ctx.rect(2, 2, 6, 6);
  ctx.fill('evenodd');

  // 2. Multi-color text rasterization & emoji
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#f60';
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = '#069';
  ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
  ctx.fillText('NEXUS-DQPS 🛡️ <canvas> 😃', 2, 15);

  // 3. Alpha blend composite gradient
  ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
  ctx.fillText('NEXUS-DQPS 🛡️ <canvas> 😃', 4, 17);

  // 4. Extract data URL & compute fast 32-bit FNV-1a hash
  const dataUrl = canvas.toDataURL();
  return fnv1a(dataUrl);
}`
  },
  {
    id: 'webaudio-extractor',
    title: '2. WebAudio DynamicsCompressor Oscillator',
    category: 'Digital Signal Processing (DSP)',
    description:
      'Synthesizes an audio oscillator through an offline dynamics compressor. Floating point math rounding differences in software audio engines generate reproducible acoustics.',
    language: 'typescript',
    code: `/**
 * Web Audio Hardware DSP Extractor
 * Generates audio offline with zero audible sound through the user's speakers.
 */
export async function extractAudioFingerprint(): Promise<string> {
  const AudioContextClass = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
  if (!AudioContextClass) return 'audio_unsupported';

  // 1. Create offline audio context (1 channel, 44.1kHz sample rate)
  const context = new AudioContextClass(1, 44100, 44100);

  // 2. Synthesize high frequency oscillator wave
  const oscillator = context.createOscillator();
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(10000, context.currentTime);

  // 3. Chain through high-pass dynamics compressor
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-50, context.currentTime);
  compressor.knee.setValueAtTime(40, context.currentTime);
  compressor.ratio.setValueAtTime(12, context.currentTime);
  compressor.attack.setValueAtTime(0, context.currentTime);
  compressor.release.setValueAtTime(0.25, context.currentTime);

  oscillator.connect(compressor);
  compressor.connect(context.destination);
  oscillator.start(0);

  // 4. Render buffer and sum float32 channel samples
  const renderedBuffer = await context.startRendering();
  const channelData = renderedBuffer.getChannelData(0);
  
  let sampleSum = 0;
  for (let i = 0; i < channelData.length; i += 100) {
    sampleSum += Math.abs(channelData[i]);
  }

  return 'au_' + sampleSum.toFixed(7);
}`
  },
  {
    id: 'webgl-inspector',
    title: '3. WebGL GPU Unmasked Renderer Inspector',
    category: 'Hardware Acceleration',
    description:
      'Queries the WebGL debug renderer info extension to bypass standard user-agent masking and directly identify the underlying GPU silicon.',
    language: 'typescript',
    code: `/**
 * WebGL GPU Driver & Hardware Inspector
 * Exposes underlying physical graphics card and shader precision limits.
 */
export function extractWebGLHardwareProfile(): Record<string, any> {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return { error: 'webgl_disabled' };

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const unmaskedVendor = debugInfo 
    ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) 
    : gl.getParameter(gl.VENDOR);
    
  const unmaskedRenderer = debugInfo 
    ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) 
    : gl.getParameter(gl.RENDERER);

  // Query precision format of highp fragment shaders
  const shaderPrecision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);

  return {
    vendor: unmaskedVendor,
    renderer: unmaskedRenderer,
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    maxRenderBufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
    shaderPrecisionBits: shaderPrecision ? shaderPrecision.precision : 0
  };
}`
  },
  {
    id: 'entropy-math',
    title: '4. Shannon Entropy & Jaccard Graph Clustering',
    category: 'Information Theory & Graph Clustering',
    description:
      'Computes Shannon Entropy in bits and Jaccard similarity coefficient to cluster disparate browser sessions into an Identity Entity DAG.',
    language: 'typescript',
    code: `/**
 * Shannon Information Entropy & Multi-Device Graph Stitching
 * H(X) = -∑ P(x_i) * log2(P(x_i))
 */

// 1. Calculate Information Entropy (Bits)
export function calculateShannonEntropy(probabilities: number[]): number {
  return probabilities.reduce((entropy, p) => {
    if (p <= 0) return entropy;
    return entropy - p * Math.log2(p);
  }, 0);
}

// 2. Jaccard Graph Edge Weight between Two Disjoint Devices
export function computeJaccardSimilarity(deviceA: Set<string>, deviceB: Set<string>): number {
  const intersection = new Set([...deviceA].filter(x => deviceB.has(x)));
  const union = new Set([...deviceA, ...deviceB]);
  
  if (union.size === 0) return 0;
  return intersection.size / union.size; // J(A, B) ∈ [0, 1]
}

// 3. Graph Cluster Resolution Gate
export function shouldStitchIdentityCluster(similarity: number, subnetMatch: boolean): boolean {
  // If devices share /24 subnet and maintain Jaccard >= 0.85 across hardware vectors
  const threshold = subnetMatch ? 0.85 : 0.94;
  return similarity >= threshold;
}`
  }
];

export function FingerprintStudentCodeLab() {
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>('canvas-extractor');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeSnippet =
    SNIPPETS.find((s) => s.id === selectedSnippetId) || SNIPPETS[0];

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success('Code snippet copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className='flex flex-col gap-6 font-mono'>
      {/* Banner */}
      <div className='bg-[#08080b] border border-white/10 rounded-xl p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <div className='size-11 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20'>
            <IconTerminal className='size-6 text-white' />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h3 className='text-sm font-bold text-white uppercase tracking-wider'>
                Student Reference Lab: TypeScript Implementations
              </h3>
              <Badge className='bg-indigo-950/80 border border-indigo-500/50 text-indigo-300 text-[10px]'>
                OPEN SOURCE REFERENCE
              </Badge>
            </div>
            <p className='text-xs text-neutral-400 font-sans mt-0.5'>
              Inspect and run clean implementations of Canvas 2D, Web Audio, WebGL GPU, and Shannon Entropy mathematics.
            </p>
          </div>
        </div>
      </div>

      {/* Snippet Selection Tabs */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5'>
        {SNIPPETS.map((snippet) => {
          const isSelected = snippet.id === selectedSnippetId;
          return (
            <button
              key={snippet.id}
              onClick={() => setSelectedSnippetId(snippet.id)}
              className={cn(
                'p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2',
                isSelected
                  ? 'bg-neutral-900 border-purple-500 shadow-lg shadow-purple-500/10'
                  : 'bg-[#0a0a0d] border-white/10 hover:border-white/20 opacity-70 hover:opacity-100'
              )}
            >
              <div>
                <span className='text-[10px] text-purple-400 uppercase tracking-widest block font-bold'>
                  {snippet.category}
                </span>
                <span className='text-xs font-bold text-white block mt-1'>{snippet.title}</span>
              </div>
              <span className='text-[10px] text-neutral-500'>Click to view implementation</span>
            </button>
          );
        })}
      </div>

      {/* Active Snippet Code Viewer */}
      <div className='bg-[#070709] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col'>
        {/* Code Bar Header */}
        <div className='px-5 py-3 bg-black/60 border-b border-white/10 flex items-center justify-between gap-3'>
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1.5 mr-2'>
              <div className='size-3 rounded-full bg-red-500/80' />
              <div className='size-3 rounded-full bg-yellow-500/80' />
              <div className='size-3 rounded-full bg-green-500/80' />
            </div>
            <span className='text-xs font-bold text-white'>{activeSnippet.title}</span>
            <Badge variant='outline' className='text-[10px] border-white/20 text-neutral-400'>
              {activeSnippet.language.toUpperCase()}
            </Badge>
          </div>

          <Button
            size='sm'
            onClick={() => handleCopy(activeSnippet.code, activeSnippet.id)}
            className='h-7 px-3 text-xs bg-purple-600 hover:bg-purple-500 text-white font-mono border-none'
          >
            {copiedId === activeSnippet.id ? (
              <>
                <IconCheck className='size-3 mr-1 text-emerald-300' /> Copied!
              </>
            ) : (
              <>
                <IconCopy className='size-3 mr-1' /> Copy Code
              </>
            )}
          </Button>
        </div>

        {/* Description Banner */}
        <div className='px-5 py-2.5 bg-neutral-900/40 border-b border-white/5 text-xs text-neutral-300 font-sans'>
          {activeSnippet.description}
        </div>

        {/* Code Block with line numbers */}
        <div className='p-5 overflow-x-auto bg-[#040406] text-xs font-mono leading-relaxed text-neutral-200 select-text'>
          <pre className='whitespace-pre'>
            <code>{activeSnippet.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
