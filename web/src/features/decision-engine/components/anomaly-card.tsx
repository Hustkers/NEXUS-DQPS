'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export interface FactorDecomp {
  name: string;
  deltaPct: number;
  impactPts: number;
  badge: string;
  color: string;
  detail: string;
}

export interface AnomalyItem {
  id: string;
  campaign: string;
  platform: string;
  sku: string;
  productName?: string;
  photoUrl?: string;
  date: string;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING';
  zScore: number;
  roas: number;
  spend: number;
  inventory: number;
  explanation: string;
  factors: FactorDecomp[];
}

interface AnomalyCardProps {
  anomaly: AnomalyItem;
  onMitigate?: (anomaly: AnomalyItem) => void;
  className?: string;
}

export function AnomalyCard({ anomaly, onMitigate, className }: AnomalyCardProps) {
  const isCritical = anomaly.severity === 'CRITICAL';
  const isHigh = anomaly.severity === 'HIGH';

  const severityDot = isCritical
    ? 'bg-rose-400'
    : isHigh
    ? 'bg-amber-400'
    : 'bg-blue-400';

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-4 transition-colors hover:border-zinc-700/70 shadow-none',
        className
      )}
    >
      <div>
        {/* Minimal header */}
        <div className='flex items-center justify-between text-xs font-mono text-zinc-400 mb-2.5'>
          <div className='flex items-center gap-2'>
            <span className={cn('size-1.5 rounded-full', severityDot)} />
            <span className='capitalize font-medium text-zinc-300'>{anomaly.platform}</span>
            <span className='text-zinc-700'>/</span>
            <span className='text-zinc-500 text-[11px]'>{anomaly.date}</span>
          </div>
          <span className={cn('font-mono font-semibold text-[11px]', isCritical ? 'text-rose-400' : 'text-amber-400')}>
            Z {anomaly.zScore > 0 ? `+${anomaly.zScore}` : anomaly.zScore}
          </span>
        </div>

        {/* Product / Shoe metadata */}
        <div className='flex items-center gap-3 mb-3'>
          {anomaly.photoUrl && (
            <div className='relative size-10 rounded border border-zinc-800/80 bg-zinc-900/60 overflow-hidden shrink-0'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={anomaly.photoUrl}
                alt={anomaly.productName || anomaly.sku}
                className='size-full object-cover'
              />
            </div>
          )}
          <div className='flex-1 min-w-0'>
            <div className='flex items-center justify-between gap-1'>
              <h4 className='font-mono text-xs font-bold text-zinc-200 truncate'>
                {anomaly.productName || anomaly.campaign}
              </h4>
              {anomaly.inventory === 0 && (
                <span className='text-[10px] text-rose-400 font-mono font-semibold shrink-0'>
                  Stock 0
                </span>
              )}
            </div>
            <div className='flex items-center gap-2 text-[11px] font-mono text-zinc-500 mt-0.5'>
              <span>${anomaly.spend.toLocaleString()}/d</span>
              <span className='text-zinc-700'>•</span>
              <span className={cn('font-medium', anomaly.roas < 1.8 ? 'text-rose-400' : 'text-amber-400')}>
                {anomaly.roas.toFixed(2)}x ROAS
              </span>
            </div>
          </div>
        </div>

        {/* Plain diagnostic explanation */}
        <p className='text-xs text-zinc-400 leading-relaxed font-sans mb-3 line-clamp-2'>
          {anomaly.explanation}
        </p>

        {/* Minimal Factor Waterfall: hairline bars */}
        <div className='space-y-1.5 mb-3 pt-2.5 border-t border-zinc-900'>
          {anomaly.factors.slice(0, 2).map((f, i) => {
            const barWidth = Math.min(Math.abs(f.impactPts) * 1.3, 100);
            return (
              <div key={i} className='space-y-1'>
                <div className='flex items-center justify-between text-[11px] font-mono'>
                  <span className='text-zinc-500'>{f.name}</span>
                  <span className={cn('font-medium', f.impactPts < 0 ? 'text-rose-400' : 'text-emerald-400')}>
                    {f.impactPts > 0 ? `+${f.impactPts.toFixed(1)}` : f.impactPts.toFixed(1)} pts
                  </span>
                </div>
                <div className='h-0.5 w-full bg-zinc-900 rounded-full overflow-hidden'>
                  <div
                    className={cn(
                      'h-full rounded-full',
                      f.color === 'rose'
                        ? 'bg-rose-400'
                        : f.color === 'amber'
                        ? 'bg-amber-400'
                        : 'bg-zinc-500'
                    )}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Utilitarian Action Button */}
      <Button
        size='sm'
        variant='outline'
        onClick={() => onMitigate?.(anomaly)}
        className='w-full text-xs font-mono h-7 border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 active:scale-[0.98]'
      >
        <Icons.arrowRight className='mr-1.5 size-3 text-zinc-400' />
        Auto-Reallocate
      </Button>
    </div>
  );
}
