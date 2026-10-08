'use client';

import React, { useState } from 'react';
import {
  IconChevronDown,
  IconChevronUp,
  IconCpu
} from '@tabler/icons-react';
import type { AdPlaygroundResult } from '../../types/ad-playground-types';

interface PlaygroundModelDetailsProps {
  result: AdPlaygroundResult;
}

export function PlaygroundModelDetails({ result }: PlaygroundModelDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='rounded-xl border border-border/60 bg-muted/20 font-mono text-xs'>
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className='w-full flex items-center justify-between p-4 text-left hover:bg-muted/40 transition-colors'
      >
        <div className='flex items-center gap-2 text-muted-foreground'>
          <IconCpu className='size-4 text-cyan-400' />
          <span className='font-bold uppercase tracking-wider text-foreground text-xs'>
            MODEL DETAILS &amp; DATA LINEAGE
          </span>
        </div>
        <div className='flex items-center gap-1.5 text-muted-foreground text-[11px]'>
          <span>{isOpen ? 'Collapse' : 'Inspect parameters'}</span>
          {isOpen ? <IconChevronUp className='size-3.5' /> : <IconChevronDown className='size-3.5' />}
        </div>
      </button>

      {isOpen && (
        <div className='p-4 pt-1 border-t border-border/40 space-y-4 animate-in fade-in-0 duration-150'>
          {/* 1. Mathematical Formulas */}
          <div className='space-y-1.5'>
            <span className='text-[10px] uppercase font-bold text-muted-foreground tracking-wider block'>
              MATHEMATICAL FORMULATIONS
            </span>
            <div className='p-3 rounded-lg bg-background/80 border border-border/60 space-y-2 text-[11px]'>
              <div>
                <span className='text-muted-foreground'>Non-linear Hill Response Function:</span>
                <code className='block text-cyan-400 font-bold mt-0.5'>
                  Revenue(s) = (a · sᵇ) / (c + sᵇ)
                </code>
              </div>
              <div>
                <span className='text-muted-foreground'>Marginal Profit Headroom (Derivative):</span>
                <code className='block text-emerald-400 font-bold mt-0.5'>
                  dProfit/ds = [ (a · b · c · sᵇ⁻¹) / (c + sᵇ)² · GrossMargin% ] - 1
                </code>
              </div>
            </div>
          </div>

          {/* 2. Fitted Parameters Table */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-2.5'>
            <div className='p-2.5 rounded-lg bg-background/60 border border-border/40'>
              <span className='text-[10px] text-muted-foreground block'>Capacity Ceiling (a)</span>
              <span className='text-xs font-bold text-foreground'>
                ₹{result.hill_parameters.capacity_a.toLocaleString()}
              </span>
            </div>
            <div className='p-2.5 rounded-lg bg-background/60 border border-border/40'>
              <span className='text-[10px] text-muted-foreground block'>Response Elasticity (b)</span>
              <span className='text-xs font-bold text-foreground'>
                {result.hill_parameters.elasticity_b.toFixed(2)}
              </span>
            </div>
            <div className='p-2.5 rounded-lg bg-background/60 border border-border/40'>
              <span className='text-[10px] text-muted-foreground block'>Half Saturation (c)</span>
              <span className='text-xs font-bold text-foreground'>
                {result.hill_parameters.half_saturation_c.toLocaleString()}
              </span>
            </div>
            <div className='p-2.5 rounded-lg bg-background/60 border border-border/40'>
              <span className='text-[10px] text-muted-foreground block'>Unit Gross Margin</span>
              <span className='text-xs font-bold text-foreground'>
                {result.gross_margin_pct}%
              </span>
            </div>
          </div>

          {/* 3. Guardrails & Inventory Lineage */}
          <div className='space-y-1.5'>
            <span className='text-[10px] uppercase font-bold text-muted-foreground tracking-wider block'>
              GUARDRAILS &amp; INVENTORY CONSTRAINT
            </span>
            <div className='p-3 rounded-lg bg-background/80 border border-border/60 text-[11px] space-y-1.5'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Warehouse Available Units:</span>
                <span className='font-bold text-foreground'>{result.inventory} pairs</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Operating Status:</span>
                <span className='font-bold text-foreground'>{result.profitability_status}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Recommended Capital Action:</span>
                <span className='font-bold text-emerald-400'>{result.recommended_action}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Data Quality Note:</span>
                <span className='text-muted-foreground'>{result.data_quality_warning || 'Healthy inventory priors validated'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
