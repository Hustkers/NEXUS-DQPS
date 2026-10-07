'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  SCENARIO_METAS,
  BASELINE_DEFAULTS,
  SCENARIO_STRATEGIES,
  runDeterministicSimulation
} from '@/features/decision-engine/lib/simulation-engine';
import { ScenarioInputPanel } from '@/features/decision-engine/components/scenario-input-panel';
import { StrategySelector } from '@/features/decision-engine/components/strategy-selector';
import { SimulationVisualizer, SimulationStage } from '@/features/decision-engine/components/simulation-visualizer';
import { SimulationResultsMatrix } from '@/features/decision-engine/components/simulation-results-matrix';
import { SimulationFinancialImpact } from '@/features/decision-engine/components/simulation-financial-impact';
import { SimulationStrategyComparison } from '@/features/decision-engine/components/simulation-strategy-comparison';
import { SimulationCausalChain } from '@/features/decision-engine/components/simulation-causal-chain';
import { SimulationDataLineage } from '@/features/decision-engine/components/simulation-data-lineage';
import { SimulationImpactChart } from '@/features/decision-engine/components/simulation-impact-chart';
import type { ShockScenarioId, ScenarioInputParams, SimulationResult, DailyLossPoint } from '@/features/decision-engine/types/simulation-types';

interface SavedRun {
  id: string;
  timestamp: string;
  scenarioTitle: string;
  strategyName: string;
  lossAvoided: number;
  roas: number;
}

