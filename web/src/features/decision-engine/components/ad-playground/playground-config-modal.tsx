'use client';

import React from 'react';
import {
  IconCalculator,
  IconMath,
  IconScale,
  IconX
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import type { CandidateAdConfig } from '../../types/ad-playground-types';

interface PlaygroundConfigModalProps {
  config: CandidateAdConfig | null;
  isOpen: boolean;
  onClose: () => void;
  productPrice: number;
  grossMarginPct: number;
  inventoryUnits: number;
}

export function PlaygroundConfigModal({
  config,
  isOpen,
  onClose,
  productPrice,
  grossMarginPct,
  inventoryUnits
}: PlaygroundConfigModalProps) {
  if (!isOpen || !config) return null;

  const breakevenRoas = grossMarginPct > 0 ? (100 / grossMarginPct).toFixed(2) : '1.80';

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs'>
      <div className='relative w-full max-w-2xl rounded-xl border border-border bg-card p-5 sm:p-6 shadow-2xl text-foreground font-mono text-xs max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-border/80 pb-3 mb-4'>
          <div className='flex items-center gap-2'>
            <IconCalculator className='size-5 text-cyan-400' />
            <div>
              <h2 className='text-sm sm:text-base font-bold text-foreground'>
                Prediction Formula &amp; Economic Assumptions
              </h2>
              <p className='text-[11px] text-muted-foreground'>
                {config.title} (Rank #{config.rank})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='size-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground'
          >
            <IconX className='size-4' />
          </button>
        </div>

        {/* Primary Mathematical Model */}
        <div className='space-y-4'>
          <div className='p-3.5 rounded-lg bg-muted/40 border border-border/60 space-y-2'>
            <div className='flex items-center gap-1.5 text-cyan-400 font-bold uppercase text-[11px]'>
              <IconMath className='size-4' />
              1. Saturation Response Curve (Hill / Diminishing Returns)
            </div>
            <p className='text-muted-foreground text-[11px] leading-relaxed'>
              Ad platform channel yield follows the concave power-law saturation formulation:
            </p>
            <div className='p-2 rounded bg-black/40 border border-border/40 font-mono text-center text-emerald-400 font-semibold'>
              Revenue(s) = k · (Daily Spend)^b · Duration
            </div>
            <div className='grid grid-cols-2 gap-2 text-[11px] pt-1 text-muted-foreground'>
              <div>• Curvature (b): <strong>0.75 – 0.81</strong> (&lt; 1.0 ensures diminishing returns)</div>
              <div>• Base Unit Price: <strong>${productPrice.toFixed(2)}</strong></div>
            </div>
          </div>

          <div className='p-3.5 rounded-lg bg-muted/40 border border-border/60 space-y-2'>
            <div className='flex items-center gap-1.5 text-emerald-400 font-bold uppercase text-[11px]'>
              <IconScale className='size-4' />
              2. Profit Optimization Objective Function
            </div>
            <div className='p-2 rounded bg-black/40 border border-border/40 font-mono text-center text-cyan-400 font-semibold'>
              Expected Net Profit = (Expected Revenue · Gross Margin %) - Expected Ad Spend
            </div>
            <div className='grid grid-cols-3 gap-2 text-[11px] pt-1 text-muted-foreground'>
              <div>• Gross Margin %: <strong>{grossMarginPct.toFixed(1)}%</strong></div>
              <div>• Break-even ROAS: <strong>{breakevenRoas}x</strong></div>
              <div>• Target Floor: <strong>1.8x ROAS</strong></div>
            </div>
          </div>

          {/* Configuration Parameters Breakdown */}
          <div className='border border-border/80 rounded-lg p-3 space-y-2'>
            <h4 className='text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
              Simulated Parameters for #{config.rank} {config.title}
            </h4>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]'>
              <div className='p-2 rounded bg-muted/30'>
                <div className='text-muted-foreground'>Daily Budget</div>
                <div className='font-bold text-foreground'>${config.daily_budget.toLocaleString()}/day</div>
              </div>
              <div className='p-2 rounded bg-muted/30'>
                <div className='text-muted-foreground'>Duration</div>
                <div className='font-bold text-foreground'>{config.duration_days} Days</div>
              </div>
              <div className='p-2 rounded bg-muted/30'>
                <div className='text-muted-foreground'>Total Ad Spend</div>
                <div className='font-bold text-foreground'>${config.expected_spend.toLocaleString()}</div>
              </div>
              <div className='p-2 rounded bg-muted/30'>
                <div className='text-muted-foreground'>Predicted Revenue</div>
                <div className='font-bold text-foreground'>${config.predicted_revenue.toLocaleString()}</div>
              </div>
            </div>

            <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1'>
              <div className='p-2 rounded bg-muted/30'>
                <div className='text-muted-foreground'>Gross Margin $</div>
                <div className='font-bold text-emerald-400'>${config.predicted_gross_margin.toLocaleString()}</div>
              </div>
              <div className='p-2 rounded bg-muted/30'>
                <div className='text-muted-foreground'>Net Ad Profit</div>
                <div className='font-bold text-emerald-400'>${config.predicted_net_profit.toLocaleString()}</div>
              </div>
              <div className='p-2 rounded bg-muted/30'>
                <div className='text-muted-foreground'>Predicted ROAS</div>
                <div className='font-bold text-cyan-400'>{config.predicted_roas.toFixed(2)}x</div>
              </div>
              <div className='p-2 rounded bg-muted/30'>
                <div className='text-muted-foreground'>Confidence</div>
                <div className='font-bold text-purple-400'>{(config.confidence_score * 100).toFixed(0)}%</div>
              </div>
            </div>
          </div>

          {/* Stockout Headroom Verification */}
          <div className='p-3 rounded-lg border border-border/80 bg-slate-50/50 dark:bg-zinc-950/40 text-[11px] space-y-1.5'>
            <div className='flex items-center justify-between'>
              <span className='font-semibold text-foreground'>Warehouse Fulfillment Safety:</span>
              <span className='text-muted-foreground'>Available Stock: <strong>{inventoryUnits} pairs</strong></span>
            </div>
            <p className='text-muted-foreground'>
              Simulated conversions: <strong>{config.predicted_conversions} pairs</strong>.
              {config.stockout_risk
                ? ' Volume approaches available stock. Realizable profit is capped to prevent unfulfillable ad waste.'
                : ' Adequate warehouse buffer is available to fulfill all anticipated conversion volume.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className='mt-5 pt-3 border-t border-border/80 flex justify-end'>
          <Button size='sm' onClick={onClose} className='font-mono text-xs'>
            Close Mathematical View
          </Button>
        </div>
      </div>
    </div>
  );
}
