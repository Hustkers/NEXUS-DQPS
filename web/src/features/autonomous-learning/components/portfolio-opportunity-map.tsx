'use client';

import React from 'react';
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
  return (
    <div className={cn('rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 font-mono shadow-none space-y-4', className)}>
      <div className='flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3'>
        <div>
          <h3 className='text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2'>
            <Icons.sparkles className='size-3.5 text-zinc-500' />
            Opportunity &amp; Confidence Quadrant
          </h3>
          <p className='text-[10px] text-zinc-500 dark:text-zinc-400'>
            Marginal POAS ($/$1) vs. Bayesian Confidence Score.
          </p>
        </div>

        <span className='text-[10px] uppercase font-mono text-zinc-500'>
          Convex Space
        </span>
      </div>

      {/* Visual 2x2 Opportunity Canvas */}
      <div className='relative h-[220px] w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-4 overflow-hidden flex flex-col justify-between'>
        {/* Quadrant Divider Guidelines */}
        <div className='absolute inset-x-0 top-1/2 h-px bg-zinc-200 dark:border-zinc-800 pointer-events-none' />
        <div className='absolute inset-y-0 left-1/2 w-px bg-zinc-200 dark:border-zinc-800 pointer-events-none' />

        {/* Quadrant Corner Labels */}
        <div className='flex justify-between text-[9px] uppercase font-semibold text-zinc-400 pointer-events-none'>
          <span>High Headroom</span>
          <span>Optimal Scale</span>
        </div>
        <div className='flex justify-between text-[9px] uppercase font-semibold text-zinc-400 pointer-events-none'>
          <span>Diminishing Yield</span>
          <span>Steady State</span>
        </div>

        {/* Interactive Campaign Bubbles */}
        <div className='absolute inset-4 pointer-events-auto'>
          {campaigns.map((c) => {
            const isSelected = selectedCampaignId === c.id;
            // Map X: Marginal Return (0 to 6) -> 10% to 90%
            const leftPct = Math.min(88, Math.max(12, (c.marginalProfitRoas / 5.5) * 80 + 10));
            // Map Y: Confidence (0.65 to 0.98) -> invert for top
            const topPct = Math.min(85, Math.max(15, 100 - ((c.confidenceScore - 0.65) / 0.33) * 75 - 15));

            const bubbleSize = Math.max(28, Math.min(48, Math.round(c.recommendedBudget / 1200)));

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
                  'absolute -translate-x-1/2 -translate-y-1/2 rounded-full border flex items-center justify-center transition-all cursor-pointer font-mono font-medium',
                  isSelected
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 scale-110 z-20 shadow-sm'
                    : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-900 dark:hover:border-zinc-100 z-10'
                )}
                title={`${c.name} | Marginal: $${c.marginalProfitRoas} | Spend: $${(c.recommendedBudget / 1000).toFixed(0)}k`}
              >
                <span className='text-[9px] font-semibold truncate max-w-[90%]'>
                  {c.platform.slice(0, 3).toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className='flex items-center justify-between text-[10px] text-zinc-500 pt-1'>
        <div className='flex items-center gap-3'>
          <span className='flex items-center gap-1.5'>
            <span className='size-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100' /> Active Target
          </span>
          <span className='flex items-center gap-1.5'>
            <span className='size-1.5 rounded-full bg-zinc-400' /> Diminishing Yield
          </span>
        </div>
        <span>Select bubble to inspect response curve</span>
      </div>
    </div>
  );
}
