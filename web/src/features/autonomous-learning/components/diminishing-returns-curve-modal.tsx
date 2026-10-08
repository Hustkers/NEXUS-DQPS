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
import { Icons } from '@/components/icons';
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
      className='fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 font-mono'
      onClick={onClose}
    >
      <div
        role='dialog'
        aria-modal='true'
        aria-label={`Response Saturation Curve: ${campaign.name}`}
        onClick={(e) => e.stopPropagation()}
        className='my-auto flex w-full max-w-3xl flex-col gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 text-zinc-900 dark:text-zinc-100 shadow-xl'
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3'>
          <div>
            <div className='flex items-center gap-2'>
              <Icons.lineChart className='size-3.5 text-zinc-500' />
              <h3 className='text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100'>
                Hill Saturation Response Curve
              </h3>
              <span className='text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-500'>
                {campaign.platform.toUpperCase()}
              </span>
            </div>
            <p className='text-[11px] text-zinc-500 mt-0.5'>
              {campaign.name} • SKU: {campaign.sku}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label='Close curve modal'
            className='size-7 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center transition-colors'
          >
            <Icons.close className='size-3.5' />
          </button>
        </div>

        {/* Operating Point vs Optimal Range Strip */}
        <div className='grid grid-cols-3 gap-3 text-xs bg-zinc-50/50 dark:bg-zinc-900/30 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800'>
          <div>
            <span className='text-[10px] text-zinc-500 uppercase font-semibold block'>
              Current Spend
            </span>
            <div className='font-mono font-bold text-zinc-900 dark:text-zinc-100 text-sm'>
              ${(campaign.currentBudget / 1000).toFixed(0)}k
            </div>
            <span className='text-[9px] text-zinc-500'>Operating point</span>
          </div>

          <div>
            <span className='text-[10px] text-zinc-500 uppercase font-semibold block'>
              Optimal Allocation
            </span>
            <div className='font-mono font-bold text-zinc-900 dark:text-zinc-100 text-sm'>
              ${(campaign.recommendedBudget / 1000).toFixed(0)}k
            </div>
            <span className='text-[9px] text-zinc-500'>Max profit yield</span>
          </div>

          <div>
            <span className='text-[10px] text-zinc-500 uppercase font-semibold block'>
              Marginal Return
            </span>
            <div className='font-mono font-bold text-zinc-900 dark:text-zinc-100 text-sm'>
              ${campaign.marginalProfitRoas.toFixed(2)}/$1
            </div>
            <span className='text-[9px] text-zinc-500'>Derivative (dProfit/dSpend)</span>
          </div>
        </div>

        {/* Responsive Area Chart */}
        <div className='h-[240px] w-full pt-1'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={points} margin={{ top: 10, right: 15, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id='curveProfitGrad' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#71717a' stopOpacity={0.25} />
                  <stop offset='95%' stopColor='#71717a' stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' stroke='#e4e4e7' vertical={false} className='dark:stroke-zinc-800' />
              <XAxis dataKey='spendLabel' tickLine={false} axisLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#71717a', fontSize: 9 }}
                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const prof = Number(payload[0]?.value ?? 0);
                    const item = payload[0]?.payload;
                    return (
                      <div className='rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 text-xs font-mono shadow-md space-y-1'>
                        <div className='font-semibold text-zinc-900 dark:text-zinc-100 text-[11px] border-b border-zinc-200 dark:border-zinc-800 pb-1'>
                          Spend: {label}
                        </div>
                        <div className='font-bold text-zinc-900 dark:text-zinc-100'>
                          Expected Profit: ${prof.toLocaleString('en-US')}
                        </div>
                        <div className='text-zinc-500 text-[10px]'>
                          Zone: <strong className='text-zinc-800 dark:text-zinc-200'>{item?.zone}</strong>
                        </div>
                        <div className='text-zinc-500 text-[10px]'>
                          Marginal Yield: <strong className='text-zinc-800 dark:text-zinc-200'>${item?.marginalProfit?.toFixed(2)}/$1</strong>
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
                stroke='#71717a'
                strokeWidth={2}
                fill='url(#curveProfitGrad)'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / Footer */}
        <div className='flex items-center justify-between text-[10px] text-zinc-500 pt-2 border-t border-zinc-200 dark:border-zinc-800'>
          <div className='flex items-center gap-3'>
            <span className='flex items-center gap-1.5'>
              <span className='size-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700' /> Under-Invested
            </span>
            <span className='flex items-center gap-1.5'>
              <span className='size-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100' /> Optimal Operating Range
            </span>
            <span className='flex items-center gap-1.5'>
              <span className='size-1.5 rounded-full bg-zinc-500' /> Diminishing Returns
            </span>
          </div>
          <button
            onClick={onClose}
            className='text-zinc-900 dark:text-zinc-100 hover:underline font-semibold text-xs'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
