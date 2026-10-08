#!/usr/bin/env python3
"""
NEXUS-DQPS Omnichannel & Geo-Telemetry Synthesizer
==================================================
1. Balances platform data volume across Google Ads, Amazon SP-API, and Shopify Orders.
2. Backfills GeoLocationContext (/24 subnet, edge_pop, rtt_latency_ms) across visitor-tracking-state.json.
3. Hydrates DuckDB lakehouse tables (ad_spend_daily, inventory_levels, shopify_orders, shopify_order_lines, unified_commerce_ledger).
4. Embeds time-series macro shocks and anomalies directly into metrics.csv.
"""
import os, sys, json, random, hashlib, datetime
import pandas as pd
import duckdb

random.seed(42)

# --- 1. GEO-TELEMETRY BACKFILL ---
print('[1/4] Backfilling GeoLocationContext into visitor-tracking-state.json...')
GEO_POPS = [
    {'region_id': 'us-east', 'country_code': 'US', 'metro_code': '501', 'edge_pop': 'EWR', 'subnet_base': '198.51.100.', 'rtt_range': (8, 22)},
    {'region_id': 'us-east', 'country_code': 'US', 'metro_code': '506', 'edge_pop': 'BOS', 'subnet_base': '198.51.104.', 'rtt_range': (10, 25)},
    {'region_id': 'us-west', 'country_code': 'US', 'metro_code': '807', 'edge_pop': 'SFO', 'subnet_base': '203.0.113.', 'rtt_range': (12, 28)},
    {'region_id': 'us-west', 'country_code': 'US', 'metro_code': '803', 'edge_pop': 'LAX', 'subnet_base': '203.0.115.', 'rtt_range': (9, 20)},
    {'region_id': 'emea-de', 'country_code': 'DE', 'metro_code': 'FRA', 'edge_pop': 'FRA', 'subnet_base': '192.0.2.', 'rtt_range': (14, 32)},
    {'region_id': 'emea-uk', 'country_code': 'GB', 'metro_code': 'LON', 'edge_pop': 'LHR', 'subnet_base': '192.0.4.', 'rtt_range': (11, 26)},
    {'region_id': 'apac-jp', 'country_code': 'JP', 'metro_code': 'TYO', 'edge_pop': 'NRT', 'subnet_base': '198.18.0.', 'rtt_range': (18, 38)},
    {'region_id': 'sea-sg',  'country_code': 'SG', 'metro_code': 'SIN', 'edge_pop': 'SIN', 'subnet_base': '198.19.0.', 'rtt_range': (22, 45)},
]

tracking_path = 'web/src/data/visitor-tracking-state.json'
with open(tracking_path, 'r') as f:
    tracking_data = json.load(f)

# Deterministically assign each visitor a home region & subnet
visitor_geo_map = {}
for v in tracking_data.get('visitors', []):
    vid = v['visitor_id']
    seed_int = int(hashlib.md5(vid.encode()).hexdigest()[:8], 16)
    g = GEO_POPS[seed_int % len(GEO_POPS)]
    subnet_host = (seed_int % 250) + 1
    visitor_geo_map[vid] = {
        'region_id': g['region_id'],
        'country_code': g['country_code'],
        'metro_code': g['metro_code'],
        'edge_pop': g['edge_pop'],
        'subnet_masked': f"{g['subnet_base']}{subnet_host}/24",
        'rtt_latency_ms': random.randint(g['rtt_range'][0], g['rtt_range'][1])
    }

# Inject geo context into sessions
for s in tracking_data.get('sessions', []):
    vid = s['visitor_id']
    geo = visitor_geo_map.get(vid, GEO_POPS[0])
    s['geo'] = {
        'region_id': geo['region_id'],
        'country_code': geo['country_code'],
        'metro_code': geo['metro_code'],
        'edge_pop': geo['edge_pop'],
        'subnet_masked': geo['subnet_masked'],
        'rtt_latency_ms': geo['rtt_latency_ms'] + random.randint(-2, 4)
    }

