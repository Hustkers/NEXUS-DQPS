/**
 * Normalization Engine & Schema Types
 * Converts raw platform API partials into Canonical Unified Commerce Records
 * Supporting Enterprise Telemetry: Frequency Wearout, Video Retention, Auction Lost IS,
 * Buy-Box Win Rate, Catalog Halo Sales, and True Net Contribution Margin (CM3/POAS).
 */

export interface UnifiedCommerceRecord {
  id: string;
  timestamp: string;
  channel: 'meta' | 'google' | 'amazon' | 'shopify';
  campaign_id: string;
  campaign_name: string;
  sku_id: string;
  sku_name: string;
  asin?: string;
  variant_id?: string;
  spend: number;
  impressions: number;
  clicks: number;
  cpc: number;
  cpm: number;
  ctr: number;
  conversions: number;
  attributed_revenue: number;
  roas: number;
  unit_cogs: number;
  total_cogs: number;
  gross_margin: number;
  gross_margin_pct: number;
  inventory_on_hand: number;

  // Extraordinary Enterprise Attributes
  frequency?: number;
  reach?: number;
  learning_phase_status?: string;
  quality_ranking?: string;
  video_hook_rate_pct?: number; // Video 3s views / impressions
  search_impression_share_pct?: number;
  search_budget_lost_is_pct?: number; // Crucial for autonomous budget scaling
  search_rank_lost_is_pct?: number;
  quality_score?: number; // Google 1-10
  buy_box_win_pct?: number; // Amazon Buy Box ownership
  halo_attributed_revenue?: number; // Amazon Other-SKU sales spillover
  fba_fees?: number;
  customer_acquisition_type?: 'NEW_ACQUISITION' | 'RETURNING_VIP';
  payment_gateway_fee?: number;
  net_contribution_margin?: number; // True Contribution Margin 3 (CM3)
  poas?: number; // Profit on Ad Spend: net_margin / spend

  raw_payload_snippet: string;
}

export const CATALOG_LOOKUP: Record<
  string,
  { name: string; price: number; cogs: number; asin: string; variantId: string }
> = {
  '310805-137': {
    name: 'Air Jordan 10 Retro',
    price: 192.71,
    cogs: 58.0,
    asin: 'B07Q8Z9101',
    variantId: 'gid://shopify/ProductVariant/41001'
  },
  '880848-005': {
    name: 'Nike Zoom Fly',
    price: 174.64,
    cogs: 52.5,
    asin: 'B07Q8Z9102',
    variantId: 'gid://shopify/ProductVariant/41002'
  },
  'AH8050-100': {
    name: 'Nike Air Max 270',
    price: 168.61,
    cogs: 48.0,
    asin: 'B07Q8Z9103',
    variantId: 'gid://shopify/ProductVariant/41003'
  },
  '315122-001': {
    name: "Nike Air Force 1 '07",
    price: 87.89,
    cogs: 38.5,
    asin: 'B07Q8Z9104',
    variantId: 'gid://shopify/ProductVariant/41004'
  },
  'CD4371-001': {
    name: 'Nike React Infinity Run Flyknit',
    price: 168.61,
    cogs: 69.0,
    asin: 'B07Q8Z9107',
    variantId: 'gid://shopify/ProductVariant/41007'
  },
  'AO2924-401': {
    name: 'Nike Air Zoom Pegasus 36',
    price: 120.00,
    cogs: 42.0,
    asin: 'B07Q8Z9105',
    variantId: 'gid://shopify/ProductVariant/41005'
  }
};

export function extractSkuFromText(text: string): string {
  const known = ['310805-137', '880848-005', 'AH8050-100', '315122-001', 'CD4371-001', 'AO2924-401'];
  for (const k of known) {
    if (text.includes(k)) return k;
  }
  return '310805-137';
}

