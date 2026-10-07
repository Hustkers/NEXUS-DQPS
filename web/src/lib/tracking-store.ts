import { createHash } from 'crypto';
import { query } from './db';
import fs from 'fs';
import path from 'path';

export interface TrackingEvent {
  event_id: string;
  visitor_id: string;
  session_id: string;
  customer_id?: string | null;
  event_type: 'page_view' | 'ad_click' | 'product_view' | 'add_to_cart' | 'begin_checkout' | 'purchase';
  timestamp: string;
  product_id?: string | null;
  value?: number | null;
  campaign_id?: string | null;
  platform?: string | null;
  click_id?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  page_url: string;
  order_id?: string | null;
  is_server_side?: boolean;
}

export interface VisitorRecord {
  visitor_id: string;
  first_seen_at: string;
  last_seen_at: string;
  first_touch_campaign?: string | null;
  last_touch_campaign?: string | null;
  first_touch_platform?: string | null;
  last_touch_platform?: string | null;
  consent_granted: boolean;
}

export interface SessionRecord {
  session_id: string;
  visitor_id: string;
  customer_id?: string | null;
  started_at: string;
  last_active_at: string;
  campaign_id?: string | null;
  platform?: string | null;
  click_id?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  landing_url: string;
  is_active: boolean;
}

export interface CustomerRecord {
  customer_id: string; // SHA-256 hash
  first_seen_at: string;
  last_seen_at: string;
  total_orders: number;
  total_revenue: number;
}

export interface IdentityLink {
  id?: number;
  visitor_id: string;
  customer_id: string;
  linked_at: string;
  method: 'login' | 'subscribe' | 'checkout';
}

export interface OrderRecord {
  order_id: string;
  customer_id?: string | null;
  visitor_id?: string | null;
  session_id?: string | null;
  product_id?: string | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

export interface CampaignPerformance {
  campaign_id: string;
  platform: string;
  clicks: number;
  product_views: number;
  add_to_carts: number;
  begin_checkouts: number;
  purchases: number;
  conversion_rate: number;
  revenue: number;
  profit: number;
  spend: number;
  roas: number;
  platform_reported_conversions: number;
  discrepancy: number;
  double_counting_flag: boolean;
}

export interface ProductAudience {
  product_id: string;
  product_name?: string;
  total_interested_visitors: number;
  segments: {
    browsers: { count: number; visitors: { visitor_id: string; customer_id?: string | null; score: number; last_active: string }[] };
    cart_abandoners: { count: number; visitors: { visitor_id: string; customer_id?: string | null; score: number; last_active: string }[] };
    buyers: { count: number; visitors: { visitor_id: string; customer_id?: string | null; score: number; last_active: string }[] };
    repeat_buyers: { count: number; visitors: { visitor_id: string; customer_id?: string | null; score: number; last_active: string }[] };
  };
  score_thresholds: {
    low: number;
    medium: number;
    high: number;
  };
}

// In-Memory store with file persistence fallback for environments without Postgres
class TrackingStore {
  private events: Map<string, TrackingEvent> = new Map();
  private visitors: Map<string, VisitorRecord> = new Map();
  private sessions: Map<string, SessionRecord> = new Map();
  private customers: Map<string, CustomerRecord> = new Map();
  private identityLinks: IdentityLink[] = [];
  private orders: Map<string, OrderRecord> = new Map();

  // Rate Limiting tracker: visitor_id / ip -> timestamp list
  private rateLimits: Map<string, number[]> = new Map();
  private readonly RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
  private readonly MAX_EVENTS_PER_WINDOW = 120; // 120 events/min

