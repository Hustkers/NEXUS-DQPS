'use client';

import React from 'react';
import { IconCpu, IconSparkles, IconCheck, IconChartBar } from '@tabler/icons-react';

interface StrategyGenerationProgressProps {
  currentStage: 'idle' | 'generating' | 'evaluating' | 'complete';
}

export function StrategyGenerationProgress({ currentStage }: StrategyGenerationProgressProps) {
  if (currentStage === 'idle' || currentStage === 'complete') return null;

  const steps = [
    {
      id: 'step-1',
      title: 'Campaign Setup Ingestion',
      detail: 'Validating parameters, budget bounds, and platform constraints',
      status: 'done'
    },
    {
      id: 'step-2',
      title: 'Generating 20–25 Strategic Archetypes',
      detail: 'Synthesizing diverse audiences, ad formats, bidding strategies & funnel positions',
      status: currentStage === 'generating' ? 'active' : 'done'
    },
    {
      id: 'step-3',
      title: 'Evaluating Predictive Performance Engine',
      detail: 'Predicting CTR, CPC, CVR, CPA, conversions, expected revenue & risk scores',
      status: currentStage === 'evaluating' ? 'active' : 'pending'
    },
    {
      id: 'step-4',
      title: 'Strategy Ranking & Top 3 Recommendation Synthesis',
      detail: 'Ranking by composite score and compiling data-driven decision explanations',
      status: 'pending'
    }
  ];

  return (
    <div className='rounded-xl border border-border bg-card p-5 relative overflow-hidden'>
      <div className='absolute top-0 left-0 right-0 h-0.5 bg-muted overflow-hidden'>
        <div className='h-full bg-zinc-200 w-3/4 transition-all duration-700' />
      </div>

      <div className='flex items-center gap-3 mb-4'>
        <div className='p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200'>
          <IconCpu className='size-5' />
        </div>
        <div>
          <h3 className='text-sm font-mono font-medium text-foreground'>
            Simulating &amp; Evaluating Campaign Strategies
          </h3>
          <p className='text-xs font-mono text-muted-foreground'>
            Generating candidate advertising strategies across Meta, Google, Amazon, and TikTok
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
        {steps.map((st, i) => (
          <div
            key={st.id}
            className={`p-3 rounded-lg border transition-all ${
              st.status === 'active'
                ? 'border-zinc-500 bg-zinc-800/40'
                : st.status === 'done'
                ? 'border-border bg-zinc-900/40'
                : 'border-border/40 bg-muted/10 opacity-60'
            }`}
          >
            <div className='flex items-center justify-between mb-1.5'>
              <span className='text-[10px] font-mono text-muted-foreground uppercase tracking-wider'>
                Phase {i + 1}
              </span>
              {st.status === 'done' ? (
                <span className='text-zinc-300 font-mono text-xs flex items-center gap-1'>
                  <IconCheck className='size-3.5' /> Complete
                </span>
              ) : st.status === 'active' ? (
                <span className='text-zinc-100 font-mono text-xs flex items-center gap-1 font-medium'>
                  Processing
                </span>
              ) : (
                <span className='text-muted-foreground/40 font-mono text-xs'>Queued</span>
              )}
            </div>
            <h4 className='text-xs font-mono font-medium text-foreground truncate'>{st.title}</h4>
            <p className='text-[11px] font-mono text-muted-foreground mt-1 line-clamp-2'>{st.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
