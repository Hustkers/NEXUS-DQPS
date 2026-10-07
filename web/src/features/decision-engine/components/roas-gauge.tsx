'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PlatformLogo } from '@/components/icons/platform-logos';
import { cn } from '@/lib/utils';

interface RoasGaugeProps {
  currentRoas: number;
  targetRoas?: number;
  breakevenRoas?: number;
  maxRoas?: number;
  healthScore?: number;
  campaignName?: string;
  productName?: string;
  photoUrl?: string;
  platform?: string;
  inventory?: number;
  compact?: boolean;
  className?: string;
  onAnalyze?: () => void;
  onFix?: () => void;
}

export function RoasGauge({
  currentRoas,
  targetRoas = 3.2,
  breakevenRoas = 1.8,
  maxRoas = 6.0,
  healthScore = 85,
  campaignName,
  productName,
  photoUrl,
  platform,
  inventory,
  compact = false,
  className,
  onAnalyze,
  onFix
}: RoasGaugeProps) {
  const radius = compact ? 42 : 58;
  const strokeWidth = compact ? 7 : 9;
  const circumference = Math.PI * radius;

  // Clamp ROAS between 0 and maxRoas
  const clampedRoas = Math.min(Math.max(currentRoas, 0), maxRoas);
  const progressRatio = clampedRoas / maxRoas;
  const strokeDashoffset = circumference * (1 - progressRatio);

  // Status computation
  const isStockout = inventory !== undefined && inventory <= 0;
  const isCritical = isStockout || currentRoas < breakevenRoas;
  const isWarning = !isCritical && currentRoas < targetRoas;

  let statusBadge = '● TARGET MET';
  let badgeVariant = 'border-border text-foreground bg-muted/60 font-semibold';

  if (isStockout) {
    statusBadge = '[CRITICAL] STOCKOUT';
    badgeVariant = 'border-none text-white bg-rose-500 font-bold';
  } else if (currentRoas < breakevenRoas) {
    statusBadge = '[CRITICAL] SUB-FLOOR';
    badgeVariant = 'border-none text-white bg-rose-500 font-bold';
  } else if (isWarning) {
    statusBadge = '○ [WARN] PROFITABLE';
    badgeVariant = 'border-border text-muted-foreground bg-muted/40 font-normal';
  }

  // Health score tag style
  const healthBadgeStyle =
    healthScore >= 75
      ? 'text-foreground bg-muted font-bold border border-border'
      : healthScore >= 50
      ? 'text-muted-foreground bg-muted/60 font-medium border border-border'
      : 'text-white border-none bg-rose-500 font-bold';

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-between rounded border border-border bg-card p-4 transition-all hover:border-foreground/30 hover:bg-muted/20 text-card-foreground',
        onAnalyze && 'cursor-pointer',
        className
      )}
      onClick={onAnalyze}
      title={onAnalyze ? 'Click to inspect product telemetry' : undefined}
    >
      {/* Header if campaign provided */}
      {campaignName && (
        <div className='flex w-full items-center justify-between gap-2 border-b border-border pb-2 mb-2'>
          <div className='flex items-center gap-2 min-w-0'>
            {photoUrl && (
              <div className='relative size-7 rounded bg-muted/60 border border-border overflow-hidden shrink-0'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl} alt={productName || campaignName} className='size-full object-cover' />
              </div>
            )}
            <div className='flex flex-col text-left min-w-0'>
              <span className='text-xs font-semibold text-foreground font-mono truncate max-w-[140px]'>
                {productName || campaignName}
              </span>
              <span className='text-[10px] text-muted-foreground uppercase tracking-wider font-mono truncate max-w-[140px] flex items-center gap-1.5'>
                {platform && <PlatformLogo platform={platform} size={12} className='shrink-0' />}
                <span>{platform || 'Omnichannel'} • Inv: {inventory ?? 'N/A'}</span>
              </span>
            </div>
          </div>
          <div
            className={cn(
              'flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono shrink-0',
              healthBadgeStyle
            )}
            title={`Campaign Health Score: ${healthScore}/100`}
          >
            <span>HS</span>
            <span>{healthScore}</span>
          </div>
        </div>
      )}

      {/* SVG Semicircle Gauge */}
      <div className='relative flex items-center justify-center my-1'>
        <svg
          width={radius * 2 + strokeWidth * 2}
          height={radius + strokeWidth + 8}
          className='overflow-visible'
        >
          {/* Background Track */}
          <path
            d={`M ${strokeWidth} ${radius + strokeWidth} A ${radius} ${radius} 0 0 1 ${
              radius * 2 + strokeWidth
            } ${radius + strokeWidth}`}
            fill='none'
            stroke='currentColor'
            className='opacity-15 dark:opacity-20'
            strokeWidth={strokeWidth}
            strokeLinecap='round'
          />

          {/* Break-even Marker Line */}
          {(() => {
            const beRatio = breakevenRoas / maxRoas;
            const beAngle = Math.PI * (1 - beRatio);
            const cx = radius + strokeWidth;
            const cy = radius + strokeWidth;
            const x1 = cx + (radius - strokeWidth / 2) * Math.cos(beAngle);
            const y1 = cy - (radius - strokeWidth / 2) * Math.sin(beAngle);
            const x2 = cx + (radius + strokeWidth / 2) * Math.cos(beAngle);
            const y2 = cy - (radius + strokeWidth / 2) * Math.sin(beAngle);
            return (
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke='currentColor'
                className='opacity-40'
                strokeWidth='1'
                strokeDasharray='2 2'
              />
            );
          })()}

          {/* Target Marker Line */}
          {(() => {
            const tgRatio = targetRoas / maxRoas;
            const tgAngle = Math.PI * (1 - tgRatio);
            const cx = radius + strokeWidth;
            const cy = radius + strokeWidth;
            const x1 = cx + (radius - strokeWidth / 2) * Math.cos(tgAngle);
            const y1 = cy - (radius - strokeWidth / 2) * Math.sin(tgAngle);
            const x2 = cx + (radius + strokeWidth / 2) * Math.cos(tgAngle);
            const y2 = cy - (radius + strokeWidth / 2) * Math.sin(tgAngle);
            return (
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke='currentColor'
                className='opacity-60'
                strokeWidth='1.5'
                strokeDasharray='4 4'
              />
            );
          })()}

          {/* Active Arc Value */}
          <path
            d={`M ${strokeWidth} ${radius + strokeWidth} A ${radius} ${radius} 0 0 1 ${
              radius * 2 + strokeWidth
            } ${radius + strokeWidth}`}
            fill='none'
            stroke={isCritical ? '#f43f5e' : isWarning ? '#f59e0b' : 'currentColor'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className='transition-all duration-700 ease-out'
            strokeLinecap='round'
          />
        </svg>

        {/* Center ROAS readout */}
        <div className='absolute bottom-0 flex flex-col items-center'>
          <span className={cn('font-mono font-bold tracking-tight text-foreground', compact ? 'text-lg' : 'text-2xl')}>
            {currentRoas.toFixed(2)}x
          </span>
          <span className='text-[10px] text-muted-foreground font-mono -mt-0.5'>ROAS</span>
        </div>
      </div>

      {/* Footer Markers & Status Badge */}
      <div className='mt-2 flex w-full items-center justify-between text-[10px] font-mono text-muted-foreground'>
        <div className='flex items-center gap-1.5'>
          <span>Floor {breakevenRoas.toFixed(1)}x</span>
          <span>•</span>
          <span>Target {targetRoas.toFixed(1)}x</span>
        </div>
        <Badge variant='outline' className={cn('text-[9px] py-0 px-1 font-mono tracking-wider', badgeVariant)}>
          {statusBadge}
        </Badge>
      </div>

      {/* Stockout Fix Button */}
      {isStockout && (
        <div className='mt-3 w-full pt-2 border-t border-border'>
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              onFix?.();
            }}
            className='w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider hover:bg-foreground/90 transition-all shadow-sm'
          >
            <span>Fix</span>
          </button>
        </div>
      )}
    </div>
  );
}
