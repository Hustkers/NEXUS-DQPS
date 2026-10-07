'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlatformLogo } from '@/components/icons/platform-logos';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import type { CampaignPerf } from './funnel-visual-chart';

interface CampaignProfitabilityAnalyticsProps {
  campaigns: CampaignPerf[];
  selectedCampaign: string;
  onSelectCampaign: (id: string) => void;
  model: 'last_touch' | 'first_touch';
}

export function CampaignProfitabilityAnalytics({
  campaigns,
  selectedCampaign,
  onSelectCampaign,
  model
}: CampaignProfitabilityAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'visual' | 'table'>('visual');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'profit' | 'roas' | 'revenue' | 'spend' | 'orders'>('profit');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesPlatform = platformFilter === 'all' || c.platform.toLowerCase() === platformFilter.toLowerCase();
      const matchesSearch = c.campaign_id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPlatform && matchesSearch;
    });
  }, [campaigns, platformFilter, searchQuery]);

  // Sort campaigns
  const sortedCampaigns = useMemo(() => {
    return [...filteredCampaigns].sort((a, b) => {
      if (sortBy === 'profit') return b.profit - a.profit;
      if (sortBy === 'roas') return b.roas - a.roas;
      if (sortBy === 'revenue') return b.revenue - a.revenue;
      if (sortBy === 'spend') return b.spend - a.spend;
      if (sortBy === 'orders') return b.purchases - a.purchases;
      return 0;
    });
  }, [filteredCampaigns, sortBy]);

  // Data for Spend vs Revenue Chart
  const financialChartData = useMemo(() => {
    return campaigns.map((c) => ({
      id: c.campaign_id,
      name: c.campaign_id.replace(/^(google-|meta-|tiktok-)/, ''),
      Spend: c.spend,
      Revenue: c.revenue,
      Profit: c.profit,
      platform: c.platform
    }));
  }, [campaigns]);

  // Data for ROAS Comparison Chart
  const roasChartData = useMemo(() => {
    return [...campaigns]
      .sort((a, b) => b.roas - a.roas)
      .map((c) => ({
        id: c.campaign_id,
        name: c.campaign_id.replace(/^(google-|meta-|tiktok-)/, ''),
        roas: Number(c.roas.toFixed(2)),
        profit: c.profit,
        platform: c.platform
      }));
  }, [campaigns]);

  // Key Winners & Loss-makers
  const topCampaign = useMemo(() => {
    return [...campaigns].sort((a, b) => b.profit - a.profit)[0];
  }, [campaigns]);

  const worstCampaign = useMemo(() => {
    return [...campaigns].sort((a, b) => a.profit - b.profit)[0];
  }, [campaigns]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card className="min-w-0 max-w-full overflow-hidden border border-border/80 bg-card/60 backdrop-blur-xs shadow-xs">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold tracking-tight">
                Campaign Performance &amp; Profitability Telemetry
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono">
                Attribution: {model === 'last_touch' ? 'Last-Click' : 'First-Click'}
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Interactive capital efficiency, revenue return, and 1st-party conversion attribution
            </CardDescription>
          </div>

          {/* Interactive Mode Switcher: Graphs vs Table */}
          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border border-border/50 text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveTab('visual')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium',
                activeTab === 'visual'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icons.barChart className="size-3.5 text-blue-500" />
              <span>Interactive Telemetry (Graphs)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium',
                activeTab === 'table'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icons.table className="size-3.5 text-emerald-500" />
              <span>Filtered Matrix (Table)</span>
            </button>
          </div>
        </div>

        {/* Global Filter & Sort Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2">
          {/* Platform Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['all', 'google', 'meta', 'tiktok', 'direct'].map((plat) => {
              const isSelected = platformFilter === plat;
              const count = plat === 'all'
                ? campaigns.length
                : campaigns.filter((c) => c.platform.toLowerCase() === plat).length;
              return (
                <button
                  key={plat}
                  onClick={() => setPlatformFilter(plat)}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono transition-all border',
                    isSelected
                      ? 'bg-foreground text-background font-semibold border-foreground shadow-xs'
                      : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-transparent'
                  )}
                >
                  {plat !== 'all' && <PlatformLogo platform={plat} size={11} className="shrink-0" />}
                  <span className="capitalize">{plat}</span>
                  <span className={cn('text-[9px] px-1 rounded', isSelected ? 'bg-background/20 text-background' : 'text-muted-foreground')}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search & Sort */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search campaign..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs font-mono border border-border rounded-md px-2.5 py-1 bg-background text-foreground w-36 sm:w-44 focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="text-xs font-mono border border-border rounded-md px-2 py-1 bg-background text-foreground focus:outline-hidden"
            >
              <option value="profit">Sort: Net Profit</option>
              <option value="roas">Sort: ROAS</option>
              <option value="revenue">Sort: Revenue</option>
              <option value="spend">Sort: Spend</option>
              <option value="orders">Sort: Orders</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {activeTab === 'visual' ? (
          /* ========================================================================= */
          /* 1. VISUAL TELEMETRY & GRAPHS VIEW                                         */
          /* ========================================================================= */
          <div className="space-y-4">
            {/* Executive Highlights Banners */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
              {topCampaign && (
                <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider block">
                      ★ Top Performing Campaign
                    </span>
                    <span className="font-bold text-foreground truncate block max-w-[170px] mt-0.5">
                      {topCampaign.campaign_id}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      ROAS: <strong className="text-emerald-600">{topCampaign.roas.toFixed(2)}x</strong> | Rev: ₹{topCampaign.revenue.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => onSelectCampaign(topCampaign.campaign_id)}
                    className="text-[10px] px-2 py-1 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700 transition-colors"
                  >
                    Inspect
                  </button>
                </div>
              )}

              {worstCampaign && (
                <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-rose-500 font-semibold uppercase tracking-wider block">
                      ▲ Highest Net Loss
                    </span>
                    <span className="font-bold text-foreground truncate block max-w-[170px] mt-0.5">
                      {worstCampaign.campaign_id}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Loss: <strong className="text-rose-500">₹{worstCampaign.profit.toLocaleString()}</strong> | Spend: ₹{worstCampaign.spend.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => onSelectCampaign(worstCampaign.campaign_id)}
                    className="text-[10px] px-2 py-1 bg-rose-500 text-white rounded font-medium hover:bg-rose-600 transition-colors"
                  >
                    Inspect
                  </button>
                </div>
              )}

              <div className="p-3 rounded-lg border border-border/60 bg-muted/20 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
                  🛡️ Ad Fraud Interception
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-lg font-bold text-amber-600">
                    +{campaigns.reduce((s, c) => s + Math.max(0, c.discrepancy), 0)} claims
                  </span>
                  <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-600">
                    Double-Count Blocked
                  </Badge>
                </div>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  Nexus prevented false credit across {campaigns.filter((c) => c.double_counting_flag).length} ad sets
                </span>
              </div>
            </div>

            {/* Interactive Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Chart 1: Spend vs Revenue Bar Chart */}
              <div className="p-3.5 rounded-lg border border-border/50 bg-muted/20 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
                      Capital Flow: Spend vs Attributed Revenue (₹)
                    </h4>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      Click any bar to inspect conversion funnel &amp; ad fraud
                    </p>
                  </div>
                </div>

                <div className="h-[220px] w-full min-w-0 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={financialChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                      onClick={(e: any) => {
                        if (e && e.activePayload && e.activePayload.length) {
                          onSelectCampaign(e.activePayload[0].payload.id);
                        }
                      }}
                    >
                      <XAxis
                        dataKey="name"
                        stroke="currentColor"
                        className="opacity-60 text-[9px]"
                        fontSize={9}
                        tickLine={false}
                        fontFamily="monospace"
                        angle={-20}
                        textAnchor="end"
                      />
                      <YAxis
                        stroke="currentColor"
                        className="opacity-60 text-[10px]"
                        fontSize={10}
                        tickLine={false}
                        fontFamily="monospace"
                        tickFormatter={(v) => `₹${v > 999 ? (v / 1000).toFixed(0) + 'k' : v}`}
                      />
                      <Tooltip
                        content={({ active, payload }: any) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="rounded-lg border border-border bg-popover/95 p-2.5 shadow-xl backdrop-blur-md text-xs font-mono space-y-1 text-popover-foreground">
                                <p className="font-bold text-foreground border-b border-border/50 pb-1">
                                  {d.id}
                                </p>
                                <div className="flex justify-between gap-4 text-muted-foreground">
                                  <span>Spend:</span>
                                  <span className="font-semibold text-foreground">₹{d.Spend.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between gap-4 text-emerald-600">
                                  <span>Revenue:</span>
                                  <span className="font-semibold">₹{d.Revenue.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between gap-4 border-t border-border/50 pt-1">
                                  <span>Contribution:</span>
                                  <span className={cn('font-bold', d.Profit >= 0 ? 'text-emerald-600' : 'text-rose-500')}>
                                    ₹{d.Profit.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                      <Bar dataKey="Spend" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Revenue" fill="#10b981" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: ROAS Efficiency with Breakeven Line */}
              <div className="p-3.5 rounded-lg border border-border/50 bg-muted/20 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
                      ROAS Efficiency &amp; Breakeven (1.0x Threshold)
                    </h4>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      Green indicates profitable ad spend; Amber/Red indicates margin burn
                    </p>
                  </div>
                </div>

                <div className="h-[220px] w-full min-w-0 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={roasChartData}
                      margin={{ top: 10, right: 10, left: -25, bottom: 25 }}
                      onClick={(e: any) => {
                        if (e && e.activePayload && e.activePayload.length) {
                          onSelectCampaign(e.activePayload[0].payload.id);
                        }
                      }}
                    >
                      <XAxis
                        dataKey="name"
                        stroke="currentColor"
                        className="opacity-60 text-[9px]"
                        fontSize={9}
                        tickLine={false}
                        fontFamily="monospace"
                        angle={-20}
                        textAnchor="end"
                      />
                      <YAxis
                        stroke="currentColor"
                        className="opacity-60 text-[10px]"
                        fontSize={10}
                        tickLine={false}
                        fontFamily="monospace"
                        domain={[0, 'dataMax + 0.3']}
                        tickFormatter={(v) => `${v}x`}
                      />
                      <ReferenceLine
                        y={1.0}
                        stroke="#ef4444"
                        strokeDasharray="3 3"
                        label={{
                          value: '1.0x Breakeven',
                          position: 'insideTopRight',
                          fontSize: 9,
                          fill: '#ef4444',
                          fontFamily: 'monospace'
                        }}
                      />
                      <Tooltip
                        content={({ active, payload }: any) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="rounded-lg border border-border bg-popover/95 p-2.5 shadow-xl backdrop-blur-md text-xs font-mono space-y-1 text-popover-foreground">
                                <p className="font-bold text-foreground border-b border-border/50 pb-1">
                                  {d.id}
                                </p>
                                <div className="flex justify-between gap-4">
                                  <span>True ROAS:</span>
                                  <span className={cn('font-bold', d.roas >= 1.0 ? 'text-emerald-500' : 'text-amber-500')}>
                                    {d.roas}x
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span>Contribution:</span>
                                  <span className={cn('font-bold', d.profit >= 0 ? 'text-emerald-500' : 'text-rose-500')}>
                                    ₹{d.profit.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="roas" radius={[3, 3, 0, 0]}>
                        {roasChartData.map((entry) => (
                          <Cell
                            key={`roas-cell-${entry.id}`}
                            fill={entry.roas >= 1.0 ? '#10b981' : entry.roas > 0.4 ? '#f59e0b' : '#ef4444'}
                            className="cursor-pointer"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* 2. STREAMLINED PERFORMANCE MATRIX (FILTERED TABLE VIEW)                   */
          /* ========================================================================= */
          <div className="overflow-x-auto border border-border/60 rounded-lg">
            <table className="w-full text-xs font-mono text-left border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-[11px] text-muted-foreground uppercase tracking-wider">
                  <th className="py-2.5 px-3">Campaign &amp; Platform</th>
                  <th className="py-2.5 px-3 text-right">Orders / CVR</th>
                  <th className="py-2.5 px-3 text-right">Spend / Revenue</th>
                  <th className="py-2.5 px-3 text-center">True ROAS</th>
                  <th className="py-2.5 px-3 text-right">Net Profit</th>
                  <th className="py-2.5 px-3 text-center">Audit</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {sortedCampaigns.map((c) => {
                  const isSelected = c.campaign_id === selectedCampaign;
                  const isExpanded = !!expandedRows[c.campaign_id];

                  return (
                    <React.Fragment key={c.campaign_id}>
                      <tr
                        className={cn(
                          'hover:bg-muted/30 transition-colors',
                          isSelected && 'bg-primary/5'
                        )}
                      >
                        {/* Campaign & Platform */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleRow(c.campaign_id)}
                              className="size-4 rounded flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0 border border-border/60"
                              title="Toggle funnel details"
                            >
                              <Icons.chevronDown className={cn('size-2.5 transition-transform', isExpanded && 'rotate-180')} />
                            </button>
                            <PlatformLogo platform={c.platform} size={14} className="shrink-0" />
                            <div>
                              <div className="font-semibold text-foreground truncate max-w-[180px]">
                                {c.campaign_id}
                              </div>
                              <div className="text-[10px] text-muted-foreground capitalize">
                                {c.platform}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Orders & CVR with Mini Visual Bar */}
                        <td className="py-2.5 px-3 text-right">
                          <div className="font-semibold text-foreground">
                            {c.purchases} orders
                          </div>
                          <div className="flex items-center justify-end gap-1.5 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">
                              {(c.conversion_rate * 100).toFixed(1)}% CVR
                            </span>
                            <div className="w-10 h-1 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${Math.min(100, c.conversion_rate * 300)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Spend vs Revenue */}
                        <td className="py-2.5 px-3 text-right">
                          <div className="font-medium text-foreground">
                            ₹{c.revenue.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            Spend: ₹{c.spend.toLocaleString()}
                          </div>
                        </td>

                        {/* ROAS Badge */}
                        <td className="py-2.5 px-3 text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px] font-mono',
                              c.roas >= 1.0
                                ? 'border-emerald-500/40 text-emerald-600 bg-emerald-500/10'
                                : c.roas > 0.4
                                ? 'border-amber-500/40 text-amber-600 bg-amber-500/10'
                                : 'border-rose-500/40 text-rose-600 bg-rose-500/10'
                            )}
                          >
                            {c.roas.toFixed(2)}x
                          </Badge>
                        </td>

                        {/* Net Profit */}
                        <td className="py-2.5 px-3 text-right font-bold">
                          <span className={c.profit >= 0 ? 'text-emerald-600' : 'text-rose-500'}>
                            ₹{c.profit.toLocaleString()}
                          </span>
                        </td>

                        {/* Audit Badge */}
                        <td className="py-2.5 px-3 text-center">
                          {c.double_counting_flag ? (
                            <Badge variant="outline" className="text-[9px] border-amber-500/50 text-amber-600 bg-amber-500/10">
                              Double Count (+{c.discrepancy})
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                              Verified
                            </Badge>
                          )}
                        </td>

                        {/* Action: Select */}
                        <td className="py-2.5 px-3 text-center">
                          <Button
                            size="sm"
                            variant={isSelected ? 'default' : 'outline'}
                            onClick={() => onSelectCampaign(c.campaign_id)}
                            className="h-6 text-[10px] px-2 font-mono"
                          >
                            {isSelected ? 'Active' : 'Inspect'}
                          </Button>
                        </td>
                      </tr>

                      {/* Expandable Funnel Detail Sub-Row */}
                      {isExpanded && (
                        <tr className="bg-muted/20 border-b border-border/30">
                          <td colSpan={7} className="py-2 px-6">
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground flex-wrap gap-4 py-1">
                              <span>Ad Clicks: <strong className="text-foreground">{c.clicks}</strong></span>
                              <span>Product Views: <strong className="text-foreground">{c.product_views}</strong></span>
                              <span>Add to Carts: <strong className="text-foreground">{c.add_to_carts}</strong></span>
                              <span>Initiated Checkouts: <strong className="text-foreground">{c.begin_checkouts}</strong></span>
                              <span>Platform Claimed: <strong className="text-amber-600">{c.platform_reported_conversions}</strong></span>
                              <span>Double Counting Delta: <strong className="text-rose-500">+{c.discrepancy}</strong></span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
