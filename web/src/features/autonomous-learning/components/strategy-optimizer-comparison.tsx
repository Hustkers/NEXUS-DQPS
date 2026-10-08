'use client';

import React from 'react';
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
  const profitDelta = campaign.expectedProfit - campaign.currentProfit;
  const roasDelta = +(campaign.expectedProfitRoas - campaign.currentProfitRoas).toFixed(2);

  return (
    <div className={cn('rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 font-mono shadow-none space-y-4', className)}>
      <div className='flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3'>
        <div>
          <h3 className='text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2'>
            <Icons.sparkles className='size-3.5 text-zinc-500' />
            Strategy &amp; Vector Comparison — {campaign.name}
          </h3>
          <p className='text-[10px] text-zinc-500 dark:text-zinc-400'>
            Creative format, audience vector, and ad placement efficiency modeling.
          </p>
        </div>

        <span className='text-[10px] uppercase font-mono text-zinc-500'>
          Confidence: {Math.round(campaign.confidenceScore * 100)}%
        </span>
      </div>

      {/* Side-by-Side Comparison: Current Strategy vs Recommended Strategy */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        {/* Current Strategy Card */}
        <div className='rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-4 space-y-3 text-xs'>
          <div className='flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2'>
            <span className='font-semibold uppercase tracking-wider text-zinc-500 text-[10px]'>
              Current Baseline Strategy
            </span>
            <span className='text-[9px] font-mono uppercase text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800'>
              Active
            </span>
          </div>

          <div className='space-y-2 text-[11px]'>
            <div className='flex justify-between items-center'>
              <span className='text-zinc-500'>Creative Format:</span>
              <span className='font-mono font-medium uppercase text-zinc-900 dark:text-zinc-100'>{current.creativeFormat}</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-zinc-500'>Audience Vector:</span>
              <span className='font-mono font-medium uppercase text-zinc-900 dark:text-zinc-100'>{current.audienceType}</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-zinc-500'>Placement:</span>
              <span className='font-mono font-medium uppercase text-zinc-900 dark:text-zinc-100'>{current.placement}</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-zinc-500'>Allocated Spend:</span>
              <span className='font-mono font-bold text-zinc-900 dark:text-zinc-100'>${(campaign.currentBudget / 1000).toFixed(0)}k</span>
            </div>
          </div>

          <div className='pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-500 flex justify-between font-mono'>
            <span>Expected Profit: ${(campaign.currentProfit / 1000).toFixed(1)}k</span>
            <span>POAS: {campaign.currentProfitRoas.toFixed(2)}x</span>
          </div>
        </div>

        {/* Recommended Strategy Card */}
        <div className='rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50/30 dark:bg-zinc-900/50 p-4 space-y-3 text-xs'>
          <div className='flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2'>
            <span className='font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 text-[10px] flex items-center gap-1.5'>
              <Icons.shieldCheck className='size-3 text-zinc-500' />
              Optimal Recommended Strategy
            </span>
            <span className='text-[9px] font-mono uppercase bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 px-1.5 py-0.5 rounded font-bold'>
              Optimal
            </span>
          </div>

          <div className='space-y-2 text-[11px]'>
            <div className='flex justify-between items-center'>
              <span className='text-zinc-500'>Creative Format:</span>
              <span className='font-mono font-bold uppercase text-zinc-900 dark:text-zinc-100'>
                {recommended.creativeFormat} (+18% hook)
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-zinc-500'>Audience Vector:</span>
              <span className='font-mono font-bold uppercase text-zinc-900 dark:text-zinc-100'>
                {recommended.audienceType} (1% LAL)
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-zinc-500'>Placement:</span>
              <span className='font-mono font-bold uppercase text-zinc-900 dark:text-zinc-100'>
                {recommended.placement}
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-zinc-500'>Allocated Spend:</span>
              <span className='font-mono font-bold text-zinc-900 dark:text-zinc-100'>
                ${(campaign.recommendedBudget / 1000).toFixed(0)}k ({campaign.trendPct > 0 ? '+' : ''}{campaign.trendPct}%)
              </span>
            </div>
          </div>

          <div className='pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[10px] flex justify-between font-mono text-zinc-900 dark:text-zinc-100 font-semibold'>
            <span>Lift: +${(profitDelta / 1000).toFixed(1)}k Profit</span>
            <span>POAS: {campaign.expectedProfitRoas.toFixed(2)}x ({roasDelta > 0 ? '+' : ''}{roasDelta}x)</span>
          </div>
        </div>
      </div>

      {/* Alternative Strategy Selector Controls */}
      <div className='rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-3.5 space-y-3 text-xs'>
        <div className='flex items-center gap-1.5 text-[10px] uppercase font-semibold text-zinc-500'>
          <Icons.adjustments className='size-3 text-zinc-400' />
          Test Alternative Strategy Variables
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
          {/* Creative Format */}
          <div className='space-y-1'>
            <label className='text-[10px] uppercase text-zinc-500 font-semibold'>
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
              className='w-full rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none'
            >
              <option value='static'>Static Product Image</option>
              <option value='ugc'>UGC Creator Video (+18% Yield)</option>
              <option value='video'>Studio Tech Reel (+12% Yield)</option>
              <option value='carousel'>Multi-SKU Carousel (+6% Yield)</option>
            </select>
          </div>

          {/* Audience Type */}
          <div className='space-y-1'>
            <label className='text-[10px] uppercase text-zinc-500 font-semibold'>
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
              className='w-full rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none'
            >
              <option value='broad'>Broad Demographic (Reach)</option>
              <option value='lookalike'>1% High-LTV Lookalike (+14%)</option>
              <option value='retargeting'>Cart Abandoners &amp; Views (+18%)</option>
            </select>
          </div>

          {/* Placement */}
          <div className='space-y-1'>
            <label className='text-[10px] uppercase text-zinc-500 font-semibold'>
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
              className='w-full rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none'
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
