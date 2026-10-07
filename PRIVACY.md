# NEXUS D2C — Privacy, Identity & Data Governance Policy

This document defines the privacy, identity stitching, and data governance standards implemented in the **NEXUS D2C** event tracking layer.

---

## 1. Zero Browser Fingerprinting Standard

NEXUS D2C strictly rejects invasive device fingerprinting techniques.

### Prohibited Techniques (Never Used)
* **No Canvas Fingerprinting**: No hidden `<canvas>` drawing or pixel sampling.
* **No WebGL / Audio Fingerprinting**: No audio buffer processing or GPU renderer string scraping.
* **No Font / Hardware Enumeration**: No scanning of installed system fonts, CPU core counts, or device battery telemetry.
* **No Raw IP Address Storage**: IP addresses are never persisted in databases or event logs. If coarse geographic clustering is required, IP addresses are either truncated to a subnet or hashed with a rotating salt and immediately discarded.

---

## 2. What Data Is Collected & Why

Every collected metric serves a direct, documented optimization or diagnostic purpose:

| Data Point | Technical Representation | Purpose |
| :--- | :--- | :--- |
| **Visitor ID** | Random UUID v4 (`nx_vid`) | Allows linking repeat sessions to measure ad latency and return frequency. Stored in a 1-year first-party cookie (`SameSite=Lax`) with a `localStorage` fallback. |
| **Session ID** | Random UUID v4 (`nx_sid`) | Tracks discrete user browsing visits with a 30-minute sliding inactivity timeout. |
| **Ad Click IDs** | String (`gclid`, `fbclid`, `ttclid`) | Connects ad spend from Google, Meta, and TikTok to downstream store activity to measure true contribution profit and flag ad network double-counting. |
| **Campaign & UTMs** | Strings (`utm_source`, `utm_campaign`, etc.) | First-touch and last-touch attribution modeling across marketing channels. |
| **Customer ID** | **SHA-256 Hex Hash** (`nx_cid`) | When a visitor logs in, registers, or checks out, their email is normalized (`trim().toLowerCase()`) and hashed via cryptographic SHA-256. Raw emails are **never stored** in tracking tables. |
| **Event Stream** | `page_view`, `ad_click`, `product_view`, `add_to_cart`, `begin_checkout`, `purchase` | Funnel drop-off diagnosis and recency-decayed product interest scoring for remarketing audiences. |
| **Orders** | `order_id`, `amount`, `product_id` | Server-side purchase reconciliation to ensure ad-blockers do not corrupt ROAS and profit accounting. |

---

## 3. Strict Consent Enforcement

Tracking is gated behind an explicit consent check function (`hasTrackingConsent()`):
1. **Consent Gate**: Before writing any cookie or sending any network beacon, `NexusTracker` verifies consent status.
2. **Revocation / Denial**: If a visitor opts out or declines consent:
   * No cookies or localStorage items (`nx_vid`, `nx_sid`, `nx_ft`, `nx_lt`) are set.
   * All existing tracking cookies are immediately cleared from the client.
   * The client tracker returns immediately without firing HTTP requests.

---

## 4. Multi-Touch Attribution & Double-Counting Audit

Ad platforms often inflate their reported conversions using wide 7-day click / 1-day view windows, leading to massive double counting between Meta, Google, and TikTok.

NEXUS computes 1st-party attribution independently:
* **Last-Touch Attribution (Default)**: Attributes purchase value to the most recent verified ad campaign touched before the purchase timestamp.
* **First-Touch Attribution**: Attributes purchase value to the initial campaign that introduced the visitor.
* **Discrepancy Audit**: Compares platform self-reported claims against verified first-party orders and alerts the optimizer when claims diverge by >25%.

---

## 5. Recency-Decayed Product Interest Scoring

To segment audiences without intrusive profiling, interest scores are computed using behavioral interaction weights decayed exponentially with a **7-day half-life**:

$$\text{Interest Score}(v, p) = \sum_{e \in E} w(e) \cdot 2^{-\frac{\Delta t}{7 \text{ days}}}$$

* `page_view`: 0.5
* `product_view`: 1.0
* `add_to_cart`: 3.0
* `begin_checkout`: 5.0
* `purchase`: 10.0

Audience segments are derived dynamically from the empirical score distribution:
* **Browsers**: Viewed product PDP, 0 cart additions, 0 purchases.
* **Cart Abandoners**: Added to cart or began checkout, but 0 completed purchases (prime targets for retargeting).
* **Buyers**: Exactly 1 completed purchase.
* **Repeat Buyers**: 2 or more completed purchases.

---

## 6. Data Retention & Right to be Forgotten (GDPR / CCPA)

### Automated Data Retention
Raw event logs have a configurable retention policy (default: **90 days**). Events older than the retention window are automatically pruned via:
* API Endpoint: `POST /api/privacy/retention` with `{ "days": 90 }`
* Database Query: `DELETE FROM events WHERE timestamp < NOW() - INTERVAL '90 days';`

### Right to be Forgotten (Article 17 GDPR)
Visitors or customers can request permanent deletion of all historical tracking records:
* API Endpoint: `POST /api/privacy/forget`
```json
{
  "email": "customer@example.com"
}
```
* Or by UUID:
```json
{
  "id": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```
* **Execution**: Completely deletes the visitor record, sessions, stitched identity links, and all associated raw events from both the operational datastore and PostgreSQL database.
