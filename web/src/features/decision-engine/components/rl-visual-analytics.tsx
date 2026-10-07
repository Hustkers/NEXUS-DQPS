'use client';

import React, { useState } from 'react';
import {
  IconCpu,
  IconTrendingUp,
  IconChartPie,
  IconChartBar,
  IconGitFork,
  IconArrowRight,
  IconCheck,
  IconAlertTriangle,
  IconFilter,
  IconSparkles,
  IconBolt,
  IconWorld,
  IconPlayerPlay
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import type { RLOptimizationResult } from '@/lib/rl-ad-optimizer';

interface RLVisualAnalyticsProps {
  data: RLOptimizationResult;
  onApplyAction?: (actionText: string) => void;
  className?: string;
}

export function RLVisualAnalytics({
  data,
  onApplyAction,
  className
}: RLVisualAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'flowchart' | 'graphs' | 'pie' | 'bars' | 'all'>('all');
  const [pieMode, setPieMode] = useState<'post' | 'pre'>('post');
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainStep, setRetrainStep] = useState(24);

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

  const filteredLearningCurve = data.learningCurve.slice(0, retrainStep);

  return (
    <div className={cn('flex flex-col space-y-5 text-zinc-100', className)}>
      {/* Top Banner: RL Agent Summary & Navigation Tabs */}
      <div className='flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 shadow-md'>
        <div className='flex items-center gap-3'>
          <div className='size-10 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400'>
            <IconCpu className='size-5 animate-pulse' />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h4 className='font-mono text-sm font-bold text-zinc-100'>
                REINFORCEMENT LEARNING AD ALLOCATION AGENT
              </h4>
              <Badge variant='outline' className='text-[10px] font-mono border-emerald-500/40 bg-emerald-950/30 text-emerald-400'>
                Thompson Bandit Q-Policy
              </Badge>
            </div>
            <p className='text-xs font-mono text-zinc-400 mt-0.5'>
              Maximizing profit by diverting ad spend away from low-probability regions into high-headroom zones
            </p>
          </div>
        </div>

        {/* Navigation Mode Buttons */}
        <div className='flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono'>
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              'px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1.5',
              activeTab === 'all'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            <IconSparkles className='size-3.5 text-cyan-400' />
            All Analytics
          </button>
          <button
            onClick={() => setActiveTab('flowchart')}
            className={cn(
              'px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1.5',
              activeTab === 'flowchart'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            <IconGitFork className='size-3.5 text-purple-400' />
            Flow Chart
          </button>
          <button
            onClick={() => setActiveTab('graphs')}
            className={cn(
              'px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1.5',
              activeTab === 'graphs'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            <IconTrendingUp className='size-3.5 text-emerald-400' />
            Profit Graph
          </button>
          <button
            onClick={() => setActiveTab('pie')}
            className={cn(
              'px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1.5',
              activeTab === 'pie'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            <IconChartPie className='size-3.5 text-amber-400' />
            Spend Pie Chart
          </button>
          <button
            onClick={() => setActiveTab('bars')}
            className={cn(
              'px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1.5',
              activeTab === 'bars'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            <IconChartBar className='size-3.5 text-rose-400' />
            Probability Bar Plot
          </button>
        </div>
      </div>

      {/* KPI Bar: RL Policy Metrics */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        <div className='p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/70'>
          <span className='text-[11px] font-mono text-zinc-400 uppercase'>Expected Profit Lift</span>
          <div className='flex items-baseline gap-2 mt-1'>
            <span className='text-xl font-mono font-bold text-emerald-400'>
              +${data.totalProjectedProfitLift.toLocaleString()}
            </span>
            <span className='text-xs font-mono text-emerald-500 font-bold'>
              (+{data.profitLiftPct}%)
            </span>
          </div>
          <p className='text-[10px] text-zinc-500 mt-1 font-mono'>via optimal ad reallocation</p>
        </div>

        <div className='p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/70'>
          <span className='text-[11px] font-mono text-zinc-400 uppercase'>Low-Probability Ad Waste Saved</span>
          <div className='flex items-baseline gap-2 mt-1'>
            <span className='text-xl font-mono font-bold text-rose-400'>
              ${data.lowProbabilitySpendAvoided.toLocaleString()}/day
            </span>
          </div>
          <p className='text-[10px] text-zinc-500 mt-1 font-mono'>Slashed in LatAm &amp; SEA zones</p>
        </div>

        <div className='p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/70'>
          <span className='text-[11px] font-mono text-zinc-400 uppercase'>RL Policy Confidence</span>
          <div className='flex items-baseline gap-2 mt-1'>
            <span className='text-xl font-mono font-bold text-cyan-400'>
              {(data.policyConfidence * 100).toFixed(1)}%
            </span>
            <span className='text-xs font-mono text-zinc-400'>Beta(α, β)</span>
          </div>
          <p className='text-[10px] text-zinc-500 mt-1 font-mono'>Thompson Sampling converged</p>
        </div>

        <div className='p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/70'>
          <span className='text-[11px] font-mono text-zinc-400 uppercase'>Exploration Rate (ε)</span>
          <div className='flex items-baseline justify-between mt-1'>
            <span className='text-xl font-mono font-bold text-amber-400'>
              {(data.explorationRate * 100).toFixed(0)}%
            </span>
            <Button
              size='sm'
              variant='outline'
              onClick={handleRetrain}
              disabled={isRetraining}
              className='h-6 text-[10px] font-mono border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200'
            >
              <IconPlayerPlay className='size-3 mr-1 text-emerald-400' />
              {isRetraining ? 'Learning...' : 'Re-Train'}
            </Button>
          </div>
          <p className='text-[10px] text-zinc-500 mt-1 font-mono'>ε-greedy exploitation phase</p>
        </div>
      </div>

      {/* SECTION 1: FLOW CHART (DECISION PIPELINE) */}
      {(activeTab === 'flowchart' || activeTab === 'all') && (
        <div className='rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 space-y-4'>
          <div className='flex items-center justify-between border-b border-zinc-800/80 pb-3'>
            <div className='flex items-center gap-2'>
              <IconGitFork className='size-4 text-purple-400' />
              <h5 className='font-mono text-sm font-bold text-zinc-100 uppercase'>
                Reinforcement Learning Decision Flow Chart
              </h5>
            </div>
            <span className='text-xs font-mono text-zinc-400'>
              Closed-Loop Dynamic Allocation Pipeline
            </span>
          </div>

          {/* Interactive Flow Chart Diagram */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-3 relative'>
            {/* Stage 1 */}
            <div className='flex flex-col justify-between p-4 rounded-xl border border-cyan-800/40 bg-cyan-950/20 relative group'>
              <div>
                <div className='flex items-center justify-between text-xs font-mono text-cyan-400 mb-2'>
                  <span className='font-bold flex items-center gap-1.5'>
                    1. STATE (S_t)
                  </span>
                  <Badge variant='outline' className='text-[9px] border-cyan-700 text-cyan-300'>Ingestion</Badge>
                </div>
                <h6 className='font-mono text-xs font-bold text-zinc-200 mb-1.5'>
                  Regional Market Signals
                </h6>
                <ul className='space-y-1.5 text-[11px] font-mono text-zinc-400'>
                  <li className='flex items-start gap-1.5'>
                    <span className='text-cyan-400'>•</span>
                    <span>P(Sale) Posterior: North America 78%, EMEA 56%</span>
                  </li>
                  <li className='flex items-start gap-1.5'>
                    <span className='text-rose-400'>•</span>
                    <span>Low Probability: LatAm 14%, SEA 9%</span>
                  </li>
                  <li className='flex items-start gap-1.5'>
                    <span className='text-cyan-400'>•</span>
                    <span>Stock levels &amp; CPM auction volatility</span>
                  </li>
                </ul>
              </div>
              <div className='mt-3 pt-2 border-t border-cyan-900/40 text-[10px] font-mono text-cyan-300/80'>
                DuckDB + Multi-Source Reconciler
              </div>
            </div>

            {/* Stage 2 */}
            <div className='flex flex-col justify-between p-4 rounded-xl border border-purple-800/40 bg-purple-950/20 relative group'>
              <div>
                <div className='flex items-center justify-between text-xs font-mono text-purple-400 mb-2'>
                  <span className='font-bold flex items-center gap-1.5'>
                    2. POLICY EVALUATION
                  </span>
                  <Badge variant='outline' className='text-[9px] border-purple-700 text-purple-300'>Bandit Q(s,a)</Badge>
                </div>
                <h6 className='font-mono text-xs font-bold text-zinc-200 mb-1.5'>
                  Marginal Headroom Optimization
                </h6>
                <ul className='space-y-1.5 text-[11px] font-mono text-zinc-400'>
                  <li className='flex items-start gap-1.5'>
                    <span className='text-purple-400'>•</span>
                    <span>Computes dProfit / dSpend gradient</span>
                  </li>
                  <li className='flex items-start gap-1.5'>
                    <span className='text-purple-400'>•</span>
                    <span>Detects audience saturation saturation index</span>
                  </li>
                  <li className='flex items-start gap-1.5'>
                    <span className='text-purple-400'>•</span>
                    <span>Thompson Sampling Balances Exploit vs Explore</span>
                  </li>
                </ul>
              </div>
              <div className='mt-3 pt-2 border-t border-purple-900/40 text-[10px] font-mono text-purple-300/80'>
                Multi-Armed Contextual Policy
              </div>
            </div>

            {/* Stage 3 */}
            <div className='flex flex-col justify-between p-4 rounded-xl border border-amber-800/40 bg-amber-950/20 relative group'>
              <div>
                <div className='flex items-center justify-between text-xs font-mono text-amber-400 mb-2'>
                  <span className='font-bold flex items-center gap-1.5'>
                    3. ACTION (A_t)
                  </span>
                  <Badge variant='outline' className='text-[9px] border-amber-700 text-amber-300'>Reallocation</Badge>
                </div>
                <h6 className='font-mono text-xs font-bold text-zinc-200 mb-1.5'>
                  Ad Display Redistribution
                </h6>
                <ul className='space-y-1.5 text-[11px] font-mono text-zinc-400'>
                  <li className='flex items-start gap-1.5'>
                    <span className='text-emerald-400 font-bold'>+</span>
                    <span>Scale High Headroom: US (+68%), EU (+22%)</span>
                  </li>
                  <li className='flex items-start gap-1.5'>
                    <span className='text-rose-400 font-bold'>-</span>
                    <span>Suppress Low Probability: LatAm (-72%), SEA (-88%)</span>
                  </li>
                  <li className='flex items-start gap-1.5'>
                    <span className='text-amber-400'>•</span>
                    <span>Zero Ad Budget Burn on Stockouts</span>
                  </li>
                </ul>
              </div>
              <div className='mt-3 pt-2 border-t border-amber-900/40 text-[10px] font-mono text-amber-300/80'>
                Meta &amp; Google Ads Script API
              </div>
            </div>

            {/* Stage 4 */}
            <div className='flex flex-col justify-between p-4 rounded-xl border border-emerald-800/40 bg-emerald-950/20 relative group'>
              <div>
                <div className='flex items-center justify-between text-xs font-mono text-emerald-400 mb-2'>
                  <span className='font-bold flex items-center gap-1.5'>
                    4. REWARD (R_t)
                  </span>
                  <Badge variant='outline' className='text-[9px] border-emerald-700 text-emerald-300'>Feedback</Badge>
                </div>
                <h6 className='font-mono text-xs font-bold text-zinc-200 mb-1.5'>
                  Profit Lift &amp; Policy Refit
                </h6>
                <ul className='space-y-1.5 text-[11px] font-mono text-zinc-400'>
                  <li className='flex items-start gap-1.5'>
                    <span className='text-emerald-400'>✓</span>
                    <span>Reward = ΔMargin$ − ΔSpend − Penalty</span>
                  </li>
                  <li className='flex items-start gap-1.5'>
                    <span className='text-emerald-400'>✓</span>
                    <span>Thompson Beta priors updated with sales</span>
                  </li>
                  <li className='flex items-start gap-1.5'>
                    <span className='text-emerald-400'>✓</span>
                    <span>Append-only Decision Ledger Audit</span>
                  </li>
                </ul>
              </div>
              <div className='mt-3 pt-2 border-t border-emerald-900/40 text-[10px] font-mono text-emerald-300/80'>
                Continuous Learning Feedback Loop
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2 & 3: GRAPHS & PIE CHARTS (SIDE-BY-SIDE OR INDIVIDUAL) */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-5'>
        {/* GRAPH: REINFORCEMENT LEARNING REWARD CONVERGENCE (AREA / LINE GRAPH) */}
        {(activeTab === 'graphs' || activeTab === 'all') && (
          <div className={cn(
            'rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 flex flex-col justify-between',
            activeTab === 'graphs' ? 'lg:col-span-12' : 'lg:col-span-7'
          )}>
            <div>
              <div className='flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3'>
                <div>
                  <h5 className='font-mono text-sm font-bold text-zinc-100 flex items-center gap-2'>
                    <IconTrendingUp className='size-4 text-emerald-400' />
                    RL Policy Profit Convergence Graph
                  </h5>
                  <p className='text-xs font-mono text-zinc-400 mt-0.5'>
                    Learning Episode Progress: RL Dynamic Policy vs Static Rule-Based Baseline
                  </p>
                </div>
                <Badge variant='outline' className='font-mono text-[10px] border-emerald-500/40 text-emerald-400 bg-emerald-950/30'>
                  Episode {retrainStep}/24
                </Badge>
              </div>

              {/* Chart Component */}
              <div className='h-[260px] w-full pt-2'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={filteredLearningCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id='rlProfitGrad' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#10b981' stopOpacity={0.4} />
                        <stop offset='95%' stopColor='#10b981' stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id='baselineProfitGrad' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#71717a' stopOpacity={0.2} />
                        <stop offset='95%' stopColor='#71717a' stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' stroke='#27272a' />
                    <XAxis
                      dataKey='episode'
                      stroke='#71717a'
                      fontSize={11}
                      tickFormatter={(val) => `Ep ${val}`}
                    />
                    <YAxis
                      stroke='#71717a'
                      fontSize={11}
                      tickFormatter={(val) => `$${(val / 1000).toFixed(1)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#09090b',
                        borderColor: '#27272a',
                        borderRadius: '8px',
                        fontFamily: 'monospace',
                        fontSize: '12px'
                      }}
                      formatter={(value: any, name: any) => {
                        const label = name === 'rlPolicyProfit' ? 'RL Adaptive Profit' : 'Static Baseline';
                        return [`$${Number(value).toLocaleString()}`, label];
                      }}
                      labelFormatter={(ep) => `Training Episode ${ep}`}
                    />
                    <Legend
                      verticalAlign='top'
                      align='right'
                      iconType='circle'
                      wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingBottom: '8px' }}
                    />
                    <Area
                      type='monotone'
                      dataKey='rlPolicyProfit'
                      name='RL Adaptive Policy'
                      stroke='#10b981'
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill='url(#rlProfitGrad)'
                    />
                    <Area
                      type='monotone'
                      dataKey='baselineProfit'
                      name='Static Baseline'
                      stroke='#71717a'
                      strokeWidth={1.5}
                      strokeDasharray='4 4'
                      fillOpacity={1}
                      fill='url(#baselineProfitGrad)'
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className='flex items-center justify-between pt-3 border-t border-zinc-900 font-mono text-[11px] text-zinc-400'>
              <span>Agent explores early episodes (ε=45%) then converges to optimal budget concentration (ε=5%).</span>
              <span className='text-emerald-400 font-bold'>+${data.totalProjectedProfitLift.toLocaleString()} Net Lift</span>
            </div>
          </div>
        )}

        {/* PIE CHART: AD SPEND REDISTRIBUTION (PRE VS POST RL) */}
        {(activeTab === 'pie' || activeTab === 'all') && (
          <div className={cn(
            'rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 flex flex-col justify-between',
            activeTab === 'pie' ? 'lg:col-span-12' : 'lg:col-span-5'
          )}>
            <div>
              <div className='flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3'>
                <div>
                  <h5 className='font-mono text-sm font-bold text-zinc-100 flex items-center gap-2'>
                    <IconChartPie className='size-4 text-amber-400' />
                    Ad Budget Allocation Pie Chart
                  </h5>
                  <p className='text-xs font-mono text-zinc-400 mt-0.5'>
                    Budget pulled from low-probability zones &amp; concentrated into high-yield markets
                  </p>
                </div>

                {/* Pre / Post Toggle */}
                <div className='flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800 text-[10px] font-mono'>
                  <button
                    onClick={() => setPieMode('post')}
                    className={cn(
                      'px-2 py-0.5 rounded font-bold transition-all',
                      pieMode === 'post' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'text-zinc-500 hover:text-zinc-300'
                    )}
                  >
                    RL Optimal
                  </button>
                  <button
                    onClick={() => setPieMode('pre')}
                    className={cn(
                      'px-2 py-0.5 rounded font-bold transition-all',
                      pieMode === 'pre' ? 'bg-zinc-800 text-zinc-300' : 'text-zinc-500 hover:text-zinc-300'
                    )}
                  >
                    Before RL
                  </button>
                </div>
              </div>

              {/* Pie Chart Component */}
              <div className='h-[210px] w-full flex items-center justify-center'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={data.spendDistribution}
                      dataKey={pieMode === 'post' ? 'postRlSpend' : 'preRlSpend'}
                      nameKey='region'
                      cx='50%'
                      cy='50%'
                      innerRadius={48}
                      outerRadius={78}
                      paddingAngle={3}
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
                        fontFamily: 'monospace',
                        fontSize: '11px'
                      }}
                      formatter={(value: any, name: any) => [
                        `$${Number(value).toLocaleString()}/day`,
                        `${name}`
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend with percentages */}
              <div className='grid grid-cols-2 gap-1.5 pt-2 font-mono text-[10px]'>
                {data.spendDistribution.map((item, idx) => (
                  <div key={idx} className='flex items-center justify-between p-1 rounded bg-zinc-900/50 border border-zinc-800/40'>
                    <div className='flex items-center gap-1.5 truncate'>
                      <span className='text-zinc-300 truncate'>{item.region}</span>
                    </div>
                    <span className='font-bold text-zinc-100 ml-1'>
                      {pieMode === 'post' ? `${item.postRlShare}%` : `${item.preRlShare}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className='pt-2 mt-2 border-t border-zinc-900 text-[10px] font-mono text-zinc-400'>
              {pieMode === 'post'
                ? 'Post-RL: North America receives 68% of budget; low-probability zones pruned to 0-3%.'
                : 'Pre-RL: 16% of daily ad budget wasted in LatAm & SEA with low conversion probabilities.'}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: BAR PLOTS (CONVERSION PROBABILITY VS PROJECTED PROFIT LIFT) */}
      {(activeTab === 'bars' || activeTab === 'all') && (
        <div className='rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 space-y-4'>
          <div className='flex items-center justify-between border-b border-zinc-800/80 pb-3'>
            <div>
              <h5 className='font-mono text-sm font-bold text-zinc-100 flex items-center gap-2'>
                <IconChartBar className='size-4 text-rose-400' />
                Regional Conversion Probability vs. Profit Headroom Bar Plot
              </h5>
              <p className='text-xs font-mono text-zinc-400 mt-0.5'>
                Showing where the RL agent identifies scope to display more ads for peak profit vs suppressing low-yield zones
              </p>
            </div>
            <div className='flex items-center gap-3 font-mono text-xs'>
              <div className='flex items-center gap-1.5 text-zinc-300'>
                <span className='size-2.5 rounded bg-rose-500' />
                <span>Conversion Probability %</span>
              </div>
              <div className='flex items-center gap-1.5 text-zinc-300'>
                <span className='size-2.5 rounded bg-emerald-500' />
                <span>Expected Margin Index ($)</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Component */}
          <div className='h-[260px] w-full pt-1'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={data.barComparison} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray='3 3' stroke='#27272a' />
                <XAxis
                  dataKey='region'
                  stroke='#71717a'
                  fontSize={11}
                  angle={-15}
                  textAnchor='end'
                />
                <YAxis
                  stroke='#71717a'
                  fontSize={11}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#09090b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === 'conversionProbabilityPct') return [`${value}%`, 'Conversion Probability'];
                    return [`${value} pts`, 'Expected Margin Score'];
                  }}
                />
                <Bar
                  dataKey='conversionProbabilityPct'
                  name='Conversion Probability %'
                  fill='#ef4444'
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey='projectedProfitLift'
                  name='Expected Margin Index'
                  fill='#10b981'
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table Breakdown of Regions and RL Actions */}
          <div className='overflow-x-auto pt-2'>
            <table className='w-full font-mono text-xs border border-zinc-800/80 rounded-lg overflow-hidden'>
              <thead className='bg-zinc-900/80 text-zinc-400 text-[11px] uppercase'>
                <tr>
                  <th className='p-2.5 text-left'>Target Region</th>
                  <th className='p-2.5 text-left'>P(Sale) Likelihood</th>
                  <th className='p-2.5 text-left'>Current Spend</th>
                  <th className='p-2.5 text-left'>RL Recommended Spend</th>
                  <th className='p-2.5 text-left'>Budget Shift</th>
                  <th className='p-2.5 text-left'>RL Policy Action</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-zinc-800/60 bg-zinc-950/40'>
                {data.regionalStates.map((r, i) => (
                  <tr key={i} className='hover:bg-zinc-900/40 transition-colors'>
                    <td className='p-2.5 font-bold text-zinc-200'>
                      {r.region}
                    </td>
                    <td className='p-2.5'>
                      <span className={cn(
                        'font-bold',
                        r.conversionProbability >= 0.7 ? 'text-rose-400' :
                        r.conversionProbability >= 0.4 ? 'text-amber-400' : 'text-zinc-500'
                      )}>
                        {(r.conversionProbability * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className='p-2.5 text-zinc-400'>${r.currentDailySpend.toLocaleString()}/day</td>
                    <td className='p-2.5 font-bold text-zinc-100'>${r.recommendedDailySpend.toLocaleString()}/day</td>
                    <td className='p-2.5'>
                      <span className={cn(
                        'font-bold',
                        r.spendDeltaPct > 0 ? 'text-emerald-400' : r.spendDeltaPct < 0 ? 'text-rose-400' : 'text-zinc-400'
                      )}>
                        {r.spendDeltaPct > 0 ? `+${r.spendDeltaPct}%` : `${r.spendDeltaPct}%`}
                      </span>
                    </td>
                    <td className='p-2.5'>
                      <Badge
                        variant='outline'
                        className={cn(
                          'text-[10px] font-mono font-bold',
                          r.rlAction === 'BOOST_ADS' ? 'border-rose-500/50 bg-rose-950/40 text-rose-300' :
                          r.rlAction === 'EXPAND_ADS' ? 'border-amber-500/50 bg-amber-950/40 text-amber-300' :
                          r.rlAction === 'MAINTAIN' ? 'border-zinc-700 bg-zinc-800 text-zinc-300' :
                          'border-zinc-800 bg-zinc-900 text-zinc-500'
                        )}
                      >
                        {r.rlAction === 'BOOST_ADS' && 'DISPLAY MORE ADS (HIGH HEADROOM)'}
                        {r.rlAction === 'EXPAND_ADS' && 'EXPAND ADS (STRONG ROAS)'}
                        {r.rlAction === 'MAINTAIN' && 'MAINTAIN TEST'}
                        {r.rlAction === 'SCALE_DOWN' && 'SLASH ADS (-72%)'}
                        {r.rlAction === 'SUPPRESS_ADS' && 'SUPPRESS ADS (LOW PROBABILITY)'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
