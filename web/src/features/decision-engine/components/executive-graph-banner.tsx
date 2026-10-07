'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
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

// Minimalist Dual-Theme Tooltip for Sparklines
function SparklineTooltip({ active, payload, label, unit = '', precision = 2 }: any) {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const formatted =
      typeof val === 'number'
        ? precision === 0
          ? val.toLocaleString()
          : val.toFixed(precision)
        : val;
    return (
      <div className='rounded-lg border border-border bg-popover/95 px-2.5 py-1.5 text-[11px] font-mono shadow-xl backdrop-blur-md text-popover-foreground pointer-events-none z-50'>
        <div className='flex items-center gap-1.5'>
          <span className='text-muted-foreground'>{label}:</span>
          <span className='font-bold text-foreground'>
            {unit}{formatted}
          </span>
        </div>
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
  const [expandedMetric, setExpandedMetric] = useState<
    'roas' | 'spend' | 'margin' | 'lift' | 'stock' | null
  >(null);
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('30d');

  // Derive high-fidelity daily time-series tailored for active channel and anomaly status
  const fullChartData = useMemo(() => {
    const rawList = state.dailyTrend || [];
    return rawList.map((d: any, idx: number) => {
      const isShockedRecent = hasCriticalAnomaly && idx >= rawList.length - 4;

      let spend = d.spend;
      let revenue = d.revenue;
      let margin = d.margin;
      let roas = d.roas;

      if (channel === 'amazon') {
        spend = d.amazonSpend || spend * 0.35;
        roas = 4.85;
        revenue = spend * roas;
        margin = revenue * 0.58;
      } else if (channel === 'google') {
        spend = d.googleSpend || spend * 0.28;
        roas = 4.22;
        revenue = spend * roas;
        margin = revenue * 0.59;
      } else if (channel === 'meta') {
        spend = d.metaSpend || spend * 0.37;
        roas = isShockedRecent ? 0.35 : 5.48;
        revenue = spend * roas;
        margin = revenue * 0.55;
      } else {
        if (isShockedRecent) {
          roas = +(d.roas * 0.65).toFixed(2);
          revenue = +(d.revenue * 0.70).toFixed(0);
          margin = +(d.margin * 0.62).toFixed(0);
        }
      }

      const poas = +(margin / Math.max(spend, 1)).toFixed(2);
      const mer = +(revenue / Math.max(spend, 1)).toFixed(2);
      const cumulativeLift = Math.round(
        (state.telemetry?.projectedMarginUplift || 84300) *
          ((idx + 1) / Math.max(rawList.length, 1))
      );
      const stockHealth = isShockedRecent
        ? Math.max(0, 100 - (idx - (rawList.length - 5)) * 30)
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
        lift: cumulativeLift,
        stockHealth: Math.round(stockHealth),
        targetRoas: state.telemetry?.targetRoas || 3.2,
        breakevenRoas: 1.8
      };
    });
  }, [state.dailyTrend, state.telemetry, channel, hasCriticalAnomaly]);

  // Filter based on selected time window
  const chartData = useMemo(() => {
    const len = fullChartData.length;
    if (timeRange === '7d') return fullChartData.slice(Math.max(0, len - 7));
    if (timeRange === '14d') return fullChartData.slice(Math.max(0, len - 14));
    return fullChartData;
  }, [fullChartData, timeRange]);

  // Latest snapshot metrics
  const latest = chartData[chartData.length - 1] || {};
  const currentRoas = latest.roas || state.telemetry?.blendedRoas30d || 3.42;
  const currentSpend = latest.spend || state.telemetry?.totalSpend30d || 498400;
  const currentMargin = latest.margin || state.telemetry?.totalMargin30d || 283100;
  const currentPoas = latest.poas || (hasCriticalAnomaly ? 2.05 : 2.92);
  const currentStockScore = latest.stockHealth ?? (hasCriticalAnomaly ? 0 : 98);

  const cardsConfig = [
    {
      id: 'roas' as const,
      title: 'Blended ROAS',
      badge: hasCriticalAnomaly ? '-37.0% (shock)' : state.telemetry?.roasDelta30d || '+14.2%',
      badgeSeverity: hasCriticalAnomaly ? 'critical' : 'nominal',
      value: `${currentRoas.toFixed(2)}x`,
      subtext: `Target: ${(state.telemetry?.targetRoas || 3.2).toFixed(1)}x`,
      footerLabel: 'Floor: 1.80x',
      footerValue: hasCriticalAnomaly ? 'Vulnerable' : 'Healthy (+69%)',
      footerSeverity: hasCriticalAnomaly ? 'critical' : 'nominal',
      dataKey: 'roas',
      color: hasCriticalAnomaly ? '#f43f5e' : '#10b981',
      gradientId: 'sparkRoas',
      referenceLineY: 3.2,
      unit: '',
      precision: 2,
      curveType: 'monotone' as const
    },
    {
      id: 'spend' as const,
      title: '30D Ad Spend',
      badge: '79% Pace',
      badgeSeverity: 'info',
      value: `₹${((state.telemetry?.totalSpend30d || currentSpend) / 1000).toFixed(1)}k`,
      subtext: `Cap: ₹${((state.telemetry?.totalManagedBudget || 630000) / 1000).toFixed(0)}k`,
      footerLabel: 'SLSQP Budget Cap',
      footerValue: 'Optimal',
      footerSeverity: 'info',
      dataKey: 'spend',
      color: '#3b82f6',
      gradientId: 'sparkSpend',
      referenceLineY: undefined,
      unit: '₹',
      precision: 0,
      curveType: 'monotone' as const
    },
    {
      id: 'margin' as const,
      title: 'Contribution Margin',
      badge: `POAS ${currentPoas.toFixed(2)}x`,
      badgeSeverity: 'cyan',
      value: `₹${((state.telemetry?.totalMargin30d || currentMargin) / 1000).toFixed(1)}k`,
      subtext: '56.8% Gross',
      footerLabel: 'Breakeven: 1.00x',
      footerValue: '+192% Net Margin',
      footerSeverity: 'cyan',
      dataKey: 'margin',
      color: '#06b6d4',
      gradientId: 'sparkMargin',
      referenceLineY: undefined,
      unit: '₹',
      precision: 0,
      curveType: 'monotone' as const
    },
    {
      id: 'lift' as const,
      title: 'Protected Lift',
      badge: `${state.telemetry?.activeAnomaliesCount || 0} Anomalies`,
      badgeSeverity: 'purple',
      value: `+₹${((state.telemetry?.projectedMarginUplift || 84300) / 1000).toFixed(1)}k`,
      subtext: `Shift: ₹${((state.telemetry?.reallocationCapitalMoved || 142000) / 1000).toFixed(0)}k`,
      footerLabel: 'CBwK Bandits',
      footerValue: 'Self-Healing',
      footerSeverity: 'purple',
      dataKey: 'lift',
      color: '#a855f7',
      gradientId: 'sparkLift',
      referenceLineY: undefined,
      unit: '+₹',
      precision: 0,
      curveType: 'monotone' as const
    },
    {
      id: 'stock' as const,
      title: 'Stockout Runway',
      badge: hasCriticalAnomaly ? '1 SKU Depleted' : '0 Stockouts',
      badgeSeverity: hasCriticalAnomaly ? 'critical' : 'nominal',
      value: hasCriticalAnomaly ? '0 Units' : `${currentStockScore}%`,
      subtext: hasCriticalAnomaly ? 'AF1 Depleted' : 'Runway > 21d',
      footerLabel: 'ERP Sync',
      footerValue: hasCriticalAnomaly ? 'Throttle Engaged' : 'Nominal (100%)',
      footerSeverity: hasCriticalAnomaly ? 'critical' : 'nominal',
      dataKey: 'stockHealth',
      color: hasCriticalAnomaly ? '#f43f5e' : '#10b981',
      gradientId: 'sparkStock',
      referenceLineY: 20,
      unit: '',
      precision: 0,
      curveType: 'stepAfter' as const
    }
  ];

  return (
    <div className='flex flex-col gap-4'>
      {/* 1. Header Bar with Time Range Selector & Comparative Detail Toggle */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3'>
        <div className='flex items-center gap-2.5'>
          <h2 className='font-mono text-xs font-bold uppercase tracking-wider text-foreground'>
            Executive Financial &amp; Efficiency Trajectories
          </h2>
          <span className='font-mono text-[11px] text-muted-foreground'>
            ({timeRange.toUpperCase()} Trailing •{' '}
            {channel === 'all' ? 'Blended Omnichannel' : channel.toUpperCase()})
          </span>
        </div>

        <div className='flex items-center gap-2'>
          {/* Timeframe pill selector */}
          <div className='flex items-center rounded-lg border border-border bg-card p-0.5 text-[11px] font-mono shadow-2xs'>
            {(['7d', '14d', '30d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={cn(
                  'px-2.5 py-1 rounded-md uppercase font-semibold transition-all',
                  timeRange === r
                    ? 'bg-muted text-foreground shadow-2xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
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
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all active:scale-[0.98]',
              expandedMetric
                ? 'bg-muted text-foreground border-border font-bold'
                : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted/40'
            )}
            title='Toggle multi-axis comparative trajectory chart'
          >
            <Icons.sparkles className='size-3.5 text-emerald-600 dark:text-emerald-400' />
            <span>{expandedMetric ? 'Close Detail' : 'Comparative Overlay'}</span>
          </button>
        </div>
      </div>

      {/* 2. Five Bento Sparkline Graph Cards with Mission Control Blueprint Grid */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5'>
        {cardsConfig.map((card, idx) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: idx * 0.06,
              ease: [0.22, 1, 0.36, 1]
            }}
            onClick={() => setExpandedMetric(expandedMetric === card.id ? null : card.id)}
            className={cn(
              'group relative rounded-xl border border-border bg-card p-4 transition-all cursor-pointer hover:shadow-md flex flex-col justify-between overflow-hidden',
              expandedMetric === card.id && 'ring-2 ring-emerald-500/50 shadow-sm'
            )}
          >
            {/* Card Header Content */}
            <div className='relative z-10'>
                <div className='flex items-center justify-between'>
                  <span className='font-mono text-[11px] uppercase tracking-wider text-muted-foreground'>
                    {card.title}
                  </span>
                  <Badge
                    variant='outline'
                    className={cn(
                      'border px-1.5 py-0.5 text-[10px] font-mono font-bold',
                      card.badgeSeverity === 'critical' &&
                        'border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 animate-pulse',
                      card.badgeSeverity === 'nominal' &&
                        'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
                      card.badgeSeverity === 'info' &&
                        'border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
                      card.badgeSeverity === 'cyan' &&
                        'border-sky-200 dark:border-cyan-500/30 bg-sky-50 dark:bg-cyan-950/40 text-sky-700 dark:text-cyan-400',
                      card.badgeSeverity === 'purple' &&
                        'border-purple-200 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400'
                    )}
                  >
                    {card.badge}
                  </Badge>
                </div>

                <div className='mt-1.5 flex items-baseline justify-between'>
                  <span
                    className={cn(
                      'font-mono text-2xl font-bold tracking-tight',
                      card.badgeSeverity === 'critical'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-foreground'
                    )}
                  >
                    {card.value}
                  </span>
                  <span className='font-mono text-[11px] text-muted-foreground'>
                    {card.subtext}
                  </span>
                </div>
              </div>

              {/* Animated Sparkline Area Chart with Blueprint Grid Lines */}
              <div className='relative z-10 mt-2.5 h-[68px] w-full min-w-0'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={card.gradientId} x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='0%' stopColor={card.color} stopOpacity={0.35} />
                        <stop offset='100%' stopColor={card.color} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    {card.referenceLineY !== undefined && (
                      <ReferenceLine
                        y={card.referenceLineY}
                        stroke={card.color}
                        strokeDasharray='2 2'
                        strokeWidth={1}
                        strokeOpacity={0.6}
                      />
                    )}
                    <Tooltip
                      content={
                        <SparklineTooltip unit={card.unit} precision={card.precision} />
                      }
                    />
                    <Area
                      type={card.curveType}
                      dataKey={card.dataKey}
                      stroke={card.color}
                      strokeWidth={2.2}
                      fill={`url(#${card.gradientId})`}
                      dot={false}
                      isAnimationActive={true}
                      animationDuration={1300}
                      animationEasing='ease-out'
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Card Footer Status */}
              <div className='relative z-10 mt-1 flex items-center justify-between border-none pt-1.5 font-mono text-[10px] text-muted-foreground'>
                <span>{card.footerLabel}</span>
                <span
                  className={cn(
                    'font-semibold',
                    card.footerSeverity === 'critical' && 'text-rose-600 dark:text-rose-400',
                    card.footerSeverity === 'nominal' && 'text-emerald-600 dark:text-emerald-400',
                    card.footerSeverity === 'info' && 'text-blue-600 dark:text-blue-400',
                    card.footerSeverity === 'cyan' && 'text-cyan-600 dark:text-cyan-400',
                    card.footerSeverity === 'purple' && 'text-purple-600 dark:text-purple-400'
                  )}
                >
                  {card.footerValue}
                </span>
              </div>
          </motion.div>
        ))}
      </div>

      {/* 3. Expanded Comparative Trajectory Studio (Animated with Blueprint Grid Background) */}
      <AnimatePresence>
        {expandedMetric && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className='relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm'
          >
            <div className='relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 mb-4'>
              <div>
                <div className='flex items-center gap-2'>
                  <h3 className='font-mono text-xs font-bold uppercase tracking-wider text-foreground'>
                    Comparative Trajectory Studio:{' '}
                    {expandedMetric === 'roas'
                      ? 'Blended ROAS vs Target Floor'
                      : expandedMetric === 'spend'
                      ? 'Spend vs Gross Revenue Growth'
                      : expandedMetric === 'margin'
                      ? 'Net Contribution Margin & POAS'
                      : expandedMetric === 'lift'
                      ? 'Cumulative Optimizer Protected Lift'
                      : 'Inventory Stock & Fulfillment Health'}
                  </h3>
                </div>
                <p className='font-mono text-[11px] text-muted-foreground mt-0.5'>
                  Telemetry telemetry matrix over trailing {timeRange.toUpperCase()} across{' '}
                  {channel === 'all' ? 'All Channels (Blended)' : channel.toUpperCase()}
                </p>
              </div>

              <div className='flex items-center gap-2'>
                {/* Metric Quick Switcher */}
                <div className='flex items-center rounded-lg border border-[#1A1A1A] bg-muted/40 p-0.5 text-[11px] font-mono shadow-2xs'>
                  {(
                    [
                      { key: 'roas', label: 'ROAS' },
                      { key: 'spend', label: 'Spend' },
                      { key: 'margin', label: 'Margin' },
                      { key: 'lift', label: 'Lift' },
                      { key: 'stock', label: 'Stock' }
                    ] as const
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setExpandedMetric(key)}
                      className={cn(
                        'px-2.5 py-1 rounded-md transition-all font-semibold uppercase',
                        expandedMetric === key
                          ? 'bg-card text-foreground font-bold shadow-2xs border border-[#1A1A1A]'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setExpandedMetric(null)}
                  className='px-2.5 py-1 rounded-md bg-muted/30 border border-[#1A1A1A] hover:bg-muted text-muted-foreground hover:text-foreground font-mono text-xs transition-colors'
                  title='Close studio overlay'
                >
                  Close
                </button>
              </div>
            </div>

            {/* Expanded Animated Chart Canvas with Grid Coordinates */}
            <div className='relative z-10 h-[260px] w-full min-w-0 pt-2'>
              <ResponsiveContainer width='100%' height='100%'>
                {expandedMetric === 'spend' || expandedMetric === 'margin' ? (
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id='expRev' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='0%' stopColor='#10b981' stopOpacity={0.3} />
                        <stop offset='100%' stopColor='#10b981' stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id='expMetric' x1='0' y1='0' x2='0' y2='1'>
                        <stop
                          offset='0%'
                          stopColor={expandedMetric === 'spend' ? '#3b82f6' : '#06b6d4'}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset='100%'
                          stopColor={expandedMetric === 'spend' ? '#3b82f6' : '#06b6d4'}
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      stroke='currentColor'
                      className='opacity-15 dark:opacity-25'
                      vertical={false}
                    />
                    <XAxis
                      dataKey='date'
                      stroke='currentColor'
                      className='opacity-50 text-[10px]'
                      tickLine={false}
                      fontFamily='monospace'
                    />
                    <YAxis
                      stroke='currentColor'
                      className='opacity-50 text-[10px]'
                      tickLine={false}
                      fontFamily='monospace'
                      tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className='rounded-lg border border-border bg-popover/95 p-2.5 font-mono text-xs shadow-xl backdrop-blur-md text-popover-foreground'>
                              <div className='text-muted-foreground font-bold mb-1'>{label}</div>
                              {payload.map((p: any) => (
                                <div
                                  key={p.dataKey}
                                  className='flex items-center justify-between gap-4 py-0.5'
                                >
                                  <span
                                    className='capitalize font-medium'
                                    style={{ color: p.color }}
                                  >
                                    {p.name}:
                                  </span>
                                  <span className='font-bold text-foreground'>
                                    ₹{p.value?.toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type='monotone'
                      dataKey='revenue'
                      name='Gross Revenue'
                      stroke='#10b981'
                      strokeWidth={2.2}
                      fill='url(#expRev)'
                      isAnimationActive={true}
                      animationDuration={1400}
                      animationEasing='ease-out'
                    />
                    <Area
                      type='monotone'
                      dataKey={expandedMetric === 'spend' ? 'spend' : 'margin'}
                      name={expandedMetric === 'spend' ? 'Ad Spend' : 'Contribution Margin'}
                      stroke={expandedMetric === 'spend' ? '#3b82f6' : '#06b6d4'}
                      strokeWidth={2.2}
                      fill='url(#expMetric)'
                      isAnimationActive={true}
                      animationDuration={1400}
                      animationEasing='ease-out'
                    />
                  </AreaChart>
                ) : (
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      stroke='currentColor'
                      className='opacity-15 dark:opacity-25'
                      vertical={false}
                    />
                    <XAxis
                      dataKey='date'
                      stroke='currentColor'
                      className='opacity-50 text-[10px]'
                      tickLine={false}
                      fontFamily='monospace'
                    />
                    <YAxis
                      stroke='currentColor'
                      className='opacity-50 text-[10px]'
                      tickLine={false}
                      fontFamily='monospace'
                      domain={
                        expandedMetric === 'roas'
                          ? [0, 8]
                          : expandedMetric === 'lift'
                          ? [0, 'auto']
                          : [0, 110]
                      }
                      tickFormatter={(v) =>
                        expandedMetric === 'lift'
                          ? `₹${Math.round(v / 1000)}k`
                          : expandedMetric === 'stock'
                          ? `${v}%`
                          : `${v}x`
                      }
                    />
                    {expandedMetric === 'roas' && (
                      <>
                        <ReferenceLine
                          y={3.2}
                          stroke='#10b981'
                          strokeDasharray='3 3'
                          label={{
                            value: 'Target 3.20x',
                            fill: '#10b981',
                            fontSize: 10,
                            position: 'insideTopRight'
                          }}
                        />
                        <ReferenceLine
                          y={1.8}
                          stroke='#f59e0b'
                          strokeDasharray='3 3'
                          label={{
                            value: 'Floor 1.80x',
                            fill: '#f59e0b',
                            fontSize: 10,
                            position: 'insideBottomRight'
                          }}
                        />
                      </>
                    )}
                    {expandedMetric === 'stock' && (
                      <ReferenceLine
                        y={20}
                        stroke='#f43f5e'
                        strokeDasharray='3 3'
                        label={{
                          value: 'Critical Threshold (20%)',
                          fill: '#f43f5e',
                          fontSize: 10,
                          position: 'insideBottomRight'
                        }}
                      />
                    )}
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const p = payload[0];
                          return (
                            <div className='rounded-lg border border-border bg-popover/95 p-2.5 font-mono text-xs shadow-xl backdrop-blur-md text-popover-foreground'>
                              <div className='text-muted-foreground font-bold mb-1'>{label}</div>
                              <div className='flex items-center gap-2'>
                                <span style={{ color: p.color }} className='capitalize font-medium'>
                                  {p.name}:
                                </span>
                                <span className='font-bold text-foreground'>
                                  {expandedMetric === 'lift'
                                    ? `+₹${p.value?.toLocaleString()}`
                                    : expandedMetric === 'stock'
                                    ? `${p.value}%`
                                    : `${p.value}x`}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type={expandedMetric === 'stock' ? 'stepAfter' : 'monotone'}
                      dataKey={
                        expandedMetric === 'roas'
                          ? 'roas'
                          : expandedMetric === 'lift'
                          ? 'lift'
                          : 'stockHealth'
                      }
                      name={
                        expandedMetric === 'roas'
                          ? 'Blended ROAS'
                          : expandedMetric === 'lift'
                          ? 'Protected Margin Lift'
                          : 'Stock Health Index'
                      }
                      stroke={
                        expandedMetric === 'roas'
                          ? hasCriticalAnomaly
                            ? '#f43f5e'
                            : '#10b981'
                          : expandedMetric === 'lift'
                          ? '#a855f7'
                          : hasCriticalAnomaly
                          ? '#f43f5e'
                          : '#10b981'
                      }
                      strokeWidth={2.8}
                      dot={{ r: 3, fill: 'var(--background)', strokeWidth: 1.8 }}
                      activeDot={{ r: 6 }}
                      isAnimationActive={true}
                      animationDuration={1400}
                      animationEasing='ease-out'
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
