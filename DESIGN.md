# NEXUS Design System: Monochromatic Autonomous Console

> **Single Source of Truth for NEXUS-DQPS UI/UX**  
> **Aesthetic Core:** Minimalist Swiss Telemetry / Achromatic Brutalism  
> **Strict Palette Rule:** Exactly 4 colors allowed. Achromatic only (Black, White, and Grey). Zero chromatic hues.

---

## 1. System Philosophy & Atmosphere

NEXUS-DQPS is an autonomous decision intelligence console. The visual language conveys rigorous mathematical authority, uncompromised signal-to-noise clarity, and surgical efficiency.

- **Atmosphere:** High-contrast tactical cockpit, deep space telemetry, and Swiss typographic restraint.
- **Density:** Cockpit-dense (Level 8/10) — high information density balanced by precise structural grid dividers.
- **Variance:** Offset structural asymmetry (Level 7/10) — distinct data tables, real-time event feeds, and telemetry telemetry matrices.
- **Motion:** Mechanical and deterministic (Level 5/10) — sharp transitions, instantaneous feedback, spring-physics micro-interactions with no theatrical latency.

---

## 2. The Strict 4-Color Monochromatic Palette

This design system allows **strictly four (4) colors**. No intermediate hex codes, no RGB opacity mixing with new hues, and absolutely zero chromatic saturation (0% saturation across all tokens).