# Inject geo context into events
for ev in tracking_data.get('events', []):
    vid = ev['visitor_id']
    geo = visitor_geo_map.get(vid, GEO_POPS[0])
    ev['geo'] = {
        'region_id': geo['region_id'],
        'country_code': geo['country_code'],
        'metro_code': geo['metro_code'],
        'edge_pop': geo['edge_pop'],
        'subnet_masked': geo['subnet_masked'],
        'rtt_latency_ms': max(4, geo['rtt_latency_ms'] + random.randint(-3, 5))
    }

with open(tracking_path, 'w') as f:
    json.dump(tracking_data, f, indent=2)
print(f'  ✓ Successfully enriched {len(tracking_data["sessions"])} sessions and {len(tracking_data["events"])} events with Zero-GPS /24 subnet telemetry.')

# --- 2. MULTI-PLATFORM TIME SERIES SYNTHESIS & ANOMALY INJECTION ---
print('[2/4] Synthesizing balanced omnichannel dataset in data/metrics.csv & payloads in INR (₹)...')
SKU_CATALOG = {
    '310805-137': {'name': 'Air Jordan 10 Retro', 'price': 15995.0, 'cogs': 5800.0, 'base_stock': 0, 'stockout_date': '2026-09-28'},
    '880848-005': {'name': 'Nike Zoom Fly', 'price': 14495.0, 'cogs': 5250.0, 'base_stock': 410},
    'AH8050-100': {'name': 'Nike Air Max 270', 'price': 13995.0, 'cogs': 4800.0, 'base_stock': 360},
    '315122-001': {'name': "Nike Air Force 1 '07", 'price': 7495.0, 'cogs': 3150.0, 'base_stock': 520, 'stockout_date': '2026-09-28'},
    'CD4371-001': {'name': 'Nike React Infinity Run Flyknit', 'price': 13995.0, 'cogs': 5800.0, 'base_stock': 320},
    'AO2924-401': {'name': 'Nike Air Zoom Pegasus 36', 'price': 12797.0, 'cogs': 4500.0, 'base_stock': 280},
    'BQ8928-011': {'name': 'Nike Epic React Flyknit 2', 'price': 10397.0, 'cogs': 3900.0, 'base_stock': 600},
    '942851-002': {'name': 'Nike Air Zoom Pegasus 35', 'price': 10995.0, 'cogs': 3800.0, 'base_stock': 0, 'stockout_date': '2026-09-28'},
    '849559-004': {'name': 'Nike Air Max 2017', 'price': 15995.0, 'cogs': 5500.0, 'base_stock': 450},
    'AT5405-001': {'name': 'Nike Joyride Run Flyknit', 'price': 14995.0, 'cogs': 5200.0, 'base_stock': 310}
}

df_existing = pd.read_csv('data/metrics.csv')
print(f'  Existing metrics.csv rows: {len(df_existing)}')

# Scale existing Meta rows from USD to INR
df_meta = df_existing[df_existing['platform'] == 'meta'].copy()
if df_meta['price'].mean() < 500: # Still in USD
    df_meta['spend'] = (df_meta['spend'] * 84.0).round(2)
    df_meta['cpm'] = (df_meta['cpm'] * 84.0).round(2)
    df_meta['price'] = df_meta['sku'].map(lambda s: SKU_CATALOG.get(s, {}).get('price', 11995.0))
    df_meta['revenue'] = (df_meta['conversions'] * df_meta['price']).round(2)
    cogs_map = {s: info['cogs'] for s, info in SKU_CATALOG.items()}
    df_meta['margin'] = (df_meta['conversions'] * (df_meta['price'] - df_meta['sku'].map(lambda s: cogs_map.get(s, 4500.0)))).round(2)

# Generate 90 days of synthetic rows for Google, Amazon, Shopify in INR
date_range = pd.date_range(start='2026-07-09', end='2026-10-07', freq='D')
synth_rows = []

