'use client';

import React, { useState, useMemo } from 'react';
import { GithubGlobe } from '@/features/decision-engine/components/github-globe';
import { GlobePulse } from '@/components/ui/cobe-globe-pulse';
import { RLVisualAnalytics } from '@/features/decision-engine/components/rl-visual-analytics';
import { CapitalFlowVisualizer } from '@/features/decision-engine/components/capital-flow-visualizer';
import { ProductAnalysisModal, type ProductAnalysisTarget } from '@/features/decision-engine/components/product-analysis-modal';
import { computeRLAdAllocation } from '@/lib/rl-ad-optimizer';
import initialEngineState from '@/data/nexus-engine-state.json';
import { EDGE_HUBS, type EdgeDeliveryHub } from '@/data/ad-delivery-hubs';
import { GLOBE_REGIONS, type PulseMarker } from '@/data/globe-regions';
import { Button } from '@/components/ui/button';
import { IconWorld, IconSparkles, IconActivity, IconArrowUpRight, IconArrowDownRight, IconArrowRight } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type EngineCampaign = (typeof initialEngineState.campaigns)[number];

export default function GlobeIntelligencePage() {
  const [activeGlobeView, setActiveGlobeView] = useState<'both' | 'arcs' | 'pulse'>('both');
  const [selectedProduct, setSelectedProduct] = useState<EngineCampaign>(initialEngineState.campaigns[0]);
  const [modalTarget, setModalTarget] = useState<ProductAnalysisTarget | null>(null);
  const [selectedHubId, setSelectedHubId] = useState<string | null>(null);

  const rlData = useMemo(() => {
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

  // Aggregate live telemetry stats
  const telemetryStats = useMemo(() => {
    const avgLatency = Math.round(EDGE_HUBS.reduce((acc, h) => acc + h.latencyMs, 0) / EDGE_HUBS.length);
    const totalImp = EDGE_HUBS.reduce((acc, h) => acc + h.throughputReqSec, 0);
    return {
      regionsCount: EDGE_HUBS.length,
      avgLatency,
      impressionsText: `${(totalImp / 1000).toFixed(1)}k`
    };
  }, []);

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-[#07090e] text-zinc-100 min-h-screen min-w-0 max-w-full font-mono'>
      {/* 1. HERO BAR: ULTRA-CLEAN */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-3'>
        <div className='flex items-center gap-3'>
          <div className='size-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400'>
            <IconWorld className='size-4' />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-base font-bold text-zinc-100 uppercase tracking-wider'>
                GLOBAL INTELLIGENCE
              </h1>
              <span className='text-[10px] text-cyan-400 font-semibold px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-800/40'>
                3D AD DELIVERY
              </span>
            </div>
          </div>
        </div>

        {/* View Switchers & Launch Analysis Button */}
        <div className='flex items-center gap-2 flex-wrap'>
          <div className='flex items-center bg-zinc-900 rounded-lg border border-zinc-800 p-0.5 text-xs'>
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
              Delivery Arcs
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
            size='sm'
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
            className='h-8 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold'
          >
            <IconSparkles className='size-3.5 mr-1.5' />
            Launch Analysis
          </Button>
        </div>
      </div>

      {/* Product Quick-Select Strip */}
      <div className='flex items-center gap-2 overflow-x-auto pb-1 text-xs'>
        <span className='text-zinc-500 text-[10px] uppercase font-bold shrink-0'>TARGET:</span>
        {initialEngineState.campaigns.slice(0, 5).map((camp: EngineCampaign) => (
          <button
            key={camp.campaign}
            onClick={() => setSelectedProduct(camp)}
            className={cn(
              'px-2.5 py-1 rounded-md border transition-all flex items-center gap-2 shrink-0',
              selectedProduct.sku === camp.sku
                ? 'bg-zinc-800 border-cyan-500/60 text-zinc-100 shadow-sm'
                : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            )}
          >
            {camp.photoUrl && (
              <div className='relative size-4 rounded overflow-hidden'>
                <Image src={camp.photoUrl} alt={camp.productName} fill sizes='16px' className='object-cover' />
              </div>
            )}
            <span className='font-bold text-[11px]'>{camp.productName || camp.sku}</span>
            <span className='text-[10px] text-zinc-500'>${camp.currentDailySpend}/d</span>
          </button>
        ))}
      </div>

      {/* 2 & 3. HERO GLOBE CONTAINER + COMPACT STATUS BAR */}
      <div className='rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 sm:p-5 flex flex-col gap-4 shadow-2xl relative overflow-hidden'>
        {/* Compact Status Bar: 4 REGIONS • 82ms AVG LATENCY • 96.4k IMPRESSIONS */}
        <div className='flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3 text-xs'>
          <div className='flex items-center gap-2'>
            <span className='size-2 rounded-full bg-emerald-400 animate-pulse' />
            <span className='font-bold text-zinc-200 uppercase tracking-wider'>LIVE TELEMETRY</span>
          </div>

          <div className='flex items-center gap-4 text-xs font-mono text-zinc-400'>
            <span>
              <strong className='text-zinc-100'>{telemetryStats.regionsCount}</strong> REGIONS
            </span>
            <span>•</span>
            <span>
              <strong className='text-cyan-400'>{telemetryStats.avgLatency}ms</strong> AVG LATENCY
            </span>
            <span>•</span>
            <span>
              <strong className='text-emerald-400'>{telemetryStats.impressionsText}</strong> IMPRESSIONS
            </span>
          </div>
        </div>

        {/* WebGL Globe Stage */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-5 items-center'>
          {/* Left Globe: Delivery Arcs */}
          {(activeGlobeView === 'both' || activeGlobeView === 'arcs') && (
            <div className={cn(
              'flex flex-col items-center justify-center relative min-h-[440px]',
              activeGlobeView === 'arcs' ? 'lg:col-span-12' : 'lg:col-span-6'
            )}>
              <div className='w-full flex items-center justify-center relative overflow-x-auto'>
                <GithubGlobe
                  activeSku={selectedProduct.sku}
                  activePlatform={selectedProduct.platform}
                  accentColor={[0.2, 0.85, 0.95]}
                  selectedHubId={selectedHubId}
                  onSelectHub={(hub) => setSelectedHubId(hub ? hub.id : null)}
                  interactive={true}
                  showControls={false}
                />
              </div>
              <div className='text-[10px] text-zinc-500 uppercase tracking-wider mt-1'>
                WebGL 3D Delivery Arcs
              </div>
            </div>
          )}

          {/* Right Globe: Sales Pulse */}
          {(activeGlobeView === 'both' || activeGlobeView === 'pulse') && (
            <div className={cn(
              'flex flex-col items-center justify-center relative min-h-[440px]',
              activeGlobeView === 'pulse' ? 'lg:col-span-12' : 'lg:col-span-6'
            )}>
              <div className='w-full flex items-center justify-center relative overflow-x-auto'>
                <GlobePulse speed={0.0035} />
              </div>
              <div className='text-[10px] text-zinc-500 uppercase tracking-wider mt-1'>
                Regional Sales &amp; Interaction Pulse
              </div>
            </div>
          )}
        </div>

        {/* 4. COMPACT HORIZONTAL REGIONAL TELEMETRY STRIP */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-zinc-900 text-xs'>
          {EDGE_HUBS.map((hub) => (
            <button
              key={hub.id}
              type='button'
              onClick={() => setSelectedHubId(selectedHubId === hub.id ? null : hub.id)}
              className={cn(
                'p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between',
                selectedHubId === hub.id
                  ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 ring-1 ring-cyan-500/40 shadow-md'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              )}
            >
              <div className='min-w-0'>
                <div className='text-[10px] text-zinc-400 font-bold uppercase truncate'>{hub.code}</div>
                <div className='text-xs font-bold text-zinc-100 mt-0.5'>{hub.throughputReqSec / 1000}k imp</div>
              </div>

              <div className='text-right shrink-0'>
                <div className='text-xs font-bold text-cyan-400'>{hub.latencyMs}ms</div>
                <div className='flex items-center justify-end gap-1 mt-0.5'>
                  <span className='size-1.5 rounded-full bg-emerald-400' />
                  <span className='text-[9px] text-zinc-500'>{hub.status}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 14. COMPACT "AI DECISION" STRIP: INSTANT SCANNING */}
      <div className='rounded-xl border border-zinc-800 bg-zinc-950/70 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs'>
        <div className='flex items-center gap-2'>
          <span className='text-cyan-400 font-bold tracking-wider uppercase text-[11px]'>AI DECISION:</span>
          <span className='text-zinc-400 text-[10px]'>RL Dynamic Divergence Vector</span>
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          {rlData.regionalStates.map((r) => (
            <div
              key={r.id}
              className={cn(
                'px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 border',
                r.spendDeltaPct > 0
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : r.spendDeltaPct < 0
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800'
              )}
            >
              <span>{r.spendDeltaPct > 0 ? '↑' : r.spendDeltaPct < 0 ? '↓' : '→'}</span>
              <span>{r.countryCode}</span>
              <span>{r.spendDeltaPct > 0 ? `+${r.spendDeltaPct}%` : `${r.spendDeltaPct}%`}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 13. VISUAL CAPITAL REALLOCATION FLOW */}
      <CapitalFlowVisualizer
        regionalStates={rlData.regionalStates}
        selectedRegionId={selectedHubId}
        onSelectRegion={(id) => setSelectedHubId(id)}
      />

      {/* 6 to 12. REINFORCEMENT LEARNING SUITE: STREAMLINED & VISUAL */}
      <RLVisualAnalytics
        data={rlData}
        selectedRegionId={selectedHubId}
        onSelectRegion={(id) => setSelectedHubId(id)}
      />

      {/* Deep-Dive Analysis Modal */}
      <ProductAnalysisModal
        product={modalTarget}
        isOpen={!!modalTarget}
        onClose={() => setModalTarget(null)}
      />
    </div>
  );
}
