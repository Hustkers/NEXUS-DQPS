'use client';

import React, { useState, useMemo, Suspense } from 'react';
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
import { SimulationStrategyComparison } from '@/features/decision-engine/components/simulation-strategy-comparison';
import { SimulationCausalChain } from '@/features/decision-engine/components/simulation-causal-chain';
import { SimulationDataLineage } from '@/features/decision-engine/components/simulation-data-lineage';
import { SimulationImpactChart } from '@/features/decision-engine/components/simulation-impact-chart';
import { SimulationLossCurve } from '@/features/decision-engine/components/simulation-loss-curve';
import { ScenarioController } from '@/features/decision-engine/components/scenario-controller';
import initialEngineState from '@/data/nexus-engine-state.json';
import type { ShockScenarioId, ScenarioInputParams, SimulationResult, DailyLossPoint } from '@/features/decision-engine/types/simulation-types';

interface SavedRun {
  id: string;
  timestamp: string;
  scenarioTitle: string;
  strategyName: string;
  lossAvoided: number;
  roas: number;
}

type DetailTab = 'metrics' | 'impact' | 'causal' | 'lineage';

function SimulationLabContent() {
  const searchParams = useSearchParams();
  const scenarioParam = searchParams.get('scenario') as ShockScenarioId | null;

  // Initial scenario ID from URL or default
  const initialScenarioId: ShockScenarioId =
    scenarioParam && SCENARIO_METAS[scenarioParam] ? scenarioParam : 'stockout';

  // Active scenario state
  const [selectedScenarioId, setSelectedScenarioId] = useState<ShockScenarioId>(initialScenarioId);

  // Inputs state for active scenario
  const [inputs, setInputs] = useState<ScenarioInputParams>(() =>
    BASELINE_DEFAULTS[initialScenarioId]
  );

  // Strategy selection
  const strategies = SCENARIO_STRATEGIES[selectedScenarioId];
  const defaultStrategy = strategies.find((s) => s.isRecommended) || strategies[0];
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(() => defaultStrategy.id);

  // Simulation execution lifecycle state
  const [simStage, setSimStage] = useState<SimulationStage>('ready');
  const [simProgress, setSimProgress] = useState<number>(0);
  const [simulatedDay, setSimulatedDay] = useState<number>(0);
  const [executedResult, setExecutedResult] = useState<SimulationResult | null>(null);

  // Collapsed details & tabs state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('metrics');

  // Saved scenario experiment comparisons
  const [savedRuns, setSavedRuns] = useState<SavedRun[]>([]);

  // Sync with search params if navigated from landing page
  const [prevScenarioParam, setPrevScenarioParam] = useState(scenarioParam);
  if (scenarioParam !== prevScenarioParam) {
    setPrevScenarioParam(scenarioParam);
    if (scenarioParam && SCENARIO_METAS[scenarioParam] && scenarioParam !== selectedScenarioId) {
      setSelectedScenarioId(scenarioParam);
      setInputs(BASELINE_DEFAULTS[scenarioParam]);
      const rec = SCENARIO_STRATEGIES[scenarioParam].find((s) => s.isRecommended) || SCENARIO_STRATEGIES[scenarioParam][0];
      setSelectedStrategyId(rec.id);
      setSimStage('ready');
      setExecutedResult(null);
    }
  }

  // Real-time calculated simulation (pure deterministic source of truth)
  const computedResult: SimulationResult = useMemo(() => {
    return runDeterministicSimulation(selectedScenarioId, inputs, selectedStrategyId);
  }, [selectedScenarioId, inputs, selectedStrategyId]);

  // Active result displayed when executed
  const activeResult = executedResult || (simStage === 'completed' ? computedResult : null);

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
    toast.info('Restored baseline', {
      description: 'Scenario parameters restored to default values.'
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

    // Stage 4: Autonomous Mitigation & Final Resolution (1300ms)
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
      toast.success(`Simulation completed: ${computedResult.scenarioMeta.title}`, {
        description: `Applied ${computedResult.activeStrategyName}. Projected loss avoided: +₹${computedResult.financialImpact.lossAvoided.toLocaleString('en-IN')}.`
      });
    }, 1700);
  };

  // Save current simulation run to local comparison
  const handleSaveRun = () => {
    const target = activeResult || computedResult;
    if (!target) return;
    const newRun: SavedRun = {
      id: `sim-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      scenarioTitle: target.scenarioMeta.title,
      strategyName: target.activeStrategyName,
      lossAvoided: target.financialImpact.lossAvoided,
      roas: target.mitigated.roas
    };
    setSavedRuns((prev) => [newRun, ...prev.slice(0, 4)]);
    toast.success('Simulation saved', {
      description: 'Added to your saved comparisons.'
    });
  };

  const scenarioMeta = SCENARIO_METAS[selectedScenarioId];
  const isExecuting = simStage !== 'ready' && simStage !== 'completed';
  const hasCompletedRun = simStage === 'completed' || executedResult !== null;

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

    return {
      labelA: 'Physical inventory',
      valueA: `${inputs.inventoryShockUnits} units`,
      subA: 'Warehouse stock',
      labelB: 'Daily ad spend',
      valueB: `₹${base.spend.toLocaleString('en-IN')}/day`,
      subB: 'Ad channel spend',
      labelC: 'Effective ROAS',
      valueC: `${base.roas.toFixed(2)}x`,
      subC: 'Return on ad spend',
      labelD: 'Capital protected',
      valueD: `+₹${computedResult.financialImpact.lossAvoided.toLocaleString('en-IN')}`,
      subD: 'Loss avoided'
    };
  }, [inputs, computedResult]);

  return (
    <div className='min-h-screen bg-slate-50/50 dark:bg-[#07090e] text-foreground p-4 sm:p-6 lg:p-8'>
      <div className='max-w-[1200px] mx-auto w-full space-y-8'>
        {/* Sticky Header Banner */}
        <header className='sticky top-0 z-20 bg-slate-50/90 dark:bg-[#07090e]/90 backdrop-blur-md py-4 border-b border-border/60 flex items-center justify-between gap-4'>
          <div className='space-y-0.5'>
            <h1 className='text-2xl font-semibold tracking-tight text-foreground'>
              Scenario simulator
            </h1>
            <p className='text-sm text-muted-foreground'>
              Test how a crisis hits your profit, and what the best response saves.
            </p>
          </div>

          <div className='hidden sm:block'>
            <Button
              onClick={handleRunSimulation}
              disabled={isExecuting}
              className='h-10 px-5 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 shadow-xs'
            >
              {isExecuting ? (
                <>
                  <Icons.spinner className='mr-2 size-4 animate-spin motion-reduce:animate-none' />
                  Running ({simProgress}%)
                </>
              ) : hasCompletedRun ? (
                <>
                  <Icons.refresh className='mr-2 size-4 text-emerald-500' />
                  Rerun
                </>
              ) : (
                <>
                  <Icons.play className='mr-2 size-4 text-emerald-500' />
                  Run simulation
                </>
              )}
            </Button>
          </div>
        </header>

        {/* Scenario Picker: 4 simple cards with severity dots */}
        <section aria-label='Crisis scenarios' className='space-y-3'>
          <h2 className='text-sm font-semibold text-foreground'>
            1. Pick a crisis
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
            {(Object.keys(SCENARIO_METAS) as ShockScenarioId[]).map((id) => {
              const s = SCENARIO_METAS[id];
              const isSelected = selectedScenarioId === id;

              // Severity dot color & text
              const dotColor =
                s.severity === 'CRITICAL'
                  ? 'bg-rose-500'
                  : s.severity === 'HIGH'
                  ? 'bg-amber-500'
                  : 'bg-sky-500';

              const severityLabel =
                s.severity === 'CRITICAL'
                  ? 'Critical severity'
                  : s.severity === 'HIGH'
                  ? 'High severity'
                  : 'Medium severity';

              return (
                <button
                  key={s.id}
                  type='button'
                  aria-pressed={isSelected}
                  onClick={() => handleSelectScenario(s.id)}
                  className={cn(
                    'p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                    isSelected
                      ? 'border-foreground bg-card shadow-xs ring-1 ring-foreground/20'
                      : 'border-border bg-card/60 hover:bg-card hover:border-border/80'
                  )}
                >
                  <span className='font-semibold text-sm text-foreground'>
                    {s.title}
                  </span>
                  <span
                    title={severityLabel}
                    aria-label={severityLabel}
                    className={cn('size-2.5 rounded-full shrink-0', dotColor)}
                  />
                </button>
              );
            })}
          </div>
        </section>

        {/* Two Column Layout (5 cols / 7 cols on desktop) */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
          {/* Left Column: Your setup (5 cols) */}
          <div className='lg:col-span-5 space-y-8'>
            <div className='space-y-3'>
              <h2 className='text-base font-semibold text-foreground'>
                Your setup
              </h2>

              {/* Merged Scenario Input Panel (minimal variant) */}
              <ScenarioInputPanel
                variant='minimal'
                scenarioId={selectedScenarioId}
                inputs={inputs}
                scenarioName={scenarioMeta.title}
                eventDescription={scenarioMeta.eventDescription}
                onChangeInputs={(newInputs) => {
                  setInputs(newInputs);
                  if (simStage === 'completed') {
                    setSimStage('ready');
                    setExecutedResult(null);
                  }
                }}
                onResetBaseline={handleResetBaseline}
              />
            </div>

            {/* Strategy Selector (minimal variant) */}
            <StrategySelector
              variant='minimal'
              strategies={strategies}
              selectedStrategyId={selectedStrategyId}
              onSelectStrategy={(newStratId) => {
                setSelectedStrategyId(newStratId);
                if (simStage === 'completed') {
                  // Keep completed state with re-calculated strategy outcome
                  setExecutedResult(runDeterministicSimulation(selectedScenarioId, inputs, newStratId));
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

            {/* Saved Comparisons (only visible when at least one exists) */}
            {savedRuns.length > 0 && (
              <div className='rounded-xl border border-border bg-card p-5 shadow-xs space-y-3'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-sm font-semibold text-foreground'>
                    Saved comparisons
                  </h3>
                  <button
                    type='button'
                    onClick={() => setSavedRuns([])}
                    className='text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded'
                  >
                    Clear
                  </button>
                </div>
                <div className='divide-y divide-border/60'>
                  {savedRuns.map((run) => (
                    <div
                      key={run.id}
                      className='py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs gap-3'
                    >
                      <div className='truncate'>
                        <span className='font-medium text-foreground block truncate'>
                          {run.strategyName}
                        </span>
                        <span className='text-xs text-muted-foreground'>
                          {run.timestamp} • {run.scenarioTitle}
                        </span>
                      </div>
                      <div className='text-right shrink-0'>
                        <span className='text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums block'>
                          +₹{run.lossAvoided.toLocaleString('en-IN')}
                        </span>
                        <span className='text-xs text-muted-foreground tabular-nums'>
                          {run.roas.toFixed(2)}x ROAS
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Result (7 cols) */}
          <div className='lg:col-span-7 space-y-8'>
            <div className='space-y-3'>
              <h2 className='text-base font-semibold text-foreground'>
                Result
              </h2>

              {/* 1. Before or during run HUD */}
              {(!hasCompletedRun || isExecuting) && (
                <SimulationVisualizer
                  variant='minimal'
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
              )}

              {/* 2. After a run: Show outcomes in exact required order */}
              {hasCompletedRun && activeResult && !isExecuting && (
                <div className='space-y-6 motion-reduce:transition-none'>
                  {/* Headline Card */}
                  <div
                    aria-live='polite'
                    className='rounded-xl border border-border bg-card p-6 shadow-xs space-y-5'
                  >
                    <div className='flex items-start justify-between gap-4'>
                      <div className='space-y-1.5'>
                        <p className='text-sm text-muted-foreground'>
                          Switching to{' '}
                          <span className='font-medium text-foreground'>
                            {activeResult.activeStrategyName}
                          </span>{' '}
                          avoids
                        </p>
                        <div className='text-3xl sm:text-4xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight'>
                          ₹{activeResult.financialImpact.lossAvoided.toLocaleString('en-IN')}
                        </div>
                        <p className='text-sm text-muted-foreground'>
                          in losses over {inputs.horizonDays}{' '}
                          {inputs.horizonDays === 1 ? 'day' : 'days'}.
                        </p>
                      </div>

                      <Button
                        size='sm'
                        variant='outline'
                        onClick={handleSaveRun}
                        className='text-xs font-medium border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'
                      >
                        <Icons.clipboardText className='mr-1.5 size-3.5' />
                        Save comparison
                      </Button>
                    </div>

                    {/* Exactly 3 supporting figures */}
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/60'>
                      <div className='space-y-0.5'>
                        <span className='text-xs text-muted-foreground block'>
                          Loss without action
                        </span>
                        <span className='text-base font-semibold text-rose-600 dark:text-rose-400 tabular-nums'>
                          ₹{activeResult.financialImpact.lossWithoutMitigation.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className='space-y-0.5'>
                        <span className='text-xs text-muted-foreground block'>
                          Loss avoided
                        </span>
                        <span className='text-base font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums'>
                          +₹{activeResult.financialImpact.lossAvoided.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className='space-y-0.5'>
                        <span className='text-xs text-muted-foreground block'>
                          Effective ROAS
                        </span>
                        <span className='text-base font-semibold text-foreground tabular-nums'>
                          {activeResult.mitigated.roas.toFixed(2)}x
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Main Loss Curve Chart */}
                  <SimulationLossCurve
                    variant='minimal'
                    result={activeResult}
                  />

                  {/* Strategy Comparison Table */}
                  <SimulationStrategyComparison
                    variant='minimal'
                    result={activeResult}
                    onSelectStrategy={(newStratId) => {
                      setSelectedStrategyId(newStratId);
                      setExecutedResult(runDeterministicSimulation(selectedScenarioId, inputs, newStratId));
                    }}
                  />

                  {/* Single Collapsed Section: Show details */}
                  <details
                    className='rounded-xl border border-border bg-card p-6 shadow-xs group'
                    onToggle={(e) => setDetailsOpen(e.currentTarget.open)}
                  >
                    <summary className='text-sm font-semibold text-foreground cursor-pointer select-none list-none flex items-center justify-between'>
                      <span>Show details</span>
                      <Icons.chevronDown className='size-4 text-muted-foreground transition-transform group-open:rotate-180' />
                    </summary>

                    {detailsOpen && (
                      <div className='mt-5 pt-5 border-t border-border/60 space-y-5'>
                        {/* Tab Switcher */}
                        <div className='flex items-center gap-2 border-b border-border/60 pb-2 overflow-x-auto'>
                          <button
                            type='button'
                            onClick={() => setActiveDetailTab('metrics')}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 shrink-0',
                              activeDetailTab === 'metrics'
                                ? 'bg-foreground text-background font-semibold'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                            )}
                          >
                            Metrics
                          </button>
                          <button
                            type='button'
                            onClick={() => setActiveDetailTab('impact')}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 shrink-0',
                              activeDetailTab === 'impact'
                                ? 'bg-foreground text-background font-semibold'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                            )}
                          >
                            Policy impact chart
                          </button>
                          <button
                            type='button'
                            onClick={() => setActiveDetailTab('causal')}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 shrink-0',
                              activeDetailTab === 'causal'
                                ? 'bg-foreground text-background font-semibold'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                            )}
                          >
                            Causal chain
                          </button>
                          <button
                            type='button'
                            onClick={() => setActiveDetailTab('lineage')}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 shrink-0',
                              activeDetailTab === 'lineage'
                                ? 'bg-foreground text-background font-semibold'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                            )}
                          >
                            Data lineage
                          </button>
                        </div>

                        {/* Tab Panels */}
                        {activeDetailTab === 'metrics' && (
                          <SimulationResultsMatrix result={activeResult} />
                        )}

                        {activeDetailTab === 'impact' && (
                          <SimulationImpactChart result={activeResult} />
                        )}

                        {activeDetailTab === 'causal' && (
                          <SimulationCausalChain nodes={activeResult.causalChain} />
                        )}

                        {activeDetailTab === 'lineage' && (
                          <SimulationDataLineage lineage={activeResult.dataLineage} />
                        )}
                      </div>
                    )}
                  </details>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom of the page: How this works */}
        <section aria-label='How this works' className='pt-6 border-t border-border/60'>
          <details className='rounded-xl border border-border bg-card p-6 shadow-xs group'>
            <summary className='text-sm font-semibold text-foreground cursor-pointer select-none list-none flex items-center justify-between'>
              <span>How this works</span>
              <Icons.chevronDown className='size-4 text-muted-foreground transition-transform group-open:rotate-180' />
            </summary>

            <div className='mt-5 pt-5 border-t border-border/60 space-y-6'>
              <ul className='space-y-2.5 text-sm text-muted-foreground'>
                <li className='flex items-start gap-2'>
                  <span className='size-1.5 rounded-full bg-emerald-500 mt-2 shrink-0' />
                  <span>
                    <strong className='text-foreground font-medium'>Diminishing returns on ad spend:</strong> Higher spend on saturated channels produces lower marginal conversion yields, modeled via{' '}
                    <code className='font-mono text-xs bg-muted px-1.5 py-0.5 rounded border border-border text-foreground'>
                      r(s) = a · s^b / (c + s^b)
                    </code>.
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='size-1.5 rounded-full bg-emerald-500 mt-2 shrink-0' />
                  <span>
                    <strong className='text-foreground font-medium'>Ads pause when stock hits zero:</strong> Coupling live inventory with ad platforms prevents continuing spend when no product can be fulfilled.
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='size-1.5 rounded-full bg-emerald-500 mt-2 shrink-0' />
                  <span>
                    <strong className='text-foreground font-medium'>Every injected problem has a known cause used for scoring:</strong> Recommendations are benchmarked against deterministic outcomes.
                  </span>
                </li>
              </ul>

              {/* Advanced tools disclosure containing ScenarioController */}
              <details className='rounded-lg border border-border/80 bg-muted/20 p-4 group/tools'>
                <summary className='text-xs font-semibold text-muted-foreground cursor-pointer select-none list-none flex items-center justify-between'>
                  <span>Advanced tools</span>
                  <Icons.chevronDown className='size-3.5 text-muted-foreground transition-transform group-open/tools:rotate-180' />
                </summary>

                <div className='mt-4 pt-3 border-t border-border/60'>
                  <ScenarioController
                    scenarios={initialEngineState.scenarios}
                    onTriggerScenario={(s) => {
                      const mappedId: ShockScenarioId =
                        s.id === 'scenario-stockout'
                          ? 'stockout'
                          : s.id === 'scenario-cpm-spike'
                          ? 'cpm-spike'
                          : s.id === 'scenario-creative-fatigue'
                          ? 'creative-fatigue'
                          : 'price-undercut';
                      handleSelectScenario(mappedId);
                    }}
                    onResetBaseline={handleResetBaseline}
                  />
                </div>
              </details>
            </div>
          </details>
        </section>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className='sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-background/95 backdrop-blur-md border-t border-border z-30 flex items-center justify-between gap-3'>
        <div className='text-xs text-muted-foreground truncate'>
          {scenarioMeta.title}
        </div>
        <Button
          onClick={handleRunSimulation}
          disabled={isExecuting}
          className='h-9 px-4 text-xs font-medium bg-foreground text-background hover:bg-foreground/90 shrink-0 shadow-xs'
        >
          {isExecuting ? (
            <>
              <Icons.spinner className='mr-1.5 size-3.5 animate-spin motion-reduce:animate-none' />
              Running...
            </>
          ) : hasCompletedRun ? (
            <>
              <Icons.refresh className='mr-1.5 size-3.5 text-emerald-500' />
              Rerun
            </>
          ) : (
            <>
              <Icons.play className='mr-1.5 size-3.5 text-emerald-500' />
              Run simulation
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function SimulatorPage() {
  return (
    <Suspense
      fallback={
        <div className='p-8 flex items-center justify-center min-h-screen text-sm text-muted-foreground'>
          <Icons.spinner className='mr-2 size-4 animate-spin text-primary' />
          Loading scenario simulator...
        </div>
      }
    >
      <SimulationLabContent />
    </Suspense>
  );
}
