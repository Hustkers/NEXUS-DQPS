'use client';

import React from 'react';
import { StackedLogos } from '@/components/ui/stacked-logos';

// =============================================================================
// Centered Brand Lockup Helper
// =============================================================================

function BrandItem({
  icon,
  name,
}: {
  icon: React.ReactNode;
  name: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2.5 sm:gap-3 w-full h-full text-foreground select-none">
      <div className="shrink-0 flex items-center justify-center text-foreground">
        {icon}
      </div>
      <span className="font-orbitron font-bold text-xs sm:text-sm tracking-wider uppercase text-foreground leading-none whitespace-nowrap">
        {name}
      </span>
    </div>
  );
}

// =============================================================================
// Authentic Brand Vector Marks (Monochrome currentColor, dead-centered)
// =============================================================================

function NikeIcon({ className = 'size-5 sm:size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.71 6.13c-3.14 2.86-7.39 6.84-11.38 10.83-2.6 2.6-4.5 2.7-5.7 1.5-1.5-1.5-1.1-4.2 1.3-7.5 2.1-2.9 5.3-5.7 9.1-7.8.6-.3.9-.9.7-1.5-.2-.6-.7-1-1.4-1-6.4 0-12 5.1-14.2 10.4-1.9 4.5-.6 9.5 3.1 12.3 2.6 2 5.9 2.3 9 .9 4.2-1.9 9.3-6.9 13.9-13.4 1.2-1.7 1.5-3.5.7-4.4-.3-.4-.7-.6-1.1-.73z" />
    </svg>
  );
}

function AmazonIcon({ className = 'size-5 sm:size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.82 12.35c-.07.41-.05.69.05.84.11.15.35.23.73.23.47 0 .94-.13 1.41-.38.48-.25.88-.58 1.2-.99.04.18.06.34.06.48 0 .42-.11.75-.32 1-.22.25-.56.45-1.02.62-.47.16-1.06.25-1.78.25-.66 0-1.22-.1-1.68-.3-.46-.2-.8-.49-1.03-.86-.23-.37-.34-.84-.34-1.4 0-.32.05-.69.14-1.12.09-.43.21-.92.36-1.47l.48-1.78c.11-.42.17-.8.17-1.14 0-.39-.12-.66-.35-.81-.23-.15-.65-.23-1.26-.23-.42 0-.84.06-1.26.17-.42.11-.79.28-1.12.51l-.25-.99c.43-.24.96-.44 1.58-.6.62-.16 1.25-.24 1.89-.24.92 0 1.58.18 1.98.54.4.36.6 1.01.6 1.95 0 .28-.03.62-.09 1.02l-.46 1.76c-.05.21-.08.41-.08.61 0 .22.06.37.18.45.12.08.33.12.63.12.37 0 .74-.09 1.11-.27.37-.18.67-.42.9-.72l.24.47c-.24.38-.59.7-1.05.96-.46.26-.97.39-1.53.39-.45 0-.8-.1-1.05-.29-.25-.19-.4-.51-.45-.96z" />
      <path d="M20.66 17.22c-2.88 2.12-7.07 3.24-10.66 3.24-5.04 0-9.56-1.92-12.98-5.14-.26-.24-.03-.58.28-.39 3.69 2.14 8.24 3.42 12.93 3.42 3.19 0 6.91-.77 10.15-2.39.49-.24.87.38.28.86z" />
      <path d="M21.94 15.93c-.36-.46-2.39-.33-3.3-.22-.27.03-.32-.2-.07-.37 1.63-1.14 4.29-.81 4.59-.44.3.38-.08 3.05-1.61 4.31-.24.2-.42.09-.29-.17.44-.89 1.04-2.65.68-3.11z" />
    </svg>
  );
}

function TikTokBusinessIcon({ className = 'size-5 sm:size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43 6.3 6.3 0 0 0 1.85-4.42V8.82a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.89-.25z" />
    </svg>
  );
}

function AppleIcon({ className = 'size-5 sm:size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-.99 1.71-.86 2.72.99.08 2.02-.51 2.56-1.22z" />
    </svg>
  );
}

function MetaIcon({ className = 'size-5 sm:size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6.438 5.438C3.896 5.438 1.5 7.643 1.5 11.235c0 4.248 3.125 7.327 6.096 7.327 2.225 0 3.655-1.258 4.404-2.258.75 1 2.18 2.258 4.404 2.258 2.971 0 6.096-3.079 6.096-7.327 0-3.592-2.396-5.797-4.938-5.797-2.378 0-3.957 1.677-4.664 2.766-.707-1.089-2.286-2.766-4.664-2.766h.204zm-.094 2.062c1.782 0 3.141 1.487 3.864 2.852-1.036 1.777-2.274 3.738-4.048 3.738-1.897 0-3.66-1.745-3.66-4.855 0-2.457 1.428-3.735 3.844-3.735zm11.312 0c2.416 0 3.844 1.278 3.844 3.735 0 3.11-1.763 4.855-3.66 4.855-1.774 0-3.012-1.961-4.048-3.738.723-1.365 2.082-2.852 3.864-2.852z" />
    </svg>
  );
}

