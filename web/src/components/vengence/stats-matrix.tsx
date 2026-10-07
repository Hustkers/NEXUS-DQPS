'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { StatsCounter } from '@/components/ui/stats-counter';

export interface StatItem {
  label: string;
  value: string;
  numericValue?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  useGrouping?: boolean;
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
 * Integrates smooth spring-physics number counter on viewport entry,
 * editorial monospaced tabular typography, and tactile telemetry accents.
 */
export function StatsMatrix({ stats, className = '' }: StatsMatrixProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full',
        className
      )}
    >
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className='group relative rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xs p-4 sm:p-5 transition-all duration-200 hover:border-foreground/40 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)] flex flex-col justify-between text-card-foreground before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/25 dark:before:via-white/15 before:to-transparent before:pointer-events-none'
        >
          {/* Header row with label and live indicator / badge */}
          <div className='flex items-center justify-between gap-1.5 mb-2'>
            <span className='font-mono text-[11px] sm:text-xs font-semibold tracking-wider text-muted-foreground uppercase leading-tight'>
              {stat.label}
            </span>
            {stat.badge && (
              <span className='font-mono text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md border border-border/70 bg-muted/40 text-muted-foreground shrink-0'>
                {stat.badge}
              </span>
            )}
            {stat.trend === 'live' && (
              <span className='flex items-center gap-1.5 font-mono text-[10px] text-foreground font-bold shrink-0'>
                <span className='size-1.5 rounded-full bg-emerald-500 animate-pulse' />
                [ACTIVE]
              </span>
            )}
          </div>

          {/* Primary value: spring-physics animated or tabular typography */}
          <div className='my-1.5'>
            <div className='font-mono text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums'>
              {stat.numericValue !== undefined ? (
                <StatsCounter
                  value={stat.numericValue}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  decimals={stat.decimals ?? 0}
                  useGrouping={stat.useGrouping ?? true}
                />
              ) : (
                stat.value
              )}
            </div>
          </div>

          {/* Sublabel & Change Tag */}
          <div className='flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border/40 text-xs'>
            <span className='text-muted-foreground text-[11px] sm:text-xs leading-tight'>
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

export default StatsMatrix;
