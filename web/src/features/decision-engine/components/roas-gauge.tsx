'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PlatformLogo } from '@/components/icons/platform-logos';
import type { ProductStatus } from '@/lib/gauges-engine';

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
  maxRoas: maxRoasProp,
  healthScore = 75,
  status,
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
  const displayChannel = channel || platform || 'Omnichannel';
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

  // Map ROAS (0 to 5.0) to angle on semicircular arc (180deg to 0deg)
  const maxRoas = maxRoasProp || 5.0;
  const clampedRoas = Math.min(Math.max(currentRoas, 0), maxRoas);
  const percentage = paused ? 0.05 : clampedRoas / maxRoas;

  // Semicircle dimensions
  const radius = compact ? 45 : 62;
  const strokeWidth = compact ? 6 : 9;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage);

  // Status mapping & Color styling (white = healthy, amber = warning, red = critical, green = fixed)
  let arcStrokeColor = '#FFFFFF';
  let statusLabel = 'TARGET MET';
  let badgeClasses = 'bg-[#171717] text-white border-[#333333]';

  if (isFixed) {
    arcStrokeColor = '#10B981'; // Green
    statusLabel = 'FIXED';
    badgeClasses = 'bg-emerald-950/70 text-emerald-300 border-emerald-700/70 font-bold';
  } else if (effectiveStatus === 'stockout') {
    arcStrokeColor = '#EF4444'; // Red
    statusLabel = 'STOCKOUT';
    badgeClasses = 'bg-red-950/80 text-red-300 border-red-700/80 font-bold';
  } else if (effectiveStatus === 'below floor') {
    arcStrokeColor = '#EF4444'; // Red
    statusLabel = 'BELOW FLOOR';
    badgeClasses = 'bg-red-950/80 text-red-300 border-red-700/80 font-bold';
  } else if (effectiveStatus === 'low stock') {
    arcStrokeColor = '#F59E0B'; // Amber
    statusLabel = 'LOW STOCK';
    badgeClasses = 'bg-amber-950/80 text-amber-300 border-amber-700/80 font-semibold';
  } else if (effectiveStatus === 'below target') {
    arcStrokeColor = '#F59E0B'; // Amber
    statusLabel = 'BELOW TARGET';
    badgeClasses = 'bg-amber-950/80 text-amber-300 border-amber-700/80 font-semibold';
  } else {
    arcStrokeColor = '#FFFFFF'; // White
    statusLabel = 'TARGET MET';
    badgeClasses = 'bg-[#141414] text-white border-[#2E2E2E] font-medium';
  }

  // Health score badge styling
  const healthBadgeStyle = isFixed
    ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 font-bold'
    : healthScore >= 75
    ? 'text-white bg-[#171717] border border-[#2E2E2E] font-bold'
    : healthScore >= 50
    ? 'text-amber-300 bg-amber-950/40 border border-amber-800/50 font-medium'
    : 'text-red-300 bg-red-950/60 border border-red-800/60 font-bold';

  return (
    <div
      className={cn(
        'relative flex flex-col justify-between rounded-xl border border-[#222222] bg-[#0E0E0E] p-4 transition-all duration-200 hover:border-[#404040] hover:bg-[#121212] font-mono shadow-sm',
        className
      )}
    >
      {/* 1. PRODUCT + CHANNEL + STOCK & 2. HEALTH SCORE */}
      <div className='flex w-full items-start justify-between gap-2 border-b border-[#1A1A1A] pb-3 mb-2'>
        <div className='flex items-center gap-2.5 min-w-0'>
          {photoUrl ? (
            <div className='relative size-8 rounded bg-[#171717] overflow-hidden shrink-0 border border-[#222222]'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={displayName}
                className='size-full object-cover'
              />
            </div>
          ) : null}
          <div className='flex flex-col text-left min-w-0'>
            <span
              onClick={onAnalyze}
              className={cn(
                'text-xs font-semibold text-white truncate max-w-[150px]',
                onAnalyze && 'cursor-pointer hover:underline'
              )}
              title={displayName}
            >
              {displayName}
            </span>
            <span className='text-[10px] text-[#8A8A8A] uppercase tracking-wider truncate flex items-center gap-1.5 mt-0.5'>
              <PlatformLogo platform={displayChannel.toLowerCase()} size={11} className='shrink-0' />
              <span>{displayChannel}</span>
              <span>•</span>
              <span className={cn(inventory <= 0 ? 'text-red-400 font-bold' : 'text-[#A3A3A3]')}>
                {inventory <= 0 ? '0 in stock' : `${inventory} stock`}
              </span>
            </span>
          </div>
        </div>

        {/* 2. Health Score */}
        <div
          className={cn(
            'flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] shrink-0 font-bold',
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
            stroke='#1A1A1A'
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
              <span className='font-bold text-white tracking-wider text-base uppercase font-mono'>
                Paused
              </span>
              <span className='text-[10px] text-emerald-400 font-mono mt-0.5 truncate max-w-[130px]'>
                Restock: {restockUnitsOrdered ?? 0} units ordered
              </span>
            </div>
          ) : (
            <div className='flex flex-col items-center -mb-0.5'>
              <span className='font-bold tracking-tight text-white text-xl font-mono'>
                {currentRoas.toFixed(2)}x
              </span>
              <span className='text-[10px] text-[#8A8A8A] font-mono -mt-0.5'>
                ROAS
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4. SPEND/DAY + DAYS OF COVER */}
      <div className='mt-3 flex w-full items-center justify-between text-xs text-[#A3A3A3] font-mono px-0.5'>
        <span className='text-white font-medium'>
          ₹{dailySpend.toLocaleString('en-IN')}/day
        </span>
        <span className={cn(effectiveCoverDays < 7 ? 'text-amber-400 font-semibold' : 'text-[#8A8A8A]')}>
          {inventory <= 0 ? '0d cover' : `${effectiveCoverDays.toFixed(1)}d cover`}
        </span>
      </div>

      {/* 5. "1.8x floor · 3.2x target" */}
      <div className='mt-1.5 flex w-full items-center justify-center text-[10px] font-mono text-[#737373]'>
        <span>1.8x floor · 3.2x target</span>
      </div>

      {/* 6. STATUS BADGE */}
      <div className='mt-2.5 flex w-full items-center justify-center'>
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

      {/* 7. FIX BUTTON / VIEW FIX BUTTON */}
      <div className='mt-3 w-full pt-2.5 border-t border-[#1A1A1A]'>
        {isFixed ? (
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              onViewFix?.();
            }}
            className='w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-emerald-700/60 bg-emerald-950/30 text-emerald-300 font-mono text-xs font-semibold uppercase tracking-wider hover:bg-emerald-900/40 hover:border-emerald-600 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400'
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
            className='w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
          >
            <span>Fix</span>
          </button>
        ) : (
          <div className='w-full flex items-center justify-center py-1.5 text-[11px] text-[#737373] font-mono'>
            <span>Optimal Performance</span>
          </div>
        )}
      </div>
    </div>
  );
}
