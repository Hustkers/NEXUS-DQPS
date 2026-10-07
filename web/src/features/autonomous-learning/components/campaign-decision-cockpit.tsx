'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type {
  CampaignLearningProfile,
  CreativeFormat,
  AudienceType,
  PlacementType
} from '@/lib/autonomous-learning/types';

interface CampaignDecisionCockpitProps {
  campaigns: CampaignLearningProfile[];
  selectedCampaign: CampaignLearningProfile;
  onSelectCampaign: (c: CampaignLearningProfile) => void;
  onChangeStrategy?: (updated: {
    creativeFormat: CreativeFormat;
    audienceType: AudienceType;
    placement: PlacementType;
  }) => void;
  className?: string;
}

export function CampaignDecisionCockpit({
  campaigns,
  selectedCampaign,
  onSelectCampaign,
  onChangeStrategy,
  className
}: CampaignDecisionCockpitProps) {
  const [activeTab, setActiveTab] = useState<'ranked' | 'strategy' | 'quadrant'>('ranked');

  // Sorted by marginal return descending
  const sorted = [...campaigns].sort((a, b) => b.marginalProfitRoas - a.marginalProfitRoas);

  const currentStrat = selectedCampaign.currentStrategy;
  const recStrat = selectedCampaign.recommendedStrategy;
  const profitDelta = selectedCampaign.expectedProfit - selectedCampaign.currentProfit;
  const roasDelta = +(selectedCampaign.expectedProfitRoas - selectedCampaign.currentProfitRoas).toFixed(2);

  return (
    <div className={cn('rounded-2xl border border-border/80 bg-card p-5 sm:p-6 font-mono shadow-xs space-y-4', className)}>
      {/* Cockpit Header with Unified Tabs */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3'>
        <div className='flex items-center gap-2'>
          <Icons.sparkles className='size-4 text-emerald-500' />
          <h2 className='text-xs font-bold uppercase tracking-wider text-foreground'>
            CAMPAIGN TARGETING &amp; STRATEGY
          </h2>
          <Badge variant='outline' className='text-[10px] uppercase font-bold border-border'>
            {campaigns.length} Targets
          </Badge>
        </div>

        {/* Tab Controls */}
        <div className='flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border text-xs'>
          <button
            onClick={() => setActiveTab('ranked')}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
              activeTab === 'ranked'
                ? 'bg-background text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Ranked Reallocations
          </button>
          <button
            onClick={() => setActiveTab('strategy')}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
              activeTab === 'strategy'
                ? 'bg-background text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Strategy Tuning
          </button>
          <button
            onClick={() => setActiveTab('quadrant')}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
              activeTab === 'quadrant'
                ? 'bg-background text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Opportunity Quadrant
          </button>
        </div>
      </div>

      {/* TAB 1: Ranked Reallocations Table (Clean, High-Density 1-line rows) */}
      {activeTab === 'ranked' && (
        <div className='space-y-2'>
          <div className='grid grid-cols-12 text-[10px] uppercase font-bold text-muted-foreground px-3 py-1 border-b border-border/40'>
            <span className='col-span-1 text-center'>#</span>
            <span className='col-span-4'>Campaign &amp; Platform</span>
            <span className='col-span-3 text-right'>Budget Move</span>
            <span className='col-span-2 text-right'>Yield (Next ₹1)</span>
            <span className='col-span-2 text-right'>ProfitROAS</span>
          </div>

          <div className='space-y-1.5'>
            {sorted.map((c, idx) => {
              const isSelected = selectedCampaign.id === c.id;
              const isGaining = c.deltaBudget > 0;
              const isLosing = c.deltaBudget < 0;

              return (
                <div
                  key={c.id}
                  role='button'
                  tabIndex={0}
                  onClick={() => onSelectCampaign(c)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') onSelectCampaign(c);
                  }}
                  className={cn(
                    'grid grid-cols-12 items-center p-3 rounded-xl border text-xs cursor-pointer transition-all',
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/40 shadow-2xs'
                      : 'border-border/70 bg-card hover:border-foreground/30 hover:bg-muted/15'
                  )}
                >
                  {/* Rank */}
                  <div className='col-span-1 text-center font-bold'>
                    <span
                      className={cn(
                        'size-5 rounded-full inline-flex items-center justify-center text-[10px] font-bold',
                        idx === 0
                          ? 'bg-emerald-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {idx + 1}
                    </span>
                  </div>

                  {/* Name & Platform */}
                  <div className='col-span-4 space-y-0.5 truncate pr-2'>
                    <div className='font-bold text-foreground truncate text-xs' title={c.name}>
                      {c.name}
                    </div>
                    <div className='flex items-center gap-1.5 text-[9px] text-muted-foreground'>
                      <span className='uppercase font-bold'>{c.platform}</span>
                      <span>•</span>
                      {c.isConstrained ? (
                        <span className='text-rose-500 font-bold'>Stockout Guarded</span>
                      ) : (
                        <span>{c.inventoryUnits} Units In-Stock</span>
                      )}
                    </div>
                  </div>

                  {/* Budget Move */}
                  <div className='col-span-3 text-right space-y-0.5'>
                    <div className='font-bold text-foreground text-xs'>
                      ₹{(c.currentBudget / 1000).toFixed(0)}k →{' '}
                      <span className={cn(isGaining ? 'text-emerald-600 dark:text-emerald-400' : isLosing ? 'text-rose-500' : 'text-foreground')}>
                        ₹{(c.recommendedBudget / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <span
                      className={cn(
                        'text-[9px] font-bold block',
                        isGaining && 'text-emerald-600 dark:text-emerald-400',
                        isLosing && 'text-rose-500',
                        !isGaining && !isLosing && 'text-muted-foreground'
                      )}
                    >
                      {isGaining ? '↑ +' : isLosing ? '↓ ' : ''}₹{(Math.abs(c.deltaBudget) / 1000).toFixed(0)}k ({c.trendPct > 0 ? '+' : ''}{c.trendPct}%)
                    </span>
                  </div>

                  {/* Marginal Yield */}
                  <div className='col-span-2 text-right'>
                    <span className='font-bold text-emerald-600 dark:text-emerald-400 text-xs block'>
                      ₹{c.marginalProfitRoas.toFixed(2)}/₹1
                    </span>
                    <span className='text-[9px] text-muted-foreground'>Headroom</span>
                  </div>

                  {/* ProfitROAS */}
                  <div className='col-span-2 text-right'>
                    <span className='font-bold text-foreground text-xs block'>
                      {c.expectedProfitRoas.toFixed(2)}x
                    </span>
                    <span className='text-[9px] text-muted-foreground'>
                      Base: {c.currentProfitRoas.toFixed(2)}x
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Strategy Tuning (Current vs Recommended Strategy Vector) */}
      {activeTab === 'strategy' && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold text-foreground'>
              Inspecting: <strong className='text-primary'>{selectedCampaign.name}</strong>
            </span>
            <Badge variant='outline' className='text-[10px] font-bold border-border'>
              Confidence: {Math.round(selectedCampaign.confidenceScore * 100)}%
            </Badge>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Current Baseline */}
            <div className='rounded-xl border border-border/70 bg-muted/15 p-4 space-y-2.5 text-xs'>
              <div className='flex items-center justify-between border-b border-border/50 pb-2 text-[10px] uppercase font-bold text-muted-foreground'>
                <span>Current Strategy</span>
                <Badge variant='outline' className='text-[9px] border-border'>Active</Badge>
              </div>
              <div className='space-y-1.5 text-[11px]'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Creative Format:</span>
                  <span className='font-bold uppercase text-foreground'>{currentStrat.creativeFormat}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Audience Vector:</span>
                  <span className='font-bold uppercase text-foreground'>{currentStrat.audienceType}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Placement:</span>
                  <span className='font-bold uppercase text-foreground'>{currentStrat.placement}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Budget:</span>
                  <span className='font-bold text-foreground'>₹{(selectedCampaign.currentBudget / 1000).toFixed(0)}k</span>
                </div>
              </div>
            </div>

            {/* AI Recommended Strategy */}
            <div className='rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 space-y-2.5 text-xs ring-1 ring-emerald-500/20'>
              <div className='flex items-center justify-between border-b border-emerald-500/20 pb-2 text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400'>
                <span>AI Recommended Strategy</span>
                <Badge className='text-[9px] bg-emerald-600 text-white'>Optimal</Badge>
              </div>
              <div className='space-y-1.5 text-[11px]'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Creative Format:</span>
                  <span className='font-bold uppercase text-emerald-600 dark:text-emerald-400'>{recStrat.creativeFormat} (Hook +18%)</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Audience Vector:</span>
                  <span className='font-bold uppercase text-emerald-600 dark:text-emerald-400'>{recStrat.audienceType} (1% LAL)</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Placement:</span>
                  <span className='font-bold uppercase text-emerald-600 dark:text-emerald-400'>{recStrat.placement}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Budget:</span>
                  <span className='font-bold text-emerald-600 dark:text-emerald-400'>
                    ₹{(selectedCampaign.recommendedBudget / 1000).toFixed(0)}k ({selectedCampaign.trendPct > 0 ? '+' : ''}{selectedCampaign.trendPct}%)
                  </span>
                </div>
              </div>
              <div className='pt-2 border-t border-emerald-500/20 text-[10px] flex justify-between font-bold text-emerald-600 dark:text-emerald-400'>
                <span>Lift: +₹{(profitDelta / 1000).toFixed(1)}k Profit</span>
                <span>ROAS: {selectedCampaign.expectedProfitRoas.toFixed(2)}x ({roasDelta > 0 ? '+' : ''}{roasDelta}x)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Opportunity Quadrant 2x2 Matrix */}
      {activeTab === 'quadrant' && (
        <div className='space-y-3'>
          <div className='relative h-[220px] w-full rounded-xl border border-dashed border-border/80 bg-muted/10 p-4 overflow-hidden flex flex-col justify-between'>
            {/* Guidelines */}
            <div className='absolute inset-x-0 top-1/2 h-px bg-border/40 pointer-events-none' />
            <div className='absolute inset-y-0 left-1/2 w-px bg-border/40 pointer-events-none' />

            <div className='flex justify-between text-[9px] uppercase font-bold text-muted-foreground pointer-events-none'>
              <span>High Risk / Headroom</span>
              <span className='text-emerald-600 dark:text-emerald-400'>Prime Opportunity (Scale Here)</span>
            </div>
            <div className='flex justify-between text-[9px] uppercase font-bold text-muted-foreground pointer-events-none'>
              <span>Low Yield (Contract)</span>
              <span>Steady State</span>
            </div>

            {/* Campaign Bubbles */}
            <div className='absolute inset-4 pointer-events-auto'>
              {campaigns.map((c) => {
                const isSelected = selectedCampaign.id === c.id;
                const leftPct = Math.min(88, Math.max(12, (c.marginalProfitRoas / 5.5) * 80 + 10));
                const topPct = Math.min(85, Math.max(15, 100 - ((c.confidenceScore - 0.65) / 0.33) * 75 - 15));
                const bubbleSize = Math.max(28, Math.min(48, Math.round(c.recommendedBudget / 7000)));

                return (
                  <button
                    key={c.id}
                    onClick={() => onSelectCampaign(c)}
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      width: `${bubbleSize}px`,
                      height: `${bubbleSize}px`
                    }}
                    className={cn(
                      'absolute -translate-x-1/2 -translate-y-1/2 rounded-full border flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer',
                      isSelected
                        ? 'border-primary ring-2 ring-primary/60 scale-110 z-20 bg-primary/20'
                        : 'hover:scale-105 z-10',
                      c.isConstrained
                        ? 'border-rose-500 bg-rose-500/20 text-rose-500'
                        : c.deltaBudget > 0
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : 'border-zinc-500 bg-zinc-500/20 text-muted-foreground'
                    )}
                    title={`${c.name} | Marginal: ₹${c.marginalProfitRoas} | Spend: ₹${(c.recommendedBudget / 1000).toFixed(0)}k`}
                  >
                    <span className='text-[9px] font-bold truncate max-w-[90%]'>
                      {c.platform.slice(0, 3).toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className='flex items-center justify-between text-[10px] text-muted-foreground pt-1'>
            <div className='flex items-center gap-3'>
              <span className='flex items-center gap-1.5'>
                <span className='size-2 rounded-full bg-emerald-500' /> Scalable Target
              </span>
              <span className='flex items-center gap-1.5'>
                <span className='size-2 rounded-full bg-rose-500' /> Stockout Guarded
              </span>
              <span className='flex items-center gap-1.5'>
                <span className='size-2 rounded-full bg-zinc-400' /> Plateau
              </span>
            </div>
            <span>Click any bubble to inspect</span>
          </div>
        </div>
      )}
    </div>
  );
}
