'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';

/**
 * 1. DETERMINISTIC HARDWARE SIGNATURES
 * A hardware profile only provides entropy signals for deterministic matching.
 * It does NOT dictate financial transactions.
 */
export interface DeviceProfile {
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
  fingerprintId: string;
  confidenceScore: number;
}

export const SAMPLE_DEVICES: DeviceProfile[] = [
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
    ipSubnet: '198.51.100.0/24 (Comcast Cable)',
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
    ipSubnet: '172.56.21.0/24 (T-Mobile 5G)',
    fingerprintId: 'FP-3C81-992F-A18PRO',
    confidenceScore: 99.4
  },
  {
    id: 'thinkpad-x1',
    name: 'ThinkPad X1 Carbon Gen 12',
    deviceType: 'desktop',
    os: 'Windows 11 Pro 24H2',
    browser: 'Chrome 131.0.6778 (Blink)',
    gpuRenderer: 'Intel Arc Graphics (Direct3D11)',
    canvasHash: 'cv2_d489b0151f88',
    audioHash: 'au_0.00015920a3',
    screenResolution: '2880 x 1800 @ 2x',
    colorDepth: '24-bit (sRGB)',
    hardwareConcurrency: 16,
    deviceMemoryGb: 32,
    ipSubnet: '108.162.193.0/24 (AT&T Fiber)',
    fingerprintId: 'FP-D489-B015-INTEL',
    confidenceScore: 99.1
  }
];

/**
 * 2. DETERMINISTIC TRANSACTION & AD EVENT FIXTURE
 * Consistent e-commerce transaction across cross-channel attribution tests.
 * Financial metrics stem from the actual purchase event and campaign ledger,
 * NOT the hardware platform.
 */
export interface TransactionFixture {
  orderId: string;
  productTitle: string;
  sku: string;
  asin: string;
  itemPrice: number;
  quantity: number;
  grossRevenue: number;
  cogs: number;
  realizedGrossMargin: number;
  grossMarginPct: number;
  youtubeImpressionCpmCost: number; // CPM ₹24 / 1000 = ₹0.024
  youtubeClickCpcCost: number;      // CPC ₹0.850
  totalAttributedAdSpend: number;   // ₹0.024 + ₹0.850 = ₹0.874
  assistedRoas: number;             // Gross Revenue / Total Ad Spend = 170.00 / 0.874 = 194.51
}

export const DETERMINISTIC_TRANSACTION: TransactionFixture = {
  orderId: 'AMZ-9482-DN77',
  productTitle: "Nike Men's Air Max Dn Running & Street Shoes (Triple Black)",
  sku: 'AH8050-100',
  asin: 'B0CWV8N21K',
  itemPrice: 170.0,
  quantity: 1,
  grossRevenue: 170.0,
  cogs: 76.5,
  realizedGrossMargin: 93.5, // 170.00 - 76.50 = 93.50 (55.0% margin)
  grossMarginPct: 55.0,
  youtubeImpressionCpmCost: 0.024,
  youtubeClickCpcCost: 0.85,
  totalAttributedAdSpend: 0.874,
  assistedRoas: 194.5 // Explicitly: ₹170.00 revenue ÷ ₹0.874 ad spend = 194.5x
};

export interface JourneyStepDef {
  stepNumber: number;
  title: string;
  platform: 'youtube' | 'amazon' | 'nexus';
  shortStage: string;
  badgeLabel: string;
  summary: string;
  timestamp: string;
  details: string[];
  eventPayload: Record<string, unknown>;
}

