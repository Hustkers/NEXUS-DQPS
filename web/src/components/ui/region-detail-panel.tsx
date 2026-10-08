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
  IconBuildingWarehouse,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export interface RegionDetailPanelProps {
  marker: PulseMarker | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  className?: string;
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
}

export function RegionDetailPanel({
  marker,
  isOpen,
  onClose,
  isLoading = false,
  className,
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
          <Badge className='bg-[#000000] text-white border border-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5'>
            <span className='size-1.5 rounded-full bg-white' />
            High Sales
          </Badge>
        );
      case 'Decreasing':
        return (
          <Badge className='bg-[#000000] text-white border border-[#8A8A8A] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5'>
            <span className='size-1.5 rounded-full border border-white' />
            Decreasing
          </Badge>
        );
      case 'Suppressed':
      default:
        return (
          <Badge className='bg-[#000000] text-[#8A8A8A] border border-[#1A1A1A] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5'>
            <span className='size-1.5 rounded-full bg-[#8A8A8A]' />
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
        'w-full max-w-sm sm:max-w-md rounded border border-[#8A8A8A] bg-[#1A1A1A] p-4 text-white shadow-none transition-all duration-200',
        'max-h-[min(540px,85vh)] overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:#8A8A8A_transparent]',
        'animate-in fade-in-0 zoom-in-95',
        className
      )}
    >
      {/* Header */}
      <div className='flex items-start justify-between border-b border-[#000000] pb-2.5 mb-3 gap-2 sticky top-0 bg-[#1A1A1A] z-10 -mx-4 px-4 pt-0'>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2 flex-wrap'>
            <h3 className='font-mono text-sm font-bold text-white uppercase tracking-tight flex items-center gap-1.5'>
              <IconActivity className='size-4 text-white' />
              {marker.name}
            </h3>
            {getStatusBadge()}
          </div>
          <span className='text-[10px] font-mono text-[#8A8A8A]'>
            Centroid Coordinates: [{marker.location[0].toFixed(2)}°, {marker.location[1].toFixed(2)}°]
          </span>
        </div>

        <Button
          variant='ghost'
          size='sm'
          onClick={onClose}
          aria-label='Close region detail panel (Esc)'
          className='size-7 p-0 text-[#8A8A8A] hover:text-white hover:bg-[#000000] rounded shrink-0'
        >
          <IconX className='size-4' />
        </Button>
      </div>

      {/* Loading Skeleton State */}
      {isLoading ? (
        <div className='space-y-3 py-2'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-4 w-24 bg-[#000000]' />
            <Skeleton className='h-4 w-16 bg-[#000000]' />
          </div>
          <div className='grid grid-cols-2 gap-2'>
            <Skeleton className='h-16 w-full bg-[#000000] rounded' />
            <Skeleton className='h-16 w-full bg-[#000000] rounded' />
          </div>
          <Skeleton className='h-20 w-full bg-[#000000] rounded' />
          <Skeleton className='h-12 w-full bg-[#000000] rounded' />
        </div>
      ) : !financials || !marker.metrics ? (
        /* Friendly Missing Data State */
        <div className='py-6 px-4 text-center flex flex-col items-center gap-2 bg-[#000000] rounded border border-dashed border-[#8A8A8A]'>
          <IconInfoCircle className='size-8 text-white' />
          <div className='text-xs font-mono font-semibold text-white'>
            Telemetry Data Unavailable
          </div>
          <p className='text-[11px] font-mono text-[#8A8A8A] max-w-xs leading-relaxed'>
            No active telemetry stream or attribution history found for <strong>{marker.name}</strong>. Ad delivery may be unmapped or paused in this region.
          </p>
          <div className='mt-2 flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={onClose}
              className='font-mono text-[10px] border-[#8A8A8A] hover:bg-white hover:text-black text-white bg-[#000000]'
            >
              Dismiss (Esc)
            </Button>
          </div>
        </div>
      ) : (
        /* Data Loaded State */
        <div className='space-y-2.5 text-xs font-mono'>
          {/* Net Profit Hero Card adhering to DESIGN.md */}
          <div
            className={cn(
              'p-3 rounded border flex flex-col gap-2',
              financials.isProfitable
                ? 'bg-[#000000] border-white text-white'
                : 'bg-[#000000] border-[#8A8A8A] text-white'
            )}
          >
            <div className='flex items-center justify-between'>
              <span className='text-[10px] uppercase font-bold tracking-wider text-[#8A8A8A] font-mono'>
                Regional Net Profit
              </span>
              <Badge
                variant='outline'
                className={cn(
                  'text-[10px] font-mono font-bold tracking-wider',
                  financials.isProfitable
                    ? 'border-white bg-[#1A1A1A] text-white'
                    : 'border-[#8A8A8A] bg-[#1A1A1A] text-[#8A8A8A]'
                )}
              >
                {financials.isProfitable ? (
                  <span className='flex items-center gap-1'>
                    <IconCheck className='size-3 text-white' /> Profitable
                  </span>
                ) : (
                  <span className='flex items-center gap-1'>
                    <IconAlertTriangle className='size-3 text-[#8A8A8A]' /> Margin Drift
                  </span>
                )}
              </Badge>
            </div>

            <div className='flex items-baseline justify-between'>
              <span className='text-xl font-bold tabular-nums tracking-tight text-white font-mono'>
                {financials.profit >= 0 ? '+' : '-'}
                {formatUSD(Math.abs(financials.profit))}
              </span>
              <span className='text-[10px] text-[#8A8A8A] font-mono'>
                Profit ROAS:{' '}
                <strong className='text-white tabular-nums'>
                  {financials.spend > 0 ? `${financials.profitRoas.toFixed(2)}x` : 'N/A'}
                </strong>
              </span>
            </div>

            <div className='text-[10px] text-[#8A8A8A] leading-tight pt-1.5 border-t border-[#1A1A1A] font-mono'>
              Formula: (Revenue × Margin) − Spend = ({formatUSD(financials.revenue)} ×{' '}
              {(financials.marginRate * 100).toFixed(0)}%) − {formatUSD(financials.spend)}
            </div>
          </div>

          {/* Clean 2-Column Metric Grid with Equal Heights */}
          <div className='grid grid-cols-2 gap-2 text-xs'>
            {/* 1. Ad Spend */}
            <div className='p-2.5 rounded bg-[#000000] border border-[#1A1A1A] flex flex-col justify-between min-h-[72px]'>
              <div className='text-[#8A8A8A] text-[10px] uppercase font-mono tracking-wider'>
                Ad Spend
              </div>
              <div className='text-sm font-bold text-white tabular-nums font-mono'>
                {formatUSD(financials.spend)}
              </div>
              <div className='text-[10px] text-[#8A8A8A] font-mono'>Allocated budget</div>
            </div>

            {/* 2. Return (Revenue) */}
            <div className='p-2.5 rounded bg-[#000000] border border-[#1A1A1A] flex flex-col justify-between min-h-[72px]'>
              <div className='text-[#8A8A8A] text-[10px] uppercase font-mono tracking-wider'>
                Return (Revenue)
              </div>
              <div className='text-sm font-bold text-white tabular-nums font-mono'>
                {formatUSD(financials.revenue)}
              </div>
              <div className='text-[10px] text-[#8A8A8A] font-mono'>
                ROAS:{' '}
                <strong className='text-white tabular-nums'>
                  {financials.spend > 0 ? `${financials.roas.toFixed(2)}x` : 'N/A'}
                </strong>
              </div>
            </div>

            {/* 3. Conversions & CPA */}
            <div className='p-2.5 rounded bg-[#000000] border border-[#1A1A1A] flex flex-col justify-between min-h-[72px]'>
              <div className='text-[#8A8A8A] text-[10px] uppercase font-mono tracking-wider'>
                Conversions
              </div>
              <div className='text-sm font-bold text-white tabular-nums font-mono'>
                {formatNumber(marker.metrics.conversions)}
              </div>
              <div className='text-[10px] text-[#8A8A8A] font-mono'>
                CPA:{' '}
                <strong className='text-white tabular-nums'>
                  {financials.cpa !== null ? formatUSD(financials.cpa) : 'N/A'}
                </strong>
              </div>
            </div>

            {/* 4. CTR & Conversion Probability */}
            <div className='p-2.5 rounded bg-[#000000] border border-[#1A1A1A] flex flex-col justify-between min-h-[72px]'>
              <div className='text-[#8A8A8A] text-[10px] uppercase font-mono tracking-wider'>
                CTR &amp; P_conv
              </div>
              <div className='text-sm font-bold text-white tabular-nums font-mono'>
                {financials.ctr.toFixed(2)}%
              </div>
              <div className='text-[10px] text-[#8A8A8A] font-mono'>
                P_conv:{' '}
                <strong className='text-white tabular-nums'>
                  {(marker.metrics.convProbability * 100).toFixed(0)}%
                </strong>
              </div>
            </div>

            {/* 5. Traffic (Impressions / Clicks) */}
            <div className='p-2.5 rounded bg-[#000000] border border-[#1A1A1A] flex flex-col justify-between min-h-[72px]'>
              <div className='text-[#8A8A8A] text-[10px] uppercase font-mono tracking-wider'>
                Impressions / Clicks
              </div>
              <div className='text-sm font-bold text-white tabular-nums font-mono'>
                {formatNumber(marker.metrics.clicks)}{' '}
                <span className='text-xs font-normal text-[#8A8A8A]'>clicks</span>
              </div>
              <div className='text-[10px] text-[#8A8A8A] font-mono'>
                {formatNumber(marker.metrics.impressions)} impressions
              </div>
            </div>

            {/* 6. Trend vs Previous Period */}
            <div className='p-2.5 rounded bg-[#000000] border border-[#1A1A1A] flex flex-col justify-between min-h-[72px]'>
              <div className='text-[#8A8A8A] text-[10px] uppercase font-mono tracking-wider'>
                Trend vs Prev
              </div>
              <div className='text-sm font-bold tabular-nums font-mono flex items-center gap-1 text-white'>
                {marker.metrics.trend.direction === 'up' ? (
                  <IconTrendingUp className='size-4 text-white' />
                ) : (
                  <IconTrendingDown className='size-4 text-[#8A8A8A]' />
                )}
                <span>
                  {marker.metrics.trend.percentage > 0 ? '+' : ''}
                  {marker.metrics.trend.percentage.toFixed(1)}%
                </span>
              </div>
              <div className='text-[10px] text-[#8A8A8A] font-mono'>
                {marker.metrics.trend.direction === 'up' ? 'Growth momentum' : 'Decreasing pace'}
              </div>
            </div>
          </div>

          {/* Top Product (SKU) & Inventory Card Grounded in DATASET.md */}
          <div className='p-2.5 rounded bg-[#000000] border border-[#1A1A1A] flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2 min-w-0'>
              <div className='size-7 rounded bg-[#1A1A1A] flex items-center justify-center shrink-0 text-white'>
                <IconPackage className='size-4' />
              </div>
              <div className='min-w-0'>
                <div className='text-[10px] text-[#8A8A8A] uppercase tracking-wider font-mono'>
                  Top SKU
                </div>
                <div className='text-xs font-bold text-white truncate font-mono'>
                  {marker.metrics.topProduct.name}
                </div>
                <div className='text-[10px] text-[#8A8A8A] font-mono'>
                  SKU: <span className='text-white'>{marker.metrics.topProduct.sku}</span> • Margin:{' '}
                  <span className='text-white tabular-nums'>
                    {(marker.metrics.topProduct.margin * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className='text-right shrink-0'>
              <div className='text-[10px] text-[#8A8A8A] uppercase tracking-wider font-mono'>
                Stock
              </div>
              <div
                className={cn(
                  'text-xs font-bold tabular-nums font-mono',
                  marker.metrics.topProduct.stockLevel > 50
                    ? 'text-white'
                    : marker.metrics.topProduct.stockLevel > 0
                    ? 'text-[#8A8A8A]'
                    : 'text-white underline decoration-white/50'
                )}
              >
                {marker.metrics.topProduct.stockLevel} units
              </div>
            </div>
          </div>

          {/* Regional Fulfillment Hub (DATASET.md Logistics Hub) */}
          {marker.fulfillmentCenter && (
            <div className='p-2.5 rounded bg-[#000000] border border-[#1A1A1A] flex items-center justify-between gap-2 font-mono'>
              <div className='flex items-center gap-2 min-w-0'>
                <div className='size-7 rounded bg-[#1A1A1A] flex items-center justify-center shrink-0 text-white'>
                  <IconBuildingWarehouse className='size-4' />
                </div>
                <div className='min-w-0'>
                  <div className='text-[10px] text-[#8A8A8A] uppercase tracking-wider'>
                    Fulfillment Hub (FC)
                  </div>
                  <div className='text-xs font-bold text-white truncate'>
                    {marker.fulfillmentCenter}
                  </div>
                </div>
              </div>
              <span className='text-[9px] px-1.5 py-0.5 rounded bg-[#1A1A1A] text-white font-semibold shrink-0 border border-[#8A8A8A]'>
                Zone SLA
              </span>
            </div>
          )}

          {/* Decision Engine Recommended Action */}
          <div className='p-2.5 rounded bg-[#000000] border border-[#8A8A8A] space-y-1 font-mono'>
            <div className='flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-white'>
              <IconArrowRight className='size-3 text-white' />
              <span>Recommended Action</span>
            </div>
            <p className='text-[11px] text-[#8A8A8A] leading-snug'>
              {marker.metrics.recommendedAction.action}
            </p>
            <div className='text-[10px] text-white font-semibold pt-1 border-t border-[#1A1A1A]'>
              Expected Impact: {marker.metrics.recommendedAction.expectedLift}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
