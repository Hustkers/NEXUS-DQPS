'use client';

import React, { useState, useTransition, useCallback } from 'react';
import {
  IconAdjustments,
  IconPlayerPlay,
  IconSparkles,
  IconTrendingUp,
  IconPackage,
  IconShieldCheck
} from '@tabler/icons-react';
import { PlaygroundCompactProductSelector } from './playground-compact-product-selector';
import { PlaygroundMinimalControls } from './playground-minimal-controls';
import { PlaygroundInteractiveCurve } from './playground-interactive-curve';
import { PlaygroundRecommendationView } from './playground-recommendation-view';
import { PlaygroundModelDetails } from './playground-model-details';
import {
  computePlaygroundRecommendations,
  getPlaygroundProducts
} from '../../lib/ad-playground-engine';
import type {
  AdPlaygroundConstraints,
  AdPlaygroundResult,
  CandidateAdConfig,
  PlaygroundProductSummary
} from '../../types/ad-playground-types';
import { toast } from 'sonner';

export function AdPlaygroundConsole() {
  const [, startTransition] = useTransition();

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

  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationStage, setCalculationStage] = useState<string>('');

  const selectedProduct = products.find((p) => p.sku === selectedSku) || products[0];

  // Dynamic live recalculation when user moves budget slider or modifies dimensions
  const handleConstraintsChange = useCallback((updated: AdPlaygroundConstraints) => {
    setConstraints(updated);
    // Instant mathematical update (zero delay, pure deterministic calculation)
    const newResult = computePlaygroundRecommendations(updated);
    setResult(newResult);
  }, []);

  const handleSelectSku = useCallback((newSku: string) => {
    setSelectedSku(newSku);
    const updated = { ...constraints, sku: newSku };
    setConstraints(updated);
    const newResult = computePlaygroundRecommendations(updated);
    setResult(newResult);
    toast.info(`Loaded catalog model for SKU ${newSku}`);
  }, [constraints]);

  // Deterministic calculation when user explicitly presses [ RUN EXPERIMENT ]
  const handleRunExperiment = useCallback(() => {
    setIsCalculating(true);
    const finalResult = computePlaygroundRecommendations(constraints);
    setResult(finalResult);
    setIsCalculating(false);
    setCalculationStage('');
    toast.success('Simulation complete: Hill response curve & 10 candidates evaluated!');
  }, [constraints]);

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
    const resetResult = computePlaygroundRecommendations(defaultConstraints);
    setResult(resetResult);
    toast.success('Experiment parameters reset to default baseline');
  }, []);

  const isInventoryConstrained = result.candidates[0]?.stockout_risk;

  return (
    <div className='flex flex-col gap-6 font-mono text-foreground'>
      {/* 1. COMPACT HERO SECTION */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4'>
        <div>
          <div className='flex items-center gap-2.5'>
            <span className='size-2 rounded-full bg-cyan-400 animate-pulse' />
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

          <button
            type='button'
            onClick={handleRunExperiment}
            disabled={isCalculating}
            className='px-5 py-2.5 rounded-xl bg-foreground text-background font-bold text-xs uppercase tracking-wider hover:bg-foreground/90 transition-all flex items-center gap-2 shadow-sm shrink-0 disabled:opacity-50'
          >
            <IconPlayerPlay className='size-3.5' />
            <span>{isCalculating ? 'RUNNING EXPERIMENT...' : 'RUN EXPERIMENT'}</span>
          </button>
        </div>
      </div>

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
          />

          {/* Recommended Campaign & Top Alternatives */}
          <PlaygroundRecommendationView
            result={result}
          />

          {/* Technical Model Details & Lineage (Accordion) */}
          <PlaygroundModelDetails
            result={result}
          />
        </div>
      </div>
    </div>
  );
}
