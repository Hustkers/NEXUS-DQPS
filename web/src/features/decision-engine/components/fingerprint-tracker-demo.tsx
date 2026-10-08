'use client';

import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  IconFingerprint,
  IconShieldCheck,
  IconNetwork,
  IconArrowRight,
  IconCopy,
  IconCheck,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconCpu,
  IconScale,
  IconBrandGoogle,
  IconBrandMeta,
  IconBrandTiktok,
  IconShoppingCart,
  IconCode,
  IconCalculator,
  IconInfoCircle,
  IconLock,
  IconServer
} from '@tabler/icons-react';

export interface DeviceEntropyProfile {
  id: string;
  name: string;
  deviceType: 'desktop' | 'mobile';
  os: string;
  browser: string;
  gpuRenderer: string;
  canvasHash: string;
  audioHash: string;
  screenResolution: string;
  colorDepth: string;
  hardwareConcurrency: number;
  deviceMemoryGb: number;
  ipSubnet: string;
  edgePop: string;
  edgeLatencyMs: number;
  fingerprintId: string;
  confidenceScore: number;
}

export const SAMPLE_DEVICES: DeviceEntropyProfile[] = [
  {
    id: 'macbook-m3',
    name: 'MacBook Pro 16" (M3 Max)',
    deviceType: 'desktop',
    os: 'macOS 15.1 Sequoia',
    browser: 'Safari 18.2 / WebKit 605.1.15',
    gpuRenderer: 'Apple M3 Max GPU (Metal 3.2)',
    canvasHash: 'cv2_8f4a19e2c0b7',
    audioHash: 'au_0.00018492f1',
    screenResolution: '3456 x 2234 @ 2x',
    colorDepth: '30-bit (P3 Wide Gamut)',
    hardwareConcurrency: 16,
    deviceMemoryGb: 36,
    ipSubnet: '198.51.100.0/24 (Comcast Anycast)',
    edgePop: 'EWR (Newark, NJ)',
    edgeLatencyMs: 14,
    fingerprintId: 'FP-8F92-A74B-M3MAX',
    confidenceScore: 99.8
  },
  {
    id: 'iphone-16',
    name: 'iPhone 16 Pro (A18 Pro)',
    deviceType: 'mobile',
    os: 'iOS 18.2.1',
    browser: 'Mobile Safari 18.2',
    gpuRenderer: 'Apple A18 Pro GPU (Metal 3.2)',
    canvasHash: 'cv2_3c81e9f42b89',
    audioHash: 'au_0.00020117d9',
    screenResolution: '2622 x 1206 @ 3x',
    colorDepth: '24-bit (Display P3)',
    hardwareConcurrency: 6,
    deviceMemoryGb: 8,
    ipSubnet: '172.56.21.0/24 (T-Mobile 5G Edge)',
    edgePop: 'SFO (San Francisco, CA)',
    edgeLatencyMs: 22,
    fingerprintId: 'FP-3C81-992F-A18PRO',
    confidenceScore: 99.4
  },
  {
    id: 'thinkpad-x1',
    name: 'ThinkPad X1 Carbon Gen 12',
    deviceType: 'desktop',
    os: 'Windows 11 Pro 24H2',
    browser: 'Chrome 131.0.6778 (Blink Engine)',
    gpuRenderer: 'Intel Arc Graphics (Direct3D11)',
    canvasHash: 'cv2_d489b0151f88',
    audioHash: 'au_0.00015920a3',
    screenResolution: '2880 x 1800 @ 2x',
    colorDepth: '24-bit (sRGB)',
    hardwareConcurrency: 16,
    deviceMemoryGb: 32,
    ipSubnet: '108.162.193.0/24 (AT&T Fiber Catchment)',
    edgePop: 'ORD (Chicago, IL)',
    edgeLatencyMs: 18,
    fingerprintId: 'FP-D489-B015-INTEL',
    confidenceScore: 99.1
  }
];

export interface MultiTouchJourney {
  id: string;
  visitorId: string;
  sku: string;
  productName: string;
  retailPrice: number;
  unitCogs: number;
  gstPct: number;
  freightCost: number;
  freightZone: string;
  steps: {
    stage: 'Discovery' | 'Intent' | 'Retargeting' | 'Conversion';
    platform: 'tiktok' | 'google' | 'meta' | 'shopify';
    platformLabel: string;
    tokenType: string;
    tokenValue: string;
    campaign: string;
    costInr: number;
    timestamp: string;
    description: string;
  }[];
  shapleyWeights: {
    tiktok: number;
    google: number;
    meta: number;
  };
}

