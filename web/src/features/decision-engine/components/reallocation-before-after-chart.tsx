'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { cn } from '@/lib/utils';
import type { ReallocationExecutionDetails } from '../types/reallocation-execution';

interface ReallocationBeforeAfterChartProps {
  details: ReallocationExecutionDetails;
  className?: string;
}

export function ReallocationBeforeAfterChart({
  details,
  className
}: ReallocationBeforeAfterChartProps) {
  const { chartData } = details;

  return (
    <div className={cn('rounded border border-[#1A1A1A] bg-[#000000] p-4 font-mono text-[#FFFFFF]', className)}>
      <div className='flex items-center justify-between border-b border-[#1A1A1A] pb-2 mb-3'>
        <div>
          <h4 className='text-xs font-bold text-[#FFFFFF] uppercase tracking-wider'>
            Before vs After Capital Allocation
          </h4>
          <p className='text-[10px] text-[#8A8A8A] font-mono'>
            Marginal return projection model (deterministic optimizer values)
          </p>
        </div>
        <div className='flex items-center gap-3 text-[11px] font-mono'>
          <div className='flex items-center gap-1.5'>
            <span className='size-2 rounded-xs bg-[#8A8A8A]' />
            <span className='text-[#8A8A8A] font-medium'>Before</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='size-2 rounded-xs bg-[#FFFFFF]' />
            <span className='text-[#FFFFFF] font-bold'>After</span>
          </div>
        </div>
      </div>

      <div className='h-[180px] w-full pt-1'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={chartData} margin={{ top: 10, right: 15, left: 10, bottom: 5 }} barGap={6}>
            <CartesianGrid strokeDasharray='3 3' stroke='#1A1A1A' vertical={false} />
            <XAxis
              dataKey='metric'
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#8A8A8A', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#8A8A8A', fontSize: 10 }}
              tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const beforeVal = Number(payload[0]?.value ?? 0);
                  const afterVal = Number(payload[1]?.value ?? 0);
                  const delta = afterVal - beforeVal;

                  return (
                    <div className='rounded border border-[#8A8A8A] bg-[#1A1A1A] p-2.5 shadow-none text-xs font-mono text-[#FFFFFF]'>
                      <div className='font-bold text-[#FFFFFF] mb-1 border-b border-[#000000] pb-1 text-[11px]'>
                        {label}
                      </div>
                      <div className='space-y-1 text-[11px]'>
                        <div className='flex justify-between gap-4 text-[#8A8A8A]'>
                          <span>Before:</span>
                          <span className='font-medium text-[#8A8A8A]'>
                            ₹{beforeVal.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className='flex justify-between gap-4 text-[#FFFFFF] font-bold'>
                          <span>After:</span>
                          <span>₹{afterVal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className='flex justify-between gap-4 pt-1 border-t border-[#000000] text-[10px]'>
                          <span className='text-[#8A8A8A]'>Delta:</span>
                          <span className='text-[#FFFFFF] font-bold'>
                            {delta >= 0 ? '+' : ''}₹{delta.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey='Before' fill='#8A8A8A' radius={[0, 0, 0, 0]} maxBarSize={36} />
            <Bar dataKey='After' fill='#FFFFFF' radius={[0, 0, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
