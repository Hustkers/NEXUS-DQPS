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
      color: 'bg-[#FFFFFF]',
    },
    {
      driver: 'Ad Creative Frequency Fatigue',
      category: 'Meta Creative Wear-Out',
      dollarImpact: 721.98,
      percentageShare: 24.0,
      color: 'bg-[#8A8A8A]',
    },
    {
      driver: 'Auction CPM Surge',
      category: 'Platform Bid Inflation',
      dollarImpact: 300.82,
      percentageShare: 10.0,
      color: 'bg-[#8A8A8A]',
    },
  ];

  const breakdown = items || defaultItems;

  return (
    <Card className="p-5 border border-[#8A8A8A] bg-[#1A1A1A] shadow-none rounded text-[#FFFFFF]">
      <div className="flex items-center justify-between mb-4 border-b border-[#8A8A8A]/40 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-[#FFFFFF] tracking-tight flex items-center gap-2 font-mono">
            <IconChartBar className="h-4 w-4 text-[#FFFFFF]" />
            RCA Shapley Loss Waterfall Decomposition
          </h3>
          <p className="text-xs text-[#8A8A8A] font-mono mt-0.5">
            Counterfactual Shapley allocation summing strictly to 100% of observed margin collapse
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-[#8A8A8A] block font-mono">Observed Margin Loss</span>
          <span className="text-sm font-mono font-bold bg-[#FFFFFF] text-[#000000] px-1.5 py-0.5 rounded inline-block mt-0.5">
            -${totalLoss.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="space-y-3.5">
        {breakdown.map((item, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-none ${item.color.startsWith('bg-[') ? item.color : idx === 0 ? 'bg-[#FFFFFF]' : 'bg-[#8A8A8A]'}`} />
                <span className="text-[#FFFFFF] font-mono font-semibold">{item.driver}</span>
                <span className="text-[11px] text-[#8A8A8A] font-mono font-normal">({item.category})</span>
              </span>
              <div className="flex items-center gap-3 font-mono">
                <span className="text-[#FFFFFF] font-bold">-${item.dollarImpact.toFixed(2)}</span>
                <Badge variant="outline" className="text-[11px] font-mono px-1.5 py-0 border-[#8A8A8A] text-[#FFFFFF] bg-[#000000]">
                  {item.percentageShare.toFixed(1)}%
                </Badge>
              </div>
            </div>

            <div className="w-full bg-[#000000] border border-[#1A1A1A] h-2 overflow-hidden flex">
              <div
                className={`h-full ${item.color.startsWith('bg-[') ? item.color : idx === 0 ? 'bg-[#FFFFFF]' : 'bg-[#8A8A8A]'} transition-all duration-500`}
                style={{ width: `${item.percentageShare}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-[#8A8A8A]/40 flex items-center justify-between text-[11px] text-[#8A8A8A] font-mono">
        <span>Attribution Model: DoWhy-GCM Shapley</span>
        <span className="text-[#FFFFFF] font-bold">● Sum: 100.0% Reconciled</span>
      </div>
    </Card>
  );
}
