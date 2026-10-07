'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { DataLineageInfo } from '../types/simulation-types';

interface SimulationDataLineageProps {
  lineage: DataLineageInfo;
  className?: string;
}

export function SimulationDataLineage({
  lineage,
  className
}: SimulationDataLineageProps) {
  const sources = [
    {
      name: 'Store performance baseline',
      detail: lineage.datasetGrounding || 'Historical store metrics',
      time: 'Last 90 days',
      status: 'Connected'
    },
    {
      name: 'Product catalog',
      detail: `${lineage.productName} (SKU: ${lineage.sku})`,
      time: 'Live sync',
      status: 'Connected'
    },
    {
      name: 'Ad spend tracking',
      detail: `₹${lineage.baselineSpendDaily.toLocaleString('en-IN')}/day baseline spend`,
      time: 'Updated today',
      status: 'Connected'
    },
    {
      name: 'Crisis shock parameters',
      detail: `${lineage.shockMagnitude} applied to ${lineage.selectedStrategy}`,
      time: `${lineage.horizonDays} days horizon`,
      status: 'Calculated'
    }
  ];

  return (
    <div className={cn('rounded-xl border border-border bg-card p-6 shadow-xs space-y-4', className)}>
      <div className='border-b border-border/60 pb-3'>
        <h4 className='text-sm font-semibold text-foreground'>
          Data sources
        </h4>
        <p className='text-xs text-muted-foreground mt-0.5'>
          Verified inputs and operational connections backing this simulation.
        </p>
      </div>

      {/* One line per source with time and status */}
      <div className='divide-y divide-border/60 text-sm'>
        {sources.map((src) => (
          <div
            key={src.name}
            className='flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2'
          >
            <div className='min-w-0'>
              <span className='font-medium text-foreground block'>{src.name}</span>
              <span className='text-xs text-muted-foreground block truncate'>{src.detail}</span>
            </div>
            <div className='flex items-center gap-3 shrink-0 text-xs'>
              <span className='text-muted-foreground'>{src.time}</span>
              <span className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium'>
                <span className='size-1.5 rounded-full bg-emerald-500' />
                {src.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {lineage.formulaSummary && (
        <div className='pt-3 border-t border-border/60 text-xs text-muted-foreground'>
          <span className='font-medium text-foreground'>Model logic: </span>
          {lineage.formulaSummary}
        </div>
      )}
    </div>
  );
}
