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
    <div className={cn('rounded border border-[#1A1A1A] bg-[#000000] p-4 font-mono text-[#FFFFFF]', className)}>
      {/* Phase status indicator */}
      <div className='flex items-center justify-between border-b border-[#1A1A1A] pb-2.5 mb-3.5 text-xs'>
        <div className='flex items-center gap-2'>
          {phase === 'analyzing' ? (
            <>
              <Icons.spinner className='size-3.5 animate-spin text-[#8A8A8A]' />
              <span className='text-[#8A8A8A] font-bold uppercase tracking-wider text-[11px]'>
                Phase 1: Analyzing Capital Movement...
              </span>
            </>
          ) : phase === 'transferring' ? (
            <>
              <span className='size-2 rounded-full bg-[#FFFFFF] animate-ping' />
              <span className='text-[#FFFFFF] font-bold uppercase tracking-wider text-[11px]'>
                Phase 2: Executing Autonomous Capital Transfer
              </span>
            </>
          ) : (
            <>
              <Icons.check className='size-3.5 text-[#FFFFFF]' />
              <span className='text-[#FFFFFF] font-bold uppercase tracking-wider text-[11px]'>
                Capital Transfer Verified &amp; Applied
              </span>
            </>
          )}
        </div>
        <span className='text-[10px] text-[#8A8A8A] uppercase tracking-widest'>
          {reducedMotion ? 'Reduced Motion Mode' : phase.toUpperCase()}
        </span>
      </div>

      {/* Visual Flow Route */}
      <div className='grid grid-cols-1 md:grid-cols-7 gap-3 items-center'>
        {/* Source Box */}
        <div className='md:col-span-3 rounded border border-[#1A1A1A] bg-[#1A1A1A] p-3 space-y-1.5 transition-all'>
          <div className='flex items-center justify-between text-[10px] text-[#8A8A8A]'>
            <span className='uppercase font-bold tracking-wider text-[#8A8A8A]'>
              Capital Source
            </span>
            <span className='px-1.5 py-0.2 rounded bg-[#000000] border border-[#1A1A1A] text-[10px] uppercase text-[#8A8A8A]'>
              {source.platform}
            </span>
          </div>

          <div className='text-xs font-bold text-[#FFFFFF] truncate'>
            {source.productName}
          </div>
          <div className='text-[10px] text-[#8A8A8A] truncate'>
            {source.campaign}
          </div>

          <div className='pt-1 border-t border-[#000000] flex items-center justify-between text-xs'>
            <span className='text-[#8A8A8A] text-[11px]'>Daily Spend:</span>
            <span className='font-bold text-[#FFFFFF]'>
              {phase === 'completed' ? (
                <span className='text-[#8A8A8A]'>
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
            <div className='text-[11px] font-bold text-[#000000] bg-[#FFFFFF] px-2 py-0.5 rounded whitespace-nowrap'>
              -₹{Math.round(capitalMoved).toLocaleString('en-IN')}/d
            </div>
            
            {/* Visual vector arrow with flowing marker */}
            <div className='relative w-full flex items-center justify-center my-1'>
              <div className='hidden md:block w-full h-0.5 bg-[#1A1A1A] relative overflow-hidden'>
                {phase === 'transferring' && !reducedMotion && (
                  <div className='absolute inset-y-0 w-8 bg-[#FFFFFF] animate-[moveRight_1s_infinite]' />
                )}
              </div>
              <div className='md:hidden h-6 w-0.5 bg-[#1A1A1A] relative overflow-hidden'>
                {phase === 'transferring' && !reducedMotion && (
                  <div className='absolute inset-x-0 h-4 bg-[#FFFFFF] animate-[moveDown_1s_infinite]' />
                )}
              </div>
              <Icons.arrowRight className='hidden md:block size-4 text-[#FFFFFF] shrink-0 ml-1' />
              <Icons.chevronDown className='md:hidden size-4 text-[#FFFFFF] shrink-0 mt-1' />
            </div>

            <span className='text-[9px] text-[#8A8A8A] uppercase tracking-widest text-center'>
              Shift Capital
            </span>
          </div>
        </div>

        {/* Destination Box */}
        <div className='md:col-span-3 rounded border border-[#8A8A8A] bg-[#1A1A1A] p-3 space-y-1.5 transition-all shadow-none'>
          <div className='flex items-center justify-between text-[10px] text-[#8A8A8A]'>
            <span className='uppercase font-bold tracking-wider text-[#FFFFFF]'>
              Capital Destination
            </span>
            <span className='px-1.5 py-0.2 rounded bg-[#FFFFFF] text-[#000000] text-[10px] uppercase font-bold'>
              {destination.platform}
            </span>
          </div>

          <div className='text-xs font-bold text-[#FFFFFF] truncate'>
            {destination.productName}
          </div>
          <div className='text-[10px] text-[#8A8A8A] truncate'>
            {destination.campaign}
          </div>

          <div className='pt-1 border-t border-[#000000] flex items-center justify-between text-xs'>
            <span className='text-[#8A8A8A] text-[11px]'>New Daily Spend:</span>
            <span className='font-bold text-[#FFFFFF] flex items-center gap-1'>
              ₹{Math.round(destination.newSpend).toLocaleString('en-IN')}/d
              <span className='text-[10px] text-[#8A8A8A] font-semibold'>
                (+₹{Math.round(capitalMoved).toLocaleString('en-IN')})
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
