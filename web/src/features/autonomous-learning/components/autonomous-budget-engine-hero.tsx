'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
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
    totalCurrentProfit,
    totalExpectedProfit,
    profitImprovementPct,
    profitImprovementAmount,
    channels,
    modelAccuracyPct
  } = result;

  return (
    <div className='rounded-2xl border border-border/80 bg-card p-5 sm:p-6 font-mono shadow-xs space-y-6'>
      {/* Top Banner: Core Message & Live Accuracy Badge */}
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <span className='size-2 rounded-full bg-emerald-500 animate-pulse' />
            <span className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>
              Autonomous Ad Learning Engine
            </span>
            <Badge
              variant='outline'
              className='text-[9px] font-bold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
            >
              MODEL ACCURACY: {modelAccuracyPct}%
            </Badge>
          </div>
          <h2 className='text-lg sm:text-2xl font-bold uppercase tracking-tight text-foreground'>
            WHERE SHOULD THE NEXT ₹ GO?
          </h2>
          <p className='text-xs text-muted-foreground max-w-2xl leading-relaxed'>
            An autonomous advertising engine that continuously learns from historical campaign outcomes, non-linear Hill response curves, and ERP stock levels to reallocate capital toward maximum profitable growth.
          </p>
        </div>

        <div className='flex items-center gap-2.5'>
          {onOpenWhatIf && (
            <Button
              variant='outline'
              size='sm'
              onClick={onOpenWhatIf}
              className='h-9 text-xs font-bold border-border'
            >
              <Icons.sliders className='mr-1.5 size-3.5' />
              What-If Sandbox
            </Button>
          )}

          <Button
            size='sm'
            onClick={onApplyRecommendation}
            disabled={isApplying}
            className='h-9 px-4 text-xs font-bold uppercase bg-foreground text-background hover:bg-foreground/90 shadow-sm active:scale-[0.98]'
          >
            {isApplying ? (
              <>
                <Icons.spinner className='mr-1.5 size-3.5 animate-spin' />
                Recording Decision...
              </>
            ) : (
              <>
                <Icons.check className='mr-1.5 size-3.5 text-emerald-500' />
                Apply Recommendation
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Primary KPI Row: Total Budget, Expected Profit & Uplift */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* 1. Total Managed Budget */}
        <div className='rounded-xl border border-border/70 bg-muted/20 p-4 space-y-1.5'>
          <div className='flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground'>
            <span>Total Budget</span>
            <span className='text-foreground'>Cycle 9482</span>
          </div>
          <div className='text-2xl sm:text-3xl font-extrabold text-foreground'>
            ₹{(totalRecommendedBudget / 100000).toFixed(2)}L
          </div>
          <div className='text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/40'>
            <span>Daily Run Rate:</span>
            <span className='font-bold text-foreground'>₹{Math.round(totalRecommendedBudget / 30).toLocaleString('en-IN')}/day</span>
          </div>
        </div>

        {/* 2. Current vs Expected Profit */}
        <div className='rounded-xl border border-border/70 bg-muted/20 p-4 space-y-1.5'>
          <div className='flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground'>
            <span>Expected Profit</span>
            <span className='text-muted-foreground'>30D Horizon</span>
          </div>
          <div className='text-2xl sm:text-3xl font-extrabold text-foreground'>
            ₹{(totalExpectedProfit / 100000).toFixed(2)}L
          </div>
          <div className='text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/40'>
            <span>Base Operating Profit:</span>
            <span>₹{(totalCurrentProfit / 100000).toFixed(2)}L</span>
          </div>
        </div>

        {/* 3. Profit Improvement Uplift */}
        <div className='rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 space-y-1.5 shadow-2xs'>
          <div className='flex items-center justify-between text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400'>
            <span>Profit Improvement</span>
            <span className='px-1.5 py-0.2 rounded bg-emerald-500/20 text-[9px] font-bold'>
              OPTIMAL
            </span>
          </div>
          <div className='text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400'>
            +{profitImprovementPct}%
          </div>
          <div className='text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center justify-between pt-1 border-t border-emerald-500/20'>
            <span>Incremental Profit:</span>
            <span>+₹{Math.round(profitImprovementAmount).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* 4. Portfolio ProfitROAS */}
        <div className='rounded-xl border border-border/70 bg-muted/20 p-4 space-y-1.5'>
          <div className='flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground'>
            <span>Blended ProfitROAS</span>
            <span className='text-sky-500 font-bold'>+0.74x Lift</span>
          </div>
          <div className='text-2xl sm:text-3xl font-extrabold text-foreground'>
            {result.expectedBlendedProfitRoas}x
          </div>
          <div className='text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/40'>
            <span>Breakeven Floor:</span>
            <span className='font-bold text-foreground'>1.80x</span>
          </div>
        </div>
      </div>

      {/* Dynamic Multi-Channel Allocation Breakdown Strip */}
      <div className='space-y-2.5 pt-1'>
        <div className='flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground'>
          <span className='flex items-center gap-1.5'>
            <Icons.barChart className='size-3 text-primary' />
            Current vs Autonomous Recommended Channel Allocation
          </span>
          <span>Target Sum: 100% (₹{(totalRecommendedBudget / 100000).toFixed(2)}L)</span>
        </div>

        {/* Stacked Percentage Visualizer */}
        <div className='h-3 w-full bg-border/60 rounded-full overflow-hidden flex'>
          {channels.map((ch) => (
            <div
              key={ch.platform}
              style={{
                width: `${ch.recommendedSharePct}%`,
                backgroundColor: ch.color
              }}
              title={`${ch.displayName}: ${ch.recommendedSharePct}%`}
              className='h-full transition-all duration-300'
            />
          ))}
        </div>

        {/* 4 Channel Interactive Cards */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3 pt-1'>
          {channels.map((ch) => {
            const isGaining = ch.deltaSpend > 0;
            const isLosing = ch.deltaSpend < 0;

            return (
              <div
                key={ch.platform}
                className='rounded-xl border border-border/70 bg-card p-3 space-y-2 text-xs transition-all hover:border-foreground/40'
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-1.5 font-bold text-foreground'>
                    <span className='size-2 rounded-full' style={{ backgroundColor: ch.color }} />
                    <span className='text-[11px]'>{ch.displayName}</span>
                  </div>
                  <span className='font-mono font-bold text-[10px] px-1.5 py-0.2 rounded bg-muted'>
                    {ch.recommendedSharePct}%
                  </span>
                </div>

                <div className='space-y-0.5'>
                  <div className='text-sm font-bold text-foreground'>
                    ₹{(ch.recommendedSpend / 1000).toFixed(0)}k
                  </div>
                  <div className='flex items-center justify-between text-[10px]'>
                    <span className='text-muted-foreground'>Base: ₹{(ch.currentSpend / 1000).toFixed(0)}k</span>
                    <span
                      className={cn(
                        'font-bold',
                        isGaining && 'text-emerald-600 dark:text-emerald-400',
                        isLosing && 'text-rose-500',
                        !isGaining && !isLosing && 'text-muted-foreground'
                      )}
                    >
                      {ch.deltaSpend > 0 ? '+' : ''}₹{(ch.deltaSpend / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>

                <div className='flex items-center justify-between pt-1.5 border-t border-border/50 text-[10px] text-muted-foreground'>
                  <span>Marginal Yield:</span>
                  <span className='font-bold text-foreground'>₹{ch.marginalReturn}/₹1</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
