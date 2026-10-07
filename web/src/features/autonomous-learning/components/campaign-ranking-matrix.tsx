'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
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
    <div className={cn('rounded-2xl border border-border/80 bg-card p-5 font-mono shadow-xs space-y-4', className)}>
      <div className='flex items-center justify-between border-b border-border/60 pb-3'>
        <div>
          <h3 className='text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2'>
            <Icons.check className='size-4 text-emerald-500' />
            Dynamic Campaign Opportunity Ranking (Next ₹1 Yield)
          </h3>
          <p className='text-[10px] text-muted-foreground'>
            Ordered by expected incremental profit return per incremental rupee invested (dProfit / dSpend).
          </p>
        </div>

        <Badge variant='outline' className='text-[10px] uppercase font-bold border-border'>
          {campaigns.length} Active Targets
        </Badge>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-3.5'>
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
                'rounded-xl border p-4 text-left transition-all cursor-pointer flex flex-col justify-between gap-3 text-xs',
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/40 shadow-xs'
                  : 'border-border/70 bg-card hover:border-foreground/30 hover:bg-muted/10'
              )}
            >
              {/* Header with Rank & Platform */}
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <span className='size-5 rounded-full bg-foreground text-background font-bold text-[10px] flex items-center justify-center'>
                    #{index + 1}
                  </span>
                  <span className='font-bold text-foreground text-xs line-clamp-1' title={c.name}>
                    {c.name}
                  </span>
                </div>
                <Badge
                  variant='outline'
                  className={cn(
                    'text-[9px] font-bold uppercase px-1.5 py-0',
                    c.isConstrained
                      ? 'border-rose-500/40 text-rose-500 bg-rose-500/10'
                      : 'border-border text-muted-foreground'
                  )}
                >
                  {c.isConstrained ? 'Stockout Alert' : c.platform.toUpperCase()}
                </Badge>
              </div>

              {/* Budget Shift & Marginal Profit KPI Strip */}
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-2 bg-muted/20 p-2.5 rounded-lg border border-border/50 text-[11px]'>
                <div>
                  <span className='text-[9px] uppercase text-muted-foreground block font-semibold'>
                    Budget Move
                  </span>
                  <div className='font-bold text-foreground'>
                    ₹{(c.currentBudget / 1000).toFixed(0)}k →{' '}
                    <span className={cn(isGaining ? 'text-emerald-600 dark:text-emerald-400' : isLosing ? 'text-rose-500' : 'text-foreground')}>
                      ₹{(c.recommendedBudget / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <span
                    className={cn(
                      'text-[9px] font-bold block',
                      isGaining && 'text-emerald-600 dark:text-emerald-400',
                      isLosing && 'text-rose-500'
                    )}
                  >
                    {c.trendPct > 0 ? '↑' : '↓'} {c.trendPct > 0 ? `+${c.trendPct}%` : `${c.trendPct}%`}
                  </span>
                </div>

                <div>
                  <span className='text-[9px] uppercase text-muted-foreground block font-semibold'>
                    Marginal Profit
                  </span>
                  <div className='font-bold text-emerald-600 dark:text-emerald-400 text-sm'>
                    ₹{c.marginalProfitRoas.toFixed(2)}
                  </div>
                  <span className='text-[9px] text-muted-foreground block'>Per ₹1 next spend</span>
                </div>

                <div className='col-span-2 sm:col-span-1'>
                  <span className='text-[9px] uppercase text-muted-foreground block font-semibold'>
                    ProfitROAS
                  </span>
                  <div className='font-bold text-foreground text-sm'>
                    {c.expectedProfitRoas.toFixed(2)}x
                  </div>
                  <span className='text-[9px] text-muted-foreground block'>Base: {c.currentProfitRoas.toFixed(2)}x</span>
                </div>
              </div>

              {/* Rationale & Action Indicator */}
              <div className='space-y-1 pt-1 border-t border-border/40 text-[10px]'>
                <div className='flex items-center justify-between text-muted-foreground'>
                  <span>Warehouse Inventory: <strong className={cn(c.isConstrained ? 'text-rose-500' : 'text-foreground')}>{c.inventoryUnits} units</strong></span>
                  <span>Confidence: <strong className='text-foreground'>{Math.round(c.confidenceScore * 100)}%</strong></span>
                </div>
                <p className='text-muted-foreground line-clamp-2 leading-relaxed'>
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
