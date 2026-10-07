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
    ? 'bg-rose-500'
    : isHigh
    ? 'bg-amber-500'
    : 'bg-blue-500';

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4.5 transition-all hover:border-border hover:shadow-sm shadow-xs',
        className
      )}
    >
      <div>
        {/* Minimal header */}
        <div className='flex items-center justify-between text-xs font-mono text-muted-foreground mb-2.5'>
          <div className='flex items-center gap-2'>
            <span className={cn('size-1.5 rounded-full', severityDot)} />
            <span className='capitalize font-semibold text-foreground'>{anomaly.platform}</span>
            <span className='text-muted-foreground/40'>/</span>
            <span className='text-muted-foreground text-[11px]'>{anomaly.date}</span>
          </div>
          <span
            className={cn(
              'font-mono font-bold text-[10px] px-1.5 py-0.5 rounded border',
              isCritical
                ? 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-500/30'
                : 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-500/30'
            )}
          >
            Z {anomaly.zScore > 0 ? `+${anomaly.zScore}` : anomaly.zScore}
          </span>
        </div>

        {/* Product / Shoe metadata */}
        <div className='flex items-center gap-3 mb-3'>
          {anomaly.photoUrl && (
            <div className='relative size-10 rounded-lg border border-border bg-muted overflow-hidden shrink-0 shadow-2xs'>
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
              <h4 className='font-mono text-xs font-bold text-foreground truncate'>
                {anomaly.productName || anomaly.campaign}
              </h4>
              {anomaly.inventory === 0 && (
                <span className='text-[10px] text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 px-1 py-0.2 rounded font-mono font-semibold shrink-0'>
                  Stock 0
                </span>
              )}
            </div>
            <div className='flex items-center gap-2 text-[11px] font-mono text-muted-foreground mt-0.5'>
              <span>₹{anomaly.spend.toLocaleString()}/d</span>
              <span className='text-muted-foreground/40'>•</span>
              <span className={cn('font-semibold', anomaly.roas < 1.8 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400')}>
                {anomaly.roas.toFixed(2)}x ROAS
              </span>
            </div>
          </div>
        </div>

        {/* Plain diagnostic explanation */}
        <p className='text-xs text-muted-foreground leading-relaxed font-sans mb-3 line-clamp-2'>
          {anomaly.explanation}
        </p>

        {/* Minimal Factor Waterfall: hairline bars */}
        <div className='space-y-1.5 mb-3 pt-2.5 border-t border-border/80'>
          {anomaly.factors.slice(0, 2).map((f, i) => {
            const barWidth = Math.min(Math.abs(f.impactPts) * 1.3, 100);
            return (
              <div key={i} className='space-y-1'>
                <div className='flex items-center justify-between text-[11px] font-mono'>
                  <span className='text-muted-foreground'>{f.name}</span>
                  <span className={cn('font-semibold', f.impactPts < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400')}>
                    {f.impactPts > 0 ? `+${f.impactPts.toFixed(1)}` : f.impactPts.toFixed(1)} pts
                  </span>
                </div>
                <div className='h-1 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden'>
                  <div
                    className={cn(
                      'h-full rounded-full',
                      f.color === 'rose'
                        ? 'bg-rose-500'
                        : f.color === 'amber'
                        ? 'bg-amber-500'
                        : 'bg-slate-400 dark:bg-zinc-500'
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
        className='w-full text-xs font-mono h-8 border border-border bg-secondary hover:bg-secondary/80 text-foreground font-semibold shadow-2xs active:scale-[0.98]'
      >
        <Icons.arrowRight className='mr-1.5 size-3 text-muted-foreground' />
        Auto-Reallocate
      </Button>
    </div>
  );
}
