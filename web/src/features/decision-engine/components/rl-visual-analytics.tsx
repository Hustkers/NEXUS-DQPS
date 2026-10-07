'use client';

import React, { useState, useMemo } from 'react';
import {
  IconCpu,
  IconTrendingUp,
  IconSparkles,
  IconPlayerPlay,
  IconChevronRight,
  IconArrowUpRight,
  IconArrowDownRight,
  IconArrowRight,
  IconInfoCircle
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import type { RLOptimizationResult, RegionalRLState } from '@/lib/rl-ad-optimizer';

interface RLVisualAnalyticsProps {
  data: RLOptimizationResult;
  selectedRegionId?: string | null;
  onSelectRegion?: (regionId: string | null) => void;
  onApplyAction?: (action?: any) => void;
  className?: string;
}

export function RLVisualAnalytics({
  data,
  selectedRegionId,
  onSelectRegion,
  className
}: RLVisualAnalyticsProps) {
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainStep, setRetrainStep] = useState(24);
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [activePipelineNode, setActivePipelineNode] = useState<number | null>(null);

  // Active inspected region (default to highest lift or selected)
  const activeRegion = useMemo(() => {
    if (selectedRegionId) {
      const match = data.regionalStates.find(
        (r) => r.id === selectedRegionId || r.countryCode.toLowerCase() === selectedRegionId.toLowerCase()
      );
      if (match) return match;
    }
    return data.regionalStates[0] ?? null;
  }, [selectedRegionId, data.regionalStates]);

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
    }, 70);
  };

  const filteredLearningCurve = data.learningCurve.slice(0, retrainStep);

  // Prepare scatter data for Regional Opportunity (Conversion Probability vs Profit Headroom)
  const scatterData = useMemo(() => {
    return data.regionalStates.map((r) => ({
      id: r.id,
      region: r.region,
      countryCode: r.countryCode,
      x: Math.round(r.conversionProbability * 100), // X: Conversion Probability %
      y: Math.round(r.marginalRoasHeadroom * 10) / 10, // Y: Profit Headroom Score
      z: r.currentDailySpend, // Bubble size: Current Spend
      spend: r.currentDailySpend,
      recommended: r.recommendedDailySpend,
      delta: r.spendDeltaPct,
      action: r.rlAction,
      color: r.color,
      raw: r
    }));
  }, [data.regionalStates]);

  return (
    <div className={cn('flex flex-col space-y-6 text-foreground font-mono', className)}>
      {/* 8. KPI ROW — ULTRA-COMPACT CARDS */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        {/* KPI 1: Expected Profit Lift */}
        <div className='p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col justify-between'>
          <span className='text-[10px] text-muted-foreground uppercase font-bold tracking-wider'>
            PROFIT LIFT
          </span>
          <div className='flex items-baseline gap-2 mt-1'>
            <span className='text-2xl font-black text-emerald-400'>
              +₹{data.totalProjectedProfitLift.toLocaleString('en-IN')}
            </span>
            <span className='text-xs font-bold text-emerald-500'>
              +{data.profitLiftPct}%
            </span>
          </div>
        </div>

        {/* KPI 2: Low-Probability Waste Cut */}
        <div className='p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/5 flex flex-col justify-between'>
          <span className='text-[10px] text-muted-foreground uppercase font-bold tracking-wider'>
            WASTE CUT
          </span>
          <div className='flex items-baseline gap-1 mt-1'>
            <span className='text-2xl font-black text-rose-400'>
              ₹{data.lowProbabilitySpendAvoided.toLocaleString('en-IN')}
            </span>
            <span className='text-xs text-rose-500'>/day</span>
          </div>
        </div>

        {/* KPI 3: Policy Confidence */}
        <div className='p-3.5 rounded-xl border border-border bg-card/60 flex flex-col justify-between'>
          <span className='text-[10px] text-muted-foreground uppercase font-bold tracking-wider'>
            CONFIDENCE
          </span>
          <div className='flex items-baseline gap-2 mt-1'>
            <span className='text-2xl font-black text-foreground'>
              {(data.policyConfidence * 100).toFixed(1)}%
            </span>
            <span className='text-[10px] text-cyan-400'>converged</span>
          </div>
        </div>

        {/* KPI 4: Exploration Rate & Retrain */}
        <div className='p-3.5 rounded-xl border border-border bg-card/60 flex flex-col justify-between'>
          <span className='text-[10px] text-muted-foreground uppercase font-bold tracking-wider'>
            EXPLORATION
          </span>
          <div className='flex items-center justify-between mt-1'>
            <span className='text-2xl font-black text-foreground'>
              {(data.explorationRate * 100).toFixed(0)}%
            </span>
            <Button
              size='sm'
              variant='outline'
              onClick={handleRetrain}
              disabled={isRetraining}
              className='h-6 px-2 text-[10px] border-border bg-muted/40 hover:bg-muted text-foreground'
            >
              <IconPlayerPlay className='size-3 mr-1 text-emerald-400' />
              {isRetraining ? 'Learning...' : 'Re-Train'}
            </Button>
          </div>
        </div>
      </div>

      {/* 6 & 7. RL PIPELINE: CLOSED-LOOP VISUAL FLOW (STATE -> POLICY -> ACTION -> REWARD) */}
      <div className='rounded-xl border border-border bg-card/70 p-4 space-y-3'>
        <div className='flex items-center justify-between text-xs border-b border-border/50 pb-2.5'>
          <div className='flex items-center gap-2'>
            <IconCpu className='size-4 text-cyan-400' />
            <span className='font-bold uppercase tracking-wider text-foreground'>RL CLOSED-LOOP POLICY</span>
          </div>
          <span className='text-[10px] text-muted-foreground'>Adaptive Multi-Armed Bandit Loop</span>
        </div>

        {/* Animated Horizontal Pipeline */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 relative'>
          {/* Node 1: STATE */}
          <button
            type='button'
            onClick={() => setActivePipelineNode(activePipelineNode === 1 ? null : 1)}
            className={cn(
              'p-3 rounded-lg border text-left transition-all cursor-pointer group flex flex-col justify-between',
              activePipelineNode === 1
                ? 'bg-cyan-500/15 border-cyan-400 ring-1 ring-cyan-400/40'
                : 'bg-muted/20 border-border hover:border-cyan-500/40'
            )}
          >
            <div>
              <div className='flex items-center justify-between text-[10px] text-cyan-400 font-bold'>
                <span>1. STATE</span>
                <span className='size-1.5 rounded-full bg-cyan-400 animate-pulse' />
              </div>
              <div className='text-xs font-bold text-foreground mt-1'>Market signals</div>
              <div className='text-[10px] text-muted-foreground mt-0.5 truncate'>
                P(Sale) &amp; Inventory intent
              </div>
            </div>
            <div className='text-[9px] text-cyan-400/80 pt-2 flex items-center justify-between border-t border-border/40 mt-2'>
              <span>US 78% • LATAM 14%</span>
              <IconArrowRight className='size-3 text-muted-foreground' />
            </div>
          </button>

          {/* Node 2: POLICY */}
          <button
            type='button'
            onClick={() => setActivePipelineNode(activePipelineNode === 2 ? null : 2)}
            className={cn(
              'p-3 rounded-lg border text-left transition-all cursor-pointer group flex flex-col justify-between',
              activePipelineNode === 2
                ? 'bg-purple-500/15 border-purple-400 ring-1 ring-purple-400/40'
                : 'bg-muted/20 border-border hover:border-purple-500/40'
            )}
          >
            <div>
              <div className='flex items-center justify-between text-[10px] text-purple-400 font-bold'>
                <span>2. POLICY</span>
                <span className='size-1.5 rounded-full bg-purple-400 animate-pulse' />
              </div>
              <div className='text-xs font-bold text-foreground mt-1'>Marginal headroom</div>
              <div className='text-[10px] text-muted-foreground mt-0.5 truncate'>
                dProfit / dSpend gradient
              </div>
            </div>
            <div className='text-[9px] text-purple-400/80 pt-2 flex items-center justify-between border-t border-border/40 mt-2'>
              <span>SLSQP Multi-Armed Q(s,a)</span>
              <IconArrowRight className='size-3 text-muted-foreground' />
            </div>
          </button>

          {/* Node 3: ACTION */}
          <button
            type='button'
            onClick={() => setActivePipelineNode(activePipelineNode === 3 ? null : 3)}
            className={cn(
              'p-3 rounded-lg border text-left transition-all cursor-pointer group flex flex-col justify-between',
              activePipelineNode === 3
                ? 'bg-amber-500/15 border-amber-400 ring-1 ring-amber-400/40'
                : 'bg-muted/20 border-border hover:border-amber-500/40'
            )}
          >
            <div>
              <div className='flex items-center justify-between text-[10px] text-amber-400 font-bold'>
                <span>3. ACTION</span>
                <span className='size-1.5 rounded-full bg-amber-400 animate-pulse' />
              </div>
              <div className='text-xs font-bold text-foreground mt-1'>Reallocate budget</div>
              <div className='text-[10px] text-muted-foreground mt-0.5 truncate'>
                Suppress low-prob &amp; boost headroom
              </div>
            </div>
            <div className='text-[9px] text-amber-400/80 pt-2 flex items-center justify-between border-t border-border/40 mt-2'>
              <span>Scale US (+68%) • Cut SEA (-88%)</span>
              <IconArrowRight className='size-3 text-muted-foreground' />
            </div>
          </button>

          {/* Node 4: REWARD */}
          <button
            type='button'
            onClick={() => setActivePipelineNode(activePipelineNode === 4 ? null : 4)}
            className={cn(
              'p-3 rounded-lg border text-left transition-all cursor-pointer group flex flex-col justify-between',
              activePipelineNode === 4
                ? 'bg-emerald-500/15 border-emerald-400 ring-1 ring-emerald-400/40'
                : 'bg-muted/20 border-border hover:border-emerald-500/40'
            )}
          >
            <div>
              <div className='flex items-center justify-between text-[10px] text-emerald-400 font-bold'>
                <span>4. REWARD</span>
                <span className='size-1.5 rounded-full bg-emerald-400 animate-pulse' />
              </div>
              <div className='text-xs font-bold text-foreground mt-1'>Profit lift</div>
              <div className='text-[10px] text-muted-foreground mt-0.5 truncate'>
                ΔMargin − ΔSpend feedback loop
              </div>
            </div>
            <div className='text-[9px] text-emerald-400/80 pt-2 flex items-center justify-between border-t border-border/40 mt-2'>
              <span>+₹{data.totalProjectedProfitLift.toLocaleString('en-IN')} / day</span>
              <span className='text-[9px] text-muted-foreground font-bold'>↺ loop</span>
            </div>
          </button>
        </div>

        {/* Click-to-inspect pipeline node detail drawer */}
        {activePipelineNode && (
          <div className='p-3 rounded-lg bg-muted/40 border border-border/60 text-xs animate-in fade-in-0 duration-150'>
            {activePipelineNode === 1 && (
              <div className='flex items-center justify-between'>
                <span className='text-cyan-400 font-bold'>State Ingestion</span>
                <span className='text-muted-foreground'>
                  Posterior telemetry: US East (78% P_sale), EMEA (56%), APAC (44%), LATAM (14%), SEA (9%).
                </span>
                <Button size='sm' variant='ghost' className='h-6 text-[10px]' onClick={() => setActivePipelineNode(null)}>Close</Button>
              </div>
            )}
            {activePipelineNode === 2 && (
              <div className='flex items-center justify-between'>
                <span className='text-purple-400 font-bold'>Policy Solver</span>
                <span className='text-muted-foreground'>
                  Thompson Sampling evaluating dProfit/dSpend gradients with audience fatigue penalty factor.
                </span>
                <Button size='sm' variant='ghost' className='h-6 text-[10px]' onClick={() => setActivePipelineNode(null)}>Close</Button>
              </div>
            )}
            {activePipelineNode === 3 && (
              <div className='flex items-center justify-between'>
                <span className='text-amber-400 font-bold'>Action Dispatch</span>
                <span className='text-muted-foreground'>
                  Capital shifts: +68% budget to high headroom US, -72% to LATAM, -88% to SEA.
                </span>
                <Button size='sm' variant='ghost' className='h-6 text-[10px]' onClick={() => setActivePipelineNode(null)}>Close</Button>
              </div>
            )}
            {activePipelineNode === 4 && (
              <div className='flex items-center justify-between'>
                <span className='text-emerald-400 font-bold'>Reward Update</span>
                <span className='text-muted-foreground'>
                  Beta priors updated on real-time transaction returns, closing the continuous learning loop.
                </span>
                <Button size='sm' variant='ghost' className='h-6 text-[10px]' onClick={() => setActivePipelineNode(null)}>Close</Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 11 & 12. REGIONAL OPPORTUNITY (INTERACTIVE SCATTER CHART) & INTERACTIVE INSPECTION */}
      <div className='rounded-xl border border-border bg-card/70 p-4 sm:p-5 space-y-4'>
        <div className='flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2.5'>
          <div>
            <h4 className='font-mono text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2'>
              <span>REGIONAL OPPORTUNITY</span>
              <span className='text-[10px] text-muted-foreground font-normal'>
                Probability × Profit Headroom (Bubble = Current Spend)
              </span>
            </h4>
          </div>
          <div className='flex items-center gap-2 text-[10px]'>
            <span className='flex items-center gap-1 text-emerald-400'>
              <span className='size-2 rounded-full bg-emerald-400' /> High Headroom (Scale)
            </span>
            <span className='flex items-center gap-1 text-rose-400 ml-2'>
              <span className='size-2 rounded-full bg-rose-400' /> Low Prob (Suppress)
            </span>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-5'>
          {/* Scatter / Opportunity Chart */}
          <div className='lg:col-span-8 h-[240px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <ScatterChart margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray='3 3' stroke='currentColor' className='text-border/30' />
                <XAxis
                  type='number'
                  dataKey='x'
                  name='Conversion Probability'
                  unit='%'
                  domain={[0, 100]}
                  stroke='#71717a'
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type='number'
                  dataKey='y'
                  name='Headroom Index'
                  domain={[0, 3.5]}
                  stroke='#71717a'
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <ZAxis type='number' dataKey='z' range={[80, 420]} name='Current Spend' />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (!payload || !payload.length) return null;
                    const pt = payload[0].payload;
                    return (
                      <div className='p-2 rounded bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-100 space-y-1 shadow-lg'>
                        <div className='font-bold text-cyan-400'>{pt.region}</div>
                        <div>P(Sale): <span className='text-white font-bold'>{pt.x}%</span></div>
                        <div>Headroom Index: <span className='text-white font-bold'>{pt.y}</span></div>
                        <div>Spend: <span className='text-white font-bold'>₹{pt.spend} → ₹{pt.recommended} ({pt.delta > 0 ? `+${pt.delta}%` : `${pt.delta}%`})</span></div>
                        <div className='text-[10px] text-zinc-400'>Click to focus region</div>
                      </div>
                    );
                  }}
                />
                <Scatter
                  name='Regions'
                  data={scatterData}
                  onClick={(pt: any) => onSelectRegion?.(pt?.id || pt?.payload?.id)}
                  className='cursor-pointer'
                >
                  {scatterData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={activeRegion?.id === entry.id ? '#ffffff' : entry.color}
                      strokeWidth={activeRegion?.id === entry.id ? 2 : 1}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Region Interactive Detail Panel */}
          <div className='lg:col-span-4 p-3.5 rounded-xl border border-border/80 bg-muted/20 flex flex-col justify-between'>
            {activeRegion ? (
              <div className='space-y-2.5'>
                <div className='flex items-center justify-between border-b border-border/50 pb-2'>
                  <div className='flex items-center gap-2'>
                    <span className='size-2.5 rounded-full' style={{ backgroundColor: activeRegion.color }} />
                    <span className='text-xs font-bold text-foreground truncate'>
                      {activeRegion.region.split('(')[0]}
                    </span>
                  </div>
                  <Badge
                    variant='outline'
                    className={cn(
                      'text-[9px] font-bold px-1.5 py-0',
                      activeRegion.rlAction === 'BOOST_ADS' ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' :
                      activeRegion.rlAction === 'EXPAND_ADS' ? 'border-sky-500/40 text-sky-400 bg-sky-500/10' :
                      activeRegion.rlAction === 'MAINTAIN' ? 'border-border text-muted-foreground' :
                      'border-rose-500/40 text-rose-400 bg-rose-500/10'
                    )}
                  >
                    {activeRegion.rlAction.replace('_', ' ')}
                  </Badge>
                </div>

                <div className='space-y-1.5 text-xs'>
                  <div className='flex justify-between items-baseline'>
                    <span className='text-muted-foreground text-[11px]'>Probability:</span>
                    <span className='font-bold text-foreground'>
                      {(activeRegion.conversionProbability * 100).toFixed(0)}% P(Sale)
                    </span>
                  </div>
                  <div className='flex justify-between items-baseline'>
                    <span className='text-muted-foreground text-[11px]'>Current Spend:</span>
                    <span className='text-muted-foreground'>₹{activeRegion.currentDailySpend}/day</span>
                  </div>
                  <div className='flex justify-between items-baseline'>
                    <span className='text-muted-foreground text-[11px]'>Recommended:</span>
                    <span className='font-bold text-foreground'>₹{activeRegion.recommendedDailySpend}/day</span>
                  </div>
                  <div className='flex justify-between items-baseline pt-1 border-t border-border/40'>
                    <span className='text-muted-foreground text-[11px]'>Budget Shift:</span>
                    <span className={cn(
                      'font-black',
                      activeRegion.spendDeltaPct > 0 ? 'text-emerald-400' : 'text-rose-400'
                    )}>
                      {activeRegion.spendDeltaPct > 0 ? `+${activeRegion.spendDeltaPct}%` : `${activeRegion.spendDeltaPct}%`}
                    </span>
                  </div>
                </div>

                <div className='pt-2 text-[10px] text-muted-foreground leading-relaxed line-clamp-2'>
                  {activeRegion.actionRationale}
                </div>
              </div>
            ) : (
              <div className='text-center py-6 text-muted-foreground text-xs'>
                Click any bubble or region to inspect
              </div>
            )}

            {/* Quick region selector tabs */}
            <div className='flex items-center gap-1 overflow-x-auto pt-2 border-t border-border/40 mt-2'>
              {data.regionalStates.map((r) => (
                <button
                  key={r.id}
                  type='button'
                  onClick={() => onSelectRegion?.(r.id)}
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-bold transition-all shrink-0',
                    activeRegion?.id === r.id
                      ? 'bg-foreground text-background'
                      : 'bg-muted/40 text-muted-foreground hover:text-foreground'
                  )}
                >
                  {r.countryCode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 9. PROFIT CONVERGENCE CHART (CLEAN & MINIMAL) */}
      <div className='rounded-xl border border-border bg-card/70 p-4 sm:p-5 space-y-3'>
        <div className='flex items-center justify-between border-b border-border/50 pb-2.5'>
          <div className='flex items-center gap-2'>
            <IconTrendingUp className='size-4 text-emerald-400' />
            <h4 className='font-mono text-xs font-bold uppercase tracking-wider text-foreground'>
              PROFIT CONVERGENCE
            </h4>
          </div>
          <div className='flex items-center gap-3 text-[10px] font-bold'>
            <span className='text-emerald-400'>RL OPTIMAL</span>
            <span className='text-muted-foreground'>vs</span>
            <span className='text-zinc-500'>BASELINE</span>
            <span className='text-emerald-400 ml-1'>
              +₹{data.totalProjectedProfitLift.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className='h-[200px] w-full pt-1'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={filteredLearningCurve} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id='rlProfitGradClean' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#10b981' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='#10b981' stopOpacity={0.0} />
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
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: 'var(--popover-foreground, #fff)'
                }}
                formatter={(value: any, name: any) => [
                  `₹${Number(value).toLocaleString('en-IN')}`,
                  name === 'rlPolicyProfit' ? 'RL Adaptive' : 'Baseline'
                ]}
                labelFormatter={(ep) => `Episode ${ep}`}
              />
              <Area
                type='monotone'
                dataKey='rlPolicyProfit'
                name='rlPolicyProfit'
                stroke='#10b981'
                strokeWidth={2}
                fillOpacity={1}
                fill='url(#rlProfitGradClean)'
              />
              <Area
                type='monotone'
                dataKey='baselineProfit'
                name='baselineProfit'
                stroke='#71717a'
                strokeWidth={1.5}
                strokeDasharray='4 4'
                fillOpacity={0}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 15 & 16. PROGRESSIVE DISCLOSURE: TECHNICAL DETAILS DRAWER */}
      <div className='pt-1'>
        <button
          type='button'
          onClick={() => setShowTechDetails(!showTechDetails)}
          className='flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors'
        >
          <IconChevronRight className={cn('size-3.5 transition-transform', showTechDetails && 'rotate-90')} />
          <span>TECHNICAL DETAILS &amp; POSTERIOR DISTRIBUTIONS</span>
        </button>

        {showTechDetails && (
          <div className='mt-3 p-4 rounded-xl border border-border/80 bg-muted/20 text-xs space-y-3 animate-in fade-in-0 duration-150'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]'>
              <div className='p-2.5 rounded bg-card/60 border border-border/50 space-y-1'>
                <div className='text-muted-foreground font-bold'>Algorithm Formulation</div>
                <div className='text-foreground'>Contextual Multi-Armed Bandit with SLSQP Gradient Solver</div>
              </div>
              <div className='p-2.5 rounded bg-card/60 border border-border/50 space-y-1'>
                <div className='text-muted-foreground font-bold'>Priors &amp; Posteriors</div>
                <div className='text-foreground'>Thompson Sampling Beta(α, β) with conjugate update</div>
              </div>
              <div className='p-2.5 rounded bg-card/60 border border-border/50 space-y-1'>
                <div className='text-muted-foreground font-bold'>Reward Optimization</div>
                <div className='text-foreground'>Reward = ΔMargin − ΔSpend − Penalty(low_prob_waste)</div>
              </div>
            </div>

            {/* Optional Raw Table for developers / auditors */}
            <div className='overflow-x-auto pt-1'>
              <table className='w-full font-mono text-[11px] border border-border/60 rounded overflow-hidden'>
                <thead className='bg-muted/40 text-muted-foreground uppercase text-[9px]'>
                  <tr>
                    <th className='p-2 text-left'>Region</th>
                    <th className='p-2 text-left'>P(Sale)</th>
                    <th className='p-2 text-left'>Pre-RL Spend</th>
                    <th className='p-2 text-left'>RL Recommended</th>
                    <th className='p-2 text-left'>Shift</th>
                    <th className='p-2 text-left'>Directive</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border/40 bg-card/40'>
                  {data.regionalStates.map((r, i) => (
                    <tr key={i}>
                      <td className='p-2 font-bold'>{r.region}</td>
                      <td className='p-2'>{(r.conversionProbability * 100).toFixed(0)}%</td>
                      <td className='p-2 text-muted-foreground'>₹{r.currentDailySpend}/d</td>
                      <td className='p-2 font-bold'>₹{r.recommendedDailySpend}/d</td>
                      <td className={cn('p-2 font-bold', r.spendDeltaPct > 0 ? 'text-emerald-400' : 'text-rose-400')}>
                        {r.spendDeltaPct > 0 ? `+${r.spendDeltaPct}%` : `${r.spendDeltaPct}%`}
                      </td>
                      <td className='p-2 text-[10px]'>{r.rlAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
