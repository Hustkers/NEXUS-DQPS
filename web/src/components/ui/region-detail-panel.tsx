'use client';

import React, { useEffect } from 'react';
import { PulseMarker, calculateRegionFinancials } from '@/data/globe-regions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  IconX,
  IconTrendingUp,
  IconTrendingDown,
  IconCheck,
  IconAlertTriangle,
  IconPackage,
  IconArrowRight,
  IconActivity,
  IconInfoCircle,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export interface RegionDetailPanelProps {
  marker: PulseMarker | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function RegionDetailPanel({
  marker,
  isOpen,
  onClose,
  isLoading = false,
}: RegionDetailPanelProps) {
  // Keyboard listener: Esc to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !marker) return null;

  const financials = calculateRegionFinancials(marker.metrics);

  const getStatusBadge = () => {
    switch (marker.status) {
      case 'High sales':
        return (
          <Badge className='bg-red-950/80 text-red-400 border border-red-500/40 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5'>
            <span className='size-1.5 rounded-full bg-red-400 animate-pulse' />
            High Sales
          </Badge>
        );
      case 'Decreasing':
        return (
          <Badge className='bg-amber-950/80 text-amber-400 border border-amber-500/40 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5'>
            <span className='size-1.5 rounded-full bg-amber-400' />
            Decreasing
          </Badge>
        );
      case 'Suppressed':
      default:
        return (
          <Badge className='bg-zinc-800 text-zinc-400 border border-zinc-700 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5'>
            <span className='size-1.5 rounded-full bg-zinc-400' />
            Suppressed
          </Badge>
        );
    }
  };

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-label={`Region Intelligence: ${marker.name}`}
      className={cn(
        'w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950/95 p-4 text-zinc-100 shadow-2xl backdrop-blur-md transition-all duration-300',
        'animate-in fade-in-0 zoom-in-95'
      )}
    >
      {/* Header */}
      <div className='flex items-start justify-between border-b border-zinc-800/80 pb-3 mb-3 gap-2'>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2 flex-wrap'>
            <h3 className='font-mono text-sm font-bold text-zinc-100 uppercase tracking-tight flex items-center gap-1.5'>
              <IconActivity className='size-4 text-cyan-400' />
              {marker.name}
            </h3>
            {getStatusBadge()}
          </div>
          <span className='text-[10px] font-mono text-zinc-500'>
            Geo Coordinates: [{marker.location[0].toFixed(2)}°, {marker.location[1].toFixed(2)}°]
          </span>
        </div>

        <Button
          variant='ghost'
          size='sm'
          onClick={onClose}
          aria-label='Close region detail panel (Esc)'
          className='size-7 p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg shrink-0'
        >
          <IconX className='size-4' />
        </Button>
      </div>

      {/* Loading Skeleton State */}
      {isLoading ? (
        <div className='space-y-3 py-2'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-4 w-24 bg-zinc-900' />
            <Skeleton className='h-4 w-16 bg-zinc-900' />
          </div>
          <div className='grid grid-cols-2 gap-2'>
            <Skeleton className='h-16 w-full bg-zinc-900 rounded-lg' />
            <Skeleton className='h-16 w-full bg-zinc-900 rounded-lg' />
          </div>
          <Skeleton className='h-20 w-full bg-zinc-900 rounded-lg' />
          <Skeleton className='h-12 w-full bg-zinc-900 rounded-lg' />
        </div>
      ) : !financials || !marker.metrics ? (
        /* Friendly Missing Data State */
        <div className='py-6 px-4 text-center flex flex-col items-center gap-2 bg-zinc-900/40 rounded-lg border border-dashed border-zinc-800'>
          <IconInfoCircle className='size-8 text-amber-400/80' />
          <div className='text-xs font-mono font-semibold text-zinc-200'>
            Telemetry Data Unavailable
          </div>
          <p className='text-[11px] font-mono text-zinc-400 max-w-xs leading-relaxed'>
            No active telemetry stream or attribution history found for <strong>{marker.name}</strong>. Ad delivery may be unmapped or paused in this region.
          </p>
          <div className='mt-2 flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={onClose}
              className='font-mono text-[10px] border-zinc-800 hover:bg-zinc-800'
            >
              Dismiss (Esc)
            </Button>
          </div>
        </div>
      ) : (
        /* Data Loaded State */
        <div className='space-y-3 text-xs font-mono'>
          {/* Profit & Status Hero Box */}
          <div
            className={cn(
              'p-3 rounded-lg border flex flex-col gap-2',
              financials.isProfitable
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
            )}
          >
            <div className='flex items-center justify-between'>
              <span className='text-[10px] uppercase font-bold tracking-wider text-zinc-400'>
                Regional Net Profit
              </span>
              <Badge
                variant='outline'
                className={cn(
                  'text-[10px] font-mono font-bold tracking-wider',
                  financials.isProfitable
                    ? 'border-emerald-500/50 bg-emerald-950/50 text-emerald-400'
                    : 'border-rose-500/50 bg-rose-950/50 text-rose-400'
                )}
              >
                {financials.isProfitable ? (
                  <span className='flex items-center gap-1'>
                    <IconCheck className='size-3' /> Profitable
                  </span>
                ) : (
                  <span className='flex items-center gap-1'>
                    <IconAlertTriangle className='size-3' /> Not profitable
                  </span>
                )}
              </Badge>
            </div>

            <div className='flex items-baseline justify-between'>
              <span className='text-xl font-bold tabular-nums tracking-tight text-zinc-100'>
                {financials.profit >= 0 ? '+' : '-'}
                {formatUSD(Math.abs(financials.profit))}
              </span>
              <span className='text-[10px] text-zinc-400'>
                Profit ROAS:{' '}
                <strong className='text-zinc-200 tabular-nums'>
                  {financials.spend > 0 ? `${financials.profitRoas.toFixed(2)}x` : 'N/A'}
                </strong>
              </span>
            </div>

            <div className='text-[10px] text-zinc-500 leading-tight pt-1 border-t border-zinc-800/60'>
              Formula: (Revenue × Margin Rate) − Ad Spend = ({formatUSD(financials.revenue)} ×{' '}
              {(financials.marginRate * 100).toFixed(0)}%) − {formatUSD(financials.spend)}
            </div>
          </div>

          {/* Financial & Ad Metrics Grid */}
          <div className='grid grid-cols-2 gap-2 text-[11px]'>
            <div className='p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80'>
              <div className='text-zinc-400 text-[10px] uppercase tracking-wider'>Ad Spend</div>
              <div className='text-sm font-bold text-zinc-100 tabular-nums mt-0.5'>
                {formatUSD(financials.spend)}
              </div>
              <div className='text-[10px] text-zinc-500 mt-0.5'>Allocated budget</div>
            </div>

            <div className='p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80'>
              <div className='text-zinc-400 text-[10px] uppercase tracking-wider'>Return (Revenue)</div>
              <div className='text-sm font-bold text-cyan-400 tabular-nums mt-0.5'>
                {formatUSD(financials.revenue)}
              </div>
              <div className='text-[10px] text-zinc-500 mt-0.5'>
                ROAS:{' '}
                <strong className='text-cyan-300 tabular-nums'>
                  {financials.spend > 0 ? `${financials.roas.toFixed(2)}x` : 'N/A'}
                </strong>
              </div>
            </div>
          </div>

          {/* Funnel & Conversion Efficiency */}
          <div className='p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/80 space-y-2'>
            <div className='flex items-center justify-between text-[10px] text-zinc-400 uppercase tracking-wider font-bold'>
              <span>Funnel Telemetry</span>
              <span className='text-zinc-500'>
                P_conv:{' '}
                <strong className='text-amber-400 tabular-nums'>
                  {(marker.metrics.convProbability * 100).toFixed(0)}%
                </strong>
              </span>
            </div>

            <div className='grid grid-cols-3 gap-2 text-center pt-1'>
              <div className='p-1.5 rounded bg-zinc-950/60 border border-zinc-800/60'>
                <div className='text-zinc-500 text-[9px]'>Conversions</div>
                <div className='text-xs font-bold text-zinc-200 tabular-nums'>
                  {formatNumber(marker.metrics.conversions)}
                </div>
              </div>

              <div className='p-1.5 rounded bg-zinc-950/60 border border-zinc-800/60'>
                <div className='text-zinc-500 text-[9px]'>CPA</div>
                <div className='text-xs font-bold text-zinc-200 tabular-nums'>
                  {financials.cpa !== null ? formatUSD(financials.cpa) : 'N/A'}
                </div>
              </div>

              <div className='p-1.5 rounded bg-zinc-950/60 border border-zinc-800/60'>
                <div className='text-zinc-500 text-[9px]'>CTR</div>
                <div className='text-xs font-bold text-zinc-200 tabular-nums'>
                  {financials.ctr.toFixed(2)}%
                </div>
              </div>
            </div>

            <div className='flex items-center justify-between text-[10px] text-zinc-500 px-1'>
              <span>
                Impressions: <strong className='text-zinc-300 tabular-nums'>{formatNumber(marker.metrics.impressions)}</strong>
              </span>
              <span>
                Clicks: <strong className='text-zinc-300 tabular-nums'>{formatNumber(marker.metrics.clicks)}</strong>
              </span>
            </div>
          </div>

          {/* Top Product (SKU) & Inventory */}
          <div className='p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <div className='size-7 rounded bg-zinc-800/80 flex items-center justify-center shrink-0 text-cyan-400'>
                <IconPackage className='size-4' />
              </div>
              <div>
                <div className='text-[10px] text-zinc-500 uppercase tracking-wider'>Top SKU</div>
                <div className='text-xs font-bold text-zinc-200 line-clamp-1'>
                  {marker.metrics.topProduct.name}
                </div>
                <div className='text-[10px] text-zinc-500'>
                  SKU: <span className='text-zinc-400'>{marker.metrics.topProduct.sku}</span> • Margin:{' '}
                  <span className='text-zinc-300 tabular-nums'>
                    {(marker.metrics.topProduct.margin * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className='text-right shrink-0'>
              <div className='text-[10px] text-zinc-500 uppercase tracking-wider'>Stock</div>
              <div
                className={cn(
                  'text-xs font-bold tabular-nums',
                  marker.metrics.topProduct.stockLevel > 50
                    ? 'text-emerald-400'
                    : marker.metrics.topProduct.stockLevel > 0
                    ? 'text-amber-400'
                    : 'text-rose-500'
                )}
              >
                {marker.metrics.topProduct.stockLevel} units
              </div>
            </div>
          </div>

          {/* Trend vs Previous Period */}
          <div className='flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-[11px]'>
            <span className='text-zinc-400'>Trend vs Previous Period</span>
            <div
              className={cn(
                'flex items-center gap-1 font-bold tabular-nums',
                marker.metrics.trend.direction === 'up' ? 'text-emerald-400' : 'text-amber-400'
              )}
            >
              {marker.metrics.trend.direction === 'up' ? (
                <IconTrendingUp className='size-3.5' />
              ) : (
                <IconTrendingDown className='size-3.5' />
              )}
              <span>
                {marker.metrics.trend.percentage > 0 ? '+' : ''}
                {marker.metrics.trend.percentage.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Decision Engine Recommended Action */}
          <div className='p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-800/40 space-y-1'>
            <div className='flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-cyan-400'>
              <IconArrowRight className='size-3' />
              <span>Recommended Action</span>
            </div>
            <p className='text-[11px] text-zinc-200 leading-snug'>
              {marker.metrics.recommendedAction.action}
            </p>
            <div className='text-[10px] text-cyan-300 font-semibold pt-1 border-t border-cyan-900/40'>
              Expected Impact: {marker.metrics.recommendedAction.expectedLift}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
