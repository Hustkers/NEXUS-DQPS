'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { ReallocationExecutionDetails } from '../types/reallocation-execution';

interface ReallocationWhyBetterProps {
  details: ReallocationExecutionDetails;
  className?: string;
}

export function ReallocationWhyBetter({
  details,
  className
}: ReallocationWhyBetterProps) {
  const { source, destination, whyBetter, item } = details;

  return (
    <div className={cn('rounded-lg border border-border/80 bg-slate-50/50 dark:bg-zinc-950/40 p-4 font-mono space-y-3', className)}>
      <div className='flex items-center gap-2 border-b border-border/60 pb-2'>
        <Icons.help className='size-3.5 text-cyan-600 dark:text-cyan-400' />
        <h4 className='text-xs font-bold text-foreground uppercase tracking-wider'>
          Why This Reallocation?
        </h4>
        <span className='text-[10px] text-muted-foreground ml-auto'>
          Convex Optimization Rationale
        </span>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs'>
        {/* Source ROAS Card */}
        <div className='rounded-md border border-border/60 bg-card p-2.5 space-y-1'>
          <div className='text-[10px] text-muted-foreground uppercase flex items-center justify-between'>
            <span>Source Operating Level</span>
            <span className='px-1 py-0.2 rounded bg-muted text-[9px] uppercase'>{source.platform}</span>
          </div>
          <div className='font-bold text-foreground truncate'>
            {source.productName}
          </div>
          <div className='flex items-baseline justify-between pt-1'>
            <span className='text-[11px] text-muted-foreground'>Operating ROAS:</span>
            <span className='text-sm font-bold text-amber-600 dark:text-amber-400'>
              {whyBetter.sourceRoas.toFixed(2)}x
            </span>
          </div>
        </div>

        {/* Destination ROAS Card */}
        <div className='rounded-md border border-emerald-500/30 bg-emerald-500/5 p-2.5 space-y-1 shadow-2xs'>
          <div className='text-[10px] text-muted-foreground uppercase flex items-center justify-between'>
            <span className='text-emerald-700 dark:text-emerald-400 font-semibold'>Superior Target Convexity</span>
            <span className='px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] uppercase border border-emerald-500/20'>
              {destination.platform}
            </span>
          </div>
          <div className='font-bold text-foreground truncate'>
            {destination.productName}
          </div>
          <div className='flex items-baseline justify-between pt-1'>
            <span className='text-[11px] text-muted-foreground'>Marginal Target ROAS:</span>
            <span className='text-sm font-bold text-emerald-600 dark:text-emerald-400'>
              {whyBetter.destinationRoas.toFixed(2)}x
            </span>
          </div>
        </div>
      </div>

      {/* Optimizer explanation */}
      <div className='rounded-md bg-muted/40 p-2.5 text-[11px] space-y-1'>
        <div className='text-[10px] font-bold uppercase text-foreground/80 flex items-center gap-1.5'>
          <Icons.check className='size-3 text-emerald-600' />
          Marginal Return Headroom (+₹{Math.round(details.expectedDailyLift).toLocaleString('en-IN')}/day lift)
        </div>
        <p className='text-muted-foreground leading-relaxed'>
          {item.reason}
        </p>
      </div>
    </div>
  );
}
