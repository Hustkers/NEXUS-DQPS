'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  IconChartLine,
  IconChartBar,
  IconTable,
  IconChevronUp,
  IconTrendingUp,
  IconTrendingDown,
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type MetricFormatter = 'currency' | 'multiplier' | 'percentage' | 'number';

export interface ChartSeries {
  key: string;
  name: string;
  color: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  formatter?: MetricFormatter;
}

export interface AssistantGraphConfig {
  title: string;
  subtitle?: string;
  type: 'line' | 'bar';
  allowTypeToggle?: boolean;
  dataKey: string; // Key for XAxis e.g. "date", "channel", "sku"
  data: Array<Record<string, any>>;
  series: ChartSeries[];
  referenceLine?: {
    y: number;
    label: string;
    color?: string;
  };
  yAxisFormatter?: MetricFormatter;
  summaryBadge?: {
    label: string;
    value: string;
    trend?: 'up' | 'down' | 'neutral';
  };
  compact?: boolean;
  onAskAi?: (graphContext: string) => void;
}

export function formatMetricValue(val: number | string | undefined, formatter?: MetricFormatter): string {
  if (val === undefined || val === null) return '—';
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return String(val);

  switch (formatter) {
    case 'currency':
      if (Math.abs(num) >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
      if (Math.abs(num) >= 1_000) return `$${(num / 1_000).toFixed(0)}k`;
      return `$${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    case 'multiplier':
      return `${num.toFixed(2)}x`;
    case 'percentage':
      return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;
    case 'number':
    default:
      if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
      if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
      return num.toLocaleString('en-US');
  }
}

export function AssistantGraphRenderer({
  config,
  className,
}: {
  config: AssistantGraphConfig;
  className?: string;
}) {
  const [chartType, setChartType] = useState<'line' | 'bar'>(config.type || 'line');
  const [showRawTable, setShowRawTable] = useState(false);
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});

  const toggleSeries = (key: string) => {
    setHiddenSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isCompact = config.compact ?? false;
  const chartHeight = isCompact ? 180 : 220;

  return (
    <div
      className={cn(
        'rounded-xl border border-zinc-800/90 bg-zinc-950/90 p-3 sm:p-3.5 font-mono text-zinc-100 shadow-lg space-y-2.5 overflow-hidden',
        className
      )}
    >
      {/* Header bar: Title, Summary badge, Controls */}
      <div className="flex items-start justify-between gap-2 border-b border-zinc-800/70 pb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-[11px] sm:text-xs font-bold text-zinc-100 tracking-tight flex items-center gap-1.5">
              {chartType === 'line' ? (
                <IconChartLine className="size-3.5 text-emerald-400 shrink-0" />
              ) : (
                <IconChartBar className="size-3.5 text-cyan-400 shrink-0" />
              )}
              <span className="truncate">{config.title}</span>
            </h4>
            {config.summaryBadge && (
              <Badge
                variant="outline"
                className={cn(
                  'text-[9px] px-1.5 py-0 border-zinc-700 bg-zinc-900 font-mono flex items-center gap-1',
                  config.summaryBadge.trend === 'up' && 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30',
                  config.summaryBadge.trend === 'down' && 'border-rose-500/40 text-rose-400 bg-rose-950/30',
                  config.summaryBadge.trend === 'neutral' && 'text-zinc-300'
                )}
              >
                {config.summaryBadge.trend === 'up' && <IconTrendingUp className="size-2.5" />}
                {config.summaryBadge.trend === 'down' && <IconTrendingDown className="size-2.5" />}
                <span>
                  {config.summaryBadge.label}: <strong>{config.summaryBadge.value}</strong>
                </span>
              </Badge>
            )}
          </div>
          {config.subtitle && (
            <p className="text-[9px] sm:text-[10px] text-zinc-400 font-sans mt-0.5 line-clamp-1">
              {config.subtitle}
            </p>
          )}
        </div>

        {/* Action Controls: Chart Toggle, Raw Table Toggle */}
        <div className="flex items-center gap-1 shrink-0">
          {config.allowTypeToggle !== false && (
            <div className="flex items-center p-0.5 rounded-lg border border-zinc-800 bg-zinc-900/80">
              <button
                type="button"
                onClick={() => setChartType('line')}
                title="Switch to Line Chart"
                className={cn(
                  'p-1 rounded-sm text-zinc-400 hover:text-zinc-200 transition-all',
                  chartType === 'line' && 'bg-emerald-500/20 text-emerald-400'
                )}
              >
                <IconChartLine className="size-3" />
              </button>
              <button
                type="button"
                onClick={() => setChartType('bar')}
                title="Switch to Bar Graph"
                className={cn(
                  'p-1 rounded-sm text-zinc-400 hover:text-zinc-200 transition-all',
                  chartType === 'bar' && 'bg-cyan-500/20 text-cyan-400'
                )}
              >
                <IconChartBar className="size-3" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowRawTable((prev) => !prev)}
            title="Inspect Data Points"
            className={cn(
              'p-1 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 transition-all',
              showRawTable && 'border-zinc-700 bg-zinc-800 text-zinc-100'
            )}
          >
            <IconTable className="size-3" />
          </button>
        </div>
      </div>

      {/* Series Badges / Legend Filters */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-[10px] pt-0.5">
        {config.series.map((s) => {
          const isHidden = hiddenSeries[s.key];
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => toggleSeries(s.key)}
              className={cn(
                'flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[9px] font-mono transition-opacity cursor-pointer',
                isHidden
                  ? 'border-zinc-800/50 bg-zinc-950/40 text-zinc-600 opacity-40 line-through'
                  : 'border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-850'
              )}
            >
              <span
                className="size-1.5 rounded-full shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <span>{s.name}</span>
            </button>
          );
        })}
      </div>

      {/* Chart Canvas */}
      <div style={{ height: chartHeight, width: '100%' }} className="relative pt-1">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart
              data={config.data}
              margin={{ top: 8, right: 12, left: -4, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                vertical={false}
              />
              <XAxis
                dataKey={config.dataKey}
                tickLine={false}
                axisLine={{ stroke: '#3f3f46' }}
                tick={{ fill: '#a1a1aa', fontSize: 9 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#a1a1aa', fontSize: 9 }}
                tickFormatter={(v) => formatMetricValue(v, config.yAxisFormatter)}
                domain={['auto', 'auto']}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-zinc-700 bg-zinc-900/95 p-2 shadow-2xl text-[10px] font-mono backdrop-blur-md">
                        <div className="font-semibold text-zinc-100 border-b border-zinc-800 pb-1 mb-1.5">
                          {label}
                        </div>
                        <div className="space-y-1">
                          {payload.map((item: any) => {
                            const seriesDef = config.series.find((s) => s.key === item.dataKey);
                            const valFormatted = formatMetricValue(
                              item.value,
                              seriesDef?.formatter || config.yAxisFormatter
                            );
                            return (
                              <div
                                key={item.dataKey}
                                className="flex items-center justify-between gap-3"
                              >
                                <span className="flex items-center gap-1.5 text-zinc-400">
                                  <span
                                    className="size-1.5 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                  />
                                  <span>{item.name}:</span>
                                </span>
                                <span className="font-bold text-zinc-100">
                                  {valFormatted}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {config.referenceLine && (
                <ReferenceLine
                  y={config.referenceLine.y}
                  stroke={config.referenceLine.color || '#e11d48'}
                  strokeDasharray="3 3"
                  label={{
                    value: config.referenceLine.label,
                    fill: config.referenceLine.color || '#e11d48',
                    fontSize: 8,
                    position: 'insideTopRight',
                  }}
                />
              )}
              {config.series.map((s) => {
                if (hiddenSeries[s.key]) return null;
                return (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.name}
                    stroke={s.color}
                    strokeWidth={s.strokeWidth || 2}
                    strokeDasharray={s.strokeDasharray}
                    dot={{ r: 2.5, fill: s.color, stroke: '#09090b', strokeWidth: 1 }}
                    activeDot={{ r: 4.5, fill: s.color, stroke: '#ffffff', strokeWidth: 1.5 }}
                  />
                );
              })}
            </LineChart>
          ) : (
            <BarChart
              data={config.data}
              margin={{ top: 8, right: 12, left: -4, bottom: 4 }}
              barGap={4}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                vertical={false}
              />
              <XAxis
                dataKey={config.dataKey}
                tickLine={false}
                axisLine={{ stroke: '#3f3f46' }}
                tick={{ fill: '#a1a1aa', fontSize: 9 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#a1a1aa', fontSize: 9 }}
                tickFormatter={(v) => formatMetricValue(v, config.yAxisFormatter)}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-zinc-700 bg-zinc-900/95 p-2 shadow-2xl text-[10px] font-mono backdrop-blur-md">
                        <div className="font-semibold text-zinc-100 border-b border-zinc-800 pb-1 mb-1.5">
                          {label}
                        </div>
                        <div className="space-y-1">
                          {payload.map((item: any) => {
                            const seriesDef = config.series.find((s) => s.key === item.dataKey);
                            const valFormatted = formatMetricValue(
                              item.value,
                              seriesDef?.formatter || config.yAxisFormatter
                            );
                            return (
                              <div
                                key={item.dataKey}
                                className="flex items-center justify-between gap-3"
                              >
                                <span className="flex items-center gap-1.5 text-zinc-400">
                                  <span
                                    className="size-1.5 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                  />
                                  <span>{item.name}:</span>
                                </span>
                                <span className="font-bold text-zinc-100">
                                  {valFormatted}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {config.series.map((s) => {
                if (hiddenSeries[s.key]) return null;
                return (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    name={s.name}
                    fill={s.color}
                    radius={[3, 3, 0, 0]}
                  />
                );
              })}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Raw Data Points Table Inspector */}
      {showRawTable && (
        <div className="pt-2 border-t border-zinc-800/80 animate-in fade-in duration-150">
          <div className="text-[9px] text-zinc-400 font-bold mb-1 flex items-center justify-between">
            <span>Telemetry Data Points ({config.data.length} records)</span>
            <button
              onClick={() => setShowRawTable(false)}
              className="text-zinc-500 hover:text-zinc-300"
            >
              <IconChevronUp className="size-3" />
            </button>
          </div>
          <div className="max-h-28 overflow-y-auto overflow-x-auto rounded border border-zinc-800 bg-black/60 p-1.5 text-[9px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="py-0.5 px-1 font-semibold">{config.dataKey}</th>
                  {config.series.map((s) => (
                    <th key={s.key} className="py-0.5 px-1 font-semibold">
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 font-mono">
                {config.data.map((row, i) => (
                  <tr key={i} className="hover:bg-zinc-900/50">
                    <td className="py-0.5 px-1 text-zinc-300">{row[config.dataKey]}</td>
                    {config.series.map((s) => (
                      <td key={s.key} className="py-0.5 px-1 text-zinc-200">
                        {formatMetricValue(row[s.key], s.formatter || config.yAxisFormatter)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
