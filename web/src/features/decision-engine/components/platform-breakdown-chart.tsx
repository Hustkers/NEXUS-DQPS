'use client';

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { PlatformLogo, MetaLogo, GoogleLogo } from '@/components/icons/platform-logos';
import { cn } from '@/lib/utils';

export interface PlatformStat {
  platform: string;
  displayName: string;
  spend: number;
  revenue: number;
  margin: number;
  roas: number;
  share: number;
  campaignsCount: number;
}

export interface DailyTrendPoint {
  date: string;
  spend: number;
  revenue: number;
  margin: number;
  roas: number;
}

interface PlatformBreakdownChartProps {
  platforms: PlatformStat[];
  dailyTrend: DailyTrendPoint[];
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
      <div className='relative overflow-hidden lg:col-span-2 rounded border border-border bg-card p-5 shadow-none text-card-foreground flex flex-col justify-between'>
        <div className='relative z-10'>
          <div className='flex items-center justify-between border-b border-border pb-3 mb-4'>
            <div>
              <h3 className='font-mono text-xs font-bold text-foreground uppercase tracking-wider'>
                30-Day Financial Telemetry
              </h3>
              <p className='text-xs text-muted-foreground font-mono mt-0.5'>
                Spend vs Gross Revenue vs Contribution Margin (₹)
              </p>
            </div>
            <div className='flex items-center gap-3 text-xs font-mono'>
              <span className='text-foreground text-[11px] font-semibold'>— Revenue</span>
              <span className='text-muted-foreground text-[11px] font-semibold'>-- Margin</span>
              <span className='text-muted-foreground/70 text-[11px] font-semibold'>·· Spend</span>
            </div>
          </div>

          <div className='h-[250px] w-full pt-2'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='currentColor'
                  className='opacity-15 dark:opacity-20'
                  vertical={false}
                  horizontal={true}
                />
                <XAxis
                  dataKey='date'
                  stroke='currentColor'
                  className='opacity-60 text-[10px]'
                  fontSize={10}
                  tickLine={false}
                  interval={4}
                  fontFamily='monospace'
                />
                <YAxis
                  stroke='currentColor'
                  className='opacity-60 text-[10px]'
                  fontSize={10}
                  tickLine={false}
                  fontFamily='monospace'
                  tickFormatter={(val) => `₹${val > 999 ? (val / 1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className='rounded border border-border bg-popover p-3 shadow-lg text-xs font-mono space-y-1.5 text-popover-foreground'>
                          <p className='font-bold text-foreground border-b border-border pb-1'>{label}</p>
                          <div className='flex justify-between gap-4 text-foreground font-medium'>
                            <span>Revenue:</span>
                            <span>₹{Number(payload[0]?.value).toLocaleString()}</span>
                          </div>
                          <div className='flex justify-between gap-4 text-muted-foreground font-medium'>
                            <span>Margin:</span>
                            <span>₹{Number(payload[1]?.value).toLocaleString()}</span>
                          </div>
                          <div className='flex justify-between gap-4 text-muted-foreground font-medium'>
                            <span>Spend:</span>
                            <span>₹{Number(payload[2]?.value).toLocaleString()}</span>
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
                  stroke='currentColor'
                  strokeWidth={2}
                  fillOpacity={0}
                  fill='transparent'
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationEasing='ease-out'
                />
                <Area
                  type='monotone'
                  dataKey='margin'
                  stroke='currentColor'
                  strokeOpacity={0.6}
                  strokeWidth={1.5}
                  strokeDasharray='4 4'
                  fillOpacity={0}
                  fill='transparent'
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationEasing='ease-out'
                />
                <Area
                  type='monotone'
                  dataKey='spend'
                  stroke='currentColor'
                  strokeOpacity={0.4}
                  strokeWidth={1}
                  strokeDasharray='2 2'
                  fillOpacity={0}
                  fill='transparent'
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationEasing='ease-out'
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='flex items-center justify-between text-[11px] font-mono text-muted-foreground border-t border-border pt-3 mt-2'>
          <span>MODEL: Convex Saturation Response Fit (scipy)</span>
          <span className='text-foreground font-semibold'>CONVERGED</span>
        </div>
      </div>

      {/* Cross-Platform Attribution & Share */}
      <div className='rounded border border-border bg-card p-5 shadow-none text-card-foreground flex flex-col justify-between'>
        <div>
          <div className='border-b border-border pb-3 mb-4'>
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
                      <PlatformLogo platform={p.platform} size={15} className='shrink-0' />
                      <span className='font-semibold text-foreground'>{p.displayName}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-muted-foreground font-medium'>₹{p.spend.toLocaleString()}</span>
                      <Badge variant='outline' className='text-[10px] font-mono py-0 px-1.5 border border-border text-foreground bg-muted/60 font-semibold'>
                        {p.roas.toFixed(2)}x ROAS
                      </Badge>
                    </div>
                  </div>

                  {/* Micro hairline progress bar */}
                  <div className='h-1 w-full bg-muted rounded-none overflow-hidden'>
                    <div
                      className='h-full bg-foreground transition-all duration-700'
                      style={{ width: `${p.share}%` }}
                    />
                  </div>

                  <div className='flex items-center justify-between text-[10px] text-muted-foreground font-mono'>
                    <span>Share: {p.share}% ({p.campaignsCount} active)</span>
                    <span className='font-semibold text-foreground'>Margin: ₹{p.margin.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className='mt-4 rounded bg-muted/40 p-3.5 border border-border text-[11px] font-mono text-muted-foreground space-y-1.5'>
          <div className='flex justify-between items-center'>
            <span className='font-medium text-foreground'>Optimal Channel Shift:</span>
            <span className='text-background bg-foreground px-1.5 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1.5'>
              <MetaLogo size={12} className='shrink-0' />
              <span>Meta</span>
              <span>→</span>
              <GoogleLogo size={12} className='shrink-0' />
              <span>Google Shopping</span>
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
