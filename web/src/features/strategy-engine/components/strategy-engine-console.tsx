'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CampaignConfig,
  CampaignStrategy,
  BestChoiceExplanation,
  Top3BudgetAllocation,
  HistoricalPerformanceSummary,
  MarketSignal,
  LiveCampaignMonitoring,
  CompletedCampaignResult
} from '@/lib/strategy-engine/types';
import { StrategyCampaignContext } from './strategy-campaign-context';
import { StrategyHeroRecommendation } from './strategy-hero-recommendation';
import { StrategyWhatIf } from './strategy-what-if';
import { StrategyComparisonCards } from './strategy-comparison-cards';
import { StrategyRiskGauge } from './strategy-risk-gauge';
import { StrategyReadyToExecute } from './strategy-ready-to-execute';
import { StrategyEvidenceModal } from './strategy-evidence-modal';

import { CampaignConfigForm } from './campaign-config-form';
import { StrategyGenerationProgress } from './strategy-generation-progress';
import { AllStrategiesTable } from './all-strategies-table';
import { StrategyDetailModal } from './strategy-detail-modal';
import { StrategyComparisonModal } from './strategy-comparison-modal';
import { HistoricalIntelligenceView } from './historical-intelligence-view';
import { BudgetSimulatorView } from './budget-simulator-view';
import { MarketSignalsRiskView } from './market-signals-risk-view';
import { LiveMonitoringView } from './live-monitoring-view';
import { LearningLedgerView } from './learning-ledger-view';
import { CampaignLaunchModal } from './campaign-launch-modal';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  IconCpu,
  IconRefresh,
  IconAlertTriangle,
  IconLayersLinked,
  IconHistory,
  IconCalculator,
  IconShieldCheck,
  IconActivity,
  IconBrain,
  IconX
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export function StrategyEngineConsole() {
  const [campaign, setCampaign] = useState<CampaignConfig | null>(null);
  const [strategies, setStrategies] = useState<CampaignStrategy[]>([]);
  const [top3, setTop3] = useState<CampaignStrategy[]>([]);
  const [bestChoice, setBestChoice] = useState<BestChoiceExplanation | undefined>();
  const [top3BudgetAllocation, setTop3BudgetAllocation] = useState<Top3BudgetAllocation | undefined>();
  const [historicalSummary, setHistoricalSummary] = useState<HistoricalPerformanceSummary | undefined>();
  const [marketSignals, setMarketSignals] = useState<MarketSignal[]>([]);
  const [liveMonitoring, setLiveMonitoring] = useState<LiveCampaignMonitoring | undefined>();
  const [completedHistory, setCompletedHistory] = useState<CompletedCampaignResult[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generationStage, setGenerationStage] = useState<'idle' | 'generating' | 'evaluating' | 'complete'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Active selected strategy in console
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('');

  // What-If simulated budget
  const [simulatedBudget, setSimulatedBudget] = useState<number>(50000);

  // Modals & Secondary Panels
  const [showConfigForm, setShowConfigForm] = useState<boolean>(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState<boolean>(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [isAllStrategiesOpen, setIsAllStrategiesOpen] = useState<boolean>(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState<boolean>(false);
  const [isHistoricalModalOpen, setIsHistoricalModalOpen] = useState<boolean>(false);
  const [isWatchdogModalOpen, setIsWatchdogModalOpen] = useState<boolean>(false);
  const [isLearningModalOpen, setIsLearningModalOpen] = useState<boolean>(false);

  const [inspectedStrategy, setInspectedStrategy] = useState<CampaignStrategy | null>(null);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);

  // Campaign launch authorization modal
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState<boolean>(false);
  const [strategyToLaunch, setStrategyToLaunch] = useState<CampaignStrategy | null>(null);

  // Load default seeded campaign on mount
  useEffect(() => {
    fetchDefaultCampaign();
  }, []);

  const fetchDefaultCampaign = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/campaign-strategy/cmp-nike-pegasus-q4');
      if (res.ok) {
        const data = await res.json();
        setCampaign(data.campaign);
        setStrategies(data.allStrategies);
        setTop3(data.top3Recommendations);
        setBestChoice(data.bestChoice);
        setTop3BudgetAllocation(data.top3BudgetAllocation);
        setHistoricalSummary(data.historicalSummary);
        setMarketSignals(data.marketSignals || []);
        setLiveMonitoring(data.liveMonitoring);
        setCompletedHistory(data.completedHistory || []);

        const initialBestId = data.top3Recommendations[0]?.strategyId || data.allStrategies[0]?.strategyId || '';
        setSelectedStrategyId(initialBestId);
        setSimulatedBudget(data.campaign?.totalBudget || 50000);
      } else {
        const listRes = await fetch('/api/campaign-strategy');
        if (listRes.ok) {
          const listData = await listRes.json();
          if (listData.campaigns && listData.campaigns.length > 0) {
            const firstId = listData.campaigns[0].campaignId;
            const singleRes = await fetch(`/api/campaign-strategy/${firstId}`);
            if (singleRes.ok) {
              const singleData = await singleRes.json();
              setCampaign(singleData.campaign);
              setStrategies(singleData.allStrategies);
              setTop3(singleData.top3Recommendations);
              setBestChoice(singleData.bestChoice);
              setTop3BudgetAllocation(singleData.top3BudgetAllocation);
              setHistoricalSummary(singleData.historicalSummary);
              setMarketSignals(singleData.marketSignals || []);
              setLiveMonitoring(singleData.liveMonitoring);
              setCompletedHistory(singleData.completedHistory || []);

              const initialBestId = singleData.top3Recommendations[0]?.strategyId || singleData.allStrategies[0]?.strategyId || '';
              setSelectedStrategyId(initialBestId);
              setSimulatedBudget(singleData.campaign?.totalBudget || 50000);
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Error fetching campaign:', err);
      setError(err.message || 'Failed to load initial campaign data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCampaign = async (configData: Partial<CampaignConfig>) => {
    try {
      setIsLoading(true);
      setError(null);
      setGenerationStage('generating');

      await new Promise((r) => setTimeout(r, 600));
      setGenerationStage('evaluating');
      await new Promise((r) => setTimeout(r, 500));

      const res = await fetch('/api/campaign-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to generate strategies');
      }

      const data = await res.json();
      const updatedCampaign: CampaignConfig = {
        campaignId: data.campaignId,
        campaignName: data.campaignName,
        productService: configData.productService || '',
        targetAudience: configData.targetAudience || '',
        targetLocation: configData.targetLocation || '',
        industryCategory: configData.industryCategory || '',
        totalBudget: configData.totalBudget || 50000,
        campaignDuration: configData.campaignDuration || 30,
        objective: configData.objective || 'CONVERSIONS',
        preferredPlatforms: configData.preferredPlatforms || ['meta', 'google', 'amazon', 'tiktok']
      };

      setCampaign(updatedCampaign);
      setStrategies(data.allStrategies);
      setTop3(data.top3Recommendations);
      setBestChoice(data.bestChoice);
      setTop3BudgetAllocation(data.top3BudgetAllocation);
      setHistoricalSummary(data.historicalSummary);
      setMarketSignals(data.marketSignals || []);
      setLiveMonitoring(data.liveMonitoring);
      setCompletedHistory(data.completedHistory || []);

      const newBestId = data.top3Recommendations[0]?.strategyId || data.allStrategies[0]?.strategyId || '';
      setSelectedStrategyId(newBestId);
      setSimulatedBudget(updatedCampaign.totalBudget);

      setGenerationStage('complete');
      setShowConfigForm(false);

      toast.success('Generated 24 Candidate Strategies!', {
        description: `Top recommendation selected with ${data.top3Recommendations[0]?.evaluation?.expectedRoas.toFixed(2)}x predicted ROAS.`
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred during strategy generation');
      toast.error('Strategy Generation Failed', { description: err.message });
      setGenerationStage('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCompare = (strategyId: string) => {
    if (selectedCompareIds.includes(strategyId)) {
      setSelectedCompareIds(selectedCompareIds.filter((id) => id !== strategyId));
    } else {
      if (selectedCompareIds.length >= 4) {
        toast.info('Maximum 4 strategies can be compared side-by-side');
        return;
      }
      setSelectedCompareIds([...selectedCompareIds, strategyId]);
      toast.info(`Added ${strategyId} to comparison matrix`);
    }
  };

  const comparedStrategies = strategies.filter((s) => selectedCompareIds.includes(s.strategyId));

  const handleOpenLaunchModal = (strat: CampaignStrategy) => {
    setStrategyToLaunch(strat);
    setIsLaunchModalOpen(true);
  };

  const handleLaunchSuccess = () => {
    toast.success('Strategy Authorized & Launched!', {
      description: 'Campaign execution status is now live in Watchdog telemetry.'
    });
    setIsWatchdogModalOpen(true);
  };

  const handleApplyStrategy = useCallback((strat: CampaignStrategy) => {
    setSelectedStrategyId(strat.strategyId);
    toast.success(`Applied ${strat.strategyName.split('—')[0]} as Active Strategy!`, {
      description: `Targeting updated across ${strat.platform.toUpperCase()} with ₹${strat.budgetAllocation.toLocaleString('en-IN')} allocation.`
    });
  }, []);

  // Active strategy
  const activeStrategy =
    strategies.find((s) => s.strategyId === selectedStrategyId) ||
    top3[0] ||
    strategies[0];

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/50 dark:bg-[#07090e] text-foreground min-h-screen font-mono'>
      {/* 1. MINIMAL HEADER */}
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4'>
        <div>
          <div className='flex items-center gap-2.5'>
            <span className='size-2 rounded-full bg-cyan-400 animate-pulse' />
            <h1 className='text-xl sm:text-2xl font-bold uppercase tracking-tight text-foreground'>
              STRATEGY ENGINE
            </h1>
            <span className='text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-950/30 text-cyan-400'>
              ● AI DECISION CONSOLE
            </span>
          </div>
          <p className='text-xs text-muted-foreground mt-1'>
            AI-powered campaign decisions
          </p>
        </div>

        {/* Right side controls */}
        <div className='flex items-center gap-2.5'>
          <Button
            variant='outline'
            size='sm'
            onClick={fetchDefaultCampaign}
            disabled={isLoading}
            className='text-xs font-mono h-8.5 border-border/80 hover:bg-muted/40'
          >
            <IconRefresh className={cn('size-3.5 mr-1.5', isLoading && 'animate-spin')} />
            Refresh
          </Button>

          <Button
            size='sm'
            onClick={() => setShowConfigForm(!showConfigForm)}
            className='bg-foreground text-background font-mono font-bold text-xs h-8.5 shadow-xs'
          >
            {showConfigForm ? 'Close Setup' : 'New Campaign'}
          </Button>
        </div>
      </div>

      {/* Error Alert if any */}
      {error && (
        <div className='rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs text-rose-300 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <IconAlertTriangle className='size-4 text-rose-400 shrink-0' />
            <span>Error: {error}</span>
          </div>
          <Button
            size='sm'
            variant='outline'
            onClick={fetchDefaultCampaign}
            className='h-7 text-[11px] border-rose-500/40 text-rose-300 hover:bg-rose-500/20'
          >
            Retry
          </Button>
        </div>
      )}

      {/* Generation Progress Indicator */}
      <StrategyGenerationProgress currentStage={generationStage} />

      {/* Campaign Configuration Form (Collapsible) */}
      {showConfigForm && (
        <CampaignConfigForm onSubmit={handleCreateCampaign} isLoading={isLoading} />
      )}

      {/* 2. CAMPAIGN CONTEXT */}
      {campaign && (
        <StrategyCampaignContext
          campaign={campaign}
          onOpenConfigForm={() => setShowConfigForm(true)}
        />
      )}

      {/* 3. HERO RECOMMENDATION & WHY */}
      {activeStrategy && (
        <StrategyHeroRecommendation
          strategy={activeStrategy}
          bestChoice={bestChoice}
          onApplyStrategy={handleApplyStrategy}
          onOpenLaunchModal={handleOpenLaunchModal}
          onOpenEvidenceModal={() => setIsEvidenceModalOpen(true)}
          targetRoasFloor={campaign?.constraints?.targetRoas || 3.2}
        />
      )}

      {/* 4. INTERACTIVE WHAT-IF SANDBOX */}
      {activeStrategy && (
        <StrategyWhatIf
          strategy={activeStrategy}
          currentDailyBudget={campaign?.totalBudget || 50000}
          simulatedBudget={simulatedBudget}
          onBudgetChange={setSimulatedBudget}
          aov={campaign?.productPrice || 4250}
        />
      )}

      {/* 5. STRATEGY COMPARISON (TOP 3 ALTERNATIVES) */}
      {top3 && top3.length > 0 && (
        <StrategyComparisonCards
          top3={top3}
          onSelectStrategy={(strat) => {
            setSelectedStrategyId(strat.strategyId);
            setSimulatedBudget(strat.budgetAllocation);
            toast.info(`Inspecting ${strat.strategyName.split('—')[0]}`);
          }}
          onOpenCompareModal={() => {
            setSelectedCompareIds(top3.map((s) => s.strategyId));
            setIsCompareModalOpen(true);
          }}
          onOpenAllModal={() => setIsAllStrategiesOpen(true)}
          selectedStrategyId={selectedStrategyId}
        />
      )}

      {/* 6. COMPACT RISK GAUGE */}
      {activeStrategy && (
        <StrategyRiskGauge
          riskScore={activeStrategy.evaluation?.riskScore ?? 10}
          confidencePct={Math.round((activeStrategy.evaluation?.confidenceScore ?? 0.94) * 100)}
          risks={activeStrategy.risks}
          onOpenRiskModal={() => setIsRiskModalOpen(true)}
        />
      )}

      {/* 7. EXECUTION PANEL */}
      {activeStrategy && (
        <StrategyReadyToExecute
          strategy={activeStrategy}
          dailyBudget={simulatedBudget}
          onApplyStrategy={handleApplyStrategy}
          onOpenLaunchModal={handleOpenLaunchModal}
        />
      )}

      {/* SECONDARY NAVIGATION ACCESS: Intelligence Drawers */}
      <div className='flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/60 text-xs text-muted-foreground'>
        <span className='font-bold uppercase tracking-wider text-[10px]'>
          SECONDARY INTELLIGENCE &amp; AUDIT DRAWERS:
        </span>

        <div className='flex flex-wrap items-center gap-2'>
          <button
            type='button'
            onClick={() => setIsEvidenceModalOpen(true)}
            className='px-3 py-1.5 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/50 text-foreground transition-colors'
          >
            Evidence &amp; Lineage
          </button>

          <button
            type='button'
            onClick={() => setIsAllStrategiesOpen(true)}
            className='px-3 py-1.5 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/50 text-foreground transition-colors'
          >
            All 24 Strategies
          </button>

          <button
            type='button'
            onClick={() => setIsHistoricalModalOpen(true)}
            className='px-3 py-1.5 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/50 text-foreground transition-colors'
          >
            Historical Intel (32 Runs)
          </button>

          <button
            type='button'
            onClick={() => setIsRiskModalOpen(true)}
            className='px-3 py-1.5 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/50 text-foreground transition-colors'
          >
            Market Signals &amp; Risks
          </button>

          <button
            type='button'
            onClick={() => setIsWatchdogModalOpen(true)}
            className='px-3 py-1.5 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/50 text-foreground transition-colors'
          >
            Live Watchdog
          </button>

          <button
            type='button'
            onClick={() => setIsLearningModalOpen(true)}
            className='px-3 py-1.5 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/50 text-foreground transition-colors'
          >
            Learning Ledger
          </button>
        </div>
      </div>

      {/* ================= MODALS & DRAWERS (Preserving 100% Functionality) ================= */}

      {/* Evidence & Lineage Modal */}
      <StrategyEvidenceModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        strategy={activeStrategy}
        bestChoice={bestChoice}
      />

      {/* All 24 Strategies Modal Drawer */}
      {isAllStrategiesOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in'>
          <div className='relative w-full max-w-6xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden'>
            <div className='flex items-center justify-between border-b border-border/80 px-6 py-4 bg-muted/20'>
              <div>
                <h3 className='text-base font-bold text-foreground'>
                  Candidate Strategy Pool (All 24 Models)
                </h3>
                <p className='text-xs text-muted-foreground'>
                  Full multi-channel generative candidates with individual rankings and rejection rationales
                </p>
              </div>
              <button
                type='button'
                onClick={() => setIsAllStrategiesOpen(false)}
                className='size-8 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors'
              >
                <IconX className='size-4' />
              </button>
            </div>
            <div className='p-6 overflow-y-auto'>
              <AllStrategiesTable
                strategies={strategies}
                onSelectStrategy={(strat) => {
                  setInspectedStrategy(strat);
                  setSelectedStrategyId(strat.strategyId);
                }}
                selectedCompareIds={selectedCompareIds}
                onToggleCompare={handleToggleCompare}
                onOpenCompareModal={() => setIsCompareModalOpen(true)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Historical Intelligence Modal */}
      {isHistoricalModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in'>
          <div className='relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden'>
            <div className='flex items-center justify-between border-b border-border/80 px-6 py-4 bg-muted/20'>
              <h3 className='text-base font-bold text-foreground'>
                Historical Intelligence &amp; Bayesian Calibration (32 Runs)
              </h3>
              <button
                type='button'
                onClick={() => setIsHistoricalModalOpen(false)}
                className='size-8 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors'
              >
                <IconX className='size-4' />
              </button>
            </div>
            <div className='p-6 overflow-y-auto'>
              <HistoricalIntelligenceView summary={historicalSummary} />
            </div>
          </div>
        </div>
      )}

      {/* Market Signals & Risks Modal */}
      {isRiskModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in'>
          <div className='relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden'>
            <div className='flex items-center justify-between border-b border-border/80 px-6 py-4 bg-muted/20'>
              <h3 className='text-base font-bold text-foreground'>
                Market Signals &amp; Risk Contingencies
              </h3>
              <button
                type='button'
                onClick={() => setIsRiskModalOpen(false)}
                className='size-8 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors'
              >
                <IconX className='size-4' />
              </button>
            </div>
            <div className='p-6 overflow-y-auto'>
              <MarketSignalsRiskView signals={marketSignals} strategies={strategies} />
            </div>
          </div>
        </div>
      )}

      {/* Live Watchdog Modal */}
      {isWatchdogModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in'>
          <div className='relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden'>
            <div className='flex items-center justify-between border-b border-border/80 px-6 py-4 bg-muted/20'>
              <h3 className='text-base font-bold text-foreground'>
                Live Campaign Watchdog Telemetry
              </h3>
              <button
                type='button'
                onClick={() => setIsWatchdogModalOpen(false)}
                className='size-8 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors'
              >
                <IconX className='size-4' />
              </button>
            </div>
            <div className='p-6 overflow-y-auto'>
              <LiveMonitoringView monitoring={liveMonitoring} />
            </div>
          </div>
        </div>
      )}

      {/* Learning Ledger Modal */}
      {isLearningModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in'>
          <div className='relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden'>
            <div className='flex items-center justify-between border-b border-border/80 px-6 py-4 bg-muted/20'>
              <h3 className='text-base font-bold text-foreground'>
                Autonomous Learning Ledger
              </h3>
              <button
                type='button'
                onClick={() => setIsLearningModalOpen(false)}
                className='size-8 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors'
              >
                <IconX className='size-4' />
              </button>
            </div>
            <div className='p-6 overflow-y-auto'>
              <LearningLedgerView completedHistory={completedHistory} />
            </div>
          </div>
        </div>
      )}

      {/* Detailed Strategy Sheet / Modal */}
      <StrategyDetailModal
        strategy={inspectedStrategy}
        isOpen={!!inspectedStrategy}
        onClose={() => setInspectedStrategy(null)}
        onToggleCompare={handleToggleCompare}
        isComparing={inspectedStrategy ? selectedCompareIds.includes(inspectedStrategy.strategyId) : false}
      />

      {/* Side-by-side Strategy Comparison Modal */}
      <StrategyComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        strategies={comparedStrategies.length ? comparedStrategies : top3}
        onRemoveStrategy={(id) => setSelectedCompareIds(selectedCompareIds.filter((x) => x !== id))}
      />

      {/* Campaign Launch Authorization Modal (Human-in-the-loop protection) */}
      <CampaignLaunchModal
        isOpen={isLaunchModalOpen}
        onClose={() => setIsLaunchModalOpen(false)}
        strategy={strategyToLaunch}
        budgetAllocation={top3BudgetAllocation}
        onLaunchSuccess={handleLaunchSuccess}
      />
    </div>
  );
}
