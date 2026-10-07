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
          className='group relative rounded-[6px] border border-[#8A8A8A] bg-[#1A1A1A] p-4 sm:p-5 transition-colors duration-150 hover:border-[#FFFFFF] shadow-none flex flex-col justify-between'
        >
          {/* Header row with label and live indicator / badge */}
          <div className='flex items-center justify-between gap-2 mb-2'>
            <span className='font-mono text-[11px] font-medium tracking-wider text-[#8A8A8A] uppercase truncate'>
              {stat.label}
            </span>
            {stat.badge && (
              <span className='font-mono text-[10px] px-1.5 py-0.5 rounded-[2px] border border-[#8A8A8A] bg-[#000000] text-[#8A8A8A] shrink-0'>
                {stat.badge}
              </span>
            )}
            {stat.trend === 'live' && (
              <span className='flex items-center gap-1.5 font-mono text-[10px] text-[#FFFFFF] font-bold shrink-0'>
                <span className='size-1.5 rounded-full bg-[#FFFFFF]' />
                [ACTIVE]
              </span>
            )}
          </div>

          {/* Primary value: high-contrast, editorial tabular typography */}
          <div className='my-1'>
            <div className='font-mono text-2xl sm:text-3xl font-bold tracking-tight text-[#FFFFFF] tabular-nums'>
              {stat.value}
            </div>
          </div>

          {/* Sublabel & Change Tag */}
          <div className='flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[#8A8A8A]/30 text-xs'>
            <span className='text-[#8A8A8A] text-[11px] truncate'>
              {stat.sublabel}
            </span>
            {stat.change && (
              <span
                className={cn(
                  'font-mono text-[10px] font-semibold shrink-0 px-1.5 py-0.5 rounded-[2px]',
                  stat.trend === 'up' && 'text-[#FFFFFF] bg-[#000000] border border-[#8A8A8A]',
                  stat.trend === 'down' && 'text-[#000000] bg-[#FFFFFF] font-bold',
                  stat.trend === 'neutral' && 'text-[#8A8A8A] bg-[#000000] border border-[#1A1A1A]'
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
