'use client';

import React, { useState, useMemo } from 'react';
import {
  IconCpu,
  IconTrendingUp,
  IconChartPie,
  IconChartBar,
  IconGitFork,
  IconArrowRight,
  IconSparkles,
  IconPlayerPlay
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import type { RLOptimizationResult, RegionalRLState } from '@/lib/rl-ad-optimizer';

interface RLVisualAnalyticsProps {
  data: RLOptimizationResult;
  onApplyAction?: (actionText: string) => void;
  className?: string;
  selectedRegionId?: string | null;
  onSelectRegion?: (id: string | null) => void;
}

function computeNiceYAxis(learningCurve: { rlPolicyProfit: number; baselineProfit: number }[]) {
  if (!learningCurve || !learningCurve.length) {
    return { ticks: [0, 1000, 2000], domain: [0, 2000] as [number, number] };
  }
  let minVal = Infinity;
  let maxVal = -Infinity;
  for (const pt of learningCurve) {
    const lo = Math.min(pt.rlPolicyProfit, pt.baselineProfit);
    const hi = Math.max(pt.rlPolicyProfit, pt.baselineProfit);
    if (lo < minVal) minVal = lo;
    if (hi > maxVal) maxVal = hi;
  }
  const span = Math.max(10, maxVal - minVal);
  const rawMin = Math.max(0, minVal - span * 0.15);
  const rawMax = maxVal + span * 0.30;
  const targetTicks = 5;
  const roughStep = (rawMax - rawMin) / targetTicks;
  const power = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const fraction = roughStep / power;
  let niceFraction = 1;
  if (fraction < 1.5) niceFraction = 1;
  else if (fraction < 2.25) niceFraction = 2;
  else if (fraction < 3.5) niceFraction = 2.5;
  else if (fraction < 7.5) niceFraction = 5;
  else niceFraction = 10;
  const step = niceFraction * power;
  const start = Math.max(0, Math.floor(rawMin / step) * step);
  const end = Math.ceil(rawMax / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step * 0.1; v += step) {
    ticks.push(Math.round(v));
  }
  return {
    ticks,
    domain: [ticks[0] ?? 0, ticks[ticks.length - 1] ?? rawMax] as [number, number]
  };
}

interface CustomConvergenceTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload?: {
      episode: number;
      rlPolicyProfit: number;
      baselineProfit: number;
    };
  }>;
}

interface CustomBarTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload?: {
      region: string;
      conversionProbabilityPct: number;
      projectedProfitLift: number;
      adDisplayAction: string;
      spendDelta: number;
    };
  }>;
}

interface CustomLabelProps {
  x?: string | number;
  y?: string | number;
  index?: number;
  value?: unknown;
  stroke?: string;
}

