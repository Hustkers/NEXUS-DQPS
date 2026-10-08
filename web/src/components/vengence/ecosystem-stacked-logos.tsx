'use client';

import React from 'react';
import { StackedLogos } from '@/components/ui/stacked-logos';

// =============================================================================
// Authentic SVG Brand & Ecosystem Logotypes (Monochrome fill="currentColor")
// =============================================================================

// Column 1: Global Paid Ad Networks
function MetaLogo() {
  return (
    <svg viewBox="0 0 140 40" className="h-7 w-auto select-none" fill="currentColor">
      <path d="M19.4 12.8c-2.4 0-4.6 1.4-5.9 3.4-1.3-2-3.5-3.4-5.9-3.4-4 0-7.2 3.4-7.2 7.6 0 4.3 3.3 7.6 7.4 7.6 2.5 0 4.7-1.3 6-3.4 1.3 2.1 3.5 3.4 6 3.4 4.1 0 7.4-3.3 7.4-7.6 0-4.2-3.2-7.6-7.8-7.6zm-11.8 12c-2.2 0-3.9-1.9-3.9-4.4s1.7-4.4 3.9-4.4c2.2 0 3.8 2 4.4 4.4-.6 2.4-2.2 4.4-4.4 4.4zm12.1 0c-2.2 0-3.8-2-4.4-4.4.6-2.4 2.2-4.4 4.4-4.4 2.2 0 3.9 1.9 3.9 4.4s-1.7 4.4-3.9 4.4z" />
      <text x="36" y="25" fontSize="16" fontWeight="700" letterSpacing="-0.5px">Meta</text>
    </svg>
  );
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 150 40" className="h-7 w-auto select-none" fill="currentColor">
      <path d="M19.5 20.3c0-.7-.1-1.4-.2-2H10v3.8h5.3c-.2 1.2-.9 2.2-2 2.9v2.4h3.2c1.9-1.7 3-4.2 3-7.1z" />
      <path d="M10 30c2.7 0 5-1 6.6-2.6l-3.2-2.4c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H1.1v2.5C2.8 27.8 6.1 30 10 30z" />
      <path d="M4.4 21.9c-.2-.6-.3-1.3-.3-1.9s.1-1.3.3-1.9V15.6H1.1C.4 17 .1 18.5.1 20s.3 3 .9 4.4l3.4-2.5z" />
      <path d="M10 13.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9C15 10.9 12.7 10 10 10 6.1 10 2.8 12.2 1.1 15.6l3.3 2.5c.8-2.4 3-4.2 5.6-4.2z" />
      <text x="28" y="25" fontSize="15" fontWeight="700" letterSpacing="-0.5px">Google Ads</text>
    </svg>
  );
}

function TikTokLogo() {
  return (
    <svg viewBox="0 0 145 40" className="h-7 w-auto select-none" fill="currentColor">
      <path d="M16.5 13.2a4.4 4.4 0 0 1-3.4-3.8V7h-3v12.2a2.6 2.6 0 0 1-4.7 1.6 2.6 2.6 0 0 1 2.1-4.2c.3 0 .5 0 .8.1v-3.2a5.7 5.7 0 0 0-.9-.1 5.7 5.7 0 0 0-5.7 5.7 5.7 5.7 0 0 0 9.7 4 5.6 5.6 0 0 0 1.7-4v-7.3a7.3 7.3 0 0 0 4.3 1.4v-3a4.3 4.3 0 0 1-.9-.2z" />
      <text x="24" y="25" fontSize="15" fontWeight="700" letterSpacing="-0.5px">TikTok</text>
    </svg>
  );
}