export const SAMPLE_JOURNEYS: MultiTouchJourney[] = [
  {
    id: 'journey-jordan',
    visitorId: '6ec1bd17-e30a-4d1d-a5ba-e8043bf8507a',
    sku: '310805-137',
    productName: 'Air Jordan 10 Retro',
    retailPrice: 15995,
    unitCogs: 5800,
    gstPct: 18,
    freightCost: 180,
    freightZone: 'Zone 2 (Intra-Regional Express)',
    steps: [
      {
        stage: 'Discovery',
        platform: 'tiktok',
        platformLabel: 'TikTok Ads',
        tokenType: 'ttclid',
        tokenValue: 'tt_cl_f7916968be29_jordan',
        campaign: 'tiktok-jordan-trend',
        costInr: 420.0,
        timestamp: '2026-10-01 19:15:45 UTC',
        description: 'Preroll 15s video ad impression and hook interaction. First touch discovery.'
      },
      {
        stage: 'Intent',
        platform: 'google',
        platformLabel: 'Google Search Ads',
        tokenType: 'gclid',
        tokenValue: 'CjwKCAiA2b163dba9bd5_gclid_search',
        campaign: 'google-search-footwear',
        costInr: 650.0,
        timestamp: '2026-10-02 08:30:12 UTC',
        description: 'High-intent search query for Air Jordan 10 Retro colorways on Google SERP.'
      },
      {
        stage: 'Retargeting',
        platform: 'meta',
        platformLabel: 'Meta Advantage+',
        tokenType: 'fbclid',
        tokenValue: 'fb.1.1791373540.82b9c0f599c0_reels',
        campaign: 'meta-retargeting-catalog',
        costInr: 880.0,
        timestamp: '2026-10-04 18:45:22 UTC',
        description: 'Dynamic Product Ad (DPA) carousel click on Instagram Feed with urgency trigger.'
      },
      {
        stage: 'Conversion',
        platform: 'shopify',
        platformLabel: 'Shopify D2C Storefront',
        tokenType: 'order_id',
        tokenValue: 'ORD-EAE822C3',
        campaign: 'store.niked2c.com/checkout',
        costInr: 0,
        timestamp: '2026-10-04 20:00:53 UTC',
        description: 'Completed checkout for 1 pair of Air Jordan 10 Retro via UPI/Card.'
      }
    ],
    shapleyWeights: {
      tiktok: 0.30,
      google: 0.25,
      meta: 0.45
    }
  },
  {
    id: 'journey-airmax',
    visitorId: 'e1049977-1952-475f-93bb-0743c6d3f482',
    sku: 'AH8050-100',
    productName: 'Nike Air Max 270',
    retailPrice: 13995,
    unitCogs: 4800,
    gstPct: 18,
    freightCost: 180,
    freightZone: 'Zone 2 (Intra-Regional Express)',
    steps: [
      {
        stage: 'Discovery',
        platform: 'tiktok',
        platformLabel: 'TikTok Shop / Spark Ad',
        tokenType: 'ttclid',
        tokenValue: 'tt_cl_8914b1c20f11_am270',
        campaign: 'tiktok-airmax-lifestyle',
        costInr: 380.0,
        timestamp: '2026-09-27 20:46:43 UTC',
        description: 'UGC creator styling video click. User browses sizing and closes browser.'
      },
      {
        stage: 'Intent',
        platform: 'google',
        platformLabel: 'Google Performance Max',
        tokenType: 'gclid',
        tokenValue: 'CjwKCAiB5p284cca7ef1_gclid_pmax',
        campaign: 'google-react-intent',
        costInr: 590.0,
        timestamp: '2026-09-29 11:15:30 UTC',
        description: 'Shopping tab comparison click with price parity check against retail.'
      },
      {
        stage: 'Retargeting',
        platform: 'meta',
        platformLabel: 'Meta Instagram Stories',
        tokenType: 'fbclid',
        tokenValue: 'fb.1.1802947115.34f8a12e88d1_story',
        campaign: 'meta-airmax-viral',
        costInr: 740.0,
        timestamp: '2026-10-04 07:42:10 UTC',
        description: 'Personalized footwear size alert story ad click driving direct cart recovery.'
      },
      {
        stage: 'Conversion',
        platform: 'shopify',
        platformLabel: 'Shopify D2C Storefront',
        tokenType: 'order_id',
        tokenValue: 'ORD-B094B65A',
        campaign: 'store.niked2c.com/checkout',
        costInr: 0,
        timestamp: '2026-10-04 09:16:16 UTC',
        description: 'Verified checkout for 1 pair of Nike Air Max 270 (Triple Black).'
      }
    ],
    shapleyWeights: {
      tiktok: 0.28,
      google: 0.32,
      meta: 0.40
    }
  },
  {
    id: 'journey-airforce',
    visitorId: 'c99a1dbb-4f4d-4944-84fe-4aca2e81969b',
    sku: '315122-001',
    productName: "Nike Air Force 1 '07",
    retailPrice: 7495,
    unitCogs: 3150,
    gstPct: 18,
    freightCost: 180,
    freightZone: 'Zone 2 (Intra-Regional Express)',
    steps: [
      {
        stage: 'Discovery',
        platform: 'meta',
        platformLabel: 'Meta Reels Ad',
        tokenType: 'fbclid',
        tokenValue: 'fb.1.1788291044.55c192f00a89_reels',
        campaign: 'meta-315122-001',
        costInr: 290.0,
        timestamp: '2026-09-30 11:55:20 UTC',
        description: 'Hero classic sneaker video ad on Instagram Reels. User explores color options.'
      },
      {
        stage: 'Intent',
        platform: 'google',
        platformLabel: 'Google Brand Search',
        tokenType: 'gclid',
        tokenValue: 'CjwKCAiC1938fdd19aa2_gclid_brand',
        campaign: 'google-brand-airforce',
        costInr: 340.0,
        timestamp: '2026-10-02 14:10:05 UTC',
        description: 'Direct search for "Nike Air Force 1 07 White official site" on Google.'
      },
      {
        stage: 'Retargeting',
        platform: 'tiktok',
        platformLabel: 'TikTok Retargeting',
        tokenType: 'ttclid',
        tokenValue: 'tt_cl_1904fa88bc31_af1',
        campaign: 'tiktok-retarget-shoes',
        costInr: 410.0,
        timestamp: '2026-10-05 16:30:19 UTC',
        description: 'Exclusive member discount ad on TikTok feed driving instant order placement.'
      },
      {
        stage: 'Conversion',
        platform: 'shopify',
        platformLabel: 'Shopify D2C Storefront',
        tokenType: 'order_id',
        tokenValue: 'ORD-74D7CB68',
        campaign: 'store.niked2c.com/checkout',
        costInr: 0,
        timestamp: '2026-10-05 18:12:40 UTC',
        description: 'Completed purchase for 1 pair of Air Force 1 07 White with free Zone 2 delivery.'
      }
    ],
    shapleyWeights: {
      tiktok: 0.35,
      google: 0.30,
      meta: 0.35
    }
  }
];

