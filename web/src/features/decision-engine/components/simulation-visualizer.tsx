'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ShockScenarioId, SimulationResult, DailyLossPoint } from '../types/simulation-types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export type SimulationStage =
  | 'ready'
  | 'initializing'
  | 'baseline'
  | 'shock'
  | 'propagating'
  | 'mitigating'
  | 'completed';

interface SimulationVisualizerProps {
  scenarioId: ShockScenarioId;
  stage: SimulationStage;
  progressPct: number; // 0 to 100
  simulatedDay: number; // 0 to horizonDays
  totalDays: number;
  timeSeriesSoFar: DailyLossPoint[];
  currentTelemetry: {
    labelA: string;
    valueA: string;
    subA: string;
    labelB: string;
    valueB: string;
    subB: string;
    labelC: string;
    valueC: string;
    subC: string;
    labelD: string;
    valueD: string;
    subD: string;
  };
  onRun: () => void;
  onReset: () => void;
  result?: SimulationResult;
  className?: string;
}

const STAGES: { id: SimulationStage; label: string; desc: string }[] = [
  { id: 'baseline', label: '1. Baseline', desc: 'Sample steady-state telemetry' },
  { id: 'shock', label: '2. Crisis Injected', desc: 'Anomaly hits channel pipeline' },
  { id: 'propagating', label: '3. Propagation', desc: 'Causal graphs & adstock decay' },
  { id: 'mitigating', label: '4. Autonomous Mitigation', desc: 'SLSQP realloc & kill-switch' },
  { id: 'completed', label: '5. Resolved', desc: 'Deterministic proof & recovery' }
];