function YouTubeLogo() {
  return (
    <svg viewBox="0 0 155 40" className="h-7 w-auto select-none" fill="currentColor">
      <path d="M19.5 14.8c-.2-.9-.9-1.6-1.8-1.8C16.1 12.5 10 12.5 10 12.5s-6.1 0-7.7.5c-.9.2-1.6.9-1.8 1.8C0 16.4 0 20 0 20s0 3.6.5 5.2c.2.9.9 1.6 1.8 1.8 1.6.5 7.7.5 7.7.5s6.1 0 7.7-.5c.9-.2 1.6-.9 1.8-1.8.5-1.6.5-5.2.5-5.2s0-3.6-.5-5.2zm-11.5 8v-5.6l4.9 2.8-4.9 2.8z" />
      <text x="27" y="25" fontSize="15" fontWeight="700" letterSpacing="-0.5px">YouTube</text>
    </svg>
  );
}

// Column 2: Retail Media & Marketplaces
function AmazonAdsLogo() {
  return (
    <svg viewBox="0 0 155 40" className="h-7 w-auto select-none" fill="currentColor">
      <path d="M12.3 20.3c-.1.4 0 .6.1.7.1.1.3.2.7.2.4 0 .8-.1 1.2-.4.4-.2.8-.5 1.1-.9.1.2.1.3.1.5 0 .4-.1.7-.3 1-.2.2-.5.4-.9.6-.4.1-1 .2-1.6.2-.6 0-1.1-.1-1.5-.3-.4-.2-.7-.5-.9-.8-.2-.4-.3-.8-.3-1.3 0-.3 0-.6.1-1 .1-.4.2-.8.3-1.3l.4-1.6c.1-.4.1-.7.1-1 0-.3-.1-.6-.3-.7-.2-.1-.6-.2-1.1-.2-.4 0-.7 0-1.1.1-.4.1-.7.3-1 .5l-.2-.9c.4-.2.9-.4 1.4-.5.6-.1 1.1-.2 1.7-.2.8 0 1.4.2 1.8.5.3.3.5.9.5 1.7 0 .3 0 .6-.1.9l-.4 1.6c0 .2-.1.4-.1.6 0 .2.1.3.2.4.1.1.3.1.6.1.3 0 .7-.1 1-.2.3-.2.6-.4.8-.6l.2.4c-.2.3-.5.6-.9.9-.4.2-.9.4-1.4.4-.4 0-.7-.1-.9-.3-.2-.1-.3-.4-.4-.8z" />
      <path d="M18.6 24.5c-2.6 1.9-6.3 2.9-9.6 2.9-4.5 0-8.6-1.7-11.7-4.6-.2-.2 0-.5.3-.4 3.3 1.9 7.4 3.1 11.6 3.1 2.9 0 6.2-.7 9.1-2.1.4-.2.8.3.3.7z" />
      <text x="26" y="25" fontSize="15" fontWeight="700" letterSpacing="-0.5px">Amazon</text>
    </svg>
  );
}

function ShopifyLogoMark() {
  return (
    <svg viewBox="0 0 145 40" className="h-7 w-auto select-none" fill="currentColor">
      <path d="M17.2 12.2l-1.9-.6c0-.1 0-.3-.1-.4-.3-1.1-.9-2.1-1.7-2.7-1.1-.9-2.1-1.2-3.1-1.2-1 0-2 .3-2.8.9-.8.6-1.4 1.6-1.7 2.7 0 .1-.1.3-.1.4l-1.9.6c-.4.1-.6.5-.5 1l2.1 10.7c.1.4.4.6.7.6h8.2c.4 0 .7-.3.7-.6l2.1-10.7c.1-.5-.1-.9-.5-1zm-6.4-3.3c.6 0 1.3.2 1.8.6.5.4.9 1.1 1.1 1.9l-5.9 1.8c.2-.8.6-1.5 1.1-1.9.5-.5 1.2-.7 1.8-.7zm-1.7 5.7l-1.2.4 1.2 3-1.5.5-.4-1c-.1-.2-.2-.3-.4-.2l-.4.1.8 1.9 2-.6-.1-.1c-.1-.2-.1-.5-.1-.7l.1-.2zm2.3 6.8c-.2-.1-.4-.1-.6-.2l-.5 1.5c.2.1.4.1.6.2.9.3 1.6.2 2.2-.3.6-.5.8-1.2.5-2-.3-.9-1-1.5-1.9-1.8-.8-.3-1.2-.6-1.3-.9-.1-.4 0-.8.4-1.1.4-.3.9-.3 1.5-.1.2.1.4.1.5.2l.4-1.4c-.2-.1-.4-.2-.6-.2-.9-.3-1.7-.2-2.2.3-.6.5-.8 1.2-.6 2 .3 1 1 1.6 2 1.9.8.2 1.2.6 1.3.9.1.4 0 .8-.4 1.1-.4.4-.9.4-1.6.2z" />
      <text x="24" y="25" fontSize="15" fontWeight="700" letterSpacing="-0.5px">Shopify</text>
    </svg>
  );
}

