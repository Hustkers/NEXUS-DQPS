'use client';

import React from 'react';
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
    <div className={cn('rounded-xl border border-border bg-card p-6 shadow-xs space-y-4', className)}>
      <div className='border-b border-border/60 pb-3'>
        <h4 className='text-sm font-semibold text-foreground'>
          Chain of events
        </h4>
        <p className='text-xs text-muted-foreground mt-0.5'>
          Step-by-step impact from initial crisis trigger to resolution.
        </p>
      </div>

      <div className='space-y-4 pt-1'>
        {nodes.map((node, index) => {
          const isLast = index === nodes.length - 1;

          return (
            <div key={node.step} className='flex items-start gap-3.5'>
              {/* Step indicator */}
              <div className='flex flex-col items-center shrink-0'>
                <div
                  className={cn(
                    'size-6 rounded-full flex items-center justify-center text-xs font-medium border',
                    node.status === 'critical'
                      ? 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : node.status === 'warning'
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : node.status === 'mitigated'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-border bg-muted text-muted-foreground'
                  )}
                >
                  {node.step}
                </div>
                {!isLast && <div className='w-px h-8 bg-border/80 my-1' />}
              </div>

              {/* Step text (flat, no nested card) */}
              <div className='flex-1 min-w-0 pt-0.5 space-y-1'>
                <div className='flex items-center justify-between gap-2'>
                  <span className='font-medium text-foreground text-sm'>
                    {node.title}
                  </span>
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full shrink-0',
                      node.status === 'critical'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : node.status === 'warning'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    )}
                  >
                    {node.metricChange}
                  </span>
                </div>
                <p className='text-xs text-muted-foreground leading-relaxed'>
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
