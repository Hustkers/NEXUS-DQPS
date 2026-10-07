'use client';

import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { AutonomousBudgetEngineHero } from './autonomous-budget-engine-hero';
import { BudgetFlowVisualizer } from './budget-flow-visualizer';
import { BudgetResponseCurvePanel } from './budget-response-curve-panel';
import { LiveWhatIfControlPanel } from './live-what-if-control-panel';
import { CampaignDecisionCockpit } from './campaign-decision-cockpit';
import { ModelLearningHistorySection } from './model-learning-history-section';
import { RedTeamValidationDrawer } from './red-team-validation-drawer';
import { DiminishingReturnsCurveModal } from './diminishing-returns-curve-modal';
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
        description: `Reallocated ₹${(result.totalRecommendedBudget / 100000).toFixed(2)}L across 4 channels. Expected +₹${Math.round(result.profitImprovementAmount).toLocaleString('en-IN')} net profit recorded in Decision Ledger.`
      });
    }, 850);
  };

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/50 dark:bg-[#07090e] text-foreground min-h-screen font-mono min-w-0 max-w-full'>
      {/* 1. DECISION HEADER & PRIMARY KPIS */}
      <AutonomousBudgetEngineHero
        result={result}
        onApplyRecommendation={handleApplyRecommendation}
        onOpenWhatIf={() => {
          const el = document.getElementById('what-if-panel');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        isApplying={isApplying}
      />

      {/* 2. CAPITAL REALLOCATION & FLOW VISUALIZER */}
      <BudgetFlowVisualizer channels={result.channels} />

      {/* 3. BUDGET VS PROFIT RESPONSE CURVE (HILL SATURATION) */}
      <BudgetResponseCurvePanel
        result={result}
        selectedCampaignId={selectedCampaignId}
        onSelectCampaign={(c) => {
          setSelectedCampaignId(c.id);
        }}
      />

      {/* 4. SCENARIO ASSUMPTION CONTROLS */}
      <div id='what-if-panel'>
        <LiveWhatIfControlPanel
          inputs={inputs}
          onChangeInputs={setInputs}
          onResetDefaults={() => setInputs(DEFAULT_WHAT_IF_INPUTS)}
        />
      </div>

      {/* 5. CONSOLIDATED CAMPAIGN TARGETING & STRATEGY COCKPIT */}
      <CampaignDecisionCockpit
        campaigns={result.campaigns}
        selectedCampaign={activeInspectedCampaign}
        onSelectCampaign={(c) => {
          setSelectedCampaignId(c.id);
        }}
        onChangeStrategy={handleStrategyChange}
      />

      {/* 6. PREDICTED VS ACTUAL PERFORMANCE & MODEL LEARNING */}
      <ModelLearningHistorySection
        onOpenRedTeam={() => setIsRedTeamOpen(true)}
      />

      {/* Deep Inspection Drawers / Modals (Progressive Disclosure) */}
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
      />
    </div>
  );
}
