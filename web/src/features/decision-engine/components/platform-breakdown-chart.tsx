'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export interface PlatformMetric {
  platform: string;
  displayName: string;
  color: string;
  spend: number;
  revenue: number;
  margin: number;
  roas: number;
  share: number;
  campaignsCount: number;
}

export interface DailyDataPoint {
  date: string;
  fullDate: string;
  spend: number;
  revenue: number;
  margin: number;
  roas: number;
  metaSpend: number;
  googleSpend: number;
  amazonSpend: number;
  tiktokSpend: number;
}

interface PlatformBreakdownChartProps {
  platforms: PlatformMetric[];
  dailyTrend: DailyDataPoint[];
  className?: string;
}

export function PlatformBreakdownChart({
  platforms,
  dailyTrend,
  className
}: PlatformBreakdownChartProps) {
  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-3 gap-4', className)}>
      {/* 30-Day Performance Trends (Clean Utilitarian Area Chart) */}
      <div className='lg:col-span-2 rounded-xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between'>
        <div>
          <div className='flex items-center justify-between border-b border-border/80 pb-3 mb-4'>
            <div>
              <h3 className='font-mono text-xs font-bold text-foreground uppercase tracking-wider'>
                30-Day Financial Telemetry
              </h3>
              <p className='text-xs text-muted-foreground font-mono mt-0.5'>
                Spend vs Gross Revenue vs Contribution Margin ($)
              </p>
            </div>
            <div className='flex items-center gap-3 text-xs font-mono'>
              <div className='flex items-center gap-1.5'>
                <span className='size-1.5 rounded-full bg-emerald-500' />
                <span className='text-muted-foreground text-[11px] font-medium'>Revenue</span>
              </div>
              <div className='flex items-center gap-1.5'>
                <span className='size-1.5 rounded-full bg-sky-500' />
                <span className='text-muted-foreground text-[11px] font-medium'>Margin</span>
              </div>
              <div className='flex items-center gap-1.5'>
                <span className='size-1.5 rounded-full bg-indigo-500' />
                <span className='text-muted-foreground text-[11px] font-medium'>Spend</span>
              </div>
            </div>
          </div>

          <div className='h-[250px] w-full pt-2'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id='colorRev' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#10b981' stopOpacity={0.2} />
                    <stop offset='95%' stopColor='#10b981' stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id='colorMargin' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#0284c7' stopOpacity={0.2} />
                    <stop offset='95%' stopColor='#0284c7' stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id='colorSpend' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#6366f1' stopOpacity={0.15} />
                    <stop offset='95%' stopColor='#6366f1' stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' vertical={false} className='dark:stroke-zinc-800' />
                <XAxis
                  dataKey='date'
                  stroke='#64748b'
                  fontSize={10}
                  tickLine={false}
                  interval={4}
                />
                <YAxis
                  stroke='#64748b'
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => `$${val > 999 ? (val / 1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className='rounded-xl border border-border bg-popover/95 backdrop-blur-md p-3 shadow-lg text-xs font-mono space-y-1.5'>
                          <p className='font-bold text-foreground border-b border-border/80 pb-1'>{label}</p>
                          <div className='flex justify-between gap-4 text-emerald-600 dark:text-emerald-400 font-medium'>
                            <span>Revenue:</span>
                            <span>${Number(payload[0]?.value).toLocaleString()}</span>
                          </div>
                          <div className='flex justify-between gap-4 text-sky-600 dark:text-cyan-400 font-medium'>
                            <span>Margin:</span>
                            <span>${Number(payload[1]?.value).toLocaleString()}</span>
                          </div>
                          <div className='flex justify-between gap-4 text-indigo-600 dark:text-blue-400 font-medium'>
                            <span>Spend:</span>
                            <span>${Number(payload[2]?.value).toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type='monotone'
                  dataKey='revenue'
                  stroke='#10b981'
                  strokeWidth={2}
                  fillOpacity={1}
                  fill='url(#colorRev)'
                />
                <Area
                  type='monotone'
                  dataKey='margin'
                  stroke='#0284c7'
                  strokeWidth={2}
                  fillOpacity={1}
                  fill='url(#colorMargin)'
                />
                <Area
                  type='monotone'
                  dataKey='spend'
                  stroke='#6366f1'
                  strokeWidth={2}
                  fillOpacity={1}
                  fill='url(#colorSpend)'
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='flex items-center justify-between text-[11px] font-mono text-muted-foreground border-t border-border/80 pt-3 mt-2'>
          <span>MODEL: Convex Saturation Response Fit (scipy)</span>
          <span className='text-emerald-600 dark:text-emerald-400 font-semibold'>CONVERGED</span>
        </div>
      </div>

      {/* Cross-Platform Attribution & Share */}
      <div className='rounded-xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between'>
        <div>
          <div className='border-b border-border/80 pb-3 mb-4'>
            <h3 className='font-mono text-xs font-bold text-foreground uppercase tracking-wider'>
              Cross-Platform Economics
            </h3>
            <p className='text-xs text-muted-foreground font-mono mt-0.5'>
              Capital Allocation &amp; Efficiency by Ad Network
            </p>
          </div>

          <div className='space-y-4'>
            {platforms.map((p) => {
              return (
                <div key={p.platform} className='space-y-1.5'>
                  <div className='flex items-center justify-between text-xs font-mono'>
                    <div className='flex items-center gap-2'>
                      <span className='size-2 rounded-full' style={{ backgroundColor: p.color }} />
                      <span className='font-semibold text-foreground'>{p.displayName}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-muted-foreground font-medium'>${p.spend.toLocaleString()}</span>
                      <Badge variant='outline' className='text-[10px] font-mono py-0 px-1 border-border text-foreground bg-muted/40 font-semibold'>
                        {p.roas.toFixed(2)}x ROAS
                      </Badge>
                    </div>
                  </div>

                  {/* Micro hairline progress bar */}
                  <div className='h-1 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden'>
                    <div
                      className='h-full rounded-full transition-all duration-700'
                      style={{ width: `${p.share}%`, backgroundColor: p.color }}
                    />
                  </div>

                  <div className='flex items-center justify-between text-[10px] text-muted-foreground font-mono'>
                    <span>Share: {p.share}% ({p.campaignsCount} active)</span>
                    <span className='font-semibold'>Margin: ${p.margin.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className='mt-4 rounded-xl bg-slate-50 dark:bg-zinc-900/40 p-3.5 border border-border/80 text-[11px] font-mono text-muted-foreground space-y-1.5'>
          <div className='flex justify-between items-center'>
            <span className='font-medium text-foreground'>Optimal Channel Shift:</span>
            <span className='text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 px-1.5 py-0.5 rounded text-[10px] font-bold'>
              Meta → Google Shopping
            </span>
          </div>
          <div className='flex justify-between text-[10px] text-muted-foreground'>
            <span>Reason:</span>
            <span>+38% higher SKU unit margin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
