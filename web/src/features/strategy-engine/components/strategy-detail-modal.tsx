'use client';

import React from 'react';
import { CampaignStrategy } from '@/lib/strategy-engine/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  IconX,
  IconCheck,
  IconAlertTriangle,
  IconShieldCheck,
  IconInfoCircle,
  IconTarget,
  IconChartBar,
  IconCpu,
  IconCoin,
  IconClock,
  IconLayersLinked
} from '@tabler/icons-react';

interface StrategyDetailModalProps {
  strategy: CampaignStrategy | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleCompare?: (strategyId: string) => void;
  isComparing?: boolean;
}

export function StrategyDetailModal({
  strategy,
  isOpen,
  onClose,
  onToggleCompare,
  isComparing
}: StrategyDetailModalProps) {
  if (!isOpen || !strategy) return null;

  const ev = strategy.evaluation;
  const isSelected = ev?.status === 'SELECTED';

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in'>
      <div className='relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden'>
        {/* Modal Header */}
        <div className='flex items-center justify-between border-b border-border/80 px-6 py-4 bg-muted/20'>
          <div className='flex items-center gap-3 min-w-0'>
            <span className='text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-cyan-500/40 bg-cyan-500/10 text-cyan-400'>
              {strategy.strategyId}
            </span>
            <div className='min-w-0'>
              <h2 className='text-base font-mono font-bold text-foreground truncate'>
                {strategy.strategyName}
              </h2>
              <div className='flex items-center gap-2 text-[11px] font-mono text-muted-foreground mt-0.5'>
                <span className='uppercase font-semibold text-foreground'>{strategy.platform}</span>
                <span>•</span>
                <span>{strategy.funnelStage} Funnel</span>
                <span>•</span>
                <span className='text-cyan-400 font-bold'>Rank #{ev?.rank ?? '-'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className='p-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors'
          >
            <IconX className='size-4' />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className='flex-1 overflow-y-auto p-6 space-y-6 text-xs font-mono'>
          {/* Decision Status & Reasons Banner */}
          <div
            className={`rounded-xl border p-4 ${
              isSelected
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-zinc-700 bg-muted/20 text-muted-foreground'
            }`}
          >
            <div className='flex items-center justify-between mb-2'>
              <span className='font-bold flex items-center gap-1.5 text-xs text-foreground'>
                {isSelected ? (
                  <>
                    <IconCheck className='size-4 text-emerald-400' />
                    Status: SELECTED (Rank #{ev?.rank} of 24)
                  </>
                ) : (
                  <>
                    <IconInfoCircle className='size-4 text-zinc-400' />
                    Status: NOT SELECTED (Rank #{ev?.rank} of 24)
                  </>
                )}
              </span>
              <span className='text-[11px] font-bold text-foreground'>
                Overall Score: {ev?.overallScore.toFixed(1)}/100
              </span>
            </div>

            <ul className='space-y-1.5 text-[11px]'>
              {isSelected
                ? ev?.selectionReasons.map((r, i) => (
                    <li key={i} className='flex items-start gap-1.5 text-foreground'>
                      <span className='text-emerald-400 mt-0.5'>✓</span>
                      <span>{r}</span>
                    </li>
                  ))
                : ev?.rejectionReasons.map((r, i) => (
                    <li key={i} className='flex items-start gap-1.5 text-muted-foreground'>
                      <span className='text-rose-400 mt-0.5'>✕</span>
                      <span>{r}</span>
                    </li>
                  ))}
            </ul>
          </div>

          {/* Key Metric Gauges Grid */}
          <div>
            <h4 className='text-xs uppercase text-muted-foreground font-bold tracking-wider mb-2.5 flex items-center gap-1.5'>
              <IconChartBar className='size-4 text-cyan-400' />
              Predictive Performance Metrics
            </h4>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-2.5'>
              <div className='p-3 rounded-xl border border-border/80 bg-muted/20'>
                <span className='text-[10px] text-muted-foreground block'>Expected ROAS</span>
                <span className='text-base font-bold text-emerald-400'>{ev?.expectedRoas.toFixed(2)}x</span>
              </div>
              <div className='p-3 rounded-xl border border-border/80 bg-muted/20'>
                <span className='text-[10px] text-muted-foreground block'>Expected Revenue</span>
                <span className='text-base font-bold text-foreground'>
                  ${ev?.expectedRevenue.toLocaleString()}
                </span>
              </div>
              <div className='p-3 rounded-xl border border-border/80 bg-muted/20'>
                <span className='text-[10px] text-muted-foreground block'>Expected CPA</span>
                <span className='text-base font-bold text-foreground'>${ev?.expectedCpa.toLocaleString()}</span>
              </div>
              <div className='p-3 rounded-xl border border-border/80 bg-muted/20'>
                <span className='text-[10px] text-muted-foreground block'>Expected Conversions</span>
                <span className='text-base font-bold text-foreground'>{ev?.expectedConversions} Orders</span>
              </div>
              <div className='p-3 rounded-xl border border-border/80 bg-muted/20'>
                <span className='text-[10px] text-muted-foreground block'>Expected CTR</span>
                <span className='text-sm font-bold text-foreground'>
                  {((ev?.expectedCtr ?? 0) * 100).toFixed(2)}%
                </span>
              </div>
              <div className='p-3 rounded-xl border border-border/80 bg-muted/20'>
                <span className='text-[10px] text-muted-foreground block'>Expected CPC</span>
                <span className='text-sm font-bold text-foreground'>${ev?.expectedCpc.toFixed(2)}</span>
              </div>
              <div className='p-3 rounded-xl border border-border/80 bg-muted/20'>
                <span className='text-[10px] text-muted-foreground block'>Risk Score</span>
                <span className='text-sm font-bold text-foreground'>{ev?.riskScore}/100</span>
              </div>
              <div className='p-3 rounded-xl border border-border/80 bg-muted/20'>
                <span className='text-[10px] text-muted-foreground block'>Confidence Level</span>
                <span className='text-sm font-bold text-foreground'>
                  {Math.round((ev?.confidenceScore ?? 0) * 100)}% High
                </span>
              </div>
            </div>
          </div>

          {/* Strategic Configuration & Execution Parameters */}
          <div className='space-y-3'>
            <h4 className='text-xs uppercase text-muted-foreground font-bold tracking-wider flex items-center gap-1.5'>
              <IconTarget className='size-4 text-cyan-400' />
              Strategy Configuration Parameters
            </h4>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 rounded-xl border border-border/80 bg-muted/10 p-3.5'>
              <div>
                <span className='text-[10px] text-muted-foreground block'>Description</span>
                <p className='text-[11px] text-foreground mt-0.5'>{strategy.description}</p>
              </div>

              <div>
                <span className='text-[10px] text-muted-foreground block'>Ad Format</span>
                <p className='text-[11px] text-foreground font-semibold mt-0.5'>{strategy.adFormat}</p>
              </div>

              <div>
                <span className='text-[10px] text-muted-foreground block'>Creative Angle</span>
                <p className='text-[11px] text-foreground mt-0.5'>{strategy.creativeAngle}</p>
              </div>

              <div>
                <span className='text-[10px] text-muted-foreground block'>Messaging Angle</span>
                <p className='text-[11px] text-foreground mt-0.5'>{strategy.messagingAngle}</p>
              </div>

              <div>
                <span className='text-[10px] text-muted-foreground block'>Audience Segmentation</span>
                <p className='text-[11px] text-foreground mt-0.5'>{strategy.audienceSegment}</p>
              </div>

              <div>
                <span className='text-[10px] text-muted-foreground block'>Targeting Method</span>
                <p className='text-[11px] text-foreground mt-0.5'>{strategy.targetingMethod}</p>
              </div>

              <div>
                <span className='text-[10px] text-muted-foreground block'>Bidding Strategy</span>
                <p className='text-[11px] text-foreground mt-0.5'>{strategy.biddingStrategy}</p>
              </div>

              <div>
                <span className='text-[10px] text-muted-foreground block'>Budget Allocation</span>
                <p className='text-[11px] text-foreground font-bold mt-0.5'>
                  ${strategy.budgetAllocation.toLocaleString()} ({strategy.campaignDuration} Days)
                </p>
              </div>

              <div>
                <span className='text-[10px] text-muted-foreground block'>Offer Strategy</span>
                <p className='text-[11px] text-foreground mt-0.5'>{strategy.offerStrategy}</p>
              </div>

              <div>
                <span className='text-[10px] text-muted-foreground block'>Timing &amp; Dayparting</span>
                <p className='text-[11px] text-foreground mt-0.5'>{strategy.timingStrategy}</p>
              </div>
            </div>
          </div>

          {/* 3-Tier Forecast: Conservative, Expected, Optimistic */}
          {strategy.forecast && (
            <div className='rounded-xl border border-border/80 bg-muted/10 p-4 space-y-3'>
              <h4 className='text-xs uppercase text-muted-foreground font-bold tracking-wider flex items-center gap-1.5'>
                <IconCoin className='size-4 text-emerald-400' />
                3-Tier Revenue Forecast &amp; Return Bounds
              </h4>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                <div className='p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1'>
                  <span className='text-[10px] uppercase font-bold text-muted-foreground block'>Conservative Case</span>
                  <span className='text-base font-bold text-foreground block'>${strategy.forecast.conservative.revenue.toLocaleString()}</span>
                  <span className='text-[11px] text-amber-400 block'>{strategy.forecast.conservative.roas.toFixed(2)}x ROAS • {strategy.forecast.conservative.conversions} Orders</span>
                  <span className='text-[10px] text-muted-foreground block'>CPA: ${strategy.forecast.conservative.cpa.toLocaleString()}</span>
                </div>

                <div className='p-3 rounded-lg border border-cyan-500/40 bg-cyan-500/10 space-y-1'>
                  <span className='text-[10px] uppercase font-bold text-cyan-400 block'>Expected Case (Base)</span>
                  <span className='text-base font-bold text-foreground block'>${strategy.forecast.expected.revenue.toLocaleString()}</span>
                  <span className='text-[11px] text-emerald-400 block'>{strategy.forecast.expected.roas.toFixed(2)}x ROAS • {strategy.forecast.expected.conversions} Orders</span>
                  <span className='text-[10px] text-muted-foreground block'>CPA: ${strategy.forecast.expected.cpa.toLocaleString()}</span>
                </div>

                <div className='p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1'>
                  <span className='text-[10px] uppercase font-bold text-emerald-400 block'>Optimistic Case</span>
                  <span className='text-base font-bold text-foreground block'>${strategy.forecast.optimistic.revenue.toLocaleString()}</span>
                  <span className='text-[11px] text-emerald-400 block'>{strategy.forecast.optimistic.roas.toFixed(2)}x ROAS • {strategy.forecast.optimistic.conversions} Orders</span>
                  <span className='text-[10px] text-muted-foreground block'>CPA: ${strategy.forecast.optimistic.cpa.toLocaleString()}</span>
                </div>
              </div>
              <p className='text-[10px] text-muted-foreground'>{strategy.forecast.explanation}</p>
            </div>
          )}

          {/* Creative & Audience Direction */}
          {strategy.creativeRecommendation && (
            <div className='rounded-xl border border-border/80 bg-muted/10 p-4 space-y-3'>
              <h4 className='text-xs uppercase text-muted-foreground font-bold tracking-wider flex items-center gap-1.5'>
                <IconLayersLinked className='size-4 text-purple-400' />
                Recommended Creative &amp; Audience Strategy
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]'>
                <div className='p-2.5 rounded-lg bg-black/30 border border-border/40 space-y-1'>
                  <span className='text-[10px] font-bold text-purple-400 uppercase block'>Headline &amp; Copy:</span>
                  <p className='font-bold text-foreground'>"{strategy.creativeRecommendation.headlineDirection}"</p>
                  <p className='text-muted-foreground'>{strategy.creativeRecommendation.primaryMessage}</p>
                  <span className='text-[10px] text-cyan-400 block'>CTA: {strategy.creativeRecommendation.cta}</span>
                </div>
                <div className='p-2.5 rounded-lg bg-black/30 border border-border/40 space-y-1'>
                  <span className='text-[10px] font-bold text-cyan-400 uppercase block'>Visual Concept:</span>
                  <p className='text-foreground'>{strategy.creativeRecommendation.visualConcept}</p>
                  {strategy.creativeRecommendation.videoConcept && (
                    <p className='text-muted-foreground text-[10px] mt-1'>Video: {strategy.creativeRecommendation.videoConcept}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Advantages, Disadvantages, Assumptions */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Advantages */}
            <div className='rounded-xl border border-border/80 bg-muted/10 p-3.5 space-y-2'>
              <span className='text-[10px] uppercase text-emerald-400 font-bold tracking-wider flex items-center gap-1'>
                <IconCheck className='size-3.5' /> Key Advantages
              </span>
              <ul className='space-y-1.5'>
                {strategy.advantages.map((adv, idx) => (
                  <li key={idx} className='text-[11px] text-muted-foreground flex items-start gap-1.5'>
                    <span className='text-emerald-400 mt-0.5'>•</span>
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Disadvantages */}
            <div className='rounded-xl border border-border/80 bg-muted/10 p-3.5 space-y-2'>
              <span className='text-[10px] uppercase text-amber-400 font-bold tracking-wider flex items-center gap-1'>
                <IconAlertTriangle className='size-3.5' /> Potential Disadvantages &amp; Risks
              </span>
              <ul className='space-y-1.5'>
                {strategy.disadvantages.map((dis, idx) => (
                  <li key={idx} className='text-[11px] text-muted-foreground flex items-start gap-1.5'>
                    <span className='text-amber-400 mt-0.5'>•</span>
                    <span>{dis}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Assumptions */}
          <div className='rounded-xl border border-border/80 bg-muted/10 p-3.5 space-y-1.5'>
            <span className='text-[10px] uppercase text-cyan-400 font-bold tracking-wider flex items-center gap-1'>
              <IconInfoCircle className='size-3.5' /> Critical Assumptions
            </span>
            <ul className='space-y-1'>
              {strategy.assumptions.map((ass, idx) => (
                <li key={idx} className='text-[11px] text-muted-foreground flex items-start gap-1.5'>
                  <span className='text-cyan-400 mt-0.5'>•</span>
                  <span>{ass}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Model Transparency Note */}
          <div className='rounded-xl border border-border/60 bg-muted/20 p-3 flex items-center justify-between text-[11px] text-muted-foreground'>
            <span className='flex items-center gap-1.5'>
              <IconCpu className='size-3.5 text-cyan-400' />
              Basis: {ev?.modelMetadata.modelBasis}
            </span>
            <span className='text-cyan-400 font-semibold'>
              {ev?.modelMetadata.isModelEstimate ? 'Model Estimate' : 'Calibrated with Historical Data'}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className='flex items-center justify-between border-t border-border/80 px-6 py-3.5 bg-muted/20'>
          {onToggleCompare && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => onToggleCompare(strategy.strategyId)}
              className={`text-xs font-mono h-8 ${
                isComparing ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : ''
              }`}
            >
              {isComparing ? 'Remove from Compare' : 'Add to Compare'}
            </Button>
          )}

          <Button
            variant='default'
            size='sm'
            onClick={onClose}
            className='bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-mono text-xs h-8 ml-auto'
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
