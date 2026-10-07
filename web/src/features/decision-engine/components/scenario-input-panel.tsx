'use client';

import React from 'react';
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
  variant: _variant = 'default',
  scenarioName,
  eventDescription
}: ScenarioInputPanelProps) {
  const handleChange = <K extends keyof ScenarioInputParams>(key: K, value: ScenarioInputParams[K]) => {
    onChangeInputs({
      ...inputs,
      [key]: value
    });
  };

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