function CustomConvergenceTooltip({ active, payload }: CustomConvergenceTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const dataPoint = payload[0]?.payload;
  if (!dataPoint) return null;
  const { episode, rlPolicyProfit, baselineProfit } = dataPoint;
  const diff = rlPolicyProfit - baselineProfit;
  const diffSign = diff > 0 ? '+' : diff < 0 ? '-' : '';

  return (
    <div className='rounded-lg border border-zinc-800 bg-zinc-950/95 p-3 shadow-xl text-xs'>
      <div className='font-semibold text-zinc-200 pb-1.5 mb-1.5 border-b border-zinc-800/80'>
        Episode {episode}
      </div>
      <div className='space-y-1.5'>
        <div className='flex items-center justify-between gap-5'>
          <span className='flex items-center gap-1.5 text-zinc-400'>
            <span className='size-2 rounded-full bg-emerald-500' />
            RL profit:
          </span>
          <span className='font-semibold text-zinc-100 tabular-nums'>
            ${rlPolicyProfit.toLocaleString()}
          </span>
        </div>
        <div className='flex items-center justify-between gap-5'>
          <span className='flex items-center gap-1.5 text-zinc-400'>
            <span className='size-2 rounded-full bg-zinc-500' />
            Baseline:
          </span>
          <span className='font-semibold text-zinc-400 tabular-nums'>
            ${baselineProfit.toLocaleString()}
          </span>
        </div>
        <div className='flex items-center justify-between gap-5 pt-1.5 border-t border-zinc-800/60'>
          <span className='text-zinc-400'>Difference:</span>
          <span className={cn('font-semibold tabular-nums', diff >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
            {diffSign}${Math.abs(diff).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function CustomBarTooltip({ active, payload }: CustomBarTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className='rounded-lg border border-zinc-800 bg-zinc-950/95 p-3 shadow-xl text-xs'>
      <div className='font-semibold text-zinc-200 pb-1.5 mb-1.5 border-b border-zinc-800/80'>
        {item.region}
      </div>
      <div className='space-y-1.5'>
        <div className='flex items-center justify-between gap-5'>
          <span className='flex items-center gap-1.5 text-zinc-400'>
            <span className='size-2 rounded-full bg-rose-500' />
            Conversion probability:
          </span>
          <span className='font-semibold text-zinc-100 tabular-nums'>
            {item.conversionProbabilityPct}%
          </span>
        </div>
        <div className='flex items-center justify-between gap-5'>
          <span className='flex items-center gap-1.5 text-zinc-400'>
            <span className='size-2 rounded-full bg-emerald-500' />
            Expected margin index:
          </span>
          <span className='font-semibold text-zinc-100 tabular-nums'>
            {item.projectedProfitLift} pts
          </span>
        </div>
      </div>
    </div>
  );
}

function getActionBadge(action: RegionalRLState['rlAction']) {
  switch (action) {
    case 'BOOST_ADS':
      return {
        label: 'Spend more',
        dotColor: 'bg-emerald-400',
        className: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
      };
    case 'EXPAND_ADS':
      return {
        label: 'Expand',
        dotColor: 'bg-emerald-400',
        className: 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300'
      };
    case 'MAINTAIN':
      return {
        label: 'Hold and test',
        dotColor: 'bg-amber-400',
        className: 'border-amber-500/40 bg-amber-950/40 text-amber-300'
      };
    case 'SCALE_DOWN':
      return {
        label: 'Cut spend',
        dotColor: 'bg-rose-400',
        className: 'border-rose-500/40 bg-rose-950/40 text-rose-300'
      };
    case 'SUPPRESS_ADS':
      return {
        label: 'Pause ads',
        dotColor: 'bg-rose-400',
        className: 'border-rose-500/40 bg-rose-950/40 text-rose-300'
      };
    default:
      return {
        label: 'Hold and test',
        dotColor: 'bg-zinc-400',
        className: 'border-zinc-800 bg-zinc-900 text-zinc-400'
      };
  }
}

export function RLVisualAnalytics({
  data,
  onApplyAction: _onApplyAction,
  className,
  selectedRegionId: _selectedRegionId,
  onSelectRegion: _onSelectRegion
}: RLVisualAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'flowchart' | 'graphs' | 'pie' | 'bars' | 'all'>('all');
  const [pieMode, setPieMode] = useState<'post' | 'pre'>('post');
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainStep, setRetrainStep] = useState(24);

  const prefersReducedMotion = React.useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {};
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      mq.addEventListener?.('change', onStoreChange);
      return () => mq.removeEventListener?.('change', onStoreChange);
    },
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false
  );

  const isSmallScreen = React.useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {};
      const mq = window.matchMedia('(max-width: 639px)');
      mq.addEventListener?.('change', onStoreChange);
      return () => mq.removeEventListener?.('change', onStoreChange);
    },
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches,
    () => false
  );

  const isAnimationActive = !prefersReducedMotion;

  const handleRetrain = () => {
    setIsRetraining(true);
    setRetrainStep(1);
    let step = 1;
    const interval = setInterval(() => {
      step += 3;
      if (step >= 24) {
        clearInterval(interval);
        setRetrainStep(24);
        setIsRetraining(false);
      } else {
        setRetrainStep(step);
      }
    }, 80);
  };

  const filteredLearningCurve = useMemo(
    () => data.learningCurve.slice(0, retrainStep),
    [data.learningCurve, retrainStep]
  );

  const chartData = useMemo(() => {
    return filteredLearningCurve.map(d => ({
      ...d,
      gapRange: [Math.min(d.baselineProfit, d.rlPolicyProfit), Math.max(d.baselineProfit, d.rlPolicyProfit)] as [number, number]
    }));
  }, [filteredLearningCurve]);

  // Compute Y-axis domain from the FULL learning curve so it never jumps during retraining
  const yAxisConfig = useMemo(
    () => computeNiceYAxis(data.learningCurve),
    [data.learningCurve]
  );

  const settleEpisode = useMemo(
    () => data.learningCurve.find(d => d.explorationRate <= 0.10)?.episode,
    [data.learningCurve]
  );
  const showSettleLine = settleEpisode !== undefined && settleEpisode <= retrainStep;

  // Deriving regional states data without hardcoding
  const usState = data.regionalStates.find(r => r.countryCode === 'US');
  const euState = data.regionalStates.find(r => r.countryCode === 'EU');
  const latamState = data.regionalStates.find(r => r.countryCode === 'LATAM');
  const seaState = data.regionalStates.find(r => r.countryCode === 'SEA');

  const formatProb = (st?: typeof usState) => st ? `${Math.round(st.conversionProbability * 100)}%` : '0%';
  const formatDelta = (st?: typeof usState) => {
    if (!st) return '0%';
    return st.spendDeltaPct > 0 ? `+${st.spendDeltaPct}%` : `${st.spendDeltaPct}%`;
  };
  const isAllStockoutSuppressed = data.regionalStates.length > 0 && data.regionalStates.every(r => r.rlAction === 'SUPPRESS_ADS');

  // Donut center share: largest region's share for current mode
  const donutCenterShare = useMemo(() => {
    if (!data.spendDistribution || data.spendDistribution.length === 0) return 0;
    if (pieMode === 'post') {
      return Math.max(0, ...data.spendDistribution.map(d => d.postRlShare));
    }
    return Math.max(0, ...data.spendDistribution.map(d => d.preRlShare));
  }, [data.spendDistribution, pieMode]);

  // Pie footer sentence calculated dynamically from data
  const pieFooterText = useMemo(() => {
    if (pieMode === 'post') {
      if (isAllStockoutSuppressed) {
        return 'Ads are paused in every region until stock returns.';
      }

      const topRegion = data.spendDistribution.reduce(
        (max, curr) => curr.postRlShare > (max?.postRlShare ?? -1) ? curr : max,
        data.spendDistribution[0]
      );
      const topRegionName = topRegion?.region || 'North America';
      const topShare = topRegion?.postRlShare ?? 0;

      const lowProbRegionNames = new Set(
        data.regionalStates
          .filter(r => r.conversionProbability < 0.35)
          .map(r => r.region.split(' (')[0])
      );
      const lowProbDist = data.spendDistribution.filter(d => lowProbRegionNames.has(d.region));
      const lowShares = lowProbDist.map(d => d.postRlShare);
      const minShare = lowShares.length > 0 ? Math.min(...lowShares) : 0;
      const maxShare = lowShares.length > 0 ? Math.max(...lowShares) : 0;

      return `${topRegionName} gets ${topShare}% of the budget. Low-converting regions drop to ${minShare}-${maxShare}%.`;
    }

    // Pre-RL mode
    const lowProbRegionNames = new Set(
      data.regionalStates
        .filter(r => r.conversionProbability < 0.35)
        .map(r => r.region.split(' (')[0])
    );
    const lowProbDist = data.spendDistribution.filter(d => lowProbRegionNames.has(d.region));
    const preSum = lowProbDist.reduce((acc, curr) => acc + curr.preRlShare, 0);

    return `${preSum}% of the daily budget goes to regions that rarely convert.`;
  }, [pieMode, isAllStockoutSuppressed, data.spendDistribution, data.regionalStates]);

  const renderRlLabel = (props: CustomLabelProps) => {
    const { x, y, index } = props;
    const numX = typeof x === 'number' ? x : Number(x);
    const numY = typeof y === 'number' ? y : Number(y);
    if (isNaN(numX) || isNaN(numY) || typeof index !== 'number') return null;
    if (index !== chartData.length - 1) return null;
    const currentItem = chartData[index];
    if (!currentItem) return null;
    const diff = currentItem.rlPolicyProfit - currentItem.baselineProfit;
    const diffText = `${diff >= 0 ? '+' : '-'}$${Math.abs(diff).toLocaleString()} vs baseline`;

    return (
      <g key={`rl-label-${index}`}>
        {/* End callout pill above the last RL point */}
        <g transform={`translate(${numX}, ${numY - 26})`}>
          <rect
            x={-70}
            y={-12}
            width={140}
            height={24}
            rx={12}
            fill='#022c22'
            stroke='#059669'
            strokeWidth={1}
            strokeOpacity={0.7}
          />
          <text
            x={0}
            y={4}
            fill='#34d399'
            fontSize={12}
            fontWeight={600}
            textAnchor='middle'
          >
            {diffText}
          </text>
        </g>
        {/* Direct line label */}
        <text
          x={numX + 10}
          y={numY + 4}
          fill='#10b981'
          fontSize={12}
          fontWeight={600}
          textAnchor='start'
        >
          RL policy
        </text>
      </g>
    );
  };

  const renderBaselineLabel = (props: CustomLabelProps) => {
    const { x, y, index } = props;
    const numX = typeof x === 'number' ? x : Number(x);
    const numY = typeof y === 'number' ? y : Number(y);
    if (isNaN(numX) || isNaN(numY) || typeof index !== 'number') return null;
    if (index !== chartData.length - 1) return null;
    return (
      <text
        key={`baseline-label-${index}`}
        x={numX + 10}
        y={numY + 4}
        fill='#a1a1aa'
        fontSize={12}
        fontWeight={500}
        textAnchor='start'
      >
        Baseline
      </text>
    );
  };

  return (
    <div className={cn('flex flex-col space-y-5 text-zinc-100', className)}>
      {/* Top Banner: RL Agent Summary & Navigation Tabs */}
      <div className='flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 shadow-md'>
        <div className='flex items-center gap-3'>
          <div className='size-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300'>
            <IconCpu className='size-5' />
          </div>
          <div>
            <h4 className='text-sm font-semibold text-zinc-100'>
              Reinforcement learning ad allocation agent
            </h4>
            <p className='text-xs text-zinc-400 mt-0.5'>
              Moves ad money out of regions that rarely convert and into ones with room to grow.
            </p>
          </div>
        </div>

        {/* Navigation Mode Buttons */}
        <div className='flex items-center gap-1.5 p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs overflow-x-auto max-w-full scrollbar-none shrink-0'>
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              'px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1.5 shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950 motion-reduce:transition-none',
              activeTab === 'all'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            <IconSparkles className='size-3.5 text-zinc-400' />
            All analytics
          </button>
          <button
            onClick={() => setActiveTab('flowchart')}
            className={cn(
              'px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1.5 shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950 motion-reduce:transition-none',
              activeTab === 'flowchart'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            <IconGitFork className='size-3.5 text-zinc-400' />
            Flow chart
          </button>
          <button
            onClick={() => setActiveTab('graphs')}
            className={cn(
              'px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1.5 shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950 motion-reduce:transition-none',
              activeTab === 'graphs'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            <IconTrendingUp className='size-3.5 text-emerald-400' />
            Profit graph
          </button>
          <button
            onClick={() => setActiveTab('pie')}
            className={cn(
              'px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1.5 shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950 motion-reduce:transition-none',
              activeTab === 'pie'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            <IconChartPie className='size-3.5 text-zinc-400' />
            Spend pie chart
          </button>
          <button
            onClick={() => setActiveTab('bars')}
            className={cn(
              'px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1.5 shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950 motion-reduce:transition-none',
              activeTab === 'bars'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            <IconChartBar className='size-3.5 text-zinc-400' />
            Probability bar plot
          </button>
        </div>
      </div>

      {/* KPI Bar: RL Policy Metrics */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        <div className='p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/70'>
          <span className='text-xs text-zinc-400 font-medium'>Expected profit lift</span>
          <div className='flex items-baseline gap-2 mt-1'>
            <span className='text-xl font-semibold tabular-nums text-emerald-400'>
              +${data.totalProjectedProfitLift.toLocaleString()}
            </span>
            <span className='text-xs font-semibold tabular-nums text-emerald-500'>
              (+{data.profitLiftPct}%)
            </span>
          </div>
          <p className='text-xs text-zinc-400 mt-1'>from moving ad money</p>
        </div>

        <div className='p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/70'>
          <span className='text-xs text-zinc-400 font-medium'>Wasted ad spend saved</span>
          <div className='flex items-baseline gap-2 mt-1'>
            <span className='text-xl font-semibold tabular-nums text-rose-400'>
              ${data.lowProbabilitySpendAvoided.toLocaleString()}/day
            </span>
          </div>
          <p className='text-xs text-zinc-400 mt-1'>cut from low-converting regions</p>
        </div>

        <div className='p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/70'>
          <span className='text-xs text-zinc-400 font-medium'>Policy confidence</span>
          <div className='flex items-baseline gap-2 mt-1'>
            <span className='text-xl font-semibold tabular-nums text-zinc-100'>
              {(data.policyConfidence * 100).toFixed(1)}%
            </span>
          </div>
          <p className='text-xs text-zinc-400 mt-1'>how sure the agent is</p>
        </div>

        <div className='p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/70'>
          <span className='text-xs text-zinc-400 font-medium'>Exploration rate</span>
          <div className='flex items-baseline justify-between mt-1'>
            <span className='text-xl font-semibold tabular-nums text-zinc-100'>
              {(data.explorationRate * 100).toFixed(0)}%
            </span>
            <Button
              size='sm'
              variant='outline'
              onClick={handleRetrain}
              disabled={isRetraining}
              className='h-6 text-xs px-2 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950 motion-reduce:transition-none'
            >
              <IconPlayerPlay className='size-3 mr-1 text-emerald-400' />
              {isRetraining ? 'Learning...' : 'Re-train'}
            </Button>
          </div>
          <p className='text-xs text-zinc-400 mt-1'>share of spend used to test new options</p>
        </div>
      </div>

      {/* SECTION 1: FLOW CHART (DECISION PIPELINE) */}
      {(activeTab === 'flowchart' || activeTab === 'all') && (
        <div className='rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 space-y-4'>
          <div className='flex items-center justify-between border-b border-zinc-800/80 pb-3'>
            <div className='flex items-start gap-2.5'>
              <IconGitFork className='size-4 text-zinc-400 mt-0.5 shrink-0' />
              <div>
                <h5 className='text-sm font-semibold text-zinc-100'>
                  Reinforcement learning decision flow
                </h5>
                <p className='text-xs text-zinc-400 mt-0.5'>
                  How it decides, step by step
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Flow Chart Cards */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-3 relative'>
            {/* Stage 1 */}
            <div className='flex flex-col justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 relative'>
              <div>
                <div className='flex items-center gap-2.5 mb-2'>
                  <div className='size-6 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center justify-center shrink-0'>
                    1
                  </div>
                  <h6 className='text-sm font-bold text-zinc-200'>
                    Read the market
                  </h6>
                </div>
                <p className='text-[13px] text-zinc-400 leading-relaxed'>
                  See how likely each region is to buy: North America {formatProb(usState)}, Europe {formatProb(euState)}, LatAm {formatProb(latamState)}, SEA {formatProb(seaState)}. Stock levels and ad prices are checked too.
                </p>
              </div>
              <details className='mt-3 pt-2.5 border-t border-zinc-800/60 text-xs text-zinc-500 group/tech'>
                <summary className='cursor-pointer text-xs font-medium text-zinc-400 hover:text-zinc-300 select-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950'>
                  Technical details
                </summary>
                <p className='mt-1 text-xs text-zinc-400 leading-relaxed bg-zinc-950/60 p-2 rounded border border-zinc-800/40'>
                  State S_t, P(sale) posteriors, DuckDB + multi-source reconciler
                </p>
              </details>
              {/* Connector arrow to Card 2 */}
              <div className='hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 size-6 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 pointer-events-none'>
                <IconArrowRight className='size-3.5' />
              </div>
            </div>

            {/* Stage 2 */}
            <div className='flex flex-col justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 relative'>
              <div>
                <div className='flex items-center gap-2.5 mb-2'>
                  <div className='size-6 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center justify-center shrink-0'>
                    2
                  </div>
                  <h6 className='text-sm font-bold text-zinc-200'>
                    Find the best bets
                  </h6>
                </div>
                <p className='text-[13px] text-zinc-400 leading-relaxed'>
                  Work out where one more dollar earns the most, and where ads have stopped helping. Keep trying new options now and then.
                </p>
              </div>
              <details className='mt-3 pt-2.5 border-t border-zinc-800/60 text-xs text-zinc-500 group/tech'>
                <summary className='cursor-pointer text-xs font-medium text-zinc-400 hover:text-zinc-300 select-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950'>
                  Technical details
                </summary>
                <p className='mt-1 text-xs text-zinc-400 leading-relaxed bg-zinc-950/60 p-2 rounded border border-zinc-800/40'>
                  Bandit Q(s,a), dProfit/dSpend gradient, saturation index, Thompson sampling exploit vs explore
                </p>
              </details>
              {/* Connector arrow to Card 3 */}
              <div className='hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 size-6 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 pointer-events-none'>
                <IconArrowRight className='size-3.5' />
              </div>
            </div>

            {/* Stage 3 */}
            <div className='flex flex-col justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 relative'>
              <div>
                <div className='flex items-center gap-2.5 mb-2'>
                  <div className='size-6 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center justify-center shrink-0'>
                    3
                  </div>
                  <h6 className='text-sm font-bold text-zinc-200'>
                    Move the money
                  </h6>
                </div>
                <p className='text-[13px] text-zinc-400 leading-relaxed'>
                  {isAllStockoutSuppressed
                    ? 'This product is out of stock, so ads are paused in every region until stock returns.'
                    : `Spend more where there's room: US ${formatDelta(usState)}, EU ${formatDelta(euState)}. Cut where it isn't working: LatAm ${formatDelta(latamState)}, SEA ${formatDelta(seaState)}. Never advertise sold-out items.`}
                </p>
              </div>
              <details className='mt-3 pt-2.5 border-t border-zinc-800/60 text-xs text-zinc-500 group/tech'>
                <summary className='cursor-pointer text-xs font-medium text-zinc-400 hover:text-zinc-300 select-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950'>
                  Technical details
                </summary>
                <p className='mt-1 text-xs text-zinc-400 leading-relaxed bg-zinc-950/60 p-2 rounded border border-zinc-800/40'>
                  Meta and Google Ads script API, spend redistribution
                </p>
              </details>
              {/* Connector arrow to Card 4 */}
              <div className='hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 size-6 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 pointer-events-none'>
                <IconArrowRight className='size-3.5' />
              </div>
            </div>

            {/* Stage 4 */}
            <div className='flex flex-col justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 relative'>
              <div>
                <div className='flex items-center gap-2.5 mb-2'>
                  <div className='size-6 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center justify-center shrink-0'>
                    4
                  </div>
                  <h6 className='text-sm font-bold text-zinc-200'>
                    Learn from results
                  </h6>
                </div>
                <p className='text-[13px] text-zinc-400 leading-relaxed'>
                  Did profit go up after the move? Feed the result back in, and log every decision so it can be audited.
                </p>
              </div>
              <details className='mt-3 pt-2.5 border-t border-zinc-800/60 text-xs text-zinc-500 group/tech'>
                <summary className='cursor-pointer text-xs font-medium text-zinc-400 hover:text-zinc-300 select-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950'>
                  Technical details
                </summary>
                <p className='mt-1 text-xs text-zinc-400 leading-relaxed bg-zinc-950/60 p-2 rounded border border-zinc-800/40'>
                  Reward = ΔMargin$ − ΔSpend − Penalty, Beta priors updated with sales, append-only decision ledger
                </p>
              </details>
            </div>
          </div>

          {/* U-shaped connector back from card 4 to card 1 with "repeat" label */}
          <div className='hidden md:flex flex-col items-center justify-center pt-2 pb-1 relative'>
            <svg className='w-full h-7 overflow-visible text-zinc-700' viewBox='0 0 1000 28' fill='none'>
              <path
                d='M 875 0 V 16 Q 875 22 865 22 H 135 Q 125 22 125 16 V 0'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeDasharray='4 4'
              />
              <path
                d='M 121 6 L 125 0 L 129 6'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            <span className='absolute top-2 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-medium'>
              repeat
            </span>
          </div>
        </div>
      )}

      {/* SECTION 2 & 3: GRAPHS & PIE CHARTS (SIDE-BY-SIDE OR INDIVIDUAL) */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch'>
        {/* GRAPH: REINFORCEMENT LEARNING REWARD CONVERGENCE (COMPOSED CHART) */}
        {(activeTab === 'graphs' || activeTab === 'all') && (
          <div className={cn(
            'rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 flex flex-col justify-between h-full',
            activeTab === 'graphs' ? 'lg:col-span-12' : 'lg:col-span-7'
          )}>
            <div>
              <div className='flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3'>
                <div className='flex items-start gap-2.5'>
                  <IconTrendingUp className='size-4 text-emerald-400 mt-0.5 shrink-0' />
                  <div>
                    <h5 className='text-sm font-semibold text-zinc-100'>
                      Profit convergence: RL policy vs static baseline
                    </h5>
                    <p className='text-xs text-zinc-400 mt-0.5'>
                      Daily profit as the agent learns
                    </p>
                  </div>
                </div>
                <Badge variant='outline' className='text-xs border-emerald-500/40 text-emerald-400 bg-emerald-950/30 tabular-nums'>
                  Episode {retrainStep}/24
                </Badge>
              </div>

              {/* Chart Component */}
              <div
                role='img'
                aria-label='Line chart showing reinforcement learning policy profit convergence compared to the baseline policy across training episodes.'
                className='relative flex-1 min-h-[300px] w-full pt-1'
              >
                <div className='absolute inset-0'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 28, right: 84, left: 14, bottom: 24 }}
                    >
                      <CartesianGrid strokeDasharray='3 3' stroke='#27272a' vertical={false} />
                      <XAxis
                        dataKey='episode'
                        stroke='#a1a1aa'
                        fontSize={12}
                        ticks={[2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24]}
                        domain={[1, 24]}
                        tickLine={false}
                        label={{
                          value: 'Training episode',
                          position: 'insideBottom',
                          offset: -6,
                          fill: '#a1a1aa',
                          fontSize: 12
                        }}
                      />
                      <YAxis
                        stroke='#a1a1aa'
                        fontSize={12}
                        tickLine={false}
                        ticks={yAxisConfig.ticks}
                        domain={yAxisConfig.domain}
                        tickFormatter={(val) => `$${Number(val).toLocaleString()}`}
                      />
                      <Tooltip content={<CustomConvergenceTooltip />} />
                      {showSettleLine && (
                        <ReferenceLine
                          x={settleEpisode}
                          stroke='#52525b'
                          strokeDasharray='3 3'
                          strokeWidth={1.5}
                          label={{
                            value: 'Agent settles',
                            position: 'top',
                            fill: '#a1a1aa',
                            fontSize: 12,
                            offset: 6
                          }}
                        />
                      )}
                      <Area
                        type='monotone'
                        dataKey='gapRange'
                        stroke='none'
                        fill='#10b981'
                        fillOpacity={0.12}
                        isAnimationActive={isAnimationActive}
                        animationDuration={800}
                      />
                      <Line
                        type='monotone'
                        dataKey='baselineProfit'
                        stroke='#71717a'
                        strokeWidth={1.75}
                        strokeDasharray='4 4'
                        dot={isSmallScreen ? false : { r: 3.5, fill: '#09090b', stroke: '#71717a', strokeWidth: 1.5 }}
                        activeDot={{ r: 5, fill: '#09090b', stroke: '#71717a', strokeWidth: 2 }}
                        isAnimationActive={isAnimationActive}
                        animationDuration={800}
                        label={renderBaselineLabel}
                      />
                      <Line
                        type='monotone'
                        dataKey='rlPolicyProfit'
                        stroke='#10b981'
                        strokeWidth={2.5}
                        strokeLinejoin='round'
                        dot={{ r: 4, fill: '#10b981', stroke: '#09090b', strokeWidth: 2 }}
                        activeDot={{ r: 6.5, fill: '#10b981', stroke: '#10b981', strokeWidth: 3 }}
                        isAnimationActive={isAnimationActive}
                        animationDuration={800}
                        label={renderRlLabel}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className='flex items-center justify-between pt-3 mt-3 border-t border-zinc-900 text-xs text-zinc-400'>
              <span>Early on the agent tries many options (ε=45%), then settles on the best split (ε=5%).</span>
              <span className='text-emerald-400 font-semibold tabular-nums whitespace-nowrap ml-2'>
                +${data.totalProjectedProfitLift.toLocaleString()} net lift
              </span>
            </div>
          </div>
        )}

        {/* PIE CHART: AD SPEND REDISTRIBUTION (PRE VS POST RL) */}
        {(activeTab === 'pie' || activeTab === 'all') && (
          <div className={cn(
            'rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 flex flex-col justify-between h-full',
            activeTab === 'pie' ? 'lg:col-span-12' : 'lg:col-span-5'
          )}>
            <div>
              <div className='flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3'>
                <div className='flex items-start gap-2.5'>
                  <IconChartPie className='size-4 text-zinc-400 mt-0.5 shrink-0' />
                  <div>
                    <h5 className='text-sm font-semibold text-zinc-100'>
                      Where the budget goes
                    </h5>
                    <p className='text-xs text-zinc-400 mt-0.5'>
                      How ad spend is distributed across regions before and after learning
                    </p>
                  </div>
                </div>

                {/* Pre / Post Toggle */}
                <div className='flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800 text-xs shrink-0'>
                  <button
                    onClick={() => setPieMode('post')}
                    className={cn(
                      'px-2.5 py-1 rounded font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950 motion-reduce:transition-none',
                      pieMode === 'post'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                        : 'text-zinc-400 hover:text-zinc-200'
                    )}
                  >
                    RL optimal
                  </button>
                  <button
                    onClick={() => setPieMode('pre')}
                    className={cn(
                      'px-2.5 py-1 rounded font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950 motion-reduce:transition-none',
                      pieMode === 'pre'
                        ? 'bg-zinc-800 text-zinc-200'
                        : 'text-zinc-400 hover:text-zinc-200'
                    )}
                  >
                    Before RL
                  </button>
                </div>
              </div>

              {/* Pie Chart Component with Donut Center */}
              <div
                role='img'
                aria-label='Donut chart showing advertising budget distribution across regions before and after reinforcement learning optimization.'
                className='relative h-[210px] w-full flex items-center justify-center my-1'
              >
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={data.spendDistribution}
                      dataKey={pieMode === 'post' ? 'postRlSpend' : 'preRlSpend'}
                      nameKey='region'
                      cx='50%'
                      cy='50%'
                      innerRadius={50}
                      outerRadius={78}
                      paddingAngle={3}
                      isAnimationActive={isAnimationActive}
                    >
                      {data.spendDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke='#09090b'
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#09090b',
                        borderColor: '#27272a',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value: unknown, name: unknown) => [
                        `$${Number(value).toLocaleString()}/day`,
                        `${name}`
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Center Display */}
                <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center'>
                  <span className='text-xl font-bold tracking-tight text-zinc-100 tabular-nums leading-tight'>
                    {donutCenterShare}%
                  </span>
                  <span className='text-xs text-zinc-400 leading-tight'>
                    of budget
                  </span>
                </div>
              </div>

              {/* Legend with percentages */}
              <div className='grid grid-cols-2 gap-2 pt-2 text-xs'>
                {data.spendDistribution.map((item, idx) => (
                  <div
                    key={idx}
                    className='flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60'
                  >
                    <div className='flex items-center gap-2 truncate'>
                      <span
                        className='size-2.5 rounded-full shrink-0'
                        style={{ backgroundColor: item.color }}
                      />
                      <span className='text-zinc-300 truncate'>{item.region}</span>
                    </div>
                    <span className='font-semibold text-zinc-100 ml-2 shrink-0 tabular-nums'>
                      {pieMode === 'post' ? `${item.postRlShare}%` : `${item.preRlShare}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className='pt-3 mt-3 border-t border-zinc-900 text-xs text-zinc-400 leading-relaxed'>
              {pieFooterText}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: BAR PLOTS (CONVERSION PROBABILITY VS PROJECTED PROFIT LIFT) */}
      {(activeTab === 'bars' || activeTab === 'all') && (
        <div className='rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 space-y-4'>
          <div className='flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3'>
            <div className='flex items-start gap-2.5'>
              <IconChartBar className='size-4 text-zinc-400 mt-0.5 shrink-0' />
              <div>
                <h5 className='text-sm font-semibold text-zinc-100'>
                  Conversion odds vs profit headroom
                </h5>
                <p className='text-xs text-zinc-400 mt-0.5'>
                  Comparing purchase probability with expected profit gain by region
                </p>
              </div>
            </div>
            <div className='flex flex-wrap items-center gap-2 text-xs'>
              <div className='flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900/70 border border-zinc-800/80 text-zinc-300'>
                <span className='size-2.5 rounded-sm bg-rose-500 shrink-0' />
                <span>Conversion probability (%)</span>
              </div>
              <div className='flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900/70 border border-zinc-800/80 text-zinc-300'>
                <span className='size-2.5 rounded-sm bg-emerald-500 shrink-0' />
                <span>Expected margin index (pts)</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Component */}
          <div
            role='img'
            aria-label='Bar chart comparing regional conversion probability percentages with expected margin profit headroom scores.'
            className='h-[260px] w-full pt-1'
          >
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={data.barComparison} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray='3 3' stroke='#27272a' vertical={false} />
                <XAxis
                  dataKey='region'
                  stroke='#a1a1aa'
                  fontSize={12}
                  angle={-15}
                  textAnchor='end'
                  tickLine={false}
                />
                <YAxis
                  stroke='#a1a1aa'
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar
                  dataKey='conversionProbabilityPct'
                  name='Conversion probability'
                  fill='#ef4444'
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={isAnimationActive}
                />
                <Bar
                  dataKey='projectedProfitLift'
                  name='Expected margin index'
                  fill='#10b981'
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={isAnimationActive}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table Breakdown of Regions and RL Actions */}
          <div className='overflow-x-auto pt-2 rounded-lg border border-zinc-800/80 max-w-full'>
            <table className='w-full min-w-[640px] text-[13px] border-collapse'>
              <thead className='bg-zinc-900/80 text-zinc-400 text-xs font-medium border-b border-zinc-800/80'>
                <tr>
                  <th scope='col' className='p-3 text-left font-medium sticky left-0 z-20 bg-zinc-900/95 backdrop-blur-xs'>
                    Target region
                  </th>
                  <th scope='col' className='p-3 text-right font-medium'>
                    Likelihood of sale
                  </th>
                  <th scope='col' className='p-3 text-right font-medium'>
                    Current spend
                  </th>
                  <th scope='col' className='p-3 text-right font-medium'>
                    RL recommended spend
                  </th>
                  <th scope='col' className='p-3 text-right font-medium'>
                    Budget shift
                  </th>
                  <th scope='col' className='p-3 text-left font-medium pl-6'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-zinc-800/60 bg-zinc-950/40'>
                {data.regionalStates.map((r, i) => {
                  const badge = getActionBadge(r.rlAction);
                  return (
                    <tr key={i} className='group hover:bg-zinc-900/50 transition-colors motion-reduce:transition-none'>
                      <td className='p-3 font-semibold text-zinc-200 sticky left-0 z-10 bg-zinc-950 group-hover:bg-zinc-900/90 transition-colors motion-reduce:transition-none whitespace-nowrap'>
                        <span className='size-2.5 rounded-full inline-block mr-2 align-middle' style={{ backgroundColor: r.color }} />
                        {r.region}
                      </td>
                      <td className='p-3 text-right tabular-nums text-zinc-200 font-medium whitespace-nowrap'>
                        {(r.conversionProbability * 100).toFixed(0)}%
                      </td>
                      <td className='p-3 text-right tabular-nums text-zinc-400 whitespace-nowrap'>
                        ${r.currentDailySpend.toLocaleString()}/day
                      </td>
                      <td className='p-3 text-right tabular-nums font-semibold text-zinc-100 whitespace-nowrap'>
                        ${r.recommendedDailySpend.toLocaleString()}/day
                      </td>
                      <td className='p-3 text-right tabular-nums font-semibold whitespace-nowrap'>
                        <span className={cn(
                          r.spendDeltaPct > 0 ? 'text-emerald-400' : r.spendDeltaPct < 0 ? 'text-rose-400' : 'text-zinc-400'
                        )}>
                          {r.spendDeltaPct > 0 ? `+${r.spendDeltaPct}%` : `${r.spendDeltaPct}%`}
                        </span>
                      </td>
                      <td className='p-3 text-left pl-6 whitespace-nowrap'>
                        <Badge
                          variant='outline'
                          className={cn(
                            'text-xs font-medium px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5',
                            badge.className
                          )}
                        >
                          <span className={cn('size-1.5 rounded-full shrink-0', badge.dotColor)} />
                          {badge.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
