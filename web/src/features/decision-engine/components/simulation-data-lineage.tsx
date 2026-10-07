'use client';

import React from 'react';
import { Icons } from '@/components/icons';
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
  return (
    <div className={cn('rounded-xl border border-border/80 bg-muted/20 p-4 font-mono shadow-xs text-xs space-y-3', className)}>
      <div className='flex items-center justify-between border-b border-border/60 pb-2.5'>
        <div className='flex items-center gap-2'>
          <Icons.shieldCheck className='size-3.5 text-emerald-500' />
          <h4 className='font-bold uppercase tracking-wider text-foreground text-xs'>
            Mathematical Lineage &amp; Data Grounding
          </h4>
        </div>
        <span className='text-[10px] text-muted-foreground uppercase font-semibold'>
          100% Deterministic • Zero Synthetic Drift
        </span>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]'>
        <div>
          <span className='text-muted-foreground block text-[10px] uppercase'>Baseline Source</span>
          <span className='font-semibold text-foreground truncate block' title={lineage.datasetGrounding}>
            90-Day Telemetry Dataset
          </span>
        </div>

        <div>
          <span className='text-muted-foreground block text-[10px] uppercase'>Affected SKU Target</span>
          <span className='font-semibold text-foreground truncate block'>
            {lineage.productName} ({lineage.sku})
          </span>
        </div>

        <div>
          <span className='text-muted-foreground block text-[10px] uppercase'>Daily Spend Baseline</span>
          <span className='font-semibold text-foreground'>
            ₹{lineage.baselineSpendDaily.toLocaleString('en-IN')}/day
          </span>
        </div>

        <div>
          <span className='text-muted-foreground block text-[10px] uppercase'>Injected Shock Magnitude</span>
          <span className='font-bold text-rose-600 dark:text-rose-400'>
            {lineage.shockMagnitude}
          </span>
        </div>
      </div>

      <div className='pt-2 border-t border-border/40 text-[10px] text-muted-foreground flex items-center justify-between flex-wrap gap-2'>
        <span>Active Strategy: <strong className='text-foreground'>{lineage.selectedStrategy}</strong></span>
        <span>Horizon: <strong className='text-foreground'>{lineage.horizonDays} Days</strong></span>
        <span className='italic truncate max-w-md'>{lineage.formulaSummary}</span>
      </div>
    </div>
  );
}
