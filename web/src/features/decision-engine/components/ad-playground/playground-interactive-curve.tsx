'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceDot
} from 'recharts';
import {
  IconPlayerPlay,
  IconSparkles,
  IconTrendingUp,
  IconCoins,
  IconChartLine,
  IconAlertTriangle,
  IconCheck,
  IconScale
} from '@tabler/icons-react';
import type { AdPlaygroundResult, ResponseCurvePoint } from '../../types/ad-playground-types';
import { AnimatedNumber } from './animated-number';
import { cn } from '@/lib/utils';

export type ExperimentStatus = 'idle' | 'running' | 'success' | 'error';

interface PlaygroundInteractiveCurveProps {
  result: AdPlaygroundResult;
  onRunExperiment: () => void;
  isCalculating: boolean;
  calculationStage?: string;
  experimentStatus?: ExperimentStatus;
  errorMessage?: string | null;
  evaluationSpend?: number | null;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ResponseCurvePoint }>;
}

function CurveTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className='rounded-lg border border-border bg-popover/95 p-2.5 shadow-xl font-mono text-[11px] backdrop-blur-md'>
      <div className='font-bold text-foreground mb-1'>Spend: ₹{d.spend.toLocaleString()} / day</div>
      <div className='space-y-0.5'>
        <div className='flex justify-between gap-3 text-emerald-400'>
          <span>Expected Profit:</span>
          <span className='font-bold'>₹{d.profit.toLocaleString()}</span>
        </div>
        <div className='flex justify-between gap-3 text-cyan-400'>
          <span>Gross Revenue:</span>
          <span>₹{d.revenue.toLocaleString()}</span>
        </div>
        <div className='flex justify-between gap-3 text-muted-foreground'>
          <span>ROAS:</span>
          <span>{d.roas.toFixed(2)}x</span>
        </div>
        <div className='flex justify-between gap-3 text-amber-400 text-[10px]'>
          <span>Marginal Return:</span>
          <span>₹{d.marginalYield} / ₹1 spend</span>
        </div>
      </div>
    </div>
  );
}