function PinterestLogo() {
  return (
    <svg viewBox="0 0 160 40" className="h-7 w-auto select-none" fill="currentColor">
      <path d="M10 8C4.5 8 0 12.5 0 18c0 4.2 2.6 7.8 6.3 9.3-.1-.8-.2-2 0-2.9l1.4-6s-.4-.7-.4-1.8c0-1.7 1-3 2.2-3 .9 0 1.4.7 1.4 1.5 0 1-.6 2.3-.9 3.6-.3 1.1.6 2 1.6 2 2 0 3.5-2.1 3.5-5.1 0-2.7-1.9-4.5-4.7-4.5-3.2 0-5.1 2.4-5.1 4.9 0 1 .4 2 1 2.6.1.1.1.2.1.3-.1.4-.3 1.2-.3 1.3-.1.2-.2.2-.4.1-1.6-.7-2.6-3-2.6-4.9 0-4 2.9-7.7 8.4-7.7 4.4 0 7.9 3.2 7.9 7.4 0 4.4-2.8 8-6.6 8-1.3 0-2.5-.7-2.9-1.5l-.8 3.1c-.3 1.1-1.1 2.5-1.6 3.4 1.1.3 2.2.5 3.4.5 5.5 0 10-4.5 10-10S15.5 8 10 8z" />
      <text x="26" y="25" fontSize="15" fontWeight="700" letterSpacing="-0.5px">Pinterest</text>
    </svg>
  );
}

function SnapchatLogo() {
  return (
    <svg viewBox="0 0 160 40" className="h-7 w-auto select-none" fill="currentColor">
      <path d="M10 8.5c-3 0-5.2 2.1-5.2 5.1 0 .9.3 2 .3 2.4 0 .2-.2.4-.4.5-.7.3-1.5.8-1.5 1.5 0 .6.6.9 1.2.9.2 0 .4 0 .5-.1.5-.3 1-.1 1.2.3.4.7.9 1.4 1.9 1.4.3 0 .7-.1 1.2-.3.6-.3 1.2-.4 1.8-.4.6 0 1.2.1 1.8.4.5.2.9.3 1.2.3 1 0 1.5-.7 1.9-1.4.2-.4.7-.6 1.2-.3.1.1.3.1.5.1.6 0 1.2-.3 1.2-.9 0-.7-.8-1.2-1.5-1.5-.2-.1-.4-.3-.4-.5 0-.4.3-1.5.3-2.4 0-3-2.2-5.1-5.2-5.1z" />
      <text x="24" y="25" fontSize="15" fontWeight="700" letterSpacing="-0.5px">Snapchat</text>
    </svg>
  );
}

// Column 3: Commerce & Billing Infrastructure
function StripeLogo() {
  return (
    <svg viewBox="0 0 145 40" className="h-7 w-auto select-none" fill="currentColor">
      <path d="M18.8 19.3c0-2.4-1.3-3.6-3.8-3.6-2 0-4.4.9-6.3 2.1l-.8-2.6c2.1-1.2 5.1-2 7.7-2 4.6 0 7.3 2.2 7.3 6.3v8.5h-3.9v-2c-1.4 1.5-3.5 2.3-5.5 2.3-3.3 0-5.5-2-5.5-4.8 0-3.3 2.7-4.8 7.3-4.8h3.5v-1.4zm-3.8 6.4c1.8 0 3.5-.9 3.8-2.3v-1.8h-3.2c-2.4 0-3.7.8-3.7 2.2 0 1.2.9 1.9 3.1 1.9z" />
      <text x="24" y="25" fontSize="16" fontWeight="700" letterSpacing="-0.5px">Stripe</text>
    </svg>
  );
}

