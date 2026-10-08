'use client';

import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { AutonomousBudgetEngineHero } from './autonomous-budget-engine-hero';
import { BudgetFlowVisualizer } from './budget-flow-visualizer';
import { LiveWhatIfControlPanel } from './live-what-if-control-panel';
import { CampaignRankingMatrix } from './campaign-ranking-matrix';
import { StrategyOptimizerComparison } from './strategy-optimizer-comparison';
import { DiminishingReturnsCurveModal } from './diminishing-returns-curve-modal';
import { ModelLearningHistorySection } from './model-learning-history-section';
import { RedTeamValidationDrawer } from './red-team-validation-drawer';
import { PortfolioOpportunityMap } from './portfolio-opportunity-map';
import {
  DEFAULT_WHAT_IF_INPUTS,
  optimizeAutonomousBudget
} from '@/lib/autonomous-learning/optimizer-engine';
import type {
  WhatIfScenarioInputs,
  CampaignLearningProfile,
  CreativeFormat,
  AudienceType,
  PlacementType
} from '@/lib/autonomous-learning/types';

export function AutonomousLearningConsole() {
  const [inputs, setInputs] = useState<WhatIfScenarioInputs>(DEFAULT_WHAT_IF_INPUTS);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [isRedTeamOpen, setIsRedTeamOpen] = useState<boolean>(false);
  const [curveModalCampaign, setCurveModalCampaign] = useState<CampaignLearningProfile | null>(null);

  // Pure deterministic mathematical optimization
  const result = useMemo(() => {
    return optimizeAutonomousBudget(inputs);
  }, [inputs]);

  // Selected campaign for deep strategy inspection (defaults to #1 ranked)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    result.campaigns[0]?.id || 'cmp-google-pmax-infinity'
  );

  const activeInspectedCampaign = useMemo(() => {
    return (
      result.campaigns.find((c) => c.id === selectedCampaignId) ||
      result.campaigns[0]
    );
  }, [result.campaigns, selectedCampaignId]);

  // Handle Strategy Parameter Modification
  const handleStrategyChange = (updated: {
    creativeFormat: CreativeFormat;
    audienceType: AudienceType;
    placement: PlacementType;
  }) => {
    toast.success(`Updated Strategy for ${activeInspectedCampaign.name}`, {
      description: `Testing ${updated.creativeFormat.toUpperCase()} creative on ${updated.placement.toUpperCase()}.`
    });
  };

  // Execution Flow
  const handleApplyRecommendation = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      toast.success('Autonomous Optimization Policy Dispatched', {
        description: `Reallocated $${result.totalRecommendedBudget.toLocaleString('en-US')} across 4 channels. Projected +$${Math.round(result.profitImprovementAmount).toLocaleString('en-US')} net profit recorded in Decision Ledger.`
      });
    }, 850);
  };

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen font-mono'>
      {/* 1. MASTER BANNER: Autonomous Budget Engine */}
      <AutonomousBudgetEngineHero
        result={result}
        onApplyRecommendation={handleApplyRecommendation}
        onOpenWhatIf={() => {
          const el = document.getElementById('what-if-panel');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        isApplying={isApplying}
      />

      {/* 2. BUDGET FLOW DIAGRAM: Visual movement of money */}
      <BudgetFlowVisualizer channels={result.channels} />

      {/* 3. LIVE WHAT-IF CONTROLS */}
      <div id='what-if-panel'>
        <LiveWhatIfControlPanel
          inputs={inputs}
          onChangeInputs={setInputs}
          onResetDefaults={() => setInputs(DEFAULT_WHAT_IF_INPUTS)}
        />
      </div>

      {/* 4. CAMPAIGN RANKING & PORTFOLIO MAP SPLIT GRID */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Left Column: Ranked List (7 cols) */}
        <div className='lg:col-span-7'>
          <CampaignRankingMatrix
            campaigns={result.campaigns}
            selectedCampaignId={selectedCampaignId}
            onSelectCampaign={(c) => {
              setSelectedCampaignId(c.id);
              setCurveModalCampaign(c);
            }}
          />
        </div>

        {/* Right Column: Portfolio Opportunity Map (5 cols) */}
        <div className='lg:col-span-5'>
          <PortfolioOpportunityMap
            campaigns={result.campaigns}
            selectedCampaignId={selectedCampaignId}
            onSelectCampaign={(c) => {
              setSelectedCampaignId(c.id);
              setCurveModalCampaign(c);
            }}
          />
        </div>
      </div>

      {/* 5. STRATEGY WHAT-IF OPTIMIZER (Current vs AI Recommended) */}
      <StrategyOptimizerComparison
        campaign={activeInspectedCampaign}
        onChangeStrategy={handleStrategyChange}
      />

      {/* 6. CONTINUOUS MODEL LEARNING & VERIFICATION LOG */}
      <ModelLearningHistorySection />

      {/* 7. RED TEAM VALIDATION CALLOUT BUTTON */}
      <div className='rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 flex flex-wrap items-center justify-between gap-3 text-xs'>
        <div className='flex items-center gap-2'>
          <span className='size-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100' />
          <span className='text-zinc-500'>Guardrail Verification:</span>
          <span className='font-mono font-medium text-zinc-900 dark:text-zinc-100'>
            {result.validationDecision.status === 'PASSED' ? 'PASSED (0 Guardrail Breaches)' : 'CONSTRAINED (Circuit Breaker Active)'}
          </span>
        </div>

        <button
          onClick={() => setIsRedTeamOpen(true)}
          className='text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:underline flex items-center gap-1'
        >
          Inspect Red Team Stress-Test Challenge →
        </button>
      </div>

      {/* Modals & Drawers */}
      {curveModalCampaign && (
        <DiminishingReturnsCurveModal
          campaign={curveModalCampaign}
          isOpen={!!curveModalCampaign}
          onClose={() => setCurveModalCampaign(null)}
        />
      )}

      <RedTeamValidationDrawer
        validation={result.validationDecision}
        isOpen={isRedTeamOpen}
        onClose={() => setIsRedTeamOpen(false)}
        onConfirmApprove={handleApplyRecommendation}
      />
    </div>
  );
}
