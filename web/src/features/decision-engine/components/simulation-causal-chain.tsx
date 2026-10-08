'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { CausalNode } from '../types/simulation-types';

interface SimulationCausalChainProps {
  nodes: CausalNode[];
  className?: string;
}

export function SimulationCausalChain({
  nodes,
  className
}: SimulationCausalChainProps) {
  return (
    <div className={cn('rounded-xl border border-border/80 bg-card p-4 sm:p-5 font-mono shadow-xs space-y-3.5', className)}>
      <div className='flex items-center justify-between border-b border-border/60 pb-3'>
        <div className='flex items-center gap-2'>
          <Icons.topology className='size-3.5 text-muted-foreground' />
          <h3 className='text-xs font-bold uppercase tracking-wider text-foreground'>
            Causal Chain Diagnosis &amp; Root-Cause Propagation
          </h3>
        </div>
        <span className='text-[10px] text-muted-foreground uppercase'>
          Why did the simulation change?
        </span>
      </div>

      <div className='space-y-2.5'>
        {nodes.map((node, index) => {
          const isLast = index === nodes.length - 1;

          return (
            <div key={node.step} className='flex items-start gap-3'>
              {/* Step indicator circle */}
              <div className='flex flex-col items-center'>
                <div
                  className={cn(
                    'size-6 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0',
                    node.status === 'critical'
                      ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : node.status === 'warning'
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : node.status === 'mitigated'
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-border bg-muted text-muted-foreground'
                  )}
                >
                  {node.step}
                </div>
                {!isLast && <div className='w-0.5 h-6 bg-border/60 my-0.5' />}
              </div>

              {/* Node content box */}
              <div className='flex-1 rounded-lg border border-border/70 bg-slate-50/40 dark:bg-zinc-950/30 p-2.5 space-y-1 text-xs'>
                <div className='flex items-center justify-between'>
                  <span className='font-bold text-foreground text-[11px]'>
                    {node.title}
                  </span>
                  <span
                    className={cn(
                      'text-[9px] font-bold px-1.5 py-0.2 rounded uppercase',
                      node.status === 'critical'
                        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                        : node.status === 'warning'
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                        : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                    )}
                  >
                    {node.metricChange}
                  </span>
                </div>
                <p className='text-[11px] text-muted-foreground leading-relaxed'>
                  {node.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
