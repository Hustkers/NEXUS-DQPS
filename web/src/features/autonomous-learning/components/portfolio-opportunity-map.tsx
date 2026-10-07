'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { CampaignLearningProfile } from '@/lib/autonomous-learning/types';

interface PortfolioOpportunityMapProps {
  campaigns: CampaignLearningProfile[];
  onSelectCampaign?: (campaign: CampaignLearningProfile) => void;
  selectedCampaignId?: string;
  className?: string;
}

export function PortfolioOpportunityMap({
  campaigns,
  onSelectCampaign,
  selectedCampaignId,
  className
}: PortfolioOpportunityMapProps) {
  // Opportunity Matrix Quadrants based on Marginal Return and Confidence
  // X: Marginal Return (1 to 5)
  // Y: Confidence (0.6 to 1.0)

  return (
    <div className={cn('rounded-2xl border border-border/80 bg-card p-5 font-mono shadow-xs space-y-4', className)}>
      <div className='flex items-center justify-between border-b border-border/60 pb-3'>
        <div>
          <h3 className='text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2'>
            <Icons.sparkles className='size-4 text-primary' />
            Portfolio Opportunity &amp; Risk Quadrant Map
          </h3>
          <p className='text-[10px] text-muted-foreground'>
            Visual scatter: X-Axis = Marginal ProfitROAS (₹/₹1), Y-Axis = Model Confidence, Size = Spend.
          </p>
        </div>

        <Badge variant='outline' className='text-[10px] uppercase font-bold border-border'>
          Interactive Bubble Matrix
        </Badge>
      </div>

      {/* Visual 2x2 Opportunity Canvas */}
      <div className='relative h-[220px] w-full rounded-xl border border-dashed border-border/80 bg-muted/10 p-4 overflow-hidden flex flex-col justify-between'>
        {/* Quadrant Divider Guidelines */}
        <div className='absolute inset-x-0 top-1/2 h-px bg-border/40 pointer-events-none' />
        <div className='absolute inset-y-0 left-1/2 w-px bg-border/40 pointer-events-none' />

        {/* Quadrant Corner Labels */}
        <div className='flex justify-between text-[9px] uppercase font-bold text-muted-foreground/60 pointer-events-none'>
          <span>High Risk / High Headroom</span>
          <span className='text-emerald-600/80 dark:text-emerald-400/80'>Prime Opportunity (Scale Here)</span>
        </div>
        <div className='flex justify-between text-[9px] uppercase font-bold text-muted-foreground/60 pointer-events-none'>
          <span>Low Yield (Contract Spend)</span>
          <span>Proven Steady State</span>
        </div>

        {/* Interactive Campaign Bubbles */}
        <div className='absolute inset-4 pointer-events-auto'>
          {campaigns.map((c) => {
            const isSelected = selectedCampaignId === c.id;
            // Map X: Marginal Return (0 to 6) -> 10% to 90%
            const leftPct = Math.min(88, Math.max(12, (c.marginalProfitRoas / 5.5) * 80 + 10));
            // Map Y: Confidence (0.65 to 0.98) -> invert for top
            const topPct = Math.min(85, Math.max(15, 100 - ((c.confidenceScore - 0.65) / 0.33) * 75 - 15));

            const bubbleSize = Math.max(28, Math.min(48, Math.round(c.recommendedBudget / 7000)));

            return (
              <button
                key={c.id}
                onClick={() => onSelectCampaign?.(c)}
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  width: `${bubbleSize}px`,
                  height: `${bubbleSize}px`
                }}
                className={cn(
                  'absolute -translate-x-1/2 -translate-y-1/2 rounded-full border flex items-center justify-center transition-all duration-300 shadow-md group cursor-pointer',
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
            <span className='size-2 rounded-full bg-emerald-500' /> Scalable Growth Target
          </span>
          <span className='flex items-center gap-1.5'>
            <span className='size-2 rounded-full bg-rose-500' /> Constrained / Stockout
          </span>
          <span className='flex items-center gap-1.5'>
            <span className='size-2 rounded-full bg-zinc-400' /> Mature Diminishing Yield
          </span>
        </div>
        <span>Click any bubble to view response curve &amp; strategy</span>
      </div>
    </div>
  );
}
