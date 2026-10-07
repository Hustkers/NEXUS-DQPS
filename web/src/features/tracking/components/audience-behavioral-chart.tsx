'use client';

import React from 'react';
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
  Cell
} from 'recharts';

interface AudienceBehavioralChartProps {
  audienceData: any;
  selectedProduct: string;
  onSelectProduct: (sku: string) => void;
  shoesList: Array<{ sku: string; name: string }>;
  onSelectVisitor: (vid: string) => void;
  maskId: (id: string) => string;
}

export function AudienceBehavioralChart({
  audienceData,
  selectedProduct,
  onSelectProduct,
  shoesList,
  onSelectVisitor,
  maskId
}: AudienceBehavioralChartProps) {
  const segments = audienceData?.segments;

  const segmentChartData = segments
    ? [
        {
          name: 'Browsers',
          count: segments.browsers?.count || 0,
          score: '1.0 - 2.5',
          fill: '#64748b',
          desc: 'Viewed model, no cart action'
        },
        {
          name: 'Abandoners',
          count: segments.cart_abandoners?.count || 0,
          score: 'Cart Action',
          fill: '#f59e0b',
          desc: 'Added to cart, high remarketing ROI'
        },
        {
          name: 'Buyers',
          count: segments.buyers?.count || 0,
          score: '1 Order',
          fill: '#3b82f6',
          desc: 'Single checkout completed'
        },
        {
          name: 'Repeat VIPs',
          count: segments.repeat_buyers?.count || 0,
          score: '2+ Orders',
          fill: '#10b981',
          desc: 'High LTV champions'
        }
      ]
    : [];

  return (
    <Card className="min-w-0 max-w-full overflow-hidden border border-border/80 bg-card/60 backdrop-blur-xs shadow-xs lg:col-span-2">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold tracking-tight">
                Audience Behavioral Segments per SKU
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono border-blue-500/30 text-blue-600 bg-blue-500/10">
                7-Day Recency Half-Life
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Decayed interest scoring (View: 1, Cart: 3, Checkout: 5, Purchase: 10)
            </CardDescription>
          </div>

          {/* Product Model Selector */}
          <div className="w-full sm:w-64">
            <select
              value={selectedProduct}
              onChange={(e) => onSelectProduct(e.target.value)}
              className="w-full text-xs font-mono border border-border rounded-md px-2.5 py-1.5 bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            >
              {shoesList.map((s) => (
                <option key={s.sku} value={s.sku}>
                  {s.name} ({s.sku})
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {audienceData ? (
          <>
            {/* Visual Segment Distribution Chart */}
            <div className="p-3 rounded-lg border border-border/50 bg-muted/20">
              <div className="flex items-center justify-between mb-1.5 text-[11px] font-mono">
                <span className="text-muted-foreground uppercase tracking-wider">
                  Audience Lifecycle Distribution
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Total Audience: {segmentChartData.reduce((s, c) => s + c.count, 0)} profiles
                </span>
              </div>

              <div className="h-[120px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={segmentChartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
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
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="rounded-lg border border-border bg-popover/95 p-2.5 shadow-xl backdrop-blur-md text-xs font-mono space-y-1 text-popover-foreground">
                              <p className="font-bold text-foreground border-b border-border/50 pb-1">{d.name}</p>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Count:</span>
                                <span className="font-bold text-foreground">{d.count} users</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground">{d.desc}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                      {segmentChartData.map((entry, idx) => (
                        <Cell key={`seg-cell-${idx}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Segment KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono">
              <div className="p-2.5 rounded-lg border border-border/60 bg-muted/30">
                <p className="text-[10px] text-muted-foreground">Browsers</p>
                <p className="text-lg font-bold text-foreground mt-0.5">{segments.browsers?.count || 0}</p>
                <Badge variant="secondary" className="mt-1 text-[9px]">Score 1.0 - 2.5</Badge>
              </div>

              <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10">
                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">Cart Abandoners</p>
                <p className="text-lg font-bold text-amber-800 dark:text-amber-300 mt-0.5">
                  {segments.cart_abandoners?.count || 0}
                </p>
                <Badge variant="outline" className="mt-1 text-[9px] border-amber-500/40 text-amber-600">
                  High Remarketing
                </Badge>
              </div>

              <div className="p-2.5 rounded-lg border border-blue-500/30 bg-blue-500/10">
                <p className="text-[10px] text-blue-700 dark:text-blue-400 font-medium">Buyers</p>
                <p className="text-lg font-bold text-blue-800 dark:text-blue-300 mt-0.5">
                  {segments.buyers?.count || 0}
                </p>
                <Badge variant="outline" className="mt-1 text-[9px] border-blue-500/40 text-blue-600">
                  1 Order
                </Badge>
              </div>

              <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">Repeat VIPs</p>
                <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">
                  {segments.repeat_buyers?.count || 0}
                </p>
                <Badge variant="outline" className="mt-1 text-[9px] border-emerald-500/40 text-emerald-600">
                  VIP Champions
                </Badge>
              </div>
            </div>

            {/* Top Remarketing Targets (Masked / GDPR Safe) */}
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5 font-mono">
                <Icons.search className="size-3 text-blue-500" />
                High-Intent Remarketing Target Queue (Masked Customer IDs)
              </h4>
              <div className="overflow-x-auto border border-border/60 rounded-lg">
                <table className="w-full text-xs font-mono text-left">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground text-[10px] uppercase">
                      <th className="py-2 px-3">Visitor ID</th>
                      <th className="py-2 px-3">Customer Hash</th>
                      <th className="py-2 px-3 text-right">Intent Score</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {segments.cart_abandoners?.visitors?.slice(0, 4).map((v: any, idx: number) => (
                      <tr key={idx} className="hover:bg-muted/20">
                        <td className="py-2 px-3 text-[11px] text-foreground">{maskId(v.visitor_id)}</td>
                        <td className="py-2 px-3 text-[11px]">
                          {v.customer_id ? `cust_${maskId(v.customer_id)}` : <span className="text-muted-foreground italic">Anonymous Guest</span>}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-amber-600">{v.score}</td>
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => onSelectVisitor(v.visitor_id)}
                            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                          >
                            Inspect Journey →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <p className="text-xs text-muted-foreground font-mono">Loading audience segment data...</p>
        )}
      </CardContent>
    </Card>
  );
}