export function normalizeMetaInsights(item: any, inventoryMap: Record<string, number>): UnifiedCommerceRecord {
  const sku = extractSkuFromText(item.campaign_name || item.ad_id || '');
  const catalog = CATALOG_LOOKUP[sku] || {
    name: 'Nike Footwear Product',
    price: 150.0,
    cogs: 55.0,
    asin: 'B07Q8Z9101',
    variantId: 'gid://shopify/ProductVariant/41001'
  };

  const spend = Number(item.spend) || 0;
  const impressions = Number(item.impressions) || 0;
  const clicks = Number(item.clicks) || 0;
  const cpc = clicks > 0 ? spend / clicks : 0;
  const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

  // Find purchases from actions array
  const purchaseAction = Array.isArray(item.actions)
    ? item.actions.find((a: any) => a.action_type === 'omni_purchase' || a.action_type === 'purchase')
    : null;
  const conversions = purchaseAction ? Number(purchaseAction.value) : 0;

  // Find revenue from action_values array
  const revAction = Array.isArray(item.action_values)
    ? item.action_values.find((av: any) => av.action_type === 'omni_purchase' || av.action_type === 'purchase')
    : null;
  const attributed_revenue = revAction ? Number(revAction.value) : conversions * catalog.price;

  const total_cogs = conversions * catalog.cogs;
  const gross_margin = Math.max(0, attributed_revenue - total_cogs);
  const roas = spend > 0 ? attributed_revenue / spend : 0;
  const gross_margin_pct = attributed_revenue > 0 ? (gross_margin / attributed_revenue) * 100 : 60.0;
  const inventory_on_hand = inventoryMap[sku] ?? (sku === '310805-137' ? 0 : 420);

  // Extraordinary Meta Telemetry
  const frequency = Number(item.frequency) || 1.0;
  const reach = Number(item.reach) || (impressions > 0 ? Math.round(impressions / frequency) : 0);
  const learning_phase_status = item.learning_phase_status || 'SUCCESS';
  const quality_ranking = item.quality_ranking || 'AVERAGE';
  
  // Video 3s hook rate
  const video3s = Number(item.video_play_actions?.video_3_sec_watched_actions) || 0;
  const video_hook_rate_pct = impressions > 0 && video3s > 0 ? Number(((video3s / impressions) * 100).toFixed(1)) : undefined;

  // Net Contribution Margin & POAS
  const net_contribution_margin = Math.max(0, gross_margin - spend);
  const poas = spend > 0 ? Number((gross_margin / spend).toFixed(2)) : undefined;

  return {
    id: `meta_${item.ad_id || item.campaign_id}`,
    timestamp: item.date_start ? `${item.date_start}T00:00:00Z` : new Date().toISOString(),
    channel: 'meta',
    campaign_id: String(item.campaign_id || item.ad_id),
    campaign_name: item.campaign_name || `Meta - Campaign ${item.campaign_id}`,
    sku_id: sku,
    sku_name: catalog.name,
    asin: catalog.asin,
    variant_id: catalog.variantId,
    spend: Number(spend.toFixed(2)),
    impressions,
    clicks,
    cpc: Number(cpc.toFixed(2)),
    cpm: Number(cpm.toFixed(2)),
    ctr: Number(ctr.toFixed(2)),
    conversions,
    attributed_revenue: Number(attributed_revenue.toFixed(2)),
    roas: Number(roas.toFixed(2)),
    unit_cogs: catalog.cogs,
    total_cogs: Number(total_cogs.toFixed(2)),
    gross_margin: Number(gross_margin.toFixed(2)),
    gross_margin_pct: Number(gross_margin_pct.toFixed(1)),
    inventory_on_hand,
    frequency,
    reach,
    learning_phase_status,
    quality_ranking,
    video_hook_rate_pct,
    net_contribution_margin: Number(net_contribution_margin.toFixed(2)),
    poas,
    raw_payload_snippet: JSON.stringify(item, null, 2)
  };
}

