'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { CampaignLearningProfile } from '@/lib/autonomous-learning/types';

interface CampaignRankingMatrixProps {
  campaigns: CampaignLearningProfile[];
  onSelectCampaign?: (campaign: CampaignLearningProfile) => void;
  selectedCampaignId?: string;
  className?: string;
}

export function CampaignRankingMatrix({
  campaigns,
  onSelectCampaign,
  selectedCampaignId,
  className
}: CampaignRankingMatrixProps) {
  // Sort campaigns dynamically by marginal profit headroom (descending)
  const sorted = [...campaigns].sort((a, b) => b.marginalProfitRoas - a.marginalProfitRoas);

  return (
    <div className={cn('rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 font-mono shadow-none space-y-4', className)}>
      <div className='flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3'>
        <div>
          <h3 className='text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2'>
            <Icons.check className='size-3.5 text-zinc-500' />
            Marginal Opportunity Ranking (Next $1 Yield)
          </h3>
          <p className='text-[10px] text-zinc-500 dark:text-zinc-400'>
            Ranked by expected incremental profit return per incremental dollar allocated (dProfit / dSpend).
          </p>
        </div>

        <span className='text-[10px] uppercase font-mono text-zinc-500'>
          {campaigns.length} targets
        </span>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        {sorted.map((c, index) => {
          const isSelected = selectedCampaignId === c.id;
          const isGaining = c.deltaBudget > 0;
          const isLosing = c.deltaBudget < 0;

          return (
            <div
              key={c.id}
              role='button'
              tabIndex={0}
              onClick={() => onSelectCampaign?.(c)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelectCampaign?.(c);
              }}
              className={cn(
                'rounded-lg border p-4 text-left transition-all cursor-pointer flex flex-col justify-between gap-3 text-xs',
                isSelected
                  ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-600'
              )}
            >
              {/* Header with Rank & Platform */}
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <span className='size-5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-[10px] flex items-center justify-center font-mono'>
                    #{index + 1}
                  </span>
                  <span className='font-semibold text-zinc-900 dark:text-zinc-100 text-xs line-clamp-1' title={c.name}>
                    {c.name}
                  </span>
                </div>
                <span
                  className={cn(
                    'text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border',
                    c.isConstrained
                      ? 'border-zinc-400 text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                  )}
                >
                  {c.isConstrained ? 'Constrained' : c.platform.toUpperCase()}
                </span>
              </div>

              {/* Budget Shift & Marginal Profit KPI Strip */}
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-2 bg-zinc-50/50 dark:bg-zinc-900/30 p-2.5 rounded border border-zinc-200 dark:border-zinc-800 text-[11px]'>
                <div>
                  <span className='text-[9px] uppercase text-zinc-500 block font-semibold'>
                    Budget Move
                  </span>
                  <div className='font-mono font-bold text-zinc-900 dark:text-zinc-100'>
                    ${(c.currentBudget / 1000).toFixed(0)}k →{' '}
                    <span className={cn(isGaining ? 'text-zinc-900 dark:text-zinc-100' : isLosing ? 'text-zinc-500' : 'text-zinc-700')}>
                      ${(c.recommendedBudget / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <span
                    className={cn(
                      'text-[9px] font-mono block',
                      isGaining && 'text-zinc-800 dark:text-zinc-200',
                      isLosing && 'text-zinc-500'
                    )}
                  >
                    {c.trendPct > 0 ? '↑' : '↓'} {c.trendPct > 0 ? `+${c.trendPct}%` : `${c.trendPct}%`}
                  </span>
                </div>

                <div>
                  <span className='text-[9px] uppercase text-zinc-500 block font-semibold'>
                    Marginal Profit
                  </span>
                  <div className='font-mono font-bold text-zinc-900 dark:text-zinc-100 text-sm'>
                    ${c.marginalProfitRoas.toFixed(2)}
                  </div>
                  <span className='text-[9px] text-zinc-500 block'>Per $1 next spend</span>
                </div>

                <div className='col-span-2 sm:col-span-1'>
                  <span className='text-[9px] uppercase text-zinc-500 block font-semibold'>
                    ProfitROAS
                  </span>
                  <div className='font-mono font-bold text-zinc-900 dark:text-zinc-100 text-sm'>
                    {c.expectedProfitRoas.toFixed(2)}x
                  </div>
                  <span className='text-[9px] text-zinc-500 block'>Base: {c.currentProfitRoas.toFixed(2)}x</span>
                </div>
              </div>

              {/* Rationale & Action Indicator */}
              <div className='space-y-1 pt-1 border-t border-zinc-200 dark:border-zinc-800 text-[10px]'>
                <div className='flex items-center justify-between text-zinc-500'>
                  <span>Inventory: <strong className='font-mono font-semibold text-zinc-800 dark:text-zinc-200'>{c.inventoryUnits} units</strong></span>
                  <span>Confidence: <strong className='font-mono font-semibold text-zinc-800 dark:text-zinc-200'>{Math.round(c.confidenceScore * 100)}%</strong></span>
                </div>
                <p className='text-zinc-500 leading-relaxed'>
                  {c.strategyRationale}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
