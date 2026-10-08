'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { ShockScenarioId, SimulationHorizon, ScenarioInputParams } from '../types/simulation-types';

interface ScenarioInputPanelProps {
  scenarioId: ShockScenarioId;
  inputs: ScenarioInputParams;
  onChangeInputs: (newInputs: ScenarioInputParams) => void;
  onResetBaseline: () => void;
  className?: string;
}

export function ScenarioInputPanel({
  scenarioId,
  inputs,
  onChangeInputs,
  onResetBaseline,
  className
}: ScenarioInputPanelProps) {
  const handleChange = <K extends keyof ScenarioInputParams>(key: K, value: ScenarioInputParams[K]) => {
    onChangeInputs({
      ...inputs,
      [key]: value
    });
  };

  return (
    <div className={cn('rounded-xl border border-border/80 bg-card p-4 sm:p-5 font-mono shadow-xs space-y-4', className)}>
      <div className='flex items-center justify-between border-b border-border/60 pb-3'>
        <div className='flex items-center gap-2'>
          <Icons.adjustments className='size-3.5 text-muted-foreground' />
          <h3 className='text-xs font-bold uppercase tracking-wider text-foreground'>
            Scenario Inputs &amp; Shock Parameters
          </h3>
        </div>
        <Button
          size='sm'
          variant='outline'
          onClick={onResetBaseline}
          className='h-7 text-[11px] font-mono border-border text-muted-foreground hover:text-foreground'
        >
          <Icons.clock className='mr-1 size-3' />
          Reset Baseline
        </Button>
      </div>

      {/* Simulation Horizon Selector */}
      <div className='space-y-1.5'>
        <label className='text-[10px] text-muted-foreground uppercase font-bold tracking-wider'>
          Simulation Horizon
        </label>
        <div className='grid grid-cols-3 gap-2'>
          {([1, 7, 30] as SimulationHorizon[]).map((h) => (
            <button
              key={h}
              type='button'
              onClick={() => handleChange('horizonDays', h)}
              className={cn(
                'py-1.5 px-2 rounded-lg border text-xs font-semibold uppercase transition-all',
                inputs.horizonDays === h
                  ? 'border-foreground bg-foreground text-background shadow-2xs font-bold'
                  : 'border-border bg-slate-50/50 dark:bg-zinc-900/40 text-muted-foreground hover:text-foreground'
              )}
            >
              {h === 1 ? '1 Day' : `${h} Days`}
            </button>
          ))}
        </div>
      </div>

      {/* SCENARIO SPECIFIC CONTROLS */}
      {scenarioId === 'stockout' && (
        <div className='space-y-3 pt-1'>
          {/* Affected SKU Info */}
          <div className='rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs space-y-0.5'>
            <div className='text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400'>
              Affected Hero SKU
            </div>
            <div className='font-bold text-foreground'>
              Nike Air Force 1 '07 (SKU: 315122-001)
            </div>
            <div className='text-[11px] text-muted-foreground'>
              Warehouse physical inventory depleted across US fulfillment hubs.
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div className='space-y-1'>
              <label className='text-[10px] text-muted-foreground uppercase'>
                Shocked Inventory (Units)
              </label>
              <input
                type='number'
                min={0}
                max={500}
                value={inputs.inventoryShockUnits}
                onChange={(e) => handleChange('inventoryShockUnits', Math.max(0, parseInt(e.target.value) || 0))}
                className='w-full rounded-md border border-rose-500/40 bg-card px-2.5 py-1.5 text-xs text-foreground font-bold focus:outline-none focus:ring-1 focus:ring-rose-500'
              />
              <span className='text-[9px] text-rose-500 font-semibold'>0 units = Total stockout</span>
            </div>

            <div className='space-y-1'>
              <label className='text-[10px] text-muted-foreground uppercase'>
                Baseline Daily Spend (₹)
              </label>
              <input
                type='number'
                min={500}
                step={100}
                value={inputs.baselineDailySpend}
                onChange={(e) => handleChange('baselineDailySpend', Math.max(100, parseInt(e.target.value) || 0))}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary'
              />
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            <div className='space-y-1'>
              <label className='text-[10px] text-muted-foreground uppercase'>
                Baseline CVR (%)
              </label>
              <input
                type='number'
                step={0.1}
                value={inputs.baselineCvrPct}
                onChange={(e) => handleChange('baselineCvrPct', parseFloat(e.target.value) || 0.1)}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold'
              />
            </div>

            <div className='space-y-1'>
              <label className='text-[10px] text-muted-foreground uppercase'>
                AOV (₹)
              </label>
              <input
                type='number'
                step={50}
                value={inputs.aov}
                onChange={(e) => handleChange('aov', parseInt(e.target.value) || 1000)}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold'
              />
            </div>

            <div className='space-y-1'>
              <label className='text-[10px] text-muted-foreground uppercase'>
                Gross Margin (%)
              </label>
              <input
                type='number'
                min={10}
                max={90}
                value={inputs.marginPct}
                onChange={(e) => handleChange('marginPct', parseInt(e.target.value) || 50)}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold'
              />
            </div>
          </div>
        </div>
      )}

      {scenarioId === 'cpm-spike' && (
        <div className='space-y-3 pt-1'>
          <div className='rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs space-y-0.5'>
            <div className='text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400'>
              Auction Delivery Vector
            </div>
            <div className='font-bold text-foreground'>
              Meta Advantage+ Sneaker Placements (AO2924-401)
            </div>
            <div className='text-[11px] text-muted-foreground'>
              Holiday auction crowding inflates 1,000 impression costs from ₹9.50 baseline.
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div className='space-y-1'>
              <label className='text-[10px] text-muted-foreground uppercase'>
                Baseline CPM (₹)
              </label>
              <input
                type='number'
                step={0.5}
                value={inputs.baselineCpm}
                onChange={(e) => handleChange('baselineCpm', parseFloat(e.target.value) || 1)}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold'
              />
            </div>

            <div className='space-y-1'>
              <label className='text-[10px] text-muted-foreground uppercase'>
                CPM Multiplier ({Math.round(inputs.cpmMultiplier * 100)}% of base)
              </label>
              <input
                type='number'
                step={0.05}
                min={1.0}
                max={3.0}
                value={inputs.cpmMultiplier}
                onChange={(e) => handleChange('cpmMultiplier', Math.max(1.0, parseFloat(e.target.value) || 1.0))}
                className='w-full rounded-md border border-amber-500/40 bg-card px-2.5 py-1.5 text-xs text-foreground font-bold focus:ring-1 focus:ring-amber-500'
              />
              <span className='text-[9px] text-amber-600 dark:text-amber-400 font-semibold'>
                Current Shock CPM: ₹{(inputs.baselineCpm * inputs.cpmMultiplier).toFixed(2)}
              </span>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            <div className='space-y-1'>
              <label className='text-[10px] text-muted-foreground uppercase'>
                Meta Daily Spend (₹)
              </label>
              <input
                type='number'
                step={100}
                value={inputs.baselineDailySpend}
                onChange={(e) => handleChange('baselineDailySpend', Math.max(100, parseInt(e.target.value) || 0))}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold'
              />
            </div>

            <div className='space-y-1'>
              <label className='text-[10px] text-muted-foreground uppercase'>
                CTR (%)
              </label>
              <input
                type='number'
                step={0.1}
                value={inputs.ctrPct}
                onChange={(e) => handleChange('ctrPct', parseFloat(e.target.value) || 0.1)}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold'
              />
            </div>

            <div className='space-y-1'>
              <label className='text-[10px] text-muted-foreground uppercase'>
                CVR (%)
              </label>
              <input
                type='number'
                step={0.1}
                value={inputs.baselineCvrPct}
                onChange={(e) => handleChange('baselineCvrPct', parseFloat(e.target.value) || 0.1)}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold'
              />
            </div>
          </div>
        </div>
      )}

      {scenarioId === 'creative-fatigue' && (
        <div className='space-y-3 pt-1'>
          <div className='rounded-lg bg-sky-500/10 border border-sky-500/20 p-2.5 text-xs space-y-0.5'>
            <div className='text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400'>
              TikTok UGC Ad Set
            </div>
            <div className='font-bold text-foreground'>
              Air Max 270 Creator Hook Set #4 (AH8050-100)
            </div>
            <div className='text-[11px] text-muted-foreground'>
              Frequency exceeds 5.2x resulting in creative saturation and drop in hook rates.
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div className='space-y-1'>
              <label className='text-[10px] text-muted-foreground uppercase'>
                Baseline CTR (%)
              </label>
              <input
                type='number'
                step={0.1}
                value={inputs.ctrPct}
                onChange={(e) => handleChange('ctrPct', parseFloat(e.target.value) || 0.1)}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold'
              />
            </div>

            <div className='space-y-1'>
              <label className='text-[10px] text-muted-foreground uppercase'>
                Fatigue Decay (%)
              </label>
              <input
                type='number'
                min={10}
                max={90}
                value={inputs.fatiguePct}
                onChange={(e) => handleChange('fatiguePct', Math.min(90, Math.max(0, parseInt(e.target.value) || 0)))}
                className='w-full rounded-md border border-sky-500/40 bg-card px-2.5 py-1.5 text-xs text-foreground font-bold focus:ring-1 focus:ring-sky-500'
              />
              <span className='text-[9px] text-sky-600 dark:text-sky-400 font-semibold'>
                Shocked CTR: {(inputs.ctrPct * (1 - inputs.fatiguePct / 100)).toFixed(2)}%
              </span>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div className='space-y-1'>
              <label className='text-[10px] text-muted-foreground uppercase'>
                Daily Spend (₹)
              </label>
              <input
                type='number'
                step={100}
                value={inputs.baselineDailySpend}
                onChange={(e) => handleChange('baselineDailySpend', Math.max(100, parseInt(e.target.value) || 0))}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold'
              />
            </div>

            <div className='space-y-1'>
              <label className='text-[10px] text-muted-foreground uppercase'>
                AOV (₹)
              </label>
              <input
                type='number'
                step={100}
                value={inputs.aov}
                onChange={(e) => handleChange('aov', parseInt(e.target.value) || 1000)}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold'
              />
            </div>
          </div>
        </div>
      )}

      {scenarioId === 'price-undercut' && (
        <div className='space-y-3 pt-1'>
          <div className='rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs space-y-0.5'>
            <div className='text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400'>
              Amazon Buy Box Channel
            </div>
            <div className='font-bold text-foreground'>
              Nike Zoom Fly (SKU: 880848-005)
            </div>
            <div className='text-[11px] text-muted-foreground'>
              Rival merchant undercuts official listing by 25%, taking majority Buy Box share.
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div className='space-y-1'>
              <label className='text-[10px] text-muted-foreground uppercase'>
                Official Nike Price (₹)
              </label>
              <input
                type='number'
                step={100}
                value={inputs.ourPrice}
                onChange={(e) => handleChange('ourPrice', parseInt(e.target.value) || 1000)}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold'
              />
            </div>

            <div className='space-y-1'>
              <label className='text-[10px] text-muted-foreground uppercase'>
                Competitor Price (₹)
              </label>
              <input
                type='number'
                step={100}
                value={inputs.competitorPrice}
                onChange={(e) => handleChange('competitorPrice', parseInt(e.target.value) || 1000)}
                className='w-full rounded-md border border-amber-500/40 bg-card px-2.5 py-1.5 text-xs text-foreground font-bold focus:ring-1 focus:ring-amber-500'
              />
              <span className='text-[9px] text-amber-600 dark:text-amber-400 font-semibold'>
                Undercut: {Math.round(((inputs.ourPrice - inputs.competitorPrice) / inputs.ourPrice) * 100)}% discount
              </span>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            <div className='space-y-1'>
              <label className='text-[10px] text-muted-foreground uppercase'>
                Buy Box Win Rate (%)
              </label>
              <input
                type='number'
                min={5}
                max={99}
                value={inputs.buyBoxProbabilityPct}
                onChange={(e) => handleChange('buyBoxProbabilityPct', Math.min(99, Math.max(5, parseInt(e.target.value) || 20)))}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold'
              />
            </div>

            <div className='space-y-1'>
              <label className='text-[10px] text-muted-foreground uppercase'>
                Daily Spend (₹)
              </label>
              <input
                type='number'
                step={100}
                value={inputs.baselineDailySpend}
                onChange={(e) => handleChange('baselineDailySpend', Math.max(100, parseInt(e.target.value) || 0))}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold'
              />
            </div>

            <div className='space-y-1'>
              <label className='text-[10px] text-muted-foreground uppercase'>
                Gross Margin (%)
              </label>
              <input
                type='number'
                min={20}
                max={90}
                value={inputs.marginPct}
                onChange={(e) => handleChange('marginPct', parseInt(e.target.value) || 50)}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold'
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
