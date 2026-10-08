'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { GithubGlobe } from '@/features/decision-engine/components/github-globe';
import { GlobePulse } from '@/components/ui/cobe-globe-pulse';
import { RLVisualAnalytics } from '@/features/decision-engine/components/rl-visual-analytics';
import { ProductAnalysisModal, type ProductAnalysisTarget } from '@/features/decision-engine/components/product-analysis-modal';
import { CampaignSelectorModal } from '@/features/decision-engine/components/campaign-selector-modal';
import { computeRLAdAllocation, HeadroomPolicyMode } from '@/lib/rl-ad-optimizer';
import { PlatformLogo } from '@/components/icons/platform-logos';
import initialEngineState from '@/data/nexus-engine-state.json';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconWorld, IconCpu, IconAdjustments, IconFilter } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type EngineCampaign = (typeof initialEngineState.campaigns)[number];

export default function GlobeIntelligencePage() {
  const [activeGlobeView, setActiveGlobeView] = useState<'both' | 'arcs' | 'pulse'>('both');
  const [selectedProduct, setSelectedProduct] = useState<EngineCampaign>(initialEngineState.campaigns[0]);
  const [modalTarget, setModalTarget] = useState<ProductAnalysisTarget | null>(null);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [policyMode, setPolicyMode] = useState<HeadroomPolicyMode>('BALANCED');
  const [isSyncingBackend, setIsSyncingBackend] = useState(false);

  // Compute RL Bandit Allocation with active policy mode and campaign telemetry
  const rlData = useMemo(() => {
    return computeRLAdAllocation({
      productName: selectedProduct.productName || selectedProduct.sku,
      sku: selectedProduct.sku,
      price: selectedProduct.price,
      spend: selectedProduct.currentDailySpend,
      roas: selectedProduct.roas,
      grossMarginPct: selectedProduct.marginPct,
      inventory: selectedProduct.inventory,
      platform: selectedProduct.platform,
      policyMode,
      campaignId: selectedProduct.campaign,
      targetRoas: selectedProduct.targetRoas,
      breakevenRoas: selectedProduct.breakevenRoas,
    });
  }, [selectedProduct, policyMode]);

  // Backend Retrain Execution
  const handleRetrainBackend = useCallback(async () => {
    setIsSyncingBackend(true);
    try {
      await fetch('/api/rl-allocation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: selectedProduct.campaign,
          platform: selectedProduct.platform,
          policyMode,
          productName: selectedProduct.productName,
          sku: selectedProduct.sku,
          price: selectedProduct.price,
          spend: selectedProduct.currentDailySpend,
          roas: selectedProduct.roas,
          grossMarginPct: selectedProduct.marginPct,
          inventory: selectedProduct.inventory,
        }),
      });
    } catch (err) {
      console.warn('Backend sync error:', err);
    } finally {
      setIsSyncingBackend(false);
    }
  }, [selectedProduct, policyMode]);

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
            <h1 className='text-xl sm:text-2xl font-semibold text-zinc-100 tracking-tight font-sans'>
              Global Telemetry
            </h1>
          </div>
          <p className='text-xs text-muted-foreground mt-1'>
            WebGL delivery arcs, regional intent pulse, and multi-armed bandit allocations mapped in real time.
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

      {/* Stockout Emergency Override Banner */}
      {(selectedProduct.inventory ?? 0) <= 0 && (
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-rose-500/80 bg-rose-950/40 text-rose-200 font-mono text-xs animate-pulse'>
          <div className='flex items-center gap-2.5'>
            <span className='size-2.5 rounded-full bg-rose-500 animate-ping shrink-0' />
            <span className='font-bold uppercase tracking-wider text-rose-300'>
              PRISONER&apos;S DILEMMA OVERRIDE • STOCKOUT EMERGENCY (0 UNITS)
            </span>
            <span className='text-rose-400/80 hidden md:inline'>•</span>
            <span className='text-rose-300 hidden md:inline'>
              Dual Shadow Price: <code className='font-bold text-rose-100'>&lambda;_inv = 999.0</code> (Ad Spend Frozen)
            </span>
          </div>
          <div className='flex items-center gap-2 text-rose-200 font-semibold shrink-0'>
            <span className='text-zinc-400'>Bleed Protected:</span>
            <span className='text-white font-bold bg-rose-900/80 px-2 py-0.5 rounded border border-rose-700'>
              $840/day (₹70,560/d)
            </span>
          </div>
        </div>
      )}

      {/* Omnichannel Campaign Command Strip & 40-Catalog Trigger */}
      <div className='flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card/80 font-mono text-xs'>
        {/* Active Selected Campaign Banner */}
        <div className='flex items-center gap-3'>
          {selectedProduct.photoUrl && (
            <div className='relative size-10 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 shrink-0'>
              <Image src={selectedProduct.photoUrl} alt={selectedProduct.productName || selectedProduct.sku} fill sizes='40px' className='object-cover' />
            </div>
          )}
          <div className='flex flex-col min-w-0'>
            <div className='flex items-center gap-2'>
              <PlatformLogo platform={selectedProduct.platform} size={14} />
              <span className='font-bold text-zinc-100 truncate text-sm'>
                {selectedProduct.productName || selectedProduct.sku}
              </span>
              <span className='text-[10px] text-zinc-400 px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800'>
                {selectedProduct.sku}
              </span>
              {(selectedProduct.inventory ?? 0) <= 0 ? (
                <span className='text-[9px] px-1.5 py-0.2 rounded bg-rose-950/80 border border-rose-800 text-rose-300 font-bold flex items-center gap-1'>
                  <span className='size-1.5 rounded-full bg-rose-500 animate-ping shrink-0' />
                  0 Units (Stockout Shock • &lambda;_inv = 999.0)
                </span>
              ) : (
                <span className='text-[9px] px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400'>
                  {selectedProduct.inventory} Units
                </span>
              )}
            </div>
            <div className='flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5 flex-wrap'>
              <span className='uppercase text-zinc-500 font-semibold'>{selectedProduct.platform}</span>
              <span>•</span>
              <span>
                Spend: <span className='text-zinc-200 font-bold'>${selectedProduct.currentDailySpend?.toLocaleString()}/d</span>
                <span className='text-zinc-500 text-[10px] ml-1'>(₹{(Math.round((selectedProduct.currentDailySpend ?? 0) * 84)).toLocaleString('en-IN')}/d)</span>
              </span>
              <span>•</span>
              <span>ROAS: <span className={cn('font-bold', selectedProduct.roas >= 3.2 ? 'text-emerald-400' : selectedProduct.roas < 1.8 ? 'text-rose-400' : 'text-amber-400')}>{selectedProduct.roas?.toFixed(2)}x</span></span>
            </div>
          </div>
        </div>

        {/* Quick Representative Switcher & Browse 40 Button */}
        <div className='flex items-center gap-2 overflow-x-auto'>
          {/* Quick representatives across platforms */}
          <div className='hidden xl:flex items-center gap-1.5 text-[11px]'>
            {(
              ['meta-315122-001', 'amazon-310805-137', 'google-942851-002', 'shopify-AH8050-100']
                .map((id) => initialEngineState.campaigns.find((c) => c.campaign === id))
                .filter(Boolean) as EngineCampaign[]
            ).map((c) => (
              <button
                key={c.campaign}
                onClick={() => setSelectedProduct(c)}
                className={cn(
                  'px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 shrink-0',
                  selectedProduct.campaign === c.campaign
                    ? 'bg-zinc-800 border-zinc-600 text-zinc-100 shadow-sm'
                    : 'bg-zinc-950/80 border-border text-zinc-400 hover:border-zinc-700'
                )}
              >
                <PlatformLogo platform={c.platform} size={12} />
                <span className='truncate max-w-[110px]'>{c.productName || c.sku}</span>
                {c.inventory === 0 && (
                  <span className='size-1.5 rounded-full bg-rose-500 animate-pulse' />
                )}
              </button>
            ))}
          </div>

          <Button
            size='sm'
            onClick={() => setIsCampaignModalOpen(true)}
            className='bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-mono text-xs font-semibold shrink-0 gap-1.5'
          >
            <IconFilter className='size-3.5' />
            <span>Browse All 40 Campaigns</span>
            <Badge variant='outline' className='ml-1 text-[9px] border-zinc-400 bg-zinc-200 text-zinc-900'>
              40 Active
            </Badge>
          </Button>
        </div>
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
                <div className='text-zinc-500'>FC-ALLENTOWN</div>
                <div className='text-zinc-200 font-bold'>24ms &bull; 48.2k imp</div>
              </div>
              <div className='p-1.5 rounded bg-zinc-900/60 border border-zinc-800/60'>
                <div className='text-zinc-500'>FC-DAVENTRY</div>
                <div className='text-zinc-200 font-bold'>38ms &bull; 29.4k imp</div>
              </div>
              <div className='p-1.5 rounded bg-zinc-900/60 border border-zinc-800/60'>
                <div className='text-zinc-500'>FC-NARITA</div>
                <div className='text-zinc-200 font-bold'>64ms &bull; 18.9k imp</div>
              </div>
              <div className='p-1.5 rounded bg-zinc-900/60 border border-zinc-800/60'>
                <div className='text-zinc-500'>FC-CHANGI</div>
                <div className='text-zinc-200 font-bold'>82ms &bull; 4.1k imp</div>
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

        <RLVisualAnalytics
          data={rlData}
          onPolicyModeChange={setPolicyMode}
          onRetrainBackend={handleRetrainBackend}
          isLoading={isSyncingBackend}
        />
      </div>

      {/* Deep-Dive Analysis Modal */}
      <ProductAnalysisModal
        product={modalTarget}
        isOpen={!!modalTarget}
        onClose={() => setModalTarget(null)}
      />

      {/* Omnichannel Campaign & Catalog Selector Modal */}
      <CampaignSelectorModal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        selectedCampaign={selectedProduct}
        onSelectCampaign={(c) => setSelectedProduct(c)}
      />
    </div>
  );
}