function WooCommerceLogo() {
  return (
    <svg viewBox="0 0 160 40" className="h-7 w-auto select-none" fill="currentColor">
      <path d="M19.2 12H2.8C1.3 12 0 13.3 0 14.8v10.4C0 26.7 1.3 28 2.8 28h16.4c1.5 0 2.8-1.3 2.8-2.8V14.8c0-1.5-1.3-2.8-2.8-2.8zm-13.6 11l-2.4-6.4h1.7l1.5 4.6 1.4-4.6h1.7l-2.4 6.4h-1.5zm6.5 0l-2.4-6.4h1.7l1.5 4.6 1.4-4.6h1.7l-2.4 6.4h-1.5z" />
      <text x="27" y="25" fontSize="15" fontWeight="700" letterSpacing="-0.5px">Woo</text>
    </svg>
  );
}

function BigCommerceLogo() {
  return (
    <svg viewBox="0 0 170 40" className="h-7 w-auto select-none" fill="currentColor">
      <path d="M15.4 17.2c-.3-.8-.9-1.4-1.7-1.7l-4.2-2.1c-.6-.3-1.3-.3-1.9 0L3.4 15.5c-.8.4-1.4 1-1.7 1.7-.3.8-.3 1.7 0 2.5.3.8.9 1.4 1.7 1.7l4.2 2.1c.6.3 1.3.3 1.9 0l4.2-2.1c.8-.4 1.4-1 1.7-1.7.3-.8.3-1.7 0-2.5zm-6.6 4.6l-3.3-1.6 3.3-1.6 3.3 1.6-3.3 1.6z" />
      <text x="24" y="25" fontSize="14" fontWeight="700" letterSpacing="-0.5px">BigCommerce</text>
    </svg>
  );
}

function KlaviyoLogo() {
  return (
    <svg viewBox="0 0 150 40" className="h-7 w-auto select-none" fill="currentColor">
      <path d="M4 11h14l-5 9 5 9H4V11z" />
      <text x="24" y="25" fontSize="15" fontWeight="700" letterSpacing="-0.5px">Klaviyo</text>
    </svg>
  );
}

// Column 4: Data Infrastructure & Attribution
function SnowflakeLogo() {
  return (
    <svg viewBox="0 0 165 40" className="h-7 w-auto select-none" fill="currentColor">
      <path d="M10 7.5v6.2l4.4-4.4 1.1 1.1-4.4 4.4h6.2v1.6h-6.2l4.4 4.4-1.1 1.1-4.4-4.4v6.2H8.4v-6.2l-4.4 4.4-1.1-1.1 4.4-4.4H1.1v-1.6h6.2l-4.4-4.4 1.1-1.1 4.4 4.4V7.5H10z" />
      <text x="25" y="25" fontSize="15" fontWeight="700" letterSpacing="-0.5px">Snowflake</text>
    </svg>
  );
}

function DuckDBLogo() {
  return (
    <svg viewBox="0 0 150 40" className="h-7 w-auto select-none" fill="currentColor">
      <path d="M17.5 13.8c-.8-1.5-2.3-2.5-4-2.8-2.3-.4-4.6.6-5.8 2.5L5 18c-.8 1.3-.9 2.9-.2 4.2.7 1.3 2 2.1 3.5 2.1h8.2c1.7 0 3-1.3 3-3 0-.8-.3-1.6-.9-2.2l-1.1-5.3zm-6.2 3.4c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z" />
      <text x="25" y="25" fontSize="15" fontWeight="700" letterSpacing="-0.5px">DuckDB</text>
    </svg>
  );
}

