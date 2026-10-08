'use client';

import React from 'react';
import { CompletedCampaignResult } from '@/lib/strategy-engine/types';
import { SEED_COMPLETED_CAMPAIGNS } from '@/lib/strategy-engine/historical-engine';
import {
  IconBrain,
  IconCheck,
  IconTrendingUp,
  IconTrendingDown,
  IconScale,
  IconArrowRight,
  IconShieldCheck,
  IconRefresh
} from '@tabler/icons-react';

interface LearningLedgerViewProps {
  completedHistory?: CompletedCampaignResult[];
}

export function LearningLedgerView({ completedHistory }: LearningLedgerViewProps) {
  const history = completedHistory || SEED_COMPLETED_CAMPAIGNS;

  return (
    <div className='space-y-6 font-mono'>
      {/* 1. Header Banner */}
      <div className='flex items-center justify-between border-b border-border/80 pb-3 flex-wrap gap-2'>
        <div className='flex items-center gap-2.5'>
          <div className='p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30'>
            <IconBrain className='size-5' />
          </div>
          <div>
            <h2 className='text-base font-bold text-foreground'>
              Continuous Learning Ledger & Feedback Loop
            </h2>
            <p className='text-xs text-muted-foreground'>
              Closed-Loop Calibration • Predicted vs Actual Reconciliation • Self-Improving Bayesian Weights
            </p>
          </div>
        </div>
      </div>

      {/* 2. CORE FEEDBACK LOOP INFOGRAPHIC */}
      <div className='rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-3'>
        <span className='text-xs font-bold text-foreground uppercase tracking-tight block'>
          Engine Feedback Protocol (Section 16 & 17)
        </span>

        <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
          <span className='px-2 py-1 rounded bg-muted/30 border border-border text-foreground font-bold'>Past Data</span>
          <IconArrowRight className='size-3 text-cyan-400' />
          <span className='px-2 py-1 rounded bg-muted/30 border border-border text-foreground font-bold'>Predict Expected Returns</span>
          <IconArrowRight className='size-3 text-cyan-400' />
          <span className='px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold'>User Approves & Runs</span>
          <IconArrowRight className='size-3 text-cyan-400' />
          <span className='px-2 py-1 rounded bg-muted/30 border border-border text-foreground font-bold'>Collect Realized Metrics</span>
          <IconArrowRight className='size-3 text-cyan-400' />
          <span className='px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold'>Calculate Variance</span>
          <IconArrowRight className='size-3 text-cyan-400' />
          <span className='px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold'>Update Future Weights</span>
        </div>
      </div>

      {/* 3. COMPLETED RUNS WITH PREDICTED VS ACTUAL */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between border-b border-border/60 pb-2'>
          <h3 className='text-sm font-bold text-foreground uppercase tracking-tight flex items-center gap-2'>
            <IconScale className='size-4 text-cyan-400' />
            Completed Campaigns Post-Mortem Analysis ({history.length} Audited)
          </h3>
          <span className='text-xs text-muted-foreground'>
            Avg Engine Accuracy: 94.0%
          </span>
        </div>

        <div className='space-y-4'>
          {history.map((item) => (
            <div
              key={item.campaignId}
              className='rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm'
            >
              {/* Campaign Header */}
              <div className='flex items-center justify-between flex-wrap gap-2 border-b border-border/60 pb-3'>
                <div>
                  <div className='flex items-center gap-2'>
                    <h4 className='text-sm font-bold text-foreground'>{item.campaignName}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                      item.outcome === 'EXCEEDED'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : item.outcome === 'MET'
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      {item.outcome} TARGETS
                    </span>
                  </div>
                  <span className='text-[11px] text-muted-foreground block mt-0.5'>
                    Executed: {item.recommendedStrategyName} • {item.launchDate} to {item.completionDate}
                  </span>
                </div>

                <div className='flex items-center gap-3'>
                  <div className='text-right'>
                    <span className='text-[10px] text-muted-foreground uppercase block'>Prediction Accuracy</span>
                    <span className='text-lg font-bold text-emerald-400'>{item.accuracyPct}%</span>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Comparison Table */}
              <div className='rounded-xl border border-border/60 overflow-hidden'>
                <table className='w-full text-xs text-left'>
                  <thead className='bg-muted/40 border-b border-border text-[10px] uppercase text-muted-foreground'>
                    <tr>
                      <th className='p-2.5'>Metric</th>
                      <th className='p-2.5'>Predicted Value</th>
                      <th className='p-2.5'>Actual Realized</th>
                      <th className='p-2.5'>Variance Delta</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-border/60'>
                    <tr>
                      <td className='p-2.5 font-bold text-foreground'>Return on Ad Spend (ROAS)</td>
                      <td className='p-2.5 text-muted-foreground'>{item.predicted.roas.toFixed(2)}x</td>
                      <td className='p-2.5 font-bold text-emerald-400'>{item.actual.roas.toFixed(2)}x</td>
                      <td className='p-2.5 font-bold text-emerald-400'>
                        {item.errorPct.roasError > 0 ? `+${item.errorPct.roasError}%` : `${item.errorPct.roasError}%`}
                      </td>
                    </tr>
                    <tr>
                      <td className='p-2.5 font-bold text-foreground'>Gross Revenue</td>
                      <td className='p-2.5 text-muted-foreground'>${item.predicted.revenue.toLocaleString()}</td>
                      <td className='p-2.5 font-bold text-foreground'>${item.actual.revenue.toLocaleString()}</td>
                      <td className='p-2.5 font-bold text-emerald-400'>
                        {item.errorPct.revenueError > 0 ? `+${item.errorPct.revenueError}%` : `${item.errorPct.revenueError}%`}
                      </td>
                    </tr>
                    <tr>
                      <td className='p-2.5 font-bold text-foreground'>Cost Per Acquisition (CPA)</td>
                      <td className='p-2.5 text-muted-foreground'>${item.predicted.cpa.toLocaleString()}</td>
                      <td className='p-2.5 font-bold text-foreground'>${item.actual.cpa.toLocaleString()}</td>
                      <td className={`p-2.5 font-bold ${item.errorPct.cpaError <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.errorPct.cpaError > 0 ? `+${item.errorPct.cpaError}%` : `${item.errorPct.cpaError}%`}
                      </td>
                    </tr>
                    <tr>
                      <td className='p-2.5 font-bold text-foreground'>Completed Orders</td>
                      <td className='p-2.5 text-muted-foreground'>{item.predicted.conversions} units</td>
                      <td className='p-2.5 font-bold text-foreground'>{item.actual.conversions} units</td>
                      <td className='p-2.5 font-bold text-cyan-400'>
                        {item.actual.conversions - item.predicted.conversions > 0 ? `+${item.actual.conversions - item.predicted.conversions}` : item.actual.conversions - item.predicted.conversions} units
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Actionable Learnings Derived */}
              <div className='rounded-xl border border-purple-500/30 bg-purple-500/5 p-3 space-y-1.5 text-xs'>
                <span className='text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1.5'>
                  <IconBrain className='size-3.5' />
                  Machine Learnings Ingested into Recommendation Engine
                </span>
                <ul className='space-y-1 text-muted-foreground'>
                  {item.learningsDerived.map((learn, lIdx) => (
                    <li key={lIdx} className='flex items-start gap-2'>
                      <span className='text-purple-400 mt-0.5'>✓</span>
                      <span>{learn}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. ACTIVE MODEL WEIGHT ADJUSTMENT LEDGER */}
      <div className='rounded-2xl border border-border/80 bg-card p-5 space-y-3 shadow-sm'>
        <h3 className='text-sm font-bold text-foreground uppercase tracking-tight flex items-center gap-2'>
          <IconShieldCheck className='size-4 text-emerald-400' />
          Bayesian Scoring Weight Feedback Adjustments
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-3 text-xs'>
          <div className='p-3 rounded-xl border border-border/60 bg-muted/10 space-y-1'>
            <span className='text-[10px] text-muted-foreground uppercase block'>Google Search Weight</span>
            <span className='text-sm font-bold text-emerald-400 block'>35% → 38.5% (+3.5%)</span>
            <p className='text-[11px] text-muted-foreground'>
              Higher conversion consistency and lower CPA in metro cohorts justified increasing prior confidence.
            </p>
          </div>

          <div className='p-3 rounded-xl border border-border/60 bg-muted/10 space-y-1'>
            <span className='text-[10px] text-muted-foreground uppercase block'>Meta Broad Risk Penalty</span>
            <span className='text-sm font-bold text-amber-400 block'>-5.0% → -12.0%</span>
            <p className='text-[11px] text-muted-foreground'>
              Account history confirmed steep CPM inflation and audience saturation when unsegmented spend &gt; $15k.
            </p>
          </div>

          <div className='p-3 rounded-xl border border-border/60 bg-muted/10 space-y-1'>
            <span className='text-[10px] text-muted-foreground uppercase block'>TikTok Checkout Prior</span>
            <span className='text-sm font-bold text-rose-400 block'>0.018 → 0.012 CVR</span>
            <p className='text-[11px] text-muted-foreground'>
              Calibrated downward for footwear catalog items priced above $120.00 to prevent over-optimistic revenue projections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
