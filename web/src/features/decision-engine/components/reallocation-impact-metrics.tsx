'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { ReallocationExecutionDetails } from '../types/reallocation-execution';

interface ReallocationImpactMetricsProps {
  details: ReallocationExecutionDetails;
  className?: string;
}

export function ReallocationImpactMetrics({
  details,
  className
}: ReallocationImpactMetricsProps) {
  const { metricsComparison, capitalMoved, expectedDailyLift, predictedRoas, destination } = details;

  return (
    <div className={cn('space-y-4 font-mono text-[#FFFFFF]', className)}>
      {/* Top Impact KPI Pill Row */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-2.5'>
        <div className='rounded border border-[#1A1A1A] bg-[#000000] p-3'>
          <div className='text-[10px] text-[#8A8A8A] uppercase tracking-wider'>
            Capital Moved
          </div>
          <div className='text-sm sm:text-base font-bold text-[#FFFFFF] mt-0.5'>
            ₹{Math.round(capitalMoved).toLocaleString('en-IN')}<span className='text-xs font-normal text-[#8A8A8A]'>/day</span>
          </div>
          <div className='text-[10px] text-[#FFFFFF] font-semibold mt-1 flex items-center gap-0.5'>
            <Icons.arrowRight className='size-2.5 shrink-0 text-[#FFFFFF]' />
            Reallocated
          </div>
        </div>

        <div className='rounded border border-[#8A8A8A] bg-[#1A1A1A] p-3'>
          <div className='text-[10px] text-[#FFFFFF] uppercase tracking-wider font-bold'>
            Expected Lift
          </div>
          <div className='text-sm sm:text-base font-bold text-[#FFFFFF] mt-0.5'>
            +₹{Math.round(expectedDailyLift).toLocaleString('en-IN')}<span className='text-xs font-normal text-[#8A8A8A]'>/day</span>
          </div>
          <div className='text-[10px] text-[#8A8A8A] font-medium mt-1'>
            Net Contribution Margin
          </div>
        </div>

        <div className='rounded border border-[#1A1A1A] bg-[#000000] p-3'>
          <div className='text-[10px] text-[#8A8A8A] uppercase tracking-wider'>
            New ROAS
          </div>
          <div className='text-sm sm:text-base font-bold text-[#FFFFFF] mt-0.5'>
            {predictedRoas.toFixed(2)}x
          </div>
          <div className='text-[10px] text-[#FFFFFF] font-semibold mt-1 flex items-center gap-0.5'>
            <Icons.trendingUp className='size-2.5 shrink-0 text-[#FFFFFF]' />
            +{details.destination.roasDeltaPct.toFixed(1)}% vs baseline
          </div>
        </div>

        <div className='rounded border border-[#1A1A1A] bg-[#000000] p-3'>
          <div className='text-[10px] text-[#8A8A8A] uppercase tracking-wider'>
            Projected Revenue
          </div>
          <div className='text-sm sm:text-base font-bold text-[#FFFFFF] mt-0.5'>
            ₹{Math.round(destination.newDailyRevenue).toLocaleString('en-IN')}<span className='text-xs font-normal text-[#8A8A8A]'>/day</span>
          </div>
          <div className='text-[10px] text-[#8A8A8A] mt-1'>
            +₹{Math.round(destination.revenueDelta).toLocaleString('en-IN')}/d incremental
          </div>
        </div>
      </div>

      {/* Structured Before / After Metric Comparison Table */}
      <div className='rounded border border-[#1A1A1A] overflow-hidden bg-[#000000]'>
        <div className='bg-[#1A1A1A] px-3 py-2 border-b border-[#1A1A1A] flex items-center justify-between'>
          <span className='text-[11px] font-bold uppercase tracking-wider text-[#FFFFFF]'>
            Decision Telemetry Comparison
          </span>
          <span className='text-[10px] text-[#8A8A8A] uppercase'>
            Deterministic Engine Baseline
          </span>
        </div>

        <div className='divide-y divide-[#1A1A1A] text-xs'>
          <div className='grid grid-cols-12 px-3 py-2 bg-[#000000] text-[10px] text-[#8A8A8A] uppercase font-bold tracking-wider'>
            <div className='col-span-4'>Metric</div>
            <div className='col-span-3 text-right'>Before</div>
            <div className='col-span-3 text-right'>After</div>
            <div className='col-span-2 text-right'>Change</div>
          </div>

          {metricsComparison.map((m) => (
            <div
              key={m.key}
              className='grid grid-cols-12 px-3 py-2.5 items-center hover:bg-[#1A1A1A] transition-colors'
            >
              <div className='col-span-4 font-medium text-[#FFFFFF] truncate'>
                {m.label}
              </div>
              <div className='col-span-3 text-right text-[#8A8A8A]'>
                {m.beforeFormatted}
              </div>
              <div className='col-span-3 text-right font-bold text-[#FFFFFF]'>
                {m.afterFormatted}
              </div>
              <div className='col-span-2 text-right'>
                <span
                  className={cn(
                    'font-bold text-[11px]',
                    m.isPositive
                      ? 'text-[#FFFFFF]'
                      : 'text-[#8A8A8A]'
                  )}
                >
                  {m.changeFormatted}
                </span>
                <span className='block text-[9px] text-[#8A8A8A]'>
                  ({m.pctChangeFormatted})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
