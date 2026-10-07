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
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-[#000000] text-white min-h-screen'>
      <div>
        <div className='flex items-center gap-2'>
          <Icons.sparkles className='size-5 text-white' />
          <h1 className='text-xl font-mono font-bold text-white uppercase tracking-tight'>
            Synthetic Simulator &amp; Shock Sandbox
          </h1>
        </div>
        <p className='text-xs font-mono text-[#8A8A8A] mt-1'>
          90-Day Multi-Platform Data Generator • Adstock Decay • Saturation Dynamics • Ground-Truth Anomaly Labels
        </p>
      </div>

      {/* Scenario Selector Navigation Tabs */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
        {(Object.keys(SCENARIO_METAS) as ShockScenarioId[]).map((id) => {
          const s = SCENARIO_METAS[id];
          const isSelected = selectedScenarioId === id;

      {/* Simulator Mechanics Deep-Dive */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='rounded border border-[#8A8A8A] bg-[#1A1A1A] p-5 shadow-none'>
          <h4 className='font-mono text-sm font-bold text-white mb-2 flex items-center gap-2'>
            <Icons.adjustments className='size-4 text-white' />
            1. Adstock &amp; Saturation
          </h4>
          <p className='text-xs text-[#8A8A8A] leading-relaxed font-sans'>
            Simulates non-linear Hill response curves: <code className='text-white font-mono bg-[#000000] px-1 py-0.5 rounded border border-[#8A8A8A]'>r(s) = a * s^b / (c + s^b)</code>. Models diminishing returns on over-scaled channels to calibrate optimizer bounds.
          </p>
        </div>

        <div className='rounded border border-[#8A8A8A] bg-[#1A1A1A] p-5 shadow-none'>
          <h4 className='font-mono text-sm font-bold text-white mb-2 flex items-center gap-2'>
            <Icons.product className='size-4 text-white' />
            2. ERP Inventory Coupling
          </h4>
          <p className='text-xs text-[#8A8A8A] leading-relaxed font-sans'>
            Couples live warehouse inventory with ad network spend. When units hit 0, conversions collapse while ad spend continues unless the autonomous stockout kill-switch triggers.
          </p>
        </div>

        <div className='rounded border border-[#8A8A8A] bg-[#1A1A1A] p-5 shadow-none'>
          <h4 className='font-mono text-sm font-bold text-white mb-2 flex items-center gap-2'>
            <Icons.check className='size-4 text-white' />
            3. Ground-Truth Scoring
          </h4>
          <p className='text-xs text-[#8A8A8A] leading-relaxed font-sans'>
            Every injected anomaly holds a deterministic ground-truth label. The RCA agent explanation is evaluated against exact injected drivers (e.g. stockout vs CPM spike).
          </p>
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
