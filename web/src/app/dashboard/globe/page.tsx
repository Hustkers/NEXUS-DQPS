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
import { IconWorld, IconCpu, IconAdjustments } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type EngineCampaign = (typeof initialEngineState.campaigns)[number];

export default function GlobeIntelligencePage() {
  const [activeGlobeView, setActiveGlobeView] = useState<'both' | 'arcs' | 'pulse'>('both');
  const [selectedProduct, setSelectedProduct] = useState<EngineCampaign>(initialEngineState.campaigns[0]);
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

  const isBoth = activeGlobeView === 'both';
  const stage1Size = isBoth ? 360 : 540;
  const stage2Size = isBoth ? 360 : 560;
  const stageMinH = isBoth ? 'min-h-[500px]' : 'min-h-[620px]';

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-background text-zinc-100 min-h-screen'>
      {/* Page Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4'>
        <div>
          <div className='flex items-center gap-2'>
            <IconWorld className='size-6 text-zinc-100' />
            <h1 className='text-xl font-mono font-bold text-zinc-100 uppercase tracking-tight'>
              3D Global Ad Delivery &amp; Customer Interaction Intelligence
            </h1>
          </div>
          <p className='text-xs font-mono text-muted-foreground mt-1'>
            WebGL Ad Delivery Arcs • Regional Telemetry &amp; Intent Pulse • Reinforcement Learning Bandit Allocation
          </p>
        </div>

        <div className='flex items-center gap-2'>
          {/* Globe View Filter */}
          <div className='flex items-center bg-zinc-900 rounded-lg border border-border p-0.5 text-xs font-mono'>
            <button
              onClick={() => setActiveGlobeView('both')}
              className={cn(
                'px-2.5 py-1 rounded font-medium transition-all',
                activeGlobeView === 'both' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setActiveGlobeView('arcs')}
              className={cn(
                'px-2.5 py-1 rounded font-medium transition-all',
                activeGlobeView === 'arcs' ? 'bg-zinc-800 text-zinc-100 border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              Delivery Arcs
            </button>
            <button
              onClick={() => setActiveGlobeView('pulse')}
              className={cn(
                'px-2.5 py-1 rounded font-medium transition-all',
                activeGlobeView === 'pulse' ? 'bg-zinc-800 text-zinc-100 border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'
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
            className='bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-mono text-xs font-semibold'
          >
            <IconAdjustments className='size-3.5 mr-1.5' />
            Launch Modal Analysis
          </Button>
        </div>
      </div>

      {/* Product Quick-Select Strip */}
      <div className='flex items-center gap-2.5 overflow-x-auto pb-1 font-mono text-xs'>
        <span className='text-zinc-500 text-[11px] uppercase tracking-wider shrink-0'>Active Models:</span>
        {initialEngineState.campaigns.slice(0, 5).map((camp: EngineCampaign) => (
          <button
            key={camp.campaign}
            onClick={() => setSelectedProduct(camp)}
            className={cn(
              'px-3 py-1.5 rounded-lg border transition-all flex items-center gap-2 shrink-0',
              selectedProduct.sku === camp.sku
                ? 'bg-zinc-800 border-zinc-600 text-zinc-100 shadow-sm'
                : 'bg-zinc-950/80 border-border text-zinc-400 hover:border-zinc-700'
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
            'rounded-2xl border border-border bg-card p-5 flex flex-col justify-between shadow-sm overflow-hidden',
            activeGlobeView === 'arcs' ? 'lg:col-span-12' : 'lg:col-span-6'
          )}>
            <div>
              <div className='flex items-center justify-between border-b border-border/80 pb-3 mb-3'>
                <div className='flex items-center gap-2'>
                  <span className='size-2 rounded-full bg-zinc-300' />
                  <h3 className='font-mono text-sm font-bold text-zinc-100'>
                    STAGE 1: AD DELIVERY ARCS
                  </h3>
                </div>
                <Badge variant='outline' className='font-mono text-[10px] border-zinc-700 bg-zinc-900 text-zinc-300'>
                  WebGL Delivery Stream
                </Badge>
              </div>

              <p className='text-xs font-mono text-muted-foreground mb-2'>
                WebGL telemetry scanning global delivery vectors across Meta Ads, Google Shopping, Amazon DSP, and Shopify direct routes.
              </p>

              <div className={cn(
                'w-full flex items-center justify-center relative overflow-hidden py-2',
                stageMinH
              )}>
                <GithubGlobe
                  activeSku={selectedProduct.sku}
                  activePlatform={selectedProduct.platform}
                  accentColor={[0.85, 0.85, 0.85]}
                  size={stage1Size}
                />
              </div>
            </div>

            <div className='grid grid-cols-4 gap-2 pt-3 border-t border-border text-center font-mono text-[10px]'>
              <div className='p-1.5 rounded bg-zinc-900/60 border border-zinc-800/60'>
                <div className='text-zinc-500'>US-EAST</div>
                <div className='text-zinc-200 font-bold'>24ms • 48.2k imp</div>
              </div>
              <div className='p-1.5 rounded bg-zinc-900/60 border border-zinc-800/60'>
                <div className='text-zinc-500'>EMEA-LON</div>
                <div className='text-zinc-200 font-bold'>38ms • 29.4k imp</div>
              </div>
              <div className='p-1.5 rounded bg-zinc-900/60 border border-zinc-800/60'>
                <div className='text-zinc-500'>APAC-TYO</div>
                <div className='text-zinc-200 font-bold'>64ms • 18.9k imp</div>
              </div>
              <div className='p-1.5 rounded bg-zinc-900/60 border border-zinc-800/60'>
                <div className='text-zinc-500'>SEA-SGP</div>
                <div className='text-zinc-200 font-bold'>82ms • 4.1k imp</div>
              </div>
            </div>
          </div>
        )}

        {/* Globe 2: Analysis Completed (Cobe Globe Pulse) */}
        {(activeGlobeView === 'both' || activeGlobeView === 'pulse') && (
          <div className={cn(
            'rounded-2xl border border-border bg-card p-5 flex flex-col justify-between shadow-sm overflow-hidden',
            activeGlobeView === 'pulse' ? 'lg:col-span-12' : 'lg:col-span-6'
          )}>
            <div>
              <div className='flex items-center justify-between border-b border-border/80 pb-3 mb-3'>
                <div className='flex items-center gap-2'>
                  <span className='size-2 rounded-full bg-zinc-300' />
                  <h3 className='font-mono text-sm font-bold text-zinc-100'>
                    STAGE 2: REGIONAL TELEMETRY &amp; INTERACTION PULSE
                  </h3>
                </div>
                <Badge variant='outline' className='font-mono text-[10px] border-zinc-700 bg-zinc-900 text-zinc-300'>
                  Regional Orthographic Map
                </Badge>
              </div>

              <p className='text-xs font-mono text-muted-foreground mb-2'>
                Interactive customer interaction pulse: High sales velocity in Red, moderate momentum in Amber, and suppressed in Zinc. Click any region to inspect unit economics.
              </p>

              <div className={cn(
                'w-full flex items-center justify-center relative overflow-hidden py-2',
                stageMinH
              )}>
                <GlobePulse
                  speed={0.0035}
                  renderDetailPanel={true}
                  size={stage2Size}
                  showRecentPurchases={true}
                  maxOrders={isBoth ? 3 : 4}
                />
              </div>
            </div>

            <div className='flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border font-mono text-[10px]'>
              <div className='flex items-center gap-1.5 text-zinc-300'>
                <span className='size-2 rounded-full bg-zinc-200' />
                <span>High Velocity (US East/West: 78% P_conv)</span>
              </div>
              <div className='flex items-center gap-1.5 text-zinc-300'>
                <span className='size-2 rounded-full bg-zinc-400' />
                <span>Moderate Momentum (EMEA, APAC, SEA: 32%-56% P_conv)</span>
              </div>
              <div className='flex items-center gap-1.5 text-zinc-300'>
                <span className='size-2 rounded-full bg-zinc-600' />
                <span>Suppressed / Paused (LATAM, Nordic: Stockout Shield)</span>
              </div>
              <div className='text-zinc-400 font-medium'>
                Click marker for Net Margin &amp; Profit
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Embedded Reinforcement Learning Visual Analytics Suite */}
      <div className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
        <div className='mb-4 flex items-center justify-between border-b border-border/80 pb-3'>
          <div className='flex items-center gap-2'>
            <IconCpu className='size-5 text-zinc-300' />
            <h2 className='text-base font-mono font-bold text-zinc-100 uppercase tracking-tight'>
              Reinforcement Learning Optimization &amp; Headroom Policy for {selectedProduct.productName}
            </h2>
          </div>
          <Badge variant='outline' className='font-mono text-xs border-zinc-700 bg-zinc-900 text-zinc-200'>
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
