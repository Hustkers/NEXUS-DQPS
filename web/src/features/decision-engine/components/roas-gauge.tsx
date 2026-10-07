'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PlatformLogo } from '@/components/icons/platform-logos';
import {
  formatINR,
  getChannelMeta,
  type ProductStatus,
} from '@/lib/gauges-engine';
import { useTheme } from 'next-themes';

interface RoasGaugeProps {
  productName?: string;
  channel?: string;
  platform?: string;
  inventory?: number;
  coverDays?: number;
  dailySpend?: number;
  currentRoas: number;
  targetRoas?: number;
  breakevenRoas?: number;
  maxRoas?: number;
  healthScore?: number;
  status?: ProductStatus;
  footerSummary?: string;
  isFixed?: boolean;
  paused?: boolean;
  restockUnitsOrdered?: number;
  photoUrl?: string;
  campaignName?: string;
  className?: string;
  compact?: boolean;
  onAnalyze?: () => void;
  onFix?: () => void;
  onViewFix?: () => void;
}

export function RoasGauge({
  productName,
  channel,
  platform,
  inventory = 0,
  coverDays,
  dailySpend = 25000,
  currentRoas,
  targetRoas = 3.2,
  breakevenRoas = 1.8,
  maxRoas: maxRoasProp = 6.0,
  healthScore = 75,
  status,
  isFixed = false,
  paused = false,
  restockUnitsOrdered,
  photoUrl,
  campaignName,
  className,
  onAnalyze,
  onFix,
  onViewFix,
}: RoasGaugeProps) {
  const displayChannel = channel || platform || 'Meta';
  const channelMeta = getChannelMeta(displayChannel);
  const displayName = productName || campaignName || 'Product Campaign';
  const effectiveCoverDays = coverDays !== undefined ? coverDays : inventory > 0 ? 14 : 0;

  // Compute default status if not explicitly passed
  let effectiveStatus: ProductStatus = status || 'target met';
  if (!status) {
    if (inventory <= 0) {
      effectiveStatus = 'stockout';
    } else if (effectiveCoverDays < 7) {
      effectiveStatus = 'low stock';
    } else if (currentRoas < breakevenRoas) {
      effectiveStatus = 'below floor';
    } else if (currentRoas < targetRoas) {
      effectiveStatus = 'below target';
    } else {
      effectiveStatus = 'target met';
    }
  }

  // Gauge scale 0–6x, clamped
  const maxRoas = maxRoasProp || 6.0;
  const clampedRoas = Math.min(Math.max(currentRoas, 0), maxRoas);
  const percentage = paused ? 0.05 : clampedRoas / maxRoas;

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== 'light';

  // Compact Semicircle Dimensions (~45% smaller than original)
  const radius = 36;
  const strokeWidth = 6;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage);

  // Status mapping & Color styling
  let arcStrokeColor = isDark ? '#FFFFFF' : '#18181b';
  let statusBadgeClasses = 'bg-muted/60 text-muted-foreground border-border';
  let statusLabel = 'TARGET MET';
  let isProblematic = false;

  if (isFixed) {
    arcStrokeColor = '#10B981';
    statusLabel = 'FIXED';
    statusBadgeClasses = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold';
  } else if (effectiveStatus === 'stockout') {
    arcStrokeColor = '#EF4444';
    statusLabel = 'STOCKOUT';
    statusBadgeClasses = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold';
    isProblematic = true;
  } else if (effectiveStatus === 'below floor') {
    arcStrokeColor = '#EF4444';
    statusLabel = 'BELOW FLOOR';
    statusBadgeClasses = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold';
    isProblematic = true;
  } else if (effectiveStatus === 'low stock') {
    arcStrokeColor = '#F59E0B';
    statusLabel = 'LOW STOCK';
    statusBadgeClasses = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold';
    isProblematic = true;
  } else if (effectiveStatus === 'below target') {
    arcStrokeColor = '#F59E0B';
    statusLabel = 'BELOW TARGET';
    statusBadgeClasses = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold';
    isProblematic = true;
  } else {
    arcStrokeColor = isDark ? '#10B981' : '#059669';
    statusLabel = 'TARGET MET';
    statusBadgeClasses = 'bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-semibold';
  }

  // Health score badge styling
  const healthBadgeStyle = isFixed
    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    : healthScore >= 90
    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    : healthScore >= 60
    ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30'
    : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30';

  return (
    <div
      onClick={onAnalyze}
      className={cn(
        'group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-3.5 transition-all duration-200 hover:border-foreground/40 hover:shadow-md font-mono text-card-foreground cursor-pointer select-none',
        isProblematic && !isFixed && 'border-rose-500/30 bg-rose-500/[0.015] hover:border-rose-500/60',
        isFixed && 'border-emerald-500/30 bg-emerald-500/[0.015]',
        className
      )}
    >
      {/* 1. COMPACT HEADER: Product Name + Platform + Stock & Health Score */}
      <div className='flex items-start justify-between gap-2 border-b border-border/50 pb-2.5'>
        <div className='flex items-start gap-2 min-w-0'>
          {photoUrl ? (
            <div className='relative size-7 rounded bg-muted/40 overflow-hidden shrink-0 border border-border mt-0.5'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={displayName}
                className='size-full object-cover'
              />
            </div>
          ) : null}
          <div className='flex flex-col min-w-0'>
            <span
              className='text-xs font-bold text-foreground truncate max-w-[170px] sm:max-w-[190px] leading-tight group-hover:text-primary transition-colors'
              title={displayName}
            >
              {displayName}
            </span>
            <div className='flex items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground'>
              <span className='inline-flex items-center gap-1 font-semibold text-foreground/80'>
                <PlatformLogo platform={channelMeta.name.toLowerCase()} size={10} className='shrink-0' />
                <span className='uppercase'>{channelMeta.name}</span>
              </span>
              <span>•</span>
              <span className={cn('font-medium', inventory <= 0 ? 'text-rose-500 font-bold' : 'text-muted-foreground')}>
                {inventory <= 0 ? '0 stock' : `${inventory} stock`}
              </span>
            </div>
          </div>
        </div>

        {/* Health Score Pill */}
        <div
          className={cn(
            'flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] shrink-0 font-bold border',
            healthBadgeStyle
          )}
          title={`Health Score: ${healthScore}/100`}
        >
          <span className='text-[9px] opacity-70'>HS</span>
          <span>{healthScore}</span>
        </div>
      </div>

      {/* 2. COMPACT SEMICIRCLE SVG GAUGE (Center) */}
      <div className='relative flex flex-col items-center justify-center my-1.5'>
        <svg
          width={radius * 2 + strokeWidth * 2}
          height={radius + strokeWidth + 4}
          className='overflow-visible'
        >
          {/* Background Track */}
          <path
            d={`M ${strokeWidth} ${radius + strokeWidth} A ${radius} ${radius} 0 0 1 ${
              radius * 2 + strokeWidth
            } ${radius + strokeWidth}`}
            fill='none'
            stroke='currentColor'
            className='text-muted/40 dark:text-muted/60'
            strokeWidth={strokeWidth}
            strokeLinecap='round'
          />

          {/* Break-even Floor Marker Line (1.8x) */}
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
                stroke='#737373'
                strokeWidth='1'
                strokeDasharray='1.5 1.5'
              />
            );
          })()}

          {/* Target Marker Line (3.2x) */}
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
                stroke='#A3A3A3'
                strokeWidth='1.2'
                strokeDasharray='2 2'
              />
            );
          })()}

          {/* Active Arc */}
          <path
            d={`M ${strokeWidth} ${radius + strokeWidth} A ${radius} ${radius} 0 0 1 ${
              radius * 2 + strokeWidth
            } ${radius + strokeWidth}`}
            fill='none'
            stroke={arcStrokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className='transition-all duration-700 ease-out'
            strokeLinecap='round'
          />
        </svg>

        {/* Center Readout: ROAS or Paused */}
        <div className='absolute bottom-0 flex flex-col items-center justify-center text-center'>
          {paused ? (
            <div className='flex flex-col items-center'>
              <span className='font-bold text-foreground text-sm uppercase font-mono tracking-wider'>
                Paused
              </span>
              <span className='text-[9px] text-emerald-500 font-mono'>
                +{restockUnitsOrdered ?? 0} ordered
              </span>
            </div>
          ) : (
            <div className='flex flex-col items-center'>
              <span className='font-extrabold tracking-tight text-foreground text-base sm:text-lg font-mono'>
                {currentRoas.toFixed(2)}x
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. METRICS ROW: Spend & Cover Days */}
      <div className='flex w-full items-center justify-between text-[11px] text-muted-foreground font-mono pt-1'>
        <span className='text-foreground font-medium'>
          {formatINR(dailySpend)}/d
        </span>
        <span className={cn('font-semibold', effectiveCoverDays < 7 ? 'text-amber-500' : 'text-muted-foreground')}>
          {inventory <= 0 ? '0d cover' : `${effectiveCoverDays.toFixed(1)}d cover`}
        </span>
      </div>

      {/* 4. COMPACT STATUS & ACTION ROW */}
      <div className='mt-2.5 flex w-full items-center justify-between gap-2 pt-2 border-t border-border/50'>
        {/* Status indicator on the left */}
        <Badge
          variant='outline'
          className={cn(
            'text-[9px] py-0.5 px-1.5 uppercase font-mono tracking-wider border rounded shrink-0',
            statusBadgeClasses
          )}
        >
          {statusLabel}
        </Badge>

        {/* Action on the right: only prominent if problematic */}
        <div className='shrink-0' onClick={(e) => e.stopPropagation()}>
          {isFixed ? (
            <button
              type='button'
              onClick={onViewFix}
              className='px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 active:scale-[0.96] transition-all cursor-pointer'
            >
              View fix
            </button>
          ) : isProblematic ? (
            <button
              type='button'
              onClick={onFix}
              className='px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-foreground text-background hover:bg-foreground/90 active:scale-[0.96] transition-all shadow-xs cursor-pointer'
            >
              Fix →
            </button>
          ) : (
            <span className='text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1'>
              <span className='size-1.5 rounded-full bg-emerald-500' />
              Healthy
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
