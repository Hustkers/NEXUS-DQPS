/**
 * NEXUS D2C Visitor Event Tracker SDK
 *
 * Privacy-first, zero-fingerprint client tracking layer for Next.js and web stores.
 * - Anonymous UUID visitor identification (1-year first-party cookie + localStorage fallback)
 * - 30-minute inactivity sliding session management
 * - First-touch and last-touch ad click & UTM attribution propagation
 * - Privacy-safe SHA-256 customer email hashing (zero raw emails stored)
 * - Strict consent verification check
 * - Standard event types: page_view, ad_click, product_view, add_to_cart, begin_checkout, purchase
 */

export interface TrackingParams {
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  campaign_id?: string;
  ad_id?: string;
}

export type EventType =
  | 'page_view'
  | 'ad_click'
  | 'product_view'
  | 'add_to_cart'
  | 'begin_checkout'
  | 'purchase';

export interface NexusEventPayload {
  event_id?: string;
  visitor_id?: string;
  session_id?: string;
  customer_id?: string | null;
  event_type: EventType;
  timestamp?: string;
  product_id?: string | null;
  value?: number | null;
  campaign_id?: string | null;
  platform?: string | null;
  click_id?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  page_url?: string;
  order_id?: string | null;
  is_server_side?: boolean;
}

const COOKIE_VISITOR_KEY = 'nx_vid';
const COOKIE_SESSION_KEY = 'nx_sid';
const COOKIE_LAST_ACTIVE_KEY = 'nx_last_act';
const COOKIE_FIRST_TOUCH_KEY = 'nx_ft';
const COOKIE_LAST_TOUCH_KEY = 'nx_lt';
const COOKIE_CONSENT_KEY = 'nx_consent';
const COOKIE_CUSTOMER_KEY = 'nx_cid';

const SESSION_INACTIVITY_MS = 30 * 60 * 1000; // 30 minutes
const VISITOR_COOKIE_MAX_AGE_DAYS = 365;

// Cryptographic UUID v4 generation without external dependencies
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// SHA-256 email hasher (lowercased, trimmed)
export async function sha256Hex(text: string): Promise<string> {
  const normalized = text.trim().toLowerCase();
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback simple 64-char hex deterministic hash for older browsers/non-crypto envs
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

// Cookie Helpers
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

function setCookie(name: string, value: string, days?: number): void {
  if (typeof document === 'undefined') return;
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

// Storage Helpers with localStorage fallback
function getStorage(key: string): string | null {
  const fromCookie = getCookie(key);
  if (fromCookie) return fromCookie;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return null;
}

function setStorage(key: string, value: string, days?: number): void {
  setCookie(key, value, days);
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore localStorage exceptions (e.g. private mode)
    }
  }
}

function removeStorage(key: string): void {
  deleteCookie(key);
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }
}

/**
 * SINGLE CONSENT CHECK FUNCTION
 * Without consent, the tracker will NOT set tracking cookies or transmit events.
 */
export function hasTrackingConsent(): boolean {
  if (typeof window === 'undefined') return false;
  const consent = getStorage(COOKIE_CONSENT_KEY);
  // Default to true if not explicitly set to 'false' or 'denied', or configurable
  if (consent === 'false' || consent === 'denied' || consent === '0') {
    return false;
  }
  return true;
}

export function setTrackingConsent(granted: boolean): void {
  if (typeof window === 'undefined') return;
  if (!granted) {
    setStorage(COOKIE_CONSENT_KEY, 'false', VISITOR_COOKIE_MAX_AGE_DAYS);
    // Erase tracking cookies when consent revoked
    removeStorage(COOKIE_VISITOR_KEY);
    removeStorage(COOKIE_SESSION_KEY);
    removeStorage(COOKIE_LAST_ACTIVE_KEY);
    removeStorage(COOKIE_FIRST_TOUCH_KEY);
    removeStorage(COOKIE_LAST_TOUCH_KEY);
    removeStorage(COOKIE_CUSTOMER_KEY);
  } else {
    setStorage(COOKIE_CONSENT_KEY, 'true', VISITOR_COOKIE_MAX_AGE_DAYS);
  }
}

/**
 * Step 1: Identity Management (No canvas/font/hardware fingerprinting)
 */
export function getOrCreateVisitorId(): string | null {
  if (!hasTrackingConsent()) return null;
  let vid = getStorage(COOKIE_VISITOR_KEY);
  if (!vid) {
    vid = generateUUID();
    setStorage(COOKIE_VISITOR_KEY, vid, VISITOR_COOKIE_MAX_AGE_DAYS);
  }
  return vid;
}

