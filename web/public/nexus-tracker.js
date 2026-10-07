(function(window) {
  'use strict';

  var COOKIE_VISITOR_KEY = 'nx_vid';
  var COOKIE_SESSION_KEY = 'nx_sid';
  var COOKIE_LAST_ACTIVE_KEY = 'nx_last_act';
  var COOKIE_FIRST_TOUCH_KEY = 'nx_ft';
  var COOKIE_LAST_TOUCH_KEY = 'nx_lt';
  var COOKIE_CONSENT_KEY = 'nx_consent';
  var COOKIE_CUSTOMER_KEY = 'nx_cid';

  var SESSION_INACTIVITY_MS = 30 * 60 * 1000;
  var VISITOR_COOKIE_MAX_AGE_DAYS = 365;

  function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function sha256Hex(str) {
    var normalized = (str || '').trim().toLowerCase();
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      var buffer = new TextEncoder().encode(normalized);
      return crypto.subtle.digest('SHA-256', buffer).then(function(hashBuffer) {
        var hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
      });
    }
    // Fallback sync hash
    var hash = 0;
    for (var i = 0; i < normalized.length; i++) {
      hash = (hash << 5) - hash + normalized.charCodeAt(i);
      hash |= 0;
    }
    return Promise.resolve(Math.abs(hash).toString(16).padStart(64, '0'));
  }

  function getCookie(name) {
    if (typeof document === 'undefined') return null;
    var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return match ? decodeURIComponent(match[3]) : null;
  }

  function setCookie(name, value, days) {
    if (typeof document === 'undefined') return;
    var expires = '';
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Lax';
  }

  function deleteCookie(name) {
    if (typeof document === 'undefined') return;
    document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
  }

  function getStorage(key) {
    var c = getCookie(key);
    if (c) return c;
    try {
      return localStorage.getItem(key);
    } catch (_e) {
      return null;
    }
  }

  function setStorage(key, value, days) {
    setCookie(key, value, days);
    try {
      localStorage.setItem(key, value);
    } catch (_e) {}
  }

  function removeStorage(key) {
    deleteCookie(key);
    try {
      localStorage.removeItem(key);
    } catch (_e) {}
  }

  function hasConsent() {
    var consent = getStorage(COOKIE_CONSENT_KEY);
    if (consent === 'false' || consent === 'denied' || consent === '0') {
      return false;
    }
    return true;
  }

  function setConsent(granted) {
    if (!granted) {
      setStorage(COOKIE_CONSENT_KEY, 'false', VISITOR_COOKIE_MAX_AGE_DAYS);
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

  function getVisitorId() {
    if (!hasConsent()) return null;
    var vid = getStorage(COOKIE_VISITOR_KEY);
    if (!vid) {
      vid = generateUUID();
      setStorage(COOKIE_VISITOR_KEY, vid, VISITOR_COOKIE_MAX_AGE_DAYS);
    }
    return vid;
  }

  function getSessionId() {
    if (!hasConsent()) return null;
    var now = Date.now();
    var lastActiveStr = getStorage(COOKIE_LAST_ACTIVE_KEY);
    var sid = getStorage(COOKIE_SESSION_KEY);
    var lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : 0;
    if (!sid || (now - lastActive > SESSION_INACTIVITY_MS)) {
      sid = generateUUID();
      setStorage(COOKIE_SESSION_KEY, sid);
    }
    setStorage(COOKIE_LAST_ACTIVE_KEY, now.toString());
    return sid;
  }

  function parseParams(url) {
    var loc = url || window.location.href;
    try {
      var u = new URL(loc);
      return {
        gclid: u.searchParams.get('gclid') || undefined,
        fbclid: u.searchParams.get('fbclid') || undefined,
        ttclid: u.searchParams.get('ttclid') || undefined,
        utm_source: u.searchParams.get('utm_source') || undefined,
        utm_medium: u.searchParams.get('utm_medium') || undefined,
        utm_campaign: u.searchParams.get('utm_campaign') || undefined,
        utm_content: u.searchParams.get('utm_content') || undefined,
        campaign_id: u.searchParams.get('campaign_id') || u.searchParams.get('cid') || undefined,
        ad_id: u.searchParams.get('ad_id') || u.searchParams.get('aid') || undefined
      };
    } catch (_e) {
      return {};
    }
  }

  function persistTouchpoints(params) {
    if (!hasConsent()) return;
    var hasAny = Object.values(params).some(Boolean);
    if (!hasAny) return;

    var ft = getStorage(COOKIE_FIRST_TOUCH_KEY);
    if (!ft) {
      setStorage(COOKIE_FIRST_TOUCH_KEY, JSON.stringify(params), VISITOR_COOKIE_MAX_AGE_DAYS);
    }
    setStorage(COOKIE_LAST_TOUCH_KEY, JSON.stringify(params), VISITOR_COOKIE_MAX_AGE_DAYS);
  }

  function trackEvent(eventType, data, endpoint) {
    if (!hasConsent()) return Promise.resolve({ success: false, reason: 'No consent' });

    var ep = endpoint || '/api/events';
    var vid = getVisitorId();
    var sid = getSessionId();
    var cid = getStorage(COOKIE_CUSTOMER_KEY);
    var adParams = parseParams();
    persistTouchpoints(adParams);

    var touch = {};
    try {
      var rawLt = getStorage(COOKIE_LAST_TOUCH_KEY) || getStorage(COOKIE_FIRST_TOUCH_KEY);
      if (rawLt) touch = JSON.parse(rawLt);
    } catch (_e) {}

    var platform = (data && data.platform) || adParams.utm_source || touch.utm_source || null;
    var click_id = (data && data.click_id) || adParams.gclid || adParams.fbclid || adParams.ttclid || touch.gclid || touch.fbclid || touch.ttclid || null;

    if (!platform && click_id) {
      if (adParams.gclid || touch.gclid) platform = 'google';
      else if (adParams.fbclid || touch.fbclid) platform = 'meta';
      else if (adParams.ttclid || touch.ttclid) platform = 'tiktok';
    }

    var payload = {
      event_id: generateUUID(),
      visitor_id: vid,
      session_id: sid,
      customer_id: cid,
      event_type: eventType,
      timestamp: new Date().toISOString(),
      product_id: (data && data.product_id) || null,
      value: (data && data.value !== undefined) ? data.value : null,
      campaign_id: (data && data.campaign_id) || adParams.campaign_id || touch.campaign_id || touch.utm_campaign || null,
      platform: platform,
      click_id: click_id,
      utm_source: (data && data.utm_source) || adParams.utm_source || touch.utm_source || null,
      utm_medium: (data && data.utm_medium) || adParams.utm_medium || touch.utm_medium || null,
      utm_campaign: (data && data.utm_campaign) || adParams.utm_campaign || touch.utm_campaign || null,
      utm_content: (data && data.utm_content) || adParams.utm_content || touch.utm_content || null,
      page_url: (data && data.page_url) || window.location.href,
      order_id: (data && data.order_id) || null,
      is_server_side: false
    };

    return fetch(ep, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function(r) { return r.json(); }).catch(function(err) {
      if (navigator && navigator.sendBeacon) {
        navigator.sendBeacon(ep, new Blob([JSON.stringify(payload)], { type: 'application/json' }));
      }
      return { error: err.message };
    });
  }

  window.NexusTracker = {
    init: function() {
      if (hasConsent()) {
        getVisitorId();
        getSessionId();
        persistTouchpoints(parseParams());
      }
    },
    hasConsent: hasConsent,
    setConsent: setConsent,
    track: trackEvent,
    pageView: function(url) { return trackEvent('page_view', { page_url: url }); },
    adClick: function(params) { return trackEvent('ad_click', params); },
    productView: function(sku, val) { return trackEvent('product_view', { product_id: sku, value: val }); },
    addToCart: function(sku, val) { return trackEvent('add_to_cart', { product_id: sku, value: val }); },
    beginCheckout: function(sku, val) { return trackEvent('begin_checkout', { product_id: sku, value: val }); },
    purchase: function(orderId, sku, val) { return trackEvent('purchase', { order_id: orderId, product_id: sku, value: val }); },
    identify: function(email, method) {
      return sha256Hex(email).then(function(cid) {
        setStorage(COOKIE_CUSTOMER_KEY, cid, VISITOR_COOKIE_MAX_AGE_DAYS);
        var vid = getVisitorId();
        if (vid) {
          fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event_type: 'page_view',
              visitor_id: vid,
              session_id: getSessionId(),
              customer_id: cid,
              identity_link: { visitor_id: vid, customer_id: cid, method: method || 'login' }
            })
          });
        }
        return cid;
      });
    }
  };

  // Auto-init if consent present
  if (hasConsent()) {
    window.NexusTracker.init();
  }
})(typeof window !== 'undefined' ? window : this);