| Token Name | Hex Code | Swatch | Functional Role |
| :--- | :--- | :--- | :--- |
| **Canvas Black** | `#000000` | ![#000000](https://placehold.co/14x14/000000/000000.png) | Base ground, root canvas, absolute backdrop, inverse button text |
| **Surface Dark Grey** | `#1A1A1A` | ![#1A1A1A](https://placehold.co/14x14/1A1A1A/1A1A1A.png) | Cards, panel surfaces, elevated tables, tooltips, secondary button backgrounds |
| **Muted Mid Grey** | `#8A8A8A` | ![#8A8A8A](https://placehold.co/14x14/8A8A8A/8A8A8A.png) | Secondary typography, structural borders (1px), chart baselines, inactive states |
| **Pure White** | `#FFFFFF` | ![#FFFFFF](https://placehold.co/14x14/FFFFFF/FFFFFF.png) | Primary typography, key performance metrics, active tab indicators, primary CTA fills |

### Absolute Palette Enforcement Rules
1. **Zero Chromatic Color:** Any use of blue, green, amber, red, purple, cyan, or warm/cool-tinted greys is strictly forbidden.
2. **Exactly 4 Values:** Every pixel, fill, stroke, border, shadow, text, badge, icon, and chart series must resolve to one of `#000000`, `#1A1A1A`, `#8A8A8A`, or `#FFFFFF`.
3. **No Gradients:** Linear and radial gradients that introduce intermediate blurred hues are prohibited. Transitions between layers are sharp and geometric.

---

## 3. Semantic Token Mapping & Contrast Architecture

| Semantic Role | Assigned Color | Hex | Applied Context |
| :--- | :--- | :--- | :--- |
| **Background (Canvas)** | Canvas Black | `#000000` | System background, fullscreen modals backdrop, viewport base |
| **Surface (Container)** | Surface Dark Grey | `#1A1A1A` | Card containers, sidebar background, table rows, modal dialog bodies |
| **Border (Structural)** | Muted Mid Grey | `#8A8A8A` | 1px card borders, table dividers, input borders, separation rules |
| **Subtle Divider** | Surface Dark Grey | `#1A1A1A` | Internal grid lines on Canvas Black backgrounds |
| **Text Primary** | Pure White | `#FFFFFF` | Headings, hero numbers, primary data readouts, active labels |
| **Text Muted** | Muted Mid Grey | `#8A8A8A` | Column headers, descriptions, timestamps, metadata, units |
| **Interactive Primary** | Pure White | `#FFFFFF` | Primary action button fill, checked checkbox fill, active tab pill |
| **Interactive Text** | Canvas Black | `#000000` | Text/icons inside Pure White primary buttons |
| **Interactive Ghost** | Surface Dark Grey | `#1A1A1A` | Secondary button fills, dropdown item hover state |
| **Focus Ring** | Pure White | `#FFFFFF` | 1px solid offset outline for keyboard focus |

---

## 4. Status, Telemetry & Data Visualization (Without Color)

Because traditional status colors (green/yellow/red) are eliminated, system states communicate via **contrast, stroke weight, geometry, and iconography**:

### A. State Indication Hierarchy
- **Optimal / Normal / Healthy:**
  - Background: `#1A1A1A`
  - Text/Icon: `#FFFFFF`
  - Visual Cue: Solid white circular dot `●` + bold monospace numeric value.
- **Warning / Degraded / Drift:**
  - Background: `#1A1A1A`
  - Border: 1px solid `#8A8A8A`
  - Text: `#FFFFFF`
  - Visual Cue: Hollow circle `○` or diagonal strikethrough symbol `⊘` + label `[WARN]`.
- **Critical / Anomaly / Outage:**
  - High-Contrast Inversion: Solid `#FFFFFF` container with `#000000` text, or high-contrast double border (`#FFFFFF` on `#000000`).
  - Visual Cue: Solid white square `■` or exclamation `[!相对]` with inverse white-on-black tag.
- **Offline / Stale / Paused:**
  - Text & Border: `#8A8A8A`
  - Visual Cue: Dashed line or dimmed bracketed text `[INACTIVE]`.

### B. Chart & Data Visualization Strategy
- **Metric Series 1 (Current / Primary):** Solid line (`2px`), `#FFFFFF`.
- **Metric Series 2 (Baseline / 14-Day Rolling):** Dashed line (`1.5px`, `4px 4px`), `#8A8A8A`.
- **Metric Series 3 (Floor / Threshold Target):** Dotted line (`1px`, `2px 2px`), `#8A8A8A`.
- **Bar Charts:**
  - Actual: Solid `#FFFFFF` bar.
  - Prior / Counterfactual: Hollow bar with 1px `#8A8A8A` border.
- **Grid Lines & Axes:** 1px solid `#1A1A1A`.
- **Axis Labels & Ticks:** `#8A8A8A`, tabular monospace numbers.

---

## 5. Typographic Architecture

- **Primary Sans Font:** `Geist Sans` (Fallback: `system-ui`, `-apple-system`, `sans-serif`)
- **Telemetry / Monospace Font:** `Geist Mono` or `JetBrains Mono` (Fallback: `ui-monospace`, `monospace`)
- **Prohibited Fonts:** `Inter`, generic browser serif (`Times New Roman`, `Georgia`, `Garamond`).

### Typographic Scale

| Role | Font Family | Size | Weight | Tracking | Color |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Console Display** | Sans | `32px` (`2.0rem`) | `700` Bold | `-0.03em` | `#FFFFFF` |
| **Section Header** | Sans | `20px` (`1.25rem`) | `600` SemiBold | `-0.02em` | `#FFFFFF` |
| **Card Header** | Sans | `14px` (`0.875rem`) | `600` SemiBold | `-0.01em` | `#FFFFFF` |
| **Primary Metric (KPI)** | Mono | `24px` (`1.5rem`) | `700` Bold | `0` | `#FFFFFF` |
| **Body / Readout** | Sans | `14px` (`0.875rem`) | `400` Regular | `0` | `#FFFFFF` |
| **Metadata / Unit** | Mono | `12px` (`0.75rem`) | `400` Regular | `+0.02em` | `#8A8A8A` |
| **Micro Caption / Tags** | Mono | `10px` (`0.625rem`) | `500` Medium | `+0.05em` | `#8A8A8A` |

---

## 6. Component Specifications

### 1. Buttons
- **Primary Action (Execute / Confirm):**
  - Background: `#FFFFFF`
  - Text: `#000000` (`font-weight: 600`)
  - Border: None
  - Hover: Background `#8A8A8A`, Text `#000000`
  - Active: Scale `0.98`, tactile press
- **Secondary / Ghost (Filter / Cancel / View):**
  - Background: `#1A1A1A`
  - Text: `#FFFFFF`
  - Border: 1px solid `#8A8A8A`
  - Hover: Background `#000000`, Border `#FFFFFF`
  - Active: Scale `0.98`
- **Disabled State:**
  - Background: `#1A1A1A`
  - Text: `#8A8A8A`
  - Border: 1px solid `#1A1A1A`
  - Cursor: `not-allowed`

### 2. Cards & Panels
- **Container Fill:** `#1A1A1A`
- **Outer Border:** 1px solid `#8A8A8A` (or `#1A1A1A` on secondary elements)
- **Border Radius:** `4px` or `6px` (Strictly compact; no oversized bubble rounding)
- **Shadow:** None (`box-shadow: none`). Elevation is defined strictly by border contrast and surface separation.

### 3. Data Tables & Ledgers
- **Header Row:** Background `#000000`, Text `#8A8A8A`, uppercase `11px`, border-bottom 1px solid `#8A8A8A`.
- **Data Rows:** Background `#1A1A1A`, Text `#FFFFFF`, font-family `Geist Mono` for numeric values.
- **Row Hover:** Background `#000000`, 1px outline in `#8A8A8A`.
- **Alternating Striation:** None; separation handled by 1px solid horizontal borders in `#000000`.

### 4. Form Inputs & Selects
- **Input Field:**
  - Background: `#000000`
  - Border: 1px solid `#8A8A8A`
  - Text: `#FFFFFF`
  - Placeholder: `#8A8A8A`
  - Focus: Border 1px solid `#FFFFFF`, outline none.
- **Checkboxes & Toggles:**
  - Unchecked: `#000000` box with 1px `#8A8A8A` border.
  - Checked: Solid `#FFFFFF` fill with `#000000` checkmark.

### 5. Badges & Status Indicators
- **High Priority / Critical:** Inverse tag (`#FFFFFF` background, `#000000` monospace bold text).
- **Standard Telemetry Tag:** `#1A1A1A` background, `#8A8A8A` border, `#FFFFFF` text.
- **Muted System Tag:** `#000000` background, `#8A8A8A` border, `#8A8A8A` text.

---

## 7. Layout Principles & Spacing Matrix

- **Base Spacing Grid:** `4px` / `8px` strict increments (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`).
- **Dashboard Max Width:** `100%` fluid viewport container with `min-width: 1280px` on desktop.
- **Section Dividers:** 1px borders in `#1A1A1A` or `#8A8A8A`. No drop shadows.
- **Information Hierarchy:**
  - Top Bar: System Status, Live Stream Rate, Channel Filters.
  - Grid Layer 1: Core Telemetry KPIs (ROAS, Realized Margin Lift, Spend Variance).
  - Grid Layer 2: Main Diagnostic RCA & Closed-Loop Decision Matrix (Asymmetric 65% / 35% layout).
  - Grid Layer 3: Reallocation Queue & Ledger Log Table.

---

## 8. Motion & Performance Guidelines

- **Duration:** Extremely fast micro-animations (`100ms`–`180ms`). No sluggish transitions.
- **Physics:** Snappy mechanical curve (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Permitted Properties:** Only hardware-accelerated `opacity` and `transform`.
- **Live Telemetry Ticker:** Infinite CSS marquee or smooth 1-second interval ticker updating numbers cleanly without layout shift.
- **Data Refresh Cue:** 100ms pulse of `#8A8A8A` border to `#FFFFFF` on updated table cells.

---

## 9. Explicit Anti-Patterns (Enforcement Checklist)

- ❌ **No Colors Anywhere:** Absolutely zero RGB/HSL tinting (no blues, reds, greens, yellows, purples, or cyan).
- ❌ **No 5th Color:** Never introduce `#333333`, `#CCCCCC`, `#121212`, or any other tone outside `#000000`, `#1A1A1A`, `#8A8A8A`, and `#FFFFFF`.
- ❌ **No Soft Glows or Neon Shadows:** `box-shadow: 0 0 15px rgba(...)` is banned.
- ❌ **No Emojis:** Replace all emojis with strict Unicode glyphs (`▲`, `▼`, `■`, `●`, `○`, `→`, `×`) or SVG icons stroked in `#FFFFFF` / `#8A8A8A`.
- ❌ **No Soft Pastel Gradients:** Every surface must be flat `#000000` or `#1A1A1A`.
- ❌ **No Squishy/Bouncy Animation:** No playful elastic easing.
