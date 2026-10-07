# Release Manifest: Notch Navbar Alignment, Theme Tokens & Stockout Protocol

## 1. Notch Navbar Symmetrical Alignment
- **Problem**: The centered logo lockup (`[NX] nexusdqps`) was positioned using `absolute left-1/2 -translate-x-1/2` while nav links were unevenly distributed, causing the `Features` link to collide and interlace directly under the logo on standard screens.
- **Solution**:
  - Balanced navigation links symmetrically:
    - **Left**: `Overview`, `Workflow` (aligned towards center via `justify-end`)
    - **Center**: `[NX] nexusdqps` lockup in natural flex document flow (`shrink-0 mx-3 sm:mx-5`)
    - **Right**: `Features`, `Stack`, `|`, Theme Toggle, GitHub (aligned from center via `justify-start`)
  - Ensures zero physical overlap across all viewport widths.

## 2. Dynamic Light & Dark Theme System
- **Problem**: 
  - Toggling between light and dark modes produced no visible change because both `:root` and `.dark` in `nexus-console.css` were hardcoded to identical black/white values.
  - An inline script in `layout.tsx` was forcefully resetting `localStorage.theme = 'dark'` whenever `light` mode was detected.
  - `<main>` in `page.tsx` had hardcoded `bg-[#000000] text-[#FFFFFF]`.
  - VGPU waveform canvas and background shaders had hardcoded white stroke colors that disappeared on light backgrounds.
- **Solution**:
  - Calibrated high-contrast monochrome Light theme in `nexus-console.css` (`#FFFFFF` background, `#09090B` text, `#E4E4E7` borders).
  - Retained deep-space terminal dark theme (`#000000` background, `#FFFFFF` text, `#1A1A1A` cards).
  - Cleaned up `layout.tsx` to respect user's persistent `localStorage` theme preference.
  - Updated `page.tsx` to use `bg-background text-foreground transition-colors duration-300`.
  - Adapted `VGPUCanvas`, `BackgroundShader`, `CardSpotlight`, `BentoGridItem`, `StatsMatrix`, `GlowButton`, and `ShockSimulatorShowcase` with semantic theme tokens.

## 3. Stockout Fix Protocol on Gauges Matrix
- Added interactive **Fix** action buttons on all `inventory <= 0` campaigns in `/dashboard/gauges`.
- Added interactive **Stockout Fix Protocol** modal to initiate spending circuit breakers and ERP inventory routing.
