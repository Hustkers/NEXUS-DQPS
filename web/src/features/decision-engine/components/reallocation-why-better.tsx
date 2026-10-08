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
    <div className={cn('rounded border border-[#1A1A1A] bg-[#000000] p-4 font-mono space-y-3 text-[#FFFFFF]', className)}>
      <div className='flex items-center gap-2 border-b border-[#1A1A1A] pb-2'>
        <Icons.help className='size-3.5 text-[#FFFFFF]' />
        <h4 className='text-xs font-bold text-[#FFFFFF] uppercase tracking-wider'>
          Why This Reallocation?
        </h4>
        <span className='text-[10px] text-[#8A8A8A] ml-auto font-mono'>
          Convex Optimization Rationale
        </span>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs'>
        {/* Source ROAS Card */}
        <div className='rounded border border-[#1A1A1A] bg-[#1A1A1A] p-2.5 space-y-1'>
          <div className='text-[10px] text-[#8A8A8A] uppercase flex items-center justify-between'>
            <span>Source Operating Level</span>
            <span className='px-1 py-0.2 rounded bg-[#000000] text-[#8A8A8A] text-[9px] uppercase border border-[#1A1A1A]'>
              {source.platform}
            </span>
          </div>
          <div className='font-bold text-[#FFFFFF] truncate'>
            {source.productName}
          </div>
          <div className='flex items-baseline justify-between pt-1'>
            <span className='text-[11px] text-[#8A8A8A]'>Operating ROAS:</span>
            <span className='text-sm font-bold text-[#8A8A8A]'>
              {whyBetter.sourceRoas.toFixed(2)}x
            </span>
          </div>
        </div>

        {/* Destination ROAS Card */}
        <div className='rounded border border-[#8A8A8A] bg-[#1A1A1A] p-2.5 space-y-1 shadow-none'>
          <div className='text-[10px] text-[#FFFFFF] uppercase flex items-center justify-between font-bold'>
            <span>Superior Target Convexity</span>
            <span className='px-1 py-0.2 rounded bg-[#FFFFFF] text-[#000000] text-[9px] uppercase font-bold'>
              {destination.platform}
            </span>
          </div>
          <div className='font-bold text-[#FFFFFF] truncate'>
            {destination.productName}
          </div>
          <div className='flex items-baseline justify-between pt-1'>
            <span className='text-[11px] text-[#8A8A8A]'>Marginal Target ROAS:</span>
            <span className='text-sm font-bold text-[#FFFFFF]'>
              {whyBetter.destinationRoas.toFixed(2)}x
            </span>
          </div>
        </div>
      </div>

      {/* Optimizer explanation */}
      <div className='rounded bg-[#1A1A1A] border border-[#1A1A1A] p-2.5 text-[11px] space-y-1'>
        <div className='text-[10px] font-bold uppercase text-[#FFFFFF] flex items-center gap-1.5'>
          <Icons.check className='size-3 text-[#FFFFFF]' />
          Marginal Return Headroom (+${Math.round(details.expectedDailyLift).toLocaleString('en-US')}/day lift)
        </div>
        <p className='text-[#8A8A8A] leading-relaxed'>
          {item.reason}
        </p>
      </div>
    </div>
  );
}
