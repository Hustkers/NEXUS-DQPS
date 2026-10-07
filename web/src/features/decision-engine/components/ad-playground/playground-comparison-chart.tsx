'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { IconChartBar, IconScale } from '@tabler/icons-react';
import type { CandidateAdConfig } from '../../types/ad-playground-types';

interface PlaygroundComparisonChartProps {
  candidates: CandidateAdConfig[];
}

interface TooltipPayloadItem {
  payload: {
    fullName: string;
    rank: number;
    profit: number;
    spend: number;
    revenue: number;
    roas: number;
  };
}

function ComparisonTooltip({
  active,
  payload
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className='rounded-lg border border-border bg-popover/95 p-3 shadow-lg font-mono text-xs text-popover-foreground'>
      <div className='font-bold mb-1 text-foreground'>{d.fullName}</div>
      <div className='text-muted-foreground text-[10px] mb-2'>Rank #{d.rank} Choice</div>
      <div className='space-y-1'>
        <div className='flex justify-between gap-4'>
          <span className='text-emerald-400 font-semibold'>Expected Profit:</span>
          <span>${d.profit.toLocaleString()}</span>
        </div>
        <div className='flex justify-between gap-4'>
          <span className='text-blue-400'>Ad Spend:</span>
          <span>${d.spend.toLocaleString()}</span>
        </div>
        <div className='flex justify-between gap-4'>
          <span className='text-cyan-400'>Predicted Revenue:</span>
          <span>${d.revenue.toLocaleString()}</span>
        </div>
        <div className='flex justify-between gap-4'>
          <span className='text-purple-400'>Predicted ROAS:</span>
          <span>{d.roas.toFixed(2)}x</span>
        </div>
      </div>
    </div>
  );
}

export function PlaygroundComparisonChart({
  candidates
}: PlaygroundComparisonChartProps) {
  const chartData = candidates.map((c) => ({
    name: `#${c.rank} ${c.platform.toUpperCase()}`,
    fullName: c.title,
    spend: c.expected_spend,
    profit: c.predicted_net_profit,
    revenue: c.predicted_revenue,
    roas: c.predicted_roas,
    rank: c.rank,
    isTop: c.rank === 1
  }));

  return (
    <Card className='p-4 border-border/80 bg-card/60 shadow-xs backdrop-blur-xs'>
      <div className='flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3 mb-4'>
        <div className='flex items-center gap-2'>
          <IconChartBar className='size-4 text-cyan-500' />
          <h3 className='text-xs font-mono font-bold uppercase tracking-wider text-foreground'>
            Configuration Yield Comparison: Spend vs Expected Net Profit
          </h3>
        </div>
        <div className='flex items-center gap-3 text-[11px] font-mono text-muted-foreground'>
          <span className='flex items-center gap-1.5'>
            <span className='size-2.5 rounded-sm bg-emerald-500' />
            Net Profit ($)
          </span>
          <span className='flex items-center gap-1.5'>
            <span className='size-2.5 rounded-sm bg-blue-500/70' />
            Ad Spend ($)
          </span>
        </div>
      </div>

      <div className='h-[260px] w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
            <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' opacity={0.4} />
            <XAxis
              dataKey='name'
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              interval={0}
              angle={-20}
              textAnchor='end'
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<ComparisonTooltip />} />
            <Bar dataKey='profit' fill='#10b981' radius={[4, 4, 0, 0]} name='Net Profit' />
            <Bar dataKey='spend' fill='#3b82f6' opacity={0.6} radius={[4, 4, 0, 0]} name='Ad Spend' />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className='mt-3 pt-3 border-t border-border/50 text-[11px] font-mono text-muted-foreground flex flex-wrap items-center justify-between gap-2'>
        <span className='flex items-center gap-1'>
          <IconScale className='size-3.5 text-cyan-400' />
          The engine ranks by <strong>Expected Net Profit</strong> ($ Margin - $ Spend), not raw revenue, preventing over-spending into saturation knees.
        </span>
        <span className='text-emerald-400 font-semibold'>
          Top Configuration Yield: ${chartData[0]?.profit.toLocaleString()} Profit
        </span>
      </div>
    </Card>
  );
}
