'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PlatformLogo, MetaLogo, GoogleLogo } from '@/components/icons/platform-logos';
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
      <div className='relative overflow-hidden lg:col-span-2 rounded border border-[#1A1A1A] bg-[#1A1A1A] p-5 shadow-none flex flex-col justify-between'>
        <div className='relative z-10'>
          <div className='flex items-center justify-between border-b border-[#000000] pb-3 mb-4'>
            <div>
              <h3 className='font-mono text-xs font-bold text-white uppercase tracking-wider'>
                30-Day Financial Telemetry
              </h3>
              <p className='text-xs text-[#8A8A8A] font-mono mt-0.5'>
                Spend vs Gross Revenue vs Contribution Margin (₹)
              </p>
            </div>
            <div className='flex items-center gap-3 text-xs font-mono'>
              <span className='text-white text-[11px] font-semibold'>— Revenue</span>
              <span className='text-[#8A8A8A] text-[11px] font-semibold'>-- Margin</span>
              <span className='text-white/60 text-[11px] font-semibold'>·· Spend</span>
            </div>
          </div>

          <div className='h-[250px] w-full pt-2'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='#1A1A1A'
                  vertical={false}
                  horizontal={true}
                />
                <XAxis
                  dataKey='date'
                  stroke='#8A8A8A'
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#1A1A1A' }}
                  interval={4}
                  fontFamily='monospace'
                />
                <YAxis
                  stroke='#8A8A8A'
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#1A1A1A' }}
                  fontFamily='monospace'
                  tickFormatter={(val) => `₹${val > 999 ? (val / 1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className='rounded border border-[#1A1A1A] bg-[#000000] p-3 shadow-none text-xs font-mono space-y-1.5'>
                          <p className='font-bold text-white border-b border-[#1A1A1A] pb-1'>{label}</p>
                          <div className='flex justify-between gap-4 text-white font-medium'>
                            <span>Revenue:</span>
                            <span>₹{Number(payload[0]?.value).toLocaleString()}</span>
                          </div>
                          <div className='flex justify-between gap-4 text-[#8A8A8A] font-medium'>
                            <span>Margin:</span>
                            <span>₹{Number(payload[1]?.value).toLocaleString()}</span>
                          </div>
                          <div className='flex justify-between gap-4 text-[#8A8A8A] font-medium'>
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
                  stroke='#FFFFFF'
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
                  stroke='#8A8A8A'
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
                  stroke='#8A8A8A'
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

        <div className='flex items-center justify-between text-[11px] font-mono text-[#8A8A8A] border-t border-[#000000] pt-3 mt-2'>
          <span>MODEL: Convex Saturation Response Fit (scipy)</span>
          <span className='text-white font-semibold'>CONVERGED</span>
        </div>
      </div>

      {/* Cross-Platform Attribution & Share */}
      <div className='rounded border border-[#1A1A1A] bg-[#1A1A1A] p-5 shadow-none flex flex-col justify-between'>
        <div>
          <div className='border-b border-[#000000] pb-3 mb-4'>
            <h3 className='font-mono text-xs font-bold text-white uppercase tracking-wider'>
              Cross-Platform Economics
            </h3>
            <p className='text-xs text-[#8A8A8A] font-mono mt-0.5'>
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
                      <span className='font-semibold text-white'>{p.displayName}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-[#8A8A8A] font-medium'>₹{p.spend.toLocaleString()}</span>
                      <Badge variant='outline' className='text-[10px] font-mono py-0 px-1.5 border-none text-white bg-[#000000] font-semibold'>
                        {p.roas.toFixed(2)}x ROAS
                      </Badge>
                    </div>
                  </div>

                  {/* Micro hairline progress bar */}
                  <div className='h-1 w-full bg-[#000000] rounded-none overflow-hidden'>
                    <div
                      className='h-full bg-white transition-all duration-700'
                      style={{ width: `${p.share}%` }}
                    />
                  </div>

                  <div className='flex items-center justify-between text-[10px] text-[#8A8A8A] font-mono'>
                    <span>Share: {p.share}% ({p.campaignsCount} active)</span>
                    <span className='font-semibold text-white'>Margin: ₹{p.margin.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className='mt-4 rounded bg-[#000000] p-3.5 border border-[#1A1A1A] text-[11px] font-mono text-[#8A8A8A] space-y-1.5'>
          <div className='flex justify-between items-center'>
            <span className='font-medium text-white'>Optimal Channel Shift:</span>
            <span className='text-black bg-white px-1.5 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1.5'>
              <MetaLogo size={12} className='shrink-0' />
              <span>Meta</span>
              <span>→</span>
              <GoogleLogo size={12} className='shrink-0' />
              <span>Google Shopping</span>
            </span>
          </div>
          <div className='flex justify-between text-[10px] text-[#8A8A8A]'>
            <span>Reason:</span>
            <span>+38% higher SKU unit margin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
