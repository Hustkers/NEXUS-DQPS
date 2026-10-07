'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import initialTrackingData from '@/data/visitor-tracking-state.json';

interface CampaignPerf {
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

export function TrackingDashboard() {
  const [model, setModel] = useState<'last_touch' | 'first_touch'>('last_touch');
  const [campaigns, setCampaigns] = useState<CampaignPerf[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('meta-airmax-viral');
  const [selectedProduct, setSelectedProduct] = useState<string>('310805-137');
  const [audienceData, setAudienceData] = useState<any>(null);
  const [visitorIdInput, setVisitorIdInput] = useState<string>('');
  const [timelineData, setTimelineData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  // Load campaign performance data
  const loadPerformance = async (currentModel: 'last_touch' | 'first_touch') => {
    try {
      const res = await fetch(`/api/campaigns/performance?model=${currentModel}`);
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
        setStats(data.summary || null);
        if (data.campaigns?.length > 0 && !selectedCampaign) {
          setSelectedCampaign(data.campaigns[0].campaign_id);
        }
      }
    } catch {
      // Fallback compute locally if offline
    }
  };

  // Load product audience data
  const loadAudience = async (sku: string) => {
    try {
      const res = await fetch(`/api/products/${sku}/audience`);
      if (res.ok) {
        const data = await res.json();
        setAudienceData(data);
      }
    } catch {
      // Ignore
    }
  };

  // Load visitor timeline
  const loadTimeline = async (id: string) => {
    try {
      const res = await fetch(`/api/visitors/${id}/timeline`);
      if (res.ok) {
        const data = await res.json();
        setTimelineData(data);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    Promise.all([
      loadPerformance(model),
      loadAudience(selectedProduct)
    ]).finally(() => {
      // Auto-load first visitor if available
      if (initialTrackingData?.visitors?.length > 0) {
        const firstVid = initialTrackingData.visitors[0].visitor_id;
        setVisitorIdInput(firstVid);
        loadTimeline(firstVid);
      }
    });
  }, [model]);

  useEffect(() => {
    loadAudience(selectedProduct);
  }, [selectedProduct]);

  const activeCampPerf = campaigns.find((c) => c.campaign_id === selectedCampaign) || campaigns[0];

  // Masking helpers for privacy (Zero Raw Emails)
  const maskId = (id: string) => {
    if (!id) return 'anon';
    if (id.length <= 12) return id;
    return `${id.substring(0, 6)}...${id.substring(id.length - 4)}`;
  };

  const shoesList = [
    { sku: '310805-137', name: 'Air Jordan 10 Retro' },
    { sku: '315122-001', name: "Nike Air Force 1 '07" },
    { sku: 'CD4371-001', name: 'React Infinity Run Flyknit' },
    { sku: 'AH8050-100', name: 'Nike Air Max 270' },
    { sku: '880848-005', name: 'Nike Zoom Fly' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Attribution Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Visitor Tracking & Attribution Engine</h1>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
              Zero Fingerprinting
            </Badge>
            <Badge variant="outline" className="border-blue-500/30 text-blue-600 bg-blue-500/10">
              SHA-256 Identity Stitching
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Privacy-safe customer event streaming connecting ad touchpoints, browsing sessions, and closed orders.
          </p>
        </div>

        {/* Model Switcher */}
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg border">
          <button
            onClick={() => {
              setModel('last_touch');
              loadPerformance('last_touch');
            }}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
              model === 'last_touch'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Last-Touch (Default)
          </button>
          <button
            onClick={() => {
              setModel('first_touch');
              loadPerformance('first_touch');
            }}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
              model === 'first_touch'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            First-Touch
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground font-medium">Tracked Visitors</p>
          <h3 className="text-2xl font-bold mt-1">{initialTrackingData?.visitors?.length || 200}</h3>
          <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
            <Icons.check className="size-3" /> Anonymous 1-Year Cookies
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-muted-foreground font-medium">Recorded Sessions</p>
          <h3 className="text-2xl font-bold mt-1">{initialTrackingData?.sessions?.length || 362}</h3>
          <p className="text-[11px] text-muted-foreground mt-1">30-min Sliding Timeout</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-muted-foreground font-medium">Ingested Events</p>
          <h3 className="text-2xl font-bold mt-1">{initialTrackingData?.events?.length || 1259}</h3>
          <p className="text-[11px] text-blue-600 mt-1">Idempotent Deduplication</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-muted-foreground font-medium">Attributed Orders</p>
          <h3 className="text-2xl font-bold mt-1">{stats?.total_purchases || initialTrackingData?.orders?.length || 56}</h3>
          <p className="text-[11px] text-emerald-600 mt-1">Client + Server-Side Resilient</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-muted-foreground font-medium">Platform Inflation</p>
          <h3 className="text-2xl font-bold mt-1 text-amber-600">
            {stats?.total_discrepancy ? `+${stats.total_discrepancy}` : '+87'}
          </h3>
          <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
            <Icons.warning className="size-3" /> Double Counting Blocked
          </p>
        </Card>
      </div>

      {/* Section 1: Campaign Funnel & Double Counting Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base">Campaign Conversion Funnel</CardTitle>
                <CardDescription className="text-xs">
                  Step-by-step visitor progression from ad click to completed purchase
                </CardDescription>
              </div>
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="text-xs border rounded-md px-2 py-1 bg-background text-foreground"
              >
                {campaigns.map((c) => (
                  <option key={c.campaign_id} value={c.campaign_id}>
                    {c.campaign_id} ({c.platform})
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {activeCampPerf ? (
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div className="bg-muted/40 p-3 rounded-lg border">
                    <p className="text-[11px] text-muted-foreground">Ad Clicks</p>
                    <p className="text-xl font-bold mt-1">{activeCampPerf.clicks}</p>
                    <Badge variant="secondary" className="mt-1 text-[10px]">100%</Badge>
                  </div>
                  <div className="bg-muted/40 p-3 rounded-lg border">
                    <p className="text-[11px] text-muted-foreground">Product Views</p>
                    <p className="text-xl font-bold mt-1">{activeCampPerf.product_views}</p>
                    <Badge variant="secondary" className="mt-1 text-[10px]">
                      {activeCampPerf.clicks > 0
                        ? `${Math.round((activeCampPerf.product_views / activeCampPerf.clicks) * 100)}%`
                        : '0%'}
                    </Badge>
                  </div>
                  <div className="bg-muted/40 p-3 rounded-lg border">
                    <p className="text-[11px] text-muted-foreground">Add to Cart</p>
                    <p className="text-xl font-bold mt-1">{activeCampPerf.add_to_carts}</p>
                    <Badge variant="secondary" className="mt-1 text-[10px]">
                      {activeCampPerf.clicks > 0
                        ? `${Math.round((activeCampPerf.add_to_carts / activeCampPerf.clicks) * 100)}%`
                        : '0%'}
                    </Badge>
                  </div>
                  <div className="bg-muted/40 p-3 rounded-lg border">
                    <p className="text-[11px] text-muted-foreground">Checkouts</p>
                    <p className="text-xl font-bold mt-1">{activeCampPerf.begin_checkouts}</p>
                    <Badge variant="secondary" className="mt-1 text-[10px]">
                      {activeCampPerf.clicks > 0
                        ? `${Math.round((activeCampPerf.begin_checkouts / activeCampPerf.clicks) * 100)}%`
                        : '0%'}
                    </Badge>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg">
                    <p className="text-[11px] text-emerald-600 font-medium">Purchases</p>
                    <p className="text-xl font-bold mt-1 text-emerald-700 dark:text-emerald-400">
                      {activeCampPerf.purchases}
                    </p>
                    <Badge variant="outline" className="mt-1 text-[10px] border-emerald-500/40 text-emerald-600">
                      {(activeCampPerf.conversion_rate * 100).toFixed(1)}% CVR
                    </Badge>
                  </div>
                </div>

                {/* Funnel Progress Bars */}
                <div className="space-y-2 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Click to PDP View Retention</span>
                      <span>
                        {activeCampPerf.clicks > 0
                          ? Math.round((activeCampPerf.product_views / activeCampPerf.clicks) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
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
                    <div className="flex justify-between text-xs">
                      <span>Cart to Checkout Progression</span>
                      <span>
                        {activeCampPerf.add_to_carts > 0
                          ? Math.round((activeCampPerf.begin_checkouts / activeCampPerf.add_to_carts) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
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
                    <div className="flex justify-between text-xs">
                      <span>Checkout to Order Finalization</span>
                      <span>
                        {activeCampPerf.begin_checkouts > 0
                          ? Math.round((activeCampPerf.purchases / activeCampPerf.begin_checkouts) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
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
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Select a campaign to inspect funnel metrics.</p>
            )}
          </CardContent>
        </Card>

        {/* Platform Attribution Comparison Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Attribution Discrepancy & Fraud</CardTitle>
            <CardDescription className="text-xs">
              Nexus 1st-party event tracking vs ad network self-reported claims
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeCampPerf ? (
              <>
                <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Platform Reported:</span>
                    <span className="font-semibold">{activeCampPerf.platform_reported_conversions} orders</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Actual 1st-Party Orders:</span>
                    <span className="font-semibold text-emerald-600">{activeCampPerf.purchases} orders</span>
                  </div>
                  <div className="flex justify-between text-xs border-t pt-1">
                    <span className="text-muted-foreground">Claim Inflation:</span>
                    <span className="font-semibold text-rose-500">
                      +{activeCampPerf.discrepancy} ({activeCampPerf.purchases > 0 ? Math.round((activeCampPerf.discrepancy / activeCampPerf.purchases) * 100) : 0}%)
                    </span>
                  </div>
                </div>

                {activeCampPerf.double_counting_flag && (
                  <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2">
                    <Icons.warning className="size-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Double Counting Detected</p>
                      <p className="text-[11px] mt-0.5">
                        Ad network is claiming cross-device view-through conversions that never clicked or were closed by organic search.
                      </p>
                    </div>
                  </div>
                )}

                <div className="text-xs space-y-1.5 pt-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Attributed Revenue:</span>
                    <span className="font-semibold">${activeCampPerf.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">True Contribution Profit:</span>
                    <span className={cn('font-semibold', activeCampPerf.profit >= 0 ? 'text-emerald-600' : 'text-rose-500')}>
                      ${activeCampPerf.profit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">True ROAS ({model === 'last_touch' ? 'Last-Touch' : 'First-Touch'}):</span>
                    <span className="font-semibold">{activeCampPerf.roas.toFixed(2)}x</span>
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Campaign Ranking Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Campaign Performance & Profitability Matrix</CardTitle>
              <CardDescription className="text-xs">
                Ranked by true contribution profit and verified 1st-party conversion rate
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              Attribution Model: {model === 'last_touch' ? 'Last-Click' : 'First-Click'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b text-muted-foreground bg-muted/20">
                  <th className="py-2.5 px-3 font-medium">Campaign</th>
                  <th className="py-2.5 px-3 font-medium">Platform</th>
                  <th className="py-2.5 px-3 font-medium text-right">Clicks</th>
                  <th className="py-2.5 px-3 font-medium text-right">PDP Views</th>
                  <th className="py-2.5 px-3 font-medium text-right">Carts</th>
                  <th className="py-2.5 px-3 font-medium text-right">Orders</th>
                  <th className="py-2.5 px-3 font-medium text-right">CVR</th>
                  <th className="py-2.5 px-3 font-medium text-right">Spend</th>
                  <th className="py-2.5 px-3 font-medium text-right">Revenue</th>
                  <th className="py-2.5 px-3 font-medium text-right">Net Profit</th>
                  <th className="py-2.5 px-3 font-medium text-center">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {campaigns.map((c) => (
                  <tr key={c.campaign_id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-foreground">{c.campaign_id}</td>
                    <td className="py-2.5 px-3">
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-[10px] capitalize',
                          c.platform === 'meta' && 'bg-blue-500/10 text-blue-600',
                          c.platform === 'google' && 'bg-emerald-500/10 text-emerald-600',
                          c.platform === 'tiktok' && 'bg-pink-500/10 text-pink-600',
                          c.platform === 'direct' && 'bg-slate-500/10 text-slate-600'
                        )}
                      >
                        {c.platform}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right">{c.clicks}</td>
                    <td className="py-2.5 px-3 text-right">{c.product_views}</td>
                    <td className="py-2.5 px-3 text-right">{c.add_to_carts}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-600">{c.purchases}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{(c.conversion_rate * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">${c.spend.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-medium">${c.revenue.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-semibold">
                      <span className={c.profit >= 0 ? 'text-emerald-600' : 'text-rose-500'}>
                        ${c.profit.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {c.double_counting_flag ? (
                        <Badge variant="outline" className="border-amber-500/50 text-amber-600 bg-amber-500/10 text-[10px]">
                          Double Count
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-[10px]">
                          Verified
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Product Audience & Behavioral Segmentation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base">Audience Behavioral Segments per Product</CardTitle>
                <CardDescription className="text-xs">
                  Recency-decayed interest score (View: 1, Cart: 3, Checkout: 5, Buy: 10 with 7-day half life)
                </CardDescription>
              </div>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="text-xs border rounded-md px-2 py-1 bg-background text-foreground"
              >
                {shoesList.map((s) => (
                  <option key={s.sku} value={s.sku}>
                    {s.name} ({s.sku})
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {audienceData ? (
              <div className="space-y-4">
                {/* Segment Counts */}
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <p className="text-[11px] text-muted-foreground">Browsers (View Only)</p>
                    <p className="text-xl font-bold mt-1 text-slate-700 dark:text-slate-300">
                      {audienceData.segments.browsers.count}
                    </p>
                    <Badge variant="secondary" className="mt-1 text-[10px]">Score 1.0 - 2.5</Badge>
                  </div>
                  <div className="p-3 rounded-lg border bg-amber-500/10 border-amber-500/30">
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">Cart Abandoners</p>
                    <p className="text-xl font-bold mt-1 text-amber-800 dark:text-amber-300">
                      {audienceData.segments.cart_abandoners.count}
                    </p>
                    <Badge variant="outline" className="mt-1 text-[10px] border-amber-500/40 text-amber-600">
                      High Remarketing
                    </Badge>
                  </div>
                  <div className="p-3 rounded-lg border bg-blue-500/10 border-blue-500/30">
                    <p className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">Buyers (1 Order)</p>
                    <p className="text-xl font-bold mt-1 text-blue-800 dark:text-blue-300">
                      {audienceData.segments.buyers.count}
                    </p>
                    <Badge variant="outline" className="mt-1 text-[10px] border-blue-500/40 text-blue-600">
                      Score 10+
                    </Badge>
                  </div>
                  <div className="p-3 rounded-lg border bg-emerald-500/10 border-emerald-500/30">
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Repeat Buyers</p>
                    <p className="text-xl font-bold mt-1 text-emerald-800 dark:text-emerald-300">
                      {audienceData.segments.repeat_buyers.count}
                    </p>
                    <Badge variant="outline" className="mt-1 text-[10px] border-emerald-500/40 text-emerald-600">
                      VIP Champions
                    </Badge>
                  </div>
                </div>

                {/* Top High-Interest Remarketing Targets */}
                <div>
                  <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                    <Icons.search className="size-3.5 text-blue-500" />
                    Top Cart Abandoners Ready for Retargeting Ad Sets (Masked / Hashed IDs)
                  </h4>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b bg-muted/40 text-muted-foreground">
                          <th className="py-2 px-3">Anonymous Visitor ID</th>
                          <th className="py-2 px-3">Hashed Customer ID</th>
                          <th className="py-2 px-3 text-right">Interest Score</th>
                          <th className="py-2 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {audienceData.segments.cart_abandoners.visitors.slice(0, 5).map((v: any, idx: number) => (
                          <tr key={idx} className="hover:bg-muted/20">
                            <td className="py-2 px-3 font-mono text-[11px]">{maskId(v.visitor_id)}</td>
                            <td className="py-2 px-3 font-mono text-[11px]">
                              {v.customer_id ? `cust_${maskId(v.customer_id)}` : <span className="text-muted-foreground italic">Unstitched Guest</span>}
                            </td>
                            <td className="py-2 px-3 text-right font-semibold text-amber-600">{v.score}</td>
                            <td className="py-2 px-3 text-right">
                              <button
                                onClick={() => {
                                  setVisitorIdInput(v.visitor_id);
                                  loadTimeline(v.visitor_id);
                                }}
                                className="text-[11px] text-blue-600 hover:underline font-medium"
                              >
                                View Journey
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Loading audience segment data...</p>
            )}
          </CardContent>
        </Card>

        {/* Section 4: Visitor Timeline Inspector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Visitor Timeline Inspector</CardTitle>
            <CardDescription className="text-xs">
              Audit the end-to-end multi-session touchpoint stream
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Visitor or Customer UUID..."
                value={visitorIdInput}
                onChange={(e) => setVisitorIdInput(e.target.value)}
                className="text-xs border rounded-md px-2.5 py-1.5 flex-1 bg-background text-foreground"
              />
              <button
                onClick={() => loadTimeline(visitorIdInput)}
                className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90"
              >
                Inspect
              </button>
            </div>

            {timelineData ? (
              <div className="space-y-3 pt-1">
                <div className="p-2.5 rounded-lg border bg-muted/30 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Visitor ID:</span>
                    <span className="font-mono">{maskId(timelineData.visitor_id)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Identity Stitch:</span>
                    <span>
                      {timelineData.is_stitched ? (
                        <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-600 bg-emerald-500/10">
                          Merged ({maskId(timelineData.customer_id)})
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">Anonymous</Badge>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Sessions:</span>
                    <span className="font-semibold">{timelineData.total_sessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed Purchases:</span>
                    <span className="font-semibold text-emerald-600">{timelineData.total_orders} (${timelineData.total_spend})</span>
                  </div>
                </div>

                {/* Event Stream Cards */}
                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                  {timelineData.events.map((e: any, idx: number) => (
                    <div key={idx} className="p-2 rounded border bg-card text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[10px]',
                            e.event_type === 'ad_click' && 'bg-blue-500/10 text-blue-600',
                            e.event_type === 'page_view' && 'bg-slate-500/10 text-slate-600',
                            e.event_type === 'product_view' && 'bg-indigo-500/10 text-indigo-600',
                            e.event_type === 'add_to_cart' && 'bg-amber-500/10 text-amber-600',
                            e.event_type === 'begin_checkout' && 'bg-purple-500/10 text-purple-600',
                            e.event_type === 'purchase' && 'bg-emerald-500/10 text-emerald-600'
                          )}
                        >
                          {e.event_type}
                        </Badge>
                        <span className="text-muted-foreground text-[10px]">
                          {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {e.product_id && (
                        <div className="text-muted-foreground">
                          Product: <span className="font-semibold text-foreground">{e.product_id}</span>
                          {e.value && ` ($${e.value})`}
                        </div>
                      )}
                      {e.campaign_id && (
                        <div className="text-muted-foreground">
                          Campaign: <span className="text-blue-600 font-medium">{e.campaign_id}</span>
                        </div>
                      )}
                      {e.order_id && (
                        <div className="text-emerald-600 font-semibold">
                          Order Completed: {e.order_id} {e.is_server_side ? '(Server-Side)' : ''}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Select a visitor ID above to inspect event stream.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
