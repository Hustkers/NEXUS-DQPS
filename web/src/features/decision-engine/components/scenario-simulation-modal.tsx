'use client';

import React, { useState, useMemo } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  SCENARIO_METAS,
  BASELINE_DEFAULTS,
  SCENARIO_STRATEGIES,
  runDeterministicSimulation
} from '../lib/simulation-engine';
import { ScenarioInputPanel } from './scenario-input-panel';
import { StrategySelector } from './strategy-selector';
import { SimulationVisualizer, SimulationStage } from './simulation-visualizer';
import { SimulationFinancialImpact } from './simulation-financial-impact';
import { SimulationImpactChart } from './simulation-impact-chart';
import { SimulationLossCurve } from './simulation-loss-curve';
import { SimulationResultsMatrix } from './simulation-results-matrix';
import { SimulationStrategyComparison } from './simulation-strategy-comparison';
import { SimulationCausalChain } from './simulation-causal-chain';
import { SimulationDataLineage } from './simulation-data-lineage';
import type { ShockScenarioId, ScenarioInputParams, SimulationResult, DailyLossPoint } from '../types/simulation-types';

interface ScenarioSimulationModalProps {
  scenarioId: ShockScenarioId;
  isOpen: boolean;
  onClose: () => void;
  onResetBaseline?: () => void;
  onApplyMitigation?: (result: SimulationResult) => void;
}

