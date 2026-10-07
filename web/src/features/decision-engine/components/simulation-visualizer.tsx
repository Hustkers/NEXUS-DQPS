'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { ShockScenarioId, SimulationResult, DailyLossPoint } from '../types/simulation-types';

export type SimulationStage =
  | 'ready'
  | 'initializing'
  | 'baseline'
  | 'shock'
  | 'propagating'
  | 'mitigating'
  | 'completed';

interface SimulationVisualizerProps {
  scenarioId?: ShockScenarioId;
  stage: SimulationStage;
  progressPct: number; // 0 to 100
  simulatedDay: number; // 0 to horizonDays
  totalDays: number;
  timeSeriesSoFar?: DailyLossPoint[];
  currentTelemetry?: unknown;
  onRun?: () => void;
  onReset?: () => void;
  result?: SimulationResult | null;
  className?: string;
  variant?: 'default' | 'minimal';
}

export function SimulationVisualizer({
  stage,
  progressPct,
  simulatedDay,
  totalDays,
  onRun: _onRun,
  result: _result,
  className,
  variant: _variant = 'default',
}: SimulationVisualizerProps) {
  const isRunning = stage !== 'ready' && stage !== 'completed';
  const isReady = stage === 'ready';

  if (isReady) {
    return (
      <div className={cn('rounded-xl border border-border bg-card p-12 text-center space-y-4 shadow-xs', className)}>
        <div className='mx-auto size-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground'>
          <Icons.play className='size-5 text-muted-foreground ml-0.5' />
        </div>
        <div className='space-y-1.5 max-w-sm mx-auto'>
          <h3 className='text-base font-semibold text-foreground'>
            Simulator ready
          </h3>
          <p className='text-sm text-muted-foreground'>
            1. Pick a crisis &nbsp;•&nbsp; 2. Choose a response &nbsp;•&nbsp; 3. Press Run
          </p>
        </div>
      </div>
    );
  }

  if (isRunning) {
    return (
      <div className={cn('rounded-xl border border-border bg-card p-6 shadow-xs space-y-3', className)}>
        <div className='flex justify-between items-center text-sm'>
          <span className='font-medium text-foreground'>Running simulation...</span>
          <span className='text-muted-foreground tabular-nums text-xs'>
            Day {simulatedDay} of {totalDays}
          </span>
        </div>
        <div className='h-2 w-full bg-muted rounded-full overflow-hidden'>
          <div
            className='h-full bg-emerald-500 transition-all duration-300 motion-reduce:transition-none'
            style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
          />
        </div>
      </div>
    );
  }

  return null;
}
