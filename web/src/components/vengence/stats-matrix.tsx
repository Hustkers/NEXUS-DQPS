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
          className='group relative rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xs p-4 sm:p-5 transition-all duration-200 hover:border-foreground/40 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)] flex flex-col justify-between text-card-foreground before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/25 dark:before:via-white/15 before:to-transparent before:pointer-events-none'
        >
          {/* Header row with label and live indicator / badge */}
          <div className='flex items-center justify-between gap-2 mb-2'>
            <span className='font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase truncate'>
              {stat.label}
            </span>
            {stat.badge && (
              <span className='font-mono text-[10px] px-2 py-0.5 rounded-md border border-border/70 bg-muted/40 text-muted-foreground shrink-0'>
                {stat.badge}
              </span>
            )}
            {stat.trend === 'live' && (
              <span className='flex items-center gap-1.5 font-mono text-[10px] text-foreground font-bold shrink-0'>
                <span className='size-1.5 rounded-full bg-emerald-500' />
                [ACTIVE]
              </span>
            )}
          </div>

          {/* Primary value: high-contrast, editorial tabular typography */}
          <div className='my-1'>
            <div className='font-mono text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums'>
              {stat.value}
            </div>
          </div>

          {/* Sublabel & Change Tag */}
          <div className='flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border/40 text-xs'>
            <span className='text-muted-foreground text-[11px] truncate'>
              {stat.sublabel}
            </span>
            {stat.change && (
              <span
                className={cn(
                  'font-mono text-[10px] font-semibold shrink-0 px-1.5 py-0.5 rounded-[2px]',
                  stat.trend === 'up' && 'text-foreground bg-muted border border-border',
                  stat.trend === 'down' && 'text-destructive bg-destructive/10 font-bold',
                  stat.trend === 'neutral' && 'text-muted-foreground bg-muted/30 border border-border/50'
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
