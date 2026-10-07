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
    <div className='rounded-2xl border border-cyan-500/30 bg-card p-6 shadow-xl relative overflow-hidden'>
      <div className='absolute top-0 left-0 right-0 h-1 bg-muted overflow-hidden'>
        <div className='h-full bg-cyan-500 animate-pulse w-3/4 transition-all duration-700' />
      </div>

      <div className='flex items-center gap-3 mb-5'>
        <div className='p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'>
          <IconCpu className='size-6 animate-spin' style={{ animationDuration: '4s' }} />
        </div>
        <div>
          <h3 className='text-sm font-mono font-bold text-foreground'>
            Simulating &amp; Evaluating Campaign Strategies
          </h3>
          <p className='text-xs font-mono text-muted-foreground'>
            Generating candidate advertising strategies across Meta, Google, Amazon, and TikTok
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        {steps.map((st, i) => (
          <div
            key={st.id}
            className={`p-3 rounded-xl border transition-all ${
              st.status === 'active'
                ? 'border-cyan-500 bg-cyan-500/10 shadow-xs'
                : st.status === 'done'
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-border/40 bg-muted/10 opacity-60'
            }`}
          >
            <div className='flex items-center justify-between mb-1.5'>
              <span className='text-[10px] font-mono text-muted-foreground uppercase tracking-wider'>
                Phase {i + 1}
              </span>
              {st.status === 'done' ? (
                <span className='text-emerald-400 font-mono text-xs flex items-center gap-1'>
                  <IconCheck className='size-3.5' /> Done
                </span>
              ) : st.status === 'active' ? (
                <span className='text-cyan-400 font-mono text-xs flex items-center gap-1 animate-pulse'>
                  <span className='size-2 rounded-full bg-cyan-400 animate-ping' /> Processing
                </span>
              ) : (
                <span className='text-muted-foreground/40 font-mono text-xs'>Queued</span>
              )}
            </div>
            <h4 className='text-xs font-mono font-semibold text-foreground truncate'>{st.title}</h4>
            <p className='text-[11px] font-mono text-muted-foreground mt-1 line-clamp-2'>{st.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