export function FingerprintTrackerDemo() {
  const [selectedDevice, setSelectedDevice] = useState<DeviceEntropyProfile>(SAMPLE_DEVICES[0]);
  const [selectedJourney, setSelectedJourney] = useState<MultiTouchJourney>(SAMPLE_JOURNEYS[0]);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Financial calculations
  const totalIncurredSpend = useMemo(() => {
    return selectedJourney.steps.reduce((acc, step) => acc + step.costInr, 0);
  }, [selectedJourney]);

  // Double-counting trap calculation:
  // Both Google and Meta claim 100% of the sale value
  const doubleCountedRevenue = selectedJourney.retailPrice * 2;
  const doubleCountedInflationPct = 100.0;
  const doubleCountedRoas = Number((doubleCountedRevenue / totalIncurredSpend).toFixed(2));

  // True GAAP Cash Bank calculation:
  const actualBankReceipts = selectedJourney.retailPrice;
  const deduplicatedRoas = Number((actualBankReceipts / totalIncurredSpend).toFixed(2));
  const netContributionMargin = actualBankReceipts - selectedJourney.unitCogs - selectedJourney.freightCost - (actualBankReceipts * 0.02 + 3);
  const deduplicatedPoas = Number((netContributionMargin / totalIncurredSpend).toFixed(2));

  // Shapley fair-share attributions
  const shapleyAttributions = useMemo(() => {
    return [
      {
        platform: 'TikTok Ads',
        stage: 'Discovery',
        weight: selectedJourney.shapleyWeights.tiktok,
        attributedRevenue: selectedJourney.retailPrice * selectedJourney.shapleyWeights.tiktok,
        spend: selectedJourney.steps.find((s) => s.platform === 'tiktok')?.costInr || 400,
        badgeStyle: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
      },
      {
        platform: 'Google Ads',
        stage: 'Search Intent',
        weight: selectedJourney.shapleyWeights.google,
        attributedRevenue: selectedJourney.retailPrice * selectedJourney.shapleyWeights.google,
        spend: selectedJourney.steps.find((s) => s.platform === 'google')?.costInr || 600,
        badgeStyle: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
      },
      {
        platform: 'Meta Ads',
        stage: 'Retargeting',
        weight: selectedJourney.shapleyWeights.meta,
        attributedRevenue: selectedJourney.retailPrice * selectedJourney.shapleyWeights.meta,
        spend: selectedJourney.steps.find((s) => s.platform === 'meta')?.costInr || 800,
        badgeStyle: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
      }
    ];
  }, [selectedJourney]);

  return (
    <div className='flex flex-col gap-8 w-full font-sans text-zinc-900 dark:text-zinc-100'>
      {/* 1. EDITORIAL HEADER & TELEMETRY STRIP */}
      <div className='flex flex-col gap-3 pb-6 border-b border-zinc-200 dark:border-zinc-800'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
          <div>
            <div className='flex items-center gap-2 mb-1.5'>
              <span className='text-[11px] font-mono font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400'>
                Section 5.4 Specification • First-Party Ingestion
              </span>
              <span className='size-1.5 rounded-full bg-emerald-500' />
              <span className='text-[11px] font-mono text-emerald-600 dark:text-emerald-400'>
                Edge Online
              </span>
            </div>
            <h1 className='text-2xl md:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50'>
              Fingerprint Identity &amp; Cross-Platform Tracking
            </h1>
            <p className='text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl mt-1 leading-relaxed'>
              Deterministic First-Party Edge Resolution, Asymmetric Walled-Garden Ingestion &amp; Shapley GAAP Deduplication.
            </p>
          </div>

          <div className='flex items-center gap-2 shrink-0'>
            <div className='p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col items-end'>
              <span className='text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider'>
                Lakehouse Ground Truth
              </span>
              <span className='text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100'>
                362 Sessions • 1,259 Events
              </span>
            </div>
          </div>
        </div>

        {/* Global Compliance Bar */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2'>
          <div className='p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60'>
            <div className='text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase'>Privacy Standard</div>
            <div className='text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1'>
              <IconShieldCheck className='size-3.5' />
              Zero-GPS (GDPR Rec. 30)
            </div>
          </div>
          <div className='p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60'>
            <div className='text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase'>Subnet Anonymity</div>
            <div className='text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 flex items-center gap-1'>
              <IconNetwork className='size-3.5' />
              100% Masked /24 CIDR
            </div>
          </div>
          <div className='p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60'>
            <div className='text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase'>Asymmetric Ingestion</div>
            <div className='text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 flex items-center gap-1'>
              <IconLock className='size-3.5' />
              gclid • fbclid • ttclid
            </div>
          </div>
          <div className='p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60'>
            <div className='text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase'>Attribution Engine</div>
            <div className='text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 flex items-center gap-1'>
              <IconScale className='size-3.5' />
              Shapley Deduplication
            </div>
          </div>
        </div>
      </div>

      {/* 2. BENTO ROW 1: WALLED GARDEN TOKENS & HARDWARE ENTROPY */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* BENTO CARD 1: WALLED GARDEN ASYMMETRIC CRYPTOGRAPHY (7 Cols) */}
        <div className='lg:col-span-7 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 flex flex-col justify-between'>
          <div>
            <div className='flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 mb-4'>
              <div className='flex items-center gap-2'>
                <IconLock className='size-4 text-zinc-700 dark:text-zinc-300' />
                <h2 className='text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100'>
                  Walled Garden Click Token Isolation (§5.4.1)
                </h2>
              </div>
              <span className='text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'>
                Asymmetric Cryptography
              </span>
            </div>

            <p className='text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4'>
              Ad platforms encrypt click tokens with proprietary private keys. Google cannot decrypt a Meta <code className='text-zinc-800 dark:text-zinc-200 font-mono'>fbclid</code>, Meta cannot decrypt a Google <code className='text-zinc-800 dark:text-zinc-200 font-mono'>gclid</code>, and networks never expose raw IP addresses or user IDs. NEXUS intercepts and pairs tokens at the <strong className='text-zinc-900 dark:text-zinc-100 font-medium'>First-Party Storefront Edge</strong> (<code className='font-mono'>store.niked2c.com</code>).
            </p>

            <div className='space-y-2.5'>
              <div className='p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex flex-col gap-1.5'>
                <div className='flex items-center justify-between text-xs'>
                  <div className='flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200'>
                    <IconBrandGoogle className='size-3.5 text-emerald-600' />
                    Google Ads / YouTube Click Identifier
                  </div>
                  <button
                    onClick={() => handleCopy('CjwKCAiA2b163dba9bd5_gclid_search', 'gclid')}
                    className='text-[11px] font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1'
                  >
                    {copiedToken === 'gclid' ? <IconCheck className='size-3 text-emerald-600' /> : <IconCopy className='size-3' />}
                    Copy
                  </button>
                </div>
                <div className='flex items-center gap-2'>
                  <kbd className='font-mono text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 break-all select-all'>
                    gclid=CjwKCAiA2b163dba9bd5_gclid_search
                  </kbd>
                </div>
                <span className='text-[10px] font-mono text-zinc-500 dark:text-zinc-400'>
                  Payload: Encrypted with Google KMS private key • Zero PII exposed to merchant
                </span>
              </div>

              <div className='p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex flex-col gap-1.5'>
                <div className='flex items-center justify-between text-xs'>
                  <div className='flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200'>
                    <IconBrandMeta className='size-3.5 text-blue-600' />
                    Meta Advantage+ (FB/IG) Click Identifier
                  </div>
                  <button
                    onClick={() => handleCopy('fb.1.1791373540.82b9c0f599c0_reels', 'fbclid')}
                    className='text-[11px] font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1'
                  >
                    {copiedToken === 'fbclid' ? <IconCheck className='size-3 text-emerald-600' /> : <IconCopy className='size-3' />}
                    Copy
                  </button>
                </div>
                <div className='flex items-center gap-2'>
                  <kbd className='font-mono text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 break-all select-all'>
                    fbclid=fb.1.1791373540.82b9c0f599c0_reels
                  </kbd>
                </div>
                <span className='text-[10px] font-mono text-zinc-500 dark:text-zinc-400'>
                  Payload: Format v1 epoch timestamp + cryptographic hash HMAC-SHA256
                </span>
              </div>

              <div className='p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex flex-col gap-1.5'>
                <div className='flex items-center justify-between text-xs'>
                  <div className='flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200'>
                    <IconBrandTiktok className='size-3.5 text-rose-600' />
                    TikTok Ads Click Identifier
                  </div>
                  <button
                    onClick={() => handleCopy('tt_cl_f7916968be29_jordan', 'ttclid')}
                    className='text-[11px] font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1'
                  >
                    {copiedToken === 'ttclid' ? <IconCheck className='size-3 text-emerald-600' /> : <IconCopy className='size-3' />}
                    Copy
                  </button>
                </div>
                <div className='flex items-center gap-2'>
                  <kbd className='font-mono text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 break-all select-all'>
                    ttclid=tt_cl_f7916968be29_jordan
                  </kbd>
                </div>
                <span className='text-[10px] font-mono text-zinc-500 dark:text-zinc-400'>
                  Payload: ByteDance short-lived session token passed via TikTok Pixel SDK
                </span>
              </div>
            </div>
          </div>

          <div className='mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400'>
            <span>Reverse Proxy: <code className='text-zinc-800 dark:text-zinc-200'>CF Anycast Worker</code></span>
            <span>Edge Query Parameter Interception: <strong className='text-emerald-600 dark:text-emerald-400'>Active (0ms latency)</strong></span>
          </div>
        </div>

        {/* BENTO CARD 2: HARDWARE ENTROPY & /24 SUBNET RESOLUTION (5 Cols) */}
        <div className='lg:col-span-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 flex flex-col justify-between'>
          <div>
            <div className='flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 mb-4'>
              <div className='flex items-center gap-2'>
                <IconFingerprint className='size-4 text-zinc-700 dark:text-zinc-300' />
                <h2 className='text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100'>
                  Hardware Entropy &amp; /24 Subnet (§5.3)
                </h2>
              </div>
              <span className='text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'>
                Zero-GPS
              </span>
            </div>

            {/* Device Switcher */}
            <div className='flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-md mb-4 text-xs font-mono'>
              {SAMPLE_DEVICES.map((dev) => (
                <button
                  key={dev.id}
                  onClick={() => setSelectedDevice(dev)}
                  className={cn(
                    'flex-1 py-1.5 px-2 rounded text-center transition-colors truncate',
                    selectedDevice.id === dev.id
                      ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 font-semibold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  )}
                >
                  {dev.deviceType === 'desktop' ? (
                    <IconDeviceDesktop className='size-3 inline mr-1' />
                  ) : (
                    <IconDeviceMobile className='size-3 inline mr-1' />
                  )}
                  {dev.name.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Entropy Telemetry Table */}
            <div className='space-y-2 text-xs font-mono'>
              <div className='flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60'>
                <span className='text-zinc-500 dark:text-zinc-400'>Cluster ID:</span>
                <kbd className='px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700'>
                  {selectedDevice.fingerprintId}
                </kbd>
              </div>
              <div className='flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60'>
                <span className='text-zinc-500 dark:text-zinc-400'>Canvas Hash:</span>
                <kbd className='px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700'>
                  {selectedDevice.canvasHash}
                </kbd>
              </div>
              <div className='flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60'>
                <span className='text-zinc-500 dark:text-zinc-400'>Audio Buffer:</span>
                <kbd className='px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700'>
                  {selectedDevice.audioHash}
                </kbd>
              </div>
              <div className='flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60'>
                <span className='text-zinc-500 dark:text-zinc-400'>GPU Architecture:</span>
                <span className='text-zinc-800 dark:text-zinc-200 truncate max-w-[180px]'>
                  {selectedDevice.gpuRenderer}
                </span>
              </div>
              <div className='flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60'>
                <span className='text-zinc-500 dark:text-zinc-400'>IPv4 Subnet:</span>
                <kbd className='px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold'>
                  {selectedDevice.ipSubnet.split(' ')[0]}
                </kbd>
              </div>
              <div className='flex items-center justify-between py-1.5'>
                <span className='text-zinc-500 dark:text-zinc-400'>Edge PoP / Latency:</span>
                <span className='text-zinc-800 dark:text-zinc-200'>
                  {selectedDevice.edgePop} • {selectedDevice.edgeLatencyMs}ms
                </span>
              </div>
            </div>
          </div>

          <div className='mt-4 p-2.5 rounded bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 flex items-start gap-2'>
            <IconInfoCircle className='size-3.5 shrink-0 mt-0.5 text-zinc-500' />
            <span>
              <strong className='text-zinc-900 dark:text-zinc-100'>k-Anonymity Guard:</strong> Grouped across 256 hosts. Zero GPS coordinates recorded to eliminate privacy prompt drop-off and ensure GDPR Recital 30 compliance.
            </span>
          </div>
        </div>
      </div>

      {/* 3. BENTO CARD 3: MULTI-TOUCH SEQUENTIAL PATHING */}
      <div className='rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 flex flex-col gap-6'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800'>
          <div>
            <div className='flex items-center gap-2 mb-1'>
              <IconNetwork className='size-4 text-zinc-700 dark:text-zinc-300' />
              <h2 className='text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100'>
                Multi-Touch Sequential Pathing (§5.4.3)
              </h2>
            </div>
            <p className='text-xs text-zinc-600 dark:text-zinc-400'>
              Stitching anonymous customer journey across disparate ad network impressions and first-party checkout.
            </p>
          </div>

          {/* Journey Selector */}
          <div className='flex items-center gap-1.5 text-xs font-mono'>
            <span className='text-zinc-500 dark:text-zinc-400 mr-1'>Catalog Target:</span>
            {SAMPLE_JOURNEYS.map((j) => (
              <button
                key={j.id}
                onClick={() => setSelectedJourney(j)}
                className={cn(
                  'px-2.5 py-1 rounded border text-xs transition-colors',
                  selectedJourney.id === j.id
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-semibold'
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                )}
              >
                {j.productName} (₹{j.retailPrice.toLocaleString('en-IN')})
              </button>
            ))}
          </div>
        </div>

        {/* 4-Stage Step Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          {selectedJourney.steps.map((step, idx) => {
            const isLast = idx === selectedJourney.steps.length - 1;
            return (
              <div
                key={step.stage}
                className={cn(
                  'p-4 rounded-lg border flex flex-col justify-between gap-3 transition-all',
                  isLast
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40'
                )}
              >
                <div>
                  <div className='flex items-center justify-between text-xs font-mono mb-2'>
                    <span className='font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400'>
                      0{idx + 1} • {step.stage}
                    </span>
                    {step.costInr > 0 ? (
                      <span className='text-zinc-700 dark:text-zinc-300 font-semibold'>
                        ₹{step.costInr.toFixed(2)}
                      </span>
                    ) : (
                      <span className='text-emerald-600 dark:text-emerald-400 font-semibold'>
                        Order Confirmed
                      </span>
                    )}
                  </div>

                  <h3 className='text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-1.5'>
                    {step.platform === 'tiktok' && <IconBrandTiktok className='size-3.5 text-rose-600' />}
                    {step.platform === 'google' && <IconBrandGoogle className='size-3.5 text-emerald-600' />}
                    {step.platform === 'meta' && <IconBrandMeta className='size-3.5 text-blue-600' />}
                    {step.platform === 'shopify' && <IconShoppingCart className='size-3.5 text-emerald-600' />}
                    {step.platformLabel}
                  </h3>

                  <p className='text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3'>
                    {step.description}
                  </p>
                </div>

                <div className='pt-2.5 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col gap-1 text-[11px] font-mono'>
                  <div className='flex items-center justify-between'>
                    <span className='text-zinc-500 dark:text-zinc-400'>{step.tokenType}:</span>
                    <kbd className='px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 truncate max-w-[130px]'>
                      {step.tokenValue}
                    </kbd>
                  </div>
                  <div className='text-[10px] text-zinc-400 dark:text-zinc-500 truncate'>
                    {step.timestamp}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Journey Unit Economics Footer */}
        <div className='p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono'>
          <div className='flex items-center gap-4'>
            <span>Visitor ID: <code className='text-zinc-800 dark:text-zinc-200'>{selectedJourney.visitorId.slice(0, 18)}...</code></span>
            <span>SKU: <strong className='text-zinc-900 dark:text-zinc-100'>{selectedJourney.sku}</strong></span>
            <span>MSRP: <strong className='text-zinc-900 dark:text-zinc-100'>₹{selectedJourney.retailPrice.toLocaleString('en-IN')}</strong></span>
          </div>
          <div className='flex items-center gap-4 text-zinc-600 dark:text-zinc-400'>
            <span>Incurred Ad Spend: <strong className='text-zinc-900 dark:text-zinc-100'>₹{totalIncurredSpend.toFixed(2)}</strong></span>
            <span>Fulfillment: <strong className='text-zinc-900 dark:text-zinc-100'>{selectedJourney.freightZone}</strong></span>
          </div>
        </div>
      </div>

      {/* 4. BENTO ROW 4: THE 200% DOUBLE-COUNTING TRAP VS SHAPLEY GAAP DEDUPLICATION */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* LEFT: THE PLATFORM DOUBLE-COUNTING TRAP (6 Cols) */}
        <div className='lg:col-span-6 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10 p-6 flex flex-col justify-between'>
          <div>
            <div className='flex items-center justify-between pb-3 border-b border-rose-200 dark:border-rose-900/60 mb-4'>
              <div className='flex items-center gap-2'>
                <IconScale className='size-4 text-rose-700 dark:text-rose-400' />
                <h2 className='text-sm font-semibold tracking-tight text-rose-950 dark:text-rose-200'>
                  The Platform Double-Counting Trap (§5.4.2)
                </h2>
              </div>
              <span className='text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800 font-semibold'>
                +100% Phantom Revenue
              </span>
            </div>

            <p className='text-xs text-rose-900/80 dark:text-rose-200/80 leading-relaxed mb-4'>
              Because walled gardens are isolated, each network assumes full 100% conversion credit for the same shoe purchase:
            </p>

            <div className='space-y-2.5 font-mono text-xs'>
              <div className='p-3 rounded-md bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <IconBrandGoogle className='size-3.5 text-emerald-600' />
                  <span>Google Ads Tag Claim:</span>
                </div>
                <strong className='text-rose-700 dark:text-rose-300 font-semibold'>
                  ₹{selectedJourney.retailPrice.toLocaleString('en-IN')} (100% Credit)
                </strong>
              </div>

              <div className='p-3 rounded-md bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <IconBrandMeta className='size-3.5 text-blue-600' />
                  <span>Meta Pixel / CAPI Claim:</span>
                </div>
                <strong className='text-rose-700 dark:text-rose-300 font-semibold'>
                  ₹{selectedJourney.retailPrice.toLocaleString('en-IN')} (100% Credit)
                </strong>
              </div>

              <div className='p-3.5 rounded-md bg-rose-100/60 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 flex flex-col gap-2'>
                <div className='flex items-center justify-between text-rose-950 dark:text-rose-100 font-bold'>
                  <span>Total Platform-Claimed Revenue:</span>
                  <span>₹{doubleCountedRevenue.toLocaleString('en-IN')}</span>
                </div>
                <div className='flex items-center justify-between text-zinc-700 dark:text-zinc-300 text-[11px] pt-1.5 border-t border-rose-200 dark:border-rose-800'>
                  <span>Actual Cash in Bank (GAAP Receipts):</span>
                  <span className='font-semibold text-zinc-900 dark:text-zinc-100'>
                    ₹{actualBankReceipts.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className='flex items-center justify-between text-rose-800 dark:text-rose-300 text-[11px] font-semibold'>
                  <span>Reported Network ROAS:</span>
                  <span>{doubleCountedRoas}x (Artificially Inflated)</span>
                </div>
              </div>
            </div>
          </div>

          <div className='mt-4 pt-3 border-t border-rose-200 dark:border-rose-900/60 text-[11px] text-rose-900/70 dark:text-rose-300/70'>
            Result: Marketers believe ad spend is twice as productive as reality, leading to over-bidding and capital burn.
          </div>
        </div>

        {/* RIGHT: NEXUS SHAPLEY GAAP DEDUPLICATION ENGINE (6 Cols) */}
        <div className='lg:col-span-6 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10 p-6 flex flex-col justify-between'>
          <div>
            <div className='flex items-center justify-between pb-3 border-b border-emerald-200 dark:border-emerald-900/60 mb-4'>
              <div className='flex items-center gap-2'>
                <IconCalculator className='size-4 text-emerald-700 dark:text-emerald-400' />
                <h2 className='text-sm font-semibold tracking-tight text-emerald-950 dark:text-emerald-200'>
                  NEXUS Shapley Counterfactual GAAP Engine (§5.4.4)
                </h2>
              </div>
              <span className='text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 font-semibold'>
                100% GAAP Match
              </span>
            </div>

            <p className='text-xs text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed mb-4'>
              Evaluates cooperative game theory marginal contribution, allocating exactly 100% of realized cash:
            </p>

            <div className='space-y-2.5 font-mono text-xs'>
              {shapleyAttributions.map((item) => (
                <div
                  key={item.platform}
                  className='p-3 rounded-md bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between'
                >
                  <div className='flex items-center gap-2'>
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded border uppercase', item.badgeStyle)}>
                      {(item.weight * 100).toFixed(0)}%
                    </span>
                    <span>{item.platform} ({item.stage}):</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-zinc-500 dark:text-zinc-400'>
                      ₹{item.spend.toFixed(0)} spend &rarr;
                    </span>
                    <strong className='text-emerald-700 dark:text-emerald-300 font-semibold'>
                      ₹{item.attributedRevenue.toFixed(2)}
                    </strong>
                  </div>
                </div>
              ))}

              <div className='p-3.5 rounded-md bg-emerald-100/60 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex flex-col gap-2'>
                <div className='flex items-center justify-between text-emerald-950 dark:text-emerald-100 font-bold'>
                  <span>Sum of Deduplicated Attributions:</span>
                  <span>₹{actualBankReceipts.toLocaleString('en-IN')}.00 (100.0%)</span>
                </div>
                <div className='flex items-center justify-between text-emerald-900 dark:text-emerald-200 text-[11px] pt-1.5 border-t border-emerald-200 dark:border-emerald-800'>
                  <span>True Realized ROAS:</span>
                  <span className='font-bold text-zinc-950 dark:text-zinc-50'>
                    {deduplicatedRoas}x (Reconciled with Cash)
                  </span>
                </div>
                <div className='flex items-center justify-between text-emerald-900 dark:text-emerald-200 text-[11px]'>
                  <span>True Contribution POAS:</span>
                  <span className='font-bold text-zinc-950 dark:text-zinc-50'>
                    {deduplicatedPoas}x (Net of COGS &amp; ₹{selectedJourney.freightCost} Freight)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className='mt-4 pt-3 border-t border-emerald-200 dark:border-emerald-900/60 text-[11px] text-emerald-900/70 dark:text-emerald-300/70'>
            Result: Zero double-counting. Spend allocation is driven by true marginal contribution rather than inflated ad claim vanity metrics.
          </div>
        </div>
      </div>

      {/* 5. BENTO CARD 5: DUCKDB / POSTGRES TELEMETRY SQL INGESTION SNIPPET */}
      <div className='rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 flex flex-col gap-4'>
        <div className='flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800'>
          <div className='flex items-center gap-2'>
            <IconCode className='size-4 text-zinc-700 dark:text-zinc-300' />
            <h2 className='text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100'>
              DuckDB Lakehouse Query: Cookieless Touchpoint Stitching
            </h2>
          </div>
          <span className='text-[10px] font-mono text-zinc-500 dark:text-zinc-400'>
            duckdb: data/dqps.duckdb • Table: unified_commerce_ledger
          </span>
        </div>

        <pre className='p-4 rounded-md bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto border border-zinc-800 leading-relaxed'>
{`-- Step 1: Cluster anonymous touchpoints by /24 subnet and hardware entropy
WITH touchpoint_clusters AS (
  SELECT
    cluster_id,
    subnet_masked,
    channel,
    click_token,   -- gclid, fbclid, ttclid
    cost_micros / 1000000.0 AS spend_inr,
    event_timestamp
  FROM raw_ad_impressions_and_clicks
  WHERE subnet_masked = '198.51.100.0/24'
),

-- Step 2: Join first-party Shopify conversion event with zero userId
order_attribution AS (
  SELECT
    o.order_id,
    o.total_price_inr,
    o.cogs_inr,
    o.freight_inr,
    c.channel,
    c.click_token,
    -- Shapley cooperative game fair-share allocation
    SHAPLEY_MARGINAL_WEIGHT(c.channel, c.event_timestamp, o.created_at) AS shapley_weight
  FROM shopify_orders o
  JOIN touchpoint_clusters c ON o.subnet_masked = c.subnet_masked
  WHERE o.order_id = '${selectedJourney.steps[3].tokenValue}'
)

SELECT
  channel,
  ROUND(SUM(total_price_inr * shapley_weight), 2) AS attributed_revenue_inr,
  ROUND(SUM(total_price_inr * shapley_weight) / NULLIF(SUM(spend_inr), 0), 2) AS deduplicated_roas
FROM order_attribution
GROUP BY channel;`}
        </pre>
      </div>
    </div>
  );
}
