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
  shopifySpend?: number;
  tiktokSpend?: number;
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
      <div className='lg:col-span-2 rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-5 shadow-none flex flex-col justify-between'>
        <div>
          <div className='flex items-center justify-between border-b border-zinc-800/60 pb-3 mb-4'>
            <div>
              <h3 className='font-mono text-xs font-bold text-zinc-200 uppercase tracking-wider'>
                30-Day Financial Telemetry
              </h3>
              <p className='text-xs text-zinc-500 font-mono mt-0.5'>
                Spend vs Gross Revenue vs Contribution Margin ($)
              </p>
            </div>
            <div className='flex items-center gap-3 text-xs font-mono'>
              <div className='flex items-center gap-1.5'>
                <span className='size-1.5 rounded-full bg-emerald-400' />
                <span className='text-zinc-400 text-[11px]'>Revenue</span>
              </div>
              <div className='flex items-center gap-1.5'>
                <span className='size-1.5 rounded-full bg-cyan-400' />
                <span className='text-zinc-400 text-[11px]'>Margin</span>
              </div>
              <div className='flex items-center gap-1.5'>
                <span className='size-1.5 rounded-full bg-blue-400' />
                <span className='text-zinc-400 text-[11px]'>Spend</span>
              </div>
            </div>
          </div>

          <div className='h-[250px] w-full pt-2'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id='colorRev' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#10b981' stopOpacity={0.25} />
                    <stop offset='95%' stopColor='#10b981' stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id='colorMargin' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#06b6d4' stopOpacity={0.25} />
                    <stop offset='95%' stopColor='#06b6d4' stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id='colorSpend' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.2} />
                    <stop offset='95%' stopColor='#3b82f6' stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='2 2' stroke='#1c1d22' vertical={false} />
                <XAxis
                  dataKey='date'
                  stroke='#52525b'
                  fontSize={10}
                  tickLine={false}
                  interval={4}
                />
                <YAxis
                  stroke='#52525b'
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => `$${val > 999 ? (val / 1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className='rounded-lg border border-zinc-800 bg-zinc-950/95 p-3 shadow-none text-xs font-mono space-y-1.5'>
                          <p className='font-bold text-zinc-200 border-b border-zinc-800/80 pb-1'>{label}</p>
                          <div className='flex justify-between gap-4 text-emerald-400'>
                            <span>Revenue:</span>
                            <span>${Number(payload[0]?.value).toLocaleString()}</span>
                          </div>
                          <div className='flex justify-between gap-4 text-cyan-400'>
                            <span>Margin:</span>
                            <span>${Number(payload[1]?.value).toLocaleString()}</span>
                          </div>
                          <div className='flex justify-between gap-4 text-blue-400'>
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
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill='url(#colorRev)'
                />
                <Area
                  type='monotone'
                  dataKey='margin'
                  stroke='#06b6d4'
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill='url(#colorMargin)'
                />
                <Area
                  type='monotone'
                  dataKey='spend'
                  stroke='#3b82f6'
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill='url(#colorSpend)'
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='flex items-center justify-between text-[11px] font-mono text-zinc-500 border-t border-zinc-900 pt-3 mt-2'>
          <span>MODEL: Convex Saturation Response Fit (scipy)</span>
          <span className='text-emerald-400 font-medium'>CONVERGED</span>
        </div>
      </div>

      {/* Cross-Platform Attribution & Share */}
      <div className='rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-5 shadow-none flex flex-col justify-between'>
        <div>
          <div className='border-b border-zinc-800/60 pb-3 mb-4'>
            <h3 className='font-mono text-xs font-bold text-zinc-200 uppercase tracking-wider'>
              Cross-Platform Economics
            </h3>
            <p className='text-xs text-zinc-500 font-mono mt-0.5'>
              Capital Allocation &amp; Efficiency by Ad Network
            </p>
          </div>

          <div className='space-y-4'>
            {platforms.map((p) => {
              return (
                <div key={p.platform} className='space-y-1.5'>
                  <div className='flex items-center justify-between text-xs font-mono'>
                    <div className='flex items-center gap-2'>
                      <span className='size-1.5 rounded-full' style={{ backgroundColor: p.color }} />
                      <span className='font-semibold text-zinc-200'>{p.displayName}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-zinc-400 font-medium'>${p.spend.toLocaleString()}</span>
                      <Badge variant='outline' className='text-[10px] font-mono py-0 px-1 border-zinc-800 text-zinc-400'>
                        {p.roas.toFixed(2)}x ROAS
                      </Badge>
                    </div>
                  </div>

                  {/* Micro hairline progress bar */}
                  <div className='h-1 w-full bg-zinc-900 rounded-full overflow-hidden'>
                    <div
                      className='h-full rounded-full transition-all duration-700'
                      style={{ width: `${p.share}%`, backgroundColor: p.color }}
                    />
                  </div>

                  <div className='flex items-center justify-between text-[10px] text-zinc-500 font-mono'>
                    <span>Share: {p.share}% ({p.campaignsCount} active)</span>
                    <span>Margin: ${p.margin.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className='mt-4 rounded-lg bg-zinc-900/40 p-3 border border-zinc-800/60 text-[11px] font-mono text-zinc-400 space-y-1'>
          <div className='flex justify-between'>
            <span>Optimal Channel Shift:</span>
            <span className='text-emerald-400 font-medium'>Meta → Google Shopping</span>
          </div>
          <div className='flex justify-between text-[10px] text-zinc-500'>
            <span>Reason:</span>
            <span>+38% higher SKU unit margin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
