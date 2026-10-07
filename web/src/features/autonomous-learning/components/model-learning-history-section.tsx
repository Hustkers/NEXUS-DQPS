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
import { Badge } from '@/components/ui/badge';
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
    <div className={cn('rounded-2xl border border-border/80 bg-card p-5 font-mono shadow-xs space-y-6', className)}>
      <div className='flex items-center justify-between border-b border-border/60 pb-3 flex-wrap gap-2'>
        <div>
          <div className='flex items-center gap-2'>
            <Icons.sparkles className='size-4 text-emerald-500' />
            <h3 className='text-xs font-bold uppercase tracking-wider text-foreground'>
              Continuous Model Learning &amp; Outcome Feedback Loop
            </h3>
            <Badge variant='outline' className='text-[10px] uppercase font-bold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'>
              91.4% Model Accuracy
            </Badge>
          </div>
          <p className='text-[10px] text-muted-foreground mt-0.5'>
            DATA → LEARN → PREDICT → ALLOCATE → OBSERVE RESULTS → LEARN AGAIN
          </p>
        </div>

        <div className='flex items-center gap-2 text-xs'>
          <span className='size-2 rounded-full bg-emerald-500' />
          <span className='text-muted-foreground'>Priors Calibrated:</span>
          <span className='font-bold text-foreground'>Cycle 9482</span>
        </div>
      </div>

      {/* Predicted vs Actual Profit Chart */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-5'>
        <div className='lg:col-span-7 space-y-2'>
          <div className='flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground'>
            <span>Predicted Profit vs Actual Realized Profit (₹ in Thousands)</span>
            <div className='flex items-center gap-3'>
              <span className='text-primary'>● Predicted Profit</span>
              <span className='text-emerald-500'>● Actual Realized Profit</span>
            </div>
          </div>

          <div className='h-[200px] w-full pt-1'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={history} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' vertical={false} className='dark:stroke-zinc-800' />
                <XAxis dataKey='week' tickLine={false} axisLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#71717a', fontSize: 9 }}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const pred = Number(payload[0]?.value ?? 0);
                      const act = Number(payload[1]?.value ?? 0);
                      const item = payload[0]?.payload;
                      return (
                        <div className='rounded-lg border border-border bg-card p-2.5 text-xs font-mono shadow-md space-y-1'>
                          <div className='font-bold text-foreground text-[11px] border-b border-border/50 pb-1'>
                            {label} ({item?.cycleId})
                          </div>
                          <div className='text-primary font-bold'>
                            Predicted: ₹{pred.toLocaleString('en-IN')}
                          </div>
                          <div className='text-emerald-600 dark:text-emerald-400 font-bold'>
                            Actual: ₹{act.toLocaleString('en-IN')}
                          </div>
                          <div className='text-[10px] text-muted-foreground pt-1 border-t border-border/40'>
                            Variance: <strong className='text-foreground'>{item?.errorPct > 0 ? '+' : ''}{item?.errorPct}%</strong> (Accuracy: {item?.accuracyPct}%)
                          </div>
                          <p className='text-[9px] text-muted-foreground italic leading-tight pt-0.5'>
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
                  stroke='#3b82f6'
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type='monotone'
                  dataKey='actualProfit'
                  stroke='#10b981'
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prediction Error Table */}
        <div className='lg:col-span-5 space-y-2'>
          <div className='text-[10px] uppercase font-bold text-muted-foreground'>
            Cycle Prediction Verification Log
          </div>

          <div className='space-y-1.5'>
            {history.map((h) => (
              <div
                key={h.cycleId}
                className='rounded-lg border border-border/70 p-2.5 bg-muted/20 text-xs flex items-center justify-between'
              >
                <div>
                  <div className='flex items-center gap-1.5'>
                    <span className='font-bold text-foreground'>{h.week}</span>
                    <span className='text-[10px] text-muted-foreground font-mono'>({h.cycleId})</span>
                  </div>
                  <span className='text-[10px] text-muted-foreground line-clamp-1 mt-0.5'>
                    {h.keyLearning}
                  </span>
                </div>

                <div className='text-right shrink-0'>
                  <span className='font-bold text-emerald-600 dark:text-emerald-400 block text-xs'>
                    {h.accuracyPct}% Acc
                  </span>
                  <span className='text-[10px] text-muted-foreground'>
                    {h.errorPct > 0 ? '+' : ''}{h.errorPct}% Error
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Insight Cards: "What Did the Model Learn?" */}
      <div className='space-y-2 pt-2 border-t border-border/60'>
        <div className='flex items-center justify-between'>
          <span className='text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5'>
            <Icons.sparkles className='size-3 text-primary' />
            What Did The Model Learn from Historical Outcomes?
          </span>
          <span className='text-[10px] text-muted-foreground'>4 Validated Synthesized Priors</span>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
          {insights.map((ins) => (
            <div
              key={ins.id}
              className='rounded-xl border border-border/70 bg-card p-3 space-y-1.5 text-xs hover:border-foreground/30 transition-all shadow-2xs'
            >
              <div className='flex items-center justify-between text-[9px] uppercase font-bold'>
                <span className='text-primary'>{ins.type}</span>
                <span className='text-emerald-600 dark:text-emerald-400'>{ins.metricImpact}</span>
              </div>
              <h4 className='font-bold text-foreground text-xs leading-snug'>
                {ins.headline}
              </h4>
              <p className='text-[10px] text-muted-foreground leading-relaxed'>
                {ins.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