function GA4Logo() {
  return (
    <svg viewBox="0 0 170 40" className="h-7 w-auto select-none" fill="currentColor">
      <path d="M16 11.5c-1.4 0-2.5 1.1-2.5 2.5 0 .3.1.6.2.8l-3.4 3.4c-.2-.1-.5-.2-.8-.2s-.6.1-.8.2L6.3 15.8c.1-.2.2-.5.2-.8 0-1.4-1.1-2.5-2.5-2.5S1.5 13.6 1.5 15c0 1.4 1.1 2.5 2.5 2.5.3 0 .6-.1.8-.2l2.4 2.4c-.1.2-.2.5-.2.8 0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5c0-.3-.1-.6-.2-.8l3.4-3.4c.2.1.5.2.8.2 1.4 0 2.5-1.1 2.5-2.5s-1.1-2.5-2.5-2.5z" />
      <text x="25" y="25" fontSize="14" fontWeight="700" letterSpacing="-0.5px">GA4 Analytics</text>
    </svg>
  );
}

function PostgreSQLLogo() {
  return (
    <svg viewBox="0 0 155 40" className="h-7 w-auto select-none" fill="currentColor">
      <path d="M10 8c-4.4 0-8 3.6-8 8 0 3.1 1.8 5.8 4.4 7.1V28h2.2v-4.1c.5.1.9.1 1.4.1s.9 0 1.4-.1V28h2.2v-4.9c2.6-1.3 4.4-4 4.4-7.1 0-4.4-3.6-8-8-8zm-2.5 7.5c.7 0 1.2.6 1.2 1.2s-.6 1.2-1.2 1.2-1.2-.6-1.2-1.2.5-1.2 1.2-1.2zm5 0c.7 0 1.2.6 1.2 1.2s-.6 1.2-1.2 1.2-1.2-.6-1.2-1.2.5-1.2 1.2-1.2z" />
      <text x="24" y="25" fontSize="15" fontWeight="700" letterSpacing="-0.5px">Postgres</text>
    </svg>
  );
}

// =============================================================================
// Groupings for StackedLogos
// =============================================================================

export const ecosystemLogoGroups: React.ReactNode[][] = [
  // Group 1: Paid Ad Networks
  [
    <MetaLogo key="meta" />,
    <GoogleLogo key="google" />,
    <TikTokLogo key="tiktok" />,
    <YouTubeLogo key="youtube" />,
  ],
  // Group 2: Retail Media & Marketplaces
  [
    <AmazonAdsLogo key="amazon" />,
    <ShopifyLogoMark key="shopify" />,
    <PinterestLogo key="pinterest" />,
    <SnapchatLogo key="snapchat" />,
  ],
  // Group 3: Commerce & Billing
  [
    <StripeLogo key="stripe" />,
    <WooCommerceLogo key="woo" />,
    <BigCommerceLogo key="bigcommerce" />,
    <KlaviyoLogo key="klaviyo" />,
  ],
  // Group 4: Data & Analytics
  [
    <SnowflakeLogo key="snowflake" />,
    <DuckDBLogo key="duckdb" />,
    <GA4Logo key="ga4" />,
    <PostgreSQLLogo key="postgres" />,
  ],
];

export function EcosystemStackedLogos() {
  return (
    <section className="py-14 sm:py-18 md:py-20 border-b border-border/60 bg-muted/10 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Header copy */}
        <div className="font-mono text-[11px] font-bold text-primary uppercase tracking-widest mb-2.5">
          UNIFIED AD &amp; COMMERCE ECOSYSTEM
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-orbitron font-extrabold tracking-tight text-foreground mb-3">
          Integrated Across Global Ad Networks
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto mb-10 sm:mb-12 leading-relaxed">
          Real-time API mutations, closed-loop telemetry, and attribution reconciliation across 16+ ad platforms, marketplaces, and data warehouses.
        </p>

        {/* Responsive Stacked Logos wrapper */}
        <div className="w-full flex justify-center overflow-x-auto no-scrollbar py-2">
          <StackedLogos
            logoGroups={ecosystemLogoGroups}
            duration={24}
            stagger={1.2}
            logoWidth="220px"
          />
        </div>
      </div>
    </section>
  );
}