export function FingerprintTrackerDemo() {
  const [selectedDevice, setSelectedDevice] = useState<DeviceProfile>(SAMPLE_DEVICES[0]);
  const [currentStep, setCurrentStep] = useState<number>(5); // Default to full confirmed journey on load
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showTechnicalSignals, setShowTechnicalSignals] = useState<boolean>(false);
  const [showDataLineage, setShowDataLineage] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'graph' | 'telemetry' | 'code'>('visual');
  const [copiedFp, setCopiedFp] = useState<boolean>(false);

  // Exact deterministic financial derivations from transaction fixture
  const txn = DETERMINISTIC_TRANSACTION;
  const realizedRoas = Number((txn.grossRevenue / txn.totalAttributedAdSpend).toFixed(1)); // 194.5

  // Derive timeline steps dynamically bound to active fingerprint identity and transaction fixture
  const journeySteps: JourneyStepDef[] = useMemo(() => [
    {
      stepNumber: 1,
      title: 'YouTube Ad Impression: Cookieless Tag Execution',
      platform: 'youtube',
      shortStage: 'Impression',
      badgeLabel: 'STAGE 1: AD IMPRESSION',
      summary: 'User watches a YouTube video. A 15-second Nike preroll video ad plays with zero 3rd-party cookies.',
      timestamp: 'Today, 10:14:02 AM',
      details: [
        `Client hardware & canvas entropy evaluated on YouTube page via NEXUS cookieless pixel.`,
        `Deterministic device fingerprint generated: ${selectedDevice.fingerprintId}`,
        `Impression logged: Campaign "YT_Brand_AirMaxDn_Q4", Cost CPM ₹${txn.youtubeImpressionCpmCost.toFixed(3)}`,
        `Zero reliance on 3rd-party tracking cookies (bypasses browser cookie blocking & Safari ITP).`
      ],
      eventPayload: {
        event_id: 'evt_yt_imp_9921',
        event_type: 'AD_IMPRESSION',
        platform: 'youtube',
        timestamp: '2026-10-07T10:14:02.194Z',
        fingerprint_id: selectedDevice.fingerprintId,
        entropy_match_score: `${selectedDevice.confidenceScore}%`,
        ad_campaign: 'YT_Brand_AirMaxDn_Q4',
        creative: 'Nike_AirMaxDn_FeelTheUnreal_15s.mp4',
        sku_promoted: txn.sku,
        cost_usd: txn.youtubeImpressionCpmCost,
        device_meta: {
          os: selectedDevice.os,
          gpu: selectedDevice.gpuRenderer,
          canvas_hash: selectedDevice.canvasHash,
          resolution: selectedDevice.screenResolution
        }
      }
    },
    {
      stepNumber: 2,
      title: 'YouTube Ad Click: High-Intent Engagement',
      platform: 'youtube',
      shortStage: 'Engagement',
      badgeLabel: 'STAGE 2: AD ENGAGEMENT',
      summary: 'User gets hooked and clicks "Explore". User views product details but leaves without buying.',
      timestamp: 'Today, 10:14:18 AM',
      details: [
        `Click event registered with matching Fingerprint ID: ${selectedDevice.fingerprintId}`,
        `Ad interaction logged: Cost CPC ₹${txn.youtubeClickCpcCost.toFixed(3)}`,
        `User lands on campaign landing page, explores colorways, but closes browser tab.`,
        `Cumulative ad spend: ₹${txn.totalAttributedAdSpend.toFixed(3)} (CPM + CPC).`,
        `Traditional ad networks classify this user as "bounced" with 0.0x ROAS.`
      ],
      eventPayload: {
        event_id: 'evt_yt_clk_4810',
        event_type: 'AD_CLICK',
        platform: 'youtube',
        timestamp: '2026-10-07T10:14:18.012Z',
        fingerprint_id: selectedDevice.fingerprintId,
        ad_campaign: 'YT_Brand_AirMaxDn_Q4',
        cost_usd: txn.youtubeClickCpcCost,
        cumulative_spend_usd: txn.totalAttributedAdSpend,
        click_target: 'https://nike.com/campaign/airmax-dn?utm_source=youtube',
        dwell_time_seconds: 14.2,
        action_outcome: 'TAB_CLOSED_NO_CONVERSION'
      }
    },
    {
      stepNumber: 3,
      title: 'Independent Amazon Visit: Walled-Garden Gap Crossed',
      platform: 'amazon',
      shortStage: 'Amazon Visit',
      badgeLabel: 'STAGE 3: WALLED-GARDEN GAP',
      summary: 'Hours later, user independently opens Amazon.com on the same device and searches for the sneaker.',
      timestamp: 'Today, 04:32:45 PM (+6h 18m)',
      details: [
        `Crucial Gap: User did NOT click a referral link or ad. They typed "amazon.com" directly into their browser.`,
        `Zero UTM parameters. Zero referral headers. Zero 3rd-party cookies (blocked by Chrome/Safari/Brave).`,
        `NEXUS Amazon Storefront Tag executes client-side WebGL + Canvas + Audio fingerprinting.`,
        `IDENTICAL Fingerprint ID computed: ${selectedDevice.fingerprintId} (${selectedDevice.confidenceScore}% confidence match)!`,
        `NEXUS Identity Graph stitches the independent Amazon session directly to the YouTube ad exposure!`
      ],
      eventPayload: {
        event_id: 'evt_amz_pdp_1092',
        event_type: 'MARKETPLACE_PRODUCT_VIEW',
        platform: 'amazon',
        timestamp: '2026-10-07T16:32:45.890Z',
        fingerprint_id: selectedDevice.fingerprintId,
        cross_channel_stitched_to: 'evt_yt_imp_9921',
        referrer_type: 'DIRECT_ORGANIC_SEARCH',
        sku_viewed: txn.sku,
        product_title: txn.productTitle,
        marketplace_price_usd: txn.itemPrice,
        graph_identity_confidence: `${selectedDevice.confidenceScore}% (DETERMINISTIC_HARDWARE_MATCH)`
      }
    },
    {
      stepNumber: 4,
      title: 'Amazon Checkout: Complete Purchase Conversion',
      platform: 'amazon',
      shortStage: 'Purchase',
      badgeLabel: 'STAGE 4: PURCHASE CONVERSION',
      summary: `User completes 1-Click Buy on Amazon for Order #${txn.orderId} (₹${txn.grossRevenue.toFixed(2)}).`,
      timestamp: 'Today, 04:35:10 PM',
      details: [
        `Order confirmed: Order #${txn.orderId} for ₹${txn.grossRevenue.toFixed(2)}.`,
        `Conversion telemetry sent to NEXUS Ingestion Engine with Fingerprint ID: ${selectedDevice.fingerprintId}`,
        `Amazon internal seller analytics attributes this as: "Direct Amazon Organic Search / Unpaid Traffic".`,
        `NEXUS Identity Graph unlocks the full truth: YouTube Ad generated the demand!`
      ],
      eventPayload: {
        event_id: 'evt_amz_ord_8831',
        event_type: 'PURCHASE_CONVERSION',
        platform: 'amazon',
        timestamp: '2026-10-07T16:35:10.420Z',
        fingerprint_id: selectedDevice.fingerprintId,
        order_id: txn.orderId,
        sku: txn.sku,
        revenue_usd: txn.grossRevenue,
        estimated_gross_margin_usd: txn.realizedGrossMargin,
        payment_method: 'Amazon Pay (1-Click)'
      }
    },
    {
      stepNumber: 5,
      title: 'NEXUS Attribution & ROI Confirmed: Closed-Loop Graph',
      platform: 'nexus',
      shortStage: 'Attributed ROI',
      badgeLabel: 'STAGE 5: ATTRIBUTION RESOLVED',
      summary: `The deterministic Fingerprint links the siloed platforms: YouTube ROAS jumps to ${realizedRoas}x!`,
      timestamp: 'Real-Time Sync • Just Now',
      details: [
        `Without Fingerprint: Marketer sees ₹${txn.totalAttributedAdSpend.toFixed(3)} YouTube spend with ₹0 revenue -> Cuts YouTube budget!`,
        `With NEXUS Single Fingerprint: Full cross-channel journey proven (YouTube View -> YouTube Click -> Amazon Buy).`,
        `Assisted ROAS calculated: ₹${txn.grossRevenue.toFixed(2)} revenue ÷ ₹${txn.totalAttributedAdSpend.toFixed(3)} total ad spend = ${realizedRoas}x ROAS!`,
        `Realized Gross Margin: ₹${txn.realizedGrossMargin.toFixed(2)} (${txn.grossMarginPct}%).`,
        `NEXUS SLSQP Optimizer Recommendation: Scale YouTube campaign budget by +25% (₹4,500/day shift).`
      ],
      eventPayload: {
        identity_graph_match: {
          fingerprint_id: selectedDevice.fingerprintId,
          touchpoints_count: 4,
          first_touch: 'YOUTUBE_AD_IMPRESSION (10:14:02 AM)',
          last_touch: 'AMAZON_CHECKOUT (04:35:10 PM)',
          time_lag_hours: 6.35
        },
        attribution_models: {
          siloed_last_touch_roas: {
            youtube: '0.00x (Misleading: looks unprofitable)',
            amazon_organic: '100% credited (Misleading: looks purely organic)'
          },
          nexus_fingerprint_stitched_roas: {
            formula: 'attributed_revenue / attributed_ad_spend',
            youtube_assisted_roas: `${realizedRoas}x`,
            attributed_revenue: `₹${txn.grossRevenue.toFixed(2)}`,
            attributed_ad_spend: `₹${txn.totalAttributedAdSpend.toFixed(3)}`,
            gross_margin: `₹${txn.realizedGrossMargin.toFixed(2)}`,
            actionable_decision: 'PRESERVE & SCALE YOUTUBE AD SPEND'
          }
        }
      }
    }
  ], [selectedDevice, txn, realizedRoas]);

  // Chart data reflecting exact step progression
  const journeyTimelineChartData = useMemo(() => {
    return [
      {
        stage: '1. Ad View',
        adSpend: currentStep >= 1 ? txn.youtubeImpressionCpmCost : 0,
        unattributedRevenue: 0,
        attributedRevenue: 0
      },
      {
        stage: '2. Click',
        adSpend: currentStep >= 2 ? txn.totalAttributedAdSpend : 0,
        unattributedRevenue: 0,
        attributedRevenue: 0
      },
      {
        stage: '3. Amazon Search',
        adSpend: currentStep >= 3 ? txn.totalAttributedAdSpend : 0,
        unattributedRevenue: 0,
        attributedRevenue: 0
      },
      {
        stage: '4. Buy Box',
        adSpend: currentStep >= 4 ? txn.totalAttributedAdSpend : 0,
        unattributedRevenue: 0,
        attributedRevenue: currentStep >= 4 ? txn.grossRevenue : 0
      },
      {
        stage: '5. Attributed',
        adSpend: currentStep >= 5 ? txn.totalAttributedAdSpend : 0,
        unattributedRevenue: 0,
        attributedRevenue: currentStep >= 5 ? txn.grossRevenue : 0
      }
    ];
  }, [currentStep, txn]);

  const comparisonChartData = useMemo(() => [
    {
      category: 'Siloed (Last-Touch)',
      adSpend: txn.totalAttributedAdSpend,
      recognizedRevenue: 0,
      realRoas: 0
    },
    {
      category: 'NEXUS Stitched',
      adSpend: txn.totalAttributedAdSpend,
      recognizedRevenue: currentStep >= 4 ? txn.grossRevenue : 0,
      realRoas: currentStep >= 5 ? realizedRoas : 0
    }
  ], [currentStep, txn, realizedRoas]);

  // Auto-play timer for interactive journey demo
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setTimeout(() => {
        if (currentStep < 5) {
          setCurrentStep((prev) => prev + 1);
        } else {
          setIsPlaying(false);
          toast.success('Journey Complete!', {
            description: `Attributed ₹${txn.grossRevenue.toFixed(2)} revenue with ${selectedDevice.confidenceScore}% device match.`
          });
        }
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, selectedDevice, txn]);

  const handleCopyFp = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(selectedDevice.fingerprintId);
    }
    setCopiedFp(true);
    toast.success('Fingerprint ID Copied', {
      description: selectedDevice.fingerprintId
    });
    setTimeout(() => setCopiedFp(false), 2000);
  };

  const handlePlay = () => {
    if (currentStep >= 5) {
      setCurrentStep(1);
    }
    setIsPlaying(true);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(1);
    toast.info('Journey Reset', {
      description: 'Restarted at Stage 1: YouTube Ad Impression.'
    });
  };

  const handlePrevStep = () => {
    setIsPlaying(false);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFastForward = () => {
    setIsPlaying(false);
    setCurrentStep(5);
    toast.success('Attribution Resolved', {
      description: 'Viewing complete closed-loop cross-channel attribution state.'
    });
  };

  const currentStepData = journeySteps[currentStep - 1] || journeySteps[4];

  return (
    <div className='flex flex-col gap-6 text-[#FFFFFF] max-w-7xl mx-auto w-full'>
      {/* 1. VISUAL HERO (Compact, High-Impact, 5-Second Comprehension) */}
      <div className='relative overflow-hidden rounded-xl border border-[#8A8A8A]/50 bg-[#000000] p-6 shadow-2xl'>
        {/* Ambient subtle glow background */}
        <div className='absolute -top-24 -left-24 size-72 bg-[#FFFFFF]/5 rounded-full blur-3xl pointer-events-none' />
        <div className='absolute -bottom-24 -right-24 size-72 bg-[#FFFFFF]/5 rounded-full blur-3xl pointer-events-none' />

        <div className='relative z-10 flex flex-col gap-6'>
          {/* Top row: Title + Device Profile Selector */}
          <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#8A8A8A]/30'>
            <div>
              <div className='flex items-center gap-2 mb-1.5'>
                <span className='px-2 py-0.5 rounded bg-[#1A1A1A] border border-[#8A8A8A]/60 text-[10px] font-mono font-bold uppercase tracking-wider text-[#FFFFFF] flex items-center gap-1.5'>
                  <span className='size-1.5 rounded-full bg-[#FFFFFF] animate-pulse' />
                  Autonomous Identity Graph
                </span>
                <span className='text-[10px] font-mono text-[#8A8A8A] uppercase tracking-wider'>
                  Zero 3rd-Party Cookies • Zero UTM Dependency
                </span>
              </div>
              <h1 className='text-2xl md:text-3xl font-mono font-black text-[#FFFFFF] tracking-tight uppercase'>
                Cookieless Attribution
              </h1>
              <p className='text-xs md:text-sm font-mono text-[#8A8A8A] mt-0.5 tracking-wide'>
                ONE DEVICE. ONE JOURNEY. REAL ROI.
              </p>
            </div>

            {/* Device Switcher HUD */}
            <div className='flex items-center gap-3 bg-[#1A1A1A] border border-[#8A8A8A]/60 rounded-lg p-2.5 self-start lg:self-auto'>
              <div className='size-9 rounded bg-[#000000] border border-[#8A8A8A]/50 flex items-center justify-center shrink-0'>
                <Icons.laptop className='size-4 text-[#FFFFFF]' />
              </div>
              <div className='flex flex-col'>
                <span className='text-[9px] font-mono text-[#8A8A8A] uppercase tracking-wider'>
                  Active Hardware Entropy Signature
                </span>
                <select
                  aria-label='Select Device Profile'
                  value={selectedDevice.id}
                  onChange={(e) => {
                    const dev = SAMPLE_DEVICES.find((d) => d.id === e.target.value);
                    if (dev) {
                      setSelectedDevice(dev);
                      toast.info(`Device Identity Changed: ${dev.name}`, {
                        description: `Fingerprint ${dev.fingerprintId} (${dev.confidenceScore}% match)`
                      });
                    }
                  }}
                  className='h-7 text-xs font-mono font-bold bg-[#000000] border border-[#8A8A8A]/50 rounded px-2 text-[#FFFFFF] focus:outline-none focus:border-[#FFFFFF]'
                >
                  {SAMPLE_DEVICES.map((d) => (
                    <option key={d.id} value={d.id} className='bg-[#000000] text-[#FFFFFF]'>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Centerpiece: Flagship Visual 4-Node Flow + Fingerprint Anchor */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 relative py-2'>
            {/* Step 1 Node: Fingerprint Anchor */}
            <div
              className={cn(
                'relative rounded-lg border p-4 bg-[#0A0A0A] flex flex-col justify-between transition-all duration-300',
                currentStep >= 1
                  ? 'border-[#FFFFFF] shadow-[0_0_15px_rgba(255,255,255,0.15)] ring-1 ring-[#FFFFFF]/50'
                  : 'border-[#8A8A8A]/30 opacity-60'
              )}
            >
              <div className='flex items-center justify-between mb-3'>
                <span className='text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#1A1A1A] text-[#FFFFFF] border border-[#8A8A8A]/40'>
                  01 • IDENTITY ANCHOR
                </span>
                <span className='size-2 rounded-full bg-[#FFFFFF]' />
              </div>

              <div className='flex items-center gap-3 my-2'>
                <div className='relative size-12 rounded-full bg-[#1A1A1A] border border-[#FFFFFF] flex items-center justify-center shrink-0'>
                  <Icons.fingerprint className='size-6 text-[#FFFFFF]' />
                  <div className='absolute -inset-1 rounded-full border border-[#FFFFFF]/40 animate-ping opacity-40' />
                </div>
                <div className='flex flex-col min-w-0'>
                  <span className='text-[11px] font-mono text-[#8A8A8A] uppercase truncate'>
                    Hardware Match {selectedDevice.confidenceScore}%
                  </span>
                  <div className='flex items-center gap-1.5'>
                    <code className='text-xs font-mono font-bold text-[#FFFFFF] truncate'>
                      {selectedDevice.fingerprintId}
                    </code>
                    <button
                      onClick={handleCopyFp}
                      title='Copy Fingerprint'
                      className='text-[#8A8A8A] hover:text-[#FFFFFF] transition-colors p-0.5'
                    >
                      {copiedFp ? <Icons.check className='size-3 text-[#FFFFFF]' /> : <Icons.post className='size-3' />}
                    </button>
                  </div>
                </div>
              </div>

              <div className='text-[10px] font-mono text-[#8A8A8A] mt-2 pt-2 border-t border-[#8A8A8A]/30 flex items-center justify-between'>
                <span>Canvas + GPU + Audio</span>
                <span className='text-[#FFFFFF] font-bold'>VERIFIED</span>
              </div>
            </div>

            {/* Step 2 Node: YouTube Ad */}
            <div
              className={cn(
                'relative rounded-lg border p-4 bg-[#0A0A0A] flex flex-col justify-between transition-all duration-300',
                currentStep >= 2
                  ? 'border-[#FFFFFF] shadow-[0_0_15px_rgba(255,255,255,0.15)] ring-1 ring-[#FFFFFF]/50'
                  : 'border-[#8A8A8A]/30 opacity-60'
              )}
            >
              <div className='flex items-center justify-between mb-3'>
                <span className='text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#1A1A1A] text-[#FFFFFF] border border-[#8A8A8A]/40'>
                  02 • YOUTUBE AD
                </span>
                {currentStep >= 2 && <span className='size-2 rounded-full bg-[#FFFFFF]' />}
              </div>

              <div className='flex items-center gap-3 my-2'>
                <div className='size-12 rounded-full bg-[#1A1A1A] border border-[#8A8A8A]/60 flex items-center justify-center shrink-0'>
                  <Icons.youtube className='size-6 text-[#FFFFFF]' />
                </div>
                <div className='flex flex-col'>
                  <span className='text-xs font-mono font-bold text-[#FFFFFF]'>
                    Preroll Video Click
                  </span>
                  <span className='text-[11px] font-mono text-[#8A8A8A]'>
                    Cost: ₹{txn.totalAttributedAdSpend.toFixed(3)}
                  </span>
                </div>
              </div>

              <div className='text-[10px] font-mono text-[#8A8A8A] mt-2 pt-2 border-t border-[#8A8A8A]/30 flex items-center justify-between'>
                <span>Ad Clicked</span>
                <span className='text-[#8A8A8A] font-medium'>Tab Closed</span>
              </div>
            </div>

            {/* Step 3 Node: Amazon Visit */}
            <div
              className={cn(
                'relative rounded-lg border p-4 bg-[#0A0A0A] flex flex-col justify-between transition-all duration-300',
                currentStep >= 3
                  ? 'border-[#FFFFFF] shadow-[0_0_15px_rgba(255,255,255,0.15)] ring-1 ring-[#FFFFFF]/50'
                  : 'border-[#8A8A8A]/30 opacity-60'
              )}
            >
              <div className='flex items-center justify-between mb-3'>
                <span className='text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#1A1A1A] text-[#FFFFFF] border border-[#8A8A8A]/40'>
                  03 • AMAZON VISIT
                </span>
                {currentStep >= 3 && <span className='size-2 rounded-full bg-[#FFFFFF]' />}
              </div>

              <div className='flex items-center gap-3 my-2'>
                <div className='size-12 rounded-full bg-[#1A1A1A] border border-[#8A8A8A]/60 flex items-center justify-center shrink-0'>
                  <Icons.amazon className='size-6 text-[#FFFFFF]' />
                </div>
                <div className='flex flex-col'>
                  <span className='text-xs font-mono font-bold text-[#FFFFFF]'>
                    Organic Direct Visit
                  </span>
                  <span className='text-[11px] font-mono text-[#8A8A8A]'>
                    6h 18m Latency Gap
                  </span>
                </div>
              </div>

              <div className='text-[10px] font-mono text-[#8A8A8A] mt-2 pt-2 border-t border-[#8A8A8A]/30 flex items-center justify-between'>
                <span>Zero UTMs / Cookies</span>
                <span className='text-[#FFFFFF] font-bold'>MATCH 100%</span>
              </div>
            </div>

            {/* Step 4 Node: Attributed ROI */}
            <div
              className={cn(
                'relative rounded-lg border p-4 bg-[#0A0A0A] flex flex-col justify-between transition-all duration-300',
                currentStep >= 5
                  ? 'border-[#FFFFFF] bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] shadow-[0_0_20px_rgba(255,255,255,0.25)] ring-2 ring-[#FFFFFF]'
                  : currentStep === 4
                  ? 'border-[#FFFFFF] shadow-[0_0_15px_rgba(255,255,255,0.15)]'
                  : 'border-[#8A8A8A]/30 opacity-60'
              )}
            >
              <div className='flex items-center justify-between mb-3'>
                <span className='text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#FFFFFF] text-[#000000]'>
                  04 • REALIZED ROI
                </span>
                {currentStep >= 5 ? (
                  <span className='text-[10px] font-mono font-bold text-[#FFFFFF] flex items-center gap-1'>
                    <Icons.circleCheck className='size-3 text-[#FFFFFF]' />
                    CONFIRMED
                  </span>
                ) : currentStep === 4 ? (
                  <span className='text-[10px] font-mono font-bold text-[#8A8A8A]'>PURCHASED</span>
                ) : null}
              </div>

              <div className='flex items-center gap-3 my-2'>
                <div className='size-12 rounded-full bg-[#FFFFFF] text-[#000000] flex items-center justify-center shrink-0 font-mono font-black text-lg'>
                  ₹
                </div>
                <div className='flex flex-col'>
                  <span className='text-sm font-mono font-black text-[#FFFFFF]'>
                    {currentStep >= 4 ? `₹${txn.grossRevenue.toFixed(2)} Revenue` : 'Pending Checkout'}
                  </span>
                  <span className='text-xs font-mono font-bold text-[#FFFFFF]'>
                    {currentStep >= 5 ? `${realizedRoas}x ROAS Lift` : currentStep === 4 ? 'Resolving ROAS...' : '0.0x ROAS (Siloed)'}
                  </span>
                </div>
              </div>

              <div className='text-[10px] font-mono text-[#8A8A8A] mt-2 pt-2 border-t border-[#8A8A8A]/30 flex items-center justify-between'>
                <span>Margin: ₹{currentStep >= 4 ? txn.realizedGrossMargin.toFixed(2) : '0.00'}</span>
                <span className='text-[#FFFFFF] font-bold'>{currentStep >= 5 ? 'CLOSED-LOOP' : 'IN PROGRESS'}</span>
              </div>
            </div>
          </div>

          {/* Interactive Player Controls Strip */}
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#8A8A8A]/30 font-mono'>
            <div className='flex items-center gap-2'>
              <Button
                size='sm'
                onClick={isPlaying ? () => setIsPlaying(false) : handlePlay}
                className='h-8 px-4 text-xs font-mono font-bold bg-[#FFFFFF] hover:bg-[#CCCCCC] text-[#000000] border-none active:scale-[0.98]'
              >
                {isPlaying ? (
                  <>
                    <Icons.eyeOff className='mr-1.5 size-3.5' />
                    Pause Journey
                  </>
                ) : (
                  <>
                    <Icons.play className='mr-1.5 size-3.5' />
                    {currentStep >= 5 ? 'Replay Journey (3s)' : 'Play Journey (3s)'}
                  </>
                )}
              </Button>

              <Button
                size='sm'
                variant='outline'
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className='h-8 text-xs font-mono border border-[#8A8A8A]/60 bg-[#1A1A1A] hover:bg-[#000000] text-[#FFFFFF] disabled:opacity-40'
              >
                <Icons.chevronLeft className='size-3.5 mr-1 text-[#FFFFFF]' />
                Prev
              </Button>

              <Button
                size='sm'
                variant='outline'
                onClick={handleNextStep}
                disabled={currentStep === 5}
                className='h-8 text-xs font-mono border border-[#8A8A8A]/60 bg-[#1A1A1A] hover:bg-[#000000] text-[#FFFFFF] disabled:opacity-40'
              >
                Next
                <Icons.chevronRight className='size-3.5 ml-1 text-[#FFFFFF]' />
              </Button>

              <Button
                size='sm'
                variant='outline'
                onClick={handleFastForward}
                disabled={currentStep === 5}
                className='h-8 text-xs font-mono border border-[#8A8A8A]/60 bg-[#1A1A1A] hover:bg-[#000000] text-[#FFFFFF] disabled:opacity-40'
              >
                <Icons.circleCheck className='size-3.5 mr-1 text-[#FFFFFF]' />
                Show Full Attribution
              </Button>

              <Button
                size='sm'
                variant='ghost'
                onClick={handleReset}
                className='h-8 text-xs font-mono text-[#8A8A8A] hover:text-[#FFFFFF] hover:bg-[#1A1A1A]'
              >
                <Icons.clock className='size-3.5 mr-1' />
                Reset
              </Button>
            </div>

            {/* Quick Step Indicators */}
            <div className='flex items-center gap-1.5'>
              {journeySteps.map((step) => (
                <button
                  key={step.stepNumber}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStep(step.stepNumber);
                  }}
                  title={step.title}
                  className={cn(
                    'h-7 px-2.5 rounded text-[11px] font-mono transition-all flex items-center gap-1 border',
                    currentStep === step.stepNumber
                      ? 'bg-[#FFFFFF] text-[#000000] border-[#FFFFFF] font-bold'
                      : currentStep > step.stepNumber
                      ? 'bg-[#1A1A1A] text-[#FFFFFF] border-[#8A8A8A]/60'
                      : 'bg-[#000000] text-[#8A8A8A] border-[#8A8A8A]/30 opacity-60'
                  )}
                >
                  <span>{step.stepNumber}.</span>
                  <span>{step.shortStage}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. TECHNICAL SIGNALS DRAWER (Collapsed by Default) */}
      <div className='rounded-xl border border-[#8A8A8A]/50 bg-[#141414] overflow-hidden'>
        <button
          onClick={() => setShowTechnicalSignals(!showTechnicalSignals)}
          className='w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-[#1A1A1A] transition-colors font-mono'
        >
          <div className='flex items-center gap-2.5'>
            <Icons.code className='size-4 text-[#FFFFFF]' />
            <span className='text-xs font-bold uppercase tracking-wider text-[#FFFFFF]'>
              Technical Hardware Signals &amp; Entropy Vector
            </span>
            <Badge variant='outline' className='border-[#8A8A8A]/60 bg-[#000000] text-[#8A8A8A] text-[10px] font-mono'>
              {selectedDevice.confidenceScore}% Match Certainty • 6 Vectors
            </Badge>
          </div>
          <div className='flex items-center gap-2 text-xs text-[#8A8A8A]'>
            <span>{showTechnicalSignals ? 'Collapse Details' : 'View Signals'}</span>
            <Icons.chevronDown
              className={cn('size-4 text-[#FFFFFF] transition-transform duration-200', showTechnicalSignals && 'rotate-180')}
            />
          </div>
        </button>

        {showTechnicalSignals && (
          <div className='px-5 pb-5 pt-2 border-t border-[#8A8A8A]/30 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono'>
            <div className='bg-[#000000] border border-[#8A8A8A]/40 rounded-lg p-3'>
              <span className='text-[#8A8A8A] block text-[10px] uppercase'>Canvas 2D Hash</span>
              <span className='text-[#FFFFFF] font-bold truncate block mt-0.5'>{selectedDevice.canvasHash}</span>
              <span className='text-[9px] text-[#8A8A8A] block mt-1'>Subpixel text raster</span>
            </div>

            <div className='bg-[#000000] border border-[#8A8A8A]/40 rounded-lg p-3'>
              <span className='text-[#8A8A8A] block text-[10px] uppercase'>WebGL GPU Renderer</span>
              <span className='text-[#FFFFFF] font-bold truncate block mt-0.5' title={selectedDevice.gpuRenderer}>
                {selectedDevice.gpuRenderer.split('(')[0]}
              </span>
              <span className='text-[9px] text-[#8A8A8A] block mt-1'>Shader precision vector</span>
            </div>

            <div className='bg-[#000000] border border-[#8A8A8A]/40 rounded-lg p-3'>
              <span className='text-[#8A8A8A] block text-[10px] uppercase'>Audio Oscillator</span>
              <span className='text-[#FFFFFF] font-bold truncate block mt-0.5'>{selectedDevice.audioHash}</span>
              <span className='text-[9px] text-[#8A8A8A] block mt-1'>DynamicsCompressor node</span>
            </div>

            <div className='bg-[#000000] border border-[#8A8A8A]/40 rounded-lg p-3'>
              <span className='text-[#8A8A8A] block text-[10px] uppercase'>Display &amp; Color</span>
              <span className='text-[#FFFFFF] font-bold truncate block mt-0.5'>{selectedDevice.screenResolution}</span>
              <span className='text-[9px] text-[#8A8A8A] block mt-1'>{selectedDevice.colorDepth}</span>
            </div>

            <div className='bg-[#000000] border border-[#8A8A8A]/40 rounded-lg p-3'>
              <span className='text-[#8A8A8A] block text-[10px] uppercase'>CPU Cores &amp; RAM</span>
              <span className='text-[#FFFFFF] font-bold truncate block mt-0.5'>
                {selectedDevice.hardwareConcurrency} Cores • {selectedDevice.deviceMemoryGb}GB
              </span>
              <span className='text-[9px] text-[#8A8A8A] block mt-1'>Hardware concurrency</span>
            </div>

            <div className='bg-[#000000] border border-[#8A8A8A]/40 rounded-lg p-3'>
              <span className='text-[#8A8A8A] block text-[10px] uppercase'>Subnet Geohash</span>
              <span className='text-[#FFFFFF] font-bold truncate block mt-0.5'>{selectedDevice.ipSubnet.split(' ')[0]}</span>
              <span className='text-[9px] text-[#8A8A8A] block mt-1'>ISP BGP routing cluster</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. DATA LINEAGE SECTION (Explicit Financial Traceability) */}
      <div className='rounded-xl border border-[#8A8A8A]/50 bg-[#141414] overflow-hidden'>
        <button
          onClick={() => setShowDataLineage(!showDataLineage)}
          className='w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-[#1A1A1A] transition-colors font-mono'
        >
          <div className='flex items-center gap-2.5'>
            <Icons.topology className='size-4 text-[#FFFFFF]' />
            <span className='text-xs font-bold uppercase tracking-wider text-[#FFFFFF]'>
              Data Lineage &amp; Financial Formula Trace
            </span>
            <Badge variant='outline' className='border-[#8A8A8A]/60 bg-[#000000] text-[#8A8A8A] text-[10px] font-mono'>
              ROAS Formula: Revenue ÷ Ad Spend = 194.5x
            </Badge>
          </div>
          <div className='flex items-center gap-2 text-xs text-[#8A8A8A]'>
            <span>{showDataLineage ? 'Collapse Lineage' : 'View Lineage ▾'}</span>
            <Icons.chevronDown
              className={cn('size-4 text-[#FFFFFF] transition-transform duration-200', showDataLineage && 'rotate-180')}
            />
          </div>
        </button>

        {showDataLineage && (
          <div className='px-5 pb-5 pt-3 border-t border-[#8A8A8A]/30 font-mono text-xs'>
            {/* Visual Lineage Chain Flow */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5 items-stretch'>
              <div className='bg-[#000000] border border-[#8A8A8A]/40 rounded-lg p-2.5 flex flex-col justify-between'>
                <span className='text-[9px] text-[#8A8A8A] uppercase font-bold'>1. Source Ad</span>
                <span className='text-xs font-bold text-[#FFFFFF] mt-1'>YouTube Video</span>
                <span className='text-[10px] text-[#8A8A8A] mt-0.5'>CPM ₹{txn.youtubeImpressionCpmCost.toFixed(3)} + CPC ₹{txn.youtubeClickCpcCost.toFixed(3)}</span>
              </div>

              <div className='bg-[#000000] border border-[#8A8A8A]/40 rounded-lg p-2.5 flex flex-col justify-between'>
                <span className='text-[9px] text-[#8A8A8A] uppercase font-bold'>2. Hardware Hash</span>
                <span className='text-xs font-bold text-[#FFFFFF] mt-1 truncate'>{selectedDevice.fingerprintId}</span>
                <span className='text-[10px] text-[#8A8A8A] mt-0.5'>{selectedDevice.confidenceScore}% certainty</span>
              </div>

              <div className='bg-[#000000] border border-[#8A8A8A]/40 rounded-lg p-2.5 flex flex-col justify-between'>
                <span className='text-[9px] text-[#8A8A8A] uppercase font-bold'>3. Marketplace</span>
                <span className='text-xs font-bold text-[#FFFFFF] mt-1'>Amazon Direct</span>
                <span className='text-[10px] text-[#8A8A8A] mt-0.5'>Zero UTM / Cookieless</span>
              </div>

              <div className='bg-[#000000] border border-[#8A8A8A]/40 rounded-lg p-2.5 flex flex-col justify-between'>
                <span className='text-[9px] text-[#8A8A8A] uppercase font-bold'>4. Order Event</span>
                <span className='text-xs font-bold text-[#FFFFFF] mt-1'>#{txn.orderId}</span>
                <span className='text-[10px] text-[#8A8A8A] mt-0.5'>ASIN: {txn.asin}</span>
              </div>

              <div className='bg-[#000000] border border-[#8A8A8A]/40 rounded-lg p-2.5 flex flex-col justify-between'>
                <span className='text-[9px] text-[#8A8A8A] uppercase font-bold'>5. Transaction Rev</span>
                <span className='text-xs font-bold text-[#FFFFFF] mt-1'>₹{txn.grossRevenue.toFixed(2)}</span>
                <span className='text-[10px] text-[#8A8A8A] mt-0.5'>COGS ₹{txn.cogs.toFixed(2)}</span>
              </div>

              <div className='bg-[#000000] border border-[#8A8A8A]/40 rounded-lg p-2.5 flex flex-col justify-between'>
                <span className='text-[9px] text-[#8A8A8A] uppercase font-bold'>6. Realized Margin</span>
                <span className='text-xs font-bold text-[#FFFFFF] mt-1'>₹{txn.realizedGrossMargin.toFixed(2)}</span>
                <span className='text-[10px] text-[#8A8A8A] mt-0.5'>{txn.grossMarginPct}% margin</span>
              </div>

              <div className='bg-[#000000] border border-[#FFFFFF]/60 rounded-lg p-2.5 flex flex-col justify-between bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A]'>
                <span className='text-[9px] text-[#FFFFFF] uppercase font-bold'>7. Assisted ROAS</span>
                <span className='text-xs font-black text-[#FFFFFF] mt-1'>{realizedRoas}x</span>
                <span className='text-[10px] text-[#FFFFFF] mt-0.5'>₹170.00 ÷ ₹0.874</span>
              </div>
            </div>

            <div className='mt-3 pt-2.5 border-t border-[#8A8A8A]/30 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#8A8A8A] gap-2'>
              <div>
                <strong className='text-[#FFFFFF]'>Attribution Lineage Rule: </strong>
                Device signals determine the <em>identity match</em>. The marketplace transaction determines <em>revenue &amp; margin</em>. ROAS is derived strictly as: <code className='text-[#FFFFFF]'>Attributed Revenue ÷ Attributed Ad Spend</code>.
              </div>
              <Badge variant='outline' className='text-[10px] border-[#8A8A8A]/40 text-[#FFFFFF] self-start sm:self-auto shrink-0'>
                Deterministic Lineage Verified
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* 4. CONFIRMED ATTRIBUTION HERO PANEL */}
      <div className='rounded-xl border border-[#FFFFFF]/40 bg-gradient-to-r from-[#111111] via-[#1A1A1A] to-[#111111] p-6 shadow-xl'>
        <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-6'>
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <Badge className='bg-[#FFFFFF] text-[#000000] font-mono text-xs font-bold border-none uppercase px-2.5 py-0.5'>
                {currentStep >= 5 ? '✓ ATTRIBUTION CONFIRMED' : currentStep >= 4 ? '● ORDER DETECTED' : '○ SIMULATION IN PROGRESS'}
              </Badge>
              <span className='text-xs font-mono text-[#8A8A8A]'>
                {currentStep >= 4 ? 'Cross-channel conversion resolved in 6h 21m' : 'Awaiting conversion touchpoint'}
              </span>
            </div>
            <h2 className='text-2xl md:text-3xl font-mono font-black text-[#FFFFFF] tracking-tight'>
              {currentStep >= 5
                ? `₹${txn.grossRevenue.toFixed(2)} Revenue • ${realizedRoas}x Assisted ROAS`
                : currentStep === 4
                ? `₹${txn.grossRevenue.toFixed(2)} Revenue • Resolving ROAS...`
                : `₹0.00 Revenue (Siloed 0.0x ROAS)`}
            </h2>
            <p className='text-xs font-mono text-[#8A8A8A] mt-1 max-w-2xl leading-relaxed'>
              YouTube Ad Spend of <span className='text-[#FFFFFF] font-bold'>₹{txn.totalAttributedAdSpend.toFixed(3)}</span> yielded{' '}
              <span className='text-[#FFFFFF] font-bold'>₹{txn.grossRevenue.toFixed(2)}</span> Amazon checkout.
              Formula: <span className='text-[#FFFFFF] font-bold'>Attributed revenue ÷ Attributed ad spend</span> = {realizedRoas}x.
            </p>
          </div>

          {/* Quick Metrics Cluster */}
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono shrink-0'>
            <div className='bg-[#000000] border border-[#8A8A8A]/50 rounded-lg p-3 text-center'>
              <span className='text-[10px] text-[#8A8A8A] uppercase tracking-wider block'>Realized Margin</span>
              <span className='text-base font-bold text-[#FFFFFF] mt-0.5 block'>
                {currentStep >= 4 ? `₹${txn.realizedGrossMargin.toFixed(2)}` : '₹0.00'}
              </span>
            </div>
            <div className='bg-[#000000] border border-[#8A8A8A]/50 rounded-lg p-3 text-center'>
              <span className='text-[10px] text-[#8A8A8A] uppercase tracking-wider block'>Match Certainty</span>
              <span className='text-base font-bold text-[#FFFFFF] mt-0.5 block'>{selectedDevice.confidenceScore}%</span>
            </div>
            <div className='bg-[#000000] border border-[#8A8A8A]/50 rounded-lg p-3 text-center col-span-2 sm:col-span-1'>
              <span className='text-[10px] text-[#8A8A8A] uppercase tracking-wider block'>Cross-Channel Link</span>
              <span className='text-base font-bold text-[#FFFFFF] mt-0.5 block'>YouTube &rarr; Amazon</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. ROI RECHARTS VISUALIZATION & COMPARISON */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Left: Journey Accumulation Area Chart */}
        <div className='lg:col-span-7 rounded-xl border border-[#8A8A8A]/50 bg-[#141414] p-5 flex flex-col justify-between'>
          <div>
            <div className='flex items-center justify-between pb-3 border-b border-[#8A8A8A]/30 mb-4'>
              <div className='flex items-center gap-2'>
                <Icons.barChart className='size-4 text-[#FFFFFF]' />
                <h3 className='text-xs font-mono font-bold uppercase tracking-wider text-[#FFFFFF]'>
                  Attributed Value vs Ad Spend Across Touchpoints
                </h3>
              </div>
              <Badge variant='outline' className='text-[10px] font-mono text-[#8A8A8A] border-[#8A8A8A]/40 bg-[#000000]'>
                Values in ₹
              </Badge>
            </div>
            <p className='text-[11px] font-mono text-[#8A8A8A] mb-4'>
              Tracks ad spend deployed at top-of-funnel on YouTube against the resulting revenue captured at Amazon checkout.
            </p>

            <div className='h-60 w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={journeyTimelineChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id='gradRevenue' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#FFFFFF' stopOpacity={0.4} />
                      <stop offset='95%' stopColor='#FFFFFF' stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id='gradSpend' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#8A8A8A' stopOpacity={0.4} />
                      <stop offset='95%' stopColor='#8A8A8A' stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke='#2A2A2A' strokeDasharray='3 3' vertical={false} />
                  <XAxis
                    dataKey='stage'
                    stroke='#8A8A8A'
                    tick={{ fill: '#8A8A8A', fontSize: 11, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#333333' }}
                  />
                  <YAxis
                    stroke='#8A8A8A'
                    tick={{ fill: '#8A8A8A', fontSize: 11, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#333333' }}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#000000', borderColor: '#8A8A8A', borderRadius: '6px', fontFamily: 'monospace', fontSize: '11px', color: '#FFFFFF' }}
                    formatter={(val: any, name: any) => [`₹${Number(val).toFixed(2)}`, name === 'attributedRevenue' ? 'Attributed Revenue' : 'Ad Spend']}
                  />
                  <Area
                    type='monotone'
                    dataKey='attributedRevenue'
                    name='Attributed Revenue'
                    stroke='#FFFFFF'
                    strokeWidth={2}
                    fillOpacity={1}
                    fill='url(#gradRevenue)'
                  />
                  <Area
                    type='monotone'
                    dataKey='adSpend'
                    name='Ad Spend'
                    stroke='#8A8A8A'
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill='url(#gradSpend)'
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className='mt-4 pt-3 border-t border-[#8A8A8A]/30 flex items-center justify-between text-[11px] font-mono text-[#8A8A8A]'>
            <span>Initial YouTube Cost: <strong className='text-[#FFFFFF]'>₹{txn.totalAttributedAdSpend.toFixed(3)}</strong></span>
            <span>Final Conversion Yield: <strong className='text-[#FFFFFF]'>₹{currentStep >= 4 ? txn.grossRevenue.toFixed(2) : '0.00'}</strong></span>
          </div>
        </div>

        {/* Right: Unattributed vs Attributed Comparison Bar Chart */}
        <div className='lg:col-span-5 rounded-xl border border-[#8A8A8A]/50 bg-[#141414] p-5 flex flex-col justify-between'>
          <div>
            <div className='flex items-center justify-between pb-3 border-b border-[#8A8A8A]/30 mb-4'>
              <div className='flex items-center gap-2'>
                <Icons.normalization className='size-4 text-[#FFFFFF]' />
                <h3 className='text-xs font-mono font-bold uppercase tracking-wider text-[#FFFFFF]'>
                  Attribution Blindspot Comparison
                </h3>
              </div>
              <Badge variant='outline' className='text-[10px] font-mono text-[#8A8A8A] border-[#8A8A8A]/40 bg-[#000000]'>
                Siloed vs Stitched
              </Badge>
            </div>
            <p className='text-[11px] font-mono text-[#8A8A8A] mb-4'>
              Legacy siloed analytics reports YouTube as a cost center (₹0 revenue). NEXUS reveals true cross-channel halo revenue.
            </p>

            <div className='h-60 w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke='#2A2A2A' strokeDasharray='3 3' vertical={false} />
                  <XAxis
                    dataKey='category'
                    stroke='#8A8A8A'
                    tick={{ fill: '#8A8A8A', fontSize: 10, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#333333' }}
                  />
                  <YAxis
                    stroke='#8A8A8A'
                    tick={{ fill: '#8A8A8A', fontSize: 11, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#333333' }}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#000000', borderColor: '#8A8A8A', borderRadius: '6px', fontFamily: 'monospace', fontSize: '11px', color: '#FFFFFF' }}
                    formatter={(val: any, name: any) => [`₹${Number(val).toFixed(2)}`, name === 'recognizedRevenue' ? 'Recognized Revenue' : 'Ad Spend']}
                  />
                  <Bar dataKey='adSpend' fill='#555555' radius={[4, 4, 0, 0]} name='Ad Spend' />
                  <Bar dataKey='recognizedRevenue' fill='#FFFFFF' radius={[4, 4, 0, 0]} name='Recognized Revenue' />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className='mt-4 pt-3 border-t border-[#8A8A8A]/30 flex items-center justify-between text-[11px] font-mono'>
            <span className='text-[#8A8A8A]'>Siloed: <strong className='text-[#8A8A8A]'>0.0x ROAS</strong></span>
            <span className='text-[#FFFFFF]'>NEXUS: <strong className='text-[#FFFFFF]'>{currentStep >= 5 ? `${realizedRoas}x ROAS` : 'Evaluating'}</strong></span>
          </div>
        </div>
      </div>

      {/* 6. DEEP DIVE TABS (Visual Journey Mock, Identity Graph, DuckDB Telemetry, SDK) */}
      <div className='rounded-xl border border-[#8A8A8A]/50 bg-[#141414] overflow-hidden'>
        {/* Tab navigation headers */}
        <div className='flex items-center gap-1 p-2 bg-[#000000] border-b border-[#8A8A8A]/30 text-xs font-mono overflow-x-auto'>
          <button
            onClick={() => setActiveTab('visual')}
            className={cn(
              'px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 shrink-0',
              activeTab === 'visual'
                ? 'bg-[#FFFFFF] text-[#000000] font-bold'
                : 'text-[#8A8A8A] hover:text-[#FFFFFF] hover:bg-[#1A1A1A]'
            )}
          >
            <Icons.laptop className='size-3.5' />
            1. Screen Simulation ({currentStepData.shortStage})
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className={cn(
              'px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 shrink-0',
              activeTab === 'graph'
                ? 'bg-[#FFFFFF] text-[#000000] font-bold'
                : 'text-[#8A8A8A] hover:text-[#FFFFFF] hover:bg-[#1A1A1A]'
            )}
          >
            <Icons.topology className='size-3.5' />
            2. Multi-Touch Identity Graph
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={cn(
              'px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 shrink-0',
              activeTab === 'telemetry'
                ? 'bg-[#FFFFFF] text-[#000000] font-bold'
                : 'text-[#8A8A8A] hover:text-[#FFFFFF] hover:bg-[#1A1A1A]'
            )}
          >
            <Icons.code className='size-3.5' />
            3. Telemetry Stream
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={cn(
              'px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 shrink-0',
              activeTab === 'code'
                ? 'bg-[#FFFFFF] text-[#000000] font-bold'
                : 'text-[#8A8A8A] hover:text-[#FFFFFF] hover:bg-[#1A1A1A]'
            )}
          >
            <Icons.file className='size-3.5' />
            4. Cookieless SDK &amp; SQL Query
          </button>
        </div>

        {/* TAB 1: VISUAL SIMULATION VIEW */}
        {activeTab === 'visual' && (
          <div className='p-5 grid grid-cols-1 lg:grid-cols-12 gap-6'>
            {/* Screen Mock Container */}
            <div className='lg:col-span-7 flex flex-col gap-3'>
              <div className='rounded-lg border border-[#8A8A8A]/50 bg-[#000000] overflow-hidden'>
                {/* Browser top-bar */}
                <div className='bg-[#111111] border-b border-[#8A8A8A]/30 px-3.5 py-2 flex items-center justify-between'>
                  <div className='flex items-center gap-1.5'>
                    <span className='size-2.5 rounded-full bg-[#FFFFFF]/70 inline-block' />
                    <span className='size-2.5 rounded-full bg-[#8A8A8A]/60 inline-block' />
                    <span className='size-2.5 rounded-full bg-[#8A8A8A]/30 inline-block' />
                    <span className='ml-2 text-xs font-mono text-[#8A8A8A] truncate max-w-[220px]'>
                      {currentStep <= 2 ? 'youtube.com/watch?v=tech-gear-2026' : 'amazon.com/s?k=nike+shoes'}
                    </span>
                  </div>
                  <Badge variant='outline' className='border-[#8A8A8A]/50 bg-[#000000] text-[#FFFFFF] text-[10px] font-mono px-2 py-0.5 flex items-center gap-1'>
                    <Icons.fingerprint className='size-3' />
                    {selectedDevice.fingerprintId}
                  </Badge>
                </div>

                {/* Browser window body */}
                <div className='p-4 min-h-[360px] flex flex-col justify-between bg-[#0A0A0A]'>
                  {/* Stages 1 & 2: YouTube view */}
                  {currentStep <= 2 && (
                    <div className='flex flex-col gap-3'>
                      <div className='relative aspect-video rounded-lg overflow-hidden bg-[#000000] border border-[#8A8A8A]/50 flex flex-col justify-between p-4'>
                        <div className='flex items-center justify-between z-10'>
                          <div className='flex items-center gap-2 bg-[#1A1A1A]/80 border border-[#8A8A8A]/40 px-2.5 py-1 rounded text-xs font-mono text-[#FFFFFF]'>
                            <Icons.youtube className='size-4 text-[#FFFFFF]' />
                            YouTube Preroll Video
                          </div>
                          <Badge className='bg-[#FFFFFF] text-[#000000] font-bold text-[10px] uppercase font-mono border-none'>
                            Ad 1 of 1 • 0:08 / 0:15
                          </Badge>
                        </div>

                        <div className='my-auto flex flex-col items-center justify-center text-center p-3 z-10'>
                          <div className='size-12 rounded-full bg-[#1A1A1A] border border-[#8A8A8A] flex items-center justify-center mb-2'>
                            <Icons.play className='size-6 text-[#FFFFFF] ml-0.5' />
                          </div>
                          <span className='text-[10px] font-mono uppercase text-[#8A8A8A] tracking-wider font-semibold'>
                            Nike Sponsored Preroll Ad
                          </span>
                          <h4 className='text-lg md:text-xl font-black text-[#FFFFFF] tracking-tight mt-0.5'>
                            {txn.productTitle}
                          </h4>
                          <p className='text-xs text-[#8A8A8A] max-w-sm mt-0.5'>
                            Dynamic dual-chamber air cushioning delivers responsive bounce with every stride.
                          </p>
                        </div>

                        <div className='flex items-center justify-between z-10 bg-[#000000]/90 -mx-4 -mb-4 p-2.5 border-t border-[#8A8A8A]/40'>
                          <div className='flex items-center gap-2'>
                            <Button
                              size='sm'
                              onClick={() => {
                                setCurrentStep(2);
                                toast.info('Ad Clicked!', {
                                  description: `Engagement recorded with Fingerprint ID ${selectedDevice.fingerprintId}`
                                });
                              }}
                              className={cn(
                                'h-7 font-mono text-xs font-bold transition-all border-none',
                                currentStep === 2
                                  ? 'bg-[#FFFFFF] text-[#000000]'
                                  : 'bg-[#1A1A1A] text-[#FFFFFF] hover:bg-[#333333] border border-[#8A8A8A]'
                              )}
                            >
                              <Icons.externalLink className='size-3 mr-1' />
                              {currentStep === 2 ? 'Ad Clicked (Engaged)' : 'Shop Now (Click Ad)'}
                            </Button>
                            <span className='text-[10px] font-mono text-[#8A8A8A] hidden sm:inline'>
                              CPC Cost: ₹{txn.youtubeClickCpcCost.toFixed(3)}
                            </span>
                          </div>
                          <span className='text-[10px] font-mono text-[#8A8A8A]'>Skip Ad in 5s</span>
                        </div>
                      </div>

                      <div className='rounded border border-[#8A8A8A]/40 bg-[#111111] p-2.5 flex items-start gap-2.5 text-xs font-mono text-[#FFFFFF]'>
                        <Icons.info className='size-4 text-[#FFFFFF] shrink-0 mt-0.5' />
                        <div>
                          <strong className='text-[#FFFFFF]'>Entropy Hash Recorded: </strong>
                          NEXUS tag captured WebGL + Canvas + Audio characteristics silently. Fingerprint{' '}
                          <code className='text-[#FFFFFF] underline'>{selectedDevice.fingerprintId}</code> registered.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stages 3 & 4: Amazon view */}
                  {(currentStep === 3 || currentStep === 4) && (
                    <div className='flex flex-col gap-3'>
                      <div className='bg-[#111111] rounded-lg p-3 border border-[#8A8A8A]/50 flex items-center justify-between gap-3'>
                        <div className='flex items-center gap-1.5'>
                          <span className='font-bold text-base text-[#FFFFFF] font-sans'>
                            amazon<span className='text-[#8A8A8A]'>.com</span>
                          </span>
                        </div>
                        <div className='flex-1 max-w-sm bg-[#000000] border border-[#8A8A8A]/40 rounded px-2.5 py-1 text-xs font-mono text-[#FFFFFF] flex items-center'>
                          <Icons.search className='size-3 text-[#8A8A8A] mr-2' />
                          <span className='truncate'>{txn.sku}</span>
                        </div>
                        <span className='text-xs font-mono font-bold text-[#FFFFFF]'>Prime 1-Day</span>
                      </div>

                      <div className='rounded-lg border border-[#8A8A8A]/50 bg-[#111111] p-4 flex flex-col sm:flex-row items-center gap-4'>
                        <div className='w-full sm:w-36 h-28 rounded bg-[#000000] border border-[#8A8A8A]/30 flex items-center justify-center p-2 shrink-0'>
                          <Icons.product className='size-12 text-[#FFFFFF]' />
                        </div>

                        <div className='flex-1 flex flex-col justify-between'>
                          <div>
                            <div className='flex items-center justify-between text-[11px] font-mono text-[#8A8A8A]'>
                              <span>ASIN: {txn.asin}</span>
                              <span className='text-[#FFFFFF] font-bold'>★★★★★ 4.9</span>
                            </div>
                            <h4 className='text-sm font-bold text-[#FFFFFF] mt-1 line-clamp-2'>
                              {txn.productTitle}
                            </h4>
                            <div className='text-base font-mono font-bold text-[#FFFFFF] mt-1'>
                              ₹{txn.grossRevenue.toFixed(2)}
                            </div>
                          </div>

                          <div className='mt-3'>
                            {currentStep === 3 ? (
                              <Button
                                size='sm'
                                onClick={() => {
                                  setCurrentStep(4);
                                  toast.success('Order Placed on Amazon!', {
                                    description: `Conversion tagged with Fingerprint ${selectedDevice.fingerprintId}`
                                  });
                                }}
                                className='bg-[#FFFFFF] hover:bg-[#CCCCCC] text-[#000000] font-bold text-xs h-7 px-4 w-full border-none'
                              >
                                <Icons.cart className='size-3.5 mr-1.5' />
                                Buy Now (1-Click Checkout ₹{txn.grossRevenue.toFixed(2)})
                              </Button>
                            ) : (
                              <div className='rounded bg-[#000000] border border-[#8A8A8A] p-2 flex items-center justify-between text-xs font-mono text-[#FFFFFF]'>
                                <span className='font-bold flex items-center gap-1.5'>
                                  <Icons.circleCheck className='size-4 text-[#FFFFFF]' />
                                  Order Confirmed: #{txn.orderId}
                                </span>
                                <span className='font-bold'>₹{txn.grossRevenue.toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className='rounded border border-[#8A8A8A]/40 bg-[#111111] p-2.5 flex items-start gap-2.5 text-xs font-mono text-[#FFFFFF]'>
                        <Icons.shieldCheck className='size-4 text-[#FFFFFF] shrink-0 mt-0.5' />
                        <div>
                          <strong className='text-[#FFFFFF]'>Walled Garden Bridged: </strong>
                          User arrived organically with zero UTMs, yet Fingerprint{' '}
                          <code className='text-[#FFFFFF] underline'>{selectedDevice.fingerprintId}</code> matched with{' '}
                          {selectedDevice.confidenceScore}% certainty!
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stage 5: Closed-Loop Resolved view */}
                  {currentStep === 5 && (
                    <div className='flex flex-col gap-3'>
                      <div className='rounded-lg border border-[#FFFFFF]/60 bg-[#111111] p-4 flex flex-col gap-3'>
                        <div className='flex items-center justify-between'>
                          <span className='text-xs font-mono font-bold uppercase tracking-wider text-[#FFFFFF] flex items-center gap-1.5'>
                            <Icons.shieldCheck className='size-4 text-[#FFFFFF]' />
                            Attribution Complete
                          </span>
                          <Badge className='bg-[#FFFFFF] text-[#000000] font-mono text-xs font-bold border-none'>
                            {realizedRoas}x Assisted ROAS
                          </Badge>
                        </div>

                        <div className='grid grid-cols-2 gap-3 text-xs font-mono'>
                          <div className='bg-[#000000] border border-[#8A8A8A]/40 rounded p-2.5'>
                            <span className='text-[#8A8A8A] block text-[10px] uppercase'>Siloed View (Flawed)</span>
                            <span className='text-[#8A8A8A] block font-bold mt-0.5'>0.0x ROAS (₹0 Rev)</span>
                            <span className='text-[10px] text-[#8A8A8A] block mt-1'>Recommendation: Kill ad</span>
                          </div>
                          <div className='bg-[#000000] border border-[#FFFFFF]/60 rounded p-2.5'>
                            <span className='text-[#FFFFFF] block text-[10px] uppercase font-bold'>NEXUS View (Real)</span>
                            <span className='text-[#FFFFFF] block font-black mt-0.5'>{realizedRoas}x ROAS (₹{txn.grossRevenue.toFixed(2)})</span>
                            <span className='text-[10px] text-[#FFFFFF] block mt-1 font-semibold'>Recommendation: Scale ad +25%</span>
                          </div>
                        </div>
                      </div>

                      <div className='rounded border border-[#8A8A8A]/40 bg-[#111111] p-2.5 flex items-start gap-2.5 text-xs font-mono text-[#FFFFFF]'>
                        <Icons.sparkles className='size-4 text-[#FFFFFF] shrink-0 mt-0.5' />
                        <div>
                          <strong className='text-[#FFFFFF]'>Autonomous SLSQP Engine Action: </strong>
                          Budget optimizer shifts <strong className='text-[#FFFFFF]'>₹4,500/day</strong> into YouTube top-of-funnel campaigns to feed downstream Amazon marketplace checkout loops.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Deep-dive details on active stage */}
            <div className='lg:col-span-5 flex flex-col justify-between rounded-lg border border-[#8A8A8A]/50 bg-[#000000] p-4 font-mono'>
              <div>
                <div className='flex items-center justify-between pb-2.5 border-b border-[#8A8A8A]/30 mb-3'>
                  <span className='text-[10px] font-bold uppercase tracking-wider text-[#FFFFFF] px-2 py-0.5 rounded bg-[#1A1A1A] border border-[#8A8A8A]/40'>
                    {currentStepData.badgeLabel}
                  </span>
                  <span className='text-[10px] text-[#8A8A8A]'>{currentStepData.timestamp}</span>
                </div>

                <h3 className='text-sm font-bold text-[#FFFFFF] mb-1.5'>{currentStepData.title}</h3>
                <p className='text-xs text-[#8A8A8A] font-sans leading-relaxed mb-3'>{currentStepData.summary}</p>

                <div className='space-y-1.5 mb-4'>
                  <span className='text-[10px] uppercase text-[#8A8A8A] tracking-wider block font-semibold'>
                    Telemetry &amp; Decision Logs:
                  </span>
                  {currentStepData.details.map((detail, idx) => (
                    <div key={idx} className='flex items-start gap-1.5 text-xs text-[#FFFFFF]'>
                      <Icons.arrowRight className='size-3 text-[#FFFFFF] shrink-0 mt-0.5' />
                      <span className='leading-tight'>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confidence rating strip */}
              <div className='rounded border border-[#8A8A8A]/40 bg-[#111111] p-2.5 mt-2'>
                <div className='flex items-center justify-between text-[11px] mb-1.5'>
                  <span className='text-[#8A8A8A] uppercase'>Entropy Confidence</span>
                  <span className='text-[#FFFFFF] font-bold'>{selectedDevice.confidenceScore}% Certainty</span>
                </div>
                <div className='w-full bg-[#000000] border border-[#8A8A8A]/30 h-1.5 rounded-full overflow-hidden'>
                  <div className='bg-[#FFFFFF] h-full transition-all duration-300' style={{ width: `${selectedDevice.confidenceScore}%` }} />
                </div>
                <div className='flex items-center justify-between text-[10px] text-[#8A8A8A] mt-1.5'>
                  <span>Active Hash: <code className='text-[#FFFFFF]'>{selectedDevice.fingerprintId}</code></span>
                  <span>Deterministic (No AI hallucination)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MULTI-TOUCH IDENTITY GRAPH */}
        {activeTab === 'graph' && (
          <div className='p-6 font-mono'>
            <div className='flex items-center justify-between pb-4 border-b border-[#8A8A8A]/30 mb-6'>
              <div>
                <h3 className='text-sm font-bold uppercase tracking-wider text-[#FFFFFF] flex items-center gap-2'>
                  <Icons.topology className='size-4 text-[#FFFFFF]' />
                  Identity Graph: Touchpoint Resolution Topology
                </h3>
                <p className='text-xs text-[#8A8A8A] font-sans mt-0.5'>
                  Siloed walled-garden touchpoints bridged by continuous hardware entropy hash.
                </p>
              </div>
              <Badge variant='outline' className='border-[#8A8A8A]/50 bg-[#000000] text-[#FFFFFF] text-xs font-mono'>
                Hash: {selectedDevice.fingerprintId}
              </Badge>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 py-4 relative'>
              {/* Node 1 */}
              <div className='rounded-lg border border-[#FFFFFF] bg-[#000000] p-4 text-center'>
                <div className='size-10 rounded-full bg-[#1A1A1A] border border-[#8A8A8A] flex items-center justify-center mx-auto mb-2 text-[#FFFFFF]'>
                  <Icons.youtube className='size-5' />
                </div>
                <span className='text-[10px] text-[#8A8A8A] font-bold uppercase'>Node 01</span>
                <h4 className='text-xs font-bold text-[#FFFFFF] mt-0.5'>YouTube Impression</h4>
                <p className='text-[10px] text-[#8A8A8A] mt-1'>Campaign: YT_AirMaxDn_Q4</p>
                <div className='mt-2 pt-2 border-t border-[#8A8A8A]/30 text-[10px] text-[#FFFFFF]'>
                  Cost: ₹{txn.youtubeImpressionCpmCost.toFixed(3)}
                </div>
              </div>

              {/* Node 2 */}
              <div className='rounded-lg border border-[#FFFFFF] bg-[#000000] p-4 text-center'>
                <div className='size-10 rounded-full bg-[#1A1A1A] border border-[#8A8A8A] flex items-center justify-center mx-auto mb-2 text-[#FFFFFF]'>
                  <Icons.externalLink className='size-5' />
                </div>
                <span className='text-[10px] text-[#8A8A8A] font-bold uppercase'>Node 02</span>
                <h4 className='text-xs font-bold text-[#FFFFFF] mt-0.5'>YouTube Ad Click</h4>
                <p className='text-[10px] text-[#8A8A8A] mt-1'>Dwell: 14.2s (No checkout)</p>
                <div className='mt-2 pt-2 border-t border-[#8A8A8A]/30 text-[10px] text-[#FFFFFF]'>
                  CPC: ₹{txn.youtubeClickCpcCost.toFixed(3)}
                </div>
              </div>

              {/* Node 3 */}
              <div className='rounded-lg border border-[#FFFFFF] bg-[#000000] p-4 text-center'>
                <div className='size-10 rounded-full bg-[#1A1A1A] border border-[#8A8A8A] flex items-center justify-center mx-auto mb-2 text-[#FFFFFF]'>
                  <Icons.amazon className='size-5' />
                </div>
                <span className='text-[10px] text-[#8A8A8A] font-bold uppercase'>Node 03</span>
                <h4 className='text-xs font-bold text-[#FFFFFF] mt-0.5'>Amazon Search Visit</h4>
                <p className='text-[10px] text-[#8A8A8A] mt-1'>0 UTMs • Direct typed</p>
                <div className='mt-2 pt-2 border-t border-[#8A8A8A]/30 text-[10px] text-[#FFFFFF]'>
                  ● Match: {selectedDevice.confidenceScore}% Identical
                </div>
              </div>

              {/* Node 4 */}
              <div className='rounded-lg border border-[#FFFFFF] bg-[#000000] p-4 text-center'>
                <div className='size-10 rounded-full bg-[#1A1A1A] border border-[#8A8A8A] flex items-center justify-center mx-auto mb-2 text-[#FFFFFF]'>
                  <Icons.cart className='size-5' />
                </div>
                <span className='text-[10px] text-[#8A8A8A] font-bold uppercase'>Node 04</span>
                <h4 className='text-xs font-bold text-[#FFFFFF] mt-0.5'>Amazon 1-Click Buy</h4>
                <p className='text-[10px] text-[#8A8A8A] mt-1'>Order #{txn.orderId}</p>
                <div className='mt-2 pt-2 border-t border-[#8A8A8A]/30 text-[10px] text-[#FFFFFF] font-bold'>
                  ₹{txn.grossRevenue.toFixed(2)} Attributed
                </div>
              </div>
            </div>

            <div className='mt-6 pt-4 border-t border-[#8A8A8A]/30 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs'>
              <div className='bg-[#000000] border border-[#8A8A8A]/40 rounded p-2.5'>
                <span className='text-[#8A8A8A] block text-[10px] uppercase'>Journey Latency</span>
                <span className='text-[#FFFFFF] font-bold'>6 Hours 21 Minutes</span>
              </div>
              <div className='bg-[#000000] border border-[#8A8A8A]/40 rounded p-2.5'>
                <span className='text-[#8A8A8A] block text-[10px] uppercase'>Total Incurred Ad Spend</span>
                <span className='text-[#FFFFFF] font-bold'>₹{txn.totalAttributedAdSpend.toFixed(3)}</span>
              </div>
              <div className='bg-[#000000] border border-[#8A8A8A]/40 rounded p-2.5'>
                <span className='text-[#8A8A8A] block text-[10px] uppercase'>Gross Attributed Value</span>
                <span className='text-[#FFFFFF] font-bold'>₹{txn.grossRevenue.toFixed(2)}</span>
              </div>
              <div className='bg-[#000000] border border-[#8A8A8A]/40 rounded p-2.5'>
                <span className='text-[#8A8A8A] block text-[10px] uppercase'>Attributed Lift Factor</span>
                <span className='text-[#FFFFFF] font-bold'>{realizedRoas}x ROAS</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TELEMETRY JSON STREAM */}
        {activeTab === 'telemetry' && (
          <div className='p-5 font-mono'>
            <div className='flex items-center justify-between pb-3 border-b border-[#8A8A8A]/30 mb-3'>
              <div className='flex items-center gap-2'>
                <Icons.code className='size-4 text-[#FFFFFF]' />
                <h3 className='text-xs font-bold text-[#FFFFFF] uppercase tracking-wider'>
                  DuckDB Ingestion Telemetry Payload
                </h3>
              </div>
              <Badge variant='outline' className='border-[#8A8A8A]/50 text-[#FFFFFF] bg-[#000000] text-[10px] font-bold'>
                ● HTTP 200 INGESTED
              </Badge>
            </div>

            <pre className='bg-[#000000] text-[#FFFFFF] border border-[#8A8A8A]/40 rounded-lg p-4 text-xs overflow-x-auto leading-relaxed max-h-96'>
              {JSON.stringify(currentStepData.eventPayload, null, 2)}
            </pre>
          </div>
        )}

        {/* TAB 4: SDK CODE & SQL */}
        {activeTab === 'code' && (
          <div className='p-5 grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs'>
            {/* SDK Code */}
            <div className='rounded-lg border border-[#8A8A8A]/40 bg-[#000000] p-4'>
              <div className='flex items-center justify-between pb-2.5 border-b border-[#8A8A8A]/30 mb-3'>
                <span className='font-bold text-[#FFFFFF] text-xs flex items-center gap-1.5'>
                  <Icons.code className='size-3.5 text-[#FFFFFF]' />
                  Client Cookieless Generator (`nexus-fp.js`)
                </span>
                <Badge variant='outline' className='text-[10px] border-[#8A8A8A] text-[#8A8A8A] bg-[#111111]'>
                  1.4 kB • Zero Cookies
                </Badge>
              </div>
              <pre className='bg-[#111111] text-[#FFFFFF] p-3 rounded text-[11px] overflow-x-auto leading-relaxed border border-[#8A8A8A]/30'>
{`// NEXUS Deterministic Hardware Fingerprint Engine
async function computeNexusFingerprint() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('NEXUS_FP_ENTROPY_VECTOR', 2, 2);
  const canvasHash = sha256(canvas.toDataURL());

  const gl = canvas.getContext('webgl');
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const audioHash = osc.frequency.value.toFixed(8);

  const entropyPayload = {
    canvasHash,
    gpu,
    audioHash,
    screen: \`\${screen.width}x\${screen.height}@\${window.devicePixelRatio}\`,
    cores: navigator.hardwareConcurrency,
    ram: navigator.deviceMemory
  };

  const fpId = 'FP-' + sha256(JSON.stringify(entropyPayload)).slice(0, 16);
  return { fpId, entropyPayload };
}`}
              </pre>
            </div>

            {/* SQL Attribution Query */}
            <div className='rounded-lg border border-[#8A8A8A]/40 bg-[#000000] p-4'>
              <div className='flex items-center justify-between pb-2.5 border-b border-[#8A8A8A]/30 mb-3'>
                <span className='font-bold text-[#FFFFFF] text-xs flex items-center gap-1.5'>
                  <Icons.product className='size-3.5 text-[#FFFFFF]' />
                  DuckDB Cross-Platform Attribution Query
                </span>
                <Badge variant='outline' className='text-[10px] border-[#8A8A8A] text-[#8A8A8A] bg-[#111111]'>
                  SQL Query
                </Badge>
              </div>
              <pre className='bg-[#111111] text-[#FFFFFF] p-3 rounded text-[11px] overflow-x-auto leading-relaxed border border-[#8A8A8A]/30'>
{`-- Stitch YouTube impressions to Amazon checkout
SELECT
  yt.fingerprint_id,
  yt.ad_campaign       AS youtube_campaign,
  yt.cost_usd          AS total_ad_spend,
  amz.order_id         AS amazon_order,
  amz.revenue_usd      AS amazon_revenue,
  date_diff('hour', yt.timestamp, amz.timestamp) AS latency_hours,
  ROUND(amz.revenue_usd / yt.cost_usd, 2) AS assisted_roas
FROM nexus_telemetry.youtube_ads yt
JOIN nexus_telemetry.amazon_orders amz
  ON yt.fingerprint_id = amz.fingerprint_id
WHERE yt.event_type = 'AD_CLICK'
  AND amz.event_type = 'PURCHASE_CONVERSION'
  AND amz.timestamp > yt.timestamp;`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
