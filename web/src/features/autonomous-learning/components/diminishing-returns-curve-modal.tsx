'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { CampaignLearningProfile } from '@/lib/autonomous-learning/types';
import { generateCampaignResponseCurve } from '@/lib/autonomous-learning/optimizer-engine';

interface DiminishingReturnsCurveModalProps {
  campaign: CampaignLearningProfile;
  isOpen: boolean;
  onClose: () => void;
}

export function DiminishingReturnsCurveModal({
  campaign,
  isOpen,
  onClose
}: DiminishingReturnsCurveModalProps) {
  if (!isOpen) return null;

  const points = generateCampaignResponseCurve(campaign, 12);

  return (
    <div
      role='presentation'
      className='fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md font-mono'
      onClick={onClose}
    >
      <div
        role='dialog'
        aria-modal='true'
        aria-label={`Response Saturation Curve: ${campaign.name}`}
        onClick={(e) => e.stopPropagation()}
        className='my-auto flex w-full max-w-3xl flex-col gap-4 rounded-2xl border border-border bg-card p-5 text-foreground shadow-2xl'
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b border-border/80 pb-3'>
          <div>
            <div className='flex items-center gap-2'>
              <Icons.lineChart className='size-4 text-primary' />
              <h3 className='text-sm font-bold uppercase tracking-tight text-foreground'>
                Econometric Hill Saturation Response Curve
              </h3>
              <Badge variant='outline' className='text-[10px] uppercase font-bold border-border'>
                {campaign.platform.toUpperCase()}
              </Badge>
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>
              {campaign.name} • SKU: {campaign.sku}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label='Close curve modal'
            className='size-8 rounded-lg border border-border text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors'
          >
            <Icons.close className='size-4' />
          </button>
        </div>

        {/* Operating Point vs Optimal Range Strip */}
        <div className='grid grid-cols-3 gap-3 text-xs bg-muted/20 p-3 rounded-xl border border-border/60'>
          <div>
            <span className='text-[10px] text-muted-foreground uppercase font-bold block'>
              Current Spend
            </span>
            <div className='font-bold text-foreground text-sm'>
              ₹{(campaign.currentBudget / 1000).toFixed(0)}k
            </div>
            <span className='text-[9px] text-muted-foreground'>Operating point</span>
          </div>

          <div>
            <span className='text-[10px] text-muted-foreground uppercase font-bold block'>
              Optimal Allocation
            </span>
            <div className='font-bold text-emerald-600 dark:text-emerald-400 text-sm'>
              ₹{(campaign.recommendedBudget / 1000).toFixed(0)}k
            </div>
            <span className='text-[9px] text-emerald-700 dark:text-emerald-400'>Max profit yield</span>
          </div>

          <div>
            <span className='text-[10px] text-muted-foreground uppercase font-bold block'>
              Marginal Return
            </span>
            <div className='font-bold text-foreground text-sm'>
              ₹{campaign.marginalProfitRoas.toFixed(2)}/₹1
            </div>
            <span className='text-[9px] text-muted-foreground'>Slope gradient (dProfit/dSpend)</span>
          </div>
        </div>

        {/* Responsive Area Chart */}
        <div className='h-[240px] w-full pt-1'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={points} margin={{ top: 10, right: 15, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id='curveProfitGrad' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#10b981' stopOpacity={0.35} />
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
                          Marginal Yield: <strong className='text-foreground'>₹{item?.marginalProfit?.toFixed(2)}/₹1</strong>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type='monotone'
                dataKey='profit'
                stroke='#10b981'
                strokeWidth={2.5}
                fill='url(#curveProfitGrad)'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / Guidance Strip */}
        <div className='flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/60'>
          <div className='flex items-center gap-3'>
            <span className='flex items-center gap-1.5'>
              <span className='size-2 rounded-xs bg-muted' /> Under-Invested Zone
            </span>
            <span className='flex items-center gap-1.5'>
              <span className='size-2 rounded-xs bg-emerald-500' /> Optimal Operating Range
            </span>
            <span className='flex items-center gap-1.5'>
              <span className='size-2 rounded-xs bg-rose-500' /> Diminishing Returns
            </span>
          </div>
          <button
            onClick={onClose}
            className='text-foreground hover:underline font-bold text-xs'
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
