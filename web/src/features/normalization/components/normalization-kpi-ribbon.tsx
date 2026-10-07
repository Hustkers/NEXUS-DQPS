'use client';

import React from 'react';
import {
  IconCurrencyDollar,
  IconTrendingUp,
  IconPackage,
  IconArrowUpRight,
  IconChartBar
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { UnifiedCommerceRecord } from '../normalization-engine';

interface NormalizationKpiRibbonProps {
  record: UnifiedCommerceRecord | null;
  platformColor?: string;
}

export function NormalizationKpiRibbon({ record }: NormalizationKpiRibbonProps) {
  if (!record) return null;

  const isStockout = record.inventory_on_hand === 0;
  const netMargin = record.net_contribution_margin ?? Math.max(0, record.gross_margin - record.spend);
  const targetRoas = 4.0;
  const roasRatio = Math.min(100, Math.round((record.roas / targetRoas) * 100));

  return (
    <div className='grid grid-cols-2 lg:grid-cols-5 gap-3 font-mono'>
      {/* 1. Normalized Spend */}
      <div className='relative overflow-hidden rounded-xl border border-border/80 bg-card p-3.5 flex flex-col justify-between shadow-xs transition-all hover:border-border'>
        <div className='flex items-center justify-between text-muted-foreground text-[11px] mb-1'>
          <span className='uppercase font-semibold tracking-wider flex items-center gap-1.5'>
            <IconCurrencyDollar className='size-3.5 text-cyan-400' />
            Clean Spend
          </span>
          <Badge variant='outline' className='text-[9px] px-1.5 py-0 border-border/60 bg-muted/40 font-mono'>
            Normalized
          </Badge>
        </div>
        <div className='my-1'>
          <div className='text-xl sm:text-2xl font-bold text-foreground tracking-tight'>
            ${record.spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className='text-[10px] text-muted-foreground flex items-center justify-between mt-0.5'>
            <span>CPC: ${record.cpc.toFixed(2)}</span>
            <span>CPM: ${record.cpm.toFixed(2)}</span>
          </div>
        </div>
        {/* Visual spend indicator bar */}
        <div className='mt-2 pt-2 border-t border-border/40'>
          <div className='flex items-center justify-between text-[10px] text-muted-foreground mb-1'>
            <span>Impressions</span>
            <span className='font-bold text-foreground'>{record.impressions.toLocaleString()}</span>
          </div>
          <div className='h-1.5 w-full bg-muted/60 rounded-full overflow-hidden'>
            <div
              className='h-full bg-cyan-500 rounded-full transition-all duration-500'
              style={{ width: `${Math.min(100, Math.max(15, (record.impressions / 35000) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Attributed Revenue */}
      <div className='relative overflow-hidden rounded-xl border border-border/80 bg-card p-3.5 flex flex-col justify-between shadow-xs transition-all hover:border-emerald-500/40'>
        <div className='flex items-center justify-between text-muted-foreground text-[11px] mb-1'>
          <span className='uppercase font-semibold tracking-wider flex items-center gap-1.5'>
            <IconTrendingUp className='size-3.5 text-emerald-500' />
            Attributed Rev
          </span>
          <Badge variant='outline' className='text-[9px] px-1.5 py-0 border-emerald-500/30 text-emerald-500 bg-emerald-500/10 font-mono'>
            Verified
          </Badge>
        </div>
        <div className='my-1'>
          <div className='text-xl sm:text-2xl font-bold text-emerald-500 tracking-tight'>
            ${record.attributed_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className='text-[10px] text-muted-foreground flex items-center justify-between mt-0.5'>
            <span>Conversions: {record.conversions}</span>
            <span>CTR: {record.ctr.toFixed(2)}%</span>
          </div>
        </div>
        {/* Visual conversion bar */}
        <div className='mt-2 pt-2 border-t border-border/40'>
          <div className='flex items-center justify-between text-[10px] text-muted-foreground mb-1'>
            <span>Gross Orders</span>
            <span className='font-bold text-emerald-400'>{record.conversions} unit{record.conversions === 1 ? '' : 's'}</span>
          </div>
          <div className='h-1.5 w-full bg-muted/60 rounded-full overflow-hidden'>
            <div
              className='h-full bg-emerald-500 rounded-full transition-all duration-500'
              style={{ width: `${Math.min(100, Math.max(20, record.conversions * 15))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. True Net CM3 Margin */}
      <div className='relative overflow-hidden rounded-xl border border-border/80 bg-card p-3.5 flex flex-col justify-between shadow-xs transition-all hover:border-indigo-500/40'>
        <div className='flex items-center justify-between text-muted-foreground text-[11px] mb-1'>
          <span className='uppercase font-semibold tracking-wider flex items-center gap-1.5'>
            <IconChartBar className='size-3.5 text-indigo-400' />
            Net CM3 Margin
          </span>
          <Badge variant='outline' className='text-[9px] px-1.5 py-0 border-indigo-500/30 text-indigo-400 bg-indigo-500/10 font-mono'>
            {record.gross_margin_pct.toFixed(0)}% COGS
          </Badge>
        </div>
        <div className='my-1'>
          <div className='text-xl sm:text-2xl font-bold text-indigo-400 tracking-tight'>
            ${netMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className='text-[10px] text-muted-foreground flex items-center justify-between mt-0.5'>
            <span>Unit COGS: ${record.unit_cogs.toFixed(2)}</span>
            <span>Total COGS: ${record.total_cogs.toFixed(2)}</span>
          </div>
        </div>
        {/* Margin Retention Bar */}
        <div className='mt-2 pt-2 border-t border-border/40'>
          <div className='flex items-center justify-between text-[10px] text-muted-foreground mb-1'>
            <span>Margin Retention</span>
            <span className='font-bold text-indigo-400'>
              {record.attributed_revenue > 0 ? `${((netMargin / record.attributed_revenue) * 100).toFixed(1)}%` : '59.1%'}
            </span>
          </div>
          <div className='h-1.5 w-full bg-muted/60 rounded-full overflow-hidden'>
            <div
              className='h-full bg-indigo-500 rounded-full transition-all duration-500'
              style={{ width: `${Math.min(100, Math.max(10, record.gross_margin_pct))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Attributed ROAS / POAS */}
      <div className='relative overflow-hidden rounded-xl border border-border/80 bg-card p-3.5 flex flex-col justify-between shadow-xs transition-all hover:border-purple-500/40'>
        <div className='flex items-center justify-between text-muted-foreground text-[11px] mb-1'>
          <span className='uppercase font-semibold tracking-wider flex items-center gap-1.5'>
            <IconArrowUpRight className='size-3.5 text-purple-400' />
            Attributed ROAS
          </span>
          <Badge variant='outline' className='text-[9px] px-1.5 py-0 border-purple-500/30 text-purple-400 bg-purple-500/10 font-mono'>
            {record.poas ? `POAS: ${record.poas}x` : 'True ROAS'}
          </Badge>
        </div>
        <div className='my-1'>
          <div className='text-xl sm:text-2xl font-bold text-purple-400 tracking-tight'>
            {record.roas.toFixed(2)}x
          </div>
          <div className='text-[10px] text-muted-foreground flex items-center justify-between mt-0.5'>
            <span>Benchmark: 4.0x</span>
            <span className={record.roas >= 4.0 ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
              {record.roas >= 4.0 ? '+ Target Met' : 'Below Target'}
            </span>
          </div>
        </div>
        {/* Visual ROAS ratio bar */}
        <div className='mt-2 pt-2 border-t border-border/40'>
          <div className='flex items-center justify-between text-[10px] text-muted-foreground mb-1'>
            <span>Efficiency Index</span>
            <span className='font-bold text-purple-400'>{Math.min(999, Math.round(record.roas * 10))}%</span>
          </div>
          <div className='h-1.5 w-full bg-muted/60 rounded-full overflow-hidden'>
            <div
              className='h-full bg-purple-500 rounded-full transition-all duration-500'
              style={{ width: `${Math.min(100, Math.max(15, roasRatio))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5. Inventory Circuit Breaker */}
      <div className={cn(
        'relative overflow-hidden rounded-xl border p-3.5 flex flex-col justify-between shadow-xs transition-all col-span-2 lg:col-span-1',
        isStockout
          ? 'border-red-500/60 bg-red-950/20'
          : 'border-border/80 bg-card hover:border-emerald-500/40'
      )}>
        <div className='flex items-center justify-between text-muted-foreground text-[11px] mb-1'>
          <span className='uppercase font-semibold tracking-wider flex items-center gap-1.5'>
            <IconPackage className={cn('size-3.5', isStockout ? 'text-red-400' : 'text-emerald-400')} />
            Inventory Circuit
          </span>
          <Badge
            variant='outline'
            className={cn(
              'text-[9px] px-1.5 py-0 font-mono',
              isStockout
                ? 'border-red-500/40 text-red-400 bg-red-500/10'
                : 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
            )}
          >
            {isStockout ? 'CIRCUIT OPEN' : 'ACTIVE'}
          </Badge>
        </div>
        <div className='my-1'>
          <div className={cn('text-xl sm:text-2xl font-bold tracking-tight', isStockout ? 'text-red-400' : 'text-emerald-400')}>
            {isStockout ? '0 Units' : `${record.inventory_on_hand} Units`}
          </div>
          <div className='text-[10px] text-muted-foreground flex items-center justify-between mt-0.5'>
            <span>SKU: {record.sku_id}</span>
            <span>{isStockout ? 'Brake Engaged' : 'Safe Runway'}</span>
          </div>
        </div>
        {/* Stockout safety bar */}
        <div className='mt-2 pt-2 border-t border-border/40'>
          <div className='flex items-center justify-between text-[10px] text-muted-foreground mb-1'>
            <span>Protection Status</span>
            <span className={cn('font-bold', isStockout ? 'text-red-400' : 'text-emerald-400')}>
              {isStockout ? 'Ad Spend Halted' : 'Auto-Throttling Ready'}
            </span>
          </div>
          <div className='h-1.5 w-full bg-muted/60 rounded-full overflow-hidden'>
            <div
              className={cn('h-full rounded-full transition-all duration-500', isStockout ? 'bg-red-500' : 'bg-emerald-500')}
              style={{ width: isStockout ? '100%' : `${Math.min(100, Math.max(25, (record.inventory_on_hand / 500) * 100))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