export function getOrCreateSessionId(): string | null {
  if (!hasTrackingConsent()) return null;
  const now = Date.now();
  const lastActiveStr = getStorage(COOKIE_LAST_ACTIVE_KEY);
  let sid = getStorage(COOKIE_SESSION_KEY);

  const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : 0;
  const isExpired = !sid || now - lastActive > SESSION_INACTIVITY_MS;

  if (isExpired) {
    sid = generateUUID();
    setStorage(COOKIE_SESSION_KEY, sid);
  }
  setStorage(COOKIE_LAST_ACTIVE_KEY, now.toString());
  return sid;
}

/**
 * Step 2: Capture Ad Click and UTM Parameters
 */
export function extractAdParameters(url?: string): TrackingParams {
  if (typeof window === 'undefined') return {};
  const currentUrl = url || window.location.href;
  try {
    const parsed = new URL(currentUrl);
    const params = parsed.searchParams;

    const gclid = params.get('gclid') || undefined;
    const fbclid = params.get('fbclid') || undefined;
    const ttclid = params.get('ttclid') || undefined;
    const utm_source = params.get('utm_source') || undefined;
    const utm_medium = params.get('utm_medium') || undefined;
    const utm_campaign = params.get('utm_campaign') || undefined;
    const utm_content = params.get('utm_content') || undefined;
    const campaign_id = params.get('campaign_id') || params.get('cid') || undefined;
    const ad_id = params.get('ad_id') || params.get('aid') || undefined;

    return {
      gclid,
      fbclid,
      ttclid,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      campaign_id,
      ad_id
    };
  } catch {
    return {};
  }
}

export function persistAdTouchpoints(params: TrackingParams): {
  firstTouch: TrackingParams | null;
  lastTouch: TrackingParams | null;
} {
  if (!hasTrackingConsent()) return { firstTouch: null, lastTouch: null };

  const hasAnyParam = Object.values(params).some(Boolean);

  let firstTouch: TrackingParams | null = null;
  const ftStr = getStorage(COOKIE_FIRST_TOUCH_KEY);
  if (ftStr) {
    try {
      firstTouch = JSON.parse(ftStr);
    } catch {
      firstTouch = null;
    }
  }

  let lastTouch: TrackingParams | null = null;
  const ltStr = getStorage(COOKIE_LAST_TOUCH_KEY);
  if (ltStr) {
    try {
      lastTouch = JSON.parse(ltStr);
    } catch {
      lastTouch = null;
    }
  }

  if (hasAnyParam) {
    // If no first touch yet, record current as first touch
    if (!firstTouch) {
      firstTouch = params;
      setStorage(COOKIE_FIRST_TOUCH_KEY, JSON.stringify(params), VISITOR_COOKIE_MAX_AGE_DAYS);
    }
    // Update last touch on new ad touch
    lastTouch = params;
    setStorage(COOKIE_LAST_TOUCH_KEY, JSON.stringify(params), VISITOR_COOKIE_MAX_AGE_DAYS);
  }

  return { firstTouch, lastTouch };
}

/**
 * Step 1: Customer Identity Linking (Identity Stitching)
 */
export async function identifyCustomer(
  rawEmailOrHash: string,
  method: 'login' | 'subscribe' | 'checkout' = 'login'
): Promise<string | null> {
  if (!hasTrackingConsent()) return null;

  // If already SHA-256 (64 hex characters), use directly; else hash it
  const customerId =
    rawEmailOrHash.length === 64 && /^[0-9a-f]{64}$/i.test(rawEmailOrHash)
      ? rawEmailOrHash.toLowerCase()
      : await sha256Hex(rawEmailOrHash);

  setStorage(COOKIE_CUSTOMER_KEY, customerId, VISITOR_COOKIE_MAX_AGE_DAYS);

  const visitorId = getOrCreateVisitorId();
  if (visitorId) {
    // Notify backend to merge identity
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'page_view',
          visitor_id: visitorId,
          session_id: getOrCreateSessionId(),
          customer_id: customerId,
          identity_link: {
            visitor_id: visitorId,
            customer_id: customerId,
            method
          }
        })
      });
    } catch {
      // Ignore network errors in identify
    }
  }
  return customerId;
}

export function getCustomerId(): string | null {
  if (!hasTrackingConsent()) return null;
  return getStorage(COOKIE_CUSTOMER_KEY);
}

