'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { ReallocationExecutionDetails } from '../types/reallocation-execution';

interface ReallocationSplitBarProps {
  details: ReallocationExecutionDetails;
  className?: string;
}

export function ReallocationSplitBar({
  details,
  className
}: ReallocationSplitBarProps) {
  const { allocation } = details;

  // Max value for width scaling
  const maxSpend = Math.max(
    allocation.sourceBefore,
    allocation.destBefore,
    allocation.sourceAfter,
    allocation.destAfter,
    1
  );

  const getWidthPct = (val: number) => {
    return Math.max(8, Math.min(100, Math.round((val / maxSpend) * 100)));
  };

  return (
    <div className={cn('rounded border border-[#1A1A1A] bg-[#000000] p-4 font-mono space-y-4 text-[#FFFFFF]', className)}>
      <div className='flex items-center justify-between border-b border-[#1A1A1A] pb-2'>
        <h4 className='text-xs font-bold text-[#FFFFFF] uppercase tracking-wider'>
          Portfolio Rebalancing Distribution
        </h4>
        <span className='text-[10px] text-[#8A8A8A] uppercase font-mono'>
          Source vs Destination Spend Share
        </span>
      </div>

      {/* BEFORE State */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between text-[11px] font-bold text-[#8A8A8A] uppercase'>
          <span>Before Execution</span>
          <span>Total: ${(allocation.sourceBefore + allocation.destBefore).toLocaleString('en-US')}/d</span>
        </div>

        <div className='space-y-1.5'>
          {/* Source Before */}
          <div className='space-y-0.5'>
            <div className='flex items-center justify-between text-[10px] text-[#8A8A8A]'>
              <span className='truncate max-w-[200px] sm:max-w-xs'>{allocation.sourceLabel}</span>
              <span className='font-medium text-[#FFFFFF]'>${allocation.sourceBefore.toLocaleString('en-US')}/d ({allocation.sourceShareBeforePct.toFixed(0)}%)</span>
            </div>
            <div className='w-full bg-[#1A1A1A] h-2 rounded-none overflow-hidden'>
              <div
                className='h-full bg-[#8A8A8A] transition-all'
                style={{ width: `${getWidthPct(allocation.sourceBefore)}%` }}
              />
            </div>
          </div>

          {/* Destination Before */}
          <div className='space-y-0.5'>
            <div className='flex items-center justify-between text-[10px] text-[#8A8A8A]'>
              <span className='truncate max-w-[200px] sm:max-w-xs'>{allocation.destLabel}</span>
              <span className='font-medium text-[#8A8A8A]'>${allocation.destBefore.toLocaleString('en-US')}/d ({allocation.destShareBeforePct.toFixed(0)}%)</span>
            </div>
            <div className='w-full bg-[#1A1A1A] h-2 rounded-none overflow-hidden'>
              <div
                className='h-full bg-[#8A8A8A] transition-all opacity-50'
                style={{ width: `${getWidthPct(allocation.destBefore)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AFTER State */}
      <div className='space-y-2 pt-2 border-t border-[#1A1A1A]'>
        <div className='flex items-center justify-between text-[11px] font-bold text-[#FFFFFF] uppercase'>
          <span>After Reallocation</span>
          <span className='text-[#FFFFFF] font-semibold'>Total: ${(allocation.sourceAfter + allocation.destAfter).toLocaleString('en-US')}/d</span>
        </div>

        <div className='space-y-1.5'>
          {/* Source After */}
          <div className='space-y-0.5'>
            <div className='flex items-center justify-between text-[10px] text-[#8A8A8A]'>
              <span className='truncate max-w-[200px] sm:max-w-xs'>{allocation.sourceLabel}</span>
              <span className='font-medium text-[#8A8A8A]'>
                ${allocation.sourceAfter.toLocaleString('en-US')}/d ({allocation.sourceShareAfterPct.toFixed(0)}%)
              </span>
            </div>
            <div className='w-full bg-[#1A1A1A] h-2 rounded-none overflow-hidden'>
              <div
                className='h-full bg-[#8A8A8A] transition-all'
                style={{ width: `${getWidthPct(allocation.sourceAfter)}%` }}
              />
            </div>
          </div>

          {/* Destination After */}
          <div className='space-y-0.5'>
            <div className='flex items-center justify-between text-[10px] text-[#8A8A8A]'>
              <span className='truncate max-w-[200px] sm:max-w-xs font-semibold text-[#FFFFFF]'>{allocation.destLabel}</span>
              <span className='font-bold text-[#FFFFFF]'>
                ${allocation.destAfter.toLocaleString('en-US')}/d ({allocation.destShareAfterPct.toFixed(0)}%)
              </span>
            </div>
            <div className='w-full bg-[#1A1A1A] h-2 rounded-none overflow-hidden'>
              <div
                className='h-full bg-[#FFFFFF] transition-all'
                style={{ width: `${getWidthPct(allocation.destAfter)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
