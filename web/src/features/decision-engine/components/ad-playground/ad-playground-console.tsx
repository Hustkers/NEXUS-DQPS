'use client';

import React, { useState, useTransition } from 'react';
import { Card } from '@/components/ui/card';
import {
  IconCoins,
  IconCpu,
  IconSparkles,
  IconTrendingUp
} from '@tabler/icons-react';
import { PlaygroundProductSelector } from './playground-product-selector';
import { PlaygroundConstraintsPanel } from './playground-constraints-panel';
import { PlaygroundRecommendationsList } from './playground-recommendations-list';
import { PlaygroundComparisonChart } from './playground-comparison-chart';
import { PlaygroundConfigModal } from './playground-config-modal';
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
  const [isPending, startTransition] = useTransition();

  const [products] = useState<PlaygroundProductSummary[]>(() => getPlaygroundProducts());

  const [selectedSku, setSelectedSku] = useState<string>(() => {
    const prods = getPlaygroundProducts();
    return prods.find((p) => p.sku === 'AH8050-100')?.sku || prods[0]?.sku || '310805-137';
  });

  const [constraints, setConstraints] = useState<AdPlaygroundConstraints>(() => ({
    sku: 'AH8050-100',
    total_budget: 5000,
    duration_days: 14,
    target_roas_floor: 1.8,
    platforms: ['meta', 'google', 'amazon', 'tiktok'],
    strategy_focus: 'MAX_PROFIT'
  }));

  const [result, setResult] = useState<AdPlaygroundResult | null>(() => {
    return computePlaygroundRecommendations({
      sku: 'AH8050-100',
      total_budget: 5000,
      duration_days: 14,
      target_roas_floor: 1.8,
      platforms: ['meta', 'google', 'amazon', 'tiktok'],
      strategy_focus: 'MAX_PROFIT'
    });
  });

  const [modalConfig, setModalConfig] = useState<CandidateAdConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'comparison'>('recommendations');

  const handleSelectSku = (sku: string) => {
    setSelectedSku(sku);
    const updated = { ...constraints, sku };
    setConstraints(updated);

    startTransition(() => {
      const res = computePlaygroundRecommendations(updated);
      setResult(res);
      toast.info(`Simulated 10 campaign configurations for SKU ${sku}`);
    });
  };

  const handleRunAnalysis = async () => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/ad-playground', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(constraints)
        });

        if (res.ok) {
          const data = await res.json();
          setResult(data);
          toast.success('Simulation complete: 10 candidate configurations ranked by net profit!');
          return;
        }
      } catch {
        // Fallback
      }

      const fallback = computePlaygroundRecommendations(constraints);
      setResult(fallback);
      toast.success('Simulation complete: 10 candidate configurations evaluated!');
    });
  };

  const topCandidate = result?.candidates[0];

  return (
    <div className='flex flex-col gap-6'>
      {/* Top Hero KPI Bar */}
      {result && topCandidate && (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
          <Card className='p-4 border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-card to-card'>
            <div className='flex items-center justify-between text-muted-foreground text-xs font-mono'>
              <span>Best Expected Profit</span>
              <IconSparkles className='size-4 text-emerald-400' />
            </div>
            <div className='text-2xl font-bold font-mono text-emerald-400 mt-1'>
              ${topCandidate.predicted_net_profit.toLocaleString()}
            </div>
            <p className='text-[10px] font-mono text-muted-foreground mt-0.5'>
              Rank #1 ({topCandidate.platform.toUpperCase()}) over {result.duration_days} days
            </p>
          </Card>

          <Card className='p-4 border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 via-card to-card'>
            <div className='flex items-center justify-between text-muted-foreground text-xs font-mono'>
              <span>Predicted ROAS</span>
              <IconTrendingUp className='size-4 text-cyan-400' />
            </div>
            <div className='text-2xl font-bold font-mono text-cyan-400 mt-1'>
              {topCandidate.predicted_roas.toFixed(2)}x
            </div>
            <p className='text-[10px] font-mono text-muted-foreground mt-0.5'>
              Target floor: {constraints.target_roas_floor.toFixed(1)}x
            </p>
          </Card>

          <Card className='p-4 border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-card to-card'>
            <div className='flex items-center justify-between text-muted-foreground text-xs font-mono'>
              <span>Gross Margin %</span>
              <IconCoins className='size-4 text-purple-400' />
            </div>
            <div className='text-2xl font-bold font-mono text-purple-300 mt-1'>
              {result.gross_margin_pct.toFixed(1)}%
            </div>
            <p className='text-[10px] font-mono text-muted-foreground mt-0.5'>
              Unit COGS: ${(result.price * (1 - result.gross_margin_pct / 100)).toFixed(2)}
            </p>
          </Card>

          <Card className='p-4 border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-card to-card'>
            <div className='flex items-center justify-between text-muted-foreground text-xs font-mono'>
              <span>Warehouse Inventory</span>
              <IconCpu className='size-4 text-amber-400' />
            </div>
            <div className='text-2xl font-bold font-mono text-amber-400 mt-1'>
              {result.inventory.toLocaleString()} pairs
            </div>
            <p className='text-[10px] font-mono text-muted-foreground mt-0.5'>
              {result.inventory > 0 ? 'Fulfillment buffer safe' : 'Critical stockout alert'}
            </p>
          </Card>
        </div>
      )}

      {/* Product Selector */}
      <PlaygroundProductSelector
        products={products}
        selectedSku={selectedSku}
        onSelectSku={handleSelectSku}
      />

      {/* Constraints & Simulation Guardrails */}
      <PlaygroundConstraintsPanel
        constraints={constraints}
        onChangeConstraints={setConstraints}
        onRunAnalysis={handleRunAnalysis}
        isLoading={isPending}
      />

      {/* View Switcher Tabs */}
      <div className='flex items-center justify-between border-b border-border/80 pb-3'>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-3 py-1.5 rounded-md font-mono text-xs font-semibold transition-all ${
              activeTab === 'recommendations'
                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            10 Candidate Recommendations
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 rounded-md font-mono text-xs font-semibold transition-all ${
              activeTab === 'comparison'
                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Profit vs Spend Comparison
          </button>
        </div>

        {result && (
          <span className='text-[11px] font-mono text-muted-foreground'>
            Target SKU: <strong className='text-cyan-400'>{result.sku}</strong> ({result.product_name})
          </span>
        )}
      </div>

      {/* Main Results View */}
      {result && (
        <>
          {activeTab === 'recommendations' ? (
            <PlaygroundRecommendationsList
              candidates={result.candidates}
              onInspectConfig={(cfg) => setModalConfig(cfg)}
            />
          ) : (
            <PlaygroundComparisonChart candidates={result.candidates} />
          )}
        </>
      )}

      {/* Mathematical Drilldown Modal */}
      {result && (
        <PlaygroundConfigModal
          config={modalConfig}
          isOpen={modalConfig !== null}
          onClose={() => setModalConfig(null)}
          productPrice={result.price}
          grossMarginPct={result.gross_margin_pct}
          inventoryUnits={result.inventory}
        />
      )}
    </div>
  );
}
