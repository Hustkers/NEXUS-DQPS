'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import {
  IconChartBar,
  IconTarget,
  IconArrowsSplit2,
  IconBrandMeta,
  IconBrandGoogle,
  IconBrandAmazon,
  IconBuildingStore,
  IconSparkles
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  UnifiedCommerceRecord,
  CrossChannelComparisonItem,
  UnitEconomicsPoint,
  ImpressionSharePoint,
  FunnelConversionStep
} from '../normalization-engine';

interface CustomTooltipPayloadItem {
  name: string;
  value: number | string;
  color?: string;
  fill?: string;
  stroke?: string;
  unit?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: CustomTooltipPayloadItem[];
  label?: string;
}

// Custom Dark Monospace Tooltip
function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className='rounded-lg border border-border/80 bg-slate-950/95 p-3 shadow-xl backdrop-blur-md text-xs font-mono space-y-1.5 min-w-[160px] text-slate-100'>
      <p className='font-bold text-cyan-400 border-b border-border/60 pb-1'>{label}</p>
      {payload.map((entry: CustomTooltipPayloadItem, index: number) => (
        <div key={index} className='flex items-center justify-between gap-4 text-[11px]'>
          <span className='flex items-center gap-1.5 text-slate-300'>
            <span
              className='size-2 rounded-full shrink-0'
              style={{ backgroundColor: entry.color || entry.fill || entry.stroke || '#38bdf8' }}
            />
            {entry.name}:
          </span>
          <span className='font-bold text-white'>
            {typeof entry.value === 'number'
              ? entry.value > 1000
                ? `$${entry.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                : entry.unit === '%' || entry.name.toLowerCase().includes('%') || entry.name.toLowerCase().includes('rate') || entry.name.toLowerCase().includes('share')
                ? `${entry.value}%`
                : entry.name.toLowerCase().includes('roas') || entry.name.toLowerCase().includes('poas')
                ? `${entry.value}x`
                : typeof entry.value === 'number' && (entry.name.toLowerCase().includes('spend') || entry.name.toLowerCase().includes('rev') || entry.name.toLowerCase().includes('margin') || entry.name.toLowerCase().includes('cogs') || entry.name.toLowerCase().includes('fee'))
                ? `$${entry.value.toFixed(2)}`
                : entry.value.toLocaleString()
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

interface NormalizationGraphsProps {
  record: UnifiedCommerceRecord | null;
  omnichannelData: CrossChannelComparisonItem[];
  selectedPlatform: 'meta' | 'google' | 'amazon' | 'shopify';
  className?: string;
}

export function NormalizationGraphs({
  record,
  omnichannelData,
  selectedPlatform,
  className
}: NormalizationGraphsProps) {
  const [activeTelemetryTab, setActiveTelemetryTab] = useState<'channel-telemetry' | 'waterfall' | 'omnichannel' | 'funnel'>('waterfall');
  const [omniMetricMode, setOmniMetricMode] = useState<'financial' | 'efficiency'>('financial');
  const [metaSubTab, setMetaSubTab] = useState<'video' | 'fatigue'>('video');
  const [googleSubTab, setGoogleSubTab] = useState<'is' | 'quality'>('is');
  const [amazonSubTab, setAmazonSubTab] = useState<'halo' | 'buybox'>('halo');
  const [shopifySubTab, setShopifySubTab] = useState<'friction' | 'funnel'>('friction');

  if (!record) return null;

  return (
    <div className={cn('flex flex-col gap-4 font-mono', className)}>
      {/* Tab Navigation Header */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-3'>
        <div className='flex items-center gap-2 flex-wrap'>
          <button
            onClick={() => setActiveTelemetryTab('waterfall')}
            className={cn(
              'px-3 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer',
              activeTelemetryTab === 'waterfall'
                ? 'bg-cyan-500 text-black border-cyan-500 font-bold shadow-xs'
                : 'bg-card border-border/70 text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            <IconChartBar className='size-3.5' />
            <span>Unit Economics Waterfall</span>
          </button>

          <button
            onClick={() => setActiveTelemetryTab('channel-telemetry')}
            className={cn(
              'px-3 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer',
              activeTelemetryTab === 'channel-telemetry'
                ? 'bg-cyan-500 text-black border-cyan-500 font-bold shadow-xs'
                : 'bg-card border-border/70 text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            <IconSparkles className='size-3.5' />
            <span>
              {selectedPlatform === 'meta' && 'Meta Video & Fatigue Telemetry'}
              {selectedPlatform === 'google' && 'Google Impression Share & Auction'}
              {selectedPlatform === 'amazon' && 'Amazon Halo Sales & Buy Box'}
              {selectedPlatform === 'shopify' && 'Shopify D2C Friction & Economics'}
            </span>
            <Badge variant='outline' className='text-[9px] px-1 py-0 border-current font-bold uppercase'>
              Live
            </Badge>
          </button>

          <button
            onClick={() => setActiveTelemetryTab('omnichannel')}
            className={cn(
              'px-3 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer',
              activeTelemetryTab === 'omnichannel'
                ? 'bg-cyan-500 text-black border-cyan-500 font-bold shadow-xs'
                : 'bg-card border-border/70 text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            <IconArrowsSplit2 className='size-3.5' />
            <span>Omnichannel Benchmark</span>
          </button>

          <button
            onClick={() => setActiveTelemetryTab('funnel')}
            className={cn(
              'px-3 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer',
              activeTelemetryTab === 'funnel'
                ? 'bg-cyan-500 text-black border-cyan-500 font-bold shadow-xs'
                : 'bg-card border-border/70 text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            <IconTarget className='size-3.5' />
            <span>Conversion Funnel</span>
          </button>
        </div>

        <div className='flex items-center gap-2 text-[11px] text-muted-foreground'>
          <span className='size-2 rounded-full bg-emerald-500 animate-pulse' />
          <span>Real-Time Normalized Feed</span>
        </div>
      </div>

      {/* GRAPH 1: UNIT ECONOMICS & MARGIN WATERFALL */}
      {activeTelemetryTab === 'waterfall' && (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
          {/* Main Waterfall Chart (2 cols) */}
          <div className='lg:col-span-2 rounded-xl border border-border/80 bg-card p-4 flex flex-col justify-between shadow-xs'>
            <div className='flex items-center justify-between border-b border-border/60 pb-3 mb-3'>
              <div>
                <h3 className='text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2'>
                  <IconChartBar className='size-4 text-cyan-400' />
                  Normalized Unit Economics Waterfall
                </h3>
                <p className='text-[11px] text-muted-foreground mt-0.5'>
                  Step-by-step margin reconciliation from Gross Revenue to True CM3 Net Margin
                </p>
              </div>
              <Badge variant='outline' className='bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-[10px]'>
                CM3: ${record.net_contribution_margin?.toFixed(2) ?? (record.gross_margin - record.spend).toFixed(2)}
              </Badge>
            </div>

            <div className='h-[260px] w-full min-w-0'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={record.unit_economics_waterfall || []}
                  margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray='3 3' stroke='currentColor' className='opacity-10' vertical={false} />
                  <XAxis
                    dataKey='component'
                    stroke='currentColor'
                    className='opacity-70 text-[10px]'
                    fontSize={10}
                    tickLine={false}
                    fontFamily='monospace'
                  />
                  <YAxis
                    stroke='currentColor'
                    className='opacity-70 text-[10px]'
                    fontSize={10}
                    tickLine={false}
                    fontFamily='monospace'
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey='amount' radius={[4, 4, 0, 0]}>
                    {(record.unit_economics_waterfall || []).map((entry: UnitEconomicsPoint, index: number) => {
                      let color = '#38bdf8'; // cyan for revenue
                      if (entry.type === 'cost') color = '#ef4444'; // red for cost
                      if (entry.type === 'profit') color = '#10b981'; // emerald for profit
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className='pt-3 border-t border-border/50 flex flex-wrap items-center justify-between text-[11px] text-muted-foreground'>
              <div className='flex items-center gap-4'>
                <span className='flex items-center gap-1.5'>
                  <span className='size-2 rounded-full bg-cyan-400' /> Gross Revenue
                </span>
                <span className='flex items-center gap-1.5'>
                  <span className='size-2 rounded-full bg-red-400' /> Deducted Costs &amp; Spend
                </span>
                <span className='flex items-center gap-1.5'>
                  <span className='size-2 rounded-full bg-emerald-400' /> Net Margin (CM3)
                </span>
              </div>
              <span className='text-cyan-400 font-bold'>COGS Margin: {record.gross_margin_pct.toFixed(1)}%</span>
            </div>
          </div>

          {/* Side Summary Breakdown Card */}
          <div className='rounded-xl border border-border/80 bg-card p-4 flex flex-col justify-between shadow-xs'>
            <div>
              <div className='flex items-center justify-between border-b border-border/60 pb-2 mb-3'>
                <span className='text-xs font-bold text-foreground uppercase'>Component Audit</span>
                <Badge variant='outline' className='text-[10px] bg-muted/40 font-mono'>
                  {record.channel.toUpperCase()}
                </Badge>
              </div>

              <div className='space-y-2.5 text-xs'>
                <div className='flex items-center justify-between p-2 rounded bg-muted/40 border border-border/60'>
                  <span className='text-muted-foreground'>Attributed Revenue</span>
                  <span className='font-bold text-emerald-400'>${record.attributed_revenue.toFixed(2)}</span>
                </div>
                <div className='flex items-center justify-between p-2 rounded bg-muted/40 border border-border/60'>
                  <span className='text-muted-foreground'>Unit Footwear COGS</span>
                  <span className='font-bold text-rose-400'>-${record.total_cogs.toFixed(2)}</span>
                </div>
                <div className='flex items-center justify-between p-2 rounded bg-muted/40 border border-border/60'>
                  <span className='text-muted-foreground'>Direct Platform Spend</span>
                  <span className='font-bold text-rose-400'>-${record.spend.toFixed(2)}</span>
                </div>
                {(record.fba_fees ?? 0) > 0 && (
                  <div className='flex items-center justify-between p-2 rounded bg-muted/40 border border-border/60'>
                    <span className='text-muted-foreground'>Amazon FBA Handling</span>
                    <span className='font-bold text-amber-400'>-${record.fba_fees?.toFixed(2)}</span>
                  </div>
                )}
                {(record.payment_gateway_fee ?? 0) > 0 && (
                  <div className='flex items-center justify-between p-2 rounded bg-muted/40 border border-border/60'>
                    <span className='text-muted-foreground'>Stripe Gateway Fee</span>
                    <span className='font-bold text-amber-400'>-${record.payment_gateway_fee?.toFixed(2)}</span>
                  </div>
                )}
                <div className='flex items-center justify-between p-2.5 rounded bg-emerald-950/20 border border-emerald-500/40 text-emerald-400 font-bold'>
                  <span>Net Margin (CM3)</span>
                  <span>${record.net_contribution_margin?.toFixed(2) ?? (record.gross_margin - record.spend).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className='mt-3 pt-3 border-t border-border/50 text-[10px] text-muted-foreground leading-relaxed'>
              💡 <strong>RL Optimizer Rule:</strong> Budget reallocation algorithms use <em>Net CM3</em> rather than top-line ROAS to prevent scaling unprofitable campaigns.
            </div>
          </div>
        </div>
      )}

      {/* GRAPH 2: CHANNEL SPECIFIC DEEP TELEMETRY */}
      {activeTelemetryTab === 'channel-telemetry' && (
        <div className='rounded-xl border border-border/80 bg-card p-4 shadow-xs'>
          {/* META ADS TELEMETRY */}
          {selectedPlatform === 'meta' && (
            <div className='space-y-4'>
              <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3'>
                <div className='flex items-center gap-2'>
                  <IconBrandMeta className='size-5 text-blue-500' />
                  <div>
                    <h3 className='text-xs font-bold text-foreground uppercase tracking-wider'>
                      Meta Enterprise Video &amp; Fatigue Telemetry
                    </h3>
                    <p className='text-[11px] text-muted-foreground'>
                      Creative retention drop-off and ad frequency saturation curves
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => setMetaSubTab('video')}
                    className={cn(
                      'px-2.5 py-1 rounded text-xs transition-all cursor-pointer',
                      metaSubTab === 'video'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Video Retention Funnel
                  </button>
                  <button
                    onClick={() => setMetaSubTab('fatigue')}
                    className={cn(
                      'px-2.5 py-1 rounded text-xs transition-all cursor-pointer',
                      metaSubTab === 'fatigue'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Ad Fatigue Decay Curve
                  </button>
                </div>
              </div>

              {metaSubTab === 'video' ? (
                <div>
                  <div className='flex items-center justify-between text-xs mb-2'>
                    <span className='text-muted-foreground'>Creative Video Watch Retention:</span>
                    <Badge variant='outline' className='bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px]'>
                      3-Second Hook Rate: {record.video_hook_rate_pct ?? 38.8}%
                    </Badge>
                  </div>
                  <div className='h-[260px] w-full min-w-0'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <AreaChart
                        data={record.video_funnel || []}
                        margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id='metaVideoGrad' x1='0' y1='0' x2='0' y2='1'>
                            <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.4} />
                            <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray='3 3' stroke='currentColor' className='opacity-10' vertical={false} />
                        <XAxis
                          dataKey='stage'
                          stroke='currentColor'
                          className='opacity-70 text-[10px]'
                          fontSize={10}
                          tickLine={false}
                          fontFamily='monospace'
                        />
                        <YAxis
                          stroke='currentColor'
                          className='opacity-70 text-[10px]'
                          fontSize={10}
                          tickLine={false}
                          fontFamily='monospace'
                          tickFormatter={(val) => `${val}%`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type='monotone'
                          dataKey='retentionRate'
                          name='Retention Rate %'
                          stroke='#3b82f6'
                          strokeWidth={2}
                          fillOpacity={1}
                          fill='url(#metaVideoGrad)'
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className='mt-2 p-2.5 rounded-lg bg-blue-950/20 border border-blue-500/30 text-[11px] text-muted-foreground flex items-center justify-between'>
                    <span>⚡ <strong>Creative Benchmark:</strong> Above 30% 3s hook rate qualifies for automated scale in Meta Andromeda auction.</span>
                    <span className='text-emerald-400 font-bold'>Status: PASSED</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className='flex items-center justify-between text-xs mb-2'>
                    <span className='text-muted-foreground'>Ad Frequency vs CTR Wearout Decay:</span>
                    <Badge variant='outline' className='bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px]'>
                      Current Frequency: {record.frequency ?? 1.25}x
                    </Badge>
                  </div>
                  <div className='h-[260px] w-full min-w-0'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <LineChart
                        data={record.fatigue_decay_curve || []}
                        margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray='3 3' stroke='currentColor' className='opacity-10' vertical={false} />
                        <XAxis
                          dataKey='frequency'
                          stroke='currentColor'
                          className='opacity-70 text-[10px]'
                          fontSize={10}
                          tickLine={false}
                          fontFamily='monospace'
                          tickFormatter={(val) => `${val}x`}
                        />
                        <YAxis
                          stroke='currentColor'
                          className='opacity-70 text-[10px]'
                          fontSize={10}
                          tickLine={false}
                          fontFamily='monospace'
                          tickFormatter={(val) => `${val}%`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine x={2.5} stroke='#ef4444' strokeDasharray='4 4' label={{ value: 'Wearout Limit (2.5x)', fill: '#ef4444', fontSize: 10 }} />
                        <Line
                          type='monotone'
                          dataKey='ctr'
                          name='Estimated CTR %'
                          stroke='#60a5fa'
                          strokeWidth={2}
                          dot={{ r: 4, fill: '#3b82f6' }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className='mt-2 p-2.5 rounded-lg bg-blue-950/20 border border-blue-500/30 text-[11px] text-muted-foreground flex items-center justify-between'>
                    <span>⚠️ <strong>Fatigue Protection:</strong> Current frequency is <strong>{record.frequency}x</strong>. System will trigger creative variation refresh if frequency hits 2.5x.</span>
                    <span className='text-emerald-400 font-bold'>SAFE ZONE</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GOOGLE ADS TELEMETRY */}
          {selectedPlatform === 'google' && (
            <div className='space-y-4'>
              <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3'>
                <div className='flex items-center gap-2'>
                  <IconBrandGoogle className='size-5 text-emerald-500' />
                  <div>
                    <h3 className='text-xs font-bold text-foreground uppercase tracking-wider'>
                      Google Ads Auction Impression Share &amp; Headroom
                    </h3>
                    <p className='text-[11px] text-muted-foreground'>
                      Impression Share captured vs lost to budget ceiling vs ad rank
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => setGoogleSubTab('is')}
                    className={cn(
                      'px-2.5 py-1 rounded text-xs transition-all cursor-pointer',
                      googleSubTab === 'is'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Impression Share Breakdown
                  </button>
                  <button
                    onClick={() => setGoogleSubTab('quality')}
                    className={cn(
                      'px-2.5 py-1 rounded text-xs transition-all cursor-pointer',
                      googleSubTab === 'quality'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Quality Score Diagnostics
                  </button>
                </div>
              </div>

              {googleSubTab === 'is' ? (
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='md:col-span-2 h-[260px] w-full min-w-0'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart
                        data={record.impression_share_breakdown || []}
                        margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray='3 3' stroke='currentColor' className='opacity-10' vertical={false} />
                        <XAxis
                          dataKey='category'
                          stroke='currentColor'
                          className='opacity-70 text-[10px]'
                          fontSize={10}
                          tickLine={false}
                          fontFamily='monospace'
                        />
                        <YAxis
                          stroke='currentColor'
                          className='opacity-70 text-[10px]'
                          fontSize={10}
                          tickLine={false}
                          fontFamily='monospace'
                          tickFormatter={(val) => `${val}%`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey='share' name='Impression Share %' radius={[4, 4, 0, 0]}>
                          {(record.impression_share_breakdown || []).map((entry: ImpressionSharePoint, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className='space-y-3 flex flex-col justify-between p-3 rounded-lg bg-muted/40 border border-border/60 text-xs'>
                    <div>
                      <span className='font-bold text-foreground block mb-1'>Auction Growth Headroom</span>
                      <p className='text-muted-foreground text-[11px] leading-relaxed'>
                        <strong>{record.search_budget_lost_is_pct}%</strong> of searches were lost solely because the campaign ran out of daily budget.
                      </p>
                    </div>
                    <div className='p-2.5 rounded bg-emerald-950/20 border border-emerald-500/30 text-[11px] text-emerald-400 font-semibold'>
                      🚀 Scaling daily budget unlocks up to +${((record.attributed_revenue * (record.search_budget_lost_is_pct ?? 17.6)) / 100).toFixed(2)} incremental revenue immediately.
                    </div>
                  </div>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                  <div className='p-4 rounded-lg bg-card border border-border/70 space-y-2'>
                    <span className='text-[10px] text-muted-foreground uppercase'>Quality Score</span>
                    <div className='text-3xl font-bold text-emerald-400'>{record.quality_score ?? 9} / 10</div>
                    <p className='text-[11px] text-muted-foreground'>Top decile rating lowers CPC by ~16%.</p>
                  </div>
                  <div className='p-4 rounded-lg bg-card border border-border/70 space-y-2'>
                    <span className='text-[10px] text-muted-foreground uppercase'>Creative Ad Relevance</span>
                    <div className='text-sm font-bold text-foreground'>ABOVE AVERAGE</div>
                    <p className='text-[11px] text-muted-foreground'>Ad copy tightly matches Nike footwear query.</p>
                  </div>
                  <div className='p-4 rounded-lg bg-card border border-border/70 space-y-2'>
                    <span className='text-[10px] text-muted-foreground uppercase'>Landing Page UX</span>
                    <div className='text-sm font-bold text-foreground'>ABOVE AVERAGE</div>
                    <p className='text-[11px] text-muted-foreground'>High page speed and instant checkout match.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AMAZON ADVERTISING TELEMETRY */}
          {selectedPlatform === 'amazon' && (
            <div className='space-y-4'>
              <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3'>
                <div className='flex items-center gap-2'>
                  <IconBrandAmazon className='size-5 text-amber-500' />
                  <div>
                    <h3 className='text-xs font-bold text-foreground uppercase tracking-wider'>
                      Amazon Sponsored Products &amp; Halo Attribution
                    </h3>
                    <p className='text-[11px] text-muted-foreground'>
                      Direct SKU sales vs catalog spillover (halo effect) &amp; Buy Box win ownership
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => setAmazonSubTab('halo')}
                    className={cn(
                      'px-2.5 py-1 rounded text-xs transition-all cursor-pointer',
                      amazonSubTab === 'halo'
                        ? 'bg-amber-600 text-white font-bold'
                        : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Direct vs Halo Sales
                  </button>
                  <button
                    onClick={() => setAmazonSubTab('buybox')}
                    className={cn(
                      'px-2.5 py-1 rounded text-xs transition-all cursor-pointer',
                      amazonSubTab === 'buybox'
                        ? 'bg-amber-600 text-white font-bold'
                        : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Buy Box Circuit
                  </button>
                </div>
              </div>

              {amazonSubTab === 'halo' ? (
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='md:col-span-2 h-[260px] w-full min-w-0'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart
                        data={record.amazon_sales_split || []}
                        margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray='3 3' stroke='currentColor' className='opacity-10' vertical={false} />
                        <XAxis
                          dataKey='type'
                          stroke='currentColor'
                          className='opacity-70 text-[10px]'
                          fontSize={10}
                          tickLine={false}
                          fontFamily='monospace'
                        />
                        <YAxis
                          stroke='currentColor'
                          className='opacity-70 text-[10px]'
                          fontSize={10}
                          tickLine={false}
                          fontFamily='monospace'
                          tickFormatter={(val) => `$${val}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey='amount' name='Revenue Amount ($)' fill='#f59e0b' radius={[4, 4, 0, 0]}>
                          <Cell fill='#f59e0b' />
                          <Cell fill='#38bdf8' />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className='space-y-3 p-3 rounded-lg bg-muted/40 border border-border/60 flex flex-col justify-between text-xs'>
                    <div>
                      <span className='font-bold text-foreground block mb-1'>Catalog Halo Effect</span>
                      <p className='text-muted-foreground text-[11px] leading-relaxed'>
                        Shoppers who clicked on this ad also purchased <strong>${record.halo_attributed_revenue?.toFixed(2) ?? '0.00'}</strong> worth of OTHER Nike footwear styles within the 14-day attribution window.
                      </p>
                    </div>
                    <div className='p-2.5 rounded bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-400 font-semibold'>
                      Halo Contribution: {((Number(record.halo_attributed_revenue || 0) / Number(record.attributed_revenue || 1)) * 100).toFixed(1)}% of total brand sales.
                    </div>
                  </div>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='p-4 rounded-lg bg-card border border-border/70 space-y-2'>
                    <span className='text-[10px] text-muted-foreground uppercase'>Buy Box Win Rate</span>
                    <div className={cn('text-3xl font-bold', (record.buy_box_win_pct ?? 100) < 80 ? 'text-red-400' : 'text-emerald-400')}>
                      {record.buy_box_win_pct ?? 98}%
                    </div>
                    <p className='text-[11px] text-muted-foreground'>Percentage of detail page views owning the Buy Box.</p>
                  </div>
                  <div className='p-4 rounded-lg bg-card border border-border/70 space-y-2'>
                    <span className='text-[10px] text-muted-foreground uppercase'>FBA Handling Fees</span>
                    <div className='text-2xl font-bold text-amber-400'>${record.fba_fees?.toFixed(2) ?? '0.00'}</div>
                    <p className='text-[11px] text-muted-foreground'>Automated deduction from 14-day gross sales.</p>
                  </div>
                  <div className='p-4 rounded-lg bg-card border border-border/70 space-y-2'>
                    <span className='text-[10px] text-muted-foreground uppercase'>Buy Box Kill Switch</span>
                    <div className='text-sm font-bold text-emerald-400'>CIRCUIT ARMED</div>
                    <p className='text-[11px] text-muted-foreground'>Halts spend instantly if 3rd-party sellers win the box.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SHOPIFY STOREFRONT TELEMETRY */}
          {selectedPlatform === 'shopify' && (
            <div className='space-y-4'>
              <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3'>
                <div className='flex items-center gap-2'>
                  <IconBuildingStore className='size-5 text-lime-500' />
                  <div>
                    <h3 className='text-xs font-bold text-foreground uppercase tracking-wider'>
                      Shopify D2C Economics &amp; Customer Acquisition
                    </h3>
                    <p className='text-[11px] text-muted-foreground'>
                      Order checkout friction, gateway fee reconciliation, and nCAC vs LTV
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => setShopifySubTab('friction')}
                    className={cn(
                      'px-2.5 py-1 rounded text-xs transition-all cursor-pointer',
                      shopifySubTab === 'friction'
                        ? 'bg-lime-600 text-white font-bold'
                        : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Fee Friction Waterfall
                  </button>
                  <button
                    onClick={() => setShopifySubTab('funnel')}
                    className={cn(
                      'px-2.5 py-1 rounded text-xs transition-all cursor-pointer',
                      shopifySubTab === 'funnel'
                        ? 'bg-lime-600 text-white font-bold'
                        : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Customer Cohort
                  </button>
                </div>
              </div>

              {shopifySubTab === 'friction' ? (
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='md:col-span-2 h-[260px] w-full min-w-0'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart
                        data={record.shopify_fee_breakdown || []}
                        margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray='3 3' stroke='currentColor' className='opacity-10' vertical={false} />
                        <XAxis
                          dataKey='component'
                          stroke='currentColor'
                          className='opacity-70 text-[10px]'
                          fontSize={10}
                          tickLine={false}
                          fontFamily='monospace'
                        />
                        <YAxis
                          stroke='currentColor'
                          className='opacity-70 text-[10px]'
                          fontSize={10}
                          tickLine={false}
                          fontFamily='monospace'
                          tickFormatter={(val) => `$${val}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey='amount' name='Amount ($)' fill='#96bf48' radius={[4, 4, 0, 0]}>
                          {(record.shopify_fee_breakdown || []).map((entry: UnitEconomicsPoint, index: number) => {
                            let color = '#96bf48';
                            if (entry.type === 'cost') color = '#f87171';
                            if (entry.type === 'profit') color = '#34d399';
                            return <Cell key={`cell-${index}`} fill={color} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className='space-y-3 p-3 rounded-lg bg-muted/40 border border-border/60 flex flex-col justify-between text-xs'>
                    <div>
                      <span className='font-bold text-foreground block mb-1'>Gateway Friction Deduction</span>
                      <p className='text-muted-foreground text-[11px] leading-relaxed'>
                        Shopify Payments fee (2.9% + $0.30 = <strong>${record.payment_gateway_fee?.toFixed(2)}</strong>) automatically deducted for true Contribution Margin 3.
                      </p>
                    </div>
                    <div className='p-2.5 rounded bg-lime-950/20 border border-lime-500/30 text-[11px] text-lime-400 font-semibold'>
                      Net Merchant Payout: ${record.gross_margin.toFixed(2)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='p-4 rounded-lg bg-card border border-border/70 space-y-2'>
                    <span className='text-[10px] text-muted-foreground uppercase'>Customer Tier</span>
                    <div className='text-2xl font-bold text-purple-400'>{record.customer_acquisition_type}</div>
                    <p className='text-[11px] text-muted-foreground'>Distinguishes first-time buyer nCAC from repeat VIP LTV.</p>
                  </div>
                  <div className='p-4 rounded-lg bg-card border border-border/70 space-y-2'>
                    <span className='text-[10px] text-muted-foreground uppercase'>Warehouse Stock Runway</span>
                    <div className='text-2xl font-bold text-emerald-400'>{record.inventory_on_hand} Units</div>
                    <p className='text-[11px] text-muted-foreground'>Synchronized in real-time with Shopify inventory webhook.</p>
                  </div>
                  <div className='p-4 rounded-lg bg-card border border-border/70 space-y-2'>
                    <span className='text-[10px] text-muted-foreground uppercase'>D2C Profitability</span>
                    <div className='text-2xl font-bold text-lime-400'>{record.gross_margin_pct}%</div>
                    <p className='text-[11px] text-muted-foreground'>Healthy direct-to-consumer margin retention.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* GRAPH 3: OMNICHANNEL BENCHMARK COMPARISON */}
      {activeTelemetryTab === 'omnichannel' && (
        <div className='rounded-xl border border-border/80 bg-card p-4 shadow-xs space-y-4'>
          <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3'>
            <div>
              <h3 className='text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2'>
                <IconArrowsSplit2 className='size-4 text-cyan-400' />
                Cross-Platform Normalized Benchmark (Meta vs Google vs Amazon vs Shopify)
              </h3>
              <p className='text-[11px] text-muted-foreground mt-0.5'>
                Compare spend, revenue, margin, and efficiency across all four platforms simultaneously
              </p>
            </div>

            <div className='flex items-center gap-2'>
              <button
                onClick={() => setOmniMetricMode('financial')}
                className={cn(
                  'px-2.5 py-1 rounded text-xs transition-all cursor-pointer',
                  omniMetricMode === 'financial'
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                )}
              >
                Financial Volume ($)
              </button>
              <button
                onClick={() => setOmniMetricMode('efficiency')}
                className={cn(
                  'px-2.5 py-1 rounded text-xs transition-all cursor-pointer',
                  omniMetricMode === 'efficiency'
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                )}
              >
                ROAS &amp; POAS Efficiency
              </button>
            </div>
          </div>

          <div className='h-[280px] w-full min-w-0'>
            <ResponsiveContainer width='100%' height='100%'>
              {omniMetricMode === 'financial' ? (
                <BarChart data={omnichannelData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray='3 3' stroke='currentColor' className='opacity-10' vertical={false} />
                  <XAxis
                    dataKey='channel'
                    stroke='currentColor'
                    className='opacity-70 text-[10px]'
                    fontSize={10}
                    tickLine={false}
                    fontFamily='monospace'
                  />
                  <YAxis
                    stroke='currentColor'
                    className='opacity-70 text-[10px]'
                    fontSize={10}
                    tickLine={false}
                    fontFamily='monospace'
                    tickFormatter={(val) => `$${val > 999 ? (val / 1000).toFixed(0) + 'k' : val}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                  <Bar dataKey='spend' name='Spend ($)' fill='#ef4444' radius={[4, 4, 0, 0]} />
                  <Bar dataKey='revenue' name='Revenue ($)' fill='#38bdf8' radius={[4, 4, 0, 0]} />
                  <Bar dataKey='netMargin' name='Net Margin ($)' fill='#10b981' radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <BarChart data={omnichannelData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray='3 3' stroke='currentColor' className='opacity-10' vertical={false} />
                  <XAxis
                    dataKey='channel'
                    stroke='currentColor'
                    className='opacity-70 text-[10px]'
                    fontSize={10}
                    tickLine={false}
                    fontFamily='monospace'
                  />
                  <YAxis
                    stroke='currentColor'
                    className='opacity-70 text-[10px]'
                    fontSize={10}
                    tickLine={false}
                    fontFamily='monospace'
                    tickFormatter={(val) => `${val}x`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                  <Bar dataKey='roas' name='Attributed ROAS' fill='#a855f7' radius={[4, 4, 0, 0]} />
                  <Bar dataKey='poas' name='Profit on Ad Spend (POAS)' fill='#06b6d4' radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* GRAPH 4: CONVERSION FUNNEL */}
      {activeTelemetryTab === 'funnel' && (
        <div className='rounded-xl border border-border/80 bg-card p-4 shadow-xs space-y-4'>
          <div className='flex items-center justify-between border-b border-border/60 pb-3'>
            <div>
              <h3 className='text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2'>
                <IconTarget className='size-4 text-cyan-400' />
                Conversion Step Funnel &amp; Drop-Off Economics
              </h3>
              <p className='text-[11px] text-muted-foreground mt-0.5'>
                Visitor path from ad impression to converted purchase for {record.channel.toUpperCase()}
              </p>
            </div>
            <Badge variant='outline' className='bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-[10px]'>
              CTR: {record.ctr.toFixed(2)}% • CPC: ${record.cpc.toFixed(2)}
            </Badge>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
            {(record.funnel_steps || []).map((step: FunnelConversionStep, idx: number) => (
              <div key={idx} className='p-4 rounded-lg bg-card/70 border border-border/80 flex flex-col justify-between'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-[10px] text-muted-foreground uppercase font-bold'>{step.step}</span>
                  <span className='text-xs font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded'>
                    Step {idx + 1}
                  </span>
                </div>
                <div className='text-2xl font-bold text-foreground my-1'>
                  {step.count.toLocaleString()}
                </div>
                <div className='pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground'>
                  <span>Rate: <strong className='text-emerald-400'>{step.rate}</strong></span>
                  {step.dropoff && <span>Drop: <span className='text-rose-400'>{step.dropoff}</span></span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
