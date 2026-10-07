'use client';

import React from 'react';
import {
  IconShieldCheck,
  IconAlertTriangle,
  IconArrowRight
} from '@tabler/icons-react';
import type { StrategyRisk } from '@/lib/strategy-engine/types';
import { cn } from '@/lib/utils';

interface StrategyRiskGaugeProps {
  riskScore: number; // 0 to 100
  confidencePct: number;
  risks?: StrategyRisk[];
  onOpenRiskModal: () => void;
}

export function StrategyRiskGauge({
  riskScore,
  confidencePct,
  risks,
  onOpenRiskModal
}: StrategyRiskGaugeProps) {
  const isLow = riskScore <= 30;
  const isModerate = riskScore > 30 && riskScore <= 60;

  const explanation = isLow
    ? 'Low risk — strong historical evidence and stable auction bidding signals.'
    : isModerate
      ? 'Moderate risk — potential auction CPC volatility during weekend surges.'
      : 'High risk — exploratory channel or aggressive audience scaling.';

  return (
    <div className='rounded-2xl border border-border/80 bg-card p-5 font-mono shadow-xs'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        {/* Left: Score & Visual Slider Line */}
        <div className='space-y-2 flex-1 min-w-[240px]'>
          <div className='flex items-center gap-2'>
            <IconShieldCheck className='size-4 text-emerald-400' />
            <span className='text-xs font-bold uppercase tracking-wider text-foreground'>
              RISK ASSESSMENT
            </span>
          </div>

          {/* Visual Indicator Line: LOW --- MED --- HIGH */}
          <div className='space-y-1.5 pt-1'>
            <div className='relative w-full h-2 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full overflow-hidden'>
              {/* Pointer indicator */}
              <div
                className='absolute top-0 bottom-0 w-2.5 bg-white shadow-md rounded-full -translate-x-1/2 ring-2 ring-black'
                style={{ left: `${Math.max(5, Math.min(95, riskScore))}%` }}
              />
            </div>

            <div className='flex justify-between text-[10px] text-muted-foreground'>
              <span className='text-emerald-400 font-bold'>LOW</span>
              <span className='text-amber-400 font-bold'>MODERATE</span>
              <span className='text-rose-400 font-bold'>HIGH</span>
            </div>
          </div>
        </div>

        {/* Middle: Numerical Score & Confidence */}
        <div className='flex items-center gap-4 px-4 border-l border-border/60'>
          <div>
            <span className='text-[10px] uppercase font-bold text-muted-foreground block'>
              RISK SCORE
            </span>
            <div className='flex items-baseline gap-1 mt-0.5'>
              <span
                className={cn(
                  'text-2xl font-black',
                  isLow ? 'text-emerald-400' : isModerate ? 'text-amber-400' : 'text-rose-400'
                )}
              >
                {riskScore}
              </span>
              <span className='text-xs text-muted-foreground'>/100</span>
            </div>
          </div>

          <div>
            <span className='text-[10px] uppercase font-bold text-muted-foreground block'>
              CONFIDENCE
            </span>
            <span className='text-2xl font-black text-cyan-400 mt-0.5 block'>
              {confidencePct}%
            </span>
          </div>
        </div>

        {/* Right: One-sentence explanation & Drawer trigger */}
        <div className='flex flex-col sm:items-end justify-center min-w-[220px]'>
          <p className='text-xs text-muted-foreground sm:text-right max-w-sm'>
            &quot;{explanation}&quot;
          </p>

          <button
            type='button'
            onClick={onOpenRiskModal}
            className='mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors'
          >
            <span>Inspect Risk Factors ({risks?.length || 2})</span>
            <IconArrowRight className='size-3' />
          </button>
        </div>
      </div>
    </div>
  );
}
