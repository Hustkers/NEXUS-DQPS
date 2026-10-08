'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  IconAdjustments,
  IconCalendar,
  IconCoins,
  IconGauge,
  IconPlayerPlay,
  IconRefresh,
  IconScale
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import type { AdPlaygroundConstraints } from '../../types/ad-playground-types';

interface PlaygroundConstraintsPanelProps {
  constraints: AdPlaygroundConstraints;
  onChangeConstraints: (constraints: AdPlaygroundConstraints) => void;
  onRunAnalysis: () => void;
  isLoading: boolean;
}

export function PlaygroundConstraintsPanel({
  constraints,
  onChangeConstraints,
  onRunAnalysis,
  isLoading
}: PlaygroundConstraintsPanelProps) {
  const allPlatforms = [
    { id: 'meta', name: 'Meta Ads', color: '#3b82f6' },
    { id: 'google', name: 'Google Ads', color: '#10b981' },
    { id: 'amazon', name: 'Amazon Ads', color: '#f59e0b' },
    { id: 'shopify', name: 'Shopify D2C', color: '#a1a1aa' }
  ];

  const togglePlatform = (pId: string) => {
    const current = constraints.platforms || ['meta', 'google', 'amazon', 'shopify'];
    let updated: string[];
    if (current.includes(pId)) {
      if (current.length === 1) return; // keep at least 1
      updated = current.filter((x) => x !== pId);
    } else {
      updated = [...current, pId];
    }
    onChangeConstraints({ ...constraints, platforms: updated });
  };

  return (
    <Card className='p-4 border-border/80 bg-card/60 shadow-xs backdrop-blur-xs'>
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-3 mb-4'>
        <div className='flex items-center gap-2'>
          <IconAdjustments className='size-4 text-cyan-500' />
          <h3 className='text-xs font-mono font-bold uppercase tracking-wider text-foreground'>
            Simulation Parameters &amp; Guardrails
          </h3>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              onChangeConstraints({
                ...constraints,
                total_budget: 5000,
                duration_days: 14,
                target_roas_floor: 1.8,
                platforms: ['meta', 'google', 'amazon', 'shopify'],
                strategy_focus: 'MAX_PROFIT'
              });
            }}
            className='h-7 px-2.5 text-[11px] font-mono'
          >
            <IconRefresh className='size-3 mr-1' />
            Reset Defaults
          </Button>

          <Button
            onClick={onRunAnalysis}
            disabled={isLoading}
            className='h-8 px-4 text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
          >
            <IconPlayerPlay className={cn('size-3.5 mr-1.5', isLoading && 'animate-spin')} />
            {isLoading ? 'Simulating...' : 'Evaluate 10 Campaigns'}
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-xs font-mono'>
        {/* Budget Slider */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <span className='flex items-center gap-1.5 text-muted-foreground'>
              <IconCoins className='size-3.5 text-amber-500' />
              Total Budget
            </span>
            <span className='font-bold text-foreground text-sm'>
              ${(constraints.total_budget ?? 5000).toLocaleString()}
            </span>
          </div>
          <div className='px-1.5 py-1 rounded-full bg-zinc-950/80 border border-zinc-800/80 shadow-inner flex items-center'>
            <input
              type='range'
              min={1000}
              max={25000}
              step={500}
              value={constraints.total_budget ?? 5000}
              onChange={(e) =>
                onChangeConstraints({ ...constraints, total_budget: Number(e.target.value) })
              }
              className='w-full accent-cyan-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg'
            />
          </div>
          <div className='flex justify-between text-[10px] text-muted-foreground'>
            <span>$1,000</span>
            <span>$12,500</span>
            <span>$25,000</span>
          </div>
        </div>

        {/* Duration Toggle */}
        <div className='space-y-2'>
          <span className='flex items-center gap-1.5 text-muted-foreground'>
            <IconCalendar className='size-3.5 text-blue-500' />
            Campaign Horizon
          </span>
          <div className='grid grid-cols-3 gap-1.5'>
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                type='button'
                onClick={() => onChangeConstraints({ ...constraints, duration_days: days })}
                className={cn(
                  'py-1.5 rounded-md border text-center transition-all',
                  constraints.duration_days === days
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-400 font-bold shadow-xs'
                    : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/60'
                )}
              >
                {days} Days
              </button>
            ))}
          </div>
          <p className='text-[10px] text-muted-foreground'>
            Daily alloc: ~${Math.round((constraints.total_budget ?? 5000) / constraints.duration_days)}/day
          </p>
        </div>

        {/* ROAS Floor */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <span className='flex items-center gap-1.5 text-muted-foreground'>
              <IconGauge className='size-3.5 text-emerald-500' />
              Min ROAS Floor
            </span>
            <span className='font-bold text-emerald-600 dark:text-emerald-400'>
              {constraints.target_roas_floor.toFixed(1)}x
            </span>
          </div>
          <div className='grid grid-cols-4 gap-1'>
            {[1.5, 1.8, 2.5, 3.2].map((r) => (
              <button
                key={r}
                type='button'
                onClick={() => onChangeConstraints({ ...constraints, target_roas_floor: r })}
                className={cn(
                  'py-1.5 rounded text-center border text-[11px] transition-all',
                  constraints.target_roas_floor === r
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400 font-bold'
                    : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted/50'
                )}
              >
                {r}x
              </button>
            ))}
          </div>
          <p className='text-[10px] text-muted-foreground'>Break-even benchmark is 1.8x</p>
        </div>

        {/* Objective Strategy */}
        <div className='space-y-2'>
          <span className='flex items-center gap-1.5 text-muted-foreground'>
            <IconScale className='size-3.5 text-purple-500' />
            Optimization Goal
          </span>
          <div className='grid grid-cols-3 gap-1'>
            {[
              { id: 'MAX_PROFIT', label: 'Max Profit' },
              { id: 'BALANCED', label: 'Balanced' },
              { id: 'SCALE_VOLUME', label: 'Volume' }
            ].map((opt) => (
              <button
                key={opt.id}
                type='button'
                onClick={() =>
                  onChangeConstraints({
                    ...constraints,
                    strategy_focus: opt.id as 'MAX_PROFIT' | 'BALANCED' | 'SCALE_VOLUME'
                  })
                }
                className={cn(
                  'py-1.5 px-1 rounded text-center border text-[10px] transition-all truncate',
                  constraints.strategy_focus === opt.id
                    ? 'border-purple-500 bg-purple-950/40 text-purple-300 font-bold'
                    : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted/50'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className='text-[10px] text-muted-foreground'>Prioritizes dollar margin yield</p>
        </div>
      </div>

      {/* Delivery Platforms Filter */}
      <div className='mt-4 pt-3 border-t border-border/50 flex flex-wrap items-center gap-2'>
        <span className='text-[11px] font-mono text-muted-foreground mr-2'>
          Included Ad Networks:
        </span>
        {allPlatforms.map((plat) => {
          const isIncluded = (constraints.platforms || ['meta', 'google', 'amazon', 'shopify']).includes(
            plat.id
          );
          return (
            <button
              key={plat.id}
              type='button'
              onClick={() => togglePlatform(plat.id)}
              className={cn(
                'px-2.5 py-1 rounded-full text-[11px] font-mono border transition-all flex items-center gap-1.5',
                isIncluded
                  ? 'border-border bg-card text-foreground font-semibold shadow-xs'
                  : 'border-dashed border-border/60 text-muted-foreground/60 opacity-60'
              )}
            >
              <span
                className='size-2 rounded-full'
                style={{ backgroundColor: isIncluded ? plat.color : '#64748b' }}
              />
              {plat.name}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
