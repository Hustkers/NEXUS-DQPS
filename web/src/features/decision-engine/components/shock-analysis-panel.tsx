'use client';

import React, { useEffect, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import {
  computeShockAnalysis,
  formatInr,
  isShockScenarioId
} from '../lib/shock-analysis-math';
import type {
  ShockCausalNode,
  ShockMitigationStep,
  ShockSeverityTone
} from '../types/shock-analysis';

interface ShockAnalysisPanelProps {
  scenarioId: string;
  onClose: () => void;
  onReset: () => void;
}

interface PanelSectionProps {
  title: string;
  hint?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

interface KpiTileProps {
  label: string;
  value: string;
  sub?: string;
  tone?: 'risk' | 'good' | 'neutral';
}

const SEVERITY_CLASS: Record<ShockSeverityTone, string> = {
  critical: 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400',
  high: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  medium: 'border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400'
};

const STEP_TONE: Record<ShockMitigationStep['tone'], { icon: React.ReactNode; text: string }> = {
  risk: {
    icon: <Icons.alertCircle className='size-3.5 shrink-0 text-rose-500' />,
    text: 'text-rose-600 dark:text-rose-400'
  },
  neutral: {
    icon: <Icons.info className='size-3.5 shrink-0 text-muted-foreground' />,
    text: 'text-foreground'
  },
  good: {
    icon: <Icons.circleCheck className='size-3.5 shrink-0 text-emerald-500' />,
    text: 'text-emerald-600 dark:text-emerald-400'
  }
};

const NODE_TONE: Record<ShockCausalNode['tone'], { icon: React.ReactNode; chip: string; text: string }> =
  {
    risk: {
      icon: <Icons.alertCircle className='size-3.5 shrink-0 text-rose-500' />,
      chip: 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400',
      text: 'text-rose-600 dark:text-rose-400'
    },
    warn: {
      icon: <Icons.warning className='size-3.5 shrink-0 text-amber-500' />,
      chip: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400',
      text: 'text-amber-600 dark:text-amber-400'
    },
    good: {
      icon: <Icons.circleCheck className='size-3.5 shrink-0 text-emerald-500' />,
      chip: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      text: 'text-emerald-600 dark:text-emerald-400'
    }
  };

function PanelSection({ title, hint, icon, children }: PanelSectionProps) {
  return (
    <section className='rounded-xl border border-border/80 bg-card p-4 shadow-xs'>
      <div className='mb-3 flex items-center justify-between gap-3 border-b border-border/60 pb-2'>
        <div className='flex items-center gap-2'>
          {icon}
          <h4 className='font-mono text-xs font-bold uppercase tracking-wider text-foreground'>
            {title}
          </h4>
        </div>
        {hint && <span className='hidden font-mono text-[10px] text-muted-foreground sm:block'>{hint}</span>}
      </div>
      {children}
    </section>
  );
}

function KpiTile({ label, value, sub, tone = 'neutral' }: KpiTileProps) {
  return (
    <div className='rounded-lg border border-border/70 bg-slate-50/50 p-3 dark:bg-zinc-950/30'>
      <div className='font-mono text-[10px] uppercase tracking-wider text-muted-foreground'>
        {label}
      </div>
      <div
        className={cn(
          'mt-1 font-mono text-base font-bold',
          tone === 'risk' && 'text-rose-600 dark:text-rose-400',
          tone === 'good' && 'text-emerald-600 dark:text-emerald-400',
          tone === 'neutral' && 'text-foreground'
        )}
      >
        {value}
      </div>
      {sub && <div className='mt-0.5 font-mono text-[10px] text-muted-foreground'>{sub}</div>}
    </div>
  );
}

function roas(value: number): string {
  return `${value.toFixed(2)}x`;
}

function roasTone(value: number): string {
  if (value < 1.8) return 'text-rose-600 dark:text-rose-400 font-bold';
  if (value < 3.2) return 'text-amber-600 dark:text-amber-400';
  return 'text-emerald-600 dark:text-emerald-400';
}

function ShockChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className='rounded-lg border border-border bg-card p-2.5 font-mono text-xs shadow-md'>
      <div className='mb-1 border-b border-border/60 pb-1 text-[11px] font-bold text-foreground'>
        {label}
      </div>
      <div className='space-y-1 text-[11px]'>
        {payload.map((entry) => (
          <div key={String(entry.dataKey)} className='flex justify-between gap-4'>
            <span style={{ color: entry.color }}>{String(entry.dataKey)}</span>
            <span className='font-medium text-foreground'>
              {formatInr(Number(entry.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ShockAnalysisPanel({ scenarioId, onClose, onReset }: ShockAnalysisPanelProps) {
  const analysis = useMemo(
    () => (isShockScenarioId(scenarioId) ? computeShockAnalysis(scenarioId) : null),
    [scenarioId]
  );

  useEffect(() => {
    if (!analysis) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [analysis, onClose]);

  if (!analysis) return null;

  const [baseline, shocked, mitigated] = analysis.series;
  const chartData = [
    {
      metric: 'Revenue',
      Baseline: baseline.revenue,
      Shocked: shocked.revenue,
      Mitigated: mitigated.revenue
    },
    { metric: 'Margin', Baseline: baseline.margin, Shocked: shocked.margin, Mitigated: mitigated.margin },
    { metric: 'Spend', Baseline: baseline.spend, Shocked: shocked.spend, Mitigated: mitigated.spend }
  ];

  const avoidedIsPositive = analysis.loss.avoided.daily >= 0;
  const lostRoas = analysis.baselineRoas - analysis.shockedRoas;

  return (
    <div
      role='presentation'
      className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-2 backdrop-blur-sm sm:p-4 md:p-6'
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role='dialog'
        aria-modal='true'
        aria-label={`Shock analysis: ${analysis.scenarioName}`}
        className='my-auto flex w-full max-w-5xl flex-col gap-4 rounded-2xl border border-border bg-card p-4 text-foreground shadow-2xl sm:p-5'
      >
        {/* 1. HEADER */}
        <header className='flex flex-wrap items-start justify-between gap-3 border-b border-border/70 pb-3'>
          <div className='min-w-0'>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge
                variant='outline'
                className={cn('font-mono text-[10px] font-bold uppercase', SEVERITY_CLASS[analysis.severityTone])}
              >
                {analysis.severity}
              </Badge>
              <span className='font-mono text-[10px] text-muted-foreground'>{analysis.scenarioId}</span>
            </div>
            <h3 className='mt-1.5 font-mono text-base font-bold text-foreground'>
              Shock Analysis — {analysis.scenarioName}
            </h3>
            <p className='mt-0.5 font-mono text-[11px] text-muted-foreground'>
              {analysis.injectedEvent}
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              variant='outline'
              onClick={onReset}
              className='h-8 border-border bg-card px-2.5 font-mono text-xs text-muted-foreground hover:bg-accent hover:text-foreground'
            >
              <Icons.clock className='mr-1.5 size-3' />
              Reset Baseline
            </Button>
            <button
              onClick={onClose}
              aria-label='Close shock analysis'
              className='flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
            >
              <Icons.close className='size-4' />
            </button>
          </div>
        </header>

        {/* 2. KPI STRIP */}
        <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
          <KpiTile
            label='Mitigation Confidence'
            value={`${analysis.confidencePct}%`}
            sub='rule-based, deterministic'
            tone={analysis.confidencePct >= 85 ? 'good' : 'neutral'}
          />
          <KpiTile
            label='Campaigns Affected'
            value={String(analysis.affectedCount)}
            sub={`scope = affected + 1 target`}
            tone={analysis.affectedCount > 1 ? 'risk' : 'neutral'}
          />
          <KpiTile
            label='Scope ROAS B → S → M'
            value={`${roas(analysis.baselineRoas)} → ${roas(analysis.shockedRoas)}`}
            sub={`mitigated ${roas(analysis.mitigatedRoas)} (Δ ${lostRoas >= 0 ? '-' : '+'}${roas(Math.abs(lostRoas))})`}
            tone='risk'
          />
          <KpiTile
            label='Break-even Floor 1.80x'
            value={analysis.breachesFloor ? 'BREACHED' : 'HOLDS'}
            sub={
              analysis.breachesFloor
                ? 'shocked ROAS below floor'
                : 'lowest shocked ROAS stays above floor'
            }
            tone={analysis.breachesFloor ? 'risk' : 'good'}
          />
        </div>

        {/* 3. CAUSE */}
        <PanelSection
          title='Cause — Shock Definition'
          hint='verbatim from baseline scenario record'
          icon={<Icons.warning className='size-3.5 text-amber-500' />}
        >
          <div className='grid grid-cols-1 gap-3 lg:grid-cols-3'>
            <div className='rounded-lg border border-border/70 bg-slate-50/50 p-3 dark:bg-zinc-950/30'>
              <div className='font-mono text-[10px] uppercase tracking-wider text-rose-600 dark:text-rose-400'>
                Injected Event
              </div>
              <p className='mt-1 text-xs leading-relaxed text-foreground'>{analysis.injectedEvent}</p>
            </div>
            <div className='rounded-lg border border-border/70 bg-slate-50/50 p-3 dark:bg-zinc-950/30'>
              <div className='font-mono text-[10px] uppercase tracking-wider text-muted-foreground'>
                Description
              </div>
              <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
                {analysis.description}
              </p>
            </div>
            <div className='rounded-lg border border-border/70 bg-slate-50/50 p-3 dark:bg-zinc-950/30'>
              <div className='font-mono text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400'>
                Autonomous Response
              </div>
              <p className='mt-1 text-xs leading-relaxed text-foreground'>
                {analysis.autonomousResponse}
              </p>
              <p className='mt-2 border-t border-border/60 pt-2 font-mono text-[10px] text-emerald-600 dark:text-emerald-400'>
                {analysis.expectedSavedWaste}
              </p>
            </div>
          </div>
        </PanelSection>

        {/* 4. EFFECT — scope aggregate table */}
        <PanelSection
          title='Effect — Scope Aggregates'
          hint='affected campaigns ∪ mitigation target'
          icon={<Icons.trendingDown className='size-3.5 text-rose-500' />}
        >
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse font-mono text-[11px]'>
              <thead>
                <tr className='border-b border-border/70 text-left text-muted-foreground'>
                  <th className='py-1.5 pr-3 font-semibold uppercase tracking-wider'>State</th>
                  <th className='py-1.5 pr-3 text-right font-semibold uppercase tracking-wider'>Revenue</th>
                  <th className='py-1.5 pr-3 text-right font-semibold uppercase tracking-wider'>Margin</th>
                  <th className='py-1.5 pr-3 text-right font-semibold uppercase tracking-wider'>Spend</th>
                  <th className='py-1.5 pr-3 text-right font-semibold uppercase tracking-wider'>ROAS</th>
                  <th className='py-1.5 text-right font-semibold uppercase tracking-wider'>Net</th>
                </tr>
              </thead>
              <tbody>
                {analysis.series.map((point) => (
                  <tr key={point.label} className='border-b border-border/40 last:border-0'>
                    <td className='py-2 pr-3'>
                      <span
                        className={cn(
                          'rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase',
                          point.label === 'Baseline' && 'border-zinc-400/50 bg-zinc-400/10 text-zinc-500 dark:text-zinc-400',
                          point.label === 'Shocked' && 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400',
                          point.label === 'Mitigated' && 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        )}
                      >
                        {point.label}
                      </span>
                    </td>
                    <td className='py-2 pr-3 text-right text-foreground'>{formatInr(point.revenue)}</td>
                    <td className='py-2 pr-3 text-right text-foreground'>{formatInr(point.margin)}</td>
                    <td className='py-2 pr-3 text-right text-foreground'>{formatInr(point.spend)}</td>
                    <td className={cn('py-2 pr-3 text-right', roasTone(point.roas))}>{roas(point.roas)}</td>
                    <td
                      className={cn(
                        'py-2 text-right font-semibold',
                        point.net < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'
                      )}
                    >
                      {formatInr(point.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className='mt-2 font-mono text-[10px] text-muted-foreground'>
            {analysis.confidenceRule}
          </p>
        </PanelSection>

        {/* 5. GROUPED BAR CHART */}
        <PanelSection
          title='Baseline vs Shocked vs Mitigated'
          hint='deterministic — same shock on same baseline yields identical bars'
          icon={<Icons.adjustments className='size-3.5 text-muted-foreground' />}
        >
          <div className='h-[240px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={chartData} margin={{ top: 10, right: 15, left: 10, bottom: 5 }} barGap={4}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='#e2e8f0'
                  vertical={false}
                  className='dark:stroke-zinc-800'
                />
                <XAxis
                  dataKey='metric'
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#71717a', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#71717a', fontSize: 10 }}
                  tickFormatter={(value) =>
                    `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`
                  }
                />
                <Tooltip
                  cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                  content={ShockChartTooltip}
                />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'inherit' }} />
                <Bar dataKey='Baseline' fill='#a1a1aa' radius={[3, 3, 0, 0]} maxBarSize={40} />
                <Bar dataKey='Shocked' fill='#f43f5e' radius={[3, 3, 0, 0]} maxBarSize={40} />
                <Bar dataKey='Mitigated' fill='#10b981' radius={[3, 3, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PanelSection>

        {/* 6. MITIGATION PLAN */}
        <PanelSection
          title={analysis.mitigation.planTitle}
          hint='cycle cap parsed from metadata.constraints'
          icon={<Icons.play className='size-3.5 text-emerald-500' />}
        >
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-5'>
            <div className='lg:col-span-3'>
              <ol className='space-y-2.5'>
                {analysis.mitigation.steps.map((step, index) => {
                  const tone = STEP_TONE[step.tone];
                  return (
                    <li
                      key={`${step.title}-${String(index)}`}
                      className='flex gap-2.5 rounded-lg border border-border/70 bg-slate-50/50 p-2.5 dark:bg-zinc-950/30'
                    >
                      {tone.icon}
                      <div className='min-w-0'>
                        <div className={cn('font-mono text-[11px] font-bold', tone.text)}>
                          {step.title}
                        </div>
                        <p className='mt-0.5 text-[11px] leading-relaxed text-muted-foreground'>
                          {step.detail}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className='space-y-2 lg:col-span-2'>
              <div className='rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3'>
                <div className='font-mono text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400'>
                  Mitigation Target
                </div>
                <div className='mt-1 font-mono text-xs font-bold text-foreground'>
                  {analysis.mitigation.targetCampaign}
                </div>
                <div className='mt-0.5 text-[11px] text-muted-foreground'>
                  {analysis.mitigation.targetProductName}
                </div>
                <div className='mt-1.5 flex items-center gap-1.5'>
                  <Badge variant='outline' className='font-mono text-[10px] uppercase'>
                    {analysis.mitigation.targetPlatform}
                  </Badge>
                  <Badge
                    variant='outline'
                    className='border-emerald-500/40 bg-emerald-500/10 font-mono text-[10px] uppercase text-emerald-600 dark:text-emerald-400'
                  >
                    receive
                  </Badge>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-2'>
                <KpiTile
                  label='Moved / day'
                  value={formatInr(analysis.mitigation.movedDaily)}
                  sub='40% target cap'
                  tone='good'
                />
                <KpiTile
                  label='Recovered / day'
                  value={formatInr(analysis.mitigation.recoveredDailyMargin)}
                  sub='moved × target yield'
                  tone='good'
                />
                <KpiTile
                  label='Source cut / day'
                  value={formatInr(analysis.mitigation.sourceSpendCutDaily)}
                  sub='spend removed'
                  tone='risk'
                />
                <KpiTile
                  label='Held / day'
                  value={formatInr(analysis.mitigation.heldDaily)}
                  sub='cut − moved'
                  tone='neutral'
                />
              </div>
            </div>
          </div>
        </PanelSection>

        {/* 7. FINANCIAL LOSS / LOSS AVOIDED */}
        <PanelSection
          title='Financial Impact — Loss and Loss Avoided'
          hint='scope net = margin − spend'
          icon={<Icons.trendingUp className='size-3.5 text-emerald-500' />}
        >
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            <div className='rounded-lg border border-rose-500/40 bg-rose-500/5 p-3'>
              <div className='font-mono text-[10px] uppercase tracking-wider text-rose-600 dark:text-rose-400'>
                Loss without mitigation
              </div>
              <div className='mt-1 font-mono text-lg font-bold text-rose-600 dark:text-rose-400'>
                {formatInr(analysis.loss.withoutMitigation.daily)}
              </div>
              <div className='mt-1 space-y-0.5 font-mono text-[10px] text-muted-foreground'>
                <div>week {formatInr(analysis.loss.withoutMitigation.weekly)}</div>
                <div>month {formatInr(analysis.loss.withoutMitigation.monthly)}</div>
              </div>
            </div>

            <div className='rounded-lg border border-amber-500/40 bg-amber-500/5 p-3'>
              <div className='font-mono text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400'>
                Residual loss with mitigation
              </div>
              <div className='mt-1 font-mono text-lg font-bold text-amber-600 dark:text-amber-400'>
                {formatInr(analysis.loss.withMitigation.daily)}
              </div>
              <div className='mt-1 space-y-0.5 font-mono text-[10px] text-muted-foreground'>
                <div>week {formatInr(analysis.loss.withMitigation.weekly)}</div>
                <div>month {formatInr(analysis.loss.withMitigation.monthly)}</div>
              </div>
            </div>

            <div className='rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3'>
              <div className='font-mono text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400'>
                Loss avoided
              </div>
              <div
                className={cn(
                  'mt-1 font-mono text-lg font-bold',
                  avoidedIsPositive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                )}
              >
                {formatInr(analysis.loss.avoided.daily)}
              </div>
              <div className='mt-1 space-y-0.5 font-mono text-[10px] text-muted-foreground'>
                <div>week {formatInr(analysis.loss.avoided.weekly)}</div>
                <div>month {formatInr(analysis.loss.avoided.monthly)}</div>
              </div>
            </div>

            <div className='rounded-lg border border-border/70 bg-slate-50/50 p-3 dark:bg-zinc-950/30'>
              <div className='font-mono text-[10px] uppercase tracking-wider text-muted-foreground'>
                Wasted spend (affected)
              </div>
              <div className='mt-1 font-mono text-lg font-bold text-foreground'>
                {formatInr(analysis.loss.wastedSpendDaily)}
              </div>
              <div className='mt-1 space-y-0.5 font-mono text-[10px] text-muted-foreground'>
                <div>per day of affected spend</div>
                <div>week {formatInr(analysis.loss.wastedSpendWeekly)}</div>
              </div>
            </div>
          </div>
        </PanelSection>

        {/* 8. CAMPAIGN READOUT */}
        <PanelSection
          title='Campaign Readout — Baseline → Shocked → Mitigated'
          hint='affected ranked by margin loss, then target'
          icon={<Icons.dashboard className='size-3.5 text-muted-foreground' />}
        >
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse font-mono text-[11px]'>
              <thead>
                <tr className='border-b border-border/70 text-left text-muted-foreground'>
                  <th className='py-1.5 pr-3 font-semibold uppercase tracking-wider'>Role</th>
                  <th className='py-1.5 pr-3 font-semibold uppercase tracking-wider'>Campaign</th>
                  <th className='py-1.5 pr-3 font-semibold uppercase tracking-wider'>Platform</th>
                  <th className='py-1.5 pr-3 text-right font-semibold uppercase tracking-wider'>ROAS</th>
                  <th className='py-1.5 pr-3 text-right font-semibold uppercase tracking-wider'>Margin</th>
                  <th className='py-1.5 text-right font-semibold uppercase tracking-wider'>Inv</th>
                </tr>
              </thead>
              <tbody>
                {analysis.campaignRows.map((row) => (
                  <tr
                    key={`${row.role}-${row.campaign}`}
                    className='border-b border-border/40 last:border-0'
                  >
                    <td className='py-2 pr-3'>
                      <Badge
                        variant='outline'
                        className={cn(
                          'font-mono text-[10px] uppercase',
                          row.role === 'affected'
                            ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        )}
                      >
                        {row.role}
                      </Badge>
                    </td>
                    <td className='py-2 pr-3'>
                      <div className='font-semibold text-foreground'>{row.campaign}</div>
                      <div className='text-[10px] text-muted-foreground'>{row.productName}</div>
                    </td>
                    <td className='py-2 pr-3 text-muted-foreground'>{row.platform}</td>
                    <td className='py-2 pr-3 text-right'>
                      <span className='text-muted-foreground'>{roas(row.baselineRoas)}</span>
                      <span className='mx-1 text-border'>→</span>
                      <span className={roasTone(row.shockedRoas)}>{roas(row.shockedRoas)}</span>
                      <span className='mx-1 text-border'>→</span>
                      <span className='text-emerald-600 dark:text-emerald-400'>
                        {roas(row.mitigatedRoas)}
                      </span>
                    </td>
                    <td className='py-2 pr-3 text-right'>
                      <span className='text-muted-foreground'>{formatInr(row.baselineMargin)}</span>
                      <span className='mx-1 text-border'>→</span>
                      <span
                        className={
                          row.shockedMargin < row.baselineMargin
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-foreground'
                        }
                      >
                        {formatInr(row.shockedMargin)}
                      </span>
                      <span className='mx-1 text-border'>→</span>
                      <span className='text-emerald-600 dark:text-emerald-400'>
                        {formatInr(row.mitigatedMargin)}
                      </span>
                    </td>
                    <td className='py-2 text-right'>
                      {row.shockedInventory === null ? (
                        <span className='text-border'>—</span>
                      ) : row.shockedInventory <= 0 ? (
                        <span className='font-bold text-rose-600 dark:text-rose-400'>0 units</span>
                      ) : (
                        <span className='text-muted-foreground'>{row.shockedInventory}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelSection>

        {/* 9. CAUSAL CHAIN */}
        <PanelSection
          title='Causal Chain'
          hint='5-step deterministic propagation'
          icon={<Icons.topology className='size-3.5 text-muted-foreground' />}
        >
          <ol className='space-y-2'>
            {analysis.causalChain.map((node) => {
              const tone = NODE_TONE[node.tone];
              return (
                <li key={`node-${String(node.step)}`} className='flex items-start gap-3'>
                  <span
                    className={cn(
                      'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-bold',
                      tone.chip
                    )}
                  >
                    {node.step}
                  </span>
                  <div className='min-w-0 flex-1 rounded-lg border border-border/70 bg-slate-50/50 p-2.5 dark:bg-zinc-950/30'>
                    <div className='flex items-center gap-2'>
                      {tone.icon}
                      <span className={cn('font-mono text-[11px] font-bold', tone.text)}>
                        {node.title}
                      </span>
                    </div>
                    <p className='mt-0.5 text-[11px] leading-relaxed text-muted-foreground'>
                      {node.detail}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </PanelSection>

        {/* 10. DATA LINEAGE */}
        <PanelSection
          title='Data Lineage'
          hint='every figure traces to nexus-engine-state.json'
          icon={<Icons.terminal className='size-3.5 text-muted-foreground' />}
        >
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse font-mono text-[11px]'>
              <thead>
                <tr className='border-b border-border/70 text-left text-muted-foreground'>
                  <th className='py-1.5 pr-3 font-semibold uppercase tracking-wider'>Formula</th>
                  <th className='py-1.5 pr-3 font-semibold uppercase tracking-wider'>Inputs</th>
                  <th className='py-1.5 text-right font-semibold uppercase tracking-wider'>Output</th>
                </tr>
              </thead>
              <tbody>
                {analysis.lineage.map((row) => (
                  <tr
                    key={row.formula}
                    className='border-b border-border/40 align-top last:border-0'
                  >
                    <td className='py-2 pr-3 text-foreground'>{row.formula}</td>
                    <td className='py-2 pr-3 text-muted-foreground'>{row.inputs}</td>
                    <td className='py-2 text-right font-semibold text-emerald-600 dark:text-emerald-400'>
                      {row.output}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelSection>

        {/* 11. FOOTER */}
        <footer className='flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3'>
          <p className='font-mono text-[10px] text-muted-foreground'>
            Deterministic evaluation — no randomness, no time dependence. Re-clicking this shock
            against the same baseline reproduces every figure above.
          </p>
          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              variant='outline'
              onClick={onReset}
              className='h-8 border-border bg-card px-2.5 font-mono text-xs text-muted-foreground hover:bg-accent hover:text-foreground'
            >
              <Icons.clock className='mr-1.5 size-3' />
              Reset Baseline
            </Button>
            <Button size='sm' onClick={onClose} className='h-8 px-3 font-mono text-xs'>
              <Icons.arrowRight className='mr-1.5 size-3' />
              Continue
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
