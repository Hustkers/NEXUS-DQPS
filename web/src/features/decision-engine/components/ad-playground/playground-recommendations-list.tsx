'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  IconAlertTriangle,
  IconCheck,
  IconEye,
  IconInfoCircle,
  IconSparkles,
  IconTarget
} from '@tabler/icons-react';
import type { CandidateAdConfig } from '../../types/ad-playground-types';
import { cn } from '@/lib/utils';

interface PlaygroundRecommendationsListProps {
  candidates: CandidateAdConfig[];
  onInspectConfig: (config: CandidateAdConfig) => void;
}

export function PlaygroundRecommendationsList({
  candidates,
  onInspectConfig
}: PlaygroundRecommendationsListProps) {
  const platformMeta: Record<string, { name: string; color: string; bg: string }> = {
    meta: { name: 'Meta Ads', color: '#3b82f6', bg: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
    google: { name: 'Google Ads', color: '#10b981', bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' },
    amazon: { name: 'Amazon Ads', color: '#f59e0b', bg: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
    shopify: { name: 'Shopify D2C', color: '#a1a1aa', bg: 'bg-zinc-800 text-zinc-300 border-zinc-700' }
  };

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <IconSparkles className='size-4 text-emerald-500' />
          <h2 className='text-xs font-mono font-bold uppercase tracking-wider text-foreground'>
            Ranked Recommendations (Profit Maximization Objective)
          </h2>
        </div>
        <span className='text-[11px] font-mono text-muted-foreground'>
          Evaluated {candidates.length} Candidate Configurations
        </span>
      </div>

      <div className='space-y-3.5'>
        {candidates.map((cand) => {
          const isTop = cand.rank === 1;
          const pMeta = platformMeta[cand.platform] || platformMeta.meta;

          return (
            <Card
              key={cand.config_id}
              className={cn(
                'relative overflow-hidden transition-all duration-200 border p-4 sm:p-5',
                isTop
                  ? 'border-emerald-500 bg-gradient-to-r from-emerald-950/20 via-card to-card shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/40'
                  : 'border-border/80 bg-card/70 hover:border-border hover:bg-card'
              )}
            >
              {/* Top Banner */}
              {isTop && (
                <div className='absolute top-0 right-0 bg-emerald-500 text-slate-950 font-mono font-bold text-[10px] px-3 py-0.5 rounded-bl-md shadow-xs flex items-center gap-1 uppercase tracking-wider'>
                  <IconSparkles className='size-3 stroke-[3]' />
                  #1 Recommended • Best Predicted Profit
                </div>
              )}

              <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
                {/* Header Information */}
                <div className='space-y-1.5 flex-1 min-w-0'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span
                      className={cn(
                        'size-6 rounded-md font-mono text-xs font-black flex items-center justify-center shrink-0',
                        isTop ? 'bg-emerald-500 text-slate-950' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      #{cand.rank}
                    </span>

                    <h3 className='text-sm sm:text-base font-semibold text-foreground tracking-tight'>
                      {cand.title}
                    </h3>

                    <Badge variant='outline' className={cn('text-[10px] font-mono uppercase py-0.5 px-2 border', pMeta.bg)}>
                      {pMeta.name}
                    </Badge>

                    <Badge variant='outline' className='text-[10px] font-mono text-muted-foreground py-0.5 px-2 border-border'>
                      {cand.objective}
                    </Badge>
                  </div>

                  <div className='flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-muted-foreground'>
                    <span className='flex items-center gap-1'>
                      <IconTarget className='size-3 text-cyan-400' />
                      Audience: <strong className='text-foreground'>{cand.audience_segment}</strong>
                    </span>
                    <span>•</span>
                    <span>Bidding: <strong className='text-foreground'>{cand.bidding_strategy}</strong></span>
                  </div>
                </div>

                {/* Primary Financial Metric Spotlight */}
                <div className='flex items-center gap-3 shrink-0 bg-muted/30 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-border/60'>
                  <div className='text-right'>
                    <div className='text-[10px] font-mono uppercase text-muted-foreground tracking-wider'>
                      Expected Net Profit
                    </div>
                    <div
                      className={cn(
                        'text-lg sm:text-xl font-mono font-bold tracking-tight',
                        cand.predicted_net_profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      )}
                    >
                      ${cand.predicted_net_profit.toLocaleString()}
                    </div>
                  </div>

                  <div className='h-8 w-px bg-border' />

                  <div className='text-left'>
                    <div className='text-[10px] font-mono uppercase text-muted-foreground tracking-wider'>
                      Predicted ROAS
                    </div>
                    <div className='text-lg sm:text-xl font-mono font-bold text-cyan-400'>
                      {cand.predicted_roas.toFixed(2)}x
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Metrics Strip */}
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-4 pt-3 border-t border-border/60 text-xs font-mono bg-slate-50/50 dark:bg-zinc-950/40 p-2.5 rounded-lg'>
                <div>
                  <div className='text-[10px] text-muted-foreground uppercase'>Daily Spend</div>
                  <div className='font-bold text-foreground'>${cand.daily_budget.toLocaleString()}/day</div>
                </div>
                <div>
                  <div className='text-[10px] text-muted-foreground uppercase'>Total Spend ({cand.duration_days}d)</div>
                  <div className='font-bold text-foreground'>${cand.expected_spend.toLocaleString()}</div>
                </div>
                <div>
                  <div className='text-[10px] text-muted-foreground uppercase'>Predicted Revenue</div>
                  <div className='font-bold text-foreground'>${cand.predicted_revenue.toLocaleString()}</div>
                </div>
                <div>
                  <div className='text-[10px] text-muted-foreground uppercase'>Est. Conversions</div>
                  <div className='font-bold text-foreground'>{cand.predicted_conversions.toLocaleString()} pairs</div>
                </div>
                <div>
                  <div className='text-[10px] text-muted-foreground uppercase'>Est. CPM / CPC</div>
                  <div className='font-bold text-foreground'>${cand.predicted_cpm.toFixed(2)} / ${cand.predicted_cpc.toFixed(2)}</div>
                </div>
                <div>
                  <div className='text-[10px] text-muted-foreground uppercase'>Model Confidence</div>
                  <div className='font-bold text-purple-400'>{(cand.confidence_score * 100).toFixed(0)}%</div>
                </div>
              </div>

              {/* Stockout Warning Banner */}
              {cand.stockout_risk && (
                <div className='mt-3 flex items-center gap-2 p-2 rounded-md bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs font-mono'>
                  <IconAlertTriangle className='size-4 shrink-0 text-amber-400' />
                  <span>
                    <strong>Stockout Headroom Alert:</strong> High conversion velocity may strain warehouse inventory levels before campaign ends.
                  </span>
                </div>
              )}

              {/* Explainability Callout & Drivers */}
              <div className='mt-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono'>
                <div className='flex items-start gap-2 flex-1'>
                  <IconInfoCircle className='size-4 text-cyan-500 shrink-0 mt-0.5' />
                  <div>
                    <span className='text-muted-foreground'>{cand.explanation}</span>
                    <div className='flex flex-wrap gap-1.5 mt-1.5'>
                      {cand.key_drivers.map((kd, i) => (
                        <span
                          key={i}
                          className='inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-muted/60 text-foreground border border-border/60'
                        >
                          <IconCheck className='size-2.5 mr-1 text-emerald-400' />
                          {kd}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => onInspectConfig(cand)}
                  className='h-7 px-3 text-[11px] font-mono shrink-0 hover:bg-muted'
                >
                  <IconEye className='size-3 mr-1 text-cyan-400' />
                  Inspect Math
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
