'use client';

import React from 'react';
import {
  IconCheck,
  IconCpu,
  IconDatabase,
  IconArrowsSplit2,
  IconShieldCheck,
  IconSparkles,
  IconClock
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { UnifiedCommerceRecord } from '../normalization-engine';

interface NormalizationPipelineTrackerProps {
  record: UnifiedCommerceRecord | null;
  platformName: string;
}

export function NormalizationPipelineTracker({ record, platformName }: NormalizationPipelineTrackerProps) {
  const steps = [
    {
      id: 1,
      title: 'Raw API Ingest',
      detail: `${platformName} JSON`,
      metric: '0 Schema Drift',
      icon: IconArrowsSplit2,
      active: true,
      success: true
    },
    {
      id: 2,
      title: 'Pydantic v2 Type Cast',
      detail: 'Micros / Arrays Unwrapped',
      metric: '100% Type Checked',
      icon: IconCpu,
      active: true,
      success: true
    },
    {
      id: 3,
      title: 'Catalog SKU Stitch',
      detail: record ? `Master SKU: ${record.sku_id}` : 'Harmonizing',
      metric: 'ASIN & Barcode Joined',
      icon: IconDatabase,
      active: true,
      success: true
    },
    {
      id: 4,
      title: 'True CM3 Margin',
      detail: 'COGS, FBA & Gateway Fees',
      metric: record ? `${record.gross_margin_pct.toFixed(0)}% Margin Retained` : 'Computing',
      icon: IconShieldCheck,
      active: true,
      success: true
    },
    {
      id: 5,
      title: 'RL Optimizer Ready',
      detail: 'Normalized State Tensor',
      metric: 'Latency: 1.4ms',
      icon: IconSparkles,
      active: true,
      success: true
    }
  ];

  return (
    <div className='rounded-xl border border-border/80 bg-card p-3 sm:p-4 shadow-xs font-mono'>
      <div className='flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5 mb-3'>
        <div className='flex items-center gap-2'>
          <div className='size-2 rounded-full bg-emerald-500 animate-pulse' />
          <span className='text-xs font-bold text-foreground uppercase tracking-wider'>
            Live Schema Transformation Pipeline
          </span>
        </div>
        <div className='flex items-center gap-2 text-[10px] text-muted-foreground'>
          <span className='flex items-center gap-1'>
            <IconClock className='size-3 text-cyan-400' />
            Pipeline Latency: <strong className='text-cyan-400'>1.4ms</strong>
          </span>
          <span>•</span>
          <span className='text-emerald-400 font-semibold'>Strict Pydantic 2.6 Active</span>
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5'>
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              className='relative p-2.5 rounded-lg border border-border/60 bg-muted/30 flex flex-col justify-between hover:border-cyan-500/40 transition-all'
            >
              <div>
                <div className='flex items-center justify-between mb-1.5'>
                  <div className='size-6 rounded-md bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-[11px] border border-cyan-500/20'>
                    <Icon className='size-3.5' />
                  </div>
                  <Badge variant='outline' className='text-[9px] px-1 py-0 text-emerald-400 border-emerald-500/30 bg-emerald-500/10'>
                    <IconCheck className='size-2.5 mr-0.5' /> OK
                  </Badge>
                </div>
                <div className='text-xs font-bold text-foreground truncate'>{s.title}</div>
                <div className='text-[10px] text-muted-foreground truncate mt-0.5'>{s.detail}</div>
              </div>
              <div className='mt-2 pt-1.5 border-t border-border/40 text-[9px] text-cyan-400 font-semibold'>
                {s.metric}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
