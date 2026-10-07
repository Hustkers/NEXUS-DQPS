'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface StatItem {
  label: string;
  value: string;
  sublabel: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral' | 'live';
  badge?: string;
}

interface StatsMatrixProps {
  stats: StatItem[];
  className?: string;
}

/**
 * StatsMatrix: VengenceUI-inspired clean tabular statistics grid.
 * Strict no-counter implementation: Renders crisp, instantaneous,
 * high-contrast values with monospaced precision and telemetry accents.
 */
export function StatsMatrix({ stats, className = '' }: StatsMatrixProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full',
        className
      )}
    >
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className='group relative rounded-xl border border-border/80 bg-card p-4 sm:p-5 transition-all duration-200 hover:border-border hover:shadow-xs flex flex-col justify-between'
        >
          {/* Header row with label and live indicator / badge */}
          <div className='flex items-center justify-between gap-2 mb-2'>
            <span className='font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase truncate'>
              {stat.label}
            </span>
            {stat.badge && (
              <span className='font-mono text-[10px] px-1.5 py-0.5 rounded border border-border bg-muted/60 text-muted-foreground shrink-0'>
                {stat.badge}
              </span>
            )}
            {stat.trend === 'live' && (
              <span className='flex items-center gap-1 font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold shrink-0'>
                <span className='size-1.5 rounded-full bg-emerald-500 animate-pulse' />
                ACTIVE
              </span>
            )}
          </div>

          {/* Primary value: high-contrast, editorial tabular typography */}
          <div className='my-1'>
            <div className='font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums'>
              {stat.value}
            </div>
          </div>

          {/* Sublabel & Change Tag */}
          <div className='flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border/60 text-xs'>
            <span className='text-muted-foreground text-[11px] truncate'>
              {stat.sublabel}
            </span>
            {stat.change && (
              <span
                className={cn(
                  'font-mono text-[11px] font-semibold shrink-0 px-1.5 py-0.2 rounded',
                  stat.trend === 'up' && 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
                  stat.trend === 'down' && 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
                  stat.trend === 'neutral' && 'text-muted-foreground bg-muted'
                )}
              >
                {stat.change}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
