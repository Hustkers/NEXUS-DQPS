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
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true);
      setPhase('completed');
      onAnimationComplete?.();
      return;
    }

    const t1 = setTimeout(() => {
      setPhase('transferring');
    }, 450);

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
    <div className={cn('rounded-xl border border-border/80 bg-background/95 p-5 font-mono shadow-sm', className)}>
      {/* Top Header with live phase status */}
      <div className='flex items-center justify-between border-b border-border/60 pb-3 mb-4'>
        <div className='flex items-center gap-2'>
          {phase === 'analyzing' ? (
            <>
              <Icons.spinner className='size-3.5 animate-spin text-amber-500' />
              <span className='text-xs font-bold uppercase tracking-wider text-amber-500'>
                Step 1 · Analyzing Capital Efficiency
              </span>
            </>
          ) : phase === 'transferring' ? (
            <>
              <span className='size-2 rounded-full bg-cyan-400 animate-ping' />
              <span className='text-xs font-bold uppercase tracking-wider text-cyan-400'>
                Step 2 · Shifting Capital to Optimal Campaign
              </span>
            </>
          ) : (
            <>
              <Icons.check className='size-3.5 text-emerald-400' />
              <span className='text-xs font-bold uppercase tracking-wider text-emerald-400'>
                Step 3 · Capital Transfer Verified &amp; Applied
              </span>
            </>
          )}
        </div>
        <span className='text-[10px] text-muted-foreground uppercase tracking-widest font-mono'>
          {reducedMotion ? 'Reduced Motion' : phase.toUpperCase()}
        </span>
      </div>

      {/* Central Visual Money Flow */}
      <div className='grid grid-cols-1 md:grid-cols-11 gap-3 items-center'>
        {/* SOURCE BOX (4 cols) */}
        <div className='md:col-span-5 rounded-lg border border-border/80 bg-muted/20 p-4 space-y-2.5 transition-all'>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='uppercase font-bold tracking-wider text-rose-500 dark:text-rose-400 flex items-center gap-1.5'>
              <span className='size-1.5 rounded-full bg-rose-500' />
              SOURCE CAMPAIGN
            </span>
            <span className='px-1.5 py-0.5 rounded bg-muted/60 border border-border/60 text-[10px] uppercase font-mono text-muted-foreground'>
              {source.platform}
            </span>
          </div>

          <div>
            <div className='text-sm font-bold text-foreground truncate'>
              {source.productName}
            </div>
            <div className='text-xs font-mono text-muted-foreground truncate mt-0.5'>
              {source.campaign}
            </div>
          </div>

          <div className='pt-2 border-t border-border/50 grid grid-cols-2 gap-2 text-xs'>
            <div>
              <span className='text-[10px] text-muted-foreground uppercase block'>Daily Spend</span>
              <span className='font-bold text-foreground font-mono'>
                {phase === 'completed' ? (
                  <span className='text-muted-foreground'>
                    ₹{Math.round(source.newSpend).toLocaleString('en-IN')}
                  </span>
                ) : (
                  `₹${Math.round(source.currentSpend).toLocaleString('en-IN')}`
                )}
                <span className='text-[10px] font-normal text-muted-foreground'>/d</span>
              </span>
            </div>
            <div>
              <span className='text-[10px] text-muted-foreground uppercase block'>Current ROAS</span>
              <span className='font-bold text-rose-500 font-mono'>
                {source.roas.toFixed(2)}x
              </span>
            </div>
          </div>
        </div>

        {/* MIDDLE DIRECTIONAL CONNECTOR (1 col) */}
        <div className='md:col-span-1 flex flex-col items-center justify-center py-2'>
          <div className='relative flex flex-col items-center gap-1 w-full'>
            <div className='text-[11px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded whitespace-nowrap shadow-xs'>
              −₹{Math.round(capitalMoved).toLocaleString('en-IN')}
            </div>

            {/* Vector Arrow Flow */}
            <div className='relative w-full flex items-center justify-center my-1'>
              <div className='hidden md:block w-full h-0.5 bg-border/60 relative overflow-hidden'>
                {phase === 'transferring' && !reducedMotion && (
                  <div className='absolute inset-y-0 w-8 bg-cyan-400 animate-[moveRight_1s_infinite]' />
                )}
              </div>
              <div className='md:hidden h-8 w-0.5 bg-border/60 relative overflow-hidden'>
                {phase === 'transferring' && !reducedMotion && (
                  <div className='absolute inset-x-0 h-4 bg-cyan-400 animate-[moveDown_1s_infinite]' />
                )}
              </div>
              <Icons.arrowRight className='hidden md:block size-4 text-cyan-400 shrink-0 ml-1' />
              <Icons.chevronDown className='md:hidden size-4 text-cyan-400 shrink-0 mt-1' />
            </div>

            <div className='text-[11px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded whitespace-nowrap shadow-xs'>
              +₹{Math.round(capitalMoved).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* DESTINATION BOX (5 cols) */}
        <div className='md:col-span-5 rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-4 space-y-2.5 transition-all shadow-sm'>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='uppercase font-bold tracking-wider text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5'>
              <span className='size-1.5 rounded-full bg-emerald-500' />
              DESTINATION CAMPAIGN
            </span>
            <span className='px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[10px] uppercase font-mono text-emerald-500 font-bold'>
              {destination.platform}
            </span>
          </div>

          <div>
            <div className='text-sm font-bold text-foreground truncate'>
              {destination.productName}
            </div>
            <div className='text-xs font-mono text-muted-foreground truncate mt-0.5'>
              {destination.campaign}
            </div>
          </div>

          <div className='pt-2 border-t border-border/50 grid grid-cols-2 gap-2 text-xs'>
            <div>
              <span className='text-[10px] text-muted-foreground uppercase block'>Recommended Spend</span>
              <span className='font-bold text-foreground font-mono'>
                ₹{Math.round(destination.newSpend).toLocaleString('en-IN')}
                <span className='text-[10px] font-normal text-muted-foreground'>/d</span>
                <span className='text-[10px] text-emerald-500 font-bold ml-1'>
                  (+₹{Math.round(capitalMoved).toLocaleString('en-IN')})
                </span>
              </span>
            </div>
            <div>
              <span className='text-[10px] text-muted-foreground uppercase block'>Target ROAS</span>
              <span className='font-bold text-emerald-500 font-mono flex items-center gap-1'>
                {destination.predictedRoas.toFixed(2)}x
                <span className='text-[10px] text-muted-foreground font-normal'>
                  ({destination.inventory} units)
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

