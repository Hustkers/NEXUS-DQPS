'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import type { CampaignPerf } from './funnel-visual-chart';

interface AttributionFraudChartProps {
  activeCampPerf: CampaignPerf | undefined;
  campaigns: CampaignPerf[];
  model: 'last_touch' | 'first_touch';
}

export function AttributionFraudChart({
  activeCampPerf,
  campaigns,
  model
}: AttributionFraudChartProps) {
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');

  if (!activeCampPerf) return null;

  // Single campaign chart data
  const singleData = [
    {
      name: 'Conversion Orders',
      '1st-Party Verified': activeCampPerf.purchases,
      'Ad Network Claimed': activeCampPerf.platform_reported_conversions,
      'Phantom Inflation': Math.max(0, activeCampPerf.discrepancy)
    }
  ];

  // All campaigns comparison chart data
  const allData = campaigns.map((c) => ({
    name: c.campaign_id.length > 12 ? `${c.campaign_id.substring(0, 10)}...` : c.campaign_id,
    fullName: c.campaign_id,
    '1st-Party': c.purchases,
    Claimed: c.platform_reported_conversions,
    Inflation: Math.max(0, c.discrepancy)
  }));

  const inflationPct = activeCampPerf.purchases > 0
    ? Math.round((activeCampPerf.discrepancy / activeCampPerf.purchases) * 100)
    : activeCampPerf.discrepancy > 0 ? 100 : 0;

  return (
    <Card className="min-w-0 max-w-full overflow-hidden border border-border/80 bg-card/60 backdrop-blur-xs shadow-xs">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-semibold tracking-tight">
              Attribution Discrepancy &amp; Fraud
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Nexus 1st-party cryptographic events vs ad network claims
            </CardDescription>
          </div>
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/50 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setViewMode('single')}
              className={cn(
                'px-2 py-0.5 rounded-md transition-all',
                viewMode === 'single'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={cn(
                'px-2 py-0.5 rounded-md transition-all',
                viewMode === 'all'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              All (7)
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-3.5">
        {/* Visual Graph: Discrepancy Comparison */}
        <div className="p-3 rounded-lg border border-border/50 bg-muted/20">
          <div className="flex items-center justify-between mb-1.5 text-[11px] font-mono">
            <span className="text-muted-foreground uppercase tracking-wider">
              {viewMode === 'single' ? 'Verified vs Self-Reported' : 'Platform Over-Reporting Comparison'}
            </span>
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] font-mono',
                activeCampPerf.discrepancy > 0
                  ? 'border-rose-500/30 text-rose-600 bg-rose-500/10'
                  : 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10'
              )}
            >
              +{activeCampPerf.discrepancy} ({inflationPct}%) Inflation
            </Badge>
          </div>

          <div className="h-[140px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              {viewMode === 'single' ? (
                <BarChart data={singleData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" hide />
                  <YAxis
                    stroke="currentColor"
                    className="opacity-60 text-[10px]"
                    fontSize={10}
                    tickLine={false}
                    fontFamily="monospace"
                  />
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border border-border bg-popover/95 p-2.5 shadow-xl backdrop-blur-md text-xs font-mono space-y-1 text-popover-foreground">
                            <p className="font-bold text-foreground border-b border-border/50 pb-1">
                              {activeCampPerf.campaign_id}
                            </p>
                            <div className="flex justify-between gap-4 text-emerald-600">
                              <span>Verified 1st-Party:</span>
                              <span className="font-bold">{activeCampPerf.purchases} orders</span>
                            </div>
                            <div className="flex justify-between gap-4 text-amber-600">
                              <span>Ad Network Claimed:</span>
                              <span className="font-bold">{activeCampPerf.platform_reported_conversions} orders</span>
                            </div>
                            <div className="flex justify-between gap-4 text-rose-500 border-t border-border/50 pt-1">
                              <span>Phantom Inflation:</span>
                              <span className="font-bold">+{activeCampPerf.discrepancy} ({inflationPct}%)</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingTop: '4px' }}
                  />
                  <Bar dataKey="1st-Party Verified" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Ad Network Claimed" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                </BarChart>
              ) : (
                <BarChart data={allData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    stroke="currentColor"
                    className="opacity-60 text-[9px]"
                    fontSize={9}
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
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="rounded-lg border border-border bg-popover/95 p-2.5 shadow-xl backdrop-blur-md text-xs font-mono space-y-1 text-popover-foreground">
                            <p className="font-bold text-foreground border-b border-border/50 pb-1 truncate max-w-[180px]">
                              {d.fullName}
                            </p>
                            <div className="flex justify-between gap-4 text-emerald-600">
                              <span>1st-Party:</span>
                              <span className="font-bold">{d['1st-Party']}</span>
                            </div>
                            <div className="flex justify-between gap-4 text-amber-600">
                              <span>Claimed:</span>
                              <span className="font-bold">{d.Claimed}</span>
                            </div>
                            <div className="flex justify-between gap-4 text-rose-500">
                              <span>Inflation:</span>
                              <span className="font-bold">+{d.Inflation}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingTop: '4px' }}
                  />
                  <Bar dataKey="1st-Party" fill="#10b981" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Claimed" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Double Counting Alert */}
        {activeCampPerf.double_counting_flag && (
          <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2.5">
            <Icons.warning className="size-4 shrink-0 mt-0.5 text-amber-500" />
            <div>
              <p className="font-semibold text-foreground">Double Counting Detected</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Ad network is claiming cross-device view-through conversions that never clicked or were closed by organic search.
              </p>
            </div>
          </div>
        )}

        {/* Financial Bottomline Telemetry */}
        <div className="p-3 rounded-lg border border-border/60 bg-muted/30 text-xs font-mono space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Attributed Revenue:</span>
            <span className="font-bold text-foreground">₹{activeCampPerf.revenue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">True Contribution Profit:</span>
            <span
              className={cn(
                'font-bold',
                activeCampPerf.profit >= 0 ? 'text-emerald-600' : 'text-rose-500'
              )}
            >
              ₹{activeCampPerf.profit.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-border/40 pt-1.5">
            <span className="text-muted-foreground">
              True ROAS ({model === 'last_touch' ? 'Last-Touch' : 'First-Touch'}):
            </span>
            <span className={cn('font-bold', activeCampPerf.roas >= 1.0 ? 'text-emerald-600' : 'text-amber-600')}>
              {activeCampPerf.roas.toFixed(2)}x
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