function GoogleIcon({ className = 'size-5 sm:size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

function ShopifyIcon({ className = 'size-5 sm:size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.16 6.87l-2.07-.63c-.02-.13-.05-.28-.09-.43-.33-1.28-.97-2.37-1.89-3.08C14.18 2.01 13.06 1.7 12 1.7c-1.07 0-2.18.31-3.11 1.03-.92.71-1.56 1.8-1.89 3.08-.04.15-.07.3-.09.43l-2.07.63c-.45.14-.72.6-.62 1.06l2.36 12.02c.08.4.43.7.84.7h9.16c.41 0 .76-.3.84-.7l2.36-12.02c.1-.46-.17-.92-.62-1.06zM12 3.2c.69 0 1.41.22 2.01.69.61.47 1.05 1.21 1.29 2.14l-6.6 2c.24-.93.68-1.67 1.29-2.14.6-.47 1.32-.69 2.01-.69z" />
    </svg>
  );
}

function GymsharkIcon({ className = 'size-5 sm:size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.5l2.4 4.8 5.3.8-3.8 3.7.9 5.3-4.8-2.5-4.8 2.5.9-5.3-3.8-3.7 5.3-.8L12 2.5z" />
    </svg>
  );
}

function LululemonIcon({ className = 'size-5 sm:size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 3C7.58 3 4 6.58 4 11c0 2.22.9 4.23 2.36 5.68.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41C6.6 14.1 6 12.62 6 11c0-3.31 2.69-6 6-6s6 2.69 6 6c0 1.62-.6 3.1-1.77 4.27-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0C19.1 15.23 20 13.22 20 11c0-4.42-3.58-8-8-8zm0 4.5c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5z" />
    </svg>
  );
}

function SkimsIcon({ className = 'size-5 sm:size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M8 9.5c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2 0 1.7-2 2-4 2.5-2 .5-4 .8-4 2.5 0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2" strokeLinecap="round" />
    </svg>
  );
}

function LiquidDeathIcon({ className = 'size-5 sm:size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2a8 8 0 0 0-8 8c0 3.2 1.8 6 4.5 7.3V20a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-2.7c2.7-1.3 4.5-4.1 4.5-7.3a8 8 0 0 0-8-8zm-3 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
    </svg>
  );
}

function GlossierIcon({ className = 'size-5 sm:size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7a5 5 0 0 0-5 5c0 2.8 2.2 5 5 5 2.5 0 4.5-1.8 4.9-4.2H12" strokeLinecap="round" />
    </svg>
  );
}

function StripeIcon({ className = 'size-5 sm:size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.8 19.3c0-2.4-1.3-3.6-3.8-3.6-2 0-4.4.9-6.3 2.1l-.8-2.6c2.1-1.2 5.1-2 7.7-2 4.6 0 7.3 2.2 7.3 6.3v8.5h-3.9v-2c-1.4 1.5-3.5 2.3-5.5 2.3-3.3 0-5.5-2-5.5-4.8 0-3.3 2.7-4.8 7.3-4.8h3.5v-1.4zm-3.8 6.4c1.8 0 3.5-.9 3.8-2.3v-1.8h-3.2c-2.4 0-3.7.8-3.7 2.2 0 1.2.9 1.9 3.1 1.9z" />
    </svg>
  );
}

function YouTubeIcon({ className = 'size-5 sm:size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.5 7.2c-.2-.9-.9-1.6-1.8-1.8C18.1 5 12 5 12 5s-6.1 0-7.7.4c-.9.2-1.6.9-1.8 1.8C2 8.8 2 12 2 12s0 3.2.5 4.8c.2.9.9 1.6 1.8 1.8 1.6.4 7.7.4 7.7.4s6.1 0 7.7-.4c.9-.2 1.6-.9 1.8-1.8.5-1.6.5-4.8.5-4.8s0-3.2-.5-4.8zm-11.5 8V8.8l5.5 3.2-5.5 3.2z" />
    </svg>
  );
}

function PinterestIcon({ className = 'size-5 sm:size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.2 2.6 7.8 6.3 9.3-.1-.8-.2-2 0-2.9l1.4-6s-.4-.7-.4-1.8c0-1.7 1-3 2.2-3 .9 0 1.4.7 1.4 1.5 0 1-.6 2.3-.9 3.6-.3 1.1.6 2 1.6 2 2 0 3.5-2.1 3.5-5.1 0-2.7-1.9-4.5-4.7-4.5-3.2 0-5.1 2.4-5.1 4.9 0 1 .4 2 1 2.6.1.1.1.2.1.3-.1.4-.3 1.2-.3 1.3-.1.2-.2.2-.4.1-1.6-.7-2.6-3-2.6-4.9 0-4 2.9-7.7 8.4-7.7 4.4 0 7.9 3.2 7.9 7.4 0 4.4-2.8 8-6.6 8-1.3 0-2.5-.7-2.9-1.5l-.8 3.1c-.3 1.1-1.1 2.5-1.6 3.4 1.1.3 2.2.5 3.4.5 5.5 0 10-4.5 10-10S17.52 2 12 2z" />
    </svg>
  );
}

function SnowflakeIcon({ className = 'size-5 sm:size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2v5.2l3.4-3.4 1.4 1.4-3.4 3.4H19v2h-5.6l3.4 3.4-1.4 1.4-3.4-3.4V22h-2v-5.2l-3.4 3.4-1.4-1.4 3.4-3.4H5v-2h5.6L7.2 8.4l1.4-1.4 3.4 3.4V2h2z" />
    </svg>
  );
}

function DuckDBIcon({ className = 'size-5 sm:size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.5 11.8c-.8-1.5-2.3-2.5-4-2.8-2.3-.4-4.6.6-5.8 2.5L7 16c-.8 1.3-.9 2.9-.2 4.2.7 1.3 2 2.1 3.5 2.1h8.2c1.7 0 3-1.3 3-3 0-.8-.3-1.6-.9-2.2l-1.1-5.3zm-6.2 3.4c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z" />
    </svg>
  );
}

function KlaviyoIcon({ className = 'size-5 sm:size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4 6h16l-6 6 6 6H4V6z" />
    </svg>
  );
}

function AllbirdsIcon({ className = 'size-5 sm:size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4 14.5c4-4 8-6 16-6-2 3-5 5-8 7-3 2-6 2-8-1z" />
      <path d="M6 10c2-3 5-4 10-4-3 2-6 3-8 5-1 1-1.5.5-2-1z" opacity="0.6" />
    </svg>
  );
}

function WarbyParkerIcon({ className = 'size-5 sm:size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="7" cy="13" r="4.5" />
      <circle cx="17" cy="13" r="4.5" />
      <path d="M11.5 12c.5-.8 1.5-.8 2 0" />
      <path d="M2.5 12h1M20.5 12h1" />
    </svg>
  );
}

function CasperIcon({ className = 'size-5 sm:size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.38 5.38 0 0 1-4.4 2.36 5.5 5.5 0 0 1-5.5-5.5c0-1.82.88-3.43 2.25-4.43A9.22 9.22 0 0 0 12 3z" />
    </svg>
  );
}

function PostgreSQLIcon({ className = 'size-5 sm:size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 4c-4.4 0-8 3.6-8 8 0 3.1 1.8 5.8 4.4 7.1V22h2.2v-2.9c.5.1.9.1 1.4.1s.9 0 1.4-.1V22h2.2v-2.9c2.6-1.3 4.4-4 4.4-7.1 0-4.4-3.6-8-8-8zm-2.5 7.5c.7 0 1.2.6 1.2 1.2s-.6 1.2-1.2 1.2-1.2-.6-1.2-1.2.5-1.2 1.2-1.2zm5 0c.7 0 1.2.6 1.2 1.2s-.6 1.2-1.2 1.2-1.2-.6-1.2-1.2.5-1.2 1.2-1.2z" />
    </svg>
  );
}

function WooCommerceIcon({ className = 'size-5 sm:size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21 6H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-13 8l-2-5h1.5l1.2 3.6 1.1-3.6h1.4l-2 5H8zm6 0l-2-5h1.5l1.2 3.6 1.1-3.6h1.4l-2 5H14z" />
    </svg>
  );
}

function SnapchatIcon({ className = 'size-5 sm:size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 4.5c-3 0-5.2 2.1-5.2 5.1 0 .9.3 2 .3 2.4 0 .2-.2.4-.4.5-.7.3-1.5.8-1.5 1.5 0 .6.6.9 1.2.9.2 0 .4 0 .5-.1.5-.3 1-.1 1.2.3.4.7.9 1.4 1.9 1.4.3 0 .7-.1 1.2-.3.6-.3 1.2-.4 1.8-.4.6 0 1.2.1 1.8.4.5.2.9.3 1.2.3 1 0 1.5-.7 1.9-1.4.2-.4.7-.6 1.2-.3.1.1.3.1.5.1.6 0 1.2-.3 1.2-.9 0-.7-.8-1.2-1.5-1.5-.2-.1-.4-.3-.4-.5 0-.4.3-1.5.3-2.4 0-3-2.2-5.1-5.2-5.1z" />
    </svg>
  );
}

// =============================================================================
// 6 Columns of 4 Rotating Brands (24 World-Class Brands & Ad Platforms)
// =============================================================================

export const fullBleedLogoGroups: React.ReactNode[][] = [
  // Column 1: Nike / Meta / Gymshark / Stripe
  [
    <BrandItem key="nike" icon={<NikeIcon />} name="Nike" />,
    <BrandItem key="meta" icon={<MetaIcon />} name="Meta Ads" />,
    <BrandItem key="gymshark" icon={<GymsharkIcon />} name="Gymshark" />,
    <BrandItem key="stripe" icon={<StripeIcon />} name="Stripe" />,
  ],
  // Column 2: Amazon / Google / Lululemon / Snowflake
  [
    <BrandItem key="amazon" icon={<AmazonIcon />} name="Amazon" />,
    <BrandItem key="google" icon={<GoogleIcon />} name="Google Ads" />,
    <BrandItem key="lululemon" icon={<LululemonIcon />} name="Lululemon" />,
    <BrandItem key="snowflake" icon={<SnowflakeIcon />} name="Snowflake" />,
  ],
  // Column 3: TikTok Business / Shopify Plus / SKIMS / DuckDB
  [
    <BrandItem key="tiktok" icon={<TikTokBusinessIcon />} name="TikTok Business" />,
    <BrandItem key="shopify" icon={<ShopifyIcon />} name="Shopify Plus" />,
    <BrandItem key="skims" icon={<SkimsIcon />} name="SKIMS" />,
    <BrandItem key="duckdb" icon={<DuckDBIcon />} name="DuckDB" />,
  ],
  // Column 4: Apple / YouTube Ads / Liquid Death / PostgreSQL
  [
    <BrandItem key="apple" icon={<AppleIcon />} name="Apple" />,
    <BrandItem key="youtube" icon={<YouTubeIcon />} name="YouTube Ads" />,
    <BrandItem key="liquiddeath" icon={<LiquidDeathIcon />} name="Liquid Death" />,
    <BrandItem key="postgres" icon={<PostgreSQLIcon />} name="PostgreSQL" />,
  ],
  // Column 5: Allbirds / Pinterest / Glossier / BigCommerce
  [
    <BrandItem key="allbirds" icon={<AllbirdsIcon />} name="Allbirds" />,
    <BrandItem key="pinterest" icon={<PinterestIcon />} name="Pinterest" />,
    <BrandItem key="glossier" icon={<GlossierIcon />} name="Glossier" />,
    <BrandItem key="woocommerce" icon={<WooCommerceIcon />} name="WooCommerce" />,
  ],
  // Column 6: Warby Parker / Snapchat / Casper / Klaviyo
  [
    <BrandItem key="warbyparker" icon={<WarbyParkerIcon />} name="Warby Parker" />,
    <BrandItem key="snapchat" icon={<SnapchatIcon />} name="Snapchat" />,
    <BrandItem key="casper" icon={<CasperIcon />} name="Casper" />,
    <BrandItem key="klaviyo" icon={<KlaviyoIcon />} name="Klaviyo" />,
  ],
];

export function EcosystemStackedLogos() {
  return (
    <section className="py-12 sm:py-16 md:py-20 border-b border-border/60 bg-muted/10 relative overflow-hidden w-full">
      {/* Bold Statement Header: Spans left to right across the website */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full mb-10 sm:mb-14">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-5 border-b border-border/60">
          <div className="space-y-2 max-w-5xl">
            <div className="flex items-center gap-2 font-mono text-[11px] sm:text-xs font-bold text-primary uppercase tracking-[0.2em]">
              <span className="inline-block size-1.5 rounded-full bg-primary animate-pulse" />
              GLOBAL AD DECISION ECOSYSTEM
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-orbitron font-black tracking-tight text-foreground uppercase leading-[1.06]">
              Integrated with Market Leaders &amp; Ad Networks
            </h2>
          </div>
          <div className="font-mono text-[11px] sm:text-xs text-muted-foreground tracking-widest uppercase shrink-0 pb-1">
            [ 24+ CHANNELS &bull; LIVE TELEMETRY ]
          </div>
        </div>
      </div>

      {/* FULL-BLEED GRID: Extends from extreme left to extreme right of the entire website */}
      <div className="w-full relative overflow-x-auto no-scrollbar">
        <div className="min-w-[860px] md:min-w-full w-full">
          <StackedLogos
            logoGroups={fullBleedLogoGroups}
            duration={24}
            stagger={1.2}
            fullWidth={true}
          />
        </div>
      </div>
    </section>
  );
}
