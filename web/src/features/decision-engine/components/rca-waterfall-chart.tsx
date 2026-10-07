'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { IconChartBar } from '@tabler/icons-react';

interface WaterfallItem {
  driver: string;
  category: string;
  dollarImpact: number;
  percentageShare: number;
  color?: string;
}

interface RcaWaterfallChartProps {
  items?: WaterfallItem[];
  totalLoss?: number;
}

export function RcaWaterfallChart({ items, totalLoss = 3008.25 }: RcaWaterfallChartProps) {
  const defaultItems: WaterfallItem[] = [
    {
      driver: 'Shopify Stockout',
      category: 'Inventory',
      dollarImpact: 1985.45,
      percentageShare: 66.0,
      color: 'bg-rose-500'
    },
    {
      driver: 'Meta CPM Inflation',
      category: 'Auction',
      dollarImpact: 571.57,
      percentageShare: 19.0,
      color: 'bg-amber-500'
    },
    {
      driver: 'Creative Fatigue',
      category: 'Ad Fatigue',
      dollarImpact: 330.91,
      percentageShare: 11.0,
      color: 'bg-indigo-400'
    },
    {
      driver: 'Landing Page Drift',
      category: 'Latency',
      dollarImpact: 120.33,
      percentageShare: 4.0,
      color: 'bg-zinc-400'
    }
  ];

  const breakdown = items || defaultItems;

  return (
    <Card className='p-4 sm:p-5 border border-border bg-card shadow-none rounded-xl text-card-foreground min-w-0 max-w-full overflow-hidden font-mono space-y-3.5'>
      {/* Header */}
      <div className='flex items-center justify-between border-b border-border/70 pb-3'>
        <div className='flex items-center gap-2'>
          <IconChartBar className='size-4 text-primary' />
          <h3 className='text-xs font-bold text-foreground uppercase tracking-wider'>
            RCA Shapley Loss Decomposition
          </h3>
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-[10px] text-muted-foreground uppercase font-semibold'>Total Loss:</span>
          <span className='text-xs font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded'>
            -₹{Math.round(totalLoss).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Horizontal Bar Visualizations: CAUSE | LOSS | % */}
      <div className='space-y-3 pt-1'>
        {breakdown.map((item, idx) => {
          const barColor = item.color || (idx === 0 ? 'bg-rose-500' : idx === 1 ? 'bg-amber-500' : 'bg-muted-foreground');

          return (
            <div key={idx} className='space-y-1.5'>
              <div className='flex items-center justify-between text-xs'>
                <div className='flex items-center gap-2 min-w-0 font-bold'>
                  <span className='size-2 rounded-xs shrink-0' style={{ backgroundColor: idx === 0 ? '#ef4444' : idx === 1 ? '#f59e0b' : idx === 2 ? '#818cf8' : '#71717a' }} />
                  <span className='text-foreground truncate'>{item.driver}</span>
                </div>

                <div className='flex items-center gap-3 font-mono shrink-0'>
                  <span className='text-muted-foreground text-[11px]'>
                    -₹{Math.round(item.dollarImpact).toLocaleString('en-IN')}
                  </span>
                  <span className='font-bold text-foreground w-10 text-right'>
                    {item.percentageShare.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Horizontal Bar */}
              <div className='w-full bg-muted/60 h-2 rounded-xs overflow-hidden flex'>
                <div
                  className={`h-full ${barColor} transition-all duration-300`}
                  style={{ width: `${item.percentageShare}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