for dt in date_range:
    d_str = dt.strftime('%Y-%m-%d')
    for sku, info in SKU_CATALOG.items():
        price = info['price']
        cogs = info['cogs']
        margin_per_u = price - cogs
        
        # Check stockout status for anomaly injection
        is_stocked_out = 'stockout_date' in info and d_str >= info['stockout_date']
        
        # 1. GOOGLE ADS (INR)
        g_cpm = round(random.uniform(1512.0, 2688.0), 2) # e.g. 18.0 * 84 to 32.0 * 84
        g_spend = round(random.uniform(6720.0, 37800.0), 2) # e.g. 80.0 * 84 to 450.0 * 84
        g_impr = int((g_spend / g_cpm) * 1000)
        g_ctr = random.uniform(0.025, 0.055)
        g_clicks = int(g_impr * g_ctr)
        g_sessions = int(g_clicks * random.uniform(0.85, 0.98))
        
        if is_stocked_out:
            g_conv = 0
            g_rev = 0.0
            g_margin = 0.0
            inv = 0
        else:
            g_cvr = random.uniform(0.028, 0.062)
            g_conv = max(1, int(g_clicks * g_cvr))
            g_rev = round(g_conv * price, 2)
            g_margin = round(g_conv * margin_per_u, 2)
            inv = max(0, info['base_stock'] - random.randint(0, 30))
            
        synth_rows.append({
            'date': d_str,
            'platform': 'google',
            'campaign': f'google-{sku}',
            'sku': sku,
            'spend': g_spend,
            'cpm': g_cpm,
            'impressions': g_impr,
            'conversions': g_conv,
            'revenue': g_rev,
            'margin': g_margin,
            'inventory': inv,
            'price': price,
            'ga_sessions': g_sessions
        })
        
        # 2. AMAZON SPONSORED PRODUCTS (INR)
        a_cpm = round(random.uniform(1176.0, 2184.0), 2) # e.g. 14.0 * 84 to 26.0 * 84
        a_spend = round(random.uniform(8400.0, 50400.0), 2) # e.g. 100.0 * 84 to 600.0 * 84
        a_impr = int((a_spend / a_cpm) * 1000)
        a_ctr = random.uniform(0.018, 0.045)
        a_clicks = int(a_impr * a_ctr)
        a_sessions = int(a_clicks * random.uniform(0.90, 1.0))
        
        if is_stocked_out:
            a_conv = 0
            a_rev = 0.0
            a_margin = 0.0
            inv = 0
        else:
            a_cvr = random.uniform(0.045, 0.095) # High Amazon intent
            a_conv = max(1, int(a_clicks * a_cvr))
            a_rev = round(a_conv * price, 2)
            a_margin = round(a_conv * margin_per_u, 2)
            inv = max(0, info['base_stock'] - random.randint(0, 45))
            
        synth_rows.append({
            'date': d_str,
            'platform': 'amazon',
            'campaign': f'amazon-{sku}',
            'sku': sku,
            'spend': a_spend,
            'cpm': a_cpm,
            'impressions': a_impr,
            'conversions': a_conv,
            'revenue': a_rev,
            'margin': a_margin,
            'inventory': inv,
            'price': price,
            'ga_sessions': a_sessions
        })
        
        # 3. SHOPIFY STOREFRONT D2C (INR)
        s_spend = round(random.uniform(1680.0, 10080.0), 2) # e.g. 20.0 * 84 to 120.0 * 84
        s_cpm = round(random.uniform(1008.0, 1848.0), 2)
        s_impr = int((s_spend / s_cpm) * 1000)
        s_clicks = int(s_impr * random.uniform(0.03, 0.07))
        s_sessions = int(s_clicks * random.uniform(0.95, 1.05))
        
        if is_stocked_out:
            s_conv = 0
            s_rev = 0.0
            s_margin = 0.0
            inv = 0
        else:
            s_conv = max(1, int(s_clicks * random.uniform(0.035, 0.075)))
            s_rev = round(s_conv * price, 2)
            s_margin = round(s_conv * (margin_per_u - 180.0), 2) # Local Zone 2 net deduction (₹180 intra-zone)
            inv = max(0, info['base_stock'] - random.randint(0, 20))
            
        synth_rows.append({
            'date': d_str,
            'platform': 'shopify',
            'campaign': f'shopify-{sku}',
            'sku': sku,
            'spend': s_spend,
            'cpm': s_cpm,
            'impressions': s_impr,
            'conversions': s_conv,
            'revenue': s_rev,
            'margin': s_margin,
            'inventory': inv,
            'price': price,
            'ga_sessions': s_sessions
        })

