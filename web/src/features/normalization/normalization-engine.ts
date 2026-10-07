/**
 * Normalization Engine & Schema Types
 * Converts raw platform API partials into Canonical Unified Commerce Records
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
  }
};

export function extractSkuFromText(text: string): string {
  const known = ['310805-137', '880848-005', 'AH8050-100', '315122-001', 'CD4371-001'];
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
  const gross_margin = Math.max(0, attributed_revenue - total_cogs);
  const gross_margin_pct = attributed_revenue > 0 ? (gross_margin / attributed_revenue) * 100 : 60.0;
  const inventory_on_hand = inventoryMap[sku] ?? (sku === '310805-137' ? 0 : 510);

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
  const gross_margin = Math.max(0, revenue - total_cogs);
  const gross_margin_pct = revenue > 0 ? (gross_margin / revenue) * 100 : 60.0;
  const inventory_on_hand = inventoryMap[sku] ?? (sku === '310805-137' ? 0 : 490);

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
    raw_payload_snippet: JSON.stringify(item, null, 2)
  };
}
