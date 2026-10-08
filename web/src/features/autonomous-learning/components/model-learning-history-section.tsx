'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import {
  SEED_LEARNING_HISTORY,
  SEED_MODEL_INSIGHTS
} from '@/lib/autonomous-learning/optimizer-engine';

export function ModelLearningHistorySection({ className }: { className?: string }) {
  const history = SEED_LEARNING_HISTORY;
  const insights = SEED_MODEL_INSIGHTS;

  return (
    <div className={cn('rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 font-mono shadow-none space-y-6', className)}>
      <div className='flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 flex-wrap gap-2'>
        <div>
          <div className='flex items-center gap-2'>
            <Icons.sparkles className='size-3.5 text-zinc-500' />
            <h3 className='text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100'>
              Empirical Prior Calibration &amp; Feedback Loop
            </h3>
            <span className='text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-500'>
              94.8% Calibration
            </span>
          </div>
          <p className='text-[10px] text-zinc-500 mt-0.5'>
            DATA → ESTIMATE → ALLOCATE → RECONCILE OBSERVED TELEMETRY → UPDATE PRIORS
          </p>
        </div>

        <div className='flex items-center gap-2 text-xs'>
          <span className='size-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100' />
          <span className='text-zinc-500'>Active Cycle:</span>
          <span className='font-mono font-medium text-zinc-900 dark:text-zinc-100'>CYC-9482</span>
        </div>
      </div>

      {/* Predicted vs Actual Profit Chart */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-5'>
        <div className='lg:col-span-7 space-y-2'>
          <div className='flex items-center justify-between text-[10px] uppercase font-semibold text-zinc-500'>
            <span>Predicted vs Realized Profit ($ in Thousands)</span>
            <div className='flex items-center gap-3'>
              <span className='text-zinc-500'>● Predicted</span>
              <span className='text-zinc-900 dark:text-zinc-100 font-semibold'>● Realized</span>
            </div>
          </div>

          <div className='h-[200px] w-full pt-1'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={history} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray='3 3' stroke='#e4e4e7' vertical={false} className='dark:stroke-zinc-800' />
                <XAxis dataKey='week' tickLine={false} axisLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#71717a', fontSize: 9 }}
                  tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const pred = Number(payload[0]?.value ?? 0);
                      const act = Number(payload[1]?.value ?? 0);
                      const item = payload[0]?.payload;
                      return (
                        <div className='rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 text-xs font-mono shadow-md space-y-1'>
                          <div className='font-semibold text-zinc-900 dark:text-zinc-100 text-[11px] border-b border-zinc-200 dark:border-zinc-800 pb-1'>
                            {label} ({item?.cycleId})
                          </div>
                          <div className='text-zinc-500'>
                            Predicted: ${pred.toLocaleString('en-US')}
                          </div>
                          <div className='text-zinc-900 dark:text-zinc-100 font-bold'>
                            Actual: ${act.toLocaleString('en-US')}
                          </div>
                          <div className='text-[10px] text-zinc-500 pt-1 border-t border-zinc-200 dark:border-zinc-800'>
                            Variance: <strong className='text-zinc-800 dark:text-zinc-200'>{item?.errorPct > 0 ? '+' : ''}{item?.errorPct}%</strong> (Accuracy: {item?.accuracyPct}%)
                          </div>
                          <p className='text-[9px] text-zinc-500 italic leading-tight pt-0.5'>
                            {item?.keyLearning}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type='monotone'
                  dataKey='predictedProfit'
                  stroke='#a1a1aa'
                  strokeWidth={1.5}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type='monotone'
                  dataKey='actualProfit'
                  stroke='#18181b'
                  className='dark:stroke-zinc-100'
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prediction Error Table */}
        <div className='lg:col-span-5 space-y-2'>
          <div className='text-[10px] uppercase font-semibold text-zinc-500'>
            Cycle Prediction Verification Log
          </div>

          <div className='space-y-1.5'>
            {history.map((h) => (
              <div
                key={h.cycleId}
                className='rounded-md border border-zinc-200 dark:border-zinc-800 p-2.5 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs flex items-center justify-between'
              >
                <div>
                  <div className='flex items-center gap-1.5'>
                    <span className='font-semibold text-zinc-900 dark:text-zinc-100'>{h.week}</span>
                    <span className='text-[10px] text-zinc-500 font-mono'>({h.cycleId})</span>
                  </div>
                  <span className='text-[10px] text-zinc-500 line-clamp-1 mt-0.5'>
                    {h.keyLearning}
                  </span>
                </div>

                <div className='text-right shrink-0'>
                  <span className='font-mono font-semibold text-zinc-900 dark:text-zinc-100 block text-xs'>
                    {h.accuracyPct}% Acc
                  </span>
                  <span className='text-[10px] text-zinc-500 font-mono'>
                    {h.errorPct > 0 ? '+' : ''}{h.errorPct}% Error
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Synthesized Priors */}
      <div className='space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800'>
        <div className='flex items-center justify-between'>
          <span className='text-[10px] uppercase font-semibold text-zinc-500 flex items-center gap-1.5'>
            <Icons.sparkles className='size-3 text-zinc-400' />
            Calibrated Priors &amp; Empirical Constraints
          </span>
          <span className='text-[10px] font-mono text-zinc-500'>4 Active Priors</span>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
          {insights.map((ins) => (
            <div
              key={ins.id}
              className='rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 space-y-1 text-xs'
            >
              <div className='flex items-center justify-between text-[9px] uppercase font-semibold'>
                <span className='text-zinc-500'>{ins.type}</span>
                <span className='text-zinc-900 dark:text-zinc-100 font-mono'>{ins.metricImpact}</span>
              </div>
              <h4 className='font-semibold text-zinc-900 dark:text-zinc-100 text-xs leading-snug'>
                {ins.headline}
              </h4>
              <p className='text-[10px] text-zinc-500 leading-relaxed'>
                {ins.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
