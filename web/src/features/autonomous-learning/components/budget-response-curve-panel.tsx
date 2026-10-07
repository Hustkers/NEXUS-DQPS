'use client';

import React, { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { CampaignLearningProfile, OptimizationResult } from '@/lib/autonomous-learning/types';
import { generateCampaignResponseCurve } from '@/lib/autonomous-learning/optimizer-engine';

interface BudgetResponseCurvePanelProps {
  result: OptimizationResult;
  selectedCampaignId?: string;
  onSelectCampaign?: (c: CampaignLearningProfile) => void;
  className?: string;
}

export function BudgetResponseCurvePanel({
  result,
  selectedCampaignId,
  onSelectCampaign,
  className
}: BudgetResponseCurvePanelProps) {
  const { campaigns } = result;

  const activeCampaign = useMemo(() => {
    return (
      campaigns.find((c) => c.id === selectedCampaignId) ||
      campaigns[0]
    );
  }, [campaigns, selectedCampaignId]);

  // Generate 14-point discrete Hill curve for active campaign
  const points = useMemo(() => {
    if (!activeCampaign) return [];
    return generateCampaignResponseCurve(activeCampaign, 14);
  }, [activeCampaign]);

  // Find the exact points closest to Current and Recommended
  const currentPoint = useMemo(() => {
    if (points.length === 0) return null;
    return points.reduce((prev, curr) =>
      Math.abs(curr.spend - activeCampaign.currentBudget) < Math.abs(prev.spend - activeCampaign.currentBudget)
        ? curr
        : prev
    );
  }, [points, activeCampaign.currentBudget]);

  const recommendedPoint = useMemo(() => {
    if (points.length === 0) return null;
    return points.reduce((prev, curr) =>
      Math.abs(curr.spend - activeCampaign.recommendedBudget) < Math.abs(prev.spend - activeCampaign.recommendedBudget)
        ? curr
        : prev
    );
  }, [points, activeCampaign.recommendedBudget]);

  return (
    <div className={cn('rounded-2xl border border-border/80 bg-card p-5 sm:p-6 font-mono shadow-xs space-y-5', className)}>
      {/* Header with Title & Campaign Selector */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3'>
        <div className='flex items-center gap-2'>
          <Icons.lineChart className='size-4 text-emerald-500' />
          <h2 className='text-xs font-bold uppercase tracking-wider text-foreground'>
            BUDGET VS PROFIT RESPONSE CURVE
          </h2>
          <Badge variant='outline' className='text-[9px] uppercase font-bold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'>
            Non-Linear Hill Saturation
          </Badge>
        </div>

        {/* Campaign Filter Selector */}
        <div className='flex items-center gap-2'>
          <span className='text-[10px] uppercase font-bold text-muted-foreground'>Target:</span>
          <select
            value={activeCampaign.id}
            onChange={(e) => {
              const selected = campaigns.find((c) => c.id === e.target.value);
              if (selected && onSelectCampaign) onSelectCampaign(selected);
            }}
            className='bg-muted/40 border border-border rounded-lg text-xs font-bold px-2.5 py-1 text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer'
          >
            {campaigns.map((c) => (
              <option key={c.id} value={c.id} className='bg-background text-foreground'>
                {c.name} ({c.platform.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 Metrics Strip: Operating Point, Recommended Optimal Point, Marginal Return */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-muted/15 p-3 rounded-xl border border-border/60'>
        <div className='space-y-0.5'>
          <span className='text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1.5'>
            <span className='size-2 rounded-full bg-blue-500' />
            Current Operating Spend
          </span>
          <div className='font-bold text-foreground text-sm'>
            ₹{(activeCampaign.currentBudget / 1000).toFixed(0)}k
          </div>
          <span className='text-[9px] text-muted-foreground'>
            Profit: ₹{(activeCampaign.currentProfit / 1000).toFixed(1)}k • {activeCampaign.currentProfitRoas.toFixed(2)}x ROAS
          </span>
        </div>

        <div className='space-y-0.5'>
          <span className='text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold flex items-center gap-1.5'>
            <span className='size-2 rounded-full bg-emerald-500' />
            Recommended Optimal Spend
          </span>
          <div className='font-bold text-emerald-600 dark:text-emerald-400 text-sm'>
            ₹{(activeCampaign.recommendedBudget / 1000).toFixed(0)}k
          </div>
          <span className='text-[9px] text-emerald-700 dark:text-emerald-400 font-semibold'>
            Profit: ₹{(activeCampaign.expectedProfit / 1000).toFixed(1)}k ({activeCampaign.trendPct > 0 ? '+' : ''}{activeCampaign.trendPct}%)
          </span>
        </div>

        <div className='space-y-0.5'>
          <span className='text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1.5'>
            <Icons.sparkles className='size-2 text-primary' />
            Marginal Headroom (Next ₹1)
          </span>
          <div className='font-bold text-foreground text-sm'>
            ₹{activeCampaign.marginalProfitRoas.toFixed(2)}/₹1
          </div>
          <span className='text-[9px] text-muted-foreground'>
            Status: {activeCampaign.isConstrained ? 'Stockout Guarded' : activeCampaign.deltaBudget > 0 ? 'Scale Target' : 'Mature Plateau'}
          </span>
        </div>
      </div>

      {/* Hill Saturation Area Chart with Operating Markers */}
      <div className='h-[250px] w-full pt-1'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={points} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id='responseCurveGrad' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#10b981' stopOpacity={0.4} />
                <stop offset='95%' stopColor='#10b981' stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' vertical={false} className='dark:stroke-zinc-800' />
            <XAxis dataKey='spendLabel' tickLine={false} axisLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#71717a', fontSize: 9 }}
              tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const prof = Number(payload[0]?.value ?? 0);
                  const item = payload[0]?.payload;
                  return (
                    <div className='rounded-lg border border-border bg-card p-2.5 text-xs font-mono shadow-md space-y-1'>
                      <div className='font-bold text-foreground text-[11px] border-b border-border/50 pb-1'>
                        Spend: {label}
                      </div>
                      <div className='text-emerald-600 dark:text-emerald-400 font-bold'>
                        Expected Profit: ₹{prof.toLocaleString('en-IN')}
                      </div>
                      <div className='text-muted-foreground text-[10px]'>
                        Zone: <strong className='text-foreground'>{item?.zone}</strong>
                      </div>
                      <div className='text-muted-foreground text-[10px]'>
                        Marginal Return: <strong className='text-foreground'>₹{item?.marginalProfit?.toFixed(2)}/₹1</strong>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Current Point Dot */}
            {currentPoint && (
              <ReferenceDot
                x={currentPoint.spendLabel}
                y={currentPoint.profit}
                r={6}
                fill='#3b82f6'
                stroke='#ffffff'
                strokeWidth={2}
              />
            )}

            {/* Recommended Point Dot */}
            {recommendedPoint && (
              <ReferenceDot
                x={recommendedPoint.spendLabel}
                y={recommendedPoint.profit}
                r={6}
                fill='#10b981'
                stroke='#ffffff'
                strokeWidth={2}
              />
            )}

            <Area
              type='monotone'
              dataKey='profit'
              stroke='#10b981'
              strokeWidth={2.5}
              fillOpacity={1}
              fill='url(#responseCurveGrad)'
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Zone Indicators */}
      <div className='flex flex-wrap items-center justify-between gap-3 text-[10px] text-muted-foreground pt-1 border-t border-border/40'>
        <div className='flex items-center gap-4 flex-wrap'>
          <span className='flex items-center gap-1.5'>
            <span className='size-2 rounded-full bg-blue-500' />
            ● Current Spend Point
          </span>
          <span className='flex items-center gap-1.5'>
            <span className='size-2 rounded-full bg-emerald-500' />
            ● Optimal Yield Point
          </span>
        </div>

        <div className='flex items-center gap-3 text-[9px] uppercase font-bold'>
          <span className='text-sky-500'>[ Under-Invested ]</span>
          <span className='text-emerald-500'>[ Optimal Apex ]</span>
          <span className='text-amber-500'>[ Diminishing Returns ]</span>
        </div>
      </div>
    </div>
  );
}