df_synth = pd.DataFrame(synth_rows)
# Combine: keep converted Meta rows (1143) and deduplicate with new balanced rows
df_combined = pd.concat([df_meta, df_synth], ignore_index=True)
df_combined.to_csv('data/metrics.csv', index=False)
print(f'  ✓ data/metrics.csv expanded to {len(df_combined)} rows with balanced platform coverage:')
print(df_combined['platform'].value_counts().to_string())

# --- 3. EXPAND RAW API PAYLOADS ---
print('[3/4] Expanding raw API payload JSONs in data/payloads/...')
google_payload_rows = []
for idx, r in df_synth[df_synth['platform'] == 'google'].iterrows():
    google_payload_rows.append({
        'customer_id': '649-281-9920',
        'campaign': {
            'resource_name': f"customers/6492819920/campaigns/{r['campaign']}",
            'id': str(abs(hash(r['campaign'])) % 1000000000),
            'name': r['campaign'],
            'status': 'ENABLED',
            'advertisingChannelType': 'SEARCH',
            'biddingStrategyType': 'TARGET_ROAS',
            'targetRoas': 3.5
        },
        'campaign_budget': {
            'total_amount_micros': int(r['spend'] * 1_000_000 * 1.2),
            'recommendedBudgetAmountMicros': int(r['spend'] * 1_000_000 * 1.5)
        },
        'segments': {'date': r['date']},
        'ad_group_criterion': {
            'qualityInfo': {
                'qualityScore': random.randint(7, 10),
                'creativeQualityScore': 'ABOVE_AVERAGE',
                'postClickQualityScore': 'AVERAGE',
                'searchPredictedCtr': 'ABOVE_AVERAGE'
            }
        },
        'metrics': {
            'impressions': int(r['impressions']),
            'clicks': int(r['impressions'] * 0.04),
            'costMicros': int(r['spend'] * 1_000_000),
            'conversions': float(r['conversions']),
            'conversionsValue': float(r['revenue']),
            'averageCpc': round(r['spend'] / max(1, int(r['impressions'] * 0.04)), 2),
            'ctr': 0.04,
            'interactionRate': 0.042,
            'searchImpressionShare': 0.72,
            'searchBudgetLostImpressionShare': 0.18,
            'searchRankLostImpressionShare': 0.10,
            'searchTopImpressionShare': 0.85,
            'searchAbsoluteTopImpressionShare': 0.54,
            'crossDeviceConversions': float(r['conversions'] * 0.15)
        }
    })

with open('data/payloads/google_ads_rows.json', 'w') as f:
    json.dump(google_payload_rows, f, indent=2)
print(f'  ✓ data/payloads/google_ads_rows.json hydrated with {len(google_payload_rows)} records.')

amazon_payload_rows = []
for idx, r in df_synth[df_synth['platform'] == 'amazon'].iterrows():
    amazon_payload_rows.append({
        'campaignId': str(abs(hash(r['campaign'])) % 1000000000),
        'campaignName': r['campaign'],
        'adGroupId': f"adg-{r['sku']}",
        'adGroupName': f"SP - {r['sku']}",
        'adId': f"ad-{abs(hash(r['campaign'] + r['date'])) % 10000000}",
        'asin': f"B07Q8Z{abs(hash(r['sku'])) % 9000 + 1000}",
        'sku': r['sku'],
        'date': r['date'],
        'impressions': int(r['impressions']),
        'clicks': int(r['impressions'] * 0.03),
        'cost': float(r['spend']),
        'currency': 'INR',
        'placement': 'TOP_OF_SEARCH_PAGE',
        'placementBidMultiplier': 1.25,
        'matchType': 'EXACT',
        'targeting': f"[nike {r['sku']}]",
        'biddingStrategy': 'DYNAMIC_BIDS_UP_AND_DOWN',
        'attributedSales14d': float(r['revenue']),
        'attributedUnitsOrdered14d': int(r['conversions']),
        'attributedSalesSameSku14d': float(r['revenue'] * 0.82),
        'attributedSalesOtherSku14d': float(r['revenue'] * 0.18),
        'attributedUnitsOrderedSameSku14d': int(r['conversions'] * 0.82),
        'attributedUnitsOrderedOtherSku14d': int(r['conversions'] * 0.18),
        'attributedSales1d': float(r['revenue'] * 0.45),
        'attributedSales7d': float(r['revenue'] * 0.85),
        'attributedUnitsOrdered1d': int(r['conversions'] * 0.45),
        'attributedUnitsOrdered7d': int(r['conversions'] * 0.85),
        'buyBoxWinPercentage': 0.98 if r['inventory'] > 0 else 0.0,
        'fbaFeesEstimate': 240.0, # ₹240 Indian marketplace pick/pack fee
        'referralFeeRate': 0.15,
        'inboundPipelineUnits': 120,
        'daysOfSupplyFba': round(r['inventory'] / max(1, r['conversions'] + 1), 1)
    })

