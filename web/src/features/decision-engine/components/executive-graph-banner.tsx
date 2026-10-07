'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { AdChannel } from '@/context/channel-context';

interface ExecutiveGraphBannerProps {
  state: any;
  hasCriticalAnomaly: boolean;
  channel: AdChannel;
}

// Minimalist Dark Tooltip for Mini Sparkline Cards
function SparklineTooltip({ active, payload, label, unit = '', precision = 2 }: any) {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const formatted = typeof val === 'number' ? (precision === 0 ? val.toLocaleString() : val.toFixed(precision)) : val;
    return (
      <div className='rounded-md border border-zinc-800 bg-zinc-950/95 px-2 py-1 text-[11px] font-mono shadow-md backdrop-blur-md'>
        <span className='text-zinc-500 mr-1.5'>{label}:</span>
        <span className='font-bold text-zinc-100'>{unit}{formatted}</span>
      </div>
    );
  }
  return null;
}

export function ExecutiveGraphBanner({
  state,
  hasCriticalAnomaly,
  channel
}: ExecutiveGraphBannerProps) {
  const [expandedMetric, setExpandedMetric] = useState<'roas' | 'poas' | 'mer' | 'spend' | 'stock' | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('30d');

  // Derive time-series data tailored for active ad channel and anomaly injection
  const fullChartData = useMemo(() => {
    return state.dailyTrend.map((d: any, idx: number) => {
      const isShockedRecent = hasCriticalAnomaly && idx >= state.dailyTrend.length - 4;

      let spend = d.spend;
      let revenue = d.revenue;
      let margin = d.margin;
      let roas = d.roas;

      if (channel === 'amazon') {
        spend = d.amazonSpend;
        roas = 5.13;
        revenue = spend * roas;
        margin = revenue * 0.58;
      } else if (channel === 'google') {
        spend = d.googleSpend;
        roas = 4.37;
        revenue = spend * roas;
        margin = revenue * 0.59;
      } else if (channel === 'meta') {
        spend = d.metaSpend;
        roas = isShockedRecent ? 0.25 : 5.72;
        revenue = spend * roas;
        margin = revenue * 0.55;
      } else {
        if (isShockedRecent) {
          roas = +(d.roas * 0.63).toFixed(2);
          revenue = +(d.revenue * 0.72).toFixed(0);
          margin = +(d.margin * 0.65).toFixed(0);
        }
      }

      const poas = +(margin / spend).toFixed(2);
      const mer = +(revenue / spend).toFixed(2);
      const stockHealth = isShockedRecent
        ? Math.max(0, 100 - (idx - (state.dailyTrend.length - 5)) * 32)
        : 98;

      return {
        date: d.date,
        fullDate: d.fullDate,
        spend: Math.round(spend),
        revenue: Math.round(revenue),
        margin: Math.round(margin),
        roas: +roas.toFixed(2),
        poas: +poas.toFixed(2),
        mer: +mer.toFixed(2),
        stockHealth: Math.round(stockHealth),
        targetRoas: 3.2,
        breakevenRoas: 1.8
      };
    });
  }, [state.dailyTrend, channel, hasCriticalAnomaly]);

  // Filter based on selected time window
  const chartData = useMemo(() => {
    const len = fullChartData.length;
    if (timeRange === '7d') return fullChartData.slice(Math.max(0, len - 7));
    if (timeRange === '14d') return fullChartData.slice(Math.max(0, len - 14));
    return fullChartData;
  }, [fullChartData, timeRange]);

  // Latest snapshot metrics
  const latest = chartData[chartData.length - 1] || {};
  const currentRoas = latest.roas || state.telemetry.blendedRoas30d;
  const currentPoas = latest.poas || (hasCriticalAnomaly ? 2.05 : 2.92);
  const currentMer = latest.mer || (hasCriticalAnomaly ? 3.65 : 5.12);
  const currentSpend = latest.spend || 18450;
  const currentStockScore = latest.stockHealth ?? (hasCriticalAnomaly ? 0 : 98);

  return (
    <div className='flex flex-col gap-4'>
      {/* Header bar for Executive Telemetry with Time Range Selector & View Toggle */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/60 pb-2.5'>
        <div className='flex items-center gap-2'>
          <Icons.trendingUp className='size-3.5 text-emerald-400' />
          <h2 className='font-mono text-xs font-bold uppercase tracking-wider text-zinc-200'>
            Executive Financial &amp; Efficiency Trajectories
          </h2>
          <span className='font-mono text-[10px] text-zinc-500'>
            ({timeRange.toUpperCase()} • {channel === 'all' ? 'Blended Omnichannel' : channel.toUpperCase()})
          </span>
        </div>

        <div className='flex items-center gap-2'>
          {/* Timeframe pill selector */}
          <div className='flex items-center rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-0.5 text-[10px] font-mono'>
            {(['7d', '14d', '30d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={cn(
                  'px-2 py-0.5 rounded uppercase transition-colors',
                  timeRange === r
                    ? 'bg-zinc-800 font-bold text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Toggle Full Comparative Graph */}
          <button
            onClick={() => setExpandedMetric(expandedMetric ? null : 'roas')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono transition-colors',
              expandedMetric
                ? 'bg-zinc-800/90 border-zinc-700 text-zinc-100'
                : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            )}
          >
            <Icons.sparkles className='size-3 text-emerald-400' />
            <span>{expandedMetric ? 'Close Detail' : 'Comparative Overlay'}</span>
          </button>
        </div>
      </div>

      {/* 5 Minimalist Bento Sparkline Graph Cards */}
      <div className='grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5'>
        {/* CARD 1: Blended ROAS */}
        <Card
          onClick={() => setExpandedMetric(expandedMetric === 'roas' ? null : 'roas')}
          className={cn(
            'group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-4 shadow-none transition-all cursor-pointer hover:border-emerald-500/40 hover:bg-zinc-950/70',
            expandedMetric === 'roas' && 'ring-1 ring-emerald-500/60 border-emerald-500/40'
          )}
        >
          <div>
            <div className='flex items-center justify-between'>
              <span className='font-mono text-[10px] uppercase tracking-wider text-zinc-400'>
                Blended ROAS
              </span>
              <Badge
                variant='outline'
                className={cn(
                  'border-0 px-1.5 py-0 text-[10px] font-mono font-medium',
                  hasCriticalAnomaly ? 'bg-rose-950/40 text-rose-400' : 'bg-emerald-950/40 text-emerald-400'
                )}
              >
                {hasCriticalAnomaly ? '-37.0% (shock)' : state.telemetry.roasDelta30d}
              </Badge>
            </div>
            <div className='mt-1 flex items-baseline justify-between'>
              <span className={cn('font-mono text-2xl font-bold tracking-tight', hasCriticalAnomaly ? 'text-rose-400' : 'text-zinc-100')}>
                {currentRoas.toFixed(2)}x
              </span>
              <span className='font-mono text-[11px] text-zinc-500'>
                Target: {state.telemetry.targetRoas.toFixed(1)}x
              </span>
            </div>
          </div>

          {/* Minimalist Area Graph */}
          <div className='mt-2.5 h-[64px] w-full min-w-0'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id='sparkRoas' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0%' stopColor={hasCriticalAnomaly ? '#f43f5e' : '#10b981'} stopOpacity={0.28} />
                    <stop offset='100%' stopColor={hasCriticalAnomaly ? '#f43f5e' : '#10b981'} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <ReferenceLine y={3.2} stroke='#52525b' strokeDasharray='2 2' strokeWidth={1} />
                <Tooltip content={<SparklineTooltip unit='' precision={2} />} />
                <Area
                  type='monotone'
                  dataKey='roas'
                  stroke={hasCriticalAnomaly ? '#f43f5e' : '#10b981'}
                  strokeWidth={1.8}
                  fill='url(#sparkRoas)'
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className='mt-1 flex items-center justify-between border-t border-zinc-900 pt-1.5 font-mono text-[10px] text-zinc-500'>
            <span>Floor: 1.80x</span>
            <span className={hasCriticalAnomaly ? 'text-rose-400' : 'text-emerald-400 font-medium'}>
              {hasCriticalAnomaly ? 'Vulnerable' : 'Healthy (+69%)'}
            </span>
          </div>
        </Card>

        {/* CARD 2: POAS (Profit on Ad Spend) */}
        <Card
          onClick={() => setExpandedMetric(expandedMetric === 'poas' ? null : 'poas')}
          className={cn(
            'group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-4 shadow-none transition-all cursor-pointer hover:border-cyan-500/40 hover:bg-zinc-950/70',
            expandedMetric === 'poas' && 'ring-1 ring-cyan-500/60 border-cyan-500/40'
          )}
        >
          <div>
            <div className='flex items-center justify-between'>
              <span className='font-mono text-[10px] uppercase tracking-wider text-zinc-400'>
                POAS (Profit / Spend)
              </span>
              <Badge
                variant='outline'
                className={cn(
                  'border-0 px-1.5 py-0 text-[10px] font-mono font-medium',
                  hasCriticalAnomaly ? 'bg-amber-950/40 text-amber-400' : 'bg-cyan-950/40 text-cyan-400'
                )}
              >
                {hasCriticalAnomaly ? '2.05x (-30%)' : '2.92x'}
              </Badge>
            </div>
            <div className='mt-1 flex items-baseline justify-between'>
              <span className='font-mono text-2xl font-bold tracking-tight text-zinc-100'>
                {currentPoas.toFixed(2)}x
              </span>
              <span className='font-mono text-[11px] text-zinc-500'>
                B/E: 1.00x
              </span>
            </div>
          </div>

          {/* Minimalist Area Graph */}
          <div className='mt-2.5 h-[64px] w-full min-w-0'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id='sparkPoas' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0%' stopColor='#06b6d4' stopOpacity={0.28} />
                    <stop offset='100%' stopColor='#06b6d4' stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <ReferenceLine y={1.0} stroke='#52525b' strokeDasharray='2 2' strokeWidth={1} />
                <Tooltip content={<SparklineTooltip unit='' precision={2} />} />
                <Area
                  type='monotone'
                  dataKey='poas'
                  stroke='#06b6d4'
                  strokeWidth={1.8}
                  fill='url(#sparkPoas)'
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className='mt-1 flex items-center justify-between border-t border-zinc-900 pt-1.5 font-mono text-[10px] text-zinc-500'>
            <span>Net Contribution</span>
            <span className='text-cyan-400 font-medium'>+192% Net Margin</span>
          </div>
        </Card>

        {/* CARD 3: Portfolio MER */}
        <Card
          onClick={() => setExpandedMetric(expandedMetric === 'mer' ? null : 'mer')}
          className={cn(
            'group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-4 shadow-none transition-all cursor-pointer hover:border-purple-500/40 hover:bg-zinc-950/70',
            expandedMetric === 'mer' && 'ring-1 ring-purple-500/60 border-purple-500/40'
          )}
        >
          <div>
            <div className='flex items-center justify-between'>
              <span className='font-mono text-[10px] uppercase tracking-wider text-zinc-400'>
                Portfolio MER
              </span>
              <Badge
                variant='outline'
                className='border-0 bg-purple-950/40 px-1.5 py-0 text-[10px] font-mono font-medium text-purple-400'
              >
                Rev / Spend
              </Badge>
            </div>
            <div className='mt-1 flex items-baseline justify-between'>
              <span className='font-mono text-2xl font-bold tracking-tight text-zinc-100'>
                {currentMer.toFixed(2)}x
              </span>
              <span className='font-mono text-[11px] text-zinc-500'>
                Min: 3.50x
              </span>
            </div>
          </div>

          {/* Minimalist Area Graph */}
          <div className='mt-2.5 h-[64px] w-full min-w-0'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id='sparkMer' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0%' stopColor='#a855f7' stopOpacity={0.28} />
                    <stop offset='100%' stopColor='#a855f7' stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <ReferenceLine y={3.5} stroke='#52525b' strokeDasharray='2 2' strokeWidth={1} />
                <Tooltip content={<SparklineTooltip unit='' precision={2} />} />
                <Area
                  type='monotone'
                  dataKey='mer'
                  stroke='#a855f7'
                  strokeWidth={1.8}
                  fill='url(#sparkMer)'
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className='mt-1 flex items-center justify-between border-t border-zinc-900 pt-1.5 font-mono text-[10px] text-zinc-500'>
            <span>Marketing Efficiency</span>
            <span className='text-purple-400 font-medium'>High Yield</span>
          </div>
        </Card>

        {/* CARD 4: 24H Ad Spend Pacing */}
        <Card
          onClick={() => setExpandedMetric(expandedMetric === 'spend' ? null : 'spend')}
          className={cn(
            'group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-4 shadow-none transition-all cursor-pointer hover:border-blue-500/40 hover:bg-zinc-950/70',
            expandedMetric === 'spend' && 'ring-1 ring-blue-500/60 border-blue-500/40'
          )}
        >
          <div>
            <div className='flex items-center justify-between'>
              <span className='font-mono text-[10px] uppercase tracking-wider text-zinc-400'>
                24H Ad Spend
              </span>
              <Badge
                variant='outline'
                className='border-0 bg-blue-950/40 px-1.5 py-0 text-[10px] font-mono font-medium text-blue-400'
              >
                Pacing: 74%
              </Badge>
            </div>
            <div className='mt-1 flex items-baseline justify-between'>
              <span className='font-mono text-2xl font-bold tracking-tight text-zinc-100'>
                ${currentSpend.toLocaleString()}
              </span>
              <span className='font-mono text-[11px] text-zinc-500'>
                Cap: $25k/d
              </span>
            </div>
          </div>

          {/* Minimalist Area Graph */}
          <div className='mt-2.5 h-[64px] w-full min-w-0'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id='sparkSpend' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0%' stopColor='#3b82f6' stopOpacity={0.28} />
                    <stop offset='100%' stopColor='#3b82f6' stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Tooltip content={<SparklineTooltip unit='$' precision={0} />} />
                <Area
                  type='monotone'
                  dataKey='spend'
                  stroke='#3b82f6'
                  strokeWidth={1.8}
                  fill='url(#sparkSpend)'
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className='mt-1 flex items-center justify-between border-t border-zinc-900 pt-1.5 font-mono text-[10px] text-zinc-500'>
            <span>Dual-Knapsack Cap</span>
            <span className='text-blue-400 font-medium'>Budget Safe</span>
          </div>
        </Card>

        {/* CARD 5: Inventory Stock Runway Index */}
        <Card
          onClick={() => setExpandedMetric(expandedMetric === 'stock' ? null : 'stock')}
          className={cn(
            'group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-4 shadow-none transition-all cursor-pointer hover:border-amber-500/40 hover:bg-zinc-950/70',
            expandedMetric === 'stock' && 'ring-1 ring-amber-500/60 border-amber-500/40'
          )}
        >
          <div>
            <div className='flex items-center justify-between'>
              <span className='font-mono text-[10px] uppercase tracking-wider text-zinc-400'>
                Inventory Runway Index
              </span>
              <Badge
                variant='outline'
                className={cn(
                  'border-0 px-1.5 py-0 text-[10px] font-mono font-medium',
                  hasCriticalAnomaly
                    ? 'bg-rose-950/50 text-rose-400 animate-pulse'
                    : 'bg-emerald-950/40 text-emerald-400'
                )}
              >
                {hasCriticalAnomaly ? '1 SKU Out of Stock' : '0 Stockouts'}
              </Badge>
            </div>
            <div className='mt-1 flex items-baseline justify-between'>
              <span className={cn('font-mono text-2xl font-bold tracking-tight', hasCriticalAnomaly ? 'text-rose-400' : 'text-zinc-100')}>
                {hasCriticalAnomaly ? '0 units' : `${currentStockScore}%`}
              </span>
              <span className='font-mono text-[11px] text-zinc-500'>
                {hasCriticalAnomaly ? 'AF1 Depleted' : 'Runway &gt; 21d'}
              </span>
            </div>
          </div>

          {/* Minimalist Area Graph */}
          <div className='mt-2.5 h-[64px] w-full min-w-0'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id='sparkStock' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0%' stopColor={hasCriticalAnomaly ? '#f43f5e' : '#10b981'} stopOpacity={0.28} />
                    <stop offset='100%' stopColor={hasCriticalAnomaly ? '#f43f5e' : '#10b981'} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <ReferenceLine y={20} stroke='#52525b' strokeDasharray='2 2' strokeWidth={1} />
                <Tooltip content={<SparklineTooltip unit='' precision={0} />} />
                <Area
                  type='stepAfter'
                  dataKey='stockHealth'
                  stroke={hasCriticalAnomaly ? '#f43f5e' : '#10b981'}
                  strokeWidth={1.8}
                  fill='url(#sparkStock)'
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className='mt-1 flex items-center justify-between border-t border-zinc-900 pt-1.5 font-mono text-[10px] text-zinc-500'>
            <span>Fulfillment Health</span>
            <span className={hasCriticalAnomaly ? 'text-rose-400 font-bold' : 'text-emerald-400 font-medium'}>
              {hasCriticalAnomaly ? 'Throttle Active' : 'Nominal'}
            </span>
          </div>
        </Card>
      </div>

      {/* Expanded Comparative Trajectory Overlay (Appears on click or toggle) */}
      {expandedMetric && (
        <div className='rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-5 shadow-none transition-all'>
          <div className='flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/60 pb-3 mb-4'>
            <div>
              <div className='flex items-center gap-2'>
                <span className='size-2 rounded-full bg-emerald-400' />
                <h3 className='font-mono text-xs font-bold uppercase tracking-wider text-zinc-200'>
                  Comparative Overlay: {expandedMetric === 'roas' ? 'ROAS vs Target Baseline' : expandedMetric === 'poas' ? 'POAS vs Breakeven Floor' : expandedMetric === 'mer' ? 'Portfolio MER Efficiency' : expandedMetric === 'spend' ? 'Spend vs Revenue Trajectory' : 'Inventory Stock Trajectory'}
                </h3>
              </div>
              <p className='font-mono text-[11px] text-zinc-500 mt-0.5'>
                Detailed daily trajectory points over trailing {timeRange.toUpperCase()} across {channel === 'all' ? 'All Channels (Blended)' : channel.toUpperCase()}
              </p>
            </div>

            <div className='flex items-center gap-2'>
              {/* Metric Quick Switcher */}
              <div className='flex items-center rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-0.5 text-[11px] font-mono'>
                {(['roas', 'poas', 'mer', 'spend', 'stock'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setExpandedMetric(m)}
                    className={cn(
                      'px-2.5 py-1 rounded uppercase transition-colors',
                      expandedMetric === m
                        ? 'bg-zinc-800 font-bold text-zinc-100'
                        : 'text-zinc-500 hover:text-zinc-300'
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setExpandedMetric(null)}
                className='px-2 py-1 text-zinc-500 hover:text-zinc-300 font-mono text-xs'
                title='Close overlay'
              >
                ✕
              </button>
            </div>
          </div>

          {/* Expanded Chart Canvas */}
          <div className='h-[240px] w-full min-w-0'>
            <ResponsiveContainer width='100%' height='100%'>
              {expandedMetric === 'spend' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id='expSpend' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='0%' stopColor='#3b82f6' stopOpacity={0.25} />
                      <stop offset='100%' stopColor='#3b82f6' stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id='expRev' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='0%' stopColor='#10b981' stopOpacity={0.25} />
                      <stop offset='100%' stopColor='#10b981' stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='2 2' stroke='#1c1d22' vertical={false} />
                  <XAxis dataKey='date' stroke='#71717a' fontSize={10} tickLine={false} fontFamily='monospace' />
                  <YAxis stroke='#71717a' fontSize={10} tickLine={false} fontFamily='monospace' tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className='rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 font-mono text-xs shadow-lg'>
                            <div className='text-zinc-500 mb-1'>{label}</div>
                            {payload.map((p: any) => (
                              <div key={p.dataKey} className='flex items-center justify-between gap-4 py-0.5'>
                                <span className='capitalize' style={{ color: p.color }}>{p.name}:</span>
                                <span className='font-bold text-zinc-100'>${p.value?.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type='monotone' dataKey='revenue' name='Revenue' stroke='#10b981' strokeWidth={2} fill='url(#expRev)' />
                  <Area type='monotone' dataKey='spend' name='Spend' stroke='#3b82f6' strokeWidth={2} fill='url(#expSpend)' />
                </AreaChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray='2 2' stroke='#1c1d22' vertical={false} />
                  <XAxis dataKey='date' stroke='#71717a' fontSize={10} tickLine={false} fontFamily='monospace' />
                  <YAxis
                    stroke='#71717a'
                    fontSize={10}
                    tickLine={false}
                    fontFamily='monospace'
                    domain={expandedMetric === 'roas' ? [0, 8] : expandedMetric === 'poas' ? [0, 5] : expandedMetric === 'mer' ? [0, 7] : [0, 110]}
                  />
                  {expandedMetric === 'roas' && (
                    <>
                      <ReferenceLine y={3.2} stroke='#10b981' strokeDasharray='3 3' label={{ value: 'Target 3.2x', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }} />
                      <ReferenceLine y={1.8} stroke='#f59e0b' strokeDasharray='3 3' label={{ value: 'Floor 1.8x', fill: '#f59e0b', fontSize: 10, position: 'insideBottomRight' }} />
                    </>
                  )}
                  {expandedMetric === 'poas' && (
                    <ReferenceLine y={1.0} stroke='#ef4444' strokeDasharray='3 3' label={{ value: 'Breakeven 1.0x', fill: '#ef4444', fontSize: 10, position: 'insideBottomRight' }} />
                  )}
                  {expandedMetric === 'stock' && (
                    <ReferenceLine y={20} stroke='#ef4444' strokeDasharray='3 3' label={{ value: 'Critical Safety (20%)', fill: '#ef4444', fontSize: 10, position: 'insideBottomRight' }} />
                  )}
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const p = payload[0];
                        return (
                          <div className='rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 font-mono text-xs shadow-lg'>
                            <div className='text-zinc-500 mb-1'>{label}</div>
                            <div className='flex items-center gap-2'>
                              <span style={{ color: p.color }} className='capitalize font-medium'>{p.name}:</span>
                              <span className='font-bold text-zinc-100'>{p.value}{expandedMetric === 'stock' ? '%' : 'x'}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type={expandedMetric === 'stock' ? 'stepAfter' : 'monotone'}
                    dataKey={expandedMetric === 'roas' ? 'roas' : expandedMetric === 'poas' ? 'poas' : expandedMetric === 'mer' ? 'mer' : 'stockHealth'}
                    name={expandedMetric.toUpperCase()}
                    stroke={
                      expandedMetric === 'roas'
                        ? (hasCriticalAnomaly ? '#f43f5e' : '#10b981')
                        : expandedMetric === 'poas'
                        ? '#06b6d4'
                        : expandedMetric === 'mer'
                        ? '#a855f7'
                        : (hasCriticalAnomaly ? '#f43f5e' : '#10b981')
                    }
                    strokeWidth={2.2}
                    dot={{ r: 2.5, fill: '#18181b', strokeWidth: 1.5 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
