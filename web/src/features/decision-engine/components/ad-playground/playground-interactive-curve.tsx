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
  IconCheck
} from '@tabler/icons-react';
import type { AdPlaygroundResult, ResponseCurvePoint } from '../../types/ad-playground-types';
import { cn } from '@/lib/utils';

interface PlaygroundInteractiveCurveProps {
  result: AdPlaygroundResult;
  onRunExperiment: () => void;
  isCalculating: boolean;
  calculationStage?: string;
}

export function PlaygroundInteractiveCurve({
  result,
  onRunExperiment,
  isCalculating,
  calculationStage
}: PlaygroundInteractiveCurveProps) {
  const [metricMode, setMetricMode] = useState<'profit' | 'revenue'>('profit');
  const [showSecondaryDetails, setShowSecondaryDetails] = useState(false);

  const topCandidate = result.candidates[0];
  const curveData = result.curve_points;

  // Active operating point on curve
  const currentPoint = curveData.find((p) => p.isCurrent) || curveData[Math.floor(curveData.length / 2)];
  const optimalPoint = curveData.find((p) => p.isOptimal) || curveData[curveData.length - 1];

  const currentSpend = result.daily_budget;
  const currentProfit = currentPoint ? currentPoint.profit : (topCandidate?.predicted_net_profit ?? 0);
  const currentRoas = currentPoint ? currentPoint.roas : (topCandidate?.predicted_roas ?? 0);
  const recommendedDaily = result.optimal_daily_spend || 2400;

  const isProfitable = result.is_profitable;
  const isStockout = result.inventory <= 0;

  return (
    <div className='rounded-2xl border border-zinc-800 bg-[#121215] p-5 font-sans flex flex-col justify-between shadow-xs relative'>
      {/* 1. Header Bar */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3 mb-4'>
        <div>
          <div className='flex items-center gap-2'>
            <IconChartLine className='size-4 text-zinc-300' />
            <h2 className='text-sm sm:text-base font-semibold uppercase tracking-tight text-zinc-100'>
              RESPONSE CURVE &amp; SIMULATOR
            </h2>
          </div>
          <p className='text-[11px] text-zinc-400 mt-0.5 font-sans'>
            Analytical diminishing returns curve (Hill Saturation Model)
          </p>
        </div>

        {/* Curve Mode Switcher */}
        <div className='flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800 text-xs font-sans'>
          <button
            type='button'
            onClick={() => setMetricMode('profit')}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
              metricMode === 'profit'
                ? 'bg-zinc-800 text-zinc-100 shadow-2xs font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            Net Profit Curve
          </button>
          <button
            type='button'
            onClick={() => setMetricMode('revenue')}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
              metricMode === 'revenue'
                ? 'bg-zinc-800 text-zinc-100 shadow-2xs font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            Gross Revenue Curve
          </button>
        </div>
      </div>

      {/* 2. Top Metric Banner (Minimal 3 Key Results) */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4'>
        {/* Metric 1: Expected Profit */}
        <div className='p-3.5 rounded-xl border border-zinc-800 bg-[#18181b]/50 flex flex-col justify-between'>
          <span className='text-[10px] text-zinc-400 uppercase font-semibold tracking-wider flex items-center justify-between font-sans'>
            <span>EXPECTED PROFIT</span>
            <IconSparkles className='size-3 text-zinc-300' />
          </span>
          <div className='mt-2'>
            <div
              className={cn(
                'text-2xl sm:text-3xl font-mono tabular-nums font-bold tracking-tight',
                isStockout || currentProfit < 0
                  ? 'text-rose-400'
                  : 'text-zinc-100'
              )}
            >
              {isStockout
                ? '$0 (STOCKOUT)'
                : currentProfit < 0
                  ? `-$${Math.abs(currentProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : `$${currentProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </div>
            <span className='text-[10px] text-zinc-500 block mt-0.5 font-sans'>
              {currentProfit < 0 ? 'Negative yield — reduce spend' : 'Net marginal contribution'}
            </span>
          </div>
        </div>

        {/* Metric 2: Predicted ROAS */}
        <div className='p-3.5 rounded-xl border border-zinc-800 bg-[#18181b]/50 flex flex-col justify-between'>
          <span className='text-[10px] text-zinc-400 uppercase font-semibold tracking-wider flex items-center justify-between font-sans'>
            <span>PREDICTED ROAS</span>
            <IconTrendingUp className='size-3 text-zinc-300' />
          </span>
          <div className='mt-2'>
            <div className='text-2xl sm:text-3xl font-mono tabular-nums font-bold text-zinc-100 tracking-tight'>
              {isStockout ? '0.00x' : `${currentRoas.toFixed(2)}x`}
            </div>
            <span className='text-[10px] text-zinc-500 block mt-0.5 font-sans'>
              Floor target: 1.80x
            </span>
          </div>
        </div>

        {/* Metric 3: Recommended Daily Budget */}
        <div className='p-3.5 rounded-xl border border-zinc-800 bg-[#18181b]/50 flex flex-col justify-between'>
          <span className='text-[10px] text-zinc-400 uppercase font-semibold tracking-wider flex items-center justify-between font-sans'>
            <span>RECOMMENDED BUDGET</span>
            <IconCoins className='size-3 text-zinc-300' />
          </span>
          <div className='mt-2'>
            <div className='text-2xl sm:text-3xl font-mono tabular-nums font-bold text-zinc-100 tracking-tight'>
              {isStockout ? '$0' : `$${recommendedDaily.toLocaleString()}`}
              <span className='text-xs font-normal text-zinc-500 ml-1 font-sans'>/day</span>
            </div>
            <span className='text-[10px] text-zinc-500 block mt-0.5 font-sans'>
              {isStockout
                ? 'Pause until stock arrives'
                : currentSpend < recommendedDaily
                  ? `Room to scale +$${(recommendedDaily - currentSpend).toLocaleString()}`
                  : 'Near diminishing returns cap'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Recharts Large Interactive Hill Response Curve */}
      <div className='relative w-full h-[260px] sm:h-[300px] my-1 bg-black/20 rounded-xl p-2 border border-border/40'>
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
              tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
            />
            <YAxis
              stroke='#52525b'
              fontSize={10}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload as ResponseCurvePoint;
                return (
                  <div className='rounded-lg border border-zinc-800 bg-[#121215]/95 p-2.5 shadow-xl font-mono tabular-nums text-[11px] backdrop-blur-md'>
                    <div className='font-semibold text-zinc-100 mb-1'>Spend: ${d.spend.toLocaleString()} / day</div>
                    <div className='space-y-0.5'>
                      <div className='flex justify-between gap-3 text-zinc-200'>
                        <span className='font-sans text-zinc-400'>Expected Profit:</span>
                        <span className='font-semibold'>${d.profit.toLocaleString()}</span>
                      </div>
                      <div className='flex justify-between gap-3 text-zinc-300'>
                        <span className='font-sans text-zinc-400'>Gross Revenue:</span>
                        <span>${d.revenue.toLocaleString()}</span>
                      </div>
                      <div className='flex justify-between gap-3 text-zinc-400'>
                        <span className='font-sans text-zinc-400'>ROAS:</span>
                        <span>{d.roas.toFixed(2)}x</span>
                      </div>
                      <div className='flex justify-between gap-3 text-zinc-400 text-[10px]'>
                        <span className='font-sans text-zinc-400'>Marginal Return:</span>
                        <span>${d.marginalYield} / $1 spend</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />

            <Area
              type='monotone'
              dataKey={metricMode === 'profit' ? 'profit' : 'revenue'}
              stroke={metricMode === 'profit' ? '#10b981' : '#06b6d4'}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={metricMode === 'profit' ? 'url(#curveProfitGrad)' : 'url(#curveRevenueGrad)'}
            />

            {/* Operating Point Marker */}
            {currentPoint && (
              <ReferenceDot
                x={currentPoint.spend}
                y={metricMode === 'profit' ? currentPoint.profit : currentPoint.revenue}
                r={6}
                fill='#38bdf8'
                stroke='#ffffff'
                strokeWidth={2}
              />
            )}

            {/* Optimal Profit Marker */}
            {optimalPoint && (
              <ReferenceDot
                x={optimalPoint.spend}
                y={metricMode === 'profit' ? optimalPoint.profit : optimalPoint.revenue}
                r={5}
                fill='#10b981'
                stroke='#ffffff'
                strokeWidth={1.5}
              />
            )}

            {/* Saturation Threshold Reference Line */}
            {result.saturation_daily_spend > 0 && (
              <ReferenceLine
                x={result.saturation_daily_spend}
                stroke='#f59e0b'
                strokeDasharray='3 3'
                label={{
                  value: 'Saturation Threshold',
                  fill: '#f59e0b',
                  fontSize: 10,
                  position: 'top'
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>

        {/* Legend Overlay */}
        <div className='absolute bottom-3 left-4 flex items-center gap-4 text-[10px] text-zinc-400 bg-zinc-900/90 px-2.5 py-1 rounded-md border border-zinc-800 font-sans'>
          <span className='flex items-center gap-1.5'>
            <span className='size-2 rounded-full bg-zinc-400' />
            Current Operating Point (${currentSpend.toLocaleString()}/day)
          </span>
          <span className='flex items-center gap-1.5'>
            <span className='size-2 rounded-full bg-zinc-200' />
            Optimal Yield (${optimalPoint?.spend.toLocaleString()}/day)
          </span>
          <span className='flex items-center gap-1.5 text-zinc-400'>
            <span className='size-2 rounded-full bg-zinc-500' />
            Diminishing Returns Zone
          </span>
        </div>
      </div>

      {/* 4. RUN EXPERIMENT Action Trigger & Execution States */}
      <div className='mt-4 pt-3 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3'>
        <div className='flex items-center gap-2 text-xs font-sans'>
          {isCalculating ? (
            <div className='flex items-center gap-2 text-zinc-300 font-semibold'>
              <span className='size-2 rounded-full bg-zinc-400' />
              <span>{calculationStage || 'CALCULATING CANDIDATES...'}</span>
            </div>
          ) : isStockout ? (
            <div className='flex items-center gap-1.5 text-rose-400 font-semibold'>
              <IconAlertTriangle className='size-4' />
              <span>Zero warehouse inventory. Experiment evaluates stockout defense.</span>
            </div>
          ) : !isProfitable ? (
            <div className='flex items-center gap-1.5 text-amber-400 font-semibold'>
              <IconAlertTriangle className='size-4' />
              <span>Negative profit detected. Optimizer recommends reducing budget.</span>
            </div>
          ) : (
            <div className='flex items-center gap-1.5 text-emerald-400 font-semibold'>
              <IconCheck className='size-4' />
              <span>Deterministic Hill optimization valid across 10 candidates.</span>
            </div>
          )}
        </div>

        <div className='flex items-center gap-2 w-full sm:w-auto'>
          <button
            type='button'
            onClick={() => setShowSecondaryDetails(!showSecondaryDetails)}
            className='px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-xs font-sans text-zinc-300 transition-all shrink-0'
          >
            {showSecondaryDetails ? 'Hide details' : 'View details'}
          </button>

          <button
            type='button'
            onClick={onRunExperiment}
            disabled={isCalculating}
            className='flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-zinc-100 text-zinc-950 font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 disabled:opacity-50'
          >
            <IconPlayerPlay className={cn('size-3.5', isCalculating && 'animate-spin')} />
            <span>{isCalculating ? 'RUNNING EXPERIMENT...' : 'RUN EXPERIMENT'}</span>
          </button>
        </div>
      </div>

      {/* Secondary Detailed KPIs Drawer (Hidden by default to maintain 3 Key Results) */}
      {showSecondaryDetails && (
        <div className='mt-4 pt-3 border-t border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in fade-in-0 duration-150 font-sans'>
          <div className='p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800'>
            <span className='text-[10px] text-zinc-400 block font-sans'>Daily Revenue</span>
            <span className='text-sm font-semibold font-mono tabular-nums text-zinc-100'>
              ${(currentPoint?.revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className='p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800'>
            <span className='text-[10px] text-zinc-400 block font-sans'>Marginal Return</span>
            <span className='text-sm font-semibold font-mono tabular-nums text-zinc-100'>
              ${result.marginal_profit_at_operating_point} / $1
            </span>
          </div>
          <div className='p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800'>
            <span className='text-[10px] text-zinc-400 block font-sans'>Capacity Ceiling (a)</span>
            <span className='text-sm font-semibold font-mono tabular-nums text-zinc-100'>
              ${result.hill_parameters.capacity_a.toLocaleString()}
            </span>
          </div>
          <div className='p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800'>
            <span className='text-[10px] text-zinc-400 block font-sans'>Elasticity (b)</span>
            <span className='text-sm font-semibold font-mono tabular-nums text-zinc-100'>
              {result.hill_parameters.elasticity_b.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
