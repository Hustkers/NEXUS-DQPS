'use client';

import React from 'react';
import {
  IconRocket,
  IconCheck,
  IconLock,
  IconShieldCheck
} from '@tabler/icons-react';
import type { CampaignStrategy } from '@/lib/strategy-engine/types';

interface StrategyReadyToExecuteProps {
  strategy: CampaignStrategy;
  dailyBudget: number;
  onApplyStrategy: (strategy: CampaignStrategy) => void;
  onOpenLaunchModal: (strategy: CampaignStrategy) => void;
}

export function StrategyReadyToExecute({
  strategy,
  dailyBudget,
  onApplyStrategy,
  onOpenLaunchModal
}: StrategyReadyToExecuteProps) {
  const curSym = '₹';
  const perDay = Math.round(dailyBudget / (strategy.campaignDuration || 30));

  return (
    <div className='rounded-2xl border-2 border-border/80 bg-card p-6 font-mono shadow-md'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        {/* Left: Headline & Strategy Details */}
        <div className='space-y-1.5'>
          <div className='flex items-center gap-2'>
            <span className='size-2 rounded-full bg-cyan-400 animate-pulse' />
            <span className='text-[10px] uppercase font-bold tracking-widest text-muted-foreground'>
              READY TO EXECUTE
            </span>
          </div>

          <h3 className='text-base sm:text-lg font-bold text-foreground'>
            {strategy.strategyName.split('—')[0].trim()}
          </h3>

          <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
            <span className='text-cyan-400 font-bold'>
              {curSym}{dailyBudget.toLocaleString('en-IN')} total
            </span>
            <span>•</span>
            <span>~{curSym}{perDay.toLocaleString('en-IN')}/day</span>
            <span>•</span>
            <span>{strategy.campaignDuration || 30} days</span>
            <span>•</span>
            <span className='uppercase font-semibold'>{strategy.platform}</span>
          </div>
        </div>

        {/* Right: Primary CTAs */}
        <div className='flex items-center gap-3 shrink-0'>
          <button
            type='button'
            onClick={() => onApplyStrategy(strategy)}
            className='px-4 py-2.5 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/50 text-foreground font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5'
          >
            <IconCheck className='size-3.5 text-emerald-400' />
            <span>Apply Strategy</span>
          </button>

          <button
            type='button'
            onClick={() => onOpenLaunchModal(strategy)}
            className='px-6 py-2.5 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm'
          >
            <IconRocket className='size-4' />
            <span>Approve &amp; Launch</span>
          </button>
        </div>
      </div>
    </div>
  );
}