with open('data/payloads/amazon_sponsored_products.json', 'w') as f:
    json.dump(amazon_payload_rows, f, indent=2)
print(f'  ✓ data/payloads/amazon_sponsored_products.json hydrated with {len(amazon_payload_rows)} records in INR.')

# Also update web/src/data/raw-api-partials/ with representative samples
with open('web/src/data/raw-api-partials/google_ads_rows_partial.json', 'w') as f:
    json.dump(google_payload_rows[:5], f, indent=2)
with open('web/src/data/raw-api-partials/amazon_sponsored_products_partial.json', 'w') as f:
    json.dump(amazon_payload_rows[:5], f, indent=2)

# --- 4. HYDRATE DUCKDB LAKEHOUSE ---
print('[4/4] Hydrating DuckDB tables in INR (₹)...')
import shutil

temp_db = 'data/dqps_hydrated.duckdb'
if os.path.exists(temp_db):
    os.remove(temp_db)

# Copy existing db to preserve any existing event schemas
shutil.copyfile('data/dqps.duckdb', temp_db)
conn = duckdb.connect(temp_db)

# 4a. Refresh ad_spend_daily
conn.execute('DELETE FROM ad_spend_daily')
conn.execute('''
    INSERT INTO ad_spend_daily
    SELECT 
        date::DATE as date,
        platform as channel,
        campaign as campaign_id,
        min(campaign) as campaign_name,
        sku,
        sum(spend) as spend,
        sum(impressions)::BIGINT as impressions,
        sum((impressions * 0.035)::BIGINT) as clicks,
        CASE WHEN sum(impressions) > 0 THEN sum(spend) / (sum(impressions) * 0.035) ELSE 0 END as cpc,
        avg(cpm) as cpm,
        0.035 as ctr,
        sum(conversions) as platform_conversions,
        sum(revenue) as platform_revenue
    FROM df_combined
    GROUP BY date, platform, campaign, sku
''')
count_spend = conn.execute('SELECT count(*) FROM ad_spend_daily').fetchone()[0]
print(f'  ✓ ad_spend_daily populated: {count_spend} rows')

# 4b. Refresh inventory_levels
conn.execute('DELETE FROM inventory_levels')
conn.execute('''
    INSERT INTO inventory_levels
    SELECT 
        sku,
        'inv-item-' || sku as inventory_item_id,
        'FC-EAST-ALLENTOWN' as location_id,
        avg(inventory)::INTEGER as available,
        avg(price) * 0.35 as unit_cogs,
        max((date || ' 00:00:00+00')::TIMESTAMPTZ) as updated_at
    FROM df_combined
    WHERE date = '2026-10-07'
    GROUP BY sku
''')
count_inv = conn.execute('SELECT count(*) FROM inventory_levels').fetchone()[0]
print(f'  ✓ inventory_levels populated: {count_inv} rows')

# 4c. Refresh shopify_orders & shopify_order_lines
conn.execute('DELETE FROM shopify_orders')
conn.execute('DELETE FROM shopify_order_lines')

