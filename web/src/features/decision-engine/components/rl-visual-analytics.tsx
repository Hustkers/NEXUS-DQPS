'use client';

import React, { useState } from 'react';
import {
  IconCpu,
  IconTrendingUp,
  IconChartPie,
  IconChartBar,
  IconGitFork,
  IconPlayerPlay,
  IconSparkles,
  IconShieldCheck,
  IconArrowUpRight,
  IconArrowDownRight
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
  className
}: RLVisualAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'flowchart' | 'graphs' | 'pie' | 'bars'>('all');
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
    <div className={cn('flex flex-col space-y-5 text-foreground font-mono', className)}>
      {/* Top Banner: RL Agent Summary & Navigation Tabs */}
      <div className='flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-xs'>
        <div className='flex items-center gap-3'>
          <div className='size-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500'>
            <IconCpu className='size-5 animate-pulse' />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h4 className='font-mono text-sm font-bold text-foreground tracking-tight'>
                REINFORCEMENT LEARNING AD ALLOCATION POLICY
              </h4>
              <Badge variant='outline' className='text-[10px] font-mono border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
                Thompson Bandit Q-Policy
              </Badge>
            </div>
            <p className='text-xs font-mono text-muted-foreground mt-0.5'>
              Contextual dynamic budget diversion: suppresses low-probability bleed &amp; scales high-headroom markets
            </p>
          </div>
        </div>

        {/* Navigation Mode Buttons */}
        <div className='flex flex-wrap items-center gap-1 p-1 rounded-lg bg-muted/60 border border-border text-xs font-mono'>
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              'px-2.5 py-1 rounded transition-all font-semibold flex items-center gap-1.5',
              activeTab === 'all'
                ? 'bg-background text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <IconSparkles className='size-3.5 text-cyan-500' />
            All Views
          </button>
          <button
            onClick={() => setActiveTab('flowchart')}
            className={cn(
              'px-2.5 py-1 rounded transition-all font-semibold flex items-center gap-1.5',
              activeTab === 'flowchart'
                ? 'bg-background text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <IconGitFork className='size-3.5 text-purple-400' />
            Pipeline Flow
          </button>
          <button
            onClick={() => setActiveTab('graphs')}
            className={cn(
              'px-2.5 py-1 rounded transition-all font-semibold flex items-center gap-1.5',
              activeTab === 'graphs'
                ? 'bg-background text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <IconTrendingUp className='size-3.5 text-emerald-500' />
            Convergence
          </button>
          <button
            onClick={() => setActiveTab('pie')}
            className={cn(
              'px-2.5 py-1 rounded transition-all font-semibold flex items-center gap-1.5',
              activeTab === 'pie'
                ? 'bg-background text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <IconChartPie className='size-3.5 text-amber-500' />
            Allocation Pie
          </button>
          <button
            onClick={() => setActiveTab('bars')}
            className={cn(
              'px-2.5 py-1 rounded transition-all font-semibold flex items-center gap-1.5',
              activeTab === 'bars'
                ? 'bg-background text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <IconChartBar className='size-3.5 text-rose-500' />
            Probability vs Headroom
          </button>
        </div>
      </div>

      {/* KPI Row: RL Policy Metrics */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
        {/* KPI 1: Expected Profit Lift */}
        <div className='p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1'>
          <div className='flex items-center justify-between text-[11px] font-mono text-emerald-600 dark:text-emerald-400 uppercase font-bold'>
            <span>Expected Profit Lift</span>
            <span className='size-1.5 rounded-full bg-emerald-500' />
          </div>
          <div className='flex items-baseline gap-2'>
            <span className='text-xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400'>
              +₹{data.totalProjectedProfitLift.toLocaleString('en-IN')}
            </span>
            <span className='text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold'>
              (+{data.profitLiftPct}%)
            </span>
          </div>
          <p className='text-[10px] text-muted-foreground font-mono'>via optimal dynamic capital reallocation</p>
        </div>

        {/* KPI 2: Low Probability Waste Avoided */}
        <div className='p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-1'>
          <div className='flex items-center justify-between text-[11px] font-mono text-rose-600 dark:text-rose-400 uppercase font-bold'>
            <span>Low-Probability Waste Cut</span>
            <span className='size-1.5 rounded-full bg-rose-500' />
          </div>
          <div className='flex items-baseline gap-1'>
            <span className='text-xl font-mono font-bold text-rose-600 dark:text-rose-400'>
              ₹{data.lowProbabilitySpendAvoided.toLocaleString('en-IN')}
            </span>
            <span className='text-xs text-rose-500'>/day</span>
          </div>
          <p className='text-[10px] text-muted-foreground font-mono'>Suppressed in LatAm &amp; SEA low-intent zones</p>
        </div>

        {/* KPI 3: Policy Confidence */}
        <div className='p-3.5 rounded-xl border border-border bg-card space-y-1'>
          <div className='flex items-center justify-between text-[11px] font-mono text-muted-foreground uppercase font-bold'>
            <span>Policy Confidence</span>
            <span className='size-1.5 rounded-full bg-cyan-500' />
          </div>
          <div className='flex items-baseline gap-2'>
            <span className='text-xl font-mono font-bold text-foreground'>
              {(data.policyConfidence * 100).toFixed(1)}%
            </span>
            <span className='text-[10px] text-muted-foreground'>Beta(α, β)</span>
          </div>
          <p className='text-[10px] text-muted-foreground font-mono'>Thompson Sampling posterior converged</p>
        </div>

        {/* KPI 4: Exploration Rate & Retrain */}
        <div className='p-3.5 rounded-xl border border-border bg-card space-y-1'>
          <div className='flex items-center justify-between text-[11px] font-mono text-muted-foreground uppercase font-bold'>
            <span>Exploration Rate (ε)</span>
            <span className='size-1.5 rounded-full bg-amber-500' />
          </div>
          <div className='flex items-baseline justify-between'>
            <span className='text-xl font-mono font-bold text-foreground'>
              {(data.explorationRate * 100).toFixed(0)}%
            </span>
            <Button
              size='sm'
              variant='outline'
              onClick={handleRetrain}
              disabled={isRetraining}
              className='h-6 px-2 text-[10px] font-mono border-border bg-background hover:bg-muted text-foreground'
            >
              <IconPlayerPlay className='size-3 mr-1 text-emerald-500' />
              {isRetraining ? 'Learning...' : 'Re-Train'}
            </Button>
          </div>
          <p className='text-[10px] text-muted-foreground font-mono'>ε-greedy exploitation phase active</p>
        </div>
      </div>

      {/* SECTION 1: FLOW CHART (DECISION PIPELINE) */}
      {(activeTab === 'flowchart' || activeTab === 'all') && (
        <div className='rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3.5 shadow-xs'>
          <div className='flex items-center justify-between border-b border-border/60 pb-3'>
            <div className='flex items-center gap-2'>
              <IconGitFork className='size-4 text-purple-500' />
              <h5 className='font-mono text-xs font-bold text-foreground uppercase tracking-wider'>
                Reinforcement Learning Decision Pipeline
              </h5>
            </div>
            <span className='text-[10px] font-mono text-muted-foreground uppercase'>
              Closed-Loop Dynamic Allocation Engine
            </span>
          </div>

          {/* Interactive Flow Chart Diagram */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
            {/* Stage 1 */}
            <div className='flex flex-col justify-between p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-500/5 space-y-2'>
              <div>
                <div className='flex items-center justify-between text-[10px] font-mono text-cyan-600 dark:text-cyan-400 mb-1.5 font-bold uppercase'>
                  <span className='flex items-center gap-1.5'>
                    <span className='size-1.5 rounded-full bg-cyan-400 animate-pulse' />
                    1. STATE (S_t)
                  </span>
                  <span className='px-1 py-0.2 rounded bg-cyan-500/10 text-[9px]'>Telemetry</span>
                </div>
                <h6 className='font-mono text-xs font-bold text-foreground mb-1'>
                  Market Intent &amp; Signals
                </h6>
                <ul className='space-y-1 text-[11px] font-mono text-muted-foreground'>
                  <li className='flex items-start gap-1'>
                    <span className='text-cyan-500'>•</span>
                    <span>P(Sale) Posterior: US 78%, EMEA 56%</span>
                  </li>
                  <li className='flex items-start gap-1'>
                    <span className='text-rose-500'>•</span>
                    <span>Low Probability: LatAm 14%, SEA 9%</span>
                  </li>
                  <li className='flex items-start gap-1'>
                    <span className='text-cyan-500'>•</span>
                    <span>Warehouse stock &amp; CPM auction rates</span>
                  </li>
                </ul>
              </div>
              <div className='pt-2 border-t border-cyan-500/20 text-[10px] font-mono text-cyan-600 dark:text-cyan-400'>
                DuckDB + Real-Time Telemetry
              </div>
            </div>

            {/* Stage 2 */}
            <div className='flex flex-col justify-between p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-2'>
              <div>
                <div className='flex items-center justify-between text-[10px] font-mono text-purple-600 dark:text-purple-400 mb-1.5 font-bold uppercase'>
                  <span className='flex items-center gap-1.5'>
                    <span className='size-1.5 rounded-full bg-purple-400 animate-pulse' />
                    2. POLICY EVALUATION
                  </span>
                  <span className='px-1 py-0.2 rounded bg-purple-500/10 text-[9px]'>Bandit Q(s,a)</span>
                </div>
                <h6 className='font-mono text-xs font-bold text-foreground mb-1'>
                  Marginal Headroom Solver
                </h6>
                <ul className='space-y-1 text-[11px] font-mono text-muted-foreground'>
                  <li className='flex items-start gap-1'>
                    <span className='text-purple-500'>•</span>
                    <span>Computes dProfit / dSpend gradient</span>
                  </li>
                  <li className='flex items-start gap-1'>
                    <span className='text-purple-500'>•</span>
                    <span>Detects audience fatigue saturation</span>
                  </li>
                  <li className='flex items-start gap-1'>
                    <span className='text-purple-500'>•</span>
                    <span>Thompson Sampling Exploit vs Explore</span>
                  </li>
                </ul>
              </div>
              <div className='pt-2 border-t border-purple-500/20 text-[10px] font-mono text-purple-600 dark:text-purple-400'>
                SLSQP Multi-Armed Optimizer
              </div>
            </div>

            {/* Stage 3 */}
            <div className='flex flex-col justify-between p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2'>
              <div>
                <div className='flex items-center justify-between text-[10px] font-mono text-amber-600 dark:text-amber-400 mb-1.5 font-bold uppercase'>
                  <span className='flex items-center gap-1.5'>
                    <span className='size-1.5 rounded-full bg-amber-400 animate-pulse' />
                    3. ACTION (A_t)
                  </span>
                  <span className='px-1 py-0.2 rounded bg-amber-500/10 text-[9px]'>Reallocation</span>
                </div>
                <h6 className='font-mono text-xs font-bold text-foreground mb-1'>
                  Budget Rebalancing Vector
                </h6>
                <ul className='space-y-1 text-[11px] font-mono text-muted-foreground'>
                  <li className='flex items-start gap-1'>
                    <span className='text-emerald-500 font-bold'>+</span>
                    <span>Scale High Headroom: US (+68%), EU (+22%)</span>
                  </li>
                  <li className='flex items-start gap-1'>
                    <span className='text-rose-500 font-bold'>-</span>
                    <span>Suppress Low Probability: LatAm (-72%), SEA (-88%)</span>
                  </li>
                  <li className='flex items-start gap-1'>
                    <span className='text-amber-500'>•</span>
                    <span>Zero Ad Budget Burn on Stockouts</span>
                  </li>
                </ul>
              </div>
              <div className='pt-2 border-t border-amber-500/20 text-[10px] font-mono text-amber-600 dark:text-amber-400'>
                Meta &amp; Google Ad Network APIs
              </div>
            </div>

            {/* Stage 4 */}
            <div className='flex flex-col justify-between p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2'>
              <div>
                <div className='flex items-center justify-between text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mb-1.5 font-bold uppercase'>
                  <span className='flex items-center gap-1.5'>
                    <span className='size-1.5 rounded-full bg-emerald-400 animate-pulse' />
                    4. REWARD (R_t)
                  </span>
                  <span className='px-1 py-0.2 rounded bg-emerald-500/10 text-[9px]'>Feedback</span>
                </div>
                <h6 className='font-mono text-xs font-bold text-foreground mb-1'>
                  Profit Lift &amp; Audit Trail
                </h6>
                <ul className='space-y-1 text-[11px] font-mono text-muted-foreground'>
                  <li className='flex items-start gap-1'>
                    <span className='text-emerald-500'>✓</span>
                    <span>Reward = ΔMargin − ΔSpend − Penalty</span>
                  </li>
                  <li className='flex items-start gap-1'>
                    <span className='text-emerald-500'>✓</span>
                    <span>Thompson Beta priors updated with orders</span>
                  </li>
                  <li className='flex items-start gap-1'>
                    <span className='text-emerald-500'>✓</span>
                    <span>Immutable Decision Ledger entry</span>
                  </li>
                </ul>
              </div>
              <div className='pt-2 border-t border-emerald-500/20 text-[10px] font-mono text-emerald-600 dark:text-emerald-400'>
                Continuous Closed-Loop Learning
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2 & 3: GRAPHS & PIE CHARTS */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-5'>
        {/* GRAPH: REINFORCEMENT LEARNING PROFIT CONVERGENCE */}
        {(activeTab === 'graphs' || activeTab === 'all') && (
          <div className={cn(
            'rounded-xl border border-border bg-card p-4 sm:p-5 flex flex-col justify-between shadow-xs',
            activeTab === 'graphs' ? 'lg:col-span-12' : 'lg:col-span-7'
          )}>
            <div>
              <div className='flex items-center justify-between border-b border-border/60 pb-3 mb-3'>
                <div>
                  <h5 className='font-mono text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2'>
                    <IconTrendingUp className='size-3.5 text-emerald-500' />
                    RL Policy Profit Convergence
                  </h5>
                  <p className='text-[10px] font-mono text-muted-foreground mt-0.5'>
                    Episode Learning Progress: Dynamic Bandit Policy vs Static Baseline
                  </p>
                </div>
                <Badge variant='outline' className='font-mono text-[10px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'>
                  Episode {retrainStep}/24
                </Badge>
              </div>

              {/* Chart Component */}
              <div className='h-[250px] w-full pt-1'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={filteredLearningCurve} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id='rlProfitGrad' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#10b981' stopOpacity={0.35} />
                        <stop offset='95%' stopColor='#10b981' stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id='baselineProfitGrad' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#71717a' stopOpacity={0.2} />
                        <stop offset='95%' stopColor='#71717a' stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' stroke='currentColor' className='text-border/30' vertical={false} />
                    <XAxis
                      dataKey='episode'
                      stroke='#71717a'
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `Ep ${val}`}
                    />
                    <YAxis
                      stroke='#71717a'
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--popover, #09090b)',
                        borderColor: 'var(--border, #27272a)',
                        borderRadius: '8px',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        color: 'var(--popover-foreground, #fff)'
                      }}
                      formatter={(value: any, name: any) => {
                        const label = name === 'rlPolicyProfit' ? 'RL Adaptive Profit' : 'Static Baseline';
                        return [`₹${Number(value).toLocaleString('en-IN')}`, label];
                      }}
                      labelFormatter={(ep) => `Training Episode ${ep}`}
                    />
                    <Legend
                      verticalAlign='top'
                      align='right'
                      iconType='circle'
                      wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingBottom: '8px' }}
                    />
                    <Area
                      type='monotone'
                      dataKey='rlPolicyProfit'
                      name='RL Adaptive Policy'
                      stroke='#10b981'
                      strokeWidth={2}
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

            <div className='flex items-center justify-between pt-3 border-t border-border/40 font-mono text-[10px] text-muted-foreground'>
              <span>Exploration shifts to exploitation (ε=45% → ε=5%) as model converges.</span>
              <span className='text-emerald-600 dark:text-emerald-400 font-bold'>+₹{data.totalProjectedProfitLift.toLocaleString('en-IN')} Net Lift</span>
            </div>
          </div>
        )}

        {/* PIE / DONUT CHART: AD SPEND REDISTRIBUTION */}
        {(activeTab === 'pie' || activeTab === 'all') && (
          <div className={cn(
            'rounded-xl border border-border bg-card p-4 sm:p-5 flex flex-col justify-between shadow-xs',
            activeTab === 'pie' ? 'lg:col-span-12' : 'lg:col-span-5'
          )}>
            <div>
              <div className='flex items-center justify-between border-b border-border/60 pb-3 mb-3'>
                <div>
                  <h5 className='font-mono text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2'>
                    <IconChartPie className='size-3.5 text-amber-500' />
                    Spend Allocation Distribution
                  </h5>
                  <p className='text-[10px] font-mono text-muted-foreground mt-0.5'>
                    Budget pulled from low-probability zones &amp; concentrated into high-yield markets
                  </p>
                </div>

                {/* Pre / Post Toggle */}
                <div className='flex items-center bg-muted/60 rounded-lg p-0.5 border border-border text-[10px] font-mono'>
                  <button
                    onClick={() => setPieMode('post')}
                    className={cn(
                      'px-2 py-0.5 rounded font-bold transition-all',
                      pieMode === 'post' ? 'bg-background text-emerald-600 dark:text-emerald-400 shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    RL Optimal
                  </button>
                  <button
                    onClick={() => setPieMode('pre')}
                    className={cn(
                      'px-2 py-0.5 rounded font-bold transition-all',
                      pieMode === 'pre' ? 'bg-background text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Before RL
                  </button>
                </div>
              </div>

              {/* Pie Chart Component */}
              <div className='h-[190px] w-full flex items-center justify-center'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={data.spendDistribution}
                      dataKey={pieMode === 'post' ? 'postRlSpend' : 'preRlSpend'}
                      nameKey='region'
                      cx='50%'
                      cy='50%'
                      innerRadius={46}
                      outerRadius={74}
                      paddingAngle={3}
                    >
                      {data.spendDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke='var(--card, #09090b)'
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--popover, #09090b)',
                        borderColor: 'var(--border, #27272a)',
                        borderRadius: '8px',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        color: 'var(--popover-foreground, #fff)'
                      }}
                      formatter={(value: any, name: any) => [
                        `₹${Number(value).toLocaleString('en-IN')}/day`,
                        `${name}`
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend with percentages */}
              <div className='grid grid-cols-2 gap-1.5 pt-2 font-mono text-[10px]'>
                {data.spendDistribution.map((item, idx) => (
                  <div key={idx} className='flex items-center justify-between p-1.5 rounded bg-muted/30 border border-border/50'>
                    <div className='flex items-center gap-1.5 truncate'>
                      <span className='size-2 rounded-full shrink-0' style={{ backgroundColor: item.color }} />
                      <span className='text-foreground truncate'>{item.region}</span>
                    </div>
                    <span className='font-bold text-foreground ml-1'>
                      {pieMode === 'post' ? `${item.postRlShare}%` : `${item.preRlShare}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className='pt-2.5 mt-2.5 border-t border-border/40 text-[10px] font-mono text-muted-foreground'>
              {pieMode === 'post'
                ? '✓ Post-RL: North America receives 68% of budget; low-probability zones pruned to 0–3%.'
                : '⚠ Pre-RL: 16% of daily ad budget wasted in LatAm & SEA with low conversion probabilities.'}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: BAR PLOTS (REGIONAL PROBABILITY VS HEADROOM) */}
      {(activeTab === 'bars' || activeTab === 'all') && (
        <div className='rounded-xl border border-border bg-card p-4 sm:p-5 space-y-4 shadow-xs'>
          <div className='flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3'>
            <div>
              <h5 className='font-mono text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2'>
                <IconChartBar className='size-3.5 text-rose-500' />
                Regional Conversion Probability vs. Profit Headroom
              </h5>
              <p className='text-[10px] font-mono text-muted-foreground mt-0.5'>
                Identification of high-headroom expansion zones vs unviable ad suppression regions
              </p>
            </div>
            <div className='flex items-center gap-3 font-mono text-[10px]'>
              <div className='flex items-center gap-1.5 text-muted-foreground'>
                <span className='size-2.5 rounded-xs bg-rose-500' />
                <span>Conversion Probability %</span>
              </div>
              <div className='flex items-center gap-1.5 text-muted-foreground'>
                <span className='size-2.5 rounded-xs bg-emerald-500' />
                <span>Expected Margin Index</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Component */}
          <div className='h-[250px] w-full pt-1'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={data.barComparison} margin={{ top: 10, right: 10, left: -10, bottom: 10 }} barGap={6}>
                <CartesianGrid strokeDasharray='3 3' stroke='currentColor' className='text-border/30' vertical={false} />
                <XAxis
                  dataKey='region'
                  stroke='#71717a'
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke='#71717a'
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--popover, #09090b)',
                    borderColor: 'var(--border, #27272a)',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: 'var(--popover-foreground, #fff)'
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === 'Conversion Probability %') return [`${value}%`, 'Conversion Probability'];
                    return [`${value} pts`, 'Expected Margin Score'];
                  }}
                />
                <Bar
                  dataKey='conversionProbabilityPct'
                  name='Conversion Probability %'
                  fill='#e11d48'
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey='projectedProfitLift'
                  name='Expected Margin Index'
                  fill='#10b981'
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table Breakdown of Regions and RL Actions */}
          <div className='overflow-x-auto pt-1'>
            <table className='w-full font-mono text-xs border border-border/80 rounded-lg overflow-hidden'>
              <thead className='bg-muted/50 text-muted-foreground text-[10px] uppercase font-bold'>
                <tr>
                  <th className='p-2.5 text-left'>Target Region</th>
                  <th className='p-2.5 text-left'>P(Sale) Likelihood</th>
                  <th className='p-2.5 text-left'>Current Spend</th>
                  <th className='p-2.5 text-left'>RL Recommended</th>
                  <th className='p-2.5 text-left'>Budget Shift</th>
                  <th className='p-2.5 text-left'>RL Policy Directive</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border/60 bg-card text-[11px]'>
                {data.regionalStates.map((r, i) => (
                  <tr key={i} className='hover:bg-muted/30 transition-colors'>
                    <td className='p-2.5 font-bold text-foreground flex items-center gap-2'>
                      <span className='size-2 rounded-full' style={{ backgroundColor: r.color }} />
                      {r.region}
                    </td>
                    <td className='p-2.5'>
                      <span className={cn(
                        'font-bold',
                        r.conversionProbability >= 0.7 ? 'text-emerald-600 dark:text-emerald-400' :
                        r.conversionProbability >= 0.4 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
                      )}>
                        {(r.conversionProbability * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className='p-2.5 text-muted-foreground'>₹{r.currentDailySpend.toLocaleString('en-IN')}/day</td>
                    <td className='p-2.5 font-bold text-foreground'>₹{r.recommendedDailySpend.toLocaleString('en-IN')}/day</td>
                    <td className='p-2.5'>
                      <span className={cn(
                        'font-bold inline-flex items-center gap-0.5',
                        r.spendDeltaPct > 0 ? 'text-emerald-600 dark:text-emerald-400' : r.spendDeltaPct < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'
                      )}>
                        {r.spendDeltaPct > 0 ? <IconArrowUpRight className='size-3' /> : r.spendDeltaPct < 0 ? <IconArrowDownRight className='size-3' /> : null}
                        {r.spendDeltaPct > 0 ? `+${r.spendDeltaPct}%` : `${r.spendDeltaPct}%`}
                      </span>
                    </td>
                    <td className='p-2.5'>
                      <span
                        className={cn(
                          'text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider',
                          r.rlAction === 'BOOST_ADS' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                          r.rlAction === 'EXPAND_ADS' ? 'border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400' :
                          r.rlAction === 'MAINTAIN' ? 'border-border bg-muted/40 text-muted-foreground' :
                          r.rlAction === 'SCALE_DOWN' ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                          'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        )}
                      >
                        {r.rlAction === 'BOOST_ADS' && 'BOOST (HIGH HEADROOM)'}
                        {r.rlAction === 'EXPAND_ADS' && 'EXPAND (STRONG ROAS)'}
                        {r.rlAction === 'MAINTAIN' && 'MAINTAIN TEST'}
                        {r.rlAction === 'SCALE_DOWN' && 'SCALE DOWN (-72%)'}
                        {r.rlAction === 'SUPPRESS_ADS' && 'SUPPRESS (LOW PROBABILITY)'}
                      </span>
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
