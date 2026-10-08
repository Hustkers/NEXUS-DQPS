'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PlatformLogo } from '@/components/icons/platform-logos';
import {
  formatCurrency,
  getChannelMeta,
  getProductFooterSummary,
  type ProductStatus,
} from '@/lib/gauges-engine';

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
  dailySpend = 2500,
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

  // Semicircle dimensions
  const radius = compact ? 45 : 62;
  const strokeWidth = compact ? 6 : 9;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage);

  // Status mapping & Color styling (white = healthy, amber = warning, red = critical, green = fixed)
  let arcStrokeColor = '#FAFAFA';
  let statusLabel = 'TARGET MET';
  let badgeClasses = 'bg-zinc-900 text-zinc-200 border-zinc-800';

  if (isFixed) {
    arcStrokeColor = '#10B981'; // Green
    statusLabel = 'FIXED';
    badgeClasses = 'bg-zinc-900 text-emerald-400 border-zinc-800 font-medium';
  } else if (effectiveStatus === 'stockout') {
    arcStrokeColor = '#EF4444'; // Red
    statusLabel = 'STOCKOUT';
    badgeClasses = 'bg-zinc-900 text-red-400 border-zinc-800 font-medium';
  } else if (effectiveStatus === 'below floor') {
    arcStrokeColor = '#EF4444'; // Red
    statusLabel = 'BELOW FLOOR';
    badgeClasses = 'bg-zinc-900 text-red-400 border-zinc-800 font-medium';
  } else if (effectiveStatus === 'low stock') {
    arcStrokeColor = '#F59E0B'; // Amber
    statusLabel = 'LOW STOCK';
    badgeClasses = 'bg-zinc-900 text-amber-400 border-zinc-800 font-medium';
  } else if (effectiveStatus === 'below target') {
    arcStrokeColor = '#F59E0B'; // Amber
    statusLabel = 'BELOW TARGET';
    badgeClasses = 'bg-zinc-900 text-amber-400 border-zinc-800 font-medium';
  } else {
    arcStrokeColor = '#FAFAFA'; // Neutral light
    statusLabel = 'TARGET MET';
    badgeClasses = 'bg-zinc-900 text-zinc-300 border-zinc-800 font-medium';
  }

  // Health score badge styling
  const healthBadgeStyle = isFixed
    ? 'text-emerald-400 bg-zinc-900 border border-zinc-800 font-mono font-medium'
    : healthScore >= 75
    ? 'text-zinc-200 bg-zinc-900 border border-zinc-800 font-mono font-medium'
    : healthScore >= 50
    ? 'text-amber-400 bg-zinc-900 border border-zinc-800 font-mono font-medium'
    : 'text-red-400 bg-zinc-900 border border-zinc-800 font-mono font-medium';

  return (
    <div
      className={cn(
        'relative flex flex-col justify-between rounded-xl border border-[#27272a] bg-[#121215] p-4 transition-all duration-200 hover:border-zinc-700 hover:bg-[#18181b] shadow-sm min-h-[380px] min-w-0 font-sans',
        className
      )}
    >
      {/* 1. PRODUCT + CHANNEL + STOCK & 2. HEALTH SCORE */}
      <div className='flex w-full items-start justify-between gap-2 border-b border-[#27272a] pb-3 mb-1'>
        <div className='flex items-start gap-2.5 min-w-0'>
          {photoUrl ? (
            <div className='relative size-8 rounded bg-zinc-900 overflow-hidden shrink-0 border border-zinc-800 mt-0.5'>
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
                'text-xs font-semibold text-zinc-100 line-clamp-2 leading-snug min-h-[2rem] text-left font-sans',
                onAnalyze && 'cursor-pointer hover:underline'
              )}
              title={displayName}
            >
              {displayName}
            </button>
            <div className='flex items-center gap-1.5 mt-1 text-[10px] text-zinc-400 flex-wrap'>
              <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium font-sans', channelMeta.badgeBg, channelMeta.badgeBorder, channelMeta.badgeText)}>
                <PlatformLogo platform={channelMeta.name.toLowerCase()} size={11} className='shrink-0' />
                <span>{channelMeta.name}</span>
              </span>
              <span className='text-zinc-600'>•</span>
              <span className={cn('whitespace-nowrap font-mono tabular-nums text-[10px]', inventory <= 0 ? 'text-red-400 font-medium' : 'text-zinc-400')}>
                {inventory <= 0 ? '0 in stock' : `${inventory} in stock`}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Health Score */}
        <div
          className={cn(
            'flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] shrink-0 font-mono tabular-nums',
            healthBadgeStyle
          )}
          title={`Health Score: ${healthScore}/100`}
        >
          <span className='text-[9px] opacity-70'>HS</span>
          <span>{healthScore}</span>
        </div>
      </div>

      {/* 3. SEMICIRCLE SVG GAUGE WITH NEEDLE INDICATOR */}
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
            className='text-zinc-800'
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
                stroke='#71717a'
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
                stroke='#a1a1aa'
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

          {/* SVG Needle Pointer Indicator */}
          {(() => {
            const activeAngle = Math.PI * (1 - percentage);
            const cx = radius + strokeWidth;
            const cy = radius + strokeWidth;
            // Needle points from hub to inside arc rim
            const needleLength = radius - 8;
            const tipX = cx + needleLength * Math.cos(activeAngle);
            const tipY = cy - needleLength * Math.sin(activeAngle);
            return (
              <g className='transition-all duration-700 ease-out'>
                <line
                  x1={cx}
                  y1={cy}
                  x2={tipX}
                  y2={tipY}
                  stroke='#fafafa'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r='3'
                  fill='#18181b'
                  stroke='#fafafa'
                  strokeWidth='1.5'
                />
              </g>
            );
          })()}
        </svg>

        {/* Center Readout: Paused or ROAS */}
        <div className='absolute bottom-0 flex flex-col items-center justify-center text-center'>
          {paused ? (
            <div className='flex flex-col items-center -mb-1'>
              <span className='font-semibold text-zinc-100 tracking-wider text-sm uppercase font-sans'>
                Paused
              </span>
              <span className='text-[10px] text-emerald-400 font-mono tabular-nums mt-0.5 truncate max-w-[140px]'>
                Restock: {restockUnitsOrdered ?? 0} units ordered
              </span>
            </div>
          ) : (
            <div className='flex flex-col items-center -mb-0.5'>
              <span className='font-bold tracking-tight text-zinc-100 text-xl font-mono tabular-nums'>
                {currentRoas.toFixed(2)}x
              </span>
              <span className='text-[10px] text-zinc-400 font-mono -mt-0.5'>
                ROAS (0–6x)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4. SPEND/DAY + DAYS OF COVER */}
      <div className='mt-3 flex w-full items-center justify-between text-xs px-0.5 font-mono tabular-nums'>
        <span className='text-zinc-100 font-medium'>
          {formatCurrency(dailySpend)}
        </span>
        <span className={cn(effectiveCoverDays < 7 ? 'text-amber-400 font-medium' : 'text-zinc-400')}>
          {inventory <= 0 ? '0d cover' : `${effectiveCoverDays.toFixed(1)}d cover`}
        </span>
      </div>

      {/* 5. "1.8x floor · 3.2x target" */}
      <div className='mt-1 flex w-full items-center justify-center text-[10px] font-mono text-zinc-500'>
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
        <p className='text-[11px] text-zinc-400 truncate font-sans' title={effectiveFooterSummary}>
          {effectiveFooterSummary}
        </p>
      </div>

      {/* 7. FIX BUTTON / VIEW FIX BUTTON */}
      <div className='mt-2.5 w-full pt-2 border-t border-[#27272a]'>
        {isFixed ? (
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              onViewFix?.();
            }}
            className='w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-sans text-xs font-medium uppercase tracking-wider hover:bg-emerald-500/20 active:scale-[0.97] transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400'
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
            className='w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-zinc-100 text-zinc-900 font-sans text-xs font-semibold uppercase tracking-wider hover:bg-white active:scale-[0.97] transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400'
          >
            <span>Fix</span>
          </button>
        ) : (
          <div className='w-full flex items-center justify-center py-1.5 text-[11px] text-emerald-400/80 font-sans'>
            <span>● Healthy Pacing</span>
          </div>
        )}
      </div>
    </div>
  );
}
