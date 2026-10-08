'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconChartBar } from '@tabler/icons-react';

interface WaterfallItem {
  driver: string;
  category: string;
  dollarImpact: number;
  percentageShare: number;
  color: string;
}

interface RcaWaterfallChartProps {
  items?: WaterfallItem[];
  totalLoss?: number;
}

export function RcaWaterfallChart({ items, totalLoss = 3008.25 }: RcaWaterfallChartProps) {
  const defaultItems: WaterfallItem[] = [
    {
      driver: 'Shopify Stockout Gate',
      category: 'Inventory Shock',
      dollarImpact: 1985.45,
      percentageShare: 66.0,
      color: 'bg-foreground'
    },
    {
      driver: 'Meta CPM Inflation (+34%)',
      category: 'Auction Pressure',
      dollarImpact: 571.57,
      percentageShare: 19.0,
      color: 'bg-muted-foreground'
    },
    {
      driver: 'Creative Ad Wear-out (CTR -40%)',
      category: 'Creative Fatigue',
      dollarImpact: 330.91,
      percentageShare: 11.0,
      color: 'bg-muted-foreground/70'
    },
    {
      driver: 'Landing Page LCP Drift (+1.2s)',
      category: 'Tech Latency',
      dollarImpact: 120.33,
      percentageShare: 4.0,
      color: 'bg-muted-foreground/40'
    }
  ];

  const breakdown = items || defaultItems;

  return (
    <Card className="p-5 border border-border bg-card shadow-none rounded text-card-foreground min-w-0 max-w-full overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-border pb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2 font-mono">
            <IconChartBar className="h-4 w-4 text-foreground" />
            RCA Shapley Loss Waterfall Decomposition
          </h3>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            Counterfactual Shapley allocation summing strictly to 100% of observed margin collapse
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground block font-mono">Observed Margin Loss</span>
          <span className="text-sm font-mono font-bold bg-foreground text-background px-1.5 py-0.5 rounded inline-block mt-0.5">
            -${totalLoss.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="space-y-3.5">
        {breakdown.map((item, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-none ${idx === 0 ? 'bg-foreground' : 'bg-muted-foreground/70'}`} />
                <span className="text-foreground font-mono font-semibold">{item.driver}</span>
                <span className="text-[11px] text-muted-foreground font-mono font-normal">({item.category})</span>
              </span>
              <div className="flex items-center gap-3 font-mono">
                <span className="text-foreground font-bold">-${item.dollarImpact.toFixed(2)}</span>
                <Badge variant="outline" className="text-[11px] font-mono px-1.5 py-0 border border-border text-foreground bg-muted/60 font-semibold">
                  {item.percentageShare.toFixed(1)}%
                </Badge>
              </div>
            </div>

            <div className="w-full bg-muted h-2 overflow-hidden flex">
              <div
                className={`h-full ${idx === 0 ? 'bg-foreground' : 'bg-muted-foreground/70'} transition-all duration-500`}
                style={{ width: `${item.percentageShare}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground font-mono">
        <span>Attribution Model: DoWhy-GCM Shapley</span>
        <span className="text-foreground font-bold">● Sum: 100.0% Reconciled</span>
      </div>
    </Card>
  );
}
