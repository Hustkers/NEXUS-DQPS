'use client';

import React from 'react';
import { CampaignStrategy } from '@/lib/strategy-engine/types';
import { Button } from '@/components/ui/button';
import {
  IconX,
  IconScale,
  IconTrophy,
  IconCheck,
  IconAlertTriangle,
  IconShieldCheck
} from '@tabler/icons-react';

interface StrategyComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategies: CampaignStrategy[];
  onRemoveStrategy: (strategyId: string) => void;
}

export function StrategyComparisonModal({
  isOpen,
  onClose,
  strategies,
  onRemoveStrategy
}: StrategyComparisonModalProps) {
  if (!isOpen || strategies.length === 0) return null;

  // Compute best values for highlighting
  const maxRoas = Math.max(...strategies.map((s) => s.evaluation?.expectedRoas ?? 0));
  const minCpa = Math.min(...strategies.map((s) => s.evaluation?.expectedCpa ?? Infinity));
  const maxRev = Math.max(...strategies.map((s) => s.evaluation?.expectedRevenue ?? 0));
  const minRisk = Math.min(...strategies.map((s) => s.evaluation?.riskScore ?? 100));

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in'>
      <div className='relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-border/80 px-6 py-4 bg-muted/20'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'>
              <IconScale className='size-5' />
            </div>
            <div>
              <h2 className='text-base font-mono font-bold text-foreground'>
                Side-by-Side Strategy Comparison ({strategies.length} Strategies)
              </h2>
              <p className='text-xs font-mono text-muted-foreground'>
                Compare key financial yield, audience targeting, risk tolerance, and conversion economics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className='p-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors'
          >
            <IconX className='size-4' />
          </button>
        </div>

        {/* Scrollable Matrix */}
        <div className='flex-1 overflow-auto p-6 text-xs font-mono'>
          <div className='min-w-[700px]'>
            <table className='w-full border-collapse'>
              <thead>
                <tr>
                  <th className='p-3 text-left w-48 border-b border-border/80 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold bg-muted/30'>
                    Parameter
                  </th>
                  {strategies.map((strat) => (
                    <th
                      key={strat.strategyId}
                      className='p-3 text-left border-b border-border/80 bg-muted/20 min-w-[200px]'
                    >
                      <div className='flex items-center justify-between gap-1'>
                        <span className='font-bold text-xs text-foreground truncate'>
                          {strat.strategyName.split(' — ')[0]}
                        </span>
                        <button
                          onClick={() => onRemoveStrategy(strat.strategyId)}
                          className='text-muted-foreground hover:text-rose-400 p-0.5'
                          title='Remove from comparison'
                        >
                          <IconX className='size-3' />
                        </button>
                      </div>
                      <div className='flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1'>
                        <span className='uppercase font-bold text-cyan-400'>{strat.platform}</span>
                        <span>•</span>
                        <span>{strat.strategyId}</span>
                        <span>•</span>
                        <span>Rank #{strat.evaluation?.rank}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className='divide-y divide-border/60'>
                {/* Status */}
                <tr>
                  <td className='p-3 font-semibold text-muted-foreground bg-muted/10'>Status</td>
                  {strategies.map((s) => (
                    <td key={s.strategyId} className='p-3'>
                      {s.evaluation?.status === 'SELECTED' ? (
                        <span className='inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border border-zinc-700 bg-zinc-800 text-zinc-200'>
                          <IconCheck className='size-3 text-zinc-300' /> SELECTED
                        </span>
                      ) : (
                        <span className='text-[10px] text-zinc-400 border border-zinc-800 bg-zinc-900/40 px-2 py-0.5 rounded-md'>
                          NOT SELECTED
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Overall Score */}
                <tr>
                  <td className='p-3 font-semibold text-muted-foreground bg-muted/10'>Overall Score</td>
                  {strategies.map((s) => (
                    <td key={s.strategyId} className='p-3 font-bold text-foreground text-sm'>
                      {s.evaluation?.overallScore.toFixed(1)}/100
                    </td>
                  ))}
                </tr>

                {/* Expected ROAS */}
                <tr className='bg-emerald-500/5'>
                  <td className='p-3 font-semibold text-emerald-400'>Expected ROAS</td>
                  {strategies.map((s) => {
                    const isBest = s.evaluation?.expectedRoas === maxRoas;
                    return (
                      <td key={s.strategyId} className='p-3 font-bold text-sm text-emerald-400'>
                        <div className='flex items-center gap-1.5'>
                          <span>{s.evaluation?.expectedRoas.toFixed(2)}x</span>
                          {isBest && (
                            <span className='text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-300 font-bold'>
                              HIGHEST
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Expected Revenue */}
                <tr>
                  <td className='p-3 font-semibold text-muted-foreground bg-muted/10'>Expected Revenue</td>
                  {strategies.map((s) => {
                    const isBest = s.evaluation?.expectedRevenue === maxRev;
                    return (
                      <td key={s.strategyId} className='p-3 font-bold text-foreground'>
                        <div className='flex items-center gap-1.5'>
                          <span>${s.evaluation?.expectedRevenue.toLocaleString()}</span>
                          {isBest && (
                            <span className='text-[9px] px-1 rounded bg-zinc-800 text-zinc-200 font-bold'>
                              MAX
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Budget Allocation */}
                <tr>
                  <td className='p-3 font-semibold text-muted-foreground bg-muted/10'>Budget Allocation</td>
                  {strategies.map((s) => (
                    <td key={s.strategyId} className='p-3 font-medium text-foreground'>
                      ${s.budgetAllocation.toLocaleString()} ({s.campaignDuration}d)
                    </td>
                  ))}
                </tr>

                {/* Expected CPA */}
                <tr className='bg-zinc-800/20'>
                  <td className='p-3 font-semibold text-zinc-200'>Expected CPA</td>
                  {strategies.map((s) => {
                    const isBest = s.evaluation?.expectedCpa === minCpa;
                    return (
                      <td key={s.strategyId} className='p-3 font-bold text-foreground'>
                        <div className='flex items-center gap-1.5'>
                          <span>${s.evaluation?.expectedCpa.toLocaleString()}</span>
                          {isBest && (
                            <span className='text-[9px] px-1 rounded bg-zinc-800 text-zinc-200 font-bold'>
                              LOWEST
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Expected Conversions */}
                <tr>
                  <td className='p-3 font-semibold text-muted-foreground bg-muted/10'>Expected Orders</td>
                  {strategies.map((s) => (
                    <td key={s.strategyId} className='p-3 font-medium text-foreground'>
                      {s.evaluation?.expectedConversions} units
                    </td>
                  ))}
                </tr>

                {/* CTR & CPC */}
                <tr>
                  <td className='p-3 font-semibold text-muted-foreground bg-muted/10'>CTR &amp; CPC</td>
                  {strategies.map((s) => (
                    <td key={s.strategyId} className='p-3 text-muted-foreground'>
                      {((s.evaluation?.expectedCtr ?? 0) * 100).toFixed(2)}% CTR • ${s.evaluation?.expectedCpc.toFixed(2)} CPC
                    </td>
                  ))}
                </tr>

                {/* Risk Score */}
                <tr>
                  <td className='p-3 font-semibold text-muted-foreground bg-muted/10'>Risk Score</td>
                  {strategies.map((s) => {
                    const isLowest = s.evaluation?.riskScore === minRisk;
                    return (
                      <td key={s.strategyId} className='p-3'>
                        <span
                          className={`font-bold ${
                            (s.evaluation?.riskScore ?? 50) < 30 ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {s.evaluation?.riskScore}/100 {isLowest && '(SAFEST)'}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* Confidence */}
                <tr>
                  <td className='p-3 font-semibold text-muted-foreground bg-muted/10'>Confidence</td>
                  {strategies.map((s) => (
                    <td key={s.strategyId} className='p-3 text-muted-foreground'>
                      {Math.round((s.evaluation?.confidenceScore ?? 0) * 100)}%
                    </td>
                  ))}
                </tr>

                {/* Platform & Format */}
                <tr>
                  <td className='p-3 font-semibold text-muted-foreground bg-muted/10'>Platform &amp; Format</td>
                  {strategies.map((s) => (
                    <td key={s.strategyId} className='p-3 text-muted-foreground'>
                      <span className='uppercase font-bold text-foreground'>{s.platform}</span> • {s.adFormat}
                    </td>
                  ))}
                </tr>

                {/* Audience */}
                <tr>
                  <td className='p-3 font-semibold text-muted-foreground bg-muted/10'>Audience Segment</td>
                  {strategies.map((s) => (
                    <td key={s.strategyId} className='p-3 text-muted-foreground text-[11px] leading-relaxed'>
                      {s.audienceSegment}
                    </td>
                  ))}
                </tr>

                {/* Key Advantages */}
                <tr>
                  <td className='p-3 font-semibold text-muted-foreground bg-muted/10'>Key Advantages</td>
                  {strategies.map((s) => (
                    <td key={s.strategyId} className='p-3'>
                      <ul className='space-y-1 text-[11px] text-muted-foreground'>
                        {s.advantages.slice(0, 2).map((adv, i) => (
                          <li key={i} className='flex items-start gap-1'>
                            <span className='text-emerald-400'>•</span>
                            <span>{adv}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Disadvantages */}
                <tr>
                  <td className='p-3 font-semibold text-muted-foreground bg-muted/10'>Disadvantages</td>
                  {strategies.map((s) => (
                    <td key={s.strategyId} className='p-3'>
                      <ul className='space-y-1 text-[11px] text-muted-foreground'>
                        {s.disadvantages.slice(0, 2).map((dis, i) => (
                          <li key={i} className='flex items-start gap-1'>
                            <span className='text-amber-400'>•</span>
                            <span>{dis}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end border-t border-border/80 px-6 py-3.5 bg-muted/20'>
          <Button
            variant='default'
            size='sm'
            onClick={onClose}
            className='bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-mono text-xs h-8'
          >
            Close Comparison
          </Button>
        </div>
      </div>
    </div>
  );
}
