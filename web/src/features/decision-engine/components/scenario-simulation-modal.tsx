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
import { SimulationFinancialImpact } from './simulation-financial-impact';
import { SimulationImpactChart } from './simulation-impact-chart';
import { SimulationLossCurve } from './simulation-loss-curve';
import { SimulationResultsMatrix } from './simulation-results-matrix';
import { SimulationStrategyComparison } from './simulation-strategy-comparison';
import { SimulationCausalChain } from './simulation-causal-chain';
import { SimulationDataLineage } from './simulation-data-lineage';
import type { ShockScenarioId, ScenarioInputParams, SimulationResult } from '../types/simulation-types';

interface ScenarioSimulationModalProps {
  scenarioId: ShockScenarioId;
  isOpen: boolean;
  onClose: () => void;
  onResetBaseline?: () => void;
  onApplyMitigation?: (result: SimulationResult) => void;
}

type SimStage = 'idle' | 'baseline' | 'shock' | 'propagating' | 'financial' | 'mitigation' | 'recovery' | 'completed';

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

  // Controlled 3-second animated execution state sequence
  const [simStage, setSimStage] = useState<SimStage>('idle');
  const isSimulating = simStage !== 'idle' && simStage !== 'completed';

  // Deterministic simulation calculation
  const simulationResult = useMemo<SimulationResult>(() => {
    return runDeterministicSimulation(scenarioId, inputs, selectedStrategyId);
  }, [scenarioId, inputs, selectedStrategyId]);

  // Sync inputs whenever scenarioId changes
  React.useEffect(() => {
    setInputs(BASELINE_DEFAULTS[scenarioId]);
    const rec = SCENARIO_STRATEGIES[scenarioId]?.find((s) => s.isRecommended)?.id || SCENARIO_STRATEGIES[scenarioId]?.[0]?.id || 'do-nothing';
    setSelectedStrategyId(rec);
    setSimStage('idle');
  }, [scenarioId]);

  // Keyboard accessibility
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const scenarioMeta = SCENARIO_METAS[scenarioId];

  // Controlled multi-phase animation sequence (0s to 3s)
  const handleRunSimulation = () => {
    setSimStage('baseline');
    
    // Check for prefers-reduced-motion
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setSimStage('completed');
      toast.success(`Simulation Completed: ${scenarioMeta.title}`, {
        description: `Applied ${simulationResult.activeStrategyName}. Projected Loss Avoided: +₹${simulationResult.financialImpact.lossAvoided.toLocaleString('en-IN')}.`
      });
      return;
    }

    // Sequence stages
    setTimeout(() => setSimStage('shock'), 500);
    setTimeout(() => setSimStage('propagating'), 1000);
    setTimeout(() => setSimStage('financial'), 1500);
    setTimeout(() => setSimStage('mitigation'), 2000);
    setTimeout(() => setSimStage('recovery'), 2500);
    setTimeout(() => {
      setSimStage('completed');
      toast.success(`Simulation Completed: ${scenarioMeta.title}`, {
        description: `Applied ${simulationResult.activeStrategyName}. Projected Loss Avoided: +₹${simulationResult.financialImpact.lossAvoided.toLocaleString('en-IN')}.`
      });
    }, 3000);
  };

  const handleResetInputs = () => {
    setInputs(BASELINE_DEFAULTS[scenarioId]);
    setSelectedStrategyId(defaultStrategy);
    setSimStage('idle');
    onResetBaseline?.();
    toast.info('Restored Scenario Baseline', {
      description: 'Parameters reset to 90-day canonical baseline.'
    });
  };

  const handleApply = () => {
    onApplyMitigation?.(simulationResult);
    toast.success(`Autonomous Mitigation Dispatched`, {
      description: `Target policy "${simulationResult.activeStrategyName}" engaged for ${scenarioMeta.affectedProductName}.`
    });
    onClose();
  };

  // Stage labels and descriptions for ticker
  const stageLabels: Record<SimStage, { label: string; tone: string; desc: string }> = {
    idle: { label: 'READY TO SIMULATE', tone: 'text-zinc-400 border-zinc-800 bg-zinc-900', desc: 'Select inputs and mitigation strategy to simulate.' },
    baseline: { label: '0.0s: BASELINE TELEMETRY', tone: 'text-zinc-300 border-zinc-700 bg-zinc-900', desc: 'Sampling steady-state daily spend and conversions...' },
    shock: { label: '0.5s: SHOCK DETECTED', tone: 'text-rose-400 border-rose-800 bg-rose-950/40', desc: 'Injecting crisis event into supply-chain ad pipeline...' },
    propagating: { label: '1.0s: PROPAGATING IMPACT', tone: 'text-amber-400 border-amber-800 bg-amber-950/40', desc: 'Traversing DAG causal nodes and adstock decay curves...' },
    financial: { label: '1.5s: FINANCIAL IMPACT CALCULATED', tone: 'text-rose-300 border-rose-800 bg-rose-950/40', desc: 'Quantifying gross revenue bleed and wasted ad budget...' },
    mitigation: { label: '2.0s: MITIGATION APPLIED', tone: 'text-sky-400 border-sky-800 bg-sky-950/40', desc: 'Executing SLSQP allocation reallocation & kill-switch...' },
    recovery: { label: '2.5s: RECOVERY PROJECTED', tone: 'text-emerald-400 border-emerald-800 bg-emerald-950/40', desc: 'Solving recovered margin & break-even ROAS equilibrium...' },
    completed: { label: '3.0s: SIMULATION COMPLETE', tone: 'text-emerald-400 border-emerald-700 bg-emerald-950/60', desc: 'Autonomous strategy evaluated with deterministic proof.' }
  };

  const currentTicker = stageLabels[simStage];

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
        className='my-auto flex w-full max-w-6xl flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6 text-foreground shadow-2xl font-mono'
      >
        {/* HEADER BAR */}
        <header className='flex flex-wrap items-start justify-between gap-3 border-b border-border/80 pb-3.5'>
          <div className='min-w-0 space-y-1'>
            <div className='flex items-center gap-2'>
              <span className='size-2 rounded-full bg-emerald-500 animate-pulse' />
              <Badge
                variant='outline'
                className={cn(
                  'font-mono text-[10px] font-bold uppercase tracking-wider',
                  scenarioMeta.severity === 'CRITICAL' && 'border-rose-500/40 bg-rose-500/10 text-rose-500',
                  scenarioMeta.severity === 'HIGH' && 'border-amber-500/40 bg-amber-500/10 text-amber-500',
                  scenarioMeta.severity === 'MEDIUM' && 'border-sky-500/40 bg-sky-500/10 text-sky-500'
                )}
              >
                {scenarioMeta.severity}
              </Badge>
              <span className='text-[10px] uppercase font-bold text-muted-foreground'>
                {scenarioMeta.tag}
              </span>
            </div>
            <h2 className='text-lg sm:text-xl font-bold uppercase tracking-tight text-foreground'>
              Scenario Simulation Lab — {scenarioMeta.title}
            </h2>
            <p className='text-xs text-muted-foreground max-w-3xl leading-relaxed'>
              {scenarioMeta.eventDescription}
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              variant='outline'
              onClick={handleResetInputs}
              disabled={isSimulating}
              className='h-8 border-border bg-card px-2.5 text-xs text-muted-foreground hover:text-foreground'
            >
              <Icons.clock className='mr-1.5 size-3' />
              Reset Baseline
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

        {/* SIMULATION TICKER & ANIMATED PROGRESS BAR */}
        <div className='rounded-xl border border-border/80 bg-muted/30 p-3 space-y-2'>
          <div className='flex flex-wrap items-center justify-between gap-2 text-xs'>
            <div className='flex items-center gap-2'>
              <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider', currentTicker.tone)}>
                {currentTicker.label}
              </span>
              <span className='text-muted-foreground text-[11px] hidden sm:inline'>
                {currentTicker.desc}
              </span>
            </div>

            <Button
              size='sm'
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className='h-8 px-3 text-xs font-bold uppercase bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98]'
            >
              {isSimulating ? (
                <>
                  <Icons.spinner className='mr-1.5 size-3.5 animate-spin' />
                  Simulating...
                </>
              ) : (
                <>
                  <Icons.play className='mr-1.5 size-3.5 text-emerald-500' />
                  Run Simulation
                </>
              )}
            </Button>
          </div>

          {/* Progress sequence visualizer */}
          <div className='h-1.5 w-full bg-border/60 rounded-full overflow-hidden'>
            <div
              className={cn(
                'h-full transition-all duration-300 rounded-full',
                simStage === 'completed' ? 'bg-emerald-500' : 'bg-primary'
              )}
              style={{
                width:
                  simStage === 'idle'
                    ? '0%'
                    : simStage === 'baseline'
                    ? '15%'
                    : simStage === 'shock'
                    ? '30%'
                    : simStage === 'propagating'
                    ? '48%'
                    : simStage === 'financial'
                    ? '65%'
                    : simStage === 'mitigation'
                    ? '82%'
                    : simStage === 'recovery'
                    ? '95%'
                    : '100%'
              }}
            />
          </div>
        </div>

        {/* MAIN SPLIT WORKSPACE: INPUTS (5 cols) vs RESULTS (7 cols) */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-5'>
          {/* LEFT COLUMN: PARAMETER INPUTS & STRATEGIES */}
          <div className='lg:col-span-5 space-y-4'>
            <ScenarioInputPanel
              scenarioId={scenarioId}
              inputs={inputs}
              onChangeInputs={setInputs}
              onResetBaseline={handleResetInputs}
            />

            <StrategySelector
              strategies={strategies}
              selectedStrategyId={selectedStrategyId}
              onSelectStrategy={setSelectedStrategyId}
              inputs={inputs}
              onChangeInputs={setInputs}
            />

            {/* AUTONOMOUS DECISION RATIONALE CARD */}
            <div className='rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4 space-y-2 text-xs'>
              <div className='flex items-center gap-1.5 font-bold uppercase text-[11px] text-emerald-600 dark:text-emerald-400'>
                <Icons.shieldCheck className='size-3.5' />
                Why NEXUS Chose This Strategy
              </div>
              <p className='text-muted-foreground leading-relaxed text-[11px]'>
                {simulationResult.recommendation.reason}
              </p>
              <div className='flex items-center justify-between pt-2 border-t border-emerald-500/20 text-[10px] text-muted-foreground'>
                <span>Protected Waste: <strong className='text-emerald-600 dark:text-emerald-400'>+₹{simulationResult.financialImpact.lossAvoided.toLocaleString('en-IN')}</strong></span>
                <span>Target ROAS: <strong className='text-foreground'>{simulationResult.mitigated.roas.toFixed(2)}x</strong></span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: FINANCIAL HERO, CHARTS, MATRICES & LINEAGE */}
          <div className='lg:col-span-7 space-y-4'>
            {/* 1. FINANCIAL HERO MATRIX */}
            <SimulationFinancialImpact result={simulationResult} />

            {/* 2. RECHARTS COMPARISON & CUMULATIVE LOSS CURVES */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <SimulationImpactChart result={simulationResult} />
              <SimulationLossCurve result={simulationResult} />
            </div>

            {/* 3. FULL METRIC BREAKDOWN TABLE (Baseline vs Shocked vs Mitigated) */}
            <SimulationResultsMatrix result={simulationResult} />

            {/* 4. STRATEGY COMPARISON MATRIX TABLE */}
            <SimulationStrategyComparison
              result={simulationResult}
              onSelectStrategy={setSelectedStrategyId}
            />

            {/* 5. STEP-BY-STEP CAUSAL PROPAGATION DIAGRAM */}
            <SimulationCausalChain nodes={simulationResult.causalChain} />

            {/* 6. DATA LINEAGE & FORMULA AUDIT TRACE */}
            <SimulationDataLineage lineage={simulationResult.dataLineage} />
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <footer className='flex flex-wrap items-center justify-between gap-3 border-t border-border/80 pt-4'>
          <div className='text-[10px] text-muted-foreground'>
            Deterministic evaluation • 0% random variance • All formulas grounded in engine state.
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
              className='h-8 px-4 text-xs font-bold uppercase bg-emerald-600 hover:bg-emerald-700 text-white'
            >
              <Icons.check className='mr-1.5 size-3.5' />
              Apply Mitigation to Dashboard
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