export function SimulationVisualizer({
  scenarioId,
  stage,
  progressPct,
  simulatedDay,
  totalDays,
  timeSeriesSoFar,
  currentTelemetry,
  onRun,
  onReset,
  result,
  className
}: SimulationVisualizerProps) {
  const isRunning = stage !== 'ready' && stage !== 'completed';
  const isReady = stage === 'ready';
  const isDone = stage === 'completed';

  // Get active stage index for stepper
  const activeStageIndex =
    stage === 'ready'
      ? -1
      : stage === 'initializing' || stage === 'baseline'
      ? 0
      : stage === 'shock'
      ? 1
      : stage === 'propagating'
      ? 2
      : stage === 'mitigating'
      ? 3
      : 4;

  return (
    <div
      className={cn(
        'rounded-xl border border-border/80 bg-card p-4 sm:p-5 font-mono shadow-xs space-y-4 transition-all',
        isRunning && 'ring-1 ring-primary/40 border-primary/40',
        className
      )}
    >
      {/* Top Banner / Status Line */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3.5'>
        <div className='flex items-center gap-2.5'>
          <div
            className={cn(
              'size-3 rounded-full flex items-center justify-center transition-all',
              isReady && 'bg-amber-500/20 text-amber-500',
              isRunning && 'bg-primary/20 text-primary animate-pulse',
              isDone && 'bg-emerald-500/20 text-emerald-500'
            )}
          >
            <span
              className={cn(
                'size-1.5 rounded-full',
                isReady && 'bg-amber-500',
                isRunning && 'bg-primary animate-ping',
                isDone && 'bg-emerald-500'
              )}
            />
          </div>
          <div>
            <h3 className='text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2'>
              Deterministic Simulation Execution Engine
              <Badge
                variant='outline'
                className={cn(
                  'text-[9px] font-bold uppercase tracking-widest px-1.5 py-0',
                  isReady && 'border-amber-500/30 text-amber-500 bg-amber-500/5',
                  isRunning && 'border-primary/40 text-primary bg-primary/10 animate-pulse',
                  isDone && 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                )}
              >
                {isReady ? 'READY TO SIMULATE' : isRunning ? `RUNNING (DAY ${simulatedDay}/${totalDays})` : 'EXECUTION VERIFIED'}
              </Badge>
            </h3>
            <p className='text-[10px] text-muted-foreground'>
              {isReady
                ? 'Configure input constraints and target policy on the left, then trigger autonomous simulation.'
                : isRunning
                ? 'Tracing supply-chain signals, channel elasticity, and loss curve day-by-day...'
                : `Deterministic run complete across ${totalDays}-day evaluation horizon. Causal results populated.`}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {isDone && (
            <Button
              size='sm'
              variant='outline'
              onClick={onReset}
              className='h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground border-border'
            >
              <Icons.clock className='mr-1.5 size-3' />
              Reset
            </Button>
          )}

          <Button
            size='sm'
            onClick={onRun}
            disabled={isRunning}
            className={cn(
              'h-8 px-4 text-xs font-bold uppercase shadow-sm transition-all',
              isRunning
                ? 'bg-primary/20 text-primary cursor-not-allowed'
                : isDone
                ? 'bg-foreground text-background hover:bg-foreground/90'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            )}
          >
            {isRunning ? (
              <>
                <Icons.spinner className='mr-1.5 size-3.5 animate-spin' />
                Simulating ({progressPct}%)
              </>
            ) : isDone ? (
              <>
                <Icons.refresh className='mr-1.5 size-3.5' />
                Rerun Simulation
              </>
            ) : (
              <>
                <Icons.play className='mr-1.5 size-3.5 fill-current' />
                Run Simulation
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 5-STAGE PIPELINE PROGRESSION STEPPER */}
      <div className='grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1'>
        {STAGES.map((s, idx) => {
          const isPassed = activeStageIndex > idx;
          const isCurrent = activeStageIndex === idx;
          const isPending = activeStageIndex < idx;

          return (
            <div
              key={s.id}
              className={cn(
                'rounded-lg border p-2 text-xs transition-all relative overflow-hidden',
                isPassed && 'border-emerald-500/40 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400',
                isCurrent && 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/30',
                isPending && 'border-border/60 bg-muted/20 text-muted-foreground opacity-60'
              )}
            >
              <div className='flex items-center justify-between text-[10px] font-bold uppercase'>
                <span>{s.label}</span>
                {isPassed && <Icons.check className='size-3 text-emerald-500' />}
                {isCurrent && <Icons.spinner className='size-3 animate-spin text-primary' />}
              </div>
              <div className='text-[9px] text-muted-foreground line-clamp-1 mt-0.5'>
                {s.desc}
              </div>
              {isCurrent && (
                <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-pulse' />
              )}
            </div>
          );
        })}
      </div>

      {/* RUNNING HUD / PROGRESS BAR */}
      {(isRunning || isDone) && (
        <div className='space-y-1.5 pt-1'>
          <div className='flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground'>
            <span className='flex items-center gap-1.5'>
              <Icons.terminal className='size-3 text-primary' />
              Horizon Progression: Day {simulatedDay} of {totalDays}
            </span>
            <span className='text-foreground'>{progressPct}%</span>
          </div>
          <div className='h-2 w-full bg-border/60 rounded-full overflow-hidden'>
            <div
              className={cn(
                'h-full transition-all duration-200 rounded-full',
                isDone ? 'bg-emerald-500' : 'bg-primary'
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* DYNAMIC TELEMETRY STRIP (VALUES PROGRESSIVELY UPDATE AS SHOCK PROPAGATES) */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-1'>
        <div className='rounded-lg border border-border/70 bg-slate-50/50 dark:bg-zinc-950/40 p-2.5 space-y-0.5'>
          <span className='text-[10px] uppercase text-muted-foreground block font-bold'>
            {currentTelemetry.labelA}
          </span>
          <div className='text-base font-bold text-foreground'>
            {currentTelemetry.valueA}
          </div>
          <span className='text-[9px] text-muted-foreground block line-clamp-1'>
            {currentTelemetry.subA}
          </span>
        </div>

        <div className='rounded-lg border border-border/70 bg-slate-50/50 dark:bg-zinc-950/40 p-2.5 space-y-0.5'>
          <span className='text-[10px] uppercase text-muted-foreground block font-bold'>
            {currentTelemetry.labelB}
          </span>
          <div
            className={cn(
              'text-base font-bold',
              isRunning && stage === 'shock' ? 'text-rose-500 animate-pulse' : 'text-foreground'
            )}
          >
            {currentTelemetry.valueB}
          </div>
          <span className='text-[9px] text-muted-foreground block line-clamp-1'>
            {currentTelemetry.subB}
          </span>
        </div>

        <div className='rounded-lg border border-border/70 bg-slate-50/50 dark:bg-zinc-950/40 p-2.5 space-y-0.5'>
          <span className='text-[10px] uppercase text-muted-foreground block font-bold'>
            {currentTelemetry.labelC}
          </span>
          <div className='text-base font-bold text-foreground'>
            {currentTelemetry.valueC}
          </div>
          <span className='text-[9px] text-muted-foreground block line-clamp-1'>
            {currentTelemetry.subC}
          </span>
        </div>

        <div className='rounded-lg border border-border/70 bg-slate-50/50 dark:bg-zinc-950/40 p-2.5 space-y-0.5'>
          <span className='text-[10px] uppercase text-muted-foreground block font-bold'>
            {currentTelemetry.labelD}
          </span>
          <div
            className={cn(
              'text-base font-bold',
              isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
            )}
          >
            {currentTelemetry.valueD}
          </div>
          <span className='text-[9px] text-muted-foreground block line-clamp-1'>
            {currentTelemetry.subD}
          </span>
        </div>
      </div>

      {/* LIVE PROGRESSIVE LOSS CHART (BUILDS DAY BY DAY DURING RUN) */}
      {(isRunning || (isDone && timeSeriesSoFar.length > 0)) && (
        <div className='rounded-lg border border-border/70 bg-muted/20 p-3 space-y-2'>
          <div className='flex items-center justify-between text-[10px] uppercase font-bold'>
            <span className='flex items-center gap-1.5 text-foreground'>
              <Icons.lineChart className='size-3 text-emerald-500' />
              Live Simulation Curve (Cumulative Loss Bleed)
            </span>
            <div className='flex items-center gap-3'>
              <span className='text-rose-500'>● Unmitigated Bleed</span>
              <span className='text-emerald-500'>● NEXUS Autonomous Path</span>
            </div>
          </div>

          <div className='h-[160px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={timeSeriesSoFar} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id='visNoAction' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#e11d48' stopOpacity={0.3} />
                    <stop offset='95%' stopColor='#e11d48' stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id='visMitigated' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#10b981' stopOpacity={0.3} />
                    <stop offset='95%' stopColor='#10b981' stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' vertical={false} className='dark:stroke-zinc-800' />
                <XAxis dataKey='label' tickLine={false} axisLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#71717a', fontSize: 9 }}
                  tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const noAction = Number(payload[0]?.value ?? 0);
                      const mit = Number(payload[1]?.value ?? 0);
                      return (
                        <div className='rounded border border-border bg-card p-2 text-xs font-mono shadow'>
                          <div className='font-bold text-[10px] text-muted-foreground'>{label}</div>
                          <div className='text-rose-500 font-semibold'>No Action: ${noAction.toLocaleString('en-US')}</div>
                          <div className='text-emerald-600 dark:text-emerald-400 font-semibold'>Mitigated: ${mit.toLocaleString('en-US')}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type='monotone' dataKey='noActionLoss' stroke='#e11d48' strokeWidth={2} fill='url(#visNoAction)' isAnimationActive={false} />
                <Area type='monotone' dataKey='mitigatedLoss' stroke='#10b981' strokeWidth={2} fill='url(#visMitigated)' isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* READY-STATE CALL TO ACTION (WHEN NOT YET RUN) */}
      {isReady && (
        <div className='rounded-lg border border-dashed border-border p-4 bg-muted/20 text-center space-y-2'>
          <div className='size-8 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center'>
            <Icons.sparkles className='size-4' />
          </div>
          <div className='text-xs font-bold uppercase tracking-wider text-foreground'>
            Simulator Standing By
          </div>
          <p className='text-[11px] text-muted-foreground max-w-md mx-auto leading-relaxed'>
            Review or adjust the crisis parameters and chosen strategy on the left panel. Click <strong>"Run Simulation"</strong> to execute the deterministic calculation engine and inspect real-time causal telemetry.
          </p>
        </div>
      )}
    </div>
  );
}
