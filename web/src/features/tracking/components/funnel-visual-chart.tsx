'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlatformLogo } from '@/components/icons/platform-logos';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

export interface CampaignPerf {
  campaign_id: string;
  platform: string;
  clicks: number;
  product_views: number;
  add_to_carts: number;
  begin_checkouts: number;
  purchases: number;
  conversion_rate: number;
  revenue: number;
  profit: number;
  spend: number;
  roas: number;
  platform_reported_conversions: number;
  discrepancy: number;
  double_counting_flag: boolean;
}

interface FunnelVisualChartProps {
  campaigns: CampaignPerf[];
  selectedCampaign: string;
  onSelectCampaign: (id: string) => void;
  activeCampPerf: CampaignPerf | undefined;
}

export function FunnelVisualChart({
  campaigns,
  selectedCampaign,
  onSelectCampaign,
  activeCampPerf
}: FunnelVisualChartProps) {
  const [activeStage, setActiveStage] = useState<number | null>(null);

  if (!activeCampPerf) return null;

  const funnelData = [
    {
      stage: 'Clicks',
      label: 'Ad Clicks',
      count: activeCampPerf.clicks,
      fill: '#3b82f6',
      prevRate: 100,
      description: 'Paid clicks arriving on landing pages'
    },
    {
      stage: 'PDP Views',
      label: 'Product Views',
      count: activeCampPerf.product_views,
      fill: '#6366f1',
      prevRate: activeCampPerf.clicks > 0
        ? Math.round((activeCampPerf.product_views / activeCampPerf.clicks) * 100)
        : 0,
      description: 'Visitors successfully viewing footwear detail page'
    },
    {
      stage: 'Add to Cart',
      label: 'Add to Cart',
      count: activeCampPerf.add_to_carts,
      fill: '#f59e0b',
      prevRate: activeCampPerf.product_views > 0
        ? Math.round((activeCampPerf.add_to_carts / activeCampPerf.product_views) * 100)
        : 0,
      description: 'High purchase intent expressed'
    },
    {
      stage: 'Checkout',
      label: 'Initiated Checkout',
      count: activeCampPerf.begin_checkouts,
      fill: '#8b5cf6',
      prevRate: activeCampPerf.add_to_carts > 0
        ? Math.round((activeCampPerf.begin_checkouts / activeCampPerf.add_to_carts) * 100)
        : 0,
      description: 'Entered shipping address and payment gateway'
    },
    {
      stage: 'Purchases',
      label: 'Purchases',
      count: activeCampPerf.purchases,
      fill: '#10b981',
      prevRate: activeCampPerf.begin_checkouts > 0
        ? Math.round((activeCampPerf.purchases / activeCampPerf.begin_checkouts) * 100)
        : 0,
      description: 'Settled orders verified with 1st-party event hash'
    }
  ];

  const overallCvr = activeCampPerf.clicks > 0
    ? ((activeCampPerf.purchases / activeCampPerf.clicks) * 100).toFixed(1)
    : '0.0';

  return (
    <Card className="min-w-0 max-w-full overflow-hidden border border-border/80 bg-card/60 backdrop-blur-xs shadow-xs">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold tracking-tight">Campaign Conversion Funnel</CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                {overallCvr}% Overall CVR
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Interactive drop-off telemetry from click to verified purchase
            </CardDescription>
          </div>

          {/* Campaign Selector with Platform Badges */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <select
                value={selectedCampaign}
                onChange={(e) => onSelectCampaign(e.target.value)}
                className="w-full text-xs font-mono border border-border rounded-md px-2.5 py-1.5 bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden"
              >
                {campaigns.map((c) => (
                  <option key={c.campaign_id} value={c.campaign_id}>
                    {c.campaign_id} ({c.platform})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Campaign Pill Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5 scrollbar-none">
          {campaigns.map((c) => {
            const isSelected = c.campaign_id === selectedCampaign;
            return (
              <button
                key={c.campaign_id}
                onClick={() => onSelectCampaign(c.campaign_id)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono shrink-0 transition-all border',
                  isSelected
                    ? 'bg-foreground text-background font-semibold border-foreground shadow-xs'
                    : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-transparent'
                )}
              >
                <PlatformLogo platform={c.platform} size={12} className="shrink-0" />
                <span className="truncate max-w-[110px]">{c.campaign_id}</span>
                <span className={cn('text-[9px] px-1 rounded', isSelected ? 'bg-background/20 text-background' : 'text-muted-foreground')}>
                  {c.purchases} orders
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Interactive Bar Chart Visualizing Stepped Funnel */}
        <div className="p-3 rounded-lg border border-border/50 bg-muted/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
              Step Volume &amp; Stage Drop-off
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              Click stage to inspect friction
            </span>
          </div>

          <div className="h-[160px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={funnelData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                onClick={(e: any) => {
                  if (e && e.activeTooltipIndex !== undefined) {
                    setActiveStage(e.activeTooltipIndex);
                  }
                }}
              >
                <XAxis
                  dataKey="stage"
                  stroke="currentColor"
                  className="opacity-60 text-[10px]"
                  fontSize={10}
                  tickLine={false}
                  fontFamily="monospace"
                />
                <YAxis
                  stroke="currentColor"
                  className="opacity-60 text-[10px]"
                  fontSize={10}
                  tickLine={false}
                  fontFamily="monospace"
                />
                <Tooltip
                  cursor={{ fill: 'currentColor', opacity: 0.05 }}
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-border bg-popover/95 p-2.5 shadow-xl backdrop-blur-md text-xs font-mono space-y-1 text-popover-foreground">
                          <p className="font-bold text-foreground">{d.label}</p>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Volume:</span>
                            <span className="font-semibold text-foreground">{d.count}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Retention from Prior:</span>
                            <span className="font-semibold text-emerald-500">{d.prevRate}%</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground border-t border-border/50 pt-1 mt-1">
                            {d.description}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill}
                      opacity={activeStage === null || activeStage === index ? 1 : 0.4}
                      className="cursor-pointer transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interactive Stage Step Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-center">
          {funnelData.map((stage, idx) => {
            const isHighlighted = activeStage === idx;
            return (
              <button
                key={stage.stage}
                type="button"
                onClick={() => setActiveStage(activeStage === idx ? null : idx)}
                className={cn(
                  'p-2.5 rounded-lg border text-left transition-all cursor-pointer',
                  isHighlighted
                    ? 'border-primary ring-1 ring-primary/40 bg-primary/5 shadow-xs'
                    : 'bg-muted/30 hover:bg-muted/50 border-border/60'
                )}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground truncate">{stage.label}</span>
                  <span
                    className="size-2 rounded-full shrink-0 ml-1"
                    style={{ backgroundColor: stage.fill }}
                  />
                </div>
                <div className="text-lg font-bold font-mono mt-1 text-foreground">
                  {stage.count}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono mt-1 pt-1 border-t border-border/40">
                  <span className="text-muted-foreground">Conv:</span>
                  <span className={cn('font-semibold', stage.prevRate > 50 ? 'text-emerald-600' : 'text-amber-600')}>
                    {stage.prevRate}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Friction Insight Panel */}
        {activeStage !== null && (
          <div className="p-3 rounded-lg border border-border/80 bg-card text-xs space-y-1.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: funnelData[activeStage].fill }}
                />
                Stage Telemetry: {funnelData[activeStage].label}
              </span>
              <button
                onClick={() => setActiveStage(null)}
                className="text-[10px] font-mono text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>
            <p className="text-muted-foreground text-[11px]">
              {funnelData[activeStage].description}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
              <div className="bg-muted/40 p-1.5 rounded">
                <span className="text-muted-foreground block text-[10px]">Volume</span>
                <span className="font-bold text-foreground">{funnelData[activeStage].count}</span>
              </div>
              <div className="bg-muted/40 p-1.5 rounded">
                <span className="text-muted-foreground block text-[10px]">Retention from Previous</span>
                <span className="font-bold text-emerald-600">{funnelData[activeStage].prevRate}%</span>
              </div>
              <div className="bg-muted/40 p-1.5 rounded col-span-2 sm:col-span-1">
                <span className="text-muted-foreground block text-[10px]">Drop-off Loss</span>
                <span className="font-bold text-rose-500">
                  {100 - funnelData[activeStage].prevRate}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Funnel Progress Retention Bars */}
        <div className="space-y-2 pt-1">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground">Click to PDP View Retention</span>
              <span className="font-medium text-foreground">
                {activeCampPerf.clicks > 0
                  ? Math.round((activeCampPerf.product_views / activeCampPerf.clicks) * 100)
                  : 0}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    activeCampPerf.clicks > 0
                      ? (activeCampPerf.product_views / activeCampPerf.clicks) * 100
                      : 0
                  )}%`
                }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground">Cart to Checkout Progression</span>
              <span className="font-medium text-foreground">
                {activeCampPerf.add_to_carts > 0
                  ? Math.round((activeCampPerf.begin_checkouts / activeCampPerf.add_to_carts) * 100)
                  : 0}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    activeCampPerf.add_to_carts > 0
                      ? (activeCampPerf.begin_checkouts / activeCampPerf.add_to_carts) * 100
                      : 0
                  )}%`
                }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground">Checkout to Order Finalization</span>
              <span className="font-medium text-foreground">
                {activeCampPerf.begin_checkouts > 0
                  ? Math.round((activeCampPerf.purchases / activeCampPerf.begin_checkouts) * 100)
                  : 0}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    activeCampPerf.begin_checkouts > 0
                      ? (activeCampPerf.purchases / activeCampPerf.begin_checkouts) * 100
                      : 0
                  )}%`
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