function SimulationLabContent() {
  const searchParams = useSearchParams();
  const scenarioParam = searchParams.get('scenario') as ShockScenarioId | null;

  // Active scenario state
  const [selectedScenarioId, setSelectedScenarioId] = useState<ShockScenarioId>(
    scenarioParam && SCENARIO_METAS[scenarioParam] ? scenarioParam : 'stockout'
  );

  // Sync with search params if navigated from landing page
  useEffect(() => {
    if (scenarioParam && SCENARIO_METAS[scenarioParam] && scenarioParam !== selectedScenarioId) {
      setSelectedScenarioId(scenarioParam);
      setInputs(BASELINE_DEFAULTS[scenarioParam]);
      const rec = SCENARIO_STRATEGIES[scenarioParam].find((s) => s.isRecommended) || SCENARIO_STRATEGIES[scenarioParam][0];
      setSelectedStrategyId(rec.id);
      setSimStage('ready');
      setExecutedResult(null);
    }
  }, [scenarioParam, selectedScenarioId]);

  // Inputs state for active scenario
  const [inputs, setInputs] = useState<ScenarioInputParams>(
    BASELINE_DEFAULTS[selectedScenarioId]
  );

  // Strategy selection
  const strategies = SCENARIO_STRATEGIES[selectedScenarioId];
  const defaultStrategy = strategies.find((s) => s.isRecommended) || strategies[0];
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(defaultStrategy.id);

  // Simulation execution lifecycle state
  const [simStage, setSimStage] = useState<SimulationStage>('ready');
  const [simProgress, setSimProgress] = useState<number>(0);
  const [simulatedDay, setSimulatedDay] = useState<number>(0);
  const [executedResult, setExecutedResult] = useState<SimulationResult | null>(null);

  // Saved scenario experiment comparisons
  const [savedRuns, setSavedRuns] = useState<SavedRun[]>([]);

  // Progressive Disclosure View Tabs (reduces visual overload)
  const [configTab, setConfigTab] = useState<'inputs' | 'strategy'>('inputs');
  const [analysisTab, setAnalysisTab] = useState<'impact' | 'policy' | 'causal'>('impact');
  const [isMechanicsExpanded, setIsMechanicsExpanded] = useState<boolean>(false);

  // Real-time calculated simulation (pure deterministic source of truth)
  const computedResult: SimulationResult = useMemo(() => {
    return runDeterministicSimulation(selectedScenarioId, inputs, selectedStrategyId);
  }, [selectedScenarioId, inputs, selectedStrategyId]);

  const activeResult = computedResult;

  // Handle switching scenario
  const handleSelectScenario = (id: ShockScenarioId) => {
    setSelectedScenarioId(id);
    setInputs(BASELINE_DEFAULTS[id]);
    const rec = SCENARIO_STRATEGIES[id].find((s) => s.isRecommended) || SCENARIO_STRATEGIES[id][0];
    setSelectedStrategyId(rec.id);
    setSimStage('ready');
    setExecutedResult(null);
    setSimProgress(0);
    setSimulatedDay(0);
  };

  // Reset inputs to default baseline
  const handleResetBaseline = () => {
    setInputs(BASELINE_DEFAULTS[selectedScenarioId]);
    const rec = SCENARIO_STRATEGIES[selectedScenarioId].find((s) => s.isRecommended) || SCENARIO_STRATEGIES[selectedScenarioId][0];
    setSelectedStrategyId(rec.id);
    setSimStage('ready');
    setExecutedResult(null);
    setSimProgress(0);
    setSimulatedDay(0);
    toast.info('Restored Scenario Baseline', {
      description: 'Scenario parameters restored to deterministic 90-day simulator baseline.'
    });
  };

  // Progressive deterministic simulation runner
  const handleRunSimulation = () => {
    const horizon = inputs.horizonDays;
    setSimStage('initializing');
    setSimProgress(10);
    setSimulatedDay(0);

    // Stage 1: Baseline inspection (200ms)
    setTimeout(() => {
      setSimStage('baseline');
      setSimProgress(25);
      setSimulatedDay(1);
    }, 200);

    // Stage 2: Shock injection (550ms)
    setTimeout(() => {
      setSimStage('shock');
      setSimProgress(50);
      setSimulatedDay(Math.max(1, Math.round(horizon * 0.35)));
    }, 550);

    // Stage 3: DAG Propagation (950ms)
    setTimeout(() => {
      setSimStage('propagating');
      setSimProgress(75);
      setSimulatedDay(Math.max(2, Math.round(horizon * 0.7)));
    }, 950);

    // Stage 4: Autonomous Mitigation (1300ms)
    setTimeout(() => {
      setSimStage('mitigating');
      setSimProgress(90);
      setSimulatedDay(horizon);
    }, 1300);

    // Stage 5: Finalized (1700ms)
    setTimeout(() => {
      setSimStage('completed');
      setSimProgress(100);
      setSimulatedDay(horizon);
      setExecutedResult(computedResult);
      toast.success(`Simulation Completed: ${computedResult.scenarioMeta.title}`, {
        description: `Applied ${computedResult.activeStrategyName}. Projected Loss Avoided: +₹${computedResult.financialImpact.lossAvoided.toLocaleString('en-IN')}.`
      });
    }, 1700);
  };

  // Save current simulation run to local comparison ledger
  const handleSaveRun = () => {
    if (!activeResult) return;
    const newRun: SavedRun = {
      id: `sim-${Date.now()}`,
      timestamp: new Date().toTimeString().split(' ')[0],
      scenarioTitle: activeResult.scenarioMeta.title,
      strategyName: activeResult.activeStrategyName,
      lossAvoided: activeResult.financialImpact.lossAvoided,
      roas: activeResult.mitigated.roas
    };
    setSavedRuns((prev) => [newRun, ...prev.slice(0, 4)]);
    toast.success('Simulation Saved to Comparison Ledger');
  };

  const isExecuting = simStage !== 'ready' && simStage !== 'completed';

  // Sliced time-series up to current simulated day for live animation
  const simulatedTimeSeries: DailyLossPoint[] = useMemo(() => {
    const allSeries = computedResult.timeSeries;
    if (simStage === 'ready' || simStage === 'completed') return allSeries;
    const targetCount = Math.max(1, Math.min(allSeries.length, simulatedDay));
    return allSeries.slice(0, targetCount);
  }, [computedResult.timeSeries, simStage, simulatedDay]);

  // Compute live telemetry stats depending on simulation stage
  const liveTelemetry = useMemo(() => {
    const base = computedResult.baseline;
    const shock = computedResult.shocked;
    const mit = computedResult.mitigated;

    if (selectedScenarioId === 'stockout') {
      const invDisplay =
        simStage === 'ready' || simStage === 'baseline'
          ? `${inputs.inventoryUnits} units`
          : simStage === 'shock'
          ? `${inputs.inventoryShockUnits} units (Depleted)`
          : simStage === 'propagating'
          ? '0 units (Out of Stock)'
          : `${inputs.inventoryShockUnits} units (Protected)`;

      const spendDisplay =
        simStage === 'ready' || simStage === 'baseline'
          ? `₹${base.spend.toLocaleString('en-IN')}/day`
          : simStage === 'shock' || simStage === 'propagating'
          ? `₹${shock.spend.toLocaleString('en-IN')}/day (Burning)`
          : `₹${mit.spend.toLocaleString('en-IN')}/day (Controlled)`;

      const roasDisplay =
        simStage === 'ready' || simStage === 'baseline'
          ? `${base.roas.toFixed(2)}x`
          : simStage === 'shock' || simStage === 'propagating'
          ? `${shock.roas.toFixed(2)}x (Collapsed)`
          : `${mit.roas.toFixed(2)}x (Recovered)`;

      const protectedDisplay =
        simStage === 'completed'
          ? `+₹${computedResult.financialImpact.lossAvoided.toLocaleString('en-IN')}`
          : simStage === 'mitigating'
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

    if (selectedScenarioId === 'cpm-spike') {
      const cpmDisplay =
        simStage === 'ready' || simStage === 'baseline'
          ? `₹${inputs.baselineCpm.toFixed(2)}`
          : `₹${(inputs.baselineCpm * inputs.cpmMultiplier).toFixed(2)} (+${Math.round((inputs.cpmMultiplier - 1) * 100)}%)`;

      const impDisplay =
        simStage === 'ready' || simStage === 'baseline'
          ? base.impressions.toLocaleString('en-IN')
          : simStage === 'shock' || simStage === 'propagating'
          ? `${shock.impressions.toLocaleString('en-IN')} (Compressed)`
          : mit.impressions.toLocaleString('en-IN');

      const roasDisplay =
        simStage === 'ready' || simStage === 'baseline'
          ? `${base.roas.toFixed(2)}x`
          : simStage === 'shock'
          ? `${shock.roas.toFixed(2)}x (< Break-even)`
          : `${mit.roas.toFixed(2)}x (Rebalanced)`;

      const lossDisplay =
        simStage === 'completed'
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

    if (selectedScenarioId === 'creative-fatigue') {
      const ctrDisplay =
        simStage === 'ready' || simStage === 'baseline'
          ? `${inputs.ctrPct.toFixed(2)}%`
          : simStage === 'shock' || simStage === 'propagating'
          ? `${(inputs.ctrPct * (1 - inputs.fatiguePct / 100)).toFixed(2)}% (-${inputs.fatiguePct}%)`
          : `${(inputs.ctrPct * 0.95).toFixed(2)}% (Refreshed)`;

      const convDisplay =
        simStage === 'ready' || simStage === 'baseline'
          ? `${base.conversions} orders`
          : simStage === 'shock'
          ? `${shock.conversions} orders (Decayed)`
          : `${mit.conversions} orders (Restored)`;

      const roasDisplay =
        simStage === 'ready' || simStage === 'baseline'
          ? `${base.roas.toFixed(2)}x`
          : simStage === 'shock'
          ? `${shock.roas.toFixed(2)}x`
          : `${mit.roas.toFixed(2)}x`;

      const lossDisplay =
        simStage === 'completed'
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
      simStage === 'ready' || simStage === 'baseline'
        ? `${inputs.buyBoxProbabilityPct}%`
        : simStage === 'shock' || simStage === 'propagating'
        ? '25% (Undercut by Rival)'
        : '68% (Rebalanced Direct)';

    const priceDisplay =
      simStage === 'ready' || simStage === 'baseline'
        ? `₹${inputs.ourPrice.toLocaleString('en-IN')}`
        : `₹${inputs.competitorPrice.toLocaleString('en-IN')} (-${inputs.competitorUndercutPct}%)`;

    const roasDisplay =
      simStage === 'ready' || simStage === 'baseline'
        ? `${base.roas.toFixed(2)}x`
        : simStage === 'shock'
        ? `${shock.roas.toFixed(2)}x`
        : `${mit.roas.toFixed(2)}x`;

    const lossDisplay =
      simStage === 'completed'
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
  }, [selectedScenarioId, simStage, inputs, computedResult]);

  return (
    <div className='flex flex-1 flex-col gap-5 p-4 md:p-6 bg-slate-50/50 dark:bg-[#07090e] text-foreground min-h-screen font-mono min-w-0 max-w-full'>
      {/* Streamlined Header Banner */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-3.5'>
        <div>
          <div className='flex items-center gap-2'>
            <Icons.sparkles className='size-5 text-indigo-600 dark:text-purple-400' />
            <h1 className='text-lg sm:text-xl font-bold uppercase tracking-tight text-foreground'>
              Scenario Simulation Lab &amp; Decision Sandbox
            </h1>
          </div>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Autonomous Crisis Stress-Testing • Parameterized What-If Modeling • Scipy Response Curve Calibration
          </p>
        </div>

        <div className='flex items-center gap-2.5'>
          {/* Status Badge */}
          <div className='flex items-center gap-2 px-2.5 py-1 rounded-lg border border-border bg-card text-xs'>
            <span
              className={cn(
                'size-2 rounded-full',
                isExecuting
                  ? 'bg-amber-500 animate-ping'
                  : simStage === 'completed'
                  ? 'bg-emerald-500'
                  : 'bg-sky-500 animate-pulse'
              )}
            />
            <span className='text-muted-foreground'>Status:</span>
            <span className='font-bold text-foreground text-[11px]'>
              {isExecuting
                ? `SIMULATING (${simProgress}%)`
                : simStage === 'completed'
                ? 'COMPLETED'
                : 'READY TO SIMULATE'}
            </span>
          </div>

          {/* Reset Baseline */}
          <Button
            size='sm'
            variant='outline'
            onClick={handleResetBaseline}
            className='h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground border-border'
            title='Reset inputs to default steady-state baseline'
          >
            <Icons.clock className='mr-1 size-3' />
            Reset
          </Button>

          {/* Single Primary Run Action */}
          <Button
            size='sm'
            onClick={handleRunSimulation}
            disabled={isExecuting}
            className='h-8 px-4 text-xs font-bold uppercase bg-foreground text-background hover:bg-foreground/90 shadow-sm active:scale-[0.98]'
          >
            {isExecuting ? (
              <>
                <Icons.spinner className='mr-1.5 size-3.5 animate-spin' />
                Simulating ({simProgress}%)
              </>
            ) : simStage === 'completed' ? (
              <>
                <Icons.refresh className='mr-1.5 size-3.5 text-emerald-500' />
                Rerun Simulation
              </>
            ) : (
              <>
                <Icons.play className='mr-1.5 size-3.5 fill-current text-emerald-500' />
                Run Simulation
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Scenario Selector Tabs (Direct Selection with No Duplicate Target Card) */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-2'>
        {(Object.keys(SCENARIO_METAS) as ShockScenarioId[]).map((id) => {
          const s = SCENARIO_METAS[id];
          const isSelected = selectedScenarioId === id;

          return (
            <button
              key={s.id}
              onClick={() => handleSelectScenario(s.id)}
              className={cn(
                'text-left p-3 rounded-xl border transition-all text-xs flex flex-col justify-between gap-1.5 cursor-pointer',
                isSelected
                  ? 'border-foreground bg-card shadow-sm ring-1 ring-foreground/20'
                  : 'border-border/70 bg-muted/30 text-muted-foreground hover:bg-card hover:border-border hover:text-foreground'
              )}
            >
              <div className='flex items-center justify-between w-full'>
                <span className='text-[10px] uppercase font-bold tracking-wider'>
                  {s.tag}
                </span>
                <span
                  className={cn(
                    'text-[9px] px-1.5 py-0.2 rounded font-bold uppercase',
                    s.severity === 'CRITICAL' && 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
                    s.severity === 'HIGH' && 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
                    s.severity === 'MEDIUM' && 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
                  )}
                >
                  {s.severity}
                </span>
              </div>
              <div className='font-bold text-foreground text-xs line-clamp-1'>
                {s.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Simulation Workspace Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-5 items-start'>
        {/* LEFT COLUMN: CRISIS SETUP & POLICY (5 cols) */}
        <div className='lg:col-span-5 space-y-3'>
          {/* Segmented Switcher for Left Deck */}
          <div className='flex items-center gap-1 p-1 bg-card border border-border/80 rounded-xl text-xs'>
            <button
              type='button'
              onClick={() => setConfigTab('inputs')}
              className={cn(
                'flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer',
                configTab === 'inputs'
                  ? 'bg-foreground text-background shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icons.adjustments className='size-3.5' />
              <span>1. Shock Parameters</span>
            </button>

            <button
              type='button'
              onClick={() => setConfigTab('strategy')}
              className={cn(
                'flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer',
                configTab === 'strategy'
                  ? 'bg-foreground text-background shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icons.check className='size-3.5' />
              <span>2. Mitigation Policy</span>
            </button>
          </div>

          {/* Active Tab View */}
          {configTab === 'inputs' ? (
            <ScenarioInputPanel
              scenarioId={selectedScenarioId}
              inputs={inputs}
              onChangeInputs={(newInputs) => {
                setInputs(newInputs);
                if (simStage === 'completed') {
                  setSimStage('ready');
                  setExecutedResult(null);
                }
              }}
              onResetBaseline={handleResetBaseline}
            />
          ) : (
            <StrategySelector
              strategies={strategies}
              selectedStrategyId={selectedStrategyId}
              onSelectStrategy={(newStratId) => {
                setSelectedStrategyId(newStratId);
                if (simStage === 'completed') {
                  setSimStage('ready');
                  setExecutedResult(null);
                }
              }}
              inputs={inputs}
              onChangeInputs={(newInputs) => {
                setInputs(newInputs);
                if (simStage === 'completed') {
                  setSimStage('ready');
                  setExecutedResult(null);
                }
              }}
            />
          )}

          {/* Compact Saved Comparisons Action Strip */}
          <div className='flex items-center justify-between p-2.5 rounded-xl border border-border/70 bg-card/60 text-xs'>
            <span className='text-[11px] text-muted-foreground'>
              Ledger: <strong className='text-foreground'>{savedRuns.length}</strong> saved run{savedRuns.length === 1 ? '' : 's'}
            </span>
            <div className='flex items-center gap-1.5'>
              <Button
                size='sm'
                variant='outline'
                onClick={handleSaveRun}
                className='h-7 px-2.5 text-[11px] font-mono border-border text-foreground hover:bg-accent'
              >
                <Icons.clipboardText className='mr-1 size-3' />
                Save Run
              </Button>
              {savedRuns.length > 0 && (
                <button
                  type='button'
                  onClick={() => setSavedRuns([])}
                  className='text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5'
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Saved Runs Detail List (if any) */}
          {savedRuns.length > 0 && (
            <div className='rounded-xl border border-border/80 bg-card p-3 space-y-1.5 text-xs animate-in fade-in-50 duration-200'>
              {savedRuns.map((run) => (
                <div
                  key={run.id}
                  className='rounded border border-border/60 p-2 flex items-center justify-between text-[11px] bg-muted/20'
                >
                  <div className='truncate max-w-[170px]'>
                    <span className='font-bold block text-foreground truncate'>{run.strategyName}</span>
                    <span className='text-[10px] text-muted-foreground'>{run.timestamp}</span>
                  </div>
                  <div className='text-right'>
                    <span className='text-emerald-600 dark:text-emerald-400 font-bold block'>
                      +₹{run.lossAvoided.toLocaleString('en-IN')}
                    </span>
                    <span className='text-[10px] text-muted-foreground'>{run.roas.toFixed(2)}x ROAS</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SIMULATION VISUALIZER & PROGRESSIVE ANALYSIS DECK (7 cols) */}
        <div className='lg:col-span-7 space-y-4'>
          {/* Always Visible: Interactive Runnable Simulation HUD */}
          <SimulationVisualizer
            scenarioId={selectedScenarioId}
            stage={simStage}
            progressPct={simProgress}
            simulatedDay={simulatedDay}
            totalDays={inputs.horizonDays}
            timeSeriesSoFar={simulatedTimeSeries}
            currentTelemetry={liveTelemetry}
            onRun={handleRunSimulation}
            onReset={handleResetBaseline}
            result={computedResult}
          />

          {/* Progressive Analysis Deck: Clean Tabs eliminate wall-of-content overload */}
          <div className='space-y-3 pt-1'>
            {/* Analysis Navigation Tabs */}
            <div className='flex items-center gap-1.5 p-1 bg-card border border-border/80 rounded-xl text-xs'>
              <button
                type='button'
                onClick={() => setAnalysisTab('impact')}
                className={cn(
                  'flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate',
                  analysisTab === 'impact'
                    ? 'bg-foreground text-background shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icons.lineChart className='size-3.5 shrink-0' />
                <span className='truncate'>Impact &amp; Trajectory</span>
              </button>

              <button
                type='button'
                onClick={() => setAnalysisTab('policy')}
                className={cn(
                  'flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate',
                  analysisTab === 'policy'
                    ? 'bg-foreground text-background shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icons.adjustments className='size-3.5 shrink-0' />
                <span className='truncate'>Policy &amp; Trade-offs</span>
              </button>

              <button
                type='button'
                onClick={() => setAnalysisTab('causal')}
                className={cn(
                  'flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate',
                  analysisTab === 'causal'
                    ? 'bg-foreground text-background shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icons.gitBranch className='size-3.5 shrink-0' />
                <span className='truncate'>Causal Lineage</span>
              </button>
            </div>

            {/* TAB 1: EXECUTIVE IMPACT & CHARTS */}
            {analysisTab === 'impact' && (
              <div className='space-y-4 animate-in fade-in-50 duration-200'>
                <SimulationFinancialImpact result={activeResult} />
                <SimulationImpactChart result={activeResult} />
              </div>
            )}

            {/* TAB 2: POLICY COMPARISON & MATRIX */}
            {analysisTab === 'policy' && (
              <div className='space-y-4 animate-in fade-in-50 duration-200'>
                <SimulationStrategyComparison
                  result={activeResult}
                  onSelectStrategy={setSelectedStrategyId}
                />
                <SimulationResultsMatrix result={activeResult} />
              </div>
            )}

            {/* TAB 3: CAUSAL CHAIN & DATA AUDIT SEAL */}
            {analysisTab === 'causal' && (
              <div className='space-y-4 animate-in fade-in-50 duration-200'>
                <SimulationCausalChain nodes={activeResult.causalChain} />
                <SimulationDataLineage lineage={activeResult.dataLineage} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Engine Mechanics & Mathematical Foundations (Collapsible Accordion to avoid clutter) */}
      <div className='pt-2 border-t border-border/80'>
        <button
          type='button'
          onClick={() => setIsMechanicsExpanded(!isMechanicsExpanded)}
          className='w-full flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card/60 hover:bg-card text-xs text-muted-foreground hover:text-foreground transition-all cursor-pointer'
        >
          <div className='flex items-center gap-2'>
            <Icons.info className='size-4 text-primary' />
            <span className='font-bold uppercase tracking-wider'>
              Engine Mathematical Foundations &amp; Scipy Calibration
            </span>
          </div>
          <span className='text-[10px] text-muted-foreground flex items-center gap-1'>
            {isMechanicsExpanded ? 'Collapse' : 'Expand Details'}
            {isMechanicsExpanded ? <Icons.chevronUp className='size-3.5' /> : <Icons.chevronDown className='size-3.5' />}
          </span>
        </button>

        {isMechanicsExpanded && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 animate-in fade-in-50 duration-200'>
            <div className='rounded-xl border border-border bg-card p-4 shadow-xs'>
              <h4 className='text-xs font-bold text-foreground mb-1.5 flex items-center gap-2'>
                <Icons.adjustments className='size-3.5 text-emerald-600 dark:text-emerald-400' />
                1. Adstock &amp; Saturation
              </h4>
              <p className='text-[11px] text-muted-foreground leading-relaxed font-sans'>
                Simulates non-linear Hill response curves: <code className='text-emerald-700 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/40 px-1 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50'>r(s) = a * s^b / (c + s^b)</code>. Models diminishing returns on over-scaled channels to calibrate optimizer bounds.
              </p>
            </div>

            <div className='rounded-xl border border-border bg-card p-4 shadow-xs'>
              <h4 className='text-xs font-bold text-foreground mb-1.5 flex items-center gap-2'>
                <Icons.product className='size-3.5 text-sky-600 dark:text-cyan-400' />
                2. ERP Inventory Coupling
              </h4>
              <p className='text-[11px] text-muted-foreground leading-relaxed font-sans'>
                Couples live warehouse inventory with ad network spend. When units hit 0, conversions collapse while ad spend continues unless the autonomous stockout kill-switch triggers.
              </p>
            </div>

            <div className='rounded-xl border border-border bg-card p-4 shadow-xs'>
              <h4 className='text-xs font-bold text-foreground mb-1.5 flex items-center gap-2'>
                <Icons.check className='size-3.5 text-indigo-600 dark:text-purple-400' />
                3. Ground-Truth Scoring
              </h4>
              <p className='text-[11px] text-muted-foreground leading-relaxed font-sans'>
                Every injected anomaly holds a deterministic ground-truth label. The RCA agent explanation is evaluated against exact injected drivers (e.g. stockout vs CPM spike).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SimulatorPage() {
  return (
    <Suspense
      fallback={
        <div className='p-6 flex items-center justify-center min-h-screen text-xs font-mono text-muted-foreground'>
          <Icons.spinner className='mr-2 size-4 animate-spin text-primary' />
          Loading Scenario Simulation Lab...
        </div>
      }
    >
      <SimulationLabContent />
    </Suspense>
  );
}