shopify_orders = []
shopify_lines = []
for idx, r in df_synth[df_synth['platform'] == 'shopify'].iterrows():
    if r['conversions'] > 0:
        oid = f"sh-ord-{idx:05d}"
        onum = 10000 + idx
        c_at = f"{r['date']} 14:20:00+00"
        subtotal = float(r['revenue'])
        tax = round(subtotal * 0.18, 2) # 18% GST in India
        total = round(subtotal + tax, 2)
        
        shopify_orders.append((oid, onum, c_at, total, subtotal, 0.0, tax, 'INR', 'PAID'))
        shopify_lines.append((
            f"line-{oid}", oid, f"gid://shopify/Variant/{r['sku']}", r['sku'], 
            f"Nike {r['sku']}", float(r['price']), int(r['conversions']), 0.0, subtotal
        ))

conn.executemany('''
    INSERT INTO shopify_orders 
    VALUES (?, ?, ?::TIMESTAMPTZ, ?, ?, ?, ?, ?, ?)
''', shopify_orders)

conn.executemany('''
    INSERT INTO shopify_order_lines 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
''', shopify_lines)

count_ord = conn.execute('SELECT count(*) FROM shopify_orders').fetchone()[0]
count_lines = conn.execute('SELECT count(*) FROM shopify_order_lines').fetchone()[0]
print(f'  ✓ shopify_orders ({count_ord} rows) and shopify_order_lines ({count_lines} rows) populated.')

# 4d. Populate unified_commerce_ledger
conn.execute('DELETE FROM unified_commerce_ledger')
conn.execute('''
    INSERT INTO unified_commerce_ledger
    SELECT
        (date || ' 12:00:00+00')::TIMESTAMPTZ as timestamp,
        platform as channel,
        campaign as campaign_id,
        min(campaign) as campaign_name,
        sku as sku_id,
        'Nike ' || sku as sku_name,
        'B07Q8Z' || right(sku, 4) as asin,
        'gid://shopify/ProductVariant/' || right(sku, 4) as variant_id,
        sum(spend) as spend,
        sum(impressions)::BIGINT as impressions,
        sum((impressions * 0.035)::BIGINT) as clicks,
        CASE WHEN sum(impressions) > 0 THEN sum(spend) / (sum(impressions) * 0.035) ELSE 0 END as cpc,
        avg(cpm) as cpm,
        0.035 as ctr,
        sum(conversions) as ad_conversions,
        sum(revenue) as attributed_revenue,
        CASE WHEN sum(spend) > 0 THEN sum(revenue) / sum(spend) ELSE 0 END as roas,
        sum(conversions)::INTEGER as units_sold,
        sum(revenue) as gross_revenue,
        sum(revenue) as net_revenue,
        avg(price) * 0.35 as unit_cogs,
        sum(conversions) * (avg(price) * 0.35) as total_cogs,
        sum(margin) as gross_margin,
        (sum(conversions) * 180.0) as variable_costs,
        (sum(margin) - (sum(conversions) * 180.0) - sum(spend)) as net_contribution_margin,
        CASE WHEN sum(spend) > 0 THEN (sum(margin) - sum(spend)) / sum(spend) ELSE 0 END as poas,
        CASE WHEN sum(spend) > 0 THEN sum(revenue) / sum(spend) ELSE 0 END as mer,
        avg(inventory)::INTEGER as inventory_on_hand,
        CASE WHEN avg(inventory) = 0 THEN 'STOCKOUT' WHEN avg(inventory) < 50 THEN 'LOW_STOCK' ELSE 'HEALTHY' END as inventory_status,
        CASE WHEN sum(conversions) > 0 THEN avg(inventory) / sum(conversions) ELSE 99.0 END as days_of_supply
    FROM df_combined
    GROUP BY date, platform, campaign, sku
''')
count_ledger = conn.execute('SELECT count(*) FROM unified_commerce_ledger').fetchone()[0]
print(f'  ✓ unified_commerce_ledger populated: {count_ledger} rows in INR.')

conn.close()

# Atomic replace
shutil.move(temp_db, 'data/dqps.duckdb')
print('  ✓ data/dqps.duckdb atomically updated.')
print('All 4 synthesization tasks executed successfully!')
