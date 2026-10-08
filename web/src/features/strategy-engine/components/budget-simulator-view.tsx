'use client';

import React, { useState } from 'react';
import { CampaignStrategy } from '@/lib/strategy-engine/types';
import {
  simulateBudgetDiminishingReturns,
  runWhatIfScenario
} from '@/lib/strategy-engine/prediction-engine';
import { Button } from '@/components/ui/button';
import {
  IconCalculator,
  IconChartBar,
  IconSparkles,
  IconAlertTriangle,
  IconTrendingUp,
  IconTrendingDown,
  IconRefresh
} from '@tabler/icons-react';

interface BudgetSimulatorViewProps {
  strategies: CampaignStrategy[];
}

export function BudgetSimulatorView({ strategies }: BudgetSimulatorViewProps) {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(
    strategies[0]?.strategyId || 'STR-001'
  );

  const currentStrategy =
    strategies.find((s) => s.strategyId === selectedStrategyId) || strategies[0];
  const ev = currentStrategy?.evaluation;
  const baseBudget = currentStrategy?.budgetAllocation || 50000;
  const baseRoas = ev?.expectedRoas || 3.5;
  const baseCpa = ev?.expectedCpa || 38.00;
  const baseCtr = ev?.expectedCtr || 0.035;
  const baseCpc = ev?.expectedCpc || 2.15;

  // Diminishing returns state
  const [simulatedBudget, setSimulatedBudget] = useState<number>(baseBudget);

  // What-If perturbation state
  const [budgetShift, setBudgetShift] = useState<number>(0); // %
  const [cpcShift, setCpcShift] = useState<number>(0); // %
  const [cvrShift, setCvrShift] = useState<number>(0); // %
  const [wearoutDays, setWearoutDays] = useState<number>(0); // days

  const diminishingResult = simulateBudgetDiminishingReturns(
    baseBudget,
    simulatedBudget,
    baseRoas,
    baseCpa
  );

  const whatIfResult = runWhatIfScenario({
    baseBudget,
    baseRoas,
    baseCpa,
    baseCtr,
    baseCpc,
    budgetShiftPct: budgetShift,
    cpcShiftPct: cpcShift,
    cvrShiftPct: cvrShift,
    wearoutDays
  });

  const handleResetWhatIf = () => {
    setBudgetShift(0);
    setCpcShift(0);
    setCvrShift(0);
    setWearoutDays(0);
  };

  return (
    <div className='space-y-6 font-mono'>
      {/* Header & Strategy Selector */}
      <div className='flex items-center justify-between border-b border-border/80 pb-3 flex-wrap gap-2'>
        <div className='flex items-center gap-2.5'>
          <div className='p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30'>
            <IconCalculator className='size-5' />
          </div>
          <div>
            <h2 className='text-base font-bold text-foreground'>
              Budget Diminishing Returns & What-If Sandbox
            </h2>
            <p className='text-xs text-muted-foreground'>
              Econometric Response Modeling • Non-Linear Elasticity Curve • Real-Time Auction Stress-Testing
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-xs text-muted-foreground'>Test Strategy:</span>
          <select
            value={selectedStrategyId}
            onChange={(e) => {
              setSelectedStrategyId(e.target.value);
              const strat = strategies.find((s) => s.strategyId === e.target.value);
              if (strat) setSimulatedBudget(strat.budgetAllocation);
            }}
            className='h-8 text-xs font-mono rounded-md border border-border bg-card px-2 text-foreground'
          >
            {strategies.map((s) => (
              <option key={s.strategyId} value={s.strategyId}>
                {s.strategyId} • {s.strategyName.split('—')[0]} ({s.platform.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. NON-LINEAR DIMINISHING RETURNS SIMULATOR */}
      <div className='rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm'>
        <div className='flex items-center justify-between flex-wrap gap-2'>
          <div>
            <h3 className='text-sm font-bold text-foreground uppercase tracking-tight flex items-center gap-2'>
              <IconChartBar className='size-4 text-cyan-400' />
              Diminishing Returns Response Curve (Elasticity: 0.79)
            </h3>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Simulates marginal return deterioration as ad spend scales into saturated auction pools.
            </p>
          </div>

          <span className={`text-xs px-2.5 py-1 rounded border font-bold ${
            diminishingResult.isDiminishingZone
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}>
            {diminishingResult.isDiminishingZone ? 'Diminishing Efficiency Zone' : 'Optimal Efficiency Zone'}
          </span>
        </div>

        {/* Interactive Slider */}
        <div className='space-y-2 pt-2'>
          <div className='flex justify-between text-xs'>
            <span className='text-muted-foreground'>Simulated Spend:</span>
            <span className='text-base font-bold text-cyan-400'>
              ${simulatedBudget.toLocaleString()}
            </span>
          </div>

          <div className='px-1.5 py-1 rounded-full bg-zinc-950/80 border border-zinc-800/80 shadow-inner flex items-center'>
            <input
              type='range'
              min={10000}
              max={250000}
              step={5000}
              value={simulatedBudget}
              onChange={(e) => setSimulatedBudget(Number(e.target.value))}
              className='w-full accent-cyan-500 cursor-pointer h-2 bg-zinc-800 rounded-lg'
            />
          </div>

          <div className='flex justify-between text-[10px] text-muted-foreground'>
            <span>$10,000 (Conservative)</span>
            <span>Baseline: ${baseBudget.toLocaleString()}</span>
            <span>$250,000 (Extreme Scale)</span>
          </div>
        </div>

        {/* Diminishing Return Projections */}
        <div className='grid grid-cols-2 md:grid-cols-5 gap-3 pt-2'>
          <div className='p-3 rounded-xl border border-border/60 bg-muted/10'>
            <span className='text-[10px] text-muted-foreground uppercase block'>Projected Revenue</span>
            <span className='text-lg font-bold text-foreground block mt-1'>
              ${diminishingResult.revenue.toLocaleString()}
            </span>
          </div>

          <div className='p-3 rounded-xl border border-border/60 bg-muted/10'>
            <span className='text-[10px] text-muted-foreground uppercase block'>Simulated ROAS</span>
            <span className={`text-lg font-bold block mt-1 ${
              diminishingResult.roas >= 3.0 ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {diminishingResult.roas.toFixed(2)}x
            </span>
            <span className='text-[10px] text-muted-foreground block mt-0.5'>
              Base: {baseRoas.toFixed(2)}x
            </span>
          </div>

          <div className='p-3 rounded-xl border border-border/60 bg-muted/10'>
            <span className='text-[10px] text-muted-foreground uppercase block'>Estimated Orders</span>
            <span className='text-lg font-bold text-foreground block mt-1'>
              {diminishingResult.conversions} units
            </span>
          </div>

          <div className='p-3 rounded-xl border border-border/60 bg-muted/10'>
            <span className='text-[10px] text-muted-foreground uppercase block'>Marginal CPA</span>
            <span className='text-lg font-bold text-foreground block mt-1'>
              ${diminishingResult.cpa.toLocaleString()}
            </span>
            <span className='text-[10px] text-muted-foreground block mt-0.5'>
              Base: ${baseCpa.toLocaleString()}
            </span>
          </div>

          <div className='p-3 rounded-xl border border-border/60 bg-muted/10'>
            <span className='text-[10px] text-muted-foreground uppercase block'>Efficiency Index</span>
            <span className='text-lg font-bold text-cyan-400 block mt-1'>
              {diminishingResult.efficiencyIndex}%
            </span>
            <span className='text-[10px] text-muted-foreground block mt-0.5'>Of peak efficiency</span>
          </div>
        </div>

        {diminishingResult.isDiminishingZone && (
          <div className='rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-start gap-2'>
            <IconAlertTriangle className='size-4 text-amber-400 shrink-0 mt-0.5' />
            <span>
              Diminishing Returns Detected: Pushing spend past ${Math.round(baseBudget * 1.8).toLocaleString()} inflates CPA by +{Math.round(((diminishingResult.cpa - baseCpa) / baseCpa) * 100)}% because top metro high-intent search pools become exhausted. Recommendation: Diversify overflow budget into Amazon Sponsored Ads or Meta remarketing.
            </span>
          </div>
        )}
      </div>

      {/* 2. WHAT-IF SCENARIO SANDBOX */}
      <div className='rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm'>
        <div className='flex items-center justify-between flex-wrap gap-2'>
          <div>
            <h3 className='text-sm font-bold text-foreground uppercase tracking-tight flex items-center gap-2'>
              <IconSparkles className='size-4 text-amber-400' />
              What-If Market Perturbation Sandbox
            </h3>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Stress-test campaign resilience against auction CPC surges, conversion drops, and creative decay.
            </p>
          </div>

          <Button
            variant='outline'
            size='sm'
            onClick={handleResetWhatIf}
            className='h-7 text-xs font-mono'
          >
            <IconRefresh className='size-3 mr-1' /> Reset Sliders
          </Button>
        </div>

        {/* 4 Interactive Sliders */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-1'>
          <div className='p-3 rounded-xl border border-border/60 bg-muted/10 space-y-2'>
            <div className='flex justify-between text-xs'>
              <span className='text-muted-foreground'>Budget Perturbation:</span>
              <span className='font-bold text-foreground'>{budgetShift > 0 ? `+${budgetShift}%` : `${budgetShift}%`}</span>
            </div>
            <div className='px-1.5 py-1 rounded-full bg-zinc-950/80 border border-zinc-800/80 shadow-inner flex items-center'>
              <input
                type='range'
                min={-50}
                max={100}
                step={5}
                value={budgetShift}
                onChange={(e) => setBudgetShift(Number(e.target.value))}
                className='w-full accent-cyan-500 cursor-pointer h-2 bg-zinc-800 rounded-lg'
              />
            </div>
          </div>

          <div className='p-3 rounded-xl border border-border/60 bg-muted/10 space-y-2'>
            <div className='flex justify-between text-xs'>
              <span className='text-muted-foreground'>Auction CPC Inflation:</span>
              <span className='font-bold text-foreground'>{cpcShift > 0 ? `+${cpcShift}%` : `${cpcShift}%`}</span>
            </div>
            <div className='px-1.5 py-1 rounded-full bg-zinc-950/80 border border-zinc-800/80 shadow-inner flex items-center'>
              <input
                type='range'
                min={-30}
                max={50}
                step={5}
                value={cpcShift}
                onChange={(e) => setCpcShift(Number(e.target.value))}
                className='w-full accent-amber-500 cursor-pointer h-2 bg-zinc-800 rounded-lg'
              />
            </div>
          </div>

          <div className='p-3 rounded-xl border border-border/60 bg-muted/10 space-y-2'>
            <div className='flex justify-between text-xs'>
              <span className='text-muted-foreground'>Conversion Rate (CVR) Shift:</span>
              <span className='font-bold text-foreground'>{cvrShift > 0 ? `+${cvrShift}%` : `${cvrShift}%`}</span>
            </div>
            <div className='px-1.5 py-1 rounded-full bg-zinc-950/80 border border-zinc-800/80 shadow-inner flex items-center'>
              <input
                type='range'
                min={-40}
                max={40}
                step={5}
                value={cvrShift}
                onChange={(e) => setCvrShift(Number(e.target.value))}
                className='w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-800 rounded-lg'
              />
            </div>
          </div>

          <div className='p-3 rounded-xl border border-border/60 bg-muted/10 space-y-2'>
            <div className='flex justify-between text-xs'>
              <span className='text-muted-foreground'>Creative Wearout / Ad Age:</span>
              <span className='font-bold text-foreground'>{wearoutDays} Days Elapsed</span>
            </div>
            <div className='px-1.5 py-1 rounded-full bg-zinc-950/80 border border-zinc-800/80 shadow-inner flex items-center'>
              <input
                type='range'
                min={0}
                max={35}
                step={1}
                value={wearoutDays}
                onChange={(e) => setWearoutDays(Number(e.target.value))}
                className='w-full accent-purple-500 cursor-pointer h-2 bg-zinc-800 rounded-lg'
              />
            </div>
          </div>
        </div>

        {/* Delta Comparison Results */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3 pt-2'>
          <div className='p-3.5 rounded-xl border border-border/60 bg-muted/20'>
            <span className='text-[10px] text-muted-foreground uppercase block'>Adjusted ROAS</span>
            <div className='flex items-baseline gap-2 mt-1'>
              <span className='text-xl font-bold text-foreground'>
                {whatIfResult.adjustedRoas.toFixed(2)}x
              </span>
              <span className={`text-xs font-bold ${
                whatIfResult.roasDeltaPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {whatIfResult.roasDeltaPct > 0 ? `+${whatIfResult.roasDeltaPct}%` : `${whatIfResult.roasDeltaPct}%`}
              </span>
            </div>
          </div>

          <div className='p-3.5 rounded-xl border border-border/60 bg-muted/20'>
            <span className='text-[10px] text-muted-foreground uppercase block'>Adjusted CPA</span>
            <div className='flex items-baseline gap-2 mt-1'>
              <span className='text-xl font-bold text-foreground'>
                ${whatIfResult.adjustedCpa.toLocaleString()}
              </span>
              <span className={`text-xs font-bold ${
                whatIfResult.cpaDeltaPct <= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {whatIfResult.cpaDeltaPct > 0 ? `+${whatIfResult.cpaDeltaPct}%` : `${whatIfResult.cpaDeltaPct}%`}
              </span>
            </div>
          </div>

          <div className='p-3.5 rounded-xl border border-border/60 bg-muted/20'>
            <span className='text-[10px] text-muted-foreground uppercase block'>Adjusted Revenue</span>
            <span className='text-xl font-bold text-foreground block mt-1'>
              ${whatIfResult.adjustedRevenue.toLocaleString()}
            </span>
          </div>

          <div className='p-3.5 rounded-xl border border-border/60 bg-muted/20'>
            <span className='text-[10px] text-muted-foreground uppercase block'>Adjusted Orders</span>
            <span className='text-xl font-bold text-foreground block mt-1'>
              {whatIfResult.adjustedConversions} units
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
