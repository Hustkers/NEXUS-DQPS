'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { OptimizationResult } from '@/lib/autonomous-learning/types';

interface AutonomousBudgetEngineHeroProps {
  result: OptimizationResult;
  onApplyRecommendation?: () => void;
  onOpenWhatIf?: () => void;
  isApplying?: boolean;
}

export function AutonomousBudgetEngineHero({
  result,
  onApplyRecommendation,
  onOpenWhatIf,
  isApplying = false
}: AutonomousBudgetEngineHeroProps) {
  const {
    totalRecommendedBudget,
    totalCurrentBudget,
    totalCurrentProfit,
    totalExpectedProfit,
    profitImprovementPct,
    profitImprovementAmount,
    channels,
    modelAccuracyPct
  } = result;

  return (
    <div className='rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 sm:p-6 font-mono text-zinc-900 dark:text-zinc-100 space-y-6'>
      {/* Header Bar */}
      <div className='flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4'>
        <div className='space-y-1.5'>
          <div className='flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400'>
            <span className='size-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100' />
            <span className='font-semibold uppercase tracking-wider'>
              Learning Engine
            </span>
            <span className='text-zinc-400 dark:text-zinc-600'>•</span>
            <span>Accuracy: {modelAccuracyPct}%</span>
          </div>
          <h2 className='text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans'>
            Capital Allocation &amp; Response Optimizer
          </h2>
          <p className='text-xs text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed'>
            Continuous-time convex optimization balancing non-linear Hill response saturation, historical marginal ROAS derivatives, and regional ERP inventory constraints.
          </p>
        </div>

        <div className='flex items-center gap-2'>
          {onOpenWhatIf && (
            <Button
              variant='outline'
              size='sm'
              onClick={onOpenWhatIf}
              className='h-8 text-xs font-medium border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            >
              <Icons.sliders className='mr-1.5 size-3.5 text-zinc-500' />
              Sandbox Parameters
            </Button>
          )}

          <Button
            size='sm'
            onClick={onApplyRecommendation}
            disabled={isApplying}
            className='h-8 px-3.5 text-xs font-semibold uppercase bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200'
          >
            {isApplying ? (
              <>
                <Icons.spinner className='mr-1.5 size-3.5 animate-spin' />
                Dispatching Policy...
              </>
            ) : (
              <>
                <Icons.check className='mr-1.5 size-3.5' />
                Apply Policy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Primary KPI Row: Total Budget, Expected Profit & Uplift */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
        {/* 1. Total Managed Budget */}
        <div className='rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-4 space-y-1'>
          <div className='flex items-center justify-between text-[10px] uppercase font-semibold text-zinc-500 dark:text-zinc-400'>
            <span>Cycle Budget</span>
            <span className='font-mono'>CYC-9482</span>
          </div>
          <div className='text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100'>
            ${totalRecommendedBudget.toLocaleString('en-US')}
          </div>
          <div className='text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-200 dark:border-zinc-800/80'>
            <span>Daily Run Rate:</span>
            <span className='font-mono font-medium text-zinc-700 dark:text-zinc-300'>
              ${Math.round(totalRecommendedBudget / 30).toLocaleString('en-US')}/day
            </span>
          </div>
        </div>

        {/* 2. Expected Net Profit */}
        <div className='rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-4 space-y-1'>
          <div className='flex items-center justify-between text-[10px] uppercase font-semibold text-zinc-500 dark:text-zinc-400'>
            <span>Projected Profit</span>
            <span>30D Horizon</span>
          </div>
          <div className='text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100'>
            ${totalExpectedProfit.toLocaleString('en-US')}
          </div>
          <div className='text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-200 dark:border-zinc-800/80'>
            <span>Baseline Operating:</span>
            <span className='font-mono text-zinc-700 dark:text-zinc-300'>${totalCurrentProfit.toLocaleString('en-US')}</span>
          </div>
        </div>

        {/* 3. Profit Improvement Uplift */}
        <div className='rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-4 space-y-1'>
          <div className='flex items-center justify-between text-[10px] uppercase font-semibold text-zinc-500 dark:text-zinc-400'>
            <span>Projected Uplift</span>
            <span className='font-mono text-[9px] text-zinc-600 dark:text-zinc-400'>SLSQP</span>
          </div>
          <div className='text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100'>
            +{profitImprovementPct}%
          </div>
          <div className='text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-200 dark:border-zinc-800/80'>
            <span>Net Margin Delta:</span>
            <span className='font-mono font-medium text-zinc-700 dark:text-zinc-300'>
              +${Math.round(profitImprovementAmount).toLocaleString('en-US')}
            </span>
          </div>
        </div>

        {/* 4. Portfolio ProfitROAS */}
        <div className='rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-4 space-y-1'>
          <div className='flex items-center justify-between text-[10px] uppercase font-semibold text-zinc-500 dark:text-zinc-400'>
            <span>Portfolio POAS</span>
            <span className='font-mono text-[9px] text-zinc-500'>Floor: 1.80x</span>
          </div>
          <div className='text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100'>
            {result.expectedBlendedProfitRoas}x
          </div>
          <div className='text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-200 dark:border-zinc-800/80'>
            <span>Prior Horizon:</span>
            <span className='font-mono text-zinc-700 dark:text-zinc-300'>{result.currentBlendedProfitRoas}x</span>
          </div>
        </div>
      </div>

      {/* Multi-Channel Allocation Breakdown */}
      <div className='space-y-3 pt-1'>
        <div className='flex items-center justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400'>
          <span className='uppercase tracking-wide'>Channel Reallocation Share</span>
          <span className='font-mono text-[10px]'>Target Total: ${totalRecommendedBudget.toLocaleString('en-US')}</span>
        </div>

        {/* Stacked Percentage Visualizer */}
        <div className='h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden flex'>
          {channels.map((ch) => (
            <div
              key={ch.platform}
              style={{
                width: `${ch.recommendedSharePct}%`,
                backgroundColor: ch.color
              }}
              title={`${ch.displayName}: ${ch.recommendedSharePct}%`}
              className='h-full'
            />
          ))}
        </div>

        {/* Channel Cards */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3 pt-1'>
          {channels.map((ch) => {
            const isGaining = ch.deltaSpend > 0;
            const isLosing = ch.deltaSpend < 0;

            return (
              <div
                key={ch.platform}
                className='rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30 p-3 space-y-2 text-xs'
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-100'>
                    <span className='size-2 rounded-full' style={{ backgroundColor: ch.color }} />
                    <span className='text-[11px]'>{ch.displayName}</span>
                  </div>
                  <span className='font-mono text-[10px] text-zinc-600 dark:text-zinc-400'>
                    {ch.recommendedSharePct}%
                  </span>
                </div>

                <div className='space-y-0.5'>
                  <div className='text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono'>
                    ${ch.recommendedSpend.toLocaleString('en-US')}
                  </div>
                  <div className='flex items-center justify-between text-[10px] text-zinc-500'>
                    <span>Base: ${ch.currentSpend.toLocaleString('en-US')}</span>
                    <span
                      className={cn(
                        'font-mono font-medium',
                        isGaining && 'text-zinc-900 dark:text-zinc-100',
                        isLosing && 'text-zinc-500 dark:text-zinc-400',
                        !isGaining && !isLosing && 'text-zinc-500'
                      )}
                    >
                      {ch.deltaSpend > 0 ? '+' : ''}${ch.deltaSpend.toLocaleString('en-US')}
                    </span>
                  </div>
                </div>

                <div className='flex items-center justify-between pt-1.5 border-t border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-500'>
                  <span>Marginal Yield:</span>
                  <span className='font-mono font-medium text-zinc-800 dark:text-zinc-200'>
                    ${ch.marginalReturn}/$1
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
