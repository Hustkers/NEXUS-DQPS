'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { CampaignLearningProfile, CreativeFormat, AudienceType, PlacementType } from '@/lib/autonomous-learning/types';

interface StrategyOptimizerComparisonProps {
  campaign: CampaignLearningProfile;
  onChangeStrategy?: (updatedStrategy: {
    creativeFormat: CreativeFormat;
    audienceType: AudienceType;
    placement: PlacementType;
  }) => void;
  className?: string;
}

export function StrategyOptimizerComparison({
  campaign,
  onChangeStrategy,
  className
}: StrategyOptimizerComparisonProps) {
  const current = campaign.currentStrategy;
  const recommended = campaign.recommendedStrategy;

  // Expected deltas
  const revDelta = campaign.expectedRevenue - campaign.currentRevenue;
  const profitDelta = campaign.expectedProfit - campaign.currentProfit;
  const roasDelta = +(campaign.expectedProfitRoas - campaign.currentProfitRoas).toFixed(2);

  return (
    <div className={cn('rounded-2xl border border-border/80 bg-card p-5 font-mono shadow-xs space-y-4', className)}>
      <div className='flex items-center justify-between border-b border-border/60 pb-3'>
        <div>
          <h3 className='text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2'>
            <Icons.sparkles className='size-4 text-primary' />
            Strategy What-If Optimizer — {campaign.name}
          </h3>
          <p className='text-[10px] text-muted-foreground'>
            Optimize beyond budget: evaluate creative formats, audience segments, and placement efficiency.
          </p>
        </div>

        <Badge variant='outline' className='text-[10px] uppercase font-bold border-border'>
          Confidence: {Math.round(campaign.confidenceScore * 100)}%
        </Badge>
      </div>

      {/* Side-by-Side Comparison: Current Strategy vs AI Recommended Strategy */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Current Strategy Card */}
        <div className='rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3 text-xs'>
          <div className='flex items-center justify-between border-b border-border/60 pb-2'>
            <span className='font-bold uppercase tracking-wider text-muted-foreground text-[10px]'>
              Current Baseline Strategy
            </span>
            <Badge variant='outline' className='text-[9px] uppercase border-border text-muted-foreground'>
              Active
            </Badge>
          </div>

          <div className='space-y-2 text-[11px]'>
            <div className='flex justify-between items-center'>
              <span className='text-muted-foreground'>Creative Format:</span>
              <span className='font-bold uppercase text-foreground'>{current.creativeFormat}</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-muted-foreground'>Audience Vector:</span>
              <span className='font-bold uppercase text-foreground'>{current.audienceType}</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-muted-foreground'>Placement:</span>
              <span className='font-bold uppercase text-foreground'>{current.placement}</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-muted-foreground'>Allocated Spend:</span>
              <span className='font-bold text-foreground'>₹{(campaign.currentBudget / 1000).toFixed(0)}k</span>
            </div>
          </div>

          <div className='pt-2 border-t border-border/50 text-[10px] text-muted-foreground flex justify-between'>
            <span>Expected Profit: ₹{(campaign.currentProfit / 1000).toFixed(1)}k</span>
            <span>ProfitROAS: {campaign.currentProfitRoas.toFixed(2)}x</span>
          </div>
        </div>

        {/* AI Recommended Strategy Card */}
        <div className='rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4 space-y-3 text-xs ring-1 ring-emerald-500/20'>
          <div className='flex items-center justify-between border-b border-emerald-500/20 pb-2'>
            <span className='font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 text-[10px] flex items-center gap-1.5'>
              <Icons.shieldCheck className='size-3.5' />
              Autonomous Recommended Strategy
            </span>
            <Badge className='text-[9px] uppercase font-bold bg-emerald-600 text-white'>
              Optimal
            </Badge>
          </div>

          <div className='space-y-2 text-[11px]'>
            <div className='flex justify-between items-center'>
              <span className='text-muted-foreground'>Creative Format:</span>
              <span className='font-bold uppercase text-emerald-600 dark:text-emerald-400'>
                {recommended.creativeFormat} (Hook +18%)
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-muted-foreground'>Audience Vector:</span>
              <span className='font-bold uppercase text-emerald-600 dark:text-emerald-400'>
                {recommended.audienceType} (1% LAL)
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-muted-foreground'>Placement:</span>
              <span className='font-bold uppercase text-emerald-600 dark:text-emerald-400'>
                {recommended.placement}
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-muted-foreground'>Allocated Spend:</span>
              <span className='font-bold text-emerald-600 dark:text-emerald-400'>
                ₹{(campaign.recommendedBudget / 1000).toFixed(0)}k ({campaign.trendPct > 0 ? '+' : ''}{campaign.trendPct}%)
              </span>
            </div>
          </div>

          <div className='pt-2 border-t border-emerald-500/20 text-[10px] flex justify-between font-bold text-emerald-600 dark:text-emerald-400'>
            <span>Lift: +₹{(profitDelta / 1000).toFixed(1)}k Profit</span>
            <span>ProfitROAS: {campaign.expectedProfitRoas.toFixed(2)}x ({roasDelta > 0 ? '+' : ''}{roasDelta}x)</span>
          </div>
        </div>
      </div>

      {/* Interactive Strategy Selector Controls */}
      <div className='rounded-xl border border-dashed border-border/80 bg-muted/20 p-3.5 space-y-3 text-xs'>
        <div className='flex items-center gap-1.5 text-[10px] uppercase font-bold text-foreground'>
          <Icons.adjustments className='size-3 text-primary' />
          Test Alternative Strategy Variables
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
          {/* Creative Format */}
          <div className='space-y-1'>
            <label className='text-[10px] uppercase text-muted-foreground font-semibold'>
              Creative Format
            </label>
            <select
              value={recommended.creativeFormat}
              onChange={(e) =>
                onChangeStrategy?.({
                  creativeFormat: e.target.value as CreativeFormat,
                  audienceType: recommended.audienceType,
                  placement: recommended.placement
                })
              }
              className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-bold focus:outline-none focus:ring-1 focus:ring-primary'
            >
              <option value='static'>Static Product Image</option>
              <option value='ugc'>UGC Creator Video (+18% Yield)</option>
              <option value='video'>Studio Tech Reel (+12% Yield)</option>
              <option value='carousel'>Multi-SKU Carousel (+6% Yield)</option>
            </select>
          </div>

          {/* Audience Type */}
          <div className='space-y-1'>
            <label className='text-[10px] uppercase text-muted-foreground font-semibold'>
              Audience Segment
            </label>
            <select
              value={recommended.audienceType}
              onChange={(e) =>
                onChangeStrategy?.({
                  creativeFormat: recommended.creativeFormat,
                  audienceType: e.target.value as AudienceType,
                  placement: recommended.placement
                })
              }
              className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-bold focus:outline-none focus:ring-1 focus:ring-primary'
            >
              <option value='broad'>Broad Demographic (Reach)</option>
              <option value='lookalike'>1% High-LTV Lookalike (+14%)</option>
              <option value='retargeting'>Cart Abandoners &amp; Views (+18%)</option>
            </select>
          </div>

          {/* Placement */}
          <div className='space-y-1'>
            <label className='text-[10px] uppercase text-muted-foreground font-semibold'>
              Placement Channel
            </label>
            <select
              value={recommended.placement}
              onChange={(e) =>
                onChangeStrategy?.({
                  creativeFormat: recommended.creativeFormat,
                  audienceType: recommended.audienceType,
                  placement: e.target.value as PlacementType
                })
              }
              className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-bold focus:outline-none focus:ring-1 focus:ring-primary'
            >
              <option value='feed'>Standard In-Feed</option>
              <option value='reels'>Full-Screen Reels / TikTok (+11%)</option>
              <option value='search'>High-Intent Keyword SERP (+8%)</option>
              <option value='stories'>Ephemeral Stories</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
