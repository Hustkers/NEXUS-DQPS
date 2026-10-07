'use client';

import React, { useEffect, useState } from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { ReallocationExecutionDetails } from '../types/reallocation-execution';

interface ReallocationFlowAnimatorProps {
  details: ReallocationExecutionDetails;
  onAnimationComplete?: () => void;
  className?: string;
}

export function ReallocationFlowAnimator({
  details,
  onAnimationComplete,
  className
}: ReallocationFlowAnimatorProps) {
  const [phase, setPhase] = useState<'analyzing' | 'transferring' | 'completed'>('analyzing');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true);
      setPhase('completed');
      onAnimationComplete?.();
      return;
    }

    // Phase 1: Analyzing capital movement (450ms)
    const t1 = setTimeout(() => {
      setPhase('transferring');
    }, 450);

    // Phase 2: Flow animation (total 1400ms)
    const t2 = setTimeout(() => {
      setPhase('completed');
      onAnimationComplete?.();
    }, 1400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onAnimationComplete]);

  const { source, destination, capitalMoved } = details;

  return (
    <div className={cn('rounded-xl border border-border/80 bg-slate-900/40 p-4 font-mono', className)}>
      {/* Phase status indicator */}
      <div className='flex items-center justify-between border-b border-border/60 pb-2.5 mb-3.5 text-xs'>
        <div className='flex items-center gap-2'>
          {phase === 'analyzing' ? (
            <>
              <Icons.spinner className='size-3.5 animate-spin text-amber-500' />
              <span className='text-amber-500 font-bold uppercase tracking-wider text-[11px]'>
                Phase 1: Analyzing Capital Movement...
              </span>
            </>
          ) : phase === 'transferring' ? (
            <>
              <span className='size-2 rounded-full bg-emerald-500 animate-ping' />
              <span className='text-emerald-500 font-bold uppercase tracking-wider text-[11px]'>
                Phase 2: Executing Autonomous Capital Transfer
              </span>
            </>
          ) : (
            <>
              <Icons.check className='size-3.5 text-emerald-500' />
              <span className='text-emerald-500 font-bold uppercase tracking-wider text-[11px]'>
                Capital Transfer Verified &amp; Applied
              </span>
            </>
          )}
        </div>
        <span className='text-[10px] text-muted-foreground uppercase tracking-widest'>
          {reducedMotion ? 'Reduced Motion Mode' : phase.toUpperCase()}
        </span>
      </div>

      {/* Visual Flow Route */}
      <div className='grid grid-cols-1 md:grid-cols-7 gap-3 items-center'>
        {/* Source Box */}
        <div className='md:col-span-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-1.5 transition-all'>
          <div className='flex items-center justify-between text-[10px] text-muted-foreground'>
            <span className='uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400'>
              Capital Source
            </span>
            <span className='px-1.5 py-0.2 rounded bg-muted/60 border border-border/60 text-[10px] uppercase'>
              {source.platform}
            </span>
          </div>

          <div className='text-xs font-bold text-foreground truncate'>
            {source.productName}
          </div>
          <div className='text-[10px] text-muted-foreground truncate'>
            {source.campaign}
          </div>

          <div className='pt-1 border-t border-border/40 flex items-center justify-between text-xs'>
            <span className='text-muted-foreground text-[11px]'>Daily Spend:</span>
            <span className='font-bold text-foreground'>
              {phase === 'completed' ? (
                <span className='text-amber-600 dark:text-amber-400'>
                  ₹{Math.round(source.newSpend).toLocaleString('en-IN')}/d
                </span>
              ) : (
                `₹${Math.round(source.currentSpend).toLocaleString('en-IN')}/d`
              )}
            </span>
          </div>
        </div>

        {/* Transfer Indicator (Middle) */}
        <div className='md:col-span-1 flex flex-col items-center justify-center py-2'>
          <div className='relative flex flex-col items-center gap-1 w-full'>
            <div className='text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 shadow-2xs whitespace-nowrap animate-pulse'>
              -₹{Math.round(capitalMoved).toLocaleString('en-IN')}/d
            </div>
            
            {/* Visual vector arrow with flowing marker */}
            <div className='relative w-full flex items-center justify-center my-1'>
              <div className='hidden md:block w-full h-0.5 bg-border/60 relative overflow-hidden'>
                {phase === 'transferring' && !reducedMotion && (
                  <div className='absolute inset-y-0 w-8 bg-emerald-500/80 animate-[moveRight_1s_infinite]' />
                )}
              </div>
              <div className='md:hidden h-6 w-0.5 bg-border/60 relative overflow-hidden'>
                {phase === 'transferring' && !reducedMotion && (
                  <div className='absolute inset-x-0 h-4 bg-emerald-500/80 animate-[moveDown_1s_infinite]' />
                )}
              </div>
              <Icons.arrowRight className='hidden md:block size-4 text-emerald-500 shrink-0 ml-1' />
              <Icons.chevronDown className='md:hidden size-4 text-emerald-500 shrink-0 mt-1' />
            </div>

            <span className='text-[9px] text-muted-foreground uppercase tracking-widest text-center'>
              Shift Capital
            </span>
          </div>
        </div>

        {/* Destination Box */}
        <div className='md:col-span-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-1.5 transition-all shadow-xs'>
          <div className='flex items-center justify-between text-[10px] text-muted-foreground'>
            <span className='uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400'>
              Capital Destination
            </span>
            <span className='px-1.5 py-0.2 rounded bg-muted/60 border border-border/60 text-[10px] uppercase'>
              {destination.platform}
            </span>
          </div>

          <div className='text-xs font-bold text-foreground truncate'>
            {destination.productName}
          </div>
          <div className='text-[10px] text-muted-foreground truncate'>
            {destination.campaign}
          </div>

          <div className='pt-1 border-t border-border/40 flex items-center justify-between text-xs'>
            <span className='text-muted-foreground text-[11px]'>New Daily Spend:</span>
            <span className='font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1'>
              ₹{Math.round(destination.newSpend).toLocaleString('en-IN')}/d
              <span className='text-[10px] text-emerald-500 font-semibold'>
                (+₹{Math.round(capitalMoved).toLocaleString('en-IN')})
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
