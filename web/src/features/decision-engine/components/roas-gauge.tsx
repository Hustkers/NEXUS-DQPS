'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
  compact = false
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

  // Status computation
  let statusColor = 'text-emerald-400';
  let statusBadge = 'OPTIMAL';
  let badgeVariant = 'border-emerald-500/20 text-emerald-400 bg-emerald-950/30';

  if (inventory !== undefined && inventory <= 0) {
    statusColor = 'text-rose-400';
    statusBadge = 'STOCKOUT';
    badgeVariant = 'border-rose-500/20 text-rose-400 bg-rose-950/30';
  } else if (currentRoas < breakevenRoas) {
    statusColor = 'text-rose-400';
    statusBadge = 'SUB-FLOOR';
    badgeVariant = 'border-rose-500/20 text-rose-400 bg-rose-950/30';
  } else if (currentRoas < targetRoas) {
    statusColor = 'text-amber-400';
    statusBadge = 'PROFITABLE';
    badgeVariant = 'border-amber-500/20 text-amber-400 bg-amber-950/30';
  } else {
    statusColor = 'text-emerald-400';
    statusBadge = 'TARGET MET';
    badgeVariant = 'border-emerald-500/20 text-emerald-400 bg-emerald-950/30';
  }

  // Health score color
  const healthColor =
    healthScore >= 75
      ? 'text-emerald-400 border-emerald-500/20'
      : healthScore >= 50
      ? 'text-amber-400 border-amber-500/20'
      : 'text-rose-400 border-rose-500/20';

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-between rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-4 transition-colors hover:border-zinc-700/60 shadow-none',
        className
      )}
    >
      {/* Header if campaign provided */}
      {campaignName && (
        <div className='flex w-full items-center justify-between gap-2 border-b border-zinc-800/60 pb-2 mb-2'>
          <div className='flex items-center gap-2 min-w-0'>
            {photoUrl && (
              <div className='relative size-7 rounded border border-zinc-800/80 bg-zinc-900/60 overflow-hidden shrink-0'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl} alt={productName || campaignName} className='size-full object-cover' />
              </div>
            )}
            <div className='flex flex-col text-left min-w-0'>
              <span className='text-xs font-medium text-zinc-200 font-mono truncate max-w-[140px]'>
                {productName || campaignName}
              </span>
              <span className='text-[10px] text-zinc-500 uppercase tracking-wider font-mono truncate max-w-[140px]'>
                {platform || 'Omnichannel'} • Inv: {inventory ?? 'N/A'}
              </span>
            </div>
          </div>
          <div
            className={cn(
              'flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono font-semibold shrink-0',
              healthColor
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
            strokeWidth={strokeWidth}
            className='text-zinc-900'
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
                stroke='#d97706'
                strokeWidth='2'
                strokeDasharray='1.5 1.5'
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
                stroke='#10b981'
                strokeWidth='2'
              />
            );
          })()}

          {/* Active Arc Value */}
          <path
            d={`M ${strokeWidth} ${radius + strokeWidth} A ${radius} ${radius} 0 0 1 ${
              radius * 2 + strokeWidth
            } ${radius + strokeWidth}`}
            fill='none'
            stroke='currentColor'
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn('transition-all duration-700 ease-out', statusColor)}
            strokeLinecap='round'
          />
        </svg>

        {/* Center ROAS readout */}
        <div className='absolute bottom-0 flex flex-col items-center'>
          <span className={cn('font-mono font-bold tracking-tight', compact ? 'text-lg' : 'text-2xl', statusColor)}>
            {currentRoas.toFixed(2)}x
          </span>
          <span className='text-[10px] text-zinc-500 font-mono -mt-0.5'>ROAS</span>
        </div>
      </div>

      {/* Footer Markers & Status Badge */}
      <div className='mt-2 flex w-full items-center justify-between text-[10px] font-mono text-zinc-500'>
        <div className='flex items-center gap-1.5'>
          <span>Floor {breakevenRoas.toFixed(1)}x</span>
          <span className='text-zinc-700'>•</span>
          <span>Target {targetRoas.toFixed(1)}x</span>
        </div>
        <Badge variant='outline' className={cn('text-[9px] py-0 px-1 font-mono tracking-wider', badgeVariant)}>
          {statusBadge}
        </Badge>
      </div>
    </div>
  );
}
