'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  IconAdjustments,
  IconPlayerPlay,
  IconCheck,
  IconAlertTriangle,
  IconHistory,
  IconArrowRight
} from '@tabler/icons-react';
import { PlaygroundCompactProductSelector } from './playground-compact-product-selector';
import { PlaygroundMinimalControls } from './playground-minimal-controls';
import { PlaygroundInteractiveCurve, type ExperimentStatus } from './playground-interactive-curve';
import { PlaygroundRecommendationView } from './playground-recommendation-view';
import { PlaygroundModelDetails } from './playground-model-details';
import {
  computePlaygroundRecommendations,
  getPlaygroundProducts
} from '../../lib/ad-playground-engine';
import type {
  AdPlaygroundConstraints,
  AdPlaygroundResult,
  PlaygroundProductSummary
} from '../../types/ad-playground-types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface ExperimentHistoryRecord {
  id: string;
  timestamp: string;
  sku: string;
  productName: string;
  dailyBudget: number;
  predictedRoas: number;
  expectedProfit: number;
  recommendedBudget: number;
  status: 'STOCKOUT' | 'PROFITABLE' | 'UNPROFITABLE';
  config: AdPlaygroundConstraints;
}

export function AdPlaygroundConsole() {
  const [products] = useState<PlaygroundProductSummary[]>(() => getPlaygroundProducts());

  const [selectedSku, setSelectedSku] = useState<string>(() => {
    const prods = getPlaygroundProducts();
    return prods.find((p) => p.sku === '315122-001')?.sku || prods[0]?.sku || '310805-137';
  });

  const [constraints, setConstraints] = useState<AdPlaygroundConstraints>(() => ({
    sku: '315122-001',
    daily_budget: 2000,
    total_budget: 14000,
    duration_days: 7,
    target_roas_floor: 1.8,
    strategy_focus: 'MAX_PROFIT',
    audience: 'broad',
    creative: 'ugc_video',
    placement: 'auto',
    platforms: ['meta', 'google', 'amazon', 'tiktok']
  }));

  const [result, setResult] = useState<AdPlaygroundResult>(() => {
    return computePlaygroundRecommendations({
      sku: '315122-001',
      daily_budget: 2000,
      total_budget: 14000,
      duration_days: 7,
      target_roas_floor: 1.8,
      strategy_focus: 'MAX_PROFIT',
      audience: 'broad',
      creative: 'ugc_video',
      placement: 'auto',
      platforms: ['meta', 'google', 'amazon', 'tiktok']
    });
  });

  const [experimentStatus, setExperimentStatus] = useState<ExperimentStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [calculationStage, setCalculationStage] = useState<string>('');
  const [evaluationSpend, setEvaluationSpend] = useState<number | null>(null);
  const [history, setHistory] = useState<ExperimentHistoryRecord[]>([]);

  const isRunningRef = useRef(false);

  const selectedProduct = products.find((p) => p.sku === selectedSku) || products[0];

  // Update working parameters when user moves sliders or changes dropdowns
  const handleConstraintsChange = useCallback((updated: AdPlaygroundConstraints) => {
    setConstraints(updated);
    setExperimentStatus('idle');
    setErrorMessage(null);
  }, []);

  // When user selects a new product from catalog
  const handleSelectSku = useCallback(
    (newSku: string) => {
      setSelectedSku(newSku);
      const updated = { ...constraints, sku: newSku };
      setConstraints(updated);
      setExperimentStatus('idle');
      setErrorMessage(null);
      // Immediately calculate baseline priors for newly selected SKU
      const newResult = computePlaygroundRecommendations(updated);
      setResult(newResult);
      toast.info(`Loaded catalog priors for SKU ${newSku}`);
    },
    [constraints]
  );

  // Validation function before executing simulation
  const validateConfiguration = useCallback(
    (cfg: AdPlaygroundConstraints): string | null => {
      if (!cfg.sku) {
        return 'Select a valid product SKU from the catalog.';
      }
      const budget = cfg.daily_budget ?? (cfg.total_budget ? Math.round(cfg.total_budget / cfg.duration_days) : 0);
      if (budget < 100 || budget > 25000) {
        return 'Daily budget must be within the allowed range (₹100 – ₹25,000/day).';
      }
      if (!cfg.duration_days || cfg.duration_days < 1) {
        return 'Horizon duration must be at least 1 day.';
      }
      if (!cfg.platforms || cfg.platforms.length === 0) {
        return 'Select at least 1 allowed advertising platform in Advanced Guardrails.';
      }
      if (cfg.target_roas_floor < 1.0) {
        return 'Target ROAS floor must be at least 1.0x.';
      }
      return null;
    },
    []
  );

  // Full asynchronous execution with real engine and visible stage progression
  const handleRunExperiment = useCallback(async () => {
    if (isRunningRef.current || experimentStatus === 'running') {
      return;
    }

    const valError = validateConfiguration(constraints);
    if (valError) {
      setErrorMessage(valError);
      setExperimentStatus('error');
      toast.error(valError);
      return;
    }

    isRunningRef.current = true;
    setExperimentStatus('running');
    setErrorMessage(null);

    const targetBudget = constraints.daily_budget ?? 2000;

    const stages = [
      { label: 'VALIDATING INVENTORY & CATALOG PRIORS...', spend: Math.round(targetBudget * 0.4) },
      { label: 'CALIBRATING HILL SATURATION RESPONSE CURVE...', spend: Math.round(targetBudget * 0.75) },
      { label: 'SIMULATING 10 CROSS-CHANNEL ARCHETYPES...', spend: targetBudget },
      { label: 'APPLYING INVENTORY & ROAS FLOOR GUARDRAILS...', spend: Math.round(targetBudget * 1.2) },
      { label: 'IDENTIFYING OPTIMAL YIELD FRONTIER...', spend: targetBudget }
    ];

    try {
      // 1. Initiate real calculation in background
      let finalResult: AdPlaygroundResult;
      try {
        const response = await fetch('/api/ad-playground', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(constraints)
        });
        if (response.ok) {
          finalResult = await response.json();
        } else {
          finalResult = computePlaygroundRecommendations(constraints);
        }
      } catch {
        finalResult = computePlaygroundRecommendations(constraints);
      }

      // 2. Visually step through simulation telemetry stages
      for (let i = 0; i < stages.length; i++) {
        setCalculationStage(stages[i].label);
        setEvaluationSpend(stages[i].spend);
        await new Promise((resolve) => setTimeout(resolve, 220));
      }

      // 3. Commit genuine result to state
      setResult(finalResult);
      setExperimentStatus('success');
      setCalculationStage('');
      setEvaluationSpend(null);

      // 4. Record session history
      const best = finalResult.candidates[0];
      const isStockout = finalResult.inventory <= 0;
      const historyItem: ExperimentHistoryRecord = {
        id: `exp-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        sku: finalResult.sku,
        productName: finalResult.product_name,
        dailyBudget: finalResult.daily_budget,
        predictedRoas: isStockout ? 0 : (best?.predicted_roas ?? 0),
        expectedProfit: isStockout ? 0 : (best?.predicted_net_profit ?? 0),
        recommendedBudget: isStockout ? 0 : (finalResult.optimal_daily_spend ?? 0),
        status: isStockout ? 'STOCKOUT' : (best?.predicted_net_profit ?? 0) > 0 ? 'PROFITABLE' : 'UNPROFITABLE',
        config: { ...constraints }
      };

      setHistory((prev) => [historyItem, ...prev.slice(0, 4)]);

      if (isStockout) {
        toast.warning('Experiment complete: Zero warehouse stock detected. Enforcing ₹0 stockout defense.');
      } else {
        toast.success('Simulation complete: Hill response curve & 10 candidate configs evaluated!');
      }
    } catch (err) {
      setExperimentStatus('error');
      const msg = err instanceof Error ? err.message : 'Failed to execute experiment simulation.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      isRunningRef.current = false;
      setCalculationStage('');
      setEvaluationSpend(null);
    }
  }, [constraints, experimentStatus, validateConfiguration]);

  // Reset experiment to default initial state
  const handleResetExperiment = useCallback(() => {
    const defaultSku = '315122-001';
    const defaultConstraints: AdPlaygroundConstraints = {
      sku: defaultSku,
      daily_budget: 2000,
      total_budget: 14000,
      duration_days: 7,
      target_roas_floor: 1.8,
      strategy_focus: 'MAX_PROFIT',
      audience: 'broad',
      creative: 'ugc_video',
      placement: 'auto',
      platforms: ['meta', 'google', 'amazon', 'tiktok']
    };
    setSelectedSku(defaultSku);
    setConstraints(defaultConstraints);
    setExperimentStatus('idle');
    setErrorMessage(null);
    const resetResult = computePlaygroundRecommendations(defaultConstraints);
    setResult(resetResult);
    toast.success('Experiment parameters reset to default baseline');
  }, []);

  // Restore past session experiment
  const handleLoadHistory = useCallback((item: ExperimentHistoryRecord) => {
    setSelectedSku(item.config.sku);
    setConstraints(item.config);
    const loadedResult = computePlaygroundRecommendations(item.config);
    setResult(loadedResult);
    setExperimentStatus('success');
    setErrorMessage(null);
    toast.info(`Restored experiment run from ${item.timestamp}`);
  }, []);

  const isInventoryConstrained = result.candidates[0]?.stockout_risk;
  const isCalculating = experimentStatus === 'running';

  // Render header Run Experiment button
  const renderHeaderButton = () => {
    if (isCalculating) {
      return (
        <button
          type='button'
          disabled
          className='px-5 py-2.5 rounded-xl bg-foreground/80 text-background font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm shrink-0 cursor-not-allowed opacity-90'
        >
          <span className='size-3.5 border-2 border-background border-t-transparent rounded-full animate-spin' />
          <span>RUNNING EXPERIMENT...</span>
        </button>
      );
    }

    if (experimentStatus === 'success') {
      return (
        <button
          type='button'
          onClick={handleRunExperiment}
          className='px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-sm shrink-0 ring-2 ring-emerald-500/50 active:scale-95'
        >
          <IconCheck className='size-3.5 stroke-[3]' />
          <span>EXPERIMENT COMPLETE</span>
        </button>
      );
    }

    if (experimentStatus === 'error') {
      return (
        <button
          type='button'
          onClick={handleRunExperiment}
          className='px-5 py-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs uppercase tracking-wider hover:bg-rose-600 transition-all flex items-center gap-2 shadow-sm shrink-0 ring-2 ring-rose-500/40 active:scale-95'
        >
          <IconAlertTriangle className='size-3.5' />
          <span>RETRY EXPERIMENT</span>
        </button>
      );
    }

    return (
      <button
        type='button'
        onClick={handleRunExperiment}
        className='px-5 py-2.5 rounded-xl bg-foreground text-background font-bold text-xs uppercase tracking-wider hover:bg-foreground/90 transition-all flex items-center gap-2 shadow-sm shrink-0 active:scale-95'
      >
        <IconPlayerPlay className='size-3.5 fill-current' />
        <span>RUN EXPERIMENT</span>
      </button>
    );
  };

  return (
    <div className='flex flex-col gap-6 font-mono text-foreground'>
      {/* 1. COMPACT HERO SECTION */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4'>
        <div>
          <div className='flex items-center gap-2.5'>
            <span
              className={cn(
                'size-2 rounded-full',
                isCalculating
                  ? 'bg-amber-400 animate-ping'
                  : experimentStatus === 'success'
                    ? 'bg-emerald-400'
                    : 'bg-cyan-400 animate-pulse'
              )}
            />
            <h1 className='text-xl sm:text-2xl font-bold uppercase tracking-tight text-foreground'>
              AD PLAYGROUND
            </h1>
            <span className='text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-950/30 text-cyan-400'>
              ● LIVE OPTIMIZER
            </span>
          </div>
          <p className='text-xs text-muted-foreground mt-1'>
            Design a campaign. See what happens.
          </p>
        </div>

        {/* Primary CTAs in header */}
        <div className='flex items-center gap-2.5'>
          <button
            type='button'
            onClick={handleResetExperiment}
            disabled={isCalculating}
            className='px-3.5 py-2.5 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50'
            title='Reset experiment to initial default parameters'
          >
            <IconAdjustments className='size-3.5' />
            <span>RESET EXPERIMENT</span>
          </button>

          {renderHeaderButton()}
        </div>
      </div>

      {/* Inline Validation Alert if active */}
      {errorMessage && (
        <div className='p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between gap-3 animate-in fade-in-0 duration-150'>
          <div className='flex items-center gap-2'>
            <IconAlertTriangle className='size-4 shrink-0' />
            <span>{errorMessage}</span>
          </div>
          <button
            type='button'
            onClick={handleRunExperiment}
            className='px-3 py-1.5 rounded-lg bg-rose-500 text-white font-bold text-xs uppercase hover:bg-rose-600 transition-all shrink-0'
          >
            Retry Experiment
          </button>
        </div>
      )}

      {/* 2. MAIN 2-COLUMN EXPERIMENT WORKBENCH */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
        {/* LEFT COLUMN: Product & Campaign Configuration (lg:col-span-5) */}
        <div className='lg:col-span-5 space-y-5'>
          {/* Product Selection */}
          <PlaygroundCompactProductSelector
            products={products}
            selectedProduct={selectedProduct}
            onSelectSku={handleSelectSku}
            isInventoryConstrained={isInventoryConstrained}
          />

          {/* Campaign Controls */}
          <PlaygroundMinimalControls
            constraints={constraints}
            onChangeConstraints={handleConstraintsChange}
            onRunExperiment={handleRunExperiment}
            isCalculating={isCalculating}
          />
        </div>

        {/* RIGHT COLUMN: Response Curve Centerpiece & Candidates (lg:col-span-7) */}
        <div className='lg:col-span-7 space-y-5'>
          {/* Response Curve & 3 Key Metrics */}
          <PlaygroundInteractiveCurve
            result={result}
            onRunExperiment={handleRunExperiment}
            isCalculating={isCalculating}
            calculationStage={calculationStage}
            experimentStatus={experimentStatus}
            errorMessage={errorMessage}
            evaluationSpend={evaluationSpend}
          />

          {/* Recommended Campaign & Top Alternatives */}
          <PlaygroundRecommendationView result={result} />

          {/* Technical Model Details & Lineage (Accordion) */}
          <PlaygroundModelDetails result={result} />

          {/* Compact Session Experiment History */}
          {history.length > 0 && (
            <div className='rounded-2xl border border-border/80 bg-card p-4 space-y-3 font-mono'>
              <div className='flex items-center justify-between pb-2 border-b border-border/60'>
                <span className='text-[10px] uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-1.5'>
                  <IconHistory className='size-3.5 text-cyan-400' />
                  SESSION EXPERIMENT HISTORY ({history.length})
                </span>
                <span className='text-[10px] text-muted-foreground'>
                  Click any run to reload configuration
                </span>
              </div>

              <div className='space-y-2'>
                {history.map((item) => (
                  <button
                    key={item.id}
                    type='button'
                    onClick={() => handleLoadHistory(item)}
                    className='w-full flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20 hover:border-cyan-500/40 hover:bg-muted/40 transition-all cursor-pointer text-xs group text-left'
                  >
                    <div className='flex items-center gap-2.5 min-w-0'>
                      <span className='text-[10px] text-muted-foreground shrink-0'>
                        {item.timestamp}
                      </span>
                      <span className='font-bold text-foreground truncate group-hover:text-cyan-400 transition-colors'>
                        {item.productName}
                      </span>
                    </div>

                    <div className='flex items-center gap-3 shrink-0'>
                      <span className='text-muted-foreground hidden sm:block'>
                        ₹{item.dailyBudget.toLocaleString()}/day
                      </span>
                      <span className='font-bold text-cyan-400'>
                        {item.predictedRoas.toFixed(2)}x
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded uppercase border',
                          item.status === 'STOCKOUT'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : item.status === 'PROFITABLE'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        )}
                      >
                        {item.status}
                      </span>
                      <IconArrowRight className='size-3 text-muted-foreground group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all' />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