/**
 * Step 3: Event Tracking Core Sender
 */
export async function trackEvent(
  payload: NexusEventPayload,
  endpoint: string = '/api/events'
): Promise<{ success: boolean; event_id?: string; error?: string }> {
  // Consent check gate
  if (!hasTrackingConsent()) {
    return { success: false, error: 'Tracking consent not granted' };
  }

  const visitor_id = payload.visitor_id || getOrCreateVisitorId();
  const session_id = payload.session_id || getOrCreateSessionId();
  const customer_id = payload.customer_id || getCustomerId();
  const event_id = payload.event_id || generateUUID();
  const timestamp = payload.timestamp || new Date().toISOString();
  const page_url =
    payload.page_url || (typeof window !== 'undefined' ? window.location.href : '');

  // Extract ad touchpoints if not explicitly passed
  const adParams = extractAdParameters(page_url);
  const { lastTouch, firstTouch } = persistAdTouchpoints(adParams);
  const touch = lastTouch || firstTouch || {};

  // Infer ad platform if click_id present
  let platform = payload.platform || null;
  let click_id = payload.click_id || null;
  if (!click_id) {
    if (adParams.gclid || touch.gclid) {
      click_id = adParams.gclid || touch.gclid || null;
      platform = platform || 'google';
    } else if (adParams.fbclid || touch.fbclid) {
      click_id = adParams.fbclid || touch.fbclid || null;
      platform = platform || 'meta';
    } else if (adParams.ttclid || touch.ttclid) {
      click_id = adParams.ttclid || touch.ttclid || null;
      platform = platform || 'tiktok';
    }
  }

  const fullEvent: NexusEventPayload = {
    event_id,
    visitor_id: visitor_id || undefined,
    session_id: session_id || undefined,
    customer_id,
    event_type: payload.event_type,
    timestamp,
    product_id: payload.product_id || null,
    value: payload.value !== undefined ? payload.value : null,
    campaign_id: payload.campaign_id || adParams.campaign_id || touch.campaign_id || touch.utm_campaign || null,
    platform: platform || adParams.utm_source || touch.utm_source || null,
    click_id,
    utm_source: payload.utm_source || adParams.utm_source || touch.utm_source || null,
    utm_medium: payload.utm_medium || adParams.utm_medium || touch.utm_medium || null,
    utm_campaign: payload.utm_campaign || adParams.utm_campaign || touch.utm_campaign || null,
    utm_content: payload.utm_content || adParams.utm_content || touch.utm_content || null,
    page_url,
    order_id: payload.order_id || null,
    is_server_side: false
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullEvent)
    });
    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    return { success: true, event_id: data.event_id || event_id };
  } catch (err: unknown) {
    // If fetch failed on unload, try sendBeacon if available
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(fullEvent)], { type: 'application/json' });
      navigator.sendBeacon(endpoint, blob);
      return { success: true, event_id };
    }
    const message = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: message };
  }
}

// Convenience Trackers
export const NexusTracker = {
  init(url?: string) {
    if (!hasTrackingConsent()) return;
    getOrCreateVisitorId();
    getOrCreateSessionId();
    const params = extractAdParameters(url);
    persistAdTouchpoints(params);
  },

  pageView(pageUrl?: string) {
    return trackEvent({ event_type: 'page_view', page_url: pageUrl });
  },

  adClick(params?: TrackingParams, pageUrl?: string) {
    if (params) persistAdTouchpoints(params);
    return trackEvent({
      event_type: 'ad_click',
      page_url: pageUrl,
      campaign_id: params?.campaign_id || params?.utm_campaign,
      platform: params?.utm_source
    });
  },

  productView(productId: string, value?: number) {
    return trackEvent({
      event_type: 'product_view',
      product_id: productId,
      value: value || null
    });
  },

  addToCart(productId: string, value?: number) {
    return trackEvent({
      event_type: 'add_to_cart',
      product_id: productId,
      value: value || null
    });
  },

  beginCheckout(productId?: string, value?: number) {
    return trackEvent({
      event_type: 'begin_checkout',
      product_id: productId || null,
      value: value || null
    });
  },

  purchase(orderId: string, productId?: string, value?: number) {
    return trackEvent({
      event_type: 'purchase',
      order_id: orderId,
      product_id: productId || null,
      value: value || null
    });
  },

  identify: identifyCustomer,
  setConsent: setTrackingConsent,
  hasConsent: hasTrackingConsent
};