export function PlaygroundInteractiveCurve({
  result,
  onRunExperiment,
  isCalculating,
  calculationStage,
  experimentStatus = 'idle',
  errorMessage,
  evaluationSpend
}: PlaygroundInteractiveCurveProps) {
  const [metricMode, setMetricMode] = useState<'profit' | 'revenue'>('profit');
  const [showSecondaryDetails, setShowSecondaryDetails] = useState(false);

  const topCandidate = result.candidates[0];
  const curveData = result.curve_points;

  // Active operating point on curve
  const currentPoint =
    curveData.find((p) => p.isCurrent) ||
    curveData.find((p) => Math.abs(p.spend - result.daily_budget) < 150) ||
    curveData[Math.floor(curveData.length / 2)];
  const optimalPoint =
    curveData.find((p) => p.isOptimal) ||
    curveData[0] ||
    curveData[curveData.length - 1];

  const currentSpend = result.daily_budget;
  const isStockout = result.inventory <= 0;
  const isProfitable = result.is_profitable;

  const currentProfit = isStockout ? 0 : (currentPoint ? currentPoint.profit : (topCandidate?.predicted_net_profit ?? 0));
  const currentRoas = isStockout ? 0 : (currentPoint ? currentPoint.roas : (topCandidate?.predicted_roas ?? 0));
  const recommendedDaily = isStockout ? 0 : (result.optimal_daily_spend ?? 0);
  const recommendedProfit = isStockout ? 0 : (optimalPoint ? optimalPoint.profit : (topCandidate?.predicted_net_profit ?? 0));
  const recommendedRoas = isStockout ? 0 : (optimalPoint ? optimalPoint.roas : (topCandidate?.predicted_roas ?? 0));

  // Determine button label and icon based on experimentStatus
  const renderExperimentButton = (extraClass: string = '') => {
    if (isCalculating || experimentStatus === 'running') {
      return (
        <button
          type='button'
          disabled
          className={cn(
            'px-5 py-2.5 rounded-xl bg-foreground/80 text-background font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm shrink-0 cursor-not-allowed opacity-90',
            extraClass
          )}
        >
          <span className='size-3.5 border-2 border-background border-t-transparent rounded-full animate-spin' />
          <span>RUNNING EXPERIMENT...</span>
        </button>
      );
    }

    if (experimentStatus === 'success') {
      return (
        <button
          type='button'
          onClick={onRunExperiment}
          className={cn(
            'px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 ring-2 ring-emerald-500/50 active:scale-95',
            extraClass
          )}
        >
          <IconCheck className='size-3.5 stroke-[3]' />
          <span>EXPERIMENT COMPLETE</span>
        </button>
      );
    }

    if (experimentStatus === 'error') {
      return (
        <button
          type='button'
          onClick={onRunExperiment}
          className={cn(
            'px-5 py-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs uppercase tracking-wider hover:bg-rose-600 transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 ring-2 ring-rose-500/40 active:scale-95',
            extraClass
          )}
        >
          <IconAlertTriangle className='size-3.5' />
          <span>RETRY EXPERIMENT</span>
        </button>
      );
    }

    return (
      <button
        type='button'
        onClick={onRunExperiment}
        className={cn(
          'px-5 py-2.5 rounded-xl bg-foreground text-background font-bold text-xs uppercase tracking-wider hover:bg-foreground/90 transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 active:scale-95',
          extraClass
        )}
      >
        <IconPlayerPlay className='size-3.5 fill-current' />
        <span>RUN EXPERIMENT</span>
      </button>
    );
  };

  return (
    <div className='rounded-2xl border border-border/80 bg-card p-5 font-mono flex flex-col justify-between shadow-xs relative'>
      {/* 1. Header Bar */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3 mb-4'>
        <div>
          <div className='flex items-center gap-2'>
            <IconChartLine className='size-4 text-cyan-400' />
            <h2 className='text-sm sm:text-base font-bold uppercase tracking-tight text-foreground'>
              RESPONSE CURVE &amp; SIMULATOR
            </h2>
          </div>
          <p className='text-[11px] text-muted-foreground mt-0.5'>
            Where additional advertising budget stops paying off (Hill Saturation Model)
          </p>
        </div>

        {/* Curve Mode Switcher */}
        <div className='flex items-center bg-muted/40 rounded-lg p-0.5 border border-border/60 text-xs'>
          <button
            type='button'
            onClick={() => setMetricMode('profit')}
            className={cn(
              'px-2.5 py-1 rounded-md font-semibold transition-all',
              metricMode === 'profit'
                ? 'bg-card text-emerald-400 shadow-2xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Net Profit Curve
          </button>
          <button
            type='button'
            onClick={() => setMetricMode('revenue')}
            className={cn(
              'px-2.5 py-1 rounded-md font-semibold transition-all',
              metricMode === 'revenue'
                ? 'bg-card text-cyan-400 shadow-2xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Gross Revenue Curve
          </button>
        </div>
      </div>

      {/* 2. Top Metric Banner (Minimal 3 Key Results with Animated Numbers) */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4'>
        {/* Metric 1: Expected Profit */}
        <div className='p-3.5 rounded-xl border border-border/60 bg-muted/20 flex flex-col justify-between'>
          <span className='text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center justify-between'>
            <span>EXPECTED PROFIT</span>
            <IconSparkles className='size-3 text-emerald-400' />
          </span>
          <div className='mt-2'>
            <div
              className={cn(
                'text-2xl sm:text-3xl font-black tracking-tight',
                isStockout || currentProfit < 0
                  ? 'text-rose-400'
                  : 'text-emerald-400'
              )}
            >
              {isStockout ? (
                '₹0 (STOCKOUT)'
              ) : currentProfit < 0 ? (
                <AnimatedNumber value={Math.abs(currentProfit)} prefix='-₹' />
              ) : (
                <AnimatedNumber value={currentProfit} prefix='₹' />
              )}
            </div>
            <span className='text-[10px] text-muted-foreground block mt-0.5'>
              {isStockout
                ? 'Zero inventory fulfillment'
                : currentProfit < 0
                  ? 'Negative yield — reduce spend'
                  : 'Net marginal contribution'}
            </span>
          </div>
        </div>

        {/* Metric 2: Predicted ROAS */}
        <div className='p-3.5 rounded-xl border border-border/60 bg-muted/20 flex flex-col justify-between'>
          <span className='text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center justify-between'>
            <span>PREDICTED ROAS</span>
            <IconTrendingUp className='size-3 text-cyan-400' />
          </span>
          <div className='mt-2'>
            <div className='text-2xl sm:text-3xl font-black text-cyan-400 tracking-tight'>
              {isStockout ? (
                '0.00x'
              ) : (
                <AnimatedNumber value={currentRoas} decimals={2} suffix='x' />
              )}
            </div>
            <span className='text-[10px] text-muted-foreground block mt-0.5'>
              Floor target: 1.80x
            </span>
          </div>
        </div>

        {/* Metric 3: Recommended Daily Budget */}
        <div className='p-3.5 rounded-xl border border-border/60 bg-muted/20 flex flex-col justify-between'>
          <span className='text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center justify-between'>
            <span>RECOMMENDED BUDGET</span>
            <IconCoins className='size-3 text-amber-400' />
          </span>
          <div className='mt-2'>
            <div className='text-2xl sm:text-3xl font-black text-foreground tracking-tight'>
              {isStockout ? (
                '₹0'
              ) : (
                <AnimatedNumber value={recommendedDaily} prefix='₹' />
              )}
              <span className='text-xs font-normal text-muted-foreground ml-1'>/day</span>
            </div>
            <span className='text-[10px] text-muted-foreground block mt-0.5'>
              {isStockout
                ? 'Pause until stock arrives'
                : currentSpend < recommendedDaily
                  ? `Room to scale +₹${(recommendedDaily - currentSpend).toLocaleString()}`
                  : 'Near diminishing returns cap'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. VISUAL CURRENT VS RECOMMENDED COMPARISON BANNER */}
      <div className='p-3.5 rounded-xl border border-border/70 bg-muted/15 flex flex-col gap-2.5 mb-4'>
        <div className='flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/40'>
          <span className='flex items-center gap-1.5'>
            <IconScale className='size-3.5 text-cyan-400' />
            WHAT-IF COMPARISON: CURRENT VS RECOMMENDED
          </span>
          {isStockout ? (
            <span className='text-rose-400 font-bold flex items-center gap-1'>
              <IconAlertTriangle className='size-3' />
              ⛔ STOCKOUT CONSTRAINT
            </span>
          ) : (
            <span className='text-emerald-400 font-bold'>
              ● OPTIMIZED FRONTIER
            </span>
          )}
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 items-center'>
          {/* CURRENT OPERATING POINT */}
          <div className='p-2.5 rounded-lg bg-card/60 border border-border/50'>
            <div className='flex items-center justify-between text-[10px] text-muted-foreground mb-1'>
              <span className='font-semibold flex items-center gap-1 text-foreground'>
                <span className='size-2 rounded-full bg-cyan-400' />
                CURRENT OPERATING POINT
              </span>
              <span className='text-[9px] uppercase tracking-wider text-cyan-400'>CONFIGURED</span>
            </div>
            <div className='flex items-baseline justify-between mt-1'>
              <span className='text-lg font-black text-foreground'>
                <AnimatedNumber value={currentSpend} prefix='₹' suffix='/day' />
              </span>
              <span className='text-xs font-bold text-cyan-400'>
                <AnimatedNumber value={currentRoas} decimals={2} suffix='x ROAS' />
              </span>
            </div>
            <div className='text-[10px] text-muted-foreground mt-1 flex justify-between pt-1 border-t border-border/30'>
              <span>Expected Profit:</span>
              <span className={cn('font-semibold', currentProfit < 0 ? 'text-rose-400' : 'text-emerald-400')}>
                {isStockout ? '₹0' : <AnimatedNumber value={currentProfit} prefix='₹' />}
              </span>
            </div>
          </div>

          {/* RECOMMENDED AUTONOMOUS CONFIGURATION */}
          <div
            className={cn(
              'p-2.5 rounded-lg border',
              isStockout
                ? 'bg-rose-950/20 border-rose-500/40'
                : 'bg-emerald-950/20 border-emerald-500/40'
            )}
          >
            <div className='flex items-center justify-between text-[10px] mb-1'>
              <span
                className={cn(
                  'font-semibold flex items-center gap-1',
                  isStockout ? 'text-rose-400' : 'text-emerald-400'
                )}
              >
                <span
                  className={cn(
                    'size-2 rounded-full',
                    isStockout ? 'bg-rose-400' : 'bg-emerald-400 animate-pulse'
                  )}
                />
                AUTONOMOUS RECOMMENDATION
              </span>
              <span
                className={cn(
                  'text-[9px] uppercase tracking-wider font-bold',
                  isStockout ? 'text-rose-400' : 'text-emerald-400'
                )}
              >
                {isStockout ? 'PAUSE SPEND' : 'OPTIMAL YIELD'}
              </span>
            </div>
            <div className='flex items-baseline justify-between mt-1'>
              <span className={cn('text-lg font-black', isStockout ? 'text-rose-400' : 'text-foreground')}>
                <AnimatedNumber value={recommendedDaily} prefix='₹' suffix='/day' />
              </span>
              <span className={cn('text-xs font-bold', isStockout ? 'text-rose-400' : 'text-cyan-400')}>
                <AnimatedNumber value={recommendedRoas} decimals={2} suffix='x ROAS' />
              </span>
            </div>
            <div className='text-[10px] text-muted-foreground mt-1 flex justify-between pt-1 border-t border-border/30'>
              <span>Expected Profit:</span>
              <span className={cn('font-semibold', isStockout ? 'text-rose-400' : 'text-emerald-400')}>
                {isStockout ? '₹0' : <AnimatedNumber value={recommendedProfit} prefix='₹' />}
              </span>
            </div>
          </div>
        </div>

        {/* Delta Summary strip */}
        <div className='text-[10px] pt-1 border-t border-border/30 flex items-center justify-between'>
          {isStockout ? (
            <span className='text-rose-400 flex items-center gap-1 font-semibold'>
              <IconAlertTriangle className='size-3 shrink-0' />
              ⛔ STOCKOUT: 0 units in stock. ₹0/day recommended. Pause spend until stock arrives.
            </span>
          ) : (
            <span className='flex items-center gap-1 text-emerald-400 font-semibold'>
              <IconCheck className='size-3 shrink-0 stroke-[3]' />
              {recommendedDaily > currentSpend
                ? `Engine identifies +₹${(recommendedDaily - currentSpend).toLocaleString()}/day headroom to optimize net profit.`
                : recommendedDaily < currentSpend
                  ? `Engine identifies -₹${(currentSpend - recommendedDaily).toLocaleString()}/day reduction to eliminate diminishing returns waste.`
                  : 'Operating at maximum marginal profit efficiency.'}
            </span>
          )}
        </div>
      </div>

      {/* 4. Recharts Interactive Hill Response Curve */}
      <div className='relative w-full h-[260px] sm:h-[300px] my-1 bg-black/20 rounded-xl p-2 border border-border/40 overflow-hidden'>
        {/* Animated simulation overlay while running */}
        {isCalculating && (
          <div className='absolute inset-0 z-20 bg-background/60 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center gap-2.5 animate-in fade-in-0 duration-200 pointer-events-none'>
            <div className='flex items-center gap-2.5 px-4 py-2 rounded-xl bg-card border border-cyan-500/50 shadow-2xl text-cyan-400 font-mono text-xs font-bold'>
              <span className='size-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin' />
              <span>{calculationStage || 'CALCULATING CANDIDATES...'}</span>
            </div>
            <div className='w-48 h-1 bg-muted/60 rounded-full overflow-hidden'>
              <div className='h-full bg-cyan-400 animate-pulse w-full' />
            </div>
          </div>
        )}

        {/* Stockout badge overlay */}
        {isStockout && (
          <div className='absolute top-3 right-4 z-10 px-2.5 py-1 rounded-md bg-rose-950/80 border border-rose-500/50 text-rose-400 text-[10px] font-bold flex items-center gap-1.5 shadow-md'>
            <IconAlertTriangle className='size-3.5' />
            <span>⛔ ZERO INVENTORY GUARDRAIL ACTIVE</span>
          </div>
        )}

        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={curveData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
            <defs>
              <linearGradient id='curveProfitGrad' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#10b981' stopOpacity={0.4} />
                <stop offset='95%' stopColor='#10b981' stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id='curveRevenueGrad' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#06b6d4' stopOpacity={0.4} />
                <stop offset='95%' stopColor='#06b6d4' stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey='spend'
              stroke='#52525b'
              fontSize={10}
              tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(1)}k`}
            />
            <YAxis
              stroke='#52525b'
              fontSize={10}
              tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CurveTooltip />} />

            <Area
              type='monotone'
              dataKey={metricMode === 'profit' ? 'profit' : 'revenue'}
              stroke={metricMode === 'profit' ? '#10b981' : '#06b6d4'}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={metricMode === 'profit' ? 'url(#curveProfitGrad)' : 'url(#curveRevenueGrad)'}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing='ease-out'
            />

            {/* Operating Point Marker */}
            {currentPoint && (
              <>
                <ReferenceDot
                  x={currentPoint.spend}
                  y={metricMode === 'profit' ? currentPoint.profit : currentPoint.revenue}
                  r={6}
                  fill='#38bdf8'
                  stroke='#ffffff'
                  strokeWidth={2}
                />
                <ReferenceLine
                  x={currentPoint.spend}
                  stroke='#38bdf8'
                  strokeDasharray='4 4'
                  label={{
                    value: `Current: ₹${currentSpend.toLocaleString()}`,
                    fill: '#38bdf8',
                    fontSize: 9,
                    position: 'top'
                  }}
                />
              </>
            )}

            {/* Optimal Profit Marker */}
            {optimalPoint && !isStockout && optimalPoint.spend !== currentPoint?.spend && (
              <>
                <ReferenceDot
                  x={optimalPoint.spend}
                  y={metricMode === 'profit' ? optimalPoint.profit : optimalPoint.revenue}
                  r={6}
                  fill='#10b981'
                  stroke='#ffffff'
                  strokeWidth={2}
                />
                <ReferenceLine
                  x={optimalPoint.spend}
                  stroke='#10b981'
                  strokeDasharray='3 3'
                  label={{
                    value: `Optimal: ₹${recommendedDaily.toLocaleString()}`,
                    fill: '#10b981',
                    fontSize: 9,
                    position: 'top'
                  }}
                />
              </>
            )}

            {/* Scanning evaluation marker during execution */}
            {isCalculating && evaluationSpend !== null && evaluationSpend !== undefined && (
              <ReferenceLine
                x={evaluationSpend}
                stroke='#a855f7'
                strokeWidth={2}
                label={{
                  value: 'Evaluating...',
                  fill: '#a855f7',
                  fontSize: 9,
                  position: 'top'
                }}
              />
            )}

            {/* Saturation Threshold Reference Line */}
            {result.saturation_daily_spend > 0 && (
              <ReferenceLine
                x={result.saturation_daily_spend}
                stroke='#f59e0b'
                strokeDasharray='3 3'
                label={{
                  value: 'Saturation Knee',
                  fill: '#f59e0b',
                  fontSize: 9,
                  position: 'bottom'
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>

        {/* Legend Overlay */}
        <div className='absolute bottom-3 left-4 flex items-center gap-4 text-[10px] text-muted-foreground bg-background/85 px-2.5 py-1 rounded-md border border-border/40 backdrop-blur-xs'>
          <span className='flex items-center gap-1.5'>
            <span className='size-2 rounded-full bg-cyan-400 ring-2 ring-white/50' />
            Current (₹{currentSpend.toLocaleString()}/day)
          </span>
          <span className='flex items-center gap-1.5'>
            <span className='size-2 rounded-full bg-emerald-400 ring-2 ring-white/50' />
            Optimal ({isStockout ? '₹0/day' : `₹${recommendedDaily.toLocaleString()}/day`})
          </span>
          <span className='flex items-center gap-1.5 text-amber-400 hidden sm:flex'>
            <span className='size-2 rounded-full bg-amber-400' />
            Diminishing Returns Zone
          </span>
        </div>
      </div>

      {/* 5. Inline Action Trigger & Execution States */}
      <div className='mt-4 pt-3 border-t border-border/60'>
        {/* Inline Error Banner if error occurred */}
        {errorMessage && (
          <div className='mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between gap-3 animate-in fade-in-0 duration-150'>
            <div className='flex items-center gap-2'>
              <IconAlertTriangle className='size-4 shrink-0' />
              <span>{errorMessage}</span>
            </div>
            <button
              type='button'
              onClick={onRunExperiment}
              className='px-2.5 py-1 rounded-lg bg-rose-500 text-white font-bold text-[10px] uppercase hover:bg-rose-600 transition-all shrink-0'
            >
              Retry
            </button>
          </div>
        )}

        <div className='flex flex-col sm:flex-row items-center justify-between gap-3'>
          <div className='flex items-center gap-2 text-xs'>
            {isCalculating ? (
              <div className='flex items-center gap-2 text-cyan-400 font-bold animate-pulse'>
                <span className='size-2 rounded-full bg-cyan-400 animate-ping' />
                <span>{calculationStage || 'CALCULATING CANDIDATES...'}</span>
              </div>
            ) : experimentStatus === 'success' ? (
              <div className='flex items-center gap-1.5 text-emerald-400 font-bold'>
                <IconCheck className='size-4 stroke-[3]' />
                <span>Experiment executed: Frontier and 10 candidates updated.</span>
              </div>
            ) : isStockout ? (
              <div className='flex items-center gap-1.5 text-rose-400 font-bold'>
                <IconAlertTriangle className='size-4' />
                <span>Zero warehouse inventory. Experiment enforces ₹0 stockout defense.</span>
              </div>
            ) : !isProfitable ? (
              <div className='flex items-center gap-1.5 text-amber-400 font-bold'>
                <IconAlertTriangle className='size-4' />
                <span>Negative yield detected. Optimizer recommends reducing budget.</span>
              </div>
            ) : (
              <div className='flex items-center gap-1.5 text-emerald-400 font-bold'>
                <IconCheck className='size-4' />
                <span>Deterministic Hill optimization evaluated across 10 candidates.</span>
              </div>
            )}
          </div>

          <div className='flex items-center gap-2 w-full sm:w-auto'>
            <button
              type='button'
              onClick={() => setShowSecondaryDetails(!showSecondaryDetails)}
              className='px-3 py-2 rounded-xl border border-border/80 bg-muted/30 hover:bg-muted/60 text-xs font-mono text-muted-foreground hover:text-foreground transition-all shrink-0'
            >
              {showSecondaryDetails ? 'Hide details' : 'View details'}
            </button>

            {renderExperimentButton('flex-1 sm:flex-initial')}
          </div>
        </div>
      </div>

      {/* Secondary Detailed KPIs Drawer */}
      {showSecondaryDetails && (
        <div className='mt-4 pt-3 border-t border-border/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in fade-in-0 duration-150'>
          <div className='p-2.5 rounded-lg bg-muted/20 border border-border/40'>
            <span className='text-[10px] text-muted-foreground block'>Daily Revenue</span>
            <span className='text-sm font-bold text-foreground'>
              ₹{(currentPoint?.revenue || 0).toLocaleString()}
            </span>
          </div>
          <div className='p-2.5 rounded-lg bg-muted/20 border border-border/40'>
            <span className='text-[10px] text-muted-foreground block'>Marginal Return</span>
            <span className='text-sm font-bold text-emerald-400'>
              ₹{result.marginal_profit_at_operating_point} / ₹1
            </span>
          </div>
          <div className='p-2.5 rounded-lg bg-muted/20 border border-border/40'>
            <span className='text-[10px] text-muted-foreground block'>Capacity Ceiling (a)</span>
            <span className='text-sm font-bold text-foreground'>
              ₹{result.hill_parameters.capacity_a.toLocaleString()}
            </span>
          </div>
          <div className='p-2.5 rounded-lg bg-muted/20 border border-border/40'>
            <span className='text-[10px] text-muted-foreground block'>Elasticity (b)</span>
            <span className='text-sm font-bold text-cyan-400'>
              {result.hill_parameters.elasticity_b.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