export function normalizeGoogleAdsRow(item: any, inventoryMap: Record<string, number>): UnifiedCommerceRecord {
  const campName = item.campaign?.name || '';
  const sku = extractSkuFromText(campName);
  const catalog = CATALOG_LOOKUP[sku] || {
    name: 'Nike Footwear Product',
    price: 150.0,
    cogs: 55.0,
    asin: 'B07Q8Z9101',
    variantId: 'gid://shopify/ProductVariant/41001'
  };

  const costMicros = Number(item.metrics?.costMicros) || 0;
  const spend = costMicros / 1000000;
  const impressions = Number(item.metrics?.impressions) || 0;
  const clicks = Number(item.metrics?.clicks) || 0;
  const conversions = Math.round(Number(item.metrics?.conversions) || 0);
  const attributed_revenue = Number(item.metrics?.conversionsValue) || conversions * catalog.price;

  const cpc = clicks > 0 ? spend / clicks : 0;
  const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const roas = spend > 0 ? attributed_revenue / spend : 0;

  const total_cogs = conversions * catalog.cogs;
  const gross_margin = Math.max(0, attributed_revenue - total_cogs);
  const gross_margin_pct = attributed_revenue > 0 ? (gross_margin / attributed_revenue) * 100 : 60.0;
  const inventory_on_hand = inventoryMap[sku] ?? (sku === '310805-137' ? 0 : 380);

  // Extraordinary Google Auction Intelligence
  const isMetrics = item.metrics || {};
  const search_impression_share_pct = isMetrics.searchImpressionShare != null
    ? Number((isMetrics.searchImpressionShare * 100).toFixed(1))
    : undefined;
  const search_budget_lost_is_pct = isMetrics.searchBudgetLostImpressionShare != null
    ? Number((isMetrics.searchBudgetLostImpressionShare * 100).toFixed(1))
    : undefined;
  const search_rank_lost_is_pct = isMetrics.searchRankLostImpressionShare != null
    ? Number((isMetrics.searchRankLostImpressionShare * 100).toFixed(1))
    : undefined;

  const quality_score = item.ad_group_criterion?.qualityInfo?.qualityScore ?? undefined;
  const net_contribution_margin = Math.max(0, gross_margin - spend);
  const poas = spend > 0 ? Number((gross_margin / spend).toFixed(2)) : undefined;

  return {
    id: `google_${item.campaign?.id || Math.random()}`,
    timestamp: item.segments?.date ? `${item.segments.date}T00:00:00Z` : new Date().toISOString(),
    channel: 'google',
    campaign_id: String(item.campaign?.id || 'google_camp'),
    campaign_name: campName || `Google Ads - ${sku}`,
    sku_id: sku,
    sku_name: catalog.name,
    asin: catalog.asin,
    variant_id: catalog.variantId,
    spend: Number(spend.toFixed(2)),
    impressions,
    clicks,
    cpc: Number(cpc.toFixed(2)),
    cpm: Number(cpm.toFixed(2)),
    ctr: Number(ctr.toFixed(2)),
    conversions,
    attributed_revenue: Number(attributed_revenue.toFixed(2)),
    roas: Number(roas.toFixed(2)),
    unit_cogs: catalog.cogs,
    total_cogs: Number(total_cogs.toFixed(2)),
    gross_margin: Number(gross_margin.toFixed(2)),
    gross_margin_pct: Number(gross_margin_pct.toFixed(1)),
    inventory_on_hand,
    search_impression_share_pct,
    search_budget_lost_is_pct,
    search_rank_lost_is_pct,
    quality_score,
    net_contribution_margin: Number(net_contribution_margin.toFixed(2)),
    poas,
    raw_payload_snippet: JSON.stringify(item, null, 2)
  };
}

export function normalizeAmazonSponsoredProducts(
  item: any,
  inventoryMap: Record<string, number>
): UnifiedCommerceRecord {
  const sku = item.sku || extractSkuFromText(item.campaignName || '');
  const catalog = CATALOG_LOOKUP[sku] || {
    name: 'Nike Footwear Product',
    price: 150.0,
    cogs: 55.0,
    asin: item.asin || 'B07Q8Z9101',
    variantId: 'gid://shopify/ProductVariant/41001'
  };

  const spend = Number(item.cost) || 0;
  const impressions = Number(item.impressions) || 0;
  const clicks = Number(item.clicks) || 0;
  const conversions = Number(item.attributedUnitsOrdered14d) || 0;
  const attributed_revenue = Number(item.attributedSales14d) || conversions * catalog.price;

  const cpc = clicks > 0 ? spend / clicks : 0;
  const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const roas = spend > 0 ? attributed_revenue / spend : 0;

  const total_cogs = conversions * catalog.cogs;
  const fba_fees_per_unit = Number(item.fbaFeesEstimate) || 6.50;
  const total_fba_fees = conversions * fba_fees_per_unit;
  const referral_fees = attributed_revenue * (Number(item.referralFeeRate) || 0.15);
  const gross_margin = Math.max(0, attributed_revenue - total_cogs - total_fba_fees - referral_fees);
  const gross_margin_pct = attributed_revenue > 0 ? (gross_margin / attributed_revenue) * 100 : 60.0;
  const inventory_on_hand = inventoryMap[sku] ?? (sku === '310805-137' ? 0 : 510);

  // Extraordinary Amazon SP-API & Placement Metrics
  const buy_box_win_pct = item.buyBoxWinPercentage != null
    ? Number((item.buyBoxWinPercentage * 100).toFixed(1))
    : 95.0;
  const halo_attributed_revenue = Number(item.attributedSalesOtherSku14d) || 0;
  const net_contribution_margin = Math.max(0, gross_margin - spend);
  const poas = spend > 0 ? Number((gross_margin / spend).toFixed(2)) : undefined;

  return {
    id: `amazon_${item.campaignId}_${sku}`,
    timestamp: item.date ? `${item.date}T00:00:00Z` : new Date().toISOString(),
    channel: 'amazon',
    campaign_id: String(item.campaignId),
    campaign_name: item.campaignName || `Amazon SP - ${sku}`,
    sku_id: sku,
    sku_name: catalog.name,
    asin: item.asin || catalog.asin,
    variant_id: catalog.variantId,
    spend: Number(spend.toFixed(2)),
    impressions,
    clicks,
    cpc: Number(cpc.toFixed(2)),
    cpm: Number(cpm.toFixed(2)),
    ctr: Number(ctr.toFixed(2)),
    conversions,
    attributed_revenue: Number(attributed_revenue.toFixed(2)),
    roas: Number(roas.toFixed(2)),
    unit_cogs: catalog.cogs,
    total_cogs: Number(total_cogs.toFixed(2)),
    gross_margin: Number(gross_margin.toFixed(2)),
    gross_margin_pct: Number(gross_margin_pct.toFixed(1)),
    inventory_on_hand,
    buy_box_win_pct,
    halo_attributed_revenue,
    fba_fees: Number(total_fba_fees.toFixed(2)),
    net_contribution_margin: Number(net_contribution_margin.toFixed(2)),
    poas,
    raw_payload_snippet: JSON.stringify(item, null, 2)
  };
}

