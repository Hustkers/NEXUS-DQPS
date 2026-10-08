'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { IconWorld } from '@tabler/icons-react';
import { PlatformLogo } from '@/components/icons/platform-logos';
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
  isReallocated?: boolean;
  reallocationId?: string;
  reallocatedAt?: string;
}

interface AnomalyCardProps {
  anomaly: AnomalyItem;
  onMitigate?: (anomaly: AnomalyItem) => void;
  onAnalyze?: (anomaly: AnomalyItem) => void;
  onViewReceipt?: (anomaly: AnomalyItem) => void;
  isMitigating?: boolean;
  className?: string;
}

export function AnomalyCard({ anomaly, onMitigate, onAnalyze, onViewReceipt, isMitigating, className }: AnomalyCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const isCritical = anomaly.severity === 'CRITICAL' || anomaly.inventory === 0;
  const isReallocated = anomaly.isReallocated;

  const topFactor = anomaly.factors?.[0];
  const efficiencyPts = topFactor ? `${topFactor.impactPts > 0 ? '+' : ''}${topFactor.impactPts.toFixed(0)} pts efficiency` : '-12 pts efficiency';

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-3.5 text-card-foreground transition-all duration-200 hover:border-foreground/30 shadow-xs overflow-hidden min-w-0 font-mono space-y-2.5',
        className
      )}
    >
      {/* Top Row: Product, Channel, Severity Badges */}
      <div className='space-y-2'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0 flex items-center gap-2.5'>
            {anomaly.photoUrl && (
              <div
                role='button'
                tabIndex={0}
                onClick={() => onAnalyze?.(anomaly)}
                className='relative size-9 rounded border border-border bg-muted/60 overflow-hidden shrink-0 cursor-pointer hover:border-foreground transition-colors'
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={anomaly.photoUrl}
                  alt={anomaly.productName || anomaly.sku}
                  className='size-full object-cover'
                />
              </div>
            )}
            <div className='min-w-0'>
              <h4
                role='button'
                tabIndex={0}
                onClick={() => onAnalyze?.(anomaly)}
                className='text-xs font-bold text-foreground truncate cursor-pointer hover:underline'
              >
                {anomaly.productName || anomaly.campaign}
              </h4>
              <div className='flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5'>
                <PlatformLogo platform={anomaly.platform} size={12} className='shrink-0' />
                <span className='capitalize font-medium text-foreground'>{anomaly.platform}</span>
                <span>•</span>
                <span>ROAS {anomaly.roas.toFixed(2)}x</span>
              </div>
            </div>
          </div>

          {/* Badges: [REALLOCATED] [HIGH] */}
          <div className='flex flex-col items-end gap-1 shrink-0'>
            <div className='flex items-center gap-1'>
              {isReallocated && (
                <span className='text-[9px] font-bold px-1.5 py-0.5 rounded bg-foreground text-background'>
                  REALLOCATED
                </span>
              )}
              <span
                className={cn(
                  'text-[9px] font-bold px-1.5 py-0.5 rounded border',
                  isCritical
                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                    : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                )}
              >
                {isCritical ? 'CRITICAL' : 'HIGH'}
              </span>
            </div>
            {anomaly.inventory === 0 && (
              <span className='text-[9px] text-rose-400 font-bold'>
                STOCK 0
              </span>
            )}
          </div>
        </div>

        {/* Efficiency delta indicator */}
        <div className='flex items-center justify-between text-[11px] pt-1 border-t border-border/40'>
          <span className={cn('font-bold', isCritical ? 'text-rose-400' : 'text-amber-400')}>
            {efficiencyPts}
          </span>
          <button
            type='button'
            onClick={() => setShowDetails(!showDetails)}
            className='text-[10px] text-muted-foreground hover:text-foreground underline transition-colors'
          >
            {showDetails ? 'Hide Details' : 'Details'}
          </button>
        </div>

        {/* Expandable Explanation (kept behind Details toggle to allow fast scanning) */}
        {showDetails && (
          <div className='p-2.5 rounded bg-muted/30 border border-border/60 text-[11px] text-muted-foreground leading-relaxed animate-in fade-in-0 duration-150 space-y-1.5'>
            <p>{anomaly.explanation}</p>
            {anomaly.factors?.length > 0 && (
              <div className='space-y-1 pt-1 border-t border-border/40 text-[10px]'>
                {anomaly.factors.map((f, i) => (
                  <div key={i} className='flex justify-between'>
                    <span>{f.name}:</span>
                    <span className='font-bold text-foreground'>{f.impactPts.toFixed(1)} pts ({f.deltaPct}%)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Primary Actions: [ANALYSE GLOBE] [VIEW RECEIPT] */}
      <div className='flex items-center gap-2 pt-1 border-t border-border/40'>
        <Button
          size='sm'
          variant='outline'
          onClick={() => onAnalyze?.(anomaly)}
          className='flex-1 h-7 text-[10px] font-mono border-border text-foreground hover:bg-muted font-bold uppercase tracking-wider'
        >
          <IconWorld className='mr-1 size-3' />
          Analyse Globe
        </Button>

        {isReallocated ? (
          <Button
            size='sm'
            onClick={() => onViewReceipt?.(anomaly) || onAnalyze?.(anomaly)}
            className='flex-1 h-7 text-[10px] font-mono bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/25 font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-xs'
          >
            <Icons.check className='size-3 text-emerald-500' />
            <span>✓ Reallocated</span>
          </Button>
        ) : (
          <Button
            size='sm'
            onClick={() => onMitigate?.(anomaly)}
            disabled={isMitigating}
            className='flex-1 h-7 text-[10px] font-mono bg-foreground hover:bg-foreground/90 text-background font-bold uppercase tracking-wider'
          >
            {isMitigating ? (
              <Icons.spinner className='size-3 animate-spin mx-auto' />
            ) : (
              'Reallocate'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
