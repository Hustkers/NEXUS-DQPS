'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PlatformLogo } from '@/components/icons/platform-logos';
import {
  formatINR,
  getChannelMeta,
  getProductFooterSummary,
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
  footerSummary,
  isFixed = false,
  paused = false,
  restockUnitsOrdered,
  photoUrl,
  campaignName,
  className,
  compact = false,
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

  // Derive footer summary if not explicitly provided
  const effectiveFooterSummary =
    footerSummary ||
    getProductFooterSummary(
      effectiveStatus,
      dailySpend,
      effectiveCoverDays,
      currentRoas,
      isFixed,
      paused,
      restockUnitsOrdered
    );

  // Gauge scale 0–6x, clamped
  const maxRoas = maxRoasProp || 6.0;
  const clampedRoas = Math.min(Math.max(currentRoas, 0), maxRoas);
  const percentage = paused ? 0.05 : clampedRoas / maxRoas;

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== 'light';

  // Semicircle dimensions
  const radius = compact ? 45 : 62;
  const strokeWidth = compact ? 6 : 9;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage);

  // Status mapping & Color styling (theme-adaptive for healthy, amber = warning, red = critical, green = fixed)
  let arcStrokeColor = isDark ? '#FFFFFF' : '#18181b';
  let statusLabel = 'TARGET MET';
  let badgeClasses = 'bg-muted text-foreground border-border font-medium';

  if (isFixed) {
    arcStrokeColor = '#10B981'; // Green
    statusLabel = 'FIXED';
    badgeClasses = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold';
  } else if (effectiveStatus === 'stockout') {
    arcStrokeColor = '#EF4444'; // Red
    statusLabel = 'STOCKOUT';
    badgeClasses = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold';
  } else if (effectiveStatus === 'below floor') {
    arcStrokeColor = '#EF4444'; // Red
    statusLabel = 'BELOW FLOOR';
    badgeClasses = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold';
  } else if (effectiveStatus === 'low stock') {
    arcStrokeColor = '#F59E0B'; // Amber
    statusLabel = 'LOW STOCK';
    badgeClasses = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold';
  } else if (effectiveStatus === 'below target') {
    arcStrokeColor = '#F59E0B'; // Amber
    statusLabel = 'BELOW TARGET';
    badgeClasses = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold';
  } else {
    arcStrokeColor = isDark ? '#FFFFFF' : '#18181b';
    statusLabel = 'TARGET MET';
    badgeClasses = 'bg-muted text-foreground border-border font-medium';
  }

  // Health score badge styling
  const healthBadgeStyle = isFixed
    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 font-bold'
    : healthScore >= 75
    ? 'text-foreground bg-muted border border-border font-bold'
    : healthScore >= 50
    ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 font-medium'
    : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/30 font-bold';

  return (
    <div
      className={cn(
        'relative flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-foreground/30 font-mono shadow-xs min-h-[380px] min-w-0 text-card-foreground',
        className
      )}
    >
      {/* 1. PRODUCT + CHANNEL + STOCK & 2. HEALTH SCORE */}
      <div className='flex w-full items-start justify-between gap-2 border-b border-border pb-3 mb-1'>
        <div className='flex items-start gap-2.5 min-w-0'>
          {photoUrl ? (
            <div className='relative size-8 rounded bg-muted/40 overflow-hidden shrink-0 border border-border mt-0.5'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={displayName}
                className='size-full object-cover'
              />
            </div>
          ) : null}
          <div className='flex flex-col text-left min-w-0'>
            <button
              type='button'
              onClick={onAnalyze}
              className={cn(
                'text-xs font-semibold text-foreground line-clamp-2 leading-snug min-h-[2rem] text-left',
                onAnalyze && 'cursor-pointer hover:underline'
              )}
              title={displayName}
            >
              {displayName}
            </button>
            <div className='flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground flex-wrap'>
              <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-semibold', channelMeta.badgeBg, channelMeta.badgeBorder, channelMeta.badgeText)}>
                <PlatformLogo platform={channelMeta.name.toLowerCase()} size={11} className='shrink-0' />
                <span>{channelMeta.name}</span>
              </span>
              <span>•</span>
              <span className={cn('whitespace-nowrap font-medium', inventory <= 0 ? 'text-rose-500 font-bold' : 'text-foreground')}>
                {inventory <= 0 ? '0 in stock' : `${inventory} in stock`}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Health Score */}
        <div
          className={cn(
            'flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] shrink-0 font-bold',
            healthBadgeStyle
          )}
          title={`Health Score: ${healthScore}/100`}
        >
          <span className='text-[9px] opacity-70'>HS</span>
          <span>{healthScore}</span>
        </div>
      </div>

      {/* 3. SEMICIRCLE SVG GAUGE (white = healthy, amber = warning, red = critical, green = fixed) */}
      <div className='relative flex flex-col items-center justify-center my-2'>
        <svg
          width={radius * 2 + strokeWidth * 2}
          height={radius + strokeWidth + 6}
          className='overflow-visible'
        >
          {/* Background Track */}
          <path
            d={`M ${strokeWidth} ${radius + strokeWidth} A ${radius} ${radius} 0 0 1 ${
              radius * 2 + strokeWidth
            } ${radius + strokeWidth}`}
            fill='none'
            stroke='currentColor'
            className='text-muted/60 dark:text-muted/80'
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
                strokeWidth='1.2'
                strokeDasharray='2 2'
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
                strokeWidth='1.5'
                strokeDasharray='3 3'
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

        {/* Center Readout: Paused or ROAS */}
        <div className='absolute bottom-0 flex flex-col items-center justify-center text-center'>
          {paused ? (
            <div className='flex flex-col items-center -mb-1'>
              <span className='font-bold text-foreground tracking-wider text-base uppercase font-mono'>
                Paused
              </span>
              <span className='text-[10px] text-emerald-400 font-mono mt-0.5 truncate max-w-[140px]'>
                Restock: {restockUnitsOrdered ?? 0} units ordered
              </span>
            </div>
          ) : (
            <div className='flex flex-col items-center -mb-0.5'>
              <span className='font-bold tracking-tight text-foreground text-xl font-mono'>
                {currentRoas.toFixed(2)}x
              </span>
              <span className='text-[10px] text-muted-foreground font-mono -mt-0.5'>
                ROAS (0–6x)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4. SPEND/DAY + DAYS OF COVER */}
      <div className='mt-3 flex w-full items-center justify-between text-xs text-muted-foreground font-mono px-0.5'>
        <span className='text-foreground font-medium'>
          {formatINR(dailySpend)}
        </span>
        <span className={cn(effectiveCoverDays < 7 ? 'text-amber-500 font-semibold' : 'text-muted-foreground')}>
          {inventory <= 0 ? '0d cover' : `${effectiveCoverDays.toFixed(1)}d cover`}
        </span>
      </div>

      {/* 5. "1.8x floor · 3.2x target" */}
      <div className='mt-1 flex w-full items-center justify-center text-[10px] font-mono text-muted-foreground'>
        <span>1.8x floor · 3.2x target</span>
      </div>

      {/* 6. STATUS BADGE */}
      <div className='mt-2 flex w-full items-center justify-center'>
        <Badge
          variant='outline'
          className={cn(
            'text-[10px] py-0.5 px-2.5 uppercase font-mono tracking-wider border rounded-md',
            badgeClasses
          )}
        >
          {statusLabel}
        </Badge>
      </div>

      {/* Real One-Line Data-Driven Footer Summary */}
      <div className='mt-2 w-full text-center px-1'>
        <p className='text-[11px] text-muted-foreground truncate font-mono' title={effectiveFooterSummary}>
          {effectiveFooterSummary}
        </p>
      </div>

      {/* 7. FIX BUTTON / VIEW FIX BUTTON */}
      <div className='mt-2.5 w-full pt-2 border-t border-border'>
        {isFixed ? (
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              onViewFix?.();
            }}
            className='w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-semibold uppercase tracking-wider hover:bg-emerald-500/20 active:scale-[0.97] transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400'
          >
            <span>View fix</span>
          </button>
        ) : effectiveStatus !== 'target met' ? (
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              onFix?.();
            }}
            className='w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold uppercase tracking-wider shadow-xs hover:brightness-110 active:brightness-95 active:scale-[0.97] transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
          >
            <span>Fix</span>
          </button>
        ) : (
          <div className='w-full flex items-center justify-center py-1.5 text-[11px] text-emerald-400/80 font-mono'>
            <span>● Healthy Pacing</span>
          </div>
        )}
      </div>
    </div>
  );
}