export function normalizeShopifyOrder(item: any, inventoryMap: Record<string, number>): UnifiedCommerceRecord {
  const lineItem = item.line_items?.[0] || {};
  const sku = lineItem.sku || '310805-137';
  const catalog = CATALOG_LOOKUP[sku] || {
    name: 'Nike Footwear Product',
    price: lineItem.price || 150.0,
    cogs: 55.0,
    asin: 'B07Q8Z9101',
    variantId: lineItem.variant_id || 'gid://shopify/ProductVariant/41001'
  };

  const revenue = Number(item.total_price) || catalog.price;
  const conversions = Number(lineItem.quantity) || 1;
  // Estimated Shop App / Collabs promotion spend (~18% of revenue)
  const spend = Number((revenue * 0.18).toFixed(2));
  const impressions = Math.round((spend / 8.4) * 1000);
  const clicks = Math.round(impressions * 0.024);

  const cpc = clicks > 0 ? spend / clicks : 0;
  const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const roas = spend > 0 ? revenue / spend : 0;

  const total_cogs = conversions * catalog.cogs;
  const payment_gateway_fee = Number(item.processing_fee) || Number((revenue * 0.029 + 0.30).toFixed(2));
  const taxes = Number(item.total_tax) || 0;
  const gross_margin = Math.max(0, revenue - total_cogs - payment_gateway_fee - taxes);
  const gross_margin_pct = revenue > 0 ? (gross_margin / revenue) * 100 : 60.0;
  const inventory_on_hand = inventoryMap[sku] ?? (sku === '310805-137' ? 0 : 490);

  // Extraordinary Shopify D2C Customer Economics
  const customer_acquisition_type = item.customer?.orders_count === 1 ? 'NEW_ACQUISITION' : 'RETURNING_VIP';
  const net_contribution_margin = Math.max(0, gross_margin - spend);
  const poas = spend > 0 ? Number((gross_margin / spend).toFixed(2)) : undefined;

  return {
    id: `shopify_${item.id}`,
    timestamp: item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString(),
    channel: 'shopify',
    campaign_id: `shopify_order_${item.order_number}`,
    campaign_name: `Shopify D2C Order #${item.order_number}`,
    sku_id: sku,
    sku_name: catalog.name,
    asin: catalog.asin,
    variant_id: lineItem.variant_id || catalog.variantId,
    spend,
    impressions,
    clicks,
    cpc: Number(cpc.toFixed(2)),
    cpm: Number(cpm.toFixed(2)),
    ctr: Number(ctr.toFixed(2)),
    conversions,
    attributed_revenue: Number(revenue.toFixed(2)),
    roas: Number(roas.toFixed(2)),
    unit_cogs: catalog.cogs,
    total_cogs: Number(total_cogs.toFixed(2)),
    gross_margin: Number(gross_margin.toFixed(2)),
    gross_margin_pct: Number(gross_margin_pct.toFixed(1)),
    inventory_on_hand,
    customer_acquisition_type,
    payment_gateway_fee,
    net_contribution_margin: Number(net_contribution_margin.toFixed(2)),
    poas,
    raw_payload_snippet: JSON.stringify(item, null, 2)
  };
}
