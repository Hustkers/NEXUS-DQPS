'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
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
    modelAccuracyPct
  } = result;

  return (
    <div className='rounded-2xl border border-border/80 bg-card p-5 sm:p-6 font-mono shadow-xs space-y-5'>
      {/* ZONE 1: Decision Header */}
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <span className='size-2 rounded-full bg-emerald-500 animate-pulse' />
            <span className='text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400'>
              Live Autonomous Loop
            </span>
            <Badge
              variant='outline'
              className='text-[9px] font-bold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
            >
              {modelAccuracyPct}% ACCURACY
            </Badge>
          </div>
          <div className='flex items-center gap-2.5 flex-wrap'>
            <h1 className='text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground'>
              WHAT-IF SIMULATOR
            </h1>
            <span className='text-xs font-semibold text-muted-foreground px-2 py-0.5 rounded-full bg-muted border border-border'>
              Current → Recommended
            </span>
          </div>
        </div>

        <div className='flex items-center gap-2.5'>
          {onOpenWhatIf && (
            <Button
              variant='outline'
              size='sm'
              onClick={onOpenWhatIf}
              className='h-9 text-xs font-bold border-border hover:border-foreground/40'
            >
              <Icons.sliders className='mr-1.5 size-3.5' />
              Scenario Controls
            </Button>
          )}

          <Button
            size='sm'
            onClick={onApplyRecommendation}
            disabled={isApplying}
            className='h-9 px-4 text-xs font-bold uppercase bg-foreground text-background hover:bg-foreground/90 shadow-sm active:scale-[0.98] transition-all'
          >
            {isApplying ? (
              <>
                <Icons.spinner className='mr-1.5 size-3.5 animate-spin' />
                Optimizing &amp; Recording...
              </>
            ) : (
              <>
                <Icons.check className='mr-1.5 size-3.5 text-emerald-400' />
                Apply Recommendation
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ZONE 1: 4 Master Decision KPIs */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* 1. Total Managed Budget */}
        <div className='rounded-xl border border-border/70 bg-muted/15 p-4 space-y-1 hover:border-foreground/30 transition-all'>
          <div className='flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground'>
            <span>Total Budget</span>
            <span className='text-foreground font-mono'>Cycle 9482</span>
          </div>
          <div className='text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight'>
            ₹{(totalRecommendedBudget / 100000).toFixed(2)}L
          </div>
          <div className='text-[10px] text-muted-foreground pt-1 border-t border-border/40 flex items-center justify-between'>
            <span>Run Rate</span>
            <span className='font-bold text-foreground'>₹{Math.round(totalRecommendedBudget / 30).toLocaleString('en-IN')}/day</span>
          </div>
        </div>

        {/* 2. Expected Profit */}
        <div className='rounded-xl border border-border/70 bg-muted/15 p-4 space-y-1 hover:border-foreground/30 transition-all'>
          <div className='flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground'>
            <span>Expected Profit</span>
            <span className='text-muted-foreground'>30D Horizon</span>
          </div>
          <div className='text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight'>
            ₹{(totalExpectedProfit / 100000).toFixed(2)}L
          </div>
          <div className='text-[10px] text-muted-foreground pt-1 border-t border-border/40 flex items-center justify-between'>
            <span>Base Operating Profit</span>
            <span className='font-semibold text-foreground'>₹{(totalCurrentProfit / 100000).toFixed(2)}L</span>
          </div>
        </div>

        {/* 3. Profit Improvement Uplift */}
        <div className='rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 space-y-1 shadow-2xs hover:border-emerald-500/60 transition-all'>
          <div className='flex items-center justify-between text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400'>
            <span>Profit Improvement</span>
            <span className='px-1.5 py-0.5 rounded bg-emerald-500/20 text-[9px] font-bold'>
              OPTIMAL
            </span>
          </div>
          <div className='text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight flex items-baseline gap-1'>
            <span>+{profitImprovementPct}%</span>
            <span className='text-sm font-bold'>↑</span>
          </div>
          <div className='text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold pt-1 border-t border-emerald-500/20 flex items-center justify-between'>
            <span>Incremental Profit</span>
            <span>+₹{Math.round(profitImprovementAmount).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* 4. Portfolio ProfitROAS */}
        <div className='rounded-xl border border-border/70 bg-muted/15 p-4 space-y-1 hover:border-foreground/30 transition-all'>
          <div className='flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground'>
            <span>Blended ProfitROAS</span>
            <span className='text-sky-500 font-bold'>+0.74x Lift</span>
          </div>
          <div className='text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight'>
            {result.expectedBlendedProfitRoas}x
          </div>
          <div className='text-[10px] text-muted-foreground pt-1 border-t border-border/40 flex items-center justify-between'>
            <span>Breakeven Floor</span>
            <span className='font-bold text-foreground'>1.80x</span>
          </div>
        </div>
      </div>
    </div>
  );
}
