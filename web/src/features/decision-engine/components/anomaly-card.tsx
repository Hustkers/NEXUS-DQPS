'use client';

import React from 'react';
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
  const isCritical = anomaly.severity === 'CRITICAL' || anomaly.inventory === 0;
  const isReallocated = anomaly.isReallocated;

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded border border-[#1A1A1A] bg-[#1A1A1A] p-4 text-[#FFFFFF] transition-all hover:border-[#8A8A8A] shadow-none',
        className
      )}
    >
      <div>
        {/* Monochromatic header */}
        <div className='flex items-center justify-between text-xs font-mono text-[#8A8A8A] mb-2.5'>
          <div className='flex items-center gap-2'>
            <span className='text-xs font-mono font-bold text-[#FFFFFF]'>
              {isCritical ? '■' : '○'}
            </span>
            <PlatformLogo platform={anomaly.platform} size={14} className='shrink-0' />
            <span className='capitalize font-semibold text-[#FFFFFF]'>{anomaly.platform}</span>
            <span className='text-[#8A8A8A]'>/</span>
            <span className='text-[#8A8A8A] text-[11px]'>{anomaly.date}</span>
          </div>
          <div className='flex items-center gap-1.5'>
            {isReallocated && (
              <span className='font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-[#FFFFFF] text-[#000000] border border-[#FFFFFF]'>
                [REALLOCATED]
              </span>
            )}
            <span
              className={cn(
                'font-mono font-bold text-[10px] px-1.5 py-0.5 rounded',
                isCritical
                  ? 'bg-[#FFFFFF] text-[#000000]'
                  : 'bg-[#000000] text-[#FFFFFF]'
              )}
            >
              {isCritical ? '[CRITICAL] ' : '[WARN] '}Z {anomaly.zScore > 0 ? `+${anomaly.zScore}` : anomaly.zScore}
            </span>
          </div>
        </div>

        {/* Product / Campaign block */}
        <div
          role='button'
          tabIndex={0}
          className='flex items-center gap-3 mb-3 cursor-pointer group/shoe transition-opacity hover:opacity-90'
          onClick={() => onAnalyze?.(anomaly)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onAnalyze?.(anomaly);
            }
          }}
          title='Click to inspect product telemetry'
        >
          {anomaly.photoUrl && (
            <div className='relative size-10 rounded border border-[#1A1A1A] bg-[#000000] overflow-hidden shrink-0 group-hover/shoe:border-[#FFFFFF] transition-colors'>
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
              <h4 className='font-mono text-xs font-bold text-[#FFFFFF] truncate group-hover/shoe:underline'>
                {anomaly.productName || anomaly.campaign}
              </h4>
              {anomaly.inventory === 0 && (
                <span className='text-[10px] bg-[#FFFFFF] text-[#000000] px-1.5 py-0.5 rounded font-mono font-bold shrink-0'>
                  STOCK 0
                </span>
              )}
            </div>
            <div className='flex items-center gap-2 text-[11px] font-mono text-[#8A8A8A] mt-0.5'>
              <span className='text-[#FFFFFF]'>₹{anomaly.spend.toLocaleString()}/d</span>
              <span>•</span>
              <span className='font-bold text-[#FFFFFF]'>
                {anomaly.roas.toFixed(2)}x ROAS
              </span>
            </div>
          </div>
        </div>

        {/* Plain diagnostic explanation */}
        <p className='text-xs text-[#8A8A8A] leading-relaxed font-sans mb-3 line-clamp-2'>
          {anomaly.explanation}
        </p>

        {/* Minimal Factor Waterfall: hairline bars in monochrome */}
        <div className='space-y-1.5 mb-3 pt-2.5 border-t border-[#000000]'>
          {anomaly.factors.slice(0, 2).map((f, i) => {
            const barWidth = Math.min(Math.abs(f.impactPts) * 1.3, 100);
            return (
              <div key={i} className='space-y-1'>
                <div className='flex items-center justify-between text-[11px] font-mono'>
                  <span className='text-[#8A8A8A]'>{f.name}</span>
                  <span className='font-bold text-[#FFFFFF]'>
                    {f.impactPts > 0 ? `+${f.impactPts.toFixed(1)}` : f.impactPts.toFixed(1)} pts
                  </span>
                </div>
                <div className='h-1.5 w-full bg-[#000000] overflow-hidden'>
                  <div
                    className={cn('h-full', isCritical ? 'bg-[#FFFFFF]' : 'bg-[#8A8A8A]')}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons strictly per DESIGN.md */}
      <div className='flex items-center gap-2'>
        <Button
          size='sm'
          variant='outline'
          onClick={() => onAnalyze?.(anomaly)}
          className='flex-1 text-xs font-mono h-8 border border-[#1A1A1A] bg-[#000000] text-[#FFFFFF] hover:bg-[#1A1A1A] hover:border-[#FFFFFF] font-semibold active:scale-[0.98]'
        >
          <IconWorld className='mr-1.5 size-3.5 text-[#FFFFFF]' />
          Analyse Globe
        </Button>
        {isReallocated ? (
          <Button
            size='sm'
            variant='outline'
            onClick={() => (onViewReceipt ? onViewReceipt(anomaly) : onMitigate?.(anomaly))}
            className='flex-1 text-xs font-mono h-8 border border-[#FFFFFF] bg-[#1A1A1A] hover:bg-[#000000] text-[#FFFFFF] font-semibold active:scale-[0.98]'
          >
            <Icons.check className='mr-1.5 size-3 text-[#FFFFFF]' />
            View Receipt
          </Button>
        ) : isMitigating ? (
          <Button
            size='sm'
            disabled
            className='flex-1 text-xs font-mono h-8 bg-[#8A8A8A] text-[#000000] font-semibold border-none cursor-not-allowed opacity-80'
          >
            <Icons.spinner className='mr-1.5 size-3 animate-spin text-[#000000]' />
            Analyzing...
          </Button>
        ) : (
          <Button
            size='sm'
            onClick={() => onMitigate?.(anomaly)}
            className='flex-1 text-xs font-mono h-8 bg-[#FFFFFF] hover:bg-[#8A8A8A] text-[#000000] font-semibold active:scale-[0.98] border-none'
          >
            <Icons.arrowRight className='mr-1.5 size-3 text-[#000000]' />
            Auto-Reallocate
          </Button>
        )}
      </div>
    </div>
  );
}
