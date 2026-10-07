'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PlatformLogo } from '@/components/icons/platform-logos';

interface RoasGaugeProps {
  currentRoas: number;
  targetRoas?: number;
  breakevenRoas?: number;
  healthScore?: number;
  campaignName?: string;
  productName?: string;
  photoUrl?: string;
  platform?: string;
  inventory?: number;
  className?: string;
  compact?: boolean;
  onAnalyze?: () => void;
  onFix?: () => void;
}

export function RoasGauge({
  currentRoas,
  targetRoas = 3.2,
  breakevenRoas = 1.8,
  healthScore = 75,
  campaignName,
  productName,
  photoUrl,
  platform,
  inventory,
  className,
  compact = false,
  onAnalyze,
  onFix
}: RoasGaugeProps) {
  // Map ROAS (0 to 5.0) to angle on semicircular arc (180deg to 0deg)
  const maxRoas = 5.0;
  const clampedRoas = Math.min(Math.max(currentRoas, 0), maxRoas);
  const percentage = clampedRoas / maxRoas;
  
  // Circumference for r=65: half circle length = PI * 65 = ~204
  const radius = compact ? 45 : 65;
  const strokeWidth = compact ? 6 : 10;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage);

  // Monochrome Status computation according to DESIGN.md
  const isStockout = inventory !== undefined && inventory <= 0;
  const isCritical = isStockout || currentRoas < breakevenRoas;
  const isWarning = !isCritical && currentRoas < targetRoas;

  let statusBadge = '● TARGET MET';
  let badgeVariant = 'border border-[#1A1A1A] text-[#FFFFFF] bg-[#1A1A1A] font-bold';

  if (isStockout) {
    statusBadge = '[CRITICAL] STOCKOUT';
    badgeVariant = 'border-none text-[#000000] bg-[#FFFFFF] font-bold';
  } else if (currentRoas < breakevenRoas) {
    statusBadge = '[CRITICAL] SUB-FLOOR';
    badgeVariant = 'border-none text-[#000000] bg-[#FFFFFF] font-bold';
  } else if (isWarning) {
    statusBadge = '○ [WARN] PROFITABLE';
    badgeVariant = 'border border-[#8A8A8A] text-[#FFFFFF] bg-[#1A1A1A] font-normal';
  }

  // Health score monochrome tag
  const healthBadgeStyle =
    healthScore >= 75
      ? 'text-[#FFFFFF] border border-[#1A1A1A] bg-[#1A1A1A] font-bold'
      : healthScore >= 50
      ? 'text-[#FFFFFF] border border-[#8A8A8A] bg-[#1A1A1A] font-medium'
      : 'text-[#000000] border-none bg-[#FFFFFF] font-bold';

  const arcStrokeColor = isCritical ? '#FFFFFF' : isWarning ? '#8A8A8A' : '#FFFFFF';

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-between rounded border border-[#8A8A8A] bg-[#1A1A1A] p-4 transition-all hover:border-[#FFFFFF] hover:bg-[#000000]',
        onAnalyze && 'cursor-pointer',
        className
      )}
      onClick={onAnalyze}
      title={onAnalyze ? 'Click to inspect product telemetry' : undefined}
    >
      {/* Header if campaign provided */}
      {campaignName && (
        <div className='flex w-full items-center justify-between gap-2 border-b border-[#8A8A8A]/40 pb-2 mb-2'>
          <div className='flex items-center gap-2 min-w-0'>
            {photoUrl && (
              <div className='relative size-7 rounded border border-[#8A8A8A] bg-[#000000] overflow-hidden shrink-0'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl} alt={productName || campaignName} className='size-full object-cover' />
              </div>
            )}
            <div className='flex flex-col text-left min-w-0'>
              <span className='text-xs font-semibold text-[#FFFFFF] font-mono truncate max-w-[140px]'>
                {productName || campaignName}
              </span>
              <span className='text-[10px] text-[#8A8A8A] uppercase tracking-wider font-mono truncate max-w-[140px] flex items-center gap-1.5'>
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
          {/* Background Track: #1A1A1A */}
          <path
            d={`M ${strokeWidth} ${radius + strokeWidth} A ${radius} ${radius} 0 0 1 ${
              radius * 2 + strokeWidth
            } ${radius + strokeWidth}`}
            fill='none'
            stroke='#000000'
            strokeWidth={strokeWidth}
            strokeLinecap='round'
          />

          {/* Break-even Marker Line (Floor / Threshold Target: dotted #8A8A8A) */}
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
                stroke='#8A8A8A'
                strokeWidth='1'
                strokeDasharray='2 2'
              />
            );
          })()}

          {/* Target Marker Line (Baseline: dashed #8A8A8A) */}
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
                stroke='#8A8A8A'
                strokeWidth='1.5'
                strokeDasharray='4 4'
              />
            );
          })()}

          {/* Active Arc Value: Solid #FFFFFF or #8A8A8A */}
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

        {/* Center ROAS readout: Monochrome */}
        <div className='absolute bottom-0 flex flex-col items-center'>
          <span className={cn('font-mono font-bold tracking-tight text-[#FFFFFF]', compact ? 'text-lg' : 'text-2xl')}>
            {currentRoas.toFixed(2)}x
          </span>
          <span className='text-[10px] text-[#8A8A8A] font-mono -mt-0.5'>ROAS</span>
        </div>
      </div>

      {/* Footer Markers & Status Badge */}
      <div className='mt-2 flex w-full items-center justify-between text-[10px] font-mono text-[#8A8A8A]'>
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
        <div className='mt-3 w-full pt-2 border-t border-[#8A8A8A]/30'>
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              onFix?.();
            }}
            className='w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-[#FFFFFF] text-[#000000] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#8A8A8A] hover:text-[#FFFFFF] transition-all shadow-sm'
          >
            <span>Fix</span>
          </button>
        </div>
      )}
    </div>
  );
}
