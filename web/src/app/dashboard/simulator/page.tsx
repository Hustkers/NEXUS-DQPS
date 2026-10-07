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
import { SimulationResultsMatrix } from '@/features/decision-engine/components/simulation-results-matrix';
import { SimulationFinancialImpact } from '@/features/decision-engine/components/simulation-financial-impact';
import { SimulationStrategyComparison } from '@/features/decision-engine/components/simulation-strategy-comparison';
import { SimulationCausalChain } from '@/features/decision-engine/components/simulation-causal-chain';
import { SimulationDataLineage } from '@/features/decision-engine/components/simulation-data-lineage';
import { SimulationImpactChart } from '@/features/decision-engine/components/simulation-impact-chart';
import { SimulationLossCurve } from '@/features/decision-engine/components/simulation-loss-curve';
import { ScenarioController } from '@/features/decision-engine/components/scenario-controller';
import initialEngineState from '@/data/nexus-engine-state.json';
import type { ShockScenarioId, ScenarioInputParams, SimulationResult } from '@/features/decision-engine/types/simulation-types';

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
    }
  }, [scenarioParam]);

  // Inputs state for active scenario
  const [inputs, setInputs] = useState<ScenarioInputParams>(
    BASELINE_DEFAULTS[selectedScenarioId]
  );

  // Strategy selection
  const strategies = SCENARIO_STRATEGIES[selectedScenarioId];
  const defaultStrategy = strategies.find((s) => s.isRecommended) || strategies[0];
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(defaultStrategy.id);

  // Simulation execution lifecycle state
  const [executionState, setExecutionState] = useState<
    'idle' | 'initializing' | 'applying_shock' | 'calculating_impact' | 'testing_mitigation' | 'completed'
  >('completed');

  // Saved scenario experiment comparisons
  const [savedRuns, setSavedRuns] = useState<SavedRun[]>([]);

  // Simulation computation
  const simulationResult: SimulationResult = useMemo(() => {
    return runDeterministicSimulation(selectedScenarioId, inputs, selectedStrategyId);
  }, [selectedScenarioId, inputs, selectedStrategyId]);

  // Handle switching scenario
  const handleSelectScenario = (id: ShockScenarioId) => {
    setSelectedScenarioId(id);
    setInputs(BASELINE_DEFAULTS[id]);
    const rec = SCENARIO_STRATEGIES[id].find((s) => s.isRecommended) || SCENARIO_STRATEGIES[id][0];
    setSelectedStrategyId(rec.id);
  };

  // Reset inputs to default baseline
  const handleResetBaseline = () => {
    setInputs(BASELINE_DEFAULTS[selectedScenarioId]);
    const rec = SCENARIO_STRATEGIES[selectedScenarioId].find((s) => s.isRecommended) || SCENARIO_STRATEGIES[selectedScenarioId][0];
    setSelectedStrategyId(rec.id);
    toast.info('Restored Scenario Baseline', {
      description: 'Scenario parameters restored to deterministic 90-day simulator baseline.'
    });
  };

  // Run simulation sequence
  const handleRunSimulation = () => {
    setExecutionState('initializing');

    setTimeout(() => {
      setExecutionState('applying_shock');
    }, 150);

    setTimeout(() => {
      setExecutionState('calculating_impact');
    }, 320);

    setTimeout(() => {
      setExecutionState('testing_mitigation');
    }, 500);

    setTimeout(() => {
      setExecutionState('completed');
      toast.success(`Simulation Completed: ${simulationResult.scenarioMeta.title}`, {
        description: `Applied ${simulationResult.activeStrategyName}. Projected Loss Avoided: +₹${simulationResult.financialImpact.lossAvoided.toLocaleString('en-IN')}.`
      });
    }, 700);
  };

  // Save current simulation run to local comparison
  const handleSaveRun = () => {
    const newRun: SavedRun = {
      id: `sim-${Date.now()}`,
      timestamp: new Date().toTimeString().split(' ')[0],
      scenarioTitle: simulationResult.scenarioMeta.title,
      strategyName: simulationResult.activeStrategyName,
      lossAvoided: simulationResult.financialImpact.lossAvoided,
      roas: simulationResult.mitigated.roas
    };
    setSavedRuns((prev) => [newRun, ...prev.slice(0, 4)]);
    toast.success('Simulation Saved to Comparison Ledger');
  };

  const scenarioMeta = SCENARIO_METAS[selectedScenarioId];
  const isExecuting = executionState !== 'idle' && executionState !== 'completed';

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/50 dark:bg-[#07090e] text-foreground min-h-screen font-mono'>
      {/* Header Banner */}
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4'>
        <div>
          <div className='flex items-center gap-2'>
            <Icons.sparkles className='size-5 text-indigo-600 dark:text-purple-400' />
            <h1 className='text-xl font-bold uppercase tracking-tight text-foreground'>
              Scenario Simulation Lab &amp; Decision Sandbox
            </h1>
          </div>
          <p className='text-xs text-muted-foreground mt-1'>
            Autonomous Crisis Stress-Testing • Parameterized What-If Modeling • Scipy Response Curve Calibration
          </p>
        </div>

        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-xs'>
            <span className='size-2 rounded-full bg-emerald-500 animate-pulse' />
            <span className='text-muted-foreground'>Status:</span>
            <span className='font-bold text-foreground'>
              {isExecuting ? 'SIMULATING...' : 'READY TO SIMULATE'}
            </span>
          </div>

          <Button
            size='sm'
            onClick={handleRunSimulation}
            disabled={isExecuting}
            className='h-9 px-4 text-xs font-bold uppercase bg-foreground text-background hover:bg-foreground/90 shadow-sm active:scale-[0.98]'
          >
            {isExecuting ? (
              <>
                <Icons.spinner className='mr-1.5 size-3.5 animate-spin' />
                {executionState.toUpperCase().replace('_', ' ')}
              </>
            ) : (
              <>
                <Icons.play className='mr-1.5 size-3.5 text-emerald-500' />
                Run Simulation
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Scenario Selector Navigation Tabs */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
        {(Object.keys(SCENARIO_METAS) as ShockScenarioId[]).map((id) => {
          const s = SCENARIO_METAS[id];
          const isSelected = selectedScenarioId === id;

          return (
            <button
              key={s.id}
              onClick={() => handleSelectScenario(s.id)}
              className={cn(
                'text-left p-3 rounded-xl border transition-all text-xs flex flex-col justify-between gap-1.5',
                isSelected
                  ? 'border-foreground bg-card shadow-sm ring-1 ring-foreground/20'
                  : 'border-border/80 bg-muted/40 text-muted-foreground hover:bg-card hover:border-border hover:text-foreground'
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
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-5'>
        {/* LEFT COLUMN: SCENARIO INPUTS & STRATEGY SELECTION (5 cols) */}
        <div className='lg:col-span-5 space-y-4'>
          {/* Active Scenario Overview Badge */}
          <div className='rounded-xl border border-border/80 bg-card p-4 space-y-2 text-xs'>
            <div className='flex items-center justify-between'>
              <span className='text-[10px] uppercase font-bold text-muted-foreground'>
                Selected Crisis Target
              </span>
              <span className='text-[10px] text-muted-foreground'>
                Response Latency: <strong className='text-foreground'>{scenarioMeta.responseSpeed}</strong>
              </span>
            </div>
            <h3 className='text-sm font-bold text-foreground'>
              {scenarioMeta.title}
            </h3>
            <p className='text-[11px] text-muted-foreground leading-relaxed'>
              {scenarioMeta.eventDescription}
            </p>
          </div>

          {/* Scenario Input Parameter Panel */}
          <ScenarioInputPanel
            scenarioId={selectedScenarioId}
            inputs={inputs}
            onChangeInputs={setInputs}
            onResetBaseline={handleResetBaseline}
          />

          {/* Mitigation Strategy Selector */}
          <StrategySelector
            strategies={strategies}
            selectedStrategyId={selectedStrategyId}
            onSelectStrategy={setSelectedStrategyId}
            inputs={inputs}
            onChangeInputs={setInputs}
          />

          {/* Action Bar */}
          <div className='flex items-center gap-2'>
            <Button
              onClick={handleRunSimulation}
              disabled={isExecuting}
              className='flex-1 h-10 text-xs font-bold uppercase bg-foreground text-background hover:bg-foreground/90'
            >
              {isExecuting ? 'Simulating...' : 'Run Simulation'}
            </Button>
            <Button
              variant='outline'
              onClick={handleSaveRun}
              className='h-10 text-xs font-bold border-border'
              title='Save current experiment'
            >
              <Icons.clipboardText className='size-3.5' />
            </Button>
          </div>

          {/* Saved Experiments Ledger */}
          {savedRuns.length > 0 && (
            <div className='rounded-xl border border-border/80 bg-card p-3.5 space-y-2 text-xs'>
              <div className='text-[10px] uppercase font-bold text-muted-foreground flex items-center justify-between'>
                <span>Saved Comparisons ({savedRuns.length})</span>
                <button
                  onClick={() => setSavedRuns([])}
                  className='text-[9px] text-muted-foreground hover:text-foreground'
                >
                  Clear
                </button>
              </div>
              <div className='space-y-1.5'>
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
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SIMULATION RESULTS & CHARTS (7 cols) */}
        <div className='lg:col-span-7 space-y-4'>
          {/* Financial Impact Hero */}
          <SimulationFinancialImpact result={simulationResult} />

          {/* Recharts Visualizations */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <SimulationImpactChart result={simulationResult} />
            <SimulationLossCurve result={simulationResult} />
          </div>

          {/* Full Metric Results Matrix */}
          <SimulationResultsMatrix result={simulationResult} />

          {/* Strategy Comparison Matrix */}
          <SimulationStrategyComparison
            result={simulationResult}
            onSelectStrategy={setSelectedStrategyId}
          />

          {/* Step-by-Step Causal Chain */}
          <SimulationCausalChain nodes={simulationResult.causalChain} />

          {/* Data Lineage & Audit Trail Seal */}
          <SimulationDataLineage lineage={simulationResult.dataLineage} />
        </div>
      </div>

      {/* Preserve Existing Scenario Controller & Educational Deep-Dive */}
      <div className='pt-6 border-t border-border/80 space-y-4'>
        <div className='flex items-center gap-2'>
          <Icons.terminal className='size-4 text-muted-foreground' />
          <h3 className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
            Integrated Scenario Controller &amp; Ground-Truth Engine
          </h3>
        </div>

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

        {/* Simulator Mechanics Deep-Dive */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 pt-2'>
          <div className='rounded-xl border border-border bg-card p-5 shadow-xs'>
            <h4 className='text-sm font-bold text-foreground mb-2 flex items-center gap-2'>
              <Icons.adjustments className='size-4 text-emerald-600 dark:text-emerald-400' />
              1. Adstock &amp; Saturation
            </h4>
            <p className='text-xs text-muted-foreground leading-relaxed font-sans'>
              Simulates non-linear Hill response curves: <code className='text-emerald-700 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/40 px-1 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50'>r(s) = a * s^b / (c + s^b)</code>. Models diminishing returns on over-scaled channels to calibrate optimizer bounds.
            </p>
          </div>

          <div className='rounded-xl border border-border bg-card p-5 shadow-xs'>
            <h4 className='text-sm font-bold text-foreground mb-2 flex items-center gap-2'>
              <Icons.product className='size-4 text-sky-600 dark:text-cyan-400' />
              2. ERP Inventory Coupling
            </h4>
            <p className='text-xs text-muted-foreground leading-relaxed font-sans'>
              Couples live warehouse inventory with ad network spend. When units hit 0, conversions collapse while ad spend continues unless the autonomous stockout kill-switch triggers.
            </p>
          </div>

          <div className='rounded-xl border border-border bg-card p-5 shadow-xs'>
            <h4 className='text-sm font-bold text-foreground mb-2 flex items-center gap-2'>
              <Icons.check className='size-4 text-indigo-600 dark:text-purple-400' />
              3. Ground-Truth Scoring
            </h4>
            <p className='text-xs text-muted-foreground leading-relaxed font-sans'>
              Every injected anomaly holds a deterministic ground-truth label. The RCA agent explanation is evaluated against exact injected drivers (e.g. stockout vs CPM spike).
            </p>
          </div>
        </div>
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
