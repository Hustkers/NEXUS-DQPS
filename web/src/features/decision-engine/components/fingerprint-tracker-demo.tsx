'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

const SAMPLE_DEVICES: DeviceProfile[] = [
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

interface JourneyStep {
  stepNumber: number;
  title: string;
  platform: 'youtube' | 'amazon' | 'nexus';
  badgeLabel: string;
  summary: string;
  timestamp: string;
  details: string[];
  eventPayload: Record<string, any>;
}

export function FingerprintTrackerDemo() {
  const [selectedDevice, setSelectedDevice] = useState<DeviceProfile>(SAMPLE_DEVICES[0]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'simulation' | 'graph' | 'telemetry' | 'code'>('simulation');
  const [copiedFp, setCopiedFp] = useState<boolean>(false);
  const [cartState, setCartState] = useState<'idle' | 'adding' | 'purchased'>('idle');

  // Journey steps definition dynamically attached to current selected device
  const journeySteps: JourneyStep[] = [
    {
      stepNumber: 1,
      title: 'YouTube Session: Nike Air Max Dn Ad Impression',
      platform: 'youtube',
      badgeLabel: 'STAGE 1: AD IMPRESSION',
      summary: 'User opens YouTube to watch a tech review. A 15-second Nike Air Max Dn preroll video ad plays.',
      timestamp: 'Today, 10:14:02 AM',
      details: [
        `Client hardware & canvas entropy evaluated on YouTube page via NEXUS cookieless pixel.`,
        `Deterministic device fingerprint generated: ${selectedDevice.fingerprintId}`,
        `Impression logged: Campaign "YT_Brand_AirMaxDn_Q4", Cost CPM $0.024`,
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
        sku_promoted: 'AH8050-100 (Nike Air Max Dn)',
        cost_usd: 0.024,
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
      badgeLabel: 'STAGE 2: AD ENGAGEMENT',
      summary: 'User watches 8 seconds, gets hooked, and clicks "Shop Now / Explore". They browse the product briefly, but do NOT purchase and close the tab.',
      timestamp: 'Today, 10:14:18 AM',
      details: [
        `Click event registered with matching Fingerprint ID: ${selectedDevice.fingerprintId}`,
        `Ad interaction logged: Cost CPC $0.85`,
        `User lands on campaign landing page, explores colorways, but leaves without converting.`,
        `Standard ad networks now consider this user "lost / bounced" unless cross-channel retargeting exists.`
      ],
      eventPayload: {
        event_id: 'evt_yt_clk_4810',
        event_type: 'AD_CLICK',
        platform: 'youtube',
        timestamp: '2026-10-07T10:14:18.012Z',
        fingerprint_id: selectedDevice.fingerprintId,
        ad_campaign: 'YT_Brand_AirMaxDn_Q4',
        cost_usd: 0.85,
        click_target: 'https://nike.com/campaign/airmax-dn?utm_source=youtube',
        dwell_time_seconds: 14.2,
        action_outcome: 'TAB_CLOSED_NO_CONVERSION'
      }
    },
    {
      stepNumber: 3,
      title: 'Amazon Session: Independent Marketplace Visit',
      platform: 'amazon',
      badgeLabel: 'STAGE 3: WALLED-GARDEN GAP',
      summary: 'Hours later, user independently opens Amazon.com on the same device and searches "nike air max dn".',
      timestamp: 'Today, 04:32:45 PM (+6h 18m later)',
      details: [
        `Crucial Gap: User did NOT click a link or ad to enter Amazon. They typed "amazon.com" directly.`,
        `Zero UTM parameters. Zero referral headers. Zero 3rd-party cookies (blocked by Chrome/Safari).`,
        `NEXUS Amazon Storefront Tag executes client-side WebGL + Canvas + Audio fingerprinting.`,
        `IDENTICAL Fingerprint ID computed: ${selectedDevice.fingerprintId} (Hardware signature matches 100%)!`,
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
        search_query: 'nike air max dn',
        sku_viewed: 'AH8050-100',
        product_title: 'Nike Air Max Dn Running & Lifestyle Shoes - Triple Black',
        marketplace_price_usd: 170.00,
        graph_identity_confidence: `${selectedDevice.confidenceScore}% (DETERMINISTIC_HARDWARE_MATCH)`
      }
    },
    {
      stepNumber: 4,
      title: 'Amazon Checkout: Complete Purchase Conversion',
      platform: 'amazon',
      badgeLabel: 'STAGE 4: PURCHASE CONVERSION',
      summary: 'User selects Size 10.5 and completes 1-Click Buy on Amazon for $170.00.',
      timestamp: 'Today, 04:35:10 PM',
      details: [
        `Order confirmed: Order #AMZ-9482-DN77 for $170.00.`,
        `Conversion telemetry sent to NEXUS Ingestion Engine with Fingerprint ID: ${selectedDevice.fingerprintId}`,
        `Amazon internal analytics attributes this as: "Direct Amazon Organic Search / Unpaid Traffic".`,
        `NEXUS Identity Graph unlocks the full truth: YouTube Ad generated the demand!`
      ],
      eventPayload: {
        event_id: 'evt_amz_ord_8831',
        event_type: 'PURCHASE_CONVERSION',
        platform: 'amazon',
        timestamp: '2026-10-07T16:35:10.420Z',
        fingerprint_id: selectedDevice.fingerprintId,
        order_id: 'AMZ-9482-DN77',
        sku: 'AH8050-100',
        revenue_usd: 170.00,
        estimated_gross_margin_usd: 93.50,
        payment_method: 'Amazon Pay (1-Click)'
      }
    },
    {
      stepNumber: 5,
      title: 'NEXUS Closed-Loop Graph Attribution & ROAS Lift',
      platform: 'nexus',
      badgeLabel: 'STAGE 5: ATTRIBUTION RESOLVED',
      summary: 'The single Fingerprint ID connects the siloed platforms. YouTube ROAS jumps from 0.00x to 194.5x, preventing budget cuts!',
      timestamp: 'Real-Time Sync • Just Now',
      details: [
        `Without Fingerprint: Marketer sees $0.87 YouTube ad spend with $0 revenue -> Cuts YouTube budget!`,
        `With NEXUS Fingerprint: Full cross-channel journey proven (YouTube View -> YouTube Click -> Amazon Buy).`,
        `Assisted ROAS calculated: $170.00 revenue / $0.874 total ad spend = 194.5x ROAS!`,
        `NEXUS SLSQP Optimizer Recommendation: Scale YouTube campaign budget by +25% ($4,500/day shift).`
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
            youtube_assisted_roas: '194.5x',
            downstream_marketplace_halo_lift: '+38.4%',
            actionable_decision: 'PRESERVE & SCALE YOUTUBE AD SPEND'
          }
        }
      }
    }
  ];

  // Auto-play timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setTimeout(() => {
        if (currentStep < 5) {
          setCurrentStep((prev) => prev + 1);
        } else {
          setIsPlaying(false);
          toast.success('Simulation Completed!', {
            description: 'Cross-channel journey successfully stitched via Fingerprint ID.'
          });
        }
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep]);

  const handleCopyFp = () => {
    navigator.clipboard.writeText(selectedDevice.fingerprintId);
    setCopiedFp(true);
    toast.success('Fingerprint ID Copied', {
      description: selectedDevice.fingerprintId
    });
    setTimeout(() => setCopiedFp(false), 2000);
  };

  const handleStepClick = (stepNum: number) => {
    setIsPlaying(false);
    setCurrentStep(stepNum);
  };

  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(1);
    setCartState('idle');
    toast.info('Journey Reset', {
      description: 'Restarted journey from initial YouTube ad impression.'
    });
  };

  const currentStepData = journeySteps[currentStep - 1];

  return (
    <div className='flex flex-col gap-6 text-zinc-100'>
      {/* Hero Banner with Fingerprint HUD */}
      <div className='relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-[#0a0d16] to-zinc-950 p-6 shadow-2xl'>
        <div className='absolute -right-16 -top-16 size-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none' />
        <div className='absolute -left-16 -bottom-16 size-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none' />

        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10'>
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <Badge variant='outline' className='border-cyan-500/40 bg-cyan-950/40 text-cyan-300 font-mono text-[11px] px-2.5 py-0.5 uppercase tracking-wider flex items-center gap-1.5'>
                <Icons.fingerprint className='size-3.5 text-cyan-400' />
                Cookieless Cross-Channel Attribution
              </Badge>
              <Badge variant='outline' className='border-emerald-500/40 bg-emerald-950/40 text-emerald-300 font-mono text-[11px] px-2 py-0.5 flex items-center gap-1'>
                <span className='size-1.5 rounded-full bg-emerald-400 animate-pulse' />
                Live Graph Engine
              </Badge>
            </div>
            <h2 className='text-2xl md:text-3xl font-mono font-bold text-zinc-50 tracking-tight'>
              Single Fingerprint ID Journey Tracking Demo
            </h2>
            <p className='text-xs md:text-sm font-sans text-zinc-400 mt-1 max-w-3xl leading-relaxed'>
              Witness how a single deterministic device fingerprint tracks a user from seeing and clicking a 
              <span className='text-red-400 font-medium'> YouTube video ad</span> to an independent, non-cookie, non-UTM search and checkout on 
              <span className='text-amber-400 font-medium'> Amazon</span> — seamlessly attributing true ROI.
            </p>
          </div>

          {/* Persistent Fingerprint ID Badge */}
          <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl p-3.5 backdrop-blur-md shadow-lg'>
            <div className='flex items-center gap-3'>
              <div className='size-11 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0'>
                <Icons.fingerprint className='size-6 text-cyan-400 animate-pulse' />
              </div>
              <div>
                <div className='text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5'>
                  Active Device Fingerprint ID
                  <span className='text-emerald-400 text-[10px] font-mono'>({selectedDevice.confidenceScore}% match)</span>
                </div>
                <div className='font-mono font-bold text-sm md:text-base text-cyan-300 tracking-wider flex items-center gap-2'>
                  {selectedDevice.fingerprintId}
                  <button
                    onClick={handleCopyFp}
                    className='text-zinc-400 hover:text-cyan-200 transition-colors'
                    title='Copy Fingerprint ID'
                  >
                    {copiedFp ? <Icons.check className='size-4 text-emerald-400' /> : <Icons.post className='size-4' />}
                  </button>
                </div>
              </div>
            </div>

            <div className='h-8 w-px bg-zinc-800 hidden sm:block' />

            {/* Device Switcher */}
            <div className='flex items-center gap-1.5'>
              <span className='text-[10px] font-mono text-zinc-500 uppercase'>Device:</span>
              <select
                aria-label='Select Device Profile'
                value={selectedDevice.id}
                onChange={(e) => {
                  const dev = SAMPLE_DEVICES.find(d => d.id === e.target.value);
                  if (dev) {
                    setSelectedDevice(dev);
                    toast.info(`Switched Device: ${dev.name}`, {
                      description: `Active Fingerprint: ${dev.fingerprintId}`
                    });
                  }
                }}
                className='h-8 text-xs font-mono bg-zinc-950 border border-zinc-700 rounded-md px-2 text-zinc-200 focus:outline-none focus:border-cyan-500'
              >
                {SAMPLE_DEVICES.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Device Entropy Factors Bar */}
        <div className='mt-5 pt-4 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-[11px] font-mono'>
          <div className='bg-zinc-900/60 border border-zinc-800 rounded-lg p-2'>
            <span className='text-zinc-500 block text-[10px] uppercase'>Canvas 2D Hash</span>
            <span className='text-cyan-400 font-semibold truncate block'>{selectedDevice.canvasHash}</span>
          </div>
          <div className='bg-zinc-900/60 border border-zinc-800 rounded-lg p-2'>
            <span className='text-zinc-500 block text-[10px] uppercase'>WebGL GPU</span>
            <span className='text-purple-400 font-semibold truncate block' title={selectedDevice.gpuRenderer}>
              {selectedDevice.gpuRenderer.split('(')[0]}
            </span>
          </div>
          <div className='bg-zinc-900/60 border border-zinc-800 rounded-lg p-2'>
            <span className='text-zinc-500 block text-[10px] uppercase'>Audio Latency</span>
            <span className='text-emerald-400 font-semibold truncate block'>{selectedDevice.audioHash}</span>
          </div>
          <div className='bg-zinc-900/60 border border-zinc-800 rounded-lg p-2'>
            <span className='text-zinc-500 block text-[10px] uppercase'>Resolution / DPR</span>
            <span className='text-amber-400 font-semibold truncate block'>{selectedDevice.screenResolution}</span>
          </div>
          <div className='bg-zinc-900/60 border border-zinc-800 rounded-lg p-2'>
            <span className='text-zinc-500 block text-[10px] uppercase'>CPU Cores / RAM</span>
            <span className='text-zinc-300 font-semibold truncate block'>
              {selectedDevice.hardwareConcurrency} Cores • {selectedDevice.deviceMemoryGb}GB
            </span>
          </div>
          <div className='bg-zinc-900/60 border border-zinc-800 rounded-lg p-2'>
            <span className='text-zinc-500 block text-[10px] uppercase'>Subnet Geohash</span>
            <span className='text-blue-400 font-semibold truncate block'>{selectedDevice.ipSubnet.split(' ')[0]}</span>
          </div>
        </div>
      </div>

      {/* Interactive Step-by-Step Navigation Bar */}
      <div className='rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-sm'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-zinc-800'>
          <div className='flex items-center gap-2'>
            <Icons.topology className='size-5 text-cyan-400' />
            <h3 className='font-mono text-sm font-bold text-zinc-100 uppercase tracking-tight'>
              Interactive Journey Timeline (Single User Flow)
            </h3>
          </div>

          {/* Action buttons */}
          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              variant={isPlaying ? 'destructive' : 'default'}
              onClick={() => setIsPlaying(!isPlaying)}
              className={cn(
                'h-8 text-xs font-mono font-medium',
                isPlaying ? 'bg-red-950 text-red-300 border border-red-800 hover:bg-red-900' : 'bg-cyan-600 hover:bg-cyan-500 text-zinc-950'
              )}
            >
              {isPlaying ? (
                <>
                  <Icons.eyeOff className='mr-1.5 size-3.5' />
                  Pause Auto-Play
                </>
              ) : (
                <>
                  <Icons.play className='mr-1.5 size-3.5' />
                  Auto-Play Journey
                </>
              )}
            </Button>

            <Button
              size='sm'
              variant='outline'
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className='h-8 text-xs font-mono border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-40'
            >
              <Icons.chevronLeft className='size-3.5 mr-1' />
              Prev
            </Button>

            <Button
              size='sm'
              variant='outline'
              onClick={handleNextStep}
              disabled={currentStep === 5}
              className='h-8 text-xs font-mono border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-40'
            >
              Next
              <Icons.chevronRight className='size-3.5 ml-1' />
            </Button>

            <Button
              size='sm'
              variant='ghost'
              onClick={handleReset}
              className='h-8 text-xs font-mono text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 px-2'
              title='Reset to Step 1'
            >
              <Icons.clock className='size-3.5 mr-1' />
              Reset
            </Button>
          </div>
        </div>

        {/* Step Flow Indicators */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2'>
          {journeySteps.map((step) => {
            const isCurrent = currentStep === step.stepNumber;
            const isCompleted = currentStep > step.stepNumber;
            const isPending = currentStep < step.stepNumber;

            return (
              <button
                key={step.stepNumber}
                onClick={() => handleStepClick(step.stepNumber)}
                className={cn(
                  'text-left rounded-lg p-3 transition-all border font-mono relative overflow-hidden',
                  isCurrent && 'border-cyan-500 bg-cyan-950/40 ring-1 ring-cyan-500/50 shadow-md',
                  isCompleted && 'border-emerald-600/60 bg-emerald-950/20 hover:border-emerald-500',
                  isPending && 'border-zinc-800 bg-zinc-900/40 opacity-70 hover:opacity-100 hover:border-zinc-700'
                )}
              >
                <div className='flex items-center justify-between mb-1.5'>
                  <span className={cn(
                    'text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded',
                    step.platform === 'youtube' && 'bg-red-950 text-red-300 border border-red-800/60',
                    step.platform === 'amazon' && 'bg-amber-950 text-amber-300 border border-amber-800/60',
                    step.platform === 'nexus' && 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                  )}>
                    Step 0{step.stepNumber}
                  </span>

                  {isCompleted && <Icons.circleCheck className='size-3.5 text-emerald-400' />}
                  {isCurrent && <span className='size-2 rounded-full bg-cyan-400 animate-ping' />}
                </div>

                <div className='text-xs font-bold text-zinc-200 line-clamp-1'>
                  {step.platform === 'youtube' && '📺 YouTube'}
                  {step.platform === 'amazon' && '🛒 Amazon'}
                  {step.platform === 'nexus' && '⚡ NEXUS Graph'}
                </div>
                <div className='text-[11px] text-zinc-400 line-clamp-1 mt-0.5'>
                  {step.title.split(':')[1]?.trim() || step.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main View Tabs (Simulation Screen, Graph Visualizer, Raw Telemetry, SDK Code) */}
      <div className='flex items-center gap-2 border-b border-zinc-800 pb-2 text-xs font-mono'>
        <button
          onClick={() => setActiveTab('simulation')}
          className={cn(
            'px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2',
            activeTab === 'simulation' ? 'bg-zinc-800 text-cyan-400 font-bold border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200'
          )}
        >
          <Icons.laptop className='size-3.5' />
          1. Interactive Screen Simulation
        </button>
        <button
          onClick={() => setActiveTab('graph')}
          className={cn(
            'px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2',
            activeTab === 'graph' ? 'bg-zinc-800 text-cyan-400 font-bold border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200'
          )}
        >
          <Icons.topology className='size-3.5' />
          2. Identity Graph Node View
        </button>
        <button
          onClick={() => setActiveTab('telemetry')}
          className={cn(
            'px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2',
            activeTab === 'telemetry' ? 'bg-zinc-800 text-cyan-400 font-bold border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200'
          )}
        >
          <Icons.code className='size-3.5' />
          3. Raw Ingestion Telemetry Stream
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={cn(
            'px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2',
            activeTab === 'code' ? 'bg-zinc-800 text-cyan-400 font-bold border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200'
          )}
        >
          <Icons.file className='size-3.5' />
          4. Fingerprint SDK &amp; SQL Query
        </button>
      </div>

      {/* TAB CONTENT 1: INTERACTIVE SIMULATION */}
      {activeTab === 'simulation' && (
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* Left Side: Mock Screen / Device View */}
          <div className='lg:col-span-7 flex flex-col gap-4'>
            <div className='rounded-xl border border-zinc-800 bg-[#0c0e14] overflow-hidden shadow-2xl'>
              {/* Browser Mock Window Header */}
              <div className='bg-zinc-900/90 border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <span className='size-3 rounded-full bg-red-500/80 inline-block' />
                  <span className='size-3 rounded-full bg-amber-500/80 inline-block' />
                  <span className='size-3 rounded-full bg-emerald-500/80 inline-block' />
                  <span className='ml-2 text-xs font-mono text-zinc-400 truncate max-w-[200px]'>
                    {currentStep <= 2 ? 'youtube.com/watch?v=running-shoe-tech-2026' : 'amazon.com/s?k=nike+air+max+dn'}
                  </span>
                </div>

                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className='border-cyan-500/40 bg-cyan-950/40 text-cyan-300 text-[10px] font-mono px-2 py-0.5 flex items-center gap-1'>
                    <Icons.fingerprint className='size-3' />
                    {selectedDevice.fingerprintId}
                  </Badge>
                </div>
              </div>

              {/* Screen Body */}
              <div className='p-5 min-h-[420px] flex flex-col justify-between bg-gradient-to-b from-zinc-950 to-[#080a0f]'>
                {/* STEP 1 & 2: YOUTUBE UI */}
                {currentStep <= 2 && (
                  <div className='flex flex-col gap-4'>
                    {/* YouTube Video Player Mock */}
                    <div className='relative aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 flex flex-col justify-between p-4 group'>
                      <div className='flex items-center justify-between z-10'>
                        <div className='flex items-center gap-2 bg-black/60 backdrop-blur px-2.5 py-1 rounded-md text-xs font-mono text-zinc-300'>
                          <Icons.youtube className='size-4 text-red-500' />
                          YouTube Video Player
                        </div>
                        <Badge className='bg-amber-500 text-black font-bold text-[10px] uppercase font-mono'>
                          Ad 1 of 2 • 0:08 / 0:15
                        </Badge>
                      </div>

                      {/* Video Center / Ad Content */}
                      <div className='my-auto flex flex-col items-center justify-center text-center p-4 z-10'>
                        <div className='size-14 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center mb-3 animate-pulse'>
                          <Icons.play className='size-7 text-red-400 fill-red-400 ml-0.5' />
                        </div>
                        <span className='text-xs font-mono uppercase text-red-400 tracking-wider font-semibold'>
                          Nike Sponsored Preroll Ad
                        </span>
                        <h4 className='text-xl md:text-2xl font-black text-white tracking-tight mt-1'>
                          Nike Air Max Dn — Feel The Unreal.
                        </h4>
                        <p className='text-xs text-zinc-400 max-w-md mt-1'>
                          Dynamic dual-chamber air tubes deliver energized bounce with every stride. Available now.
                        </p>
                      </div>

                      {/* Video Controls & CTA overlay */}
                      <div className='flex items-center justify-between z-10 bg-black/70 backdrop-blur-md -mx-4 -mb-4 p-3 border-t border-zinc-800'>
                        <div className='flex items-center gap-3'>
                          <Button
                            size='sm'
                            onClick={() => {
                              setCurrentStep(2);
                              toast.info('Ad Clicked!', {
                                description: `Engagement logged with Fingerprint ID ${selectedDevice.fingerprintId}`
                              });
                            }}
                            className={cn(
                              'h-8 font-mono text-xs font-bold transition-all',
                              currentStep === 2
                                ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400'
                                : 'bg-red-600 text-white hover:bg-red-500'
                            )}
                          >
                            <Icons.externalLink className='size-3.5 mr-1.5' />
                            {currentStep === 2 ? 'Ad Clicked (Engaged)' : 'Shop Now (Click Ad)'}
                          </Button>
                          <span className='text-[11px] font-mono text-zinc-400 hidden sm:inline'>
                            nike.com/airmax-dn
                          </span>
                        </div>

                        <div className='text-xs font-mono text-zinc-400'>
                          Skip in 4s
                        </div>
                      </div>

                      {/* Video Progress Bar */}
                      <div className='absolute bottom-0 left-0 right-0 h-1 bg-zinc-800'>
                        <div className='h-full bg-red-600 transition-all duration-500 w-[55%]' />
                      </div>
                    </div>

                    {/* Telemetry pill */}
                    <div className='rounded-lg border border-red-900/40 bg-red-950/20 p-3 flex items-start gap-3 text-xs font-mono text-zinc-300'>
                      <Icons.info className='size-4 text-red-400 shrink-0 mt-0.5' />
                      <div>
                        <span className='text-red-400 font-bold'>Client WebGL / Canvas Entropy Captured: </span>
                        NEXUS tag executed silently on YouTube ad render. Fingerprint <code className='text-cyan-300'>{selectedDevice.fingerprintId}</code> registered with 0 cookies.
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3 & 4: AMAZON UI */}
                {(currentStep === 3 || currentStep === 4) && (
                  <div className='flex flex-col gap-4'>
                    {/* Amazon Search & Header Mock */}
                    <div className='bg-[#131921] rounded-lg p-3 border border-zinc-800 flex items-center justify-between gap-3'>
                      <div className='flex items-center gap-2'>
                        <span className='font-bold text-lg text-white font-sans tracking-tight flex items-center'>
                          amazon<span className='text-amber-500'>.com</span>
                        </span>
                      </div>
                      <div className='flex-1 max-w-md bg-white rounded-md flex items-center px-3 py-1 text-zinc-900 text-xs font-sans'>
                        <Icons.search className='size-3.5 text-zinc-500 mr-2' />
                        <span className='font-medium text-zinc-800'>nike air max dn</span>
                      </div>
                      <div className='flex items-center gap-2 text-xs text-white font-sans'>
                        <span className='text-amber-400 font-bold text-xs'>Prime</span>
                        <div className='relative'>
                          <Icons.cart className='size-5 text-white' />
                          {cartState !== 'idle' && (
                            <span className='absolute -top-1.5 -right-2 bg-amber-500 text-black text-[9px] font-bold rounded-full size-4 flex items-center justify-center'>
                              1
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Amazon Product Display Card */}
                    <div className='rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center'>
                      <div className='sm:col-span-4 rounded-lg bg-zinc-950 p-3 border border-zinc-800 flex items-center justify-center'>
                        {/* Nike Shoe Mock Preview */}
                        <div className='relative text-center'>
                          <img
                            src='https://c.static-nike.com/a/images/t_PDP_1728_v1/awjogtdnqxniqqk0wpgf/air-max-270-shoe-2V5C4p.jpg'
                            alt='Nike Air Max Dn'
                            className='w-full h-32 object-contain rounded drop-shadow-md'
                          />
                          <Badge className='absolute top-0 right-0 bg-zinc-800 text-cyan-300 text-[10px] font-mono'>
                            AH8050-100
                          </Badge>
                        </div>
                      </div>

                      <div className='sm:col-span-8 flex flex-col justify-between h-full'>
                        <div>
                          <div className='text-xs font-sans text-amber-500 flex items-center gap-1'>
                            <span>★★★★★</span>
                            <span className='text-zinc-400 text-[11px]'>(4.8 from 1,280 ratings)</span>
                          </div>
                          <h4 className='text-sm md:text-base font-bold text-white mt-1'>
                            Nike Men's Air Max Dn Running &amp; Street Shoes (Triple Black)
                          </h4>
                          <div className='text-xs font-mono text-emerald-400 mt-1 flex items-center gap-2'>
                            <span className='text-lg font-bold text-white'>$170.00</span>
                            <Badge variant='outline' className='border-emerald-500/40 text-emerald-300 text-[10px]'>
                              In Stock (Prime 1-Day)
                            </Badge>
                          </div>
                          <p className='text-[11px] text-zinc-400 mt-1'>
                            Size: <span className='text-white font-bold'>10.5 US</span> • Color: Black/Metallic Dark Grey
                          </p>
                        </div>

                        {/* Buy Actions */}
                        <div className='mt-4 flex items-center gap-3'>
                          {currentStep === 3 ? (
                            <Button
                              size='sm'
                              onClick={() => {
                                setCartState('purchased');
                                setCurrentStep(4);
                                toast.success('Order Placed on Amazon!', {
                                  description: `Conversion logged with Fingerprint ID ${selectedDevice.fingerprintId}`
                                });
                              }}
                              className='bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold font-sans text-xs h-8 px-4 flex-1'
                            >
                              <Icons.cart className='size-3.5 mr-1.5' />
                              Buy Now (1-Click Checkout $170.00)
                            </Button>
                          ) : (
                            <div className='rounded-lg bg-emerald-950/60 border border-emerald-500/40 p-2.5 w-full flex items-center justify-between text-xs font-mono text-emerald-300'>
                              <div className='flex items-center gap-2'>
                                <Icons.circleCheck className='size-4 text-emerald-400' />
                                <span className='font-bold'>Order Confirmed: #AMZ-9482-DN77</span>
                              </div>
                              <span className='text-white font-bold'>$170.00</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Attribution Reality Pill */}
                    <div className='rounded-lg border border-amber-900/40 bg-amber-950/20 p-3 flex items-start gap-3 text-xs font-mono text-zinc-300'>
                      <Icons.warning className='size-4 text-amber-400 shrink-0 mt-0.5' />
                      <div>
                        <span className='text-amber-400 font-bold'>Walled-Garden Isolation Overcome: </span>
                        User came to Amazon directly via organic search (no UTMs). Amazon has no Google cookies. 
                        Yet NEXUS regenerated Fingerprint <code className='text-cyan-300'>{selectedDevice.fingerprintId}</code> with 99.8% match confidence.
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: NEXUS CLOSED-LOOP RESOLUTION UI */}
                {currentStep === 5 && (
                  <div className='flex flex-col gap-4'>
                    <div className='rounded-xl border border-cyan-500/40 bg-cyan-950/20 p-4'>
                      <div className='flex items-center justify-between mb-3'>
                        <div className='flex items-center gap-2'>
                          <Icons.shieldCheck className='size-5 text-cyan-400' />
                          <h4 className='font-mono text-sm font-bold text-zinc-100 uppercase tracking-tight'>
                            Deterministic Multi-Touch Attribution Resolved
                          </h4>
                        </div>
                        <Badge className='bg-emerald-500 text-zinc-950 font-bold text-xs font-mono'>
                          194.5x Assisted ROAS
                        </Badge>
                      </div>

                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono'>
                        <div className='bg-zinc-900/80 border border-zinc-800 rounded-lg p-3'>
                          <span className='text-red-400 font-bold block mb-1'>❌ Without Single Fingerprint:</span>
                          <ul className='text-zinc-400 space-y-1 text-[11px]'>
                            <li>• YouTube Spend: $0.874</li>
                            <li>• YouTube Revenue: $0.00 (0.0x ROAS)</li>
                            <li>• Amazon Sale: 100% "Organic Direct"</li>
                            <li className='text-red-300 font-semibold'>• Result: Marketer cancels YouTube ad!</li>
                          </ul>
                        </div>

                        <div className='bg-cyan-950/40 border border-cyan-800/80 rounded-lg p-3'>
                          <span className='text-emerald-400 font-bold block mb-1'>✅ With NEXUS Single Fingerprint:</span>
                          <ul className='text-zinc-300 space-y-1 text-[11px]'>
                            <li>• YouTube Spend: $0.874</li>
                            <li>• Attributed Amazon Sale: $170.00</li>
                            <li>• Realized ROAS: <strong className='text-emerald-300'>194.5x</strong></li>
                            <li className='text-cyan-300 font-semibold'>• Result: AI scales YouTube budget +25%!</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className='rounded-lg border border-purple-900/40 bg-purple-950/20 p-3 flex items-start gap-3 text-xs font-mono text-zinc-300'>
                      <Icons.sparkles className='size-4 text-purple-400 shrink-0 mt-0.5' />
                      <div>
                        <span className='text-purple-400 font-bold'>Autonomous Decision Engine Action: </span>
                        scipy SLSQP optimizer ingested this graph event. Convex response curve shifts 
                        <strong className='text-white'> $4,500/day</strong> into YouTube top-of-funnel campaigns to feed downstream Amazon conversion loops.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Step Deep-Dive & Journey Metadata */}
          <div className='lg:col-span-5 flex flex-col gap-4'>
            <div className='rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-lg flex flex-col justify-between h-full'>
              <div>
                <div className='flex items-center justify-between border-b border-zinc-800 pb-3 mb-4'>
                  <Badge variant='outline' className={cn(
                    'text-[10px] font-mono px-2 py-0.5 uppercase tracking-wider',
                    currentStepData.platform === 'youtube' && 'border-red-500/40 text-red-400 bg-red-950/30',
                    currentStepData.platform === 'amazon' && 'border-amber-500/40 text-amber-400 bg-amber-950/30',
                    currentStepData.platform === 'nexus' && 'border-cyan-500/40 text-cyan-400 bg-cyan-950/30'
                  )}>
                    {currentStepData.badgeLabel}
                  </Badge>
                  <span className='text-[11px] font-mono text-zinc-500'>
                    {currentStepData.timestamp}
                  </span>
                </div>

                <h3 className='font-mono text-base font-bold text-zinc-100 mb-2'>
                  {currentStepData.title}
                </h3>
                <p className='text-xs text-zinc-400 font-sans leading-relaxed mb-4'>
                  {currentStepData.summary}
                </p>

                <div className='space-y-2 mb-4'>
                  <span className='text-[10px] font-mono uppercase text-zinc-500 tracking-wider block'>
                    Key Technical Observations:
                  </span>
                  {currentStepData.details.map((detail, idx) => (
                    <div key={idx} className='flex items-start gap-2 text-xs font-mono text-zinc-300'>
                      <Icons.arrowRight className='size-3 text-cyan-400 shrink-0 mt-0.5' />
                      <span className='leading-tight'>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fingerprint Entropy Verification Box */}
              <div className='rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 mt-4'>
                <div className='flex items-center justify-between text-[11px] font-mono mb-2'>
                  <span className='text-zinc-400 uppercase tracking-wider'>Identity Match Consistency</span>
                  <span className='text-emerald-400 font-bold'>{selectedDevice.confidenceScore}% Certainty</span>
                </div>
                <div className='w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden mb-2'>
                  <div
                    className='bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all'
                    style={{ width: `${selectedDevice.confidenceScore}%` }}
                  />
                </div>
                <div className='flex items-center justify-between text-[10px] font-mono text-zinc-500'>
                  <span>Hash: <code className='text-cyan-300'>{selectedDevice.fingerprintId}</code></span>
                  <span>Method: Canvas+WebGL+Audio</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: IDENTITY GRAPH VISUALIZER */}
      {activeTab === 'graph' && (
        <div className='rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl'>
          <div className='flex items-center justify-between mb-6 border-b border-zinc-800 pb-4'>
            <div>
              <h3 className='font-mono text-base font-bold text-zinc-100 uppercase tracking-tight flex items-center gap-2'>
                <Icons.topology className='size-5 text-cyan-400' />
                Identity Graph: Cross-Channel Node Connectivity
              </h3>
              <p className='text-xs text-zinc-400 font-sans mt-0.5'>
                How disparate events across Google YouTube and Amazon Marketplaces are unified by the deterministic device fingerprint.
              </p>
            </div>
            <Badge variant='outline' className='border-cyan-500/40 text-cyan-300 font-mono text-xs'>
              Fingerprint: {selectedDevice.fingerprintId}
            </Badge>
          </div>

          {/* Node Flow Diagram */}
          <div className='relative flex flex-col md:flex-row items-center justify-between gap-6 py-8 px-4'>
            {/* Connection Wire */}
            <div className='hidden md:block absolute top-1/2 left-12 right-12 h-1 bg-gradient-to-r from-red-600 via-purple-600 to-amber-500 -translate-y-1/2 z-0 opacity-40' />

            {/* Node 1: YouTube Impression */}
            <div className={cn(
              'relative z-10 w-full md:w-60 rounded-xl border p-4 font-mono text-center transition-all bg-zinc-900/90 backdrop-blur',
              currentStep >= 1 ? 'border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-zinc-800 opacity-50'
            )}>
              <div className='size-10 rounded-full bg-red-600/20 border border-red-500/50 flex items-center justify-center mx-auto mb-2 text-red-400'>
                <Icons.youtube className='size-5' />
              </div>
              <span className='text-[10px] text-red-400 font-bold uppercase tracking-wider block'>Node 01</span>
              <h4 className='text-xs font-bold text-white mt-1'>YouTube Ad Impression</h4>
              <p className='text-[11px] text-zinc-400 mt-1'>Campaign: YT_AirMaxDn_Q4</p>
              <div className='mt-2 pt-2 border-t border-zinc-800 text-[10px] text-zinc-500'>
                FP: <code className='text-cyan-400'>{selectedDevice.fingerprintId.slice(0, 11)}...</code>
              </div>
            </div>

            {/* Edge 1 to 2 */}
            <div className='flex md:hidden items-center justify-center text-zinc-600'>
              <Icons.chevronDown className='size-5 text-red-400' />
            </div>

            {/* Node 2: YouTube Click */}
            <div className={cn(
              'relative z-10 w-full md:w-60 rounded-xl border p-4 font-mono text-center transition-all bg-zinc-900/90 backdrop-blur',
              currentStep >= 2 ? 'border-red-400/80 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-zinc-800 opacity-50'
            )}>
              <div className='size-10 rounded-full bg-red-600/20 border border-red-500/50 flex items-center justify-center mx-auto mb-2 text-red-400'>
                <Icons.externalLink className='size-5' />
              </div>
              <span className='text-[10px] text-red-400 font-bold uppercase tracking-wider block'>Node 02</span>
              <h4 className='text-xs font-bold text-white mt-1'>YouTube Ad Click</h4>
              <p className='text-[11px] text-zinc-400 mt-1'>CPC Cost: $0.85</p>
              <div className='mt-2 pt-2 border-t border-zinc-800 text-[10px] text-zinc-500'>
                Dwell Time: 14.2s (Bounced)
              </div>
            </div>

            {/* Edge 2 to 3 */}
            <div className='flex md:hidden items-center justify-center text-zinc-600'>
              <Icons.chevronDown className='size-5 text-amber-400' />
            </div>

            {/* Node 3: Amazon Search & View */}
            <div className={cn(
              'relative z-10 w-full md:w-60 rounded-xl border p-4 font-mono text-center transition-all bg-zinc-900/90 backdrop-blur',
              currentStep >= 3 ? 'border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-zinc-800 opacity-50'
            )}>
              <div className='size-10 rounded-full bg-amber-600/20 border border-amber-500/50 flex items-center justify-center mx-auto mb-2 text-amber-400'>
                <Icons.amazon className='size-5' />
              </div>
              <span className='text-[10px] text-amber-400 font-bold uppercase tracking-wider block'>Node 03</span>
              <h4 className='text-xs font-bold text-white mt-1'>Amazon Direct Visit</h4>
              <p className='text-[11px] text-zinc-400 mt-1'>Zero Cookies • Direct Search</p>
              <div className='mt-2 pt-2 border-t border-zinc-800 text-[10px] text-emerald-400'>
                FP Match: 100% Identical
              </div>
            </div>

            {/* Edge 3 to 4 */}
            <div className='flex md:hidden items-center justify-center text-zinc-600'>
              <Icons.chevronDown className='size-5 text-emerald-400' />
            </div>

            {/* Node 4: Amazon Conversion */}
            <div className={cn(
              'relative z-10 w-full md:w-60 rounded-xl border p-4 font-mono text-center transition-all bg-zinc-900/90 backdrop-blur',
              currentStep >= 4 ? 'border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-zinc-800 opacity-50'
            )}>
              <div className='size-10 rounded-full bg-emerald-600/20 border border-emerald-500/50 flex items-center justify-center mx-auto mb-2 text-emerald-400'>
                <Icons.cart className='size-5' />
              </div>
              <span className='text-[10px] text-emerald-400 font-bold uppercase tracking-wider block'>Node 04</span>
              <h4 className='text-xs font-bold text-white mt-1'>Amazon Purchase</h4>
              <p className='text-[11px] text-zinc-400 mt-1'>Order $170.00 Confirmed</p>
              <div className='mt-2 pt-2 border-t border-zinc-800 text-[10px] text-emerald-400 font-bold'>
                Revenue Attributed!
              </div>
            </div>
          </div>

          {/* Graph Metrics Summary */}
          <div className='mt-8 pt-6 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs'>
            <div className='bg-zinc-900/70 border border-zinc-800 rounded-lg p-3'>
              <span className='text-zinc-500 block text-[10px] uppercase'>Journey Time-to-Convert</span>
              <span className='text-zinc-200 font-bold text-sm'>6 Hours 21 Minutes</span>
            </div>
            <div className='bg-zinc-900/70 border border-zinc-800 rounded-lg p-3'>
              <span className='text-zinc-500 block text-[10px] uppercase'>Total Incurred Ad Cost</span>
              <span className='text-red-400 font-bold text-sm'>$0.874 (CPM + CPC)</span>
            </div>
            <div className='bg-zinc-900/70 border border-zinc-800 rounded-lg p-3'>
              <span className='text-zinc-500 block text-[10px] uppercase'>Gross Attributed Value</span>
              <span className='text-emerald-400 font-bold text-sm'>$170.00 Gross / $93.50 Margin</span>
            </div>
            <div className='bg-zinc-900/70 border border-zinc-800 rounded-lg p-3'>
              <span className='text-zinc-500 block text-[10px] uppercase'>Attributed Lift Factor</span>
              <span className='text-cyan-400 font-bold text-sm'>194.5x ROAS Yield</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: RAW TELEMETRY JSON STREAM */}
      {activeTab === 'telemetry' && (
        <div className='rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl font-mono'>
          <div className='flex items-center justify-between mb-4 border-b border-zinc-800 pb-3'>
            <div className='flex items-center gap-2'>
              <Icons.code className='size-4 text-cyan-400' />
              <h3 className='text-xs font-bold text-zinc-200 uppercase tracking-wider'>
                Ingestion Telemetry Payload (DuckDB Ingest Buffer)
              </h3>
            </div>
            <Badge variant='outline' className='border-emerald-500/40 text-emerald-400 text-[10px]'>
              HTTP 200 INGESTED
            </Badge>
          </div>

          <pre className='bg-zinc-900/90 border border-zinc-800 rounded-lg p-4 text-xs text-zinc-300 overflow-x-auto leading-relaxed max-h-96 selection:bg-cyan-500 selection:text-black'>
            {JSON.stringify(currentStepData.eventPayload, null, 2)}
          </pre>
        </div>
      )}

      {/* TAB CONTENT 4: SDK & SQL QUERIES */}
      {activeTab === 'code' && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs'>
          {/* Client SDK */}
          <div className='rounded-xl border border-zinc-800 bg-zinc-950 p-4'>
            <div className='flex items-center justify-between mb-3 border-b border-zinc-800 pb-2'>
              <span className='font-bold text-zinc-200 text-xs flex items-center gap-1.5'>
                <Icons.code className='size-3.5 text-cyan-400' />
                Client-Side Fingerprint Generator (`nexus-fp.js`)
              </span>
              <Badge variant='outline' className='text-[10px] border-zinc-700 text-zinc-400'>
                1.4 kB • Zero Cookies
              </Badge>
            </div>
            <pre className='bg-zinc-900/80 p-3 rounded-md text-[11px] text-zinc-300 overflow-x-auto leading-relaxed border border-zinc-800/80'>
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

          {/* DuckDB Cross-Channel Query */}
          <div className='rounded-xl border border-zinc-800 bg-zinc-950 p-4'>
            <div className='flex items-center justify-between mb-3 border-b border-zinc-800 pb-2'>
              <span className='font-bold text-zinc-200 text-xs flex items-center gap-1.5'>
                <Icons.product className='size-3.5 text-purple-400' />
                DuckDB Cross-Platform Attribution Query
              </span>
              <Badge variant='outline' className='text-[10px] border-zinc-700 text-zinc-400'>
                SQL Query
              </Badge>
            </div>
            <pre className='bg-zinc-900/80 p-3 rounded-md text-[11px] text-zinc-300 overflow-x-auto leading-relaxed border border-zinc-800/80'>
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
  );
}
