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
  variant?: 'default' | 'minimal';
  scenarioName?: string;
  eventDescription?: string;
}

export function ScenarioInputPanel({
  scenarioId,
  inputs,
  onChangeInputs,
  onResetBaseline,
  className,
  variant = 'default',
  scenarioName,
  eventDescription
}: ScenarioInputPanelProps) {
  const handleChange = <K extends keyof ScenarioInputParams>(key: K, value: ScenarioInputParams[K]) => {
    onChangeInputs({
      ...inputs,
      [key]: value
    });
  };

  if (variant === 'minimal') {
    return (
      <div className={cn('rounded-xl border border-border bg-card p-6 shadow-xs space-y-6', className)}>
        {/* Header: Crisis Target Overview merged with Reset link */}
        <div className='space-y-1.5 border-b border-border/60 pb-4'>
          <div className='flex items-center justify-between gap-2'>
            <h3 className='text-sm font-semibold text-foreground'>
              {scenarioName || (scenarioId === 'stockout'
                ? 'Critical stockout'
                : scenarioId === 'cpm-spike'
                ? 'CPM auction surge'
                : scenarioId === 'creative-fatigue'
                ? 'Creative fatigue'
                : 'Competitor price war')}
            </h3>
            <button
              type='button'
              onClick={onResetBaseline}
              className='text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded'
            >
              Reset
            </button>
          </div>
          {eventDescription && (
            <p className='text-sm text-muted-foreground leading-relaxed'>
              {eventDescription}
            </p>
          )}
          <p className='text-xs text-muted-foreground'>
            {scenarioId === 'stockout' && "Affected product: Nike Air Force 1 '07 (SKU: 315122-001)"}
            {scenarioId === 'cpm-spike' && 'Affected channel: Meta Advantage+ sneaker placements (AO2924-401)'}
            {scenarioId === 'creative-fatigue' && 'Affected channel: TikTok UGC creator hook set (AH8050-100)'}
            {scenarioId === 'price-undercut' && 'Affected channel: Amazon Buy Box listing (SKU: 880848-005)'}
          </p>
        </div>

        {/* Simulation Horizon Toggle */}
        <div className='space-y-2'>
          <span className='text-xs font-medium text-foreground block'>
            Simulation horizon
          </span>
          <div className='grid grid-cols-3 gap-2'>
            {([1, 7, 30] as SimulationHorizon[]).map((h) => (
              <button
                key={h}
                type='button'
                onClick={() => handleChange('horizonDays', h)}
                className={cn(
                  'py-2 px-3 rounded-lg border text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                  inputs.horizonDays === h
                    ? 'border-foreground bg-foreground text-background font-semibold shadow-xs'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40'
                )}
              >
                {h === 1 ? '1 day' : `${h} days`}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Inputs Specific to Active Scenario */}
        <div className='space-y-4'>
          {scenarioId === 'stockout' && (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <span className='text-sm font-medium text-foreground block'>
                  Shocked inventory (units)
                </span>
                <input
                  type='number'
                  min={0}
                  max={500}
                  value={inputs.inventoryShockUnits}
                  onChange={(e) => handleChange('inventoryShockUnits', Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'
                />
                <p className='text-xs text-muted-foreground'>
                  Remaining warehouse units after supply disruption.
                </p>
              </div>

              <div className='space-y-1.5'>
                <span className='text-sm font-medium text-foreground block'>
                  Daily ad spend (₹)
                </span>
                <input
                  type='number'
                  min={100}
                  step={100}
                  value={inputs.baselineDailySpend}
                  onChange={(e) => handleChange('baselineDailySpend', Math.max(100, parseInt(e.target.value, 10) || 0))}
                  className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'
                />
                <p className='text-xs text-muted-foreground'>
                  Daily budget dedicated to this product campaign.
                </p>
              </div>
            </div>
          )}

          {scenarioId === 'cpm-spike' && (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <span className='text-sm font-medium text-foreground block'>
                  CPM multiplier
                </span>
                <input
                  type='number'
                  step={0.1}
                  min={1.0}
                  max={3.5}
                  value={inputs.cpmMultiplier}
                  onChange={(e) => handleChange('cpmMultiplier', Math.max(1.0, parseFloat(e.target.value) || 1.0))}
                  className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'
                />
                <p className='text-xs text-muted-foreground'>
                  Cost surge multiplier (e.g. 2.5× above baseline).
                </p>
              </div>

              <div className='space-y-1.5'>
                <span className='text-sm font-medium text-foreground block'>
                  Daily ad spend (₹)
                </span>
                <input
                  type='number'
                  min={100}
                  step={100}
                  value={inputs.baselineDailySpend}
                  onChange={(e) => handleChange('baselineDailySpend', Math.max(100, parseInt(e.target.value, 10) || 0))}
                  className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'
                />
                <p className='text-xs text-muted-foreground'>
                  Daily budget exposed to auction competition.
                </p>
              </div>
            </div>
          )}

          {scenarioId === 'creative-fatigue' && (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <span className='text-sm font-medium text-foreground block'>
                  Click-through decay (%)
                </span>
                <input
                  type='number'
                  min={5}
                  max={90}
                  value={inputs.fatiguePct}
                  onChange={(e) => handleChange('fatiguePct', Math.min(90, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                  className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'
                />
                <p className='text-xs text-muted-foreground'>
                  Expected drop in CTR from audience ad wearout.
                </p>
              </div>

              <div className='space-y-1.5'>
                <span className='text-sm font-medium text-foreground block'>
                  Daily ad spend (₹)
                </span>
                <input
                  type='number'
                  min={100}
                  step={100}
                  value={inputs.baselineDailySpend}
                  onChange={(e) => handleChange('baselineDailySpend', Math.max(100, parseInt(e.target.value, 10) || 0))}
                  className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'
                />
                <p className='text-xs text-muted-foreground'>
                  Daily budget spent on fatigued creative sets.
                </p>
              </div>
            </div>
          )}

          {scenarioId === 'price-undercut' && (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <span className='text-sm font-medium text-foreground block'>
                  Competitor undercut (%)
                </span>
                <input
                  type='number'
                  min={5}
                  max={75}
                  value={inputs.competitorUndercutPct}
                  onChange={(e) => handleChange('competitorUndercutPct', Math.min(75, Math.max(5, parseInt(e.target.value, 10) || 5)))}
                  className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'
                />
                <p className='text-xs text-muted-foreground'>
                  Rival price discount below official listing price.
                </p>
              </div>

              <div className='space-y-1.5'>
                <span className='text-sm font-medium text-foreground block'>
                  Daily ad spend (₹)
                </span>
                <input
                  type='number'
                  min={100}
                  step={100}
                  value={inputs.baselineDailySpend}
                  onChange={(e) => handleChange('baselineDailySpend', Math.max(100, parseInt(e.target.value, 10) || 0))}
                  className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'
                />
                <p className='text-xs text-muted-foreground'>
                  Daily budget exposed to lost Buy Box conversions.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Collapsed Advanced Assumptions Disclosure */}
        <details className='group pt-2 border-t border-border/60'>
          <summary className='cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground flex items-center justify-between select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded py-1'>
            <span>Advanced assumptions</span>
            <span className='text-xs text-muted-foreground group-open:rotate-180 transition-transform'>
              ↓
            </span>
          </summary>
          <div className='pt-3 space-y-3'>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              <div className='space-y-1'>
                <span className='text-xs text-muted-foreground block'>
                  Conversion rate (%)
                </span>
                <input
                  type='number'
                  step={0.1}
                  value={inputs.baselineCvrPct}
                  onChange={(e) => handleChange('baselineCvrPct', parseFloat(e.target.value) || 0.1)}
                  className='w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'
                />
              </div>

              <div className='space-y-1'>
                <span className='text-xs text-muted-foreground block'>
                  Average order value (₹)
                </span>
                <input
                  type='number'
                  step={50}
                  value={inputs.aov}
                  onChange={(e) => handleChange('aov', parseInt(e.target.value, 10) || 1000)}
                  className='w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'
                />
              </div>

              <div className='space-y-1'>
                <span className='text-xs text-muted-foreground block'>
                  Gross margin (%)
                </span>
                <input
                  type='number'
                  min={10}
                  max={90}
                  value={inputs.marginPct}
                  onChange={(e) => handleChange('marginPct', parseInt(e.target.value, 10) || 50)}
                  className='w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'
                />
              </div>
            </div>

            {scenarioId === 'cpm-spike' && (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1'>
                <div className='space-y-1'>
                  <span className='text-xs text-muted-foreground block'>
                    Baseline CPM (₹)
                  </span>
                  <input
                    type='number'
                    step={0.5}
                    value={inputs.baselineCpm}
                    onChange={(e) => handleChange('baselineCpm', parseFloat(e.target.value) || 1)}
                    className='w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground'
                  />
                </div>
                <div className='space-y-1'>
                  <span className='text-xs text-muted-foreground block'>
                    Baseline CTR (%)
                  </span>
                  <input
                    type='number'
                    step={0.1}
                    value={inputs.ctrPct}
                    onChange={(e) => handleChange('ctrPct', parseFloat(e.target.value) || 0.1)}
                    className='w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground'
                  />
                </div>
              </div>
            )}

            {scenarioId === 'price-undercut' && (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1'>
                <div className='space-y-1'>
                  <span className='text-xs text-muted-foreground block'>
                    Our price (₹)
                  </span>
                  <input
                    type='number'
                    step={100}
                    value={inputs.ourPrice}
                    onChange={(e) => handleChange('ourPrice', parseInt(e.target.value, 10) || 1000)}
                    className='w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground'
                  />
                </div>
                <div className='space-y-1'>
                  <span className='text-xs text-muted-foreground block'>
                    Buy Box win rate (%)
                  </span>
                  <input
                    type='number'
                    min={5}
                    max={99}
                    value={inputs.buyBoxProbabilityPct}
                    onChange={(e) => handleChange('buyBoxProbabilityPct', Math.min(99, Math.max(5, parseInt(e.target.value, 10) || 20)))}
                    className='w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground'
                  />
                </div>
              </div>
            )}
          </div>
        </details>
      </div>
    );
  }

  // DEFAULT VARIANT (Preserved exactly for scenario-simulation-modal.tsx)
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
        <span className='text-[10px] text-muted-foreground uppercase font-bold tracking-wider'>
          Simulation Horizon
        </span>
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
              <span className='text-[10px] text-muted-foreground uppercase'>
                Shocked Inventory (Units)
              </span>
              <input
                type='number'
                min={0}
                max={500}
                value={inputs.inventoryShockUnits}
                onChange={(e) => handleChange('inventoryShockUnits', Math.max(0, parseInt(e.target.value, 10) || 0))}
                className='w-full rounded-md border border-rose-500/40 bg-card px-2.5 py-1.5 text-xs text-foreground font-bold focus:outline-none focus:ring-1 focus:ring-rose-500'
              />
              <span className='text-[9px] text-rose-500 font-semibold'>0 units = Total stockout</span>
            </div>

            <div className='space-y-1'>
              <span className='text-[10px] text-muted-foreground uppercase'>
                Baseline Daily Spend (₹)
              </span>
              <input
                type='number'
                min={500}
                step={100}
                value={inputs.baselineDailySpend}
                onChange={(e) => handleChange('baselineDailySpend', Math.max(100, parseInt(e.target.value, 10) || 0))}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary'
              />
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            <div className='space-y-1'>
              <span className='text-[10px] text-muted-foreground uppercase'>
                Baseline CVR (%)
              </span>
              <input
                type='number'
                step={0.1}
                value={inputs.baselineCvrPct}
                onChange={(e) => handleChange('baselineCvrPct', parseFloat(e.target.value) || 0.1)}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold'
              />
            </div>

            <div className='space-y-1'>
              <span className='text-[10px] text-muted-foreground uppercase'>
                AOV (₹)
              </span>
              <input
                type='number'
                step={50}
                value={inputs.aov}
                onChange={(e) => handleChange('aov', parseInt(e.target.value, 10) || 1000)}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold'
              />
            </div>

            <div className='space-y-1'>
              <span className='text-[10px] text-muted-foreground uppercase'>
                Gross Margin (%)
              </span>
              <input
                type='number'
                min={10}
                max={90}
                value={inputs.marginPct}
                onChange={(e) => handleChange('marginPct', parseInt(e.target.value, 10) || 50)}
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
              <span className='text-[10px] text-muted-foreground uppercase'>
                Baseline CPM (₹)
              </span>
              <input
                type='number'
                step={0.5}
                value={inputs.baselineCpm}
                onChange={(e) => handleChange('baselineCpm', parseFloat(e.target.value) || 1)}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold'
              />
            </div>

            <div className='space-y-1'>
              <span className='text-[10px] text-muted-foreground uppercase'>
                CPM Multiplier ({Math.round(inputs.cpmMultiplier * 100)}% of base)
              </span>
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
              <span className='text-[10px] text-muted-foreground uppercase'>
                Meta Daily Spend (₹)
              </span>
              <input
                type='number'
                step={100}
                value={inputs.baselineDailySpend}
                onChange={(e) => handleChange('baselineDailySpend', Math.max(100, parseInt(e.target.value, 10) || 0))}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold'
              />
            </div>

            <div className='space-y-1'>
              <span className='text-[10px] text-muted-foreground uppercase'>
                CTR (%)
              </span>
              <input
                type='number'
                step={0.1}
                value={inputs.ctrPct}
                onChange={(e) => handleChange('ctrPct', parseFloat(e.target.value) || 0.1)}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold'
              />
            </div>

            <div className='space-y-1'>
              <span className='text-[10px] text-muted-foreground uppercase'>
                CVR (%)
              </span>
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
              <span className='text-[10px] text-muted-foreground uppercase'>
                Baseline CTR (%)
              </span>
              <input
                type='number'
                step={0.1}
                value={inputs.ctrPct}
                onChange={(e) => handleChange('ctrPct', parseFloat(e.target.value) || 0.1)}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold'
              />
            </div>

            <div className='space-y-1'>
              <span className='text-[10px] text-muted-foreground uppercase'>
                Fatigue Decay (%)
              </span>
              <input
                type='number'
                min={10}
                max={90}
                value={inputs.fatiguePct}
                onChange={(e) => handleChange('fatiguePct', Math.min(90, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                className='w-full rounded-md border border-sky-500/40 bg-card px-2.5 py-1.5 text-xs text-foreground font-bold focus:ring-1 focus:ring-sky-500'
              />
              <span className='text-[9px] text-sky-600 dark:text-sky-400 font-semibold'>
                Shocked CTR: {(inputs.ctrPct * (1 - inputs.fatiguePct / 100)).toFixed(2)}%
              </span>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div className='space-y-1'>
              <span className='text-[10px] text-muted-foreground uppercase'>
                Daily Spend (₹)
              </span>
              <input
                type='number'
                step={100}
                value={inputs.baselineDailySpend}
                onChange={(e) => handleChange('baselineDailySpend', Math.max(100, parseInt(e.target.value, 10) || 0))}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold'
              />
            </div>

            <div className='space-y-1'>
              <span className='text-[10px] text-muted-foreground uppercase'>
                AOV (₹)
              </span>
              <input
                type='number'
                step={100}
                value={inputs.aov}
                onChange={(e) => handleChange('aov', parseInt(e.target.value, 10) || 1000)}
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
              <span className='text-[10px] text-muted-foreground uppercase'>
                Official Nike Price (₹)
              </span>
              <input
                type='number'
                step={100}
                value={inputs.ourPrice}
                onChange={(e) => handleChange('ourPrice', parseInt(e.target.value, 10) || 1000)}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold'
              />
            </div>

            <div className='space-y-1'>
              <span className='text-[10px] text-muted-foreground uppercase'>
                Competitor Price (₹)
              </span>
              <input
                type='number'
                step={100}
                value={inputs.competitorPrice}
                onChange={(e) => handleChange('competitorPrice', parseInt(e.target.value, 10) || 1000)}
                className='w-full rounded-md border border-amber-500/40 bg-card px-2.5 py-1.5 text-xs text-foreground font-bold focus:ring-1 focus:ring-amber-500'
              />
              <span className='text-[9px] text-amber-600 dark:text-amber-400 font-semibold'>
                Undercut: {Math.round(((inputs.ourPrice - inputs.competitorPrice) / inputs.ourPrice) * 100)}% discount
              </span>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            <div className='space-y-1'>
              <span className='text-[10px] text-muted-foreground uppercase'>
                Buy Box Win Rate (%)
              </span>
              <input
                type='number'
                min={5}
                max={99}
                value={inputs.buyBoxProbabilityPct}
                onChange={(e) => handleChange('buyBoxProbabilityPct', Math.min(99, Math.max(5, parseInt(e.target.value, 10) || 20)))}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold'
              />
            </div>

            <div className='space-y-1'>
              <span className='text-[10px] text-muted-foreground uppercase'>
                Daily Spend (₹)
              </span>
              <input
                type='number'
                step={100}
                value={inputs.baselineDailySpend}
                onChange={(e) => handleChange('baselineDailySpend', Math.max(100, parseInt(e.target.value, 10) || 0))}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold'
              />
            </div>

            <div className='space-y-1'>
              <span className='text-[10px] text-muted-foreground uppercase'>
                Gross Margin (%)
              </span>
              <input
                type='number'
                min={20}
                max={90}
                value={inputs.marginPct}
                onChange={(e) => handleChange('marginPct', parseInt(e.target.value, 10) || 50)}
                className='w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-semibold'
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
