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
  onAnalyze?: () => void;
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
  onAnalyze
}: RoasGaugeProps) {
  // Map ROAS (0 to 5.0) to angle on semicircular arc (180deg to 0deg)
  const maxRoas = 5.0;
  const clampedRoas = Math.min(Math.max(currentRoas, 0), maxRoas);
  const percentage = clampedRoas / maxRoas;
  
  // Circumference for r=70: half circle length = PI * 70 = ~220
  const radius = compact ? 45 : 65;
  const strokeWidth = compact ? 8 : 12;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage);

  // Status computation
  let statusColor = 'text-emerald-400';
  let statusBadge = 'OPTIMAL';
  let badgeVariant = 'border-emerald-500/30 text-emerald-400 bg-emerald-950/40';

  if (inventory !== undefined && inventory <= 0) {
    statusColor = 'text-rose-500';
    statusBadge = 'STOCKOUT DRAIN';
    badgeVariant = 'border-rose-500/40 text-rose-400 bg-rose-950/40';
  } else if (currentRoas < breakevenRoas) {
    statusColor = 'text-rose-400';
    statusBadge = 'BELOW BREAK-EVEN';
    badgeVariant = 'border-rose-500/30 text-rose-400 bg-rose-950/40';
  } else if (currentRoas < targetRoas) {
    statusColor = 'text-amber-400';
    statusBadge = 'PROFITABLE';
    badgeVariant = 'border-amber-500/30 text-amber-400 bg-amber-950/40';
  } else {
    statusColor = 'text-emerald-400';
    statusBadge = 'ABOVE TARGET';
    badgeVariant = 'border-emerald-500/30 text-emerald-400 bg-emerald-950/40';
  }

  // Health score color
  const healthColor =
    healthScore >= 75
      ? 'text-emerald-400 border-emerald-500/30'
      : healthScore >= 50
      ? 'text-amber-400 border-amber-500/30'
      : 'text-rose-400 border-rose-500/30';

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 transition-all hover:border-zinc-700 shadow-sm',
        onAnalyze && 'cursor-pointer hover:border-cyan-500/40 hover:bg-zinc-900/40',
        className
      )}
      onClick={onAnalyze}
      title={onAnalyze ? 'Click to inspect product telemetry' : undefined}
    >
      {/* Header if campaign provided */}
      {campaignName && (
        <div className='flex w-full items-center justify-between gap-2 border-b border-zinc-800/80 pb-2 mb-2'>
          <div className='flex items-center gap-2 min-w-0'>
            {photoUrl && (
              <div className='relative size-7 rounded border border-zinc-800 bg-zinc-900 overflow-hidden shrink-0'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl} alt={productName || campaignName} className='size-full object-cover' />
              </div>
            )}
            <div className='flex flex-col text-left min-w-0'>
              <span className='text-xs font-semibold text-zinc-200 font-mono truncate max-w-[150px]'>
                {productName || campaignName}
              </span>
              <span className='text-[10px] text-zinc-500 uppercase tracking-wider font-mono truncate max-w-[150px]'>
                {platform || 'Omnichannel'} • Inv: {inventory ?? 'N/A'}
              </span>
            </div>
          </div>
          <div
            className={cn(
              'flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono font-bold shrink-0',
              healthColor
            )}
            title={`modery68 Campaign Health Score: ${healthScore}/100`}
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
          height={radius + strokeWidth + 10}
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
            className='text-zinc-800/80'
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
                stroke='#f59e0b'
                strokeWidth='2.5'
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
                stroke='#10b981'
                strokeWidth='2.5'
              />
            );
          })()}

          {/* Active Value Arc */}
          <path
            d={`M ${strokeWidth} ${radius + strokeWidth} A ${radius} ${radius} 0 0 1 ${
              radius * 2 + strokeWidth
            } ${radius + strokeWidth}`}
            fill='none'
            stroke='currentColor'
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap='round'
            className={cn(
              'transition-all duration-1000 ease-out',
              currentRoas < breakevenRoas
                ? 'text-rose-500'
                : currentRoas < targetRoas
                ? 'text-amber-400'
                : 'text-emerald-400'
            )}
          />
        </svg>

        {/* Center Numbers */}
        <div className='absolute bottom-0 flex flex-col items-center justify-center text-center'>
          <span
            className={cn(
              'font-mono font-extrabold tracking-tight',
              compact ? 'text-xl' : 'text-3xl',
              statusColor
            )}
          >
            {currentRoas.toFixed(2)}x
          </span>
          <span className='text-[10px] text-zinc-500 font-mono uppercase tracking-wider'>
            ROAS
          </span>
        </div>
      </div>

      {/* Threshold Labels & Status Badge */}
      <div className='mt-2 flex w-full items-center justify-between text-[10px] font-mono text-zinc-400 border-t border-zinc-900 pt-2'>
        <div className='flex flex-col items-start'>
          <span className='text-zinc-600'>Floor (B/E)</span>
          <span className='text-amber-400 font-semibold'>{breakevenRoas.toFixed(1)}x</span>
        </div>
        <Badge variant='outline' className={cn('text-[9px] py-0 px-1.5', badgeVariant)}>
          {statusBadge}
        </Badge>
        <div className='flex flex-col items-end'>
          <span className='text-zinc-600'>Target</span>
          <span className='text-emerald-400 font-semibold'>{targetRoas.toFixed(1)}x</span>
        </div>
      </div>
    </div>
  );
}
