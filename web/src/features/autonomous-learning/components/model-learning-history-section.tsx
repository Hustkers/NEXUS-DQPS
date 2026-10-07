'use client';

import React, { useState } from 'react';
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
import type { ModelInsight } from '@/lib/autonomous-learning/types';

export function ModelLearningHistorySection({
  className,
  onOpenRedTeam
}: {
  className?: string;
  onOpenRedTeam?: () => void;
}) {
  const history = SEED_LEARNING_HISTORY;
  const insights = SEED_MODEL_INSIGHTS;
  const [selectedInsight, setSelectedInsight] = useState<ModelInsight | null>(null);

  return (
    <div className={cn('rounded-2xl border border-border/80 bg-card p-5 sm:p-6 font-mono shadow-xs space-y-5', className)}>
      {/* Header */}
      <div className='flex items-center justify-between border-b border-border/60 pb-3 flex-wrap gap-2'>
        <div className='flex items-center gap-2'>
          <Icons.sparkles className='size-4 text-emerald-500' />
          <h2 className='text-xs font-bold uppercase tracking-wider text-foreground'>
            PREDICTED VS ACTUAL PERFORMANCE
          </h2>
          <Badge variant='outline' className='text-[9px] uppercase font-bold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'>
            94.8% MODEL ACCURACY
          </Badge>
        </div>

        <div className='flex items-center gap-2 text-xs'>
          <span className='size-2 rounded-full bg-emerald-500' />
          <span className='text-muted-foreground text-[10px] uppercase font-bold'>Feedback Loop:</span>
          <span className='font-bold text-foreground text-[11px]'>Cycle 9482 Calibrated</span>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-5 items-start'>
        {/* Left Column: Clean Line Chart (7 cols) */}
        <div className='lg:col-span-7 space-y-2'>
          <div className='flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground'>
            <span>Weekly Outcome Verification</span>
            <div className='flex items-center gap-3'>
              <span className='text-primary'>● Predicted</span>
              <span className='text-emerald-500'>● Actual</span>
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
                            Accuracy: <strong className='text-foreground'>{item?.accuracyPct}%</strong>
                          </div>
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

        {/* Right Column: 4 Compact Visual Insight Tiles (5 cols) */}
        <div className='lg:col-span-5 space-y-2.5'>
          <div className='text-[10px] uppercase font-bold text-muted-foreground flex items-center justify-between'>
            <span>MODEL LEARNINGS (SYNTHESIZED PRIORS)</span>
            <span className='text-[9px] text-muted-foreground'>Click to inspect</span>
          </div>

          <div className='grid grid-cols-2 gap-2.5'>
            {insights.map((ins) => {
              const isSelected = selectedInsight?.id === ins.id;

              return (
                <div
                  key={ins.id}
                  role='button'
                  tabIndex={0}
                  onClick={() => setSelectedInsight(isSelected ? null : ins)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedInsight(isSelected ? null : ins);
                    }
                  }}
                  className={cn(
                    'rounded-xl border p-3 space-y-1 cursor-pointer transition-all text-xs',
                    isSelected
                      ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                      : 'border-border/70 bg-muted/15 hover:border-foreground/30 hover:bg-muted/30'
                  )}
                >
                  <div className='flex items-center justify-between text-[9px] uppercase font-bold text-muted-foreground'>
                    <span>{ins.type}</span>
                    <span className='text-emerald-600 dark:text-emerald-400 font-bold'>
                      {ins.metricImpact}
                    </span>
                  </div>
                  <div className='font-bold text-foreground text-xs leading-snug line-clamp-1' title={ins.headline}>
                    {ins.headline}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progressive Disclosure Box if an insight is selected */}
          {selectedInsight && (
            <div className='rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs space-y-1 animate-in fade-in-50 duration-200'>
              <div className='flex items-center justify-between font-bold text-foreground'>
                <span className='text-primary text-[10px] uppercase'>{selectedInsight.type} PRIORS</span>
                <button
                  onClick={() => setSelectedInsight(null)}
                  className='text-[10px] text-muted-foreground hover:text-foreground cursor-pointer'
                >
                  ✕
                </button>
              </div>
              <p className='text-[11px] text-muted-foreground leading-relaxed'>
                {selectedInsight.detail}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* AI Red Team Validation Status Bar */}
      <div className='rounded-xl border border-border/80 bg-muted/15 p-3 flex flex-wrap items-center justify-between gap-3 text-xs pt-3'>
        <div className='flex items-center gap-2'>
          <span className='size-2 rounded-full bg-emerald-500 animate-pulse' />
          <span className='text-muted-foreground text-[11px]'>Red Team Validation:</span>
          <span className='font-bold text-foreground text-[11px]'>PASSED (0 Guardrail Breaches)</span>
        </div>

        {onOpenRedTeam && (
          <button
            onClick={onOpenRedTeam}
            className='text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer'
          >
            Inspect Stress-Test Challenge →
          </button>
        )}
      </div>
    </div>
  );
}
