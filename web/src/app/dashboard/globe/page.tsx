'use client';

import React, { useState } from 'react';
import { GithubGlobe } from '@/features/decision-engine/components/github-globe';
import { GlobePulse } from '@/components/ui/cobe-globe-pulse';
import { RLVisualAnalytics } from '@/features/decision-engine/components/rl-visual-analytics';
import { ProductAnalysisModal, type ProductAnalysisTarget } from '@/features/decision-engine/components/product-analysis-modal';
import { computeRLAdAllocation } from '@/lib/rl-ad-optimizer';
import initialEngineState from '@/data/nexus-engine-state.json';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconWorld, IconCpu, IconSparkles, IconArrowRight, IconActivity } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function GlobeIntelligencePage() {
  const [activeGlobeView, setActiveGlobeView] = useState<'both' | 'arcs' | 'pulse'>('both');
  const [selectedProduct, setSelectedProduct] = useState<any>(initialEngineState.campaigns[0]);
  const [modalTarget, setModalTarget] = useState<ProductAnalysisTarget | null>(null);

  const rlData = React.useMemo(() => {
    return computeRLAdAllocation({
      productName: selectedProduct.productName || selectedProduct.sku,
      sku: selectedProduct.sku,
      price: selectedProduct.price,
      spend: selectedProduct.currentDailySpend,
      roas: selectedProduct.roas,
      grossMarginPct: selectedProduct.marginPct,
      inventory: selectedProduct.inventory
    });
  }, [selectedProduct]);

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-[#07090e] text-zinc-100 min-h-screen'>
      {/* Page Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4'>
        <div>
          <div className='flex items-center gap-2'>
            <IconWorld className='size-6 text-cyan-400' />
            <h1 className='text-xl font-mono font-bold text-zinc-100 uppercase tracking-tight'>
              3D Global Ad Delivery &amp; Customer Interaction Intelligence
            </h1>
          </div>
          <p className='text-xs font-mono text-zinc-500 mt-1'>
            WebGL 3D Delivery Arcs • Cobe Globe Pulse (Red/Yellow Heatmap • No Grey) • Reinforcement Learning Bandit
          </p>
        </div>

        <div className='flex items-center gap-2'>
          {/* Globe View Filter */}
          <div className='flex items-center bg-zinc-900 rounded-lg border border-zinc-800 p-0.5 text-xs font-mono'>
            <button
              onClick={() => setActiveGlobeView('both')}
              className={cn(
                'px-2.5 py-1 rounded font-semibold transition-all',
                activeGlobeView === 'both' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setActiveGlobeView('arcs')}
              className={cn(
                'px-2.5 py-1 rounded font-semibold transition-all',
                activeGlobeView === 'arcs' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60' : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              Analysing Arcs
            </button>
            <button
              onClick={() => setActiveGlobeView('pulse')}
              className={cn(
                'px-2.5 py-1 rounded font-semibold transition-all',
                activeGlobeView === 'pulse' ? 'bg-rose-950 text-rose-300 border border-rose-800/60' : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              Sales Pulse
            </button>
          </div>

          <Button
            onClick={() => {
              setModalTarget({
                productName: selectedProduct.productName,
                sku: selectedProduct.sku,
                photoUrl: selectedProduct.photoUrl,
                platform: selectedProduct.platform,
                campaign: selectedProduct.campaign,
                inventory: selectedProduct.inventory,
                roas: selectedProduct.roas,
                spend: selectedProduct.currentDailySpend,
                severity: selectedProduct.inventory === 0 ? 'CRITICAL' : 'HEALTHY'
              });
            }}
            className='bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs'
          >
            <IconSparkles className='size-3.5 mr-1.5' />
            Launch Modal Analysis
          </Button>
        </div>
      </div>

      {/* Product Quick-Select Strip */}
      <div className='flex items-center gap-2.5 overflow-x-auto pb-1 font-mono text-xs'>
        <span className='text-zinc-500 text-[11px] uppercase tracking-wider shrink-0'>Active Models:</span>
        {initialEngineState.campaigns.slice(0, 5).map((camp: any) => (
          <button
            key={camp.campaign}
            onClick={() => setSelectedProduct(camp)}
            className={cn(
              'px-3 py-1.5 rounded-lg border transition-all flex items-center gap-2 shrink-0',
              selectedProduct.sku === camp.sku
                ? 'bg-zinc-800 border-cyan-500/60 text-zinc-100 shadow-sm'
                : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            )}
          >
            {camp.photoUrl && (
              <div className='relative size-5 rounded overflow-hidden'>
                <Image src={camp.photoUrl} alt={camp.productName} fill sizes='20px' className='object-cover' />
              </div>
            )}
            <span className='font-bold'>{camp.productName || camp.sku}</span>
            <span className='text-[10px] text-zinc-500'>${camp.currentDailySpend}/d</span>
          </button>
        ))}
      </div>

      {/* Main 3D Globe Stage Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Globe 1: Analysing Arcs (GitHub 3D WebGL Globe) */}
        {(activeGlobeView === 'both' || activeGlobeView === 'arcs') && (
          <div className={cn(
            'rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 flex flex-col justify-between shadow-xl',
            activeGlobeView === 'arcs' ? 'lg:col-span-12' : 'lg:col-span-6'
          )}>
            <div>
              <div className='flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3'>
                <div className='flex items-center gap-2'>
                  <span className='size-2.5 rounded-full bg-cyan-400 animate-ping' />
                  <h3 className='font-mono text-sm font-bold text-zinc-100'>
                    STAGE 1: ANALYSING PHASE (AD DELIVERY ARCS)
                  </h3>
                </div>
                <Badge variant='outline' className='font-mono text-[10px] border-cyan-500/40 text-cyan-300'>
                  github.com/globe WebGL
                </Badge>
              </div>

              <p className='text-xs font-mono text-zinc-400 mb-2'>
                Live WebGL telemetry scanning global delivery vectors across Meta, Google Shopping, Amazon DSP &amp; TikTok feeds.
              </p>

              <div className='w-full h-[360px] flex items-center justify-center relative'>
                <GithubGlobe
                  className='w-full h-full'
                  activeSku={selectedProduct.sku}
                  activePlatform={selectedProduct.platform}
                  accentColor={[0.2, 0.85, 0.95]}
                />
              </div>
            </div>

            <div className='grid grid-cols-4 gap-2 pt-3 border-t border-zinc-900 text-center font-mono text-[10px]'>
              <div className='p-1.5 rounded bg-zinc-900/60 border border-zinc-800/60'>
                <div className='text-zinc-500'>US-EAST</div>
                <div className='text-cyan-400 font-bold'>24ms • 48.2k imp</div>
              </div>
              <div className='p-1.5 rounded bg-zinc-900/60 border border-zinc-800/60'>
                <div className='text-zinc-500'>EMEA-LON</div>
                <div className='text-blue-400 font-bold'>38ms • 29.4k imp</div>
              </div>
              <div className='p-1.5 rounded bg-zinc-900/60 border border-zinc-800/60'>
                <div className='text-zinc-500'>APAC-TYO</div>
                <div className='text-amber-400 font-bold'>64ms • 18.9k imp</div>
              </div>
              <div className='p-1.5 rounded bg-zinc-900/60 border border-zinc-800/60'>
                <div className='text-zinc-500'>SEA-SGP</div>
                <div className='text-emerald-400 font-bold'>82ms • 4.1k imp</div>
              </div>
            </div>
          </div>
        )}

        {/* Globe 2: Analysis Completed (Cobe Globe Pulse) */}
        {(activeGlobeView === 'both' || activeGlobeView === 'pulse') && (
          <div className={cn(
            'rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 flex flex-col justify-between shadow-xl',
            activeGlobeView === 'pulse' ? 'lg:col-span-12' : 'lg:col-span-6'
          )}>
            <div>
              <div className='flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3'>
                <div className='flex items-center gap-2'>
                  <span className='size-2.5 rounded-full bg-rose-500 animate-pulse' />
                  <h3 className='font-mono text-sm font-bold text-rose-300'>
                    STAGE 2: ANALYSIS COMPLETED (SALES &amp; INTERACTION PULSE)
                  </h3>
                </div>
                <Badge variant='outline' className='font-mono text-[10px] border-rose-500/40 text-rose-400'>
                  cobe-globe-pulse
                </Badge>
              </div>

              <p className='text-xs font-mono text-zinc-400 mb-2'>
                Interactive customer interaction pulse: High sales in <strong className='text-rose-400'>Red</strong>, decreasingly <strong className='text-amber-400'>Yellow</strong>, and <strong className='text-zinc-300'>No Grey</strong>.
              </p>

              <div className='w-full h-[360px] flex items-center justify-center relative'>
                <GlobePulse className='w-full h-full max-w-[360px]' speed={0.0035} />
              </div>
            </div>

            <div className='flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-900 font-mono text-[10px]'>
              <div className='flex items-center gap-1.5 text-zinc-300'>
                <span className='size-2 rounded-full bg-red-500 ring-2 ring-red-500/20' />
                <span>High Sales (US East/West: 78% P_conv)</span>
              </div>
              <div className='flex items-center gap-1.5 text-zinc-300'>
                <span className='size-2 rounded-full bg-orange-500' />
                <span>EMEA (56% P_conv)</span>
              </div>
              <div className='flex items-center gap-1.5 text-zinc-300'>
                <span className='size-2 rounded-full bg-yellow-400' />
                <span>APAC (44% P_conv)</span>
              </div>
              <div className='text-cyan-400 font-bold'>
                No Grey • Suppressed Low-Prob
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Embedded Reinforcement Learning Visual Analytics Suite */}
      <div className='rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-5 shadow-xl'>
        <div className='mb-4 flex items-center justify-between border-b border-zinc-800/80 pb-3'>
          <div className='flex items-center gap-2'>
            <IconCpu className='size-5 text-emerald-400' />
            <h2 className='text-base font-mono font-bold text-zinc-100 uppercase tracking-tight'>
              Reinforcement Learning Optimization &amp; Headroom Policy for {selectedProduct.productName}
            </h2>
          </div>
          <Badge variant='outline' className='font-mono text-xs border-emerald-500/40 text-emerald-400 bg-emerald-950/30'>
            Expected Lift: +${rlData.totalProjectedProfitLift.toLocaleString()}
          </Badge>
        </div>

        <RLVisualAnalytics data={rlData} />
      </div>

      {/* Deep-Dive Analysis Modal */}
      <ProductAnalysisModal
        product={modalTarget}
        isOpen={!!modalTarget}
        onClose={() => setModalTarget(null)}
      />
    </div>
  );
}
