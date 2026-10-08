'use client';

import React, { useState, useEffect } from 'react';
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
import { CampaignConfigForm } from './campaign-config-form';
import { StrategyGenerationProgress } from './strategy-generation-progress';
import { TopRecommendationsView } from './top-recommendations-view';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  IconCpu,
  IconSparkles,
  IconTrendingUp,
  IconLayersLinked,
  IconShieldCheck,
  IconPlus,
  IconRefresh,
  IconAlertTriangle,
  IconChevronDown,
  IconChevronUp,
  IconCrown,
  IconHistory,
  IconScale,
  IconCalculator,
  IconActivity,
  IconBrain
} from '@tabler/icons-react';

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

  const [showConfigForm, setShowConfigForm] = useState<boolean>(false);
  const [inspectedStrategy, setInspectedStrategy] = useState<CampaignStrategy | null>(null);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // Campaign launch authorization modal
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState<boolean>(false);
  const [strategyToLaunch, setStrategyToLaunch] = useState<CampaignStrategy | null>(null);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('recommendations');

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
      setCampaign({
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
      });
      setStrategies(data.allStrategies);
      setTop3(data.top3Recommendations);
      setBestChoice(data.bestChoice);
      setTop3BudgetAllocation(data.top3BudgetAllocation);
      setHistoricalSummary(data.historicalSummary);
      setMarketSignals(data.marketSignals || []);
      setLiveMonitoring(data.liveMonitoring);
      setCompletedHistory(data.completedHistory || []);

      setGenerationStage('complete');
      setShowConfigForm(false);
      setActiveTab('recommendations');

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
    setActiveTab('watchdog');
  };

  // Telemetry KPIs
  const topRoas = top3[0]?.evaluation?.expectedRoas ?? 0;
  const blendedRevenue = top3.reduce((sum, s) => sum + (s.evaluation?.expectedRevenue ?? 0), 0);
  const avgCpa =
    strategies.length > 0
      ? Math.round(
          strategies.reduce((sum, s) => sum + (s.evaluation?.expectedCpa ?? 0), 0) / strategies.length
        )
      : 0;

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-background text-foreground min-h-screen font-mono'>
      {/* Header Banner */}
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4'>
        <div>
          <h1 className='text-xl sm:text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2 font-sans'>
            <IconCpu className='size-5 text-muted-foreground' />
            Strategy Engine
          </h1>
          <p className='text-xs text-muted-foreground mt-1'>
            Omnichannel candidate evaluation, historical calibration, and human-in-the-loop authorization.
          </p>
        </div>

        {/* Action Controls */}
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={fetchDefaultCampaign}
            disabled={isLoading}
            className='text-xs font-mono h-8 border-border hover:bg-muted'
          >
            <IconRefresh className={`size-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            size='sm'
            onClick={() => setShowConfigForm(!showConfigForm)}
            className='bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-mono font-medium text-xs h-8 rounded-md transition-colors'
          >
            {showConfigForm ? (
              <span className='flex items-center gap-1.5'>
                <IconChevronUp className='size-4' /> Hide Setup
              </span>
            ) : (
              <span className='flex items-center gap-1.5'>
                <IconPlus className='size-4' /> New Campaign Setup
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Error Banner with Retry */}
      {error && (
        <div className='rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-mono text-rose-300 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <IconAlertTriangle className='size-4 text-rose-400' />
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

      {/* Campaign Configuration Form (Collapsible / Toggleable) */}
      {showConfigForm && (
        <CampaignConfigForm onSubmit={handleCreateCampaign} isLoading={isLoading} />
      )}

      {/* Active Campaign Telemetry KPI Cards */}
      {campaign && (
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='rounded-xl border border-border/80 bg-card p-4 shadow-2xs'>
            <span className='text-[10px] font-mono uppercase text-muted-foreground tracking-wider block'>
              Target Campaign
            </span>
            <span className='text-sm font-mono font-bold text-foreground truncate block mt-0.5' title={campaign.campaignName}>
              {campaign.campaignName}
            </span>
            <span className='text-[11px] font-mono text-zinc-300 block mt-1'>
              Budget: ${campaign.totalBudget.toLocaleString()} • {campaign.campaignDuration}d
            </span>
          </div>

          <div className='rounded-xl border border-border/80 bg-card p-4 shadow-2xs'>
            <span className='text-[10px] font-mono uppercase text-muted-foreground tracking-wider block'>
              Top Recommended ROAS
            </span>
            <span className='text-2xl font-mono font-bold text-foreground block mt-0.5'>
              {topRoas.toFixed(2)}x
            </span>
            <span className='text-[11px] font-mono text-muted-foreground block mt-1'>
              Outperforming 3.20x target floor
            </span>
          </div>

          <div className='rounded-xl border border-border/80 bg-card p-4 shadow-2xs'>
            <span className='text-[10px] font-mono uppercase text-muted-foreground tracking-wider block'>
              Top 3 Projected Revenue
            </span>
            <span className='text-2xl font-mono font-bold text-foreground block mt-0.5'>
              ${blendedRevenue.toLocaleString()}
            </span>
            <span className='text-[11px] font-mono text-muted-foreground block mt-1'>
              Portfolio gross return
            </span>
          </div>

          <div className='rounded-xl border border-border/80 bg-card p-4 shadow-2xs'>
            <span className='text-[10px] font-mono uppercase text-muted-foreground tracking-wider block'>
              Candidate Strategy Pool
            </span>
            <span className='text-2xl font-mono font-bold text-foreground block mt-0.5'>
              {strategies.length} Distinct
            </span>
            <span className='text-[11px] font-mono text-muted-foreground block mt-1'>
              Avg portfolio CPA: ${avgCpa.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Main Tabbed Command Center Navigation */}
      <Tabs
        defaultValue='recommendations'
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as string)}
        className='space-y-4'
      >
        <div className='overflow-x-auto pb-1'>
          <TabsList className='bg-muted/40 p-1 border border-border/80 rounded-xl h-auto flex flex-wrap gap-1'>
            <TabsTrigger
              value='recommendations'
              className='text-xs font-mono py-1.5 px-3 data-[state=active]:bg-card data-[state=active]:text-amber-400 font-bold flex items-center gap-1.5'
            >
              <IconCrown className='size-3.5' /> Top 3 &amp; Best Choice
            </TabsTrigger>

            <TabsTrigger
              value='historical'
              className='text-xs font-mono py-1.5 px-3 data-[state=active]:bg-card data-[state=active]:text-cyan-400 font-bold flex items-center gap-1.5'
            >
              <IconHistory className='size-3.5' /> Historical Intel (32 Runs)
            </TabsTrigger>

            <TabsTrigger
              value='all_strategies'
              className='text-xs font-mono py-1.5 px-3 data-[state=active]:bg-card data-[state=active]:text-foreground font-bold flex items-center gap-1.5'
            >
              <IconLayersLinked className='size-3.5' /> All 24 Strategies
            </TabsTrigger>

            <TabsTrigger
              value='simulator'
              className='text-xs font-mono py-1.5 px-3 data-[state=active]:bg-card data-[state=active]:text-purple-400 font-bold flex items-center gap-1.5'
            >
              <IconCalculator className='size-3.5' /> Budget &amp; What-If
            </TabsTrigger>

            <TabsTrigger
              value='signals_risks'
              className='text-xs font-mono py-1.5 px-3 data-[state=active]:bg-card data-[state=active]:text-cyan-400 font-bold flex items-center gap-1.5'
            >
              <IconShieldCheck className='size-3.5' /> Market Signals &amp; Risks
            </TabsTrigger>

            <TabsTrigger
              value='watchdog'
              className='text-xs font-mono py-1.5 px-3 data-[state=active]:bg-card data-[state=active]:text-emerald-400 font-bold flex items-center gap-1.5'
            >
              <IconActivity className='size-3.5' /> Live Watchdog
            </TabsTrigger>

            <TabsTrigger
              value='learning'
              className='text-xs font-mono py-1.5 px-3 data-[state=active]:bg-card data-[state=active]:text-purple-400 font-bold flex items-center gap-1.5'
            >
              <IconBrain className='size-3.5' /> Learning Ledger
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Top Recommendations & Best Choice */}
        <TabsContent value='recommendations'>
          <TopRecommendationsView
            top3={top3}
            bestChoice={bestChoice}
            budgetAllocation={top3BudgetAllocation}
            onInspectStrategy={(strat) => setInspectedStrategy(strat)}
            onToggleCompare={handleToggleCompare}
            selectedCompareIds={selectedCompareIds}
            onOpenLaunchModal={handleOpenLaunchModal}
          />
        </TabsContent>

        {/* Tab 2: Historical Campaign Intelligence Layer */}
        <TabsContent value='historical'>
          <HistoricalIntelligenceView summary={historicalSummary} />
        </TabsContent>

        {/* Tab 3: All 24 Strategies Comprehensive Table */}
        <TabsContent value='all_strategies'>
          <AllStrategiesTable
            strategies={strategies}
            onSelectStrategy={(strat) => setInspectedStrategy(strat)}
            selectedCompareIds={selectedCompareIds}
            onToggleCompare={handleToggleCompare}
            onOpenCompareModal={() => setIsCompareModalOpen(true)}
          />
        </TabsContent>

        {/* Tab 4: Budget Simulator & What-If Sandbox */}
        <TabsContent value='simulator'>
          <BudgetSimulatorView strategies={strategies} />
        </TabsContent>

        {/* Tab 5: Market Signals & Future Risk Matrix */}
        <TabsContent value='signals_risks'>
          <MarketSignalsRiskView signals={marketSignals} strategies={strategies} />
        </TabsContent>

        {/* Tab 6: Live Campaign Watchdog */}
        <TabsContent value='watchdog'>
          <LiveMonitoringView monitoring={liveMonitoring} />
        </TabsContent>

        {/* Tab 7: Continuous Learning Ledger */}
        <TabsContent value='learning'>
          <LearningLedgerView completedHistory={completedHistory} />
        </TabsContent>
      </Tabs>

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
        strategies={comparedStrategies}
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
