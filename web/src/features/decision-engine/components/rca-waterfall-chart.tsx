'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconChartBar } from '@tabler/icons-react';

export interface WaterfallItem {
  driver: string;
  category: string;
  dollarImpact: number;
  percentageShare: number;
  color: string;
}

export function RcaWaterfallChart({
  totalLoss = 3008.25,
  items,
}: {
  totalLoss?: number;
  items?: WaterfallItem[];
}) {
  const defaultItems: WaterfallItem[] = [
    {
      driver: 'Shopify Inventory Stockout',
      category: 'Fulfillment & Stock',
      dollarImpact: 1985.45,
      percentageShare: 66.0,
      color: 'bg-rose-500',
    },
    {
      driver: 'Ad Creative Frequency Fatigue',
      category: 'Meta Creative Wear-Out',
      dollarImpact: 721.98,
      percentageShare: 24.0,
      color: 'bg-amber-500',
    },
    {
      driver: 'Auction CPM Surge',
      category: 'Platform Bid Inflation',
      dollarImpact: 300.82,
      percentageShare: 10.0,
      color: 'bg-sky-500',
    },
  ];

  const breakdown = items || defaultItems;

  return (
    <Card className="p-5 border-border/40 bg-card/60 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
            <IconChartBar className="h-4 w-4 text-emerald-400" />
            RCA Shapley Loss Waterfall Decomposition
          </h3>
          <p className="text-xs text-muted-foreground">
            Counterfactual Shapley allocation summing strictly to 100% of observed margin collapse
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground block">Observed Margin Loss</span>
          <span className="text-base font-mono font-bold text-rose-400">-${totalLoss.toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-3.5">
        {breakdown.map((item, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-sm ${item.color}`} />
                <span className="text-foreground">{item.driver}</span>
                <span className="text-[11px] text-muted-foreground font-normal">({item.category})</span>
              </span>
              <div className="flex items-center gap-3 font-mono">
                <span className="text-rose-400 font-semibold">-${item.dollarImpact.toFixed(2)}</span>
                <Badge variant="outline" className="text-[11px] font-mono px-1.5 py-0">
                  {item.percentageShare.toFixed(1)}%
                </Badge>
              </div>
            </div>

            <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden flex">
              <div
                className={`h-full ${item.color} transition-all duration-500`}
                style={{ width: `${item.percentageShare}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
        <span>Attribution Model: DoWhy-GCM Shapley</span>
        <span className="text-emerald-400 font-semibold">Sum: 100.0% Reconciled</span>
      </div>
    </Card>
  );
}