  private storageFile = path.join(process.cwd(), 'src', 'data', 'visitor-tracking-state.json');
  private initialized = false;

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const data = JSON.parse(fs.readFileSync(this.storageFile, 'utf8'));
        if (data.events) data.events.forEach((e: TrackingEvent) => this.events.set(e.event_id, e));
        if (data.visitors) data.visitors.forEach((v: VisitorRecord) => this.visitors.set(v.visitor_id, v));
        if (data.sessions) data.sessions.forEach((s: SessionRecord) => this.sessions.set(s.session_id, s));
        if (data.customers) data.customers.forEach((c: CustomerRecord) => this.customers.set(c.customer_id, c));
        if (data.identityLinks) this.identityLinks = data.identityLinks;
        if (data.orders) data.orders.forEach((o: OrderRecord) => this.orders.set(o.order_id, o));
      }
    } catch {
      // Ignore file load issues
    }
    this.initialized = true;
  }

  public saveState() {
    try {
      const dir = path.dirname(this.storageFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = {
        events: Array.from(this.events.values()),
        visitors: Array.from(this.visitors.values()),
        sessions: Array.from(this.sessions.values()),
        customers: Array.from(this.customers.values()),
        identityLinks: this.identityLinks,
        orders: Array.from(this.orders.values())
      };
      fs.writeFileSync(this.storageFile, JSON.stringify(data, null, 2), 'utf8');
    } catch {
      // Ignore file save issues
    }
  }

  public hashEmail(email: string): string {
    const normalized = email.trim().toLowerCase();
    return createHash('sha256').update(normalized).digest('hex');
  }

  // Rate Limiter
  public isRateLimited(key: string): boolean {
    const now = Date.now();
    const timestamps = this.rateLimits.get(key) || [];
    const valid = timestamps.filter((t) => now - t < this.RATE_LIMIT_WINDOW_MS);
    if (valid.length >= this.MAX_EVENTS_PER_WINDOW) {
      return true;
    }
    valid.push(now);
    this.rateLimits.set(key, valid);
    return false;
  }

  // Identity Stitching
  public linkIdentity(visitorId: string, emailOrHash: string, method: 'login' | 'subscribe' | 'checkout' = 'login'): string {
    const customerId = emailOrHash.length === 64 && /^[0-9a-f]{64}$/i.test(emailOrHash)
      ? emailOrHash.toLowerCase()
      : this.hashEmail(emailOrHash);

    const now = new Date().toISOString();

    // Customer record
    let customer = this.customers.get(customerId);
    if (!customer) {
      customer = {
        customer_id: customerId,
        first_seen_at: now,
        last_seen_at: now,
        total_orders: 0,
        total_revenue: 0
      };
      this.customers.set(customerId, customer);
    } else {
      customer.last_seen_at = now;
    }

    // Record identity link
    const existingLink = this.identityLinks.find((l) => l.visitor_id === visitorId && l.customer_id === customerId);
    if (!existingLink) {
      this.identityLinks.push({
        visitor_id: visitorId,
        customer_id: customerId,
        linked_at: now,
        method
      });
    }

    // Stitch prior events and sessions
    for (const event of this.events.values()) {
      if (event.visitor_id === visitorId && !event.customer_id) {
        event.customer_id = customerId;
      }
    }
    for (const session of this.sessions.values()) {
      if (session.visitor_id === visitorId && !session.customer_id) {
        session.customer_id = customerId;
      }
    }

    this.saveState();

    // Async sync to Postgres if available
    query(
      `INSERT INTO customers (customer_id, first_seen_at, last_seen_at)
       VALUES ($1, $2, $2)
       ON CONFLICT (customer_id) DO UPDATE SET last_seen_at = $2`,
      [customerId, now]
    ).catch(() => {});

    query(
      `INSERT INTO identity_links (visitor_id, customer_id, method, linked_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (visitor_id, customer_id) DO NOTHING`,
      [visitorId, customerId, method, now]
    ).catch(() => {});

    query(
      `UPDATE events SET customer_id = $1 WHERE visitor_id = $2 AND customer_id IS NULL`,
      [customerId, visitorId]
    ).catch(() => {});

    return customerId;
  }

  // Get all linked visitor_ids for a customer
  public getVisitorIdsForCustomer(customerId: string): string[] {
    const list = new Set<string>();
    for (const link of this.identityLinks) {
      if (link.customer_id === customerId) list.add(link.visitor_id);
    }
    for (const event of this.events.values()) {
      if (event.customer_id === customerId) list.add(event.visitor_id);
    }
    return Array.from(list);
  }

  // Event Recording (Idempotent)
  public async recordEvent(event: TrackingEvent): Promise<{ status: 'created' | 'duplicate'; event: TrackingEvent }> {
    // Deduplication check
    if (this.events.has(event.event_id)) {
      return { status: 'duplicate', event: this.events.get(event.event_id)! };
    }

    const now = event.timestamp || new Date().toISOString();

    // Handle Visitor
    let visitor = this.visitors.get(event.visitor_id);
    if (!visitor) {
      visitor = {
        visitor_id: event.visitor_id,
        first_seen_at: now,
        last_seen_at: now,
        first_touch_campaign: event.campaign_id || null,
        last_touch_campaign: event.campaign_id || null,
        first_touch_platform: event.platform || null,
        last_touch_platform: event.platform || null,
        consent_granted: true
      };
      this.visitors.set(event.visitor_id, visitor);
    } else {
      visitor.last_seen_at = now;
      if (event.campaign_id) {
        visitor.last_touch_campaign = event.campaign_id;
        visitor.last_touch_platform = event.platform || visitor.last_touch_platform;
      }
    }

    // Handle Session
    let session = this.sessions.get(event.session_id);
    if (!session) {
      session = {
        session_id: event.session_id,
        visitor_id: event.visitor_id,
        customer_id: event.customer_id || null,
        started_at: now,
        last_active_at: now,
        campaign_id: event.campaign_id || null,
        platform: event.platform || null,
        click_id: event.click_id || null,
        utm_source: event.utm_source || null,
        utm_medium: event.utm_medium || null,
        utm_campaign: event.utm_campaign || null,
        utm_content: event.utm_content || null,
        landing_url: event.page_url,
        is_active: true
      };
      this.sessions.set(event.session_id, session);
    } else {
      session.last_active_at = now;
      if (event.customer_id && !session.customer_id) {
        session.customer_id = event.customer_id;
      }
    }

    // If event has customer_id, stitch it
    if (event.customer_id) {
      this.linkIdentity(event.visitor_id, event.customer_id, event.event_type === 'purchase' ? 'checkout' : 'login');
    }

    // Handle Order if purchase event
    if (event.event_type === 'purchase' && event.order_id) {
      const orderAmount = Number(event.value || 0);
      let order = this.orders.get(event.order_id);
      if (!order) {
        order = {
          order_id: event.order_id,
          customer_id: event.customer_id || null,
          visitor_id: event.visitor_id,
          session_id: event.session_id,
          product_id: event.product_id || null,
          amount: orderAmount,
          currency: 'USD',
          status: 'completed',
          created_at: now
        };
        this.orders.set(event.order_id, order);

        // Update customer total
        if (event.customer_id) {
          const cust = this.customers.get(event.customer_id);
          if (cust) {
            cust.total_orders += 1;
            cust.total_revenue += orderAmount;
          }
        }
      }
    }

    this.events.set(event.event_id, event);
    this.saveState();

    // Fire and forget PostgreSQL sync
    query(
      `INSERT INTO visitors (visitor_id, first_seen_at, last_seen_at, first_touch_campaign, last_touch_campaign, first_touch_platform, last_touch_platform)
       VALUES ($1, $2, $2, $3, $3, $4, $4)
       ON CONFLICT (visitor_id) DO UPDATE SET last_seen_at = $2, last_touch_campaign = COALESCE($3, visitors.last_touch_campaign), last_touch_platform = COALESCE($4, visitors.last_touch_platform)`,
      [event.visitor_id, now, event.campaign_id || null, event.platform || null]
    ).catch(() => {});

    query(
      `INSERT INTO sessions (session_id, visitor_id, customer_id, started_at, last_active_at, campaign_id, platform, click_id, utm_source, utm_medium, utm_campaign, utm_content, landing_url)
       VALUES ($1, $2, $3, $4, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (session_id) DO UPDATE SET last_active_at = $4, customer_id = COALESCE($3, sessions.customer_id)`,
      [
        event.session_id,
        event.visitor_id,
        event.customer_id || null,
        now,
        event.campaign_id || null,
        event.platform || null,
        event.click_id || null,
        event.utm_source || null,
        event.utm_medium || null,
        event.utm_campaign || null,
        event.utm_content || null,
        event.page_url
      ]
    ).catch(() => {});

    query(
      `INSERT INTO events (event_id, visitor_id, session_id, customer_id, event_type, timestamp, product_id, value, campaign_id, platform, click_id, utm_source, utm_medium, utm_campaign, utm_content, page_url, order_id, is_server_side)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       ON CONFLICT (event_id) DO NOTHING`,
      [
        event.event_id,
        event.visitor_id,
        event.session_id,
        event.customer_id || null,
        event.event_type,
        now,
        event.product_id || null,
        event.value || null,
        event.campaign_id || null,
        event.platform || null,
        event.click_id || null,
        event.utm_source || null,
        event.utm_medium || null,
        event.utm_campaign || null,
        event.utm_content || null,
        event.page_url,
        event.order_id || null,
        Boolean(event.is_server_side)
      ]
    ).catch(() => {});

    return { status: 'created', event };
  }

  // Server-side Purchase recording (bypasses ad blockers)
  public async recordServerPurchase(params: {
    order_id: string;
    visitor_id: string;
    session_id: string;
    customer_email?: string;
    product_id: string;
    amount: number;
    campaign_id?: string;
    platform?: string;
  }): Promise<TrackingEvent> {
    const customer_id = params.customer_email ? this.hashEmail(params.customer_email) : null;
    const event: TrackingEvent = {
      event_id: `srv-${params.order_id}-${Date.now()}`,
      visitor_id: params.visitor_id,
      session_id: params.session_id,
      customer_id,
      event_type: 'purchase',
      timestamp: new Date().toISOString(),
      product_id: params.product_id,
      value: params.amount,
      campaign_id: params.campaign_id || null,
      platform: params.platform || null,
      page_url: 'https://checkout.niked2c.com/order-success',
      order_id: params.order_id,
      is_server_side: true
    };
    await this.recordEvent(event);
    return event;
  }

  // Step 5: Attribution Engine
  public getCampaignPerformance(model: 'last_touch' | 'first_touch' = 'last_touch'): CampaignPerformance[] {
    const campaignStats: Map<string, {
      platform: string;
      clicks: number;
      product_views: number;
      add_to_carts: number;
      begin_checkouts: number;
      purchases: number;
      revenue: number;
      spend: number;
      platform_reported_conversions: number;
    }> = new Map();

    const allEvents = Array.from(this.events.values()).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Default known campaign catalogs
    const knownCampaigns = [
      { id: 'meta-315122-001', platform: 'meta', spend: 2200, platformReported: 35 },
      { id: 'google-CD4371-001', platform: 'google', spend: 1850, platformReported: 28 },
      { id: 'tiktok-AH8050-100', platform: 'tiktok', spend: 1400, platformReported: 19 },
      { id: 'meta-airmax-viral', platform: 'meta', spend: 2800, platformReported: 42 },
      { id: 'google-react-intent', platform: 'google', spend: 1900, platformReported: 24 },
      { id: 'tiktok-jordan-trend', platform: 'tiktok', spend: 1650, platformReported: 16 },
      { id: 'organic-direct', platform: 'direct', spend: 0, platformReported: 0 }
    ];

    for (const c of knownCampaigns) {
      campaignStats.set(c.id, {
        platform: c.platform,
        clicks: 0,
        product_views: 0,
        add_to_carts: 0,
        begin_checkouts: 0,
        purchases: 0,
        revenue: 0,
        spend: c.spend,
        platform_reported_conversions: c.platformReported
      });
    }

    // Step A: Aggregate touchpoints per visitor and merged customer
    const visitorTouchpoints: Map<string, { campaign_id: string; platform: string; timestamp: number }[]> = new Map();

    for (const e of allEvents) {
      if (e.campaign_id) {
        let stats = campaignStats.get(e.campaign_id);
        if (!stats) {
          stats = {
            platform: e.platform || 'unknown',
            clicks: 0,
            product_views: 0,
            add_to_carts: 0,
            begin_checkouts: 0,
            purchases: 0,
            revenue: 0,
            spend: 500,
            platform_reported_conversions: 0
          };
          campaignStats.set(e.campaign_id, stats);
        }

        if (e.event_type === 'ad_click') stats.clicks += 1;
        if (e.event_type === 'product_view') stats.product_views += 1;
        if (e.event_type === 'add_to_cart') stats.add_to_carts += 1;
        if (e.event_type === 'begin_checkout') stats.begin_checkouts += 1;

        // Collect touchpoint for attribution
        const touchKey = e.customer_id ? `cust_${e.customer_id}` : `vis_${e.visitor_id}`;
        const touches = visitorTouchpoints.get(touchKey) || [];
        touches.push({
          campaign_id: e.campaign_id,
          platform: e.platform || 'unknown',
          timestamp: new Date(e.timestamp).getTime()
        });
        visitorTouchpoints.set(touchKey, touches);
      }
    }

    // Step B: Attribute Purchases
    const purchases = allEvents.filter((e) => e.event_type === 'purchase');
    for (const p of purchases) {
      const pTime = new Date(p.timestamp).getTime();
      const pVal = Number(p.value || 0);

      // Check customer-level touchpoints first, fallback to visitor-level
      const touchKeyCust = p.customer_id ? `cust_${p.customer_id}` : null;
      const touchKeyVis = `vis_${p.visitor_id}`;

      let touches: { campaign_id: string; platform: string; timestamp: number }[] = [];
      if (touchKeyCust && visitorTouchpoints.has(touchKeyCust)) {
        touches = visitorTouchpoints.get(touchKeyCust)!;
      } else if (visitorTouchpoints.has(touchKeyVis)) {
        touches = visitorTouchpoints.get(touchKeyVis)!;
      }

      // Filter touchpoints that occurred BEFORE or AT the purchase time
      const priorTouches = touches.filter((t) => t.timestamp <= pTime);

      let attributedCampaign = p.campaign_id;
      if (priorTouches.length > 0) {
        if (model === 'last_touch') {
          attributedCampaign = priorTouches[priorTouches.length - 1].campaign_id;
        } else {
          // first_touch
          attributedCampaign = priorTouches[0].campaign_id;
        }
      }

      if (!attributedCampaign) {
        attributedCampaign = 'organic-direct';
      }

      let stat = campaignStats.get(attributedCampaign);
      if (!stat) {
        stat = {
          platform: p.platform || 'direct',
          clicks: 0,
          product_views: 0,
          add_to_carts: 0,
          begin_checkouts: 0,
          purchases: 0,
          revenue: 0,
          spend: 0,
          platform_reported_conversions: 0
        };
        campaignStats.set(attributedCampaign, stat);
      }

      stat.purchases += 1;
      stat.revenue += pVal;
    }

    // Build final performance list
    const results: CampaignPerformance[] = [];
    for (const [cid, s] of campaignStats.entries()) {
      const cvr = s.clicks > 0 ? s.purchases / s.clicks : 0;
      // 55% average gross margin for footwear
      const grossMarginPct = 0.55;
      const profit = s.revenue * grossMarginPct - s.spend;
      const roas = s.spend > 0 ? s.revenue / s.spend : 0;
      const discrepancy = s.platform_reported_conversions - s.purchases;
      const double_counting_flag = s.platform_reported_conversions > s.purchases * 1.25 && s.platform_reported_conversions > 5;

      results.push({
        campaign_id: cid,
        platform: s.platform,
        clicks: s.clicks,
        product_views: s.product_views,
        add_to_carts: s.add_to_carts,
        begin_checkouts: s.begin_checkouts,
        purchases: s.purchases,
        conversion_rate: Math.round(cvr * 10000) / 10000,
        revenue: Math.round(s.revenue * 100) / 100,
        profit: Math.round(profit * 100) / 100,
        spend: Math.round(s.spend * 100) / 100,
        roas: Math.round(roas * 100) / 100,
        platform_reported_conversions: s.platform_reported_conversions,
        discrepancy,
        double_counting_flag
      });
    }

    return results.sort((a, b) => b.profit - a.profit);
  }

  // Step 6: Interest Score and Audience Segments
  public getProductAudience(productId: string): ProductAudience {
    const allEvents = Array.from(this.events.values()).filter(
      (e) => e.product_id === productId || !e.product_id
    );

    // Event weights
    const weights: Record<string, number> = {
      page_view: 0.5,
      product_view: 1.0,
      add_to_cart: 3.0,
      begin_checkout: 5.0,
      purchase: 10.0
    };

    const halfLifeDays = 7.0;
    const lambda = Math.LN2 / halfLifeDays; // Exponential decay parameter
    const now = Date.now();

    // Group events per visitor (or unified customer)
    const visitorAgg: Map<string, {
      visitor_id: string;
      customer_id?: string | null;
      score: number;
      views: number;
      carts: number;
      checkouts: number;
      purchases: number;
      last_active: string;
    }> = new Map();

    for (const e of allEvents) {
      if (e.product_id && e.product_id !== productId) continue;

      const key = e.visitor_id;
      let agg = visitorAgg.get(key);
      if (!agg) {
        agg = {
          visitor_id: e.visitor_id,
          customer_id: e.customer_id || null,
          score: 0,
          views: 0,
          carts: 0,
          checkouts: 0,
          purchases: 0,
          last_active: e.timestamp
        };
        visitorAgg.set(key, agg);
      }

      if (e.customer_id && !agg.customer_id) {
        agg.customer_id = e.customer_id;
      }

      const eTime = new Date(e.timestamp).getTime();
      const ageDays = Math.max(0, (now - eTime) / (1000 * 60 * 60 * 24));
      const decay = Math.exp(-lambda * ageDays);
      const w = weights[e.event_type] || 0.5;

      agg.score += w * decay;

      if (e.event_type === 'product_view') agg.views += 1;
      if (e.event_type === 'add_to_cart') agg.carts += 1;
      if (e.event_type === 'begin_checkout') agg.checkouts += 1;
      if (e.event_type === 'purchase') agg.purchases += 1;

      if (new Date(e.timestamp).getTime() > new Date(agg.last_active).getTime()) {
        agg.last_active = e.timestamp;
      }
    }

    const browsers: any[] = [];
    const cart_abandoners: any[] = [];
    const buyers: any[] = [];
    const repeat_buyers: any[] = [];
    const allScores: number[] = [];

    for (const agg of visitorAgg.values()) {
      agg.score = Math.round(agg.score * 100) / 100;
      allScores.push(agg.score);

      const item = {
        visitor_id: agg.visitor_id,
        customer_id: agg.customer_id,
        score: agg.score,
        last_active: agg.last_active
      };

      if (agg.purchases >= 2) {
        repeat_buyers.push(item);
      } else if (agg.purchases === 1) {
        buyers.push(item);
      } else if (agg.carts > 0 || agg.checkouts > 0) {
        cart_abandoners.push(item);
      } else if (agg.views > 0) {
        browsers.push(item);
      }
    }

    // Determine thresholds dynamically from distribution percentiles
    allScores.sort((a, b) => a - b);
    const p25 = allScores.length > 0 ? allScores[Math.floor(allScores.length * 0.25)] : 1.0;
    const p50 = allScores.length > 0 ? allScores[Math.floor(allScores.length * 0.50)] : 3.0;
    const p75 = allScores.length > 0 ? allScores[Math.floor(allScores.length * 0.75)] : 8.0;

    return {
      product_id: productId,
      total_interested_visitors: visitorAgg.size,
      segments: {
        browsers: { count: browsers.length, visitors: browsers.sort((a, b) => b.score - a.score).slice(0, 50) },
        cart_abandoners: { count: cart_abandoners.length, visitors: cart_abandoners.sort((a, b) => b.score - a.score).slice(0, 50) },
        buyers: { count: buyers.length, visitors: buyers.sort((a, b) => b.score - a.score).slice(0, 50) },
        repeat_buyers: { count: repeat_buyers.length, visitors: repeat_buyers.sort((a, b) => b.score - a.score).slice(0, 50) }
      },
      score_thresholds: {
        low: p25 || 1.0,
        medium: p50 || 3.0,
        high: p75 || 8.0
      }
    };
  }

  // Step 6: Visitor Timeline
  public getVisitorTimeline(visitorIdOrCustomerId: string) {
    let linkedVisitorIds = [visitorIdOrCustomerId];
    let customerId: string | null = null;

    if (visitorIdOrCustomerId.startsWith('cust_') || visitorIdOrCustomerId.length === 64) {
      customerId = visitorIdOrCustomerId.replace(/^cust_/, '');
      linkedVisitorIds = this.getVisitorIdsForCustomer(customerId);
    } else {
      // Find if this visitor is linked to a customer
      const link = this.identityLinks.find((l) => l.visitor_id === visitorIdOrCustomerId);
      if (link) {
        customerId = link.customer_id;
        linkedVisitorIds = this.getVisitorIdsForCustomer(customerId);
      }
    }

    const visitorSet = new Set(linkedVisitorIds);
    const events = Array.from(this.events.values()).filter(
      (e) => visitorSet.has(e.visitor_id) || (customerId && e.customer_id === customerId)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const sessions = Array.from(this.sessions.values()).filter(
      (s) => visitorSet.has(s.visitor_id) || (customerId && s.customer_id === customerId)
    );

    const orders = Array.from(this.orders.values()).filter(
      (o) => (o.visitor_id && visitorSet.has(o.visitor_id)) || (customerId && o.customer_id === customerId)
    );

    return {
      visitor_id: visitorIdOrCustomerId,
      customer_id: customerId,
      is_stitched: Boolean(customerId && linkedVisitorIds.length > 0),
      linked_visitor_ids: linkedVisitorIds,
      total_events: events.length,
      total_sessions: sessions.length,
      total_orders: orders.length,
      total_spend: orders.reduce((sum, o) => sum + Number(o.amount), 0),
      events,
      sessions,
      orders
    };
  }

  // Step 9: Data Retention (purge older than N days)
  public purgeOlderThanDays(days: number): { purged_events: number } {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    let purged = 0;
    for (const [id, e] of this.events.entries()) {
      if (new Date(e.timestamp).getTime() < cutoff) {
        this.events.delete(id);
        purged++;
      }
    }
    this.saveState();

    query(`DELETE FROM events WHERE timestamp < NOW() - INTERVAL '${days} days'`).catch(() => {});
    return { purged_events: purged };
  }

  // Step 9: Right to be Forgotten (Delete all data for visitor or customer)
  public deleteVisitorData(id: string): { deleted: boolean; records_cleared: number } {
    let cleared = 0;
    const customerId = id.startsWith('cust_') ? id.replace(/^cust_/, '') : (id.length === 64 ? id : null);
    const visitorIdsToDelete = new Set<string>();

    if (customerId) {
      this.getVisitorIdsForCustomer(customerId).forEach((v) => visitorIdsToDelete.add(v));
      this.customers.delete(customerId);
    } else {
      visitorIdsToDelete.add(id);
      const link = this.identityLinks.find((l) => l.visitor_id === id);
      if (link) {
        visitorIdsToDelete.add(link.visitor_id);
      }
    }

    // Erase events
    for (const [eid, e] of Array.from(this.events.entries())) {
      if (visitorIdsToDelete.has(e.visitor_id) || (customerId && e.customer_id === customerId)) {
        this.events.delete(eid);
        cleared++;
      }
    }

    // Erase sessions
    for (const [sid, s] of Array.from(this.sessions.entries())) {
      if (visitorIdsToDelete.has(s.visitor_id) || (customerId && s.customer_id === customerId)) {
        this.sessions.delete(sid);
        cleared++;
      }
    }

    // Erase visitors
    for (const vid of visitorIdsToDelete) {
      if (this.visitors.has(vid)) {
        this.visitors.delete(vid);
        cleared++;
      }
    }

    // Erase identity links
    this.identityLinks = this.identityLinks.filter(
      (l) => !visitorIdsToDelete.has(l.visitor_id) && l.customer_id !== customerId
    );

    this.saveState();

    // Sync deletion to Postgres
    if (customerId) {
      query(`DELETE FROM customers WHERE customer_id = $1`, [customerId]).catch(() => {});
    }
    for (const vid of visitorIdsToDelete) {
      query(`DELETE FROM visitors WHERE visitor_id = $1`, [vid]).catch(() => {});
    }

    return { deleted: true, records_cleared: cleared };
  }

  public getRawStoreState() {
    return {
      visitorsCount: this.visitors.size,
      sessionsCount: this.sessions.size,
      eventsCount: this.events.size,
      customersCount: this.customers.size,
      ordersCount: this.orders.size,
      identityLinksCount: this.identityLinks.length
    };
  }

  public clearAll() {
    this.events.clear();
    this.visitors.clear();
    this.sessions.clear();
    this.customers.clear();
    this.orders.clear();
    this.identityLinks = [];
    this.saveState();
  }
}

// Global Singleton instance
const globalStore = (global as any).__nexusTrackingStore || new TrackingStore();
if (process.env.NODE_ENV !== 'production') {
  (global as any).__nexusTrackingStore = globalStore;
}

export const trackingStore = globalStore as TrackingStore;
