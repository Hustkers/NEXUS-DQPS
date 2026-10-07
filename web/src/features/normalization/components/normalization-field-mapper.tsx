'use client';

import React, { useState, useMemo } from 'react';
import {
  IconSearch,
  IconArrowRight,
  IconCpu
} from '@tabler/icons-react';
import { UnifiedCommerceRecord } from '../normalization-engine';

interface MappingItem {
  sourceKey: string;
  sourceSample: string;
  operator: string;
  targetKey: string;
  targetValue: string;
  impact: string;
}

interface NormalizationFieldMapperProps {
  platform: 'meta' | 'google' | 'amazon' | 'shopify';
  record: UnifiedCommerceRecord | null;
}

export function NormalizationFieldMapper({ platform, record }: NormalizationFieldMapperProps) {
  const [search, setSearch] = useState('');

  const mappings = useMemo<MappingItem[]>(() => {
    if (!record) return [];

    switch (platform) {
      case 'meta':
        return [
          {
            sourceKey: 'actions[action_type="omni_purchase"].value',
            sourceSample: '1.0 (nested array)',
            operator: 'Array unwrap & numeric cast',
            targetKey: 'conversions',
            targetValue: `${record.conversions} orders`,
            impact: 'Converts deeply nested action array to verified order count.'
          },
          {
            sourceKey: 'action_values[omni_purchase].value',
            sourceSample: '$168.61',
            operator: 'Currency sanitize & fallback to price * units',
            targetKey: 'attributed_revenue',
            targetValue: `$${record.attributed_revenue.toFixed(2)}`,
            impact: 'Harmonizes omnichannel purchase value to clean float.'
          },
          {
            sourceKey: 'spend',
            sourceSample: String(record.spend),
            operator: 'Identity float cast',
            targetKey: 'spend',
            targetValue: `$${record.spend.toFixed(2)}`,
            impact: 'Normalized currency value across all ad channels.'
          },
          {
            sourceKey: 'frequency & reach',
            sourceSample: `Freq ${record.frequency}x • Reach ${record.reach}`,
            operator: 'Decay curve generator',
            targetKey: 'wearout_decay_curve',
            targetValue: `${record.frequency}x (Safe)`,
            impact: 'Detects creative ad fatigue before performance degrades.'
          },
          {
            sourceKey: 'video_play_actions.video_3_sec',
            sourceSample: '2,850 watched',
            operator: 'Video views ÷ Total impressions',
            targetKey: 'video_hook_rate_pct',
            targetValue: `${record.video_hook_rate_pct ?? 38.8}%`,
            impact: 'Signals creative engagement strength to the algorithm.'
          },
          {
            sourceKey: 'campaign_name',
            sourceSample: record.campaign_name,
            operator: 'Regex SKU extractor & ERP Catalog join',
            targetKey: 'sku_id & sku_name',
            targetValue: `${record.sku_id} (${record.sku_name})`,
            impact: 'Connects marketing ad campaign directly to physical warehouse SKU.'
          }
        ];
      case 'google':
        return [
          {
            sourceKey: 'metrics.costMicros',
            sourceSample: '36,150,000 micros',
            operator: 'costMicros ÷ 1,000,000',
            targetKey: 'spend',
            targetValue: `$${record.spend.toFixed(2)}`,
            impact: 'Prevents 10^6 micro-currency arithmetic distortion.'
          },
          {
            sourceKey: 'metrics.searchBudgetLostImpressionShare',
            sourceSample: `${((record.search_budget_lost_is_pct ?? 17.6) / 100).toFixed(3)}`,
            operator: 'Value × 100 percentage cast',
            targetKey: 'search_budget_lost_is_pct',
            targetValue: `${record.search_budget_lost_is_pct}%`,
            impact: 'Identifies uncaptured market demand constrained by budget ceilings.'
          },
          {
            sourceKey: 'metrics.conversionsValue',
            sourceSample: `$${record.attributed_revenue.toFixed(2)}`,
            operator: 'Float numeric cast',
            targetKey: 'attributed_revenue',
            targetValue: `$${record.attributed_revenue.toFixed(2)}`,
            impact: 'Unifies Google conversionsValue with direct D2C orders.'
          },
          {
            sourceKey: 'ad_group_criterion.qualityScore',
            sourceSample: `${record.quality_score ?? 9} / 10`,
            operator: 'Quality score scalar parse',
            targetKey: 'quality_score',
            targetValue: `${record.quality_score ?? 9} / 10`,
            impact: 'Used by bid arbitration engine to discount CPC floor.'
          },
          {
            sourceKey: 'campaign.name',
            sourceSample: record.campaign_name,
            operator: 'SKU regex lookup & ERP Match',
            targetKey: 'sku_id & variant_id',
            targetValue: `${record.sku_id} (Nike Air Max)`,
            impact: 'Harmonizes Google Shopping feed with Shopify Master SKU.'
          }
        ];
      case 'amazon':
        return [
          {
            sourceKey: 'attributedSalesOtherSku14d',
            sourceSample: `$${record.halo_attributed_revenue?.toFixed(2) ?? '1,200.00'}`,
            operator: 'Halo attribution extractor',
            targetKey: 'halo_attributed_revenue',
            targetValue: `$${record.halo_attributed_revenue?.toFixed(2) ?? '0.00'}`,
            impact: 'Separates direct SKU sales from catalog halo cross-purchases.'
          },
          {
            sourceKey: 'buyBoxWinPercentage',
            sourceSample: `${((record.buy_box_win_pct ?? 98) / 100).toFixed(2)}`,
            operator: 'Win rate percentage cast & circuit check',
            targetKey: 'buy_box_win_pct',
            targetValue: `${record.buy_box_win_pct}% (Won)`,
            impact: 'Triggers automated spend circuit breaker if Buy Box drops below 80%.'
          },
          {
            sourceKey: 'fbaFeesEstimate & referralFeeRate',
            sourceSample: `$6.85/unit + 15% referral`,
            operator: 'Units × Fee + Revenue × 0.15',
            targetKey: 'fba_fees & gross_margin',
            targetValue: `-$${record.fba_fees?.toFixed(2) ?? '0.00'} FBA`,
            impact: 'Deducts Amazon marketplace fulfillment friction for true CM3 net margin.'
          },
          {
            sourceKey: 'asin & sku',
            sourceSample: `${record.asin || 'B07Q8Z9101'}`,
            operator: 'Catalog cross-reference mapper',
            targetKey: 'canonical_sku_id',
            targetValue: record.sku_id,
            impact: 'Links Amazon ASIN directly to Shopify product variant and Nike barcode.'
          }
        ];
      case 'shopify':
        return [
          {
            sourceKey: 'processing_fee',
            sourceSample: `$${record.payment_gateway_fee?.toFixed(2) ?? '6.24'}`,
            operator: 'Gateway friction deduction',
            targetKey: 'payment_gateway_fee',
            targetValue: `-$${record.payment_gateway_fee?.toFixed(2)}`,
            impact: 'Deducts Stripe/Shopify Payments fee (2.9% + $0.30) for true CM3.'
          },
          {
            sourceKey: 'customer.orders_count',
            sourceSample: record.customer_acquisition_type === 'NEW_ACQUISITION' ? '1 order' : '4 orders',
            operator: 'Cohort conditional evaluator',
            targetKey: 'customer_acquisition_type',
            targetValue: record.customer_acquisition_type ?? 'NEW_ACQUISITION',
            impact: 'Separates first-time customer nCAC from high-LTV repeat purchases.'
          },
          {
            sourceKey: 'inventory_item.available',
            sourceSample: `${record.inventory_on_hand} in stock`,
            operator: 'Warehouse stock join & circuit check',
            targetKey: 'inventory_on_hand',
            targetValue: `${record.inventory_on_hand} Units`,
            impact: 'Halts ad campaigns immediately when warehouse units reach 0.'
          },
          {
            sourceKey: 'line_items[0].sku',
            sourceSample: record.sku_id,
            operator: 'Canonical Nike Master SKU join',
            targetKey: 'sku_id',
            targetValue: record.sku_id,
            impact: 'Central identifier across all ad platform reports.'
          }
        ];
      default:
        return [];
    }
  }, [platform, record]);

  const filtered = useMemo(() => {
    if (!search.trim()) return mappings;
    const q = search.toLowerCase();
    return mappings.filter(
      (m) =>
        m.sourceKey.toLowerCase().includes(q) ||
        m.targetKey.toLowerCase().includes(q) ||
        m.operator.toLowerCase().includes(q) ||
        m.impact.toLowerCase().includes(q)
    );
  }, [mappings, search]);

  return (
    <div className='rounded-xl border border-border/80 bg-card p-4 shadow-xs font-mono space-y-3'>
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3'>
        <div className='flex items-center gap-2'>
          <IconCpu className='size-4 text-cyan-400' />
          <h3 className='text-xs font-bold text-foreground uppercase tracking-wider'>
            Interactive Transformation &amp; Normalization Rules
          </h3>
        </div>

        <div className='relative w-full sm:w-64'>
          <IconSearch className='size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground' />
          <input
            type='text'
            placeholder='Filter fields (e.g. spend, fee, sku)...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full pl-8 pr-3 py-1 bg-muted/40 border border-border/70 rounded-md text-xs text-foreground placeholder:text-muted-foreground outline-hidden focus:border-cyan-500/80 transition-all font-mono'
          />
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full text-left border-collapse text-xs'>
          <thead>
            <tr className='border-b border-border/60 text-[10px] text-muted-foreground uppercase bg-muted/30'>
              <th className='py-2 px-3 font-semibold'>Source API Key</th>
              <th className='py-2 px-3 font-semibold'>Transformation Logic</th>
              <th className='py-2 px-3 font-semibold'>Canonical Target</th>
              <th className='py-2 px-3 font-semibold'>Resolved Value</th>
              <th className='py-2 px-3 font-semibold hidden md:table-cell'>Decision Engine Impact</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border/40'>
            {filtered.map((item, idx) => (
              <tr key={idx} className='hover:bg-muted/30 transition-colors'>
                <td className='py-2.5 px-3 text-amber-400 font-medium truncate max-w-[180px]'>
                  {item.sourceKey}
                </td>
                <td className='py-2.5 px-3 text-muted-foreground text-[11px]'>
                  {item.operator}
                </td>
                <td className='py-2.5 px-3 text-cyan-400 font-semibold flex items-center gap-1.5'>
                  <IconArrowRight className='size-3 shrink-0 text-muted-foreground' />
                  {item.targetKey}
                </td>
                <td className='py-2.5 px-3 text-emerald-400 font-bold'>
                  {item.targetValue}
                </td>
                <td className='py-2.5 px-3 text-[11px] text-muted-foreground hidden md:table-cell leading-relaxed'>
                  {item.impact}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