export function ScenarioSimulationModal({
  scenarioId,
  isOpen,
  onClose,
  onResetBaseline,
  onApplyMitigation
}: ScenarioSimulationModalProps) {
  // Input parameters state initialized with deterministic baseline defaults
  const [inputs, setInputs] = useState<ScenarioInputParams>(() => BASELINE_DEFAULTS[scenarioId]);
  
  // Active strategy state (defaults to engine recommended)
  const strategies = useMemo(() => SCENARIO_STRATEGIES[scenarioId] || [], [scenarioId]);
  const defaultStrategy = useMemo(
    () => strategies.find((s) => s.isRecommended)?.id || strategies[0]?.id || 'do-nothing',
    [strategies]
  );
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(defaultStrategy);

  // Progressive execution lifecycle
  const [stage, setStage] = useState<SimulationStage>('ready');
  const [progressPct, setProgressPct] = useState<number>(0);
  const [simulatedDay, setSimulatedDay] = useState<number>(0);
  const [executedResult, setExecutedResult] = useState<SimulationResult | null>(null);

  const isSimulating = stage !== 'ready' && stage !== 'completed';

  // Deterministic simulation calculation
  const computedResult = useMemo<SimulationResult>(() => {
    return runDeterministicSimulation(scenarioId, inputs, selectedStrategyId);
  }, [scenarioId, inputs, selectedStrategyId]);

  const activeResult = executedResult || (stage === 'completed' ? computedResult : null);

  // Sync inputs whenever scenarioId changes
  const [prevScenarioId, setPrevScenarioId] = useState<ShockScenarioId>(scenarioId);
  if (scenarioId !== prevScenarioId) {
    setPrevScenarioId(scenarioId);
    setInputs(BASELINE_DEFAULTS[scenarioId]);
    const rec = SCENARIO_STRATEGIES[scenarioId]?.find((s) => s.isRecommended)?.id || SCENARIO_STRATEGIES[scenarioId]?.[0]?.id || 'do-nothing';
    setSelectedStrategyId(rec);
    setStage('ready');
    setExecutedResult(null);
    setProgressPct(0);
    setSimulatedDay(0);
  }

  // Keyboard accessibility
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSimulating) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isSimulating]);

  const scenarioMeta = SCENARIO_METAS[scenarioId];

  // Progressive deterministic simulation runner for modal
  const handleRunSimulation = () => {
    const horizon = inputs.horizonDays;
    setStage('initializing');
    setProgressPct(10);
    setSimulatedDay(0);

    // Stage 1: Baseline inspection (150ms)
    setTimeout(() => {
      setStage('baseline');
      setProgressPct(25);
      setSimulatedDay(1);
    }, 200);

    // Stage 2: Shock injection (500ms)
    setTimeout(() => {
      setStage('shock');
      setProgressPct(50);
      setSimulatedDay(Math.max(1, Math.round(horizon * 0.35)));
    }, 550);

    // Stage 3: DAG Propagation (950ms)
    setTimeout(() => {
      setStage('propagating');
      setProgressPct(75);
      setSimulatedDay(Math.max(2, Math.round(horizon * 0.7)));
    }, 950);

    // Stage 4: Autonomous Mitigation & Rebalancing (1300ms)
    setTimeout(() => {
      setStage('mitigating');
      setProgressPct(90);
      setSimulatedDay(horizon);
    }, 1300);

    // Stage 5: Finalized (1700ms)
    setTimeout(() => {
      setStage('completed');
      setProgressPct(100);
      setSimulatedDay(horizon);
      setExecutedResult(computedResult);
      toast.success(`Simulation Completed: ${computedResult.scenarioMeta.title}`, {
        description: `Applied ${computedResult.activeStrategyName}. Projected Loss Avoided: +₹${computedResult.financialImpact.lossAvoided.toLocaleString('en-IN')}.`
      });
    }, 1700);
  };

  const handleResetInputs = () => {
    setInputs(BASELINE_DEFAULTS[scenarioId]);
    setSelectedStrategyId(defaultStrategy);
    setStage('ready');
    setExecutedResult(null);
    setProgressPct(0);
    setSimulatedDay(0);
    onResetBaseline?.();
    toast.info('Restored Scenario Baseline', {
      description: 'Parameters reset to 90-day canonical baseline.'
    });
  };

  const handleApply = () => {
    if (!activeResult) return;
    onApplyMitigation?.(activeResult);
    toast.success(`Autonomous Mitigation Dispatched`, {
      description: `Target policy "${activeResult.activeStrategyName}" engaged for ${scenarioMeta.affectedProductName}.`
    });
    onClose();
  };

  // Sliced time-series up to current simulated day for live animation
  const simulatedTimeSeries: DailyLossPoint[] = useMemo(() => {
    const allSeries = computedResult.timeSeries;
    if (stage === 'ready') return [];
    if (stage === 'completed') return allSeries;
    const targetCount = Math.max(1, Math.min(allSeries.length, simulatedDay));
    return allSeries.slice(0, targetCount);
  }, [computedResult.timeSeries, stage, simulatedDay]);

  // Compute live telemetry stats depending on simulation stage
  const liveTelemetry = useMemo(() => {
    const base = computedResult.baseline;
    const shock = computedResult.shocked;
    const mit = computedResult.mitigated;

    if (scenarioId === 'stockout') {
      const invDisplay =
        stage === 'ready' || stage === 'baseline'
          ? `${inputs.inventoryUnits} units`
          : stage === 'shock'
          ? `${inputs.inventoryShockUnits} units (Depleted)`
          : stage === 'propagating'
          ? '0 units (Out of Stock)'
          : `${inputs.inventoryShockUnits} units (Protected)`;

      const spendDisplay =
        stage === 'ready' || stage === 'baseline'
          ? `₹${base.spend.toLocaleString('en-IN')}/day`
          : stage === 'shock' || stage === 'propagating'
          ? `₹${shock.spend.toLocaleString('en-IN')}/day (Burning)`
          : `₹${mit.spend.toLocaleString('en-IN')}/day (Controlled)`;

      const roasDisplay =
        stage === 'ready' || stage === 'baseline'
          ? `${base.roas.toFixed(2)}x`
          : stage === 'shock' || stage === 'propagating'
          ? `${shock.roas.toFixed(2)}x (Collapsed)`
          : `${mit.roas.toFixed(2)}x (Recovered)`;

      const protectedDisplay =
        stage === 'completed'
          ? `+₹${computedResult.financialImpact.lossAvoided.toLocaleString('en-IN')}`
          : stage === 'mitigating'
          ? `+₹${Math.round(computedResult.financialImpact.lossAvoided * 0.85).toLocaleString('en-IN')}`
          : '₹0';

      return {
        labelA: 'Physical Inventory',
        valueA: invDisplay,
        subA: 'Warehouse SKU: 315122-001',
        labelB: 'Daily Ad Spend',
        valueB: spendDisplay,
        subB: 'Meta Advantage+ Campaign',
        labelC: 'Effective ROAS',
        valueC: roasDisplay,
        subC: 'Conversion return on ad spend',
        labelD: 'Capital Protected',
        valueD: protectedDisplay,
        subD: 'Loss avoided vs unmitigated'
      };
    }

    if (scenarioId === 'cpm-spike') {
      const cpmDisplay =
        stage === 'ready' || stage === 'baseline'
          ? `₹${inputs.baselineCpm.toFixed(2)}`
          : `₹${(inputs.baselineCpm * inputs.cpmMultiplier).toFixed(2)} (+${Math.round((inputs.cpmMultiplier - 1) * 100)}%)`;

      const impDisplay =
        stage === 'ready' || stage === 'baseline'
          ? base.impressions.toLocaleString('en-IN')
          : stage === 'shock' || stage === 'propagating'
          ? `${shock.impressions.toLocaleString('en-IN')} (Compressed)`
          : mit.impressions.toLocaleString('en-IN');

      const roasDisplay =
        stage === 'ready' || stage === 'baseline'
          ? `${base.roas.toFixed(2)}x`
          : stage === 'shock'
          ? `${shock.roas.toFixed(2)}x (< Break-even)`
          : `${mit.roas.toFixed(2)}x (Rebalanced)`;

      const lossDisplay =
        stage === 'completed'
          ? `+₹${computedResult.financialImpact.lossAvoided.toLocaleString('en-IN')}`
          : '₹0';

      return {
        labelA: 'Auction CPM',
        valueA: cpmDisplay,
        subA: 'Meta footwear auction rate',
        labelB: 'Daily Impressions',
        valueB: impDisplay,
        subB: 'Ad views delivered',
        labelC: 'Operating ROAS',
        valueC: roasDisplay,
        subC: 'Threshold floor: 1.80x',
        labelD: 'Loss Avoided',
        valueD: lossDisplay,
        subD: 'Shifted to Amazon/Google'
      };
    }

    if (scenarioId === 'creative-fatigue') {
      const ctrDisplay =
        stage === 'ready' || stage === 'baseline'
          ? `${inputs.ctrPct.toFixed(2)}%`
          : stage === 'shock' || stage === 'propagating'
          ? `${(inputs.ctrPct * (1 - inputs.fatiguePct / 100)).toFixed(2)}% (-${inputs.fatiguePct}%)`
          : `${(inputs.ctrPct * 0.95).toFixed(2)}% (Refreshed)`;

      const convDisplay =
        stage === 'ready' || stage === 'baseline'
          ? `${base.conversions} orders`
          : stage === 'shock'
          ? `${shock.conversions} orders (Decayed)`
          : `${mit.conversions} orders (Restored)`;

      const roasDisplay =
        stage === 'ready' || stage === 'baseline'
          ? `${base.roas.toFixed(2)}x`
          : stage === 'shock'
          ? `${shock.roas.toFixed(2)}x`
          : `${mit.roas.toFixed(2)}x`;

      const lossDisplay =
        stage === 'completed'
          ? `+₹${computedResult.financialImpact.lossAvoided.toLocaleString('en-IN')}`
          : '₹0';

      return {
        labelA: 'Ad Set CTR',
        valueA: ctrDisplay,
        subA: 'TikTok UGC hook & click rate',
        labelB: 'Daily Orders',
        valueB: convDisplay,
        subB: 'Air Max 270 unit conversions',
        labelC: 'Channel ROAS',
        valueC: roasDisplay,
        subC: 'Post-fatigue recovery rate',
        labelD: 'Capital Protected',
        valueD: lossDisplay,
        subD: 'Rerouted to Meta Reels'
      };
    }

    // price-undercut
    const bbDisplay =
      stage === 'ready' || stage === 'baseline'
        ? `${inputs.buyBoxProbabilityPct}%`
        : stage === 'shock' || stage === 'propagating'
        ? '25% (Undercut by Rival)'
        : '68% (Rebalanced Direct)';

    const priceDisplay =
      stage === 'ready' || stage === 'baseline'
        ? `₹${inputs.ourPrice.toLocaleString('en-IN')}`
        : `₹${inputs.competitorPrice.toLocaleString('en-IN')} (-${inputs.competitorUndercutPct}%)`;

    const roasDisplay =
      stage === 'ready' || stage === 'baseline'
        ? `${base.roas.toFixed(2)}x`
        : stage === 'shock'
        ? `${shock.roas.toFixed(2)}x`
        : `${mit.roas.toFixed(2)}x`;

    const lossDisplay =
      stage === 'completed'
        ? `+₹${computedResult.financialImpact.lossAvoided.toLocaleString('en-IN')}`
        : '₹0';

    return {
      labelA: 'Buy Box Win Rate',
      valueA: bbDisplay,
      subA: 'Amazon buy box session share',
      labelB: 'Competitor Price',
      valueB: priceDisplay,
      subB: 'Rival merchant price shock',
      labelC: 'Blended ROAS',
      valueC: roasDisplay,
      subC: 'Scipy convex yield return',
      labelD: 'Protected Capital',
      valueD: lossDisplay,
      subD: 'Shifted to Nike Direct'
    };
  }, [scenarioId, stage, inputs, computedResult]);

  if (!isOpen) return null;

  return (
    <div
      role='presentation'
      className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-2 sm:p-4 md:p-6 backdrop-blur-md'
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSimulating) onClose();
      }}
    >
      <div
        role='dialog'
        aria-modal='true'
        aria-label={`Interactive Simulation Lab: ${scenarioMeta.title}`}
        className='my-auto flex w-full max-w-6xl flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6 text-foreground shadow-2xl'
      >
        {/* HEADER BAR */}
        <header className='flex flex-wrap items-start justify-between gap-3 border-b border-border/80 pb-3.5'>
          <div className='min-w-0 space-y-1'>
            <div className='flex items-center gap-2'>
              <span className='size-2 rounded-full bg-emerald-500' />
              <Badge
                variant='outline'
                className={cn(
                  'text-xs font-medium',
                  scenarioMeta.severity === 'CRITICAL' && 'border-rose-500/40 bg-rose-500/10 text-rose-500',
                  scenarioMeta.severity === 'HIGH' && 'border-amber-500/40 bg-amber-500/10 text-amber-500',
                  scenarioMeta.severity === 'MEDIUM' && 'border-sky-500/40 bg-sky-500/10 text-sky-500'
                )}
              >
                {scenarioMeta.severity}
              </Badge>
              <span className='text-xs text-muted-foreground'>
                {scenarioMeta.tag}
              </span>
            </div>
            <h2 className='text-lg sm:text-xl font-semibold tracking-tight text-foreground'>
              Scenario simulation — {scenarioMeta.title}
            </h2>
            <p className='text-xs text-muted-foreground max-w-3xl leading-relaxed'>
              {scenarioMeta.eventDescription}
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className='h-8 bg-primary text-primary-foreground text-xs font-medium'
            >
              <Icons.play className='mr-1.5 size-3.5 fill-current' />
              {stage === 'completed' ? 'Rerun' : 'Run simulation'}
            </Button>
            <Button
              size='sm'
              variant='outline'
              onClick={handleResetInputs}
              disabled={isSimulating}
              className='h-8 border-border bg-card px-2.5 text-xs text-muted-foreground hover:text-foreground'
            >
              <Icons.clock className='mr-1.5 size-3' />
              Reset
            </Button>
            <button
              onClick={onClose}
              disabled={isSimulating}
              aria-label='Close simulation modal'
              className='flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors'
            >
              <Icons.close className='size-4' />
            </button>
          </div>
        </header>

        {/* MAIN SPLIT WORKSPACE: INPUTS (5 cols) vs LIVE HUD & RESULTS (7 cols) */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-5'>
          {/* LEFT COLUMN: PARAMETER INPUTS & STRATEGIES */}
          <div className='lg:col-span-5 space-y-4'>
            <ScenarioInputPanel
              scenarioId={scenarioId}
              inputs={inputs}
              onChangeInputs={(newInputs) => {
                setInputs(newInputs);
                if (stage === 'completed') {
                  setStage('ready');
                  setExecutedResult(null);
                }
              }}
              onResetBaseline={handleResetInputs}
            />

            <StrategySelector
              strategies={strategies}
              selectedStrategyId={selectedStrategyId}
              onSelectStrategy={(newStratId) => {
                setSelectedStrategyId(newStratId);
                if (stage === 'completed') {
                  setStage('ready');
                  setExecutedResult(null);
                }
              }}
              inputs={inputs}
              onChangeInputs={(newInputs) => {
                setInputs(newInputs);
                if (stage === 'completed') {
                  setStage('ready');
                  setExecutedResult(null);
                }
              }}
            />

            {/* AUTONOMOUS DECISION RATIONALE CARD */}
            <div className='rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4 space-y-2 text-xs'>
              <div className='flex items-center gap-1.5 font-medium text-xs text-emerald-600 dark:text-emerald-400'>
                <Icons.shieldCheck className='size-3.5' />
                Why this response was chosen
              </div>
              <p className='text-muted-foreground leading-relaxed text-xs'>
                {computedResult.recommendation.reason}
              </p>
              <div className='flex items-center justify-between pt-2 border-t border-emerald-500/20 text-xs text-muted-foreground'>
                <span>Protected waste: <strong className='text-emerald-600 dark:text-emerald-400'>+₹{computedResult.financialImpact.lossAvoided.toLocaleString('en-IN')}</strong></span>
                <span>Target ROAS: <strong className='text-foreground'>{computedResult.mitigated.roas.toFixed(2)}x</strong></span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: RUNNABLE VISUALIZER & DYNAMICALLY REVEALED RESULTS */}
          <div className='lg:col-span-7 space-y-4'>
            {/* 1. RUNNABLE SIMULATION HUD */}
            <SimulationVisualizer
              scenarioId={scenarioId}
              stage={stage}
              progressPct={progressPct}
              simulatedDay={simulatedDay}
              totalDays={inputs.horizonDays}
              timeSeriesSoFar={simulatedTimeSeries}
              currentTelemetry={liveTelemetry}
              onRun={handleRunSimulation}
              onReset={handleResetInputs}
              result={computedResult}
            />

            {/* 2. DYNAMIC RESULTS: Populated only after simulation runs */}
            {activeResult && (
              <div className='space-y-4 animate-in fade-in-50 duration-500'>
                {/* FINANCIAL HERO MATRIX */}
                <SimulationFinancialImpact result={activeResult} />

                {/* RECHARTS COMPARISON & CUMULATIVE LOSS CURVES */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <SimulationImpactChart result={activeResult} />
                  <SimulationLossCurve result={activeResult} />
                </div>

                {/* FULL METRIC BREAKDOWN TABLE */}
                <SimulationResultsMatrix result={activeResult} />

                {/* STRATEGY COMPARISON MATRIX TABLE */}
                <SimulationStrategyComparison
                  result={activeResult}
                  onSelectStrategy={setSelectedStrategyId}
                />

                {/* STEP-BY-STEP CAUSAL PROPAGATION DIAGRAM */}
                <SimulationCausalChain nodes={activeResult.causalChain} />

                {/* DATA LINEAGE & FORMULA AUDIT TRACE */}
                <SimulationDataLineage lineage={activeResult.dataLineage} />
              </div>
            )}
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <footer className='flex flex-wrap items-center justify-between gap-3 border-t border-border/80 pt-4'>
          <div className='text-xs text-muted-foreground'>
            Calculations are grounded in real-time engine state.
          </div>
          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              variant='outline'
              onClick={onClose}
              className='h-8 px-3 text-xs'
            >
              Close
            </Button>
            <Button
              size='sm'
              onClick={handleApply}
              className='h-8 px-4 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white'
            >
              <Icons.check className='mr-1.5 size-3.5' />
              Apply mitigation to dashboard
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
