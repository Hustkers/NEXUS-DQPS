'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  IconCpu,
  IconDeviceLaptop,
  IconDeviceMobile,
  IconDeviceDesktop,
  IconWaveSine,
  IconPalette,
  IconLock,
  IconWorld,
  IconBrandYoutube,
  IconBrandAmazon,
  IconShoppingCart,
  IconClick,
  IconSparkles,
  IconRefresh,
  IconEye,
  IconShare,
  IconShieldCheck,
  IconInfoCircle,
  IconFilter,
  IconPlayerPlay,
  IconPlayerPause
} from '@tabler/icons-react';

export interface GraphNode {
  id: string;
  label: string;
  subLabel: string;
  category: 'identity' | 'device' | 'entropy' | 'touchpoint';
  color: string;
  glowColor: string;
  iconType: string;
  x: number;
  y: number;
  size: number;
  entropyBits?: number;
  confidence?: number;
  details: {
    title: string;
    description: string;
    shannonFormula?: string;
    rawDigest?: string;
    attributes: { key: string; value: string }[];
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  color: string;
  weight: number; // 0 to 1
  category: 'stitch' | 'entropy_flow' | 'attribution';
  animated?: boolean;
}

// Initial node definitions with balanced layout in 900x560 coordinate space
const INITIAL_NODES: GraphNode[] = [
  // 1. Central Unified Person Identity
  {
    id: 'entity-unified',
    label: 'Unified Person Entity',
    subLabel: 'Cluster ENT-9241-X (Confidence 99.8%)',
    category: 'identity',
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    iconType: 'identity',
    x: 450,
    y: 270,
    size: 42,
    entropyBits: 33.5,
    confidence: 99.8,
    details: {
      title: 'Unified Cross-Device Identity Cluster',
      description:
        'Graph resolution engine merges disjoint browser sessions into a single deterministic human entity. Bypasses 3rd-party cookie bans by calculating aggregate hardware uniqueness.',
      shannonFormula: 'H(Total) = ∑ H(V_i) = 33.5 bits (1 in 11.8 Billion uniqueness)',
      rawDigest: 'SHA256: 7f3b89a02ce51900a3bb2c448d1e0281b932',
      attributes: [
        { key: 'Cluster UUID', value: 'ENT-9241-X-STITCHED' },
        { key: 'Resolved Devices', value: '3 Active Devices (Mac, iPhone, PC)' },
        { key: 'Cross-Domain Sessions', value: '14 Recorded Touchpoints' },
        { key: 'Jaccard Threshold', value: 'J(A, B) ≥ 0.94' },
        { key: 'Collision Risk', value: '< 1.2 × 10⁻⁷' }
      ]
    }
  },

  // 2. Physical Devices
  {
    id: 'device-macbook',
    label: 'MacBook Pro 16" (M3 Max)',
    subLabel: 'macOS 15.1 • Safari 18.2',
    category: 'device',
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.35)',
    iconType: 'laptop',
    x: 230,
    y: 180,
    size: 32,
    entropyBits: 28.4,
    confidence: 99.8,
    details: {
      title: 'Primary Workstation: Apple MacBook Pro 16"',
      description:
        'High-end laptop generating reproducible Metal 3.2 shader precision and unique sub-pixel font rasterization across Retina display.',
      rawDigest: 'FP-8F92-A74B-M3MAX',
      attributes: [
        { key: 'Architecture', value: 'Apple Silicon ARM64 (16 Cores)' },
        { key: 'Memory', value: '36 GB Unified RAM' },
        { key: 'Display Density', value: '3456 × 2234 @ 2x (P3 Gamut)' },
        { key: 'Primary Network', value: 'Comcast Cable (198.51.100.0/24)' }
      ]
    }
  },
  {
    id: 'device-iphone',
    label: 'iPhone 16 Pro (A18 Pro)',
    subLabel: 'iOS 18.2.1 • Mobile Safari',
    category: 'device',
    color: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.35)',
    iconType: 'mobile',
    x: 230,
    y: 360,
    size: 32,
    entropyBits: 27.2,
    confidence: 99.4,
    details: {
      title: 'Mobile Client: Apple iPhone 16 Pro',
      description:
        'Mobile client running on cellular and home Wi-Fi. Shares identical WebAudio oscillator dynamics with user workstation.',
      rawDigest: 'FP-3C81-992F-A18PRO',
      attributes: [
        { key: 'SoC', value: 'Apple A18 Pro (6 CPU, 6 GPU Cores)' },
        { key: 'Screen', value: '2622 × 1206 @ 3x (Display P3)' },
        { key: 'Subnet Geohash', value: 'T-Mobile 5G Subnet / Home Wi-Fi' },
        { key: 'Audio Oscillator', value: 'au_0.00020117d9' }
      ]
    }
  },
  {
    id: 'device-pc',
    label: 'Custom Gaming Rig',
    subLabel: 'Windows 11 • RTX 4080 • Chrome',
    category: 'device',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    iconType: 'desktop',
    x: 450,
    y: 450,
    size: 30,
    entropyBits: 29.1,
    confidence: 99.1,
    details: {
      title: 'Home Desktop: Intel i9 + NVIDIA RTX 4080',
      description:
        'Direct3D11 / ANGLE hardware acceleration pipeline with 24-bit sRGB color rendering. Shares the same residential ISP subnet as MacBook.',
      rawDigest: 'FP-D489-B015-INTEL',
      attributes: [
        { key: 'GPU', value: 'NVIDIA GeForce RTX 4080 (Direct3D11)' },
        { key: 'Display', value: '2880 × 1800 @ 2x' },
        { key: 'Subnet Match', value: 'Shares 198.51.100.0/24 with MacBook' },
        { key: 'Hardware Concurrency', value: '16 Cores • 32 GB RAM' }
      ]
    }
  },

  // 3. Entropy Signal Vectors
  {
    id: 'entropy-canvas',
    label: 'Canvas 2D Hash',
    subLabel: '11.2 Bits Entropy',
    category: 'entropy',
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    iconType: 'palette',
    x: 80,
    y: 110,
    size: 26,
    entropyBits: 11.2,
    details: {
      title: 'HTML5 Canvas 2D Text & Geometry Rasterizer',
      description:
        'Renders complex typography, winding rules, and alpha gradients. Micro-antialiasing differences in OS subpixel rendering create deterministic hardware signatures.',
      shannonFormula: 'H = 11.2 bits (1 in 2,352 distinct configurations)',
      rawDigest: 'cv2_8f4a19e2c0b7',
      attributes: [
        { key: 'Extraction Technique', value: 'ctx.fillText + ctx.arc + toDataURL' },
        { key: 'Vector Stability', value: '99.98% across sessions' },
        { key: 'Defenses', value: 'Brave farbling introduces ±1px noise' }
      ]
    }
  },
  {
    id: 'entropy-webgl',
    label: 'WebGL GPU Shader',
    subLabel: '9.8 Bits Entropy',
    category: 'entropy',
    color: '#8b5cf6',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    iconType: 'cpu',
    x: 80,
    y: 250,
    size: 26,
    entropyBits: 9.8,
    details: {
      title: 'WebGL Shader Precision & Unmasked Renderer',
      description:
        'Queries WEBGL_debug_renderer_info to expose exact GPU chipset and floating-point shader precision tolerances.',
      shannonFormula: 'H = 9.8 bits (1 in 891 distinct GPUs)',
      rawDigest: 'Apple M3 Max GPU (Metal 3.2)',
      attributes: [
        { key: 'Vendor String', value: 'Apple (0x106b)' },
        { key: 'Shader Precision', value: 'highp float 32-bit IEEE 754' },
        { key: 'Max Texture Size', value: '16384 × 16384' }
      ]
    }
  },
  {
    id: 'entropy-audio',
    label: 'WebAudio Buffer',
    subLabel: '8.4 Bits Entropy',
    category: 'entropy',
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    iconType: 'audio',
    x: 80,
    y: 390,
    size: 26,
    entropyBits: 8.4,
    details: {
      title: 'Web Audio DynamicsCompressor Frequency Waveform',
      description:
        'Synthesizes an audio oscillator through a high-pass compressor. Software DSP floating-point math rounding differences generate an acoustic fingerprint without playing audible sound.',
      shannonFormula: 'H = 8.4 bits (1 in 338 distinct audio stacks)',
      rawDigest: 'au_0.00018492f1',
      attributes: [
        { key: 'Sample Rate', value: '44,100 Hz OfflineAudioContext' },
        { key: 'FFT Buffer Sum', value: '124.0434752297' },
        { key: 'Permitted', value: 'Bypasses microphone permissions' }
      ]
    }
  },
  {
    id: 'entropy-tls',
    label: 'TLS JA3/JA4 Hash',
    subLabel: '6.5 Bits Entropy',
    category: 'entropy',
    color: '#0284c7',
    glowColor: 'rgba(2, 132, 199, 0.4)',
    iconType: 'lock',
    x: 230,
    y: 60,
    size: 24,
    entropyBits: 6.5,
    details: {
      title: 'TLS Client Hello Handshake (JA3/JA4)',
      description:
        'Analyzes the exact cipher suites, TLS extensions, and elliptic curve algorithms presented during the initial TCP/TLS handshake before HTTP headers are parsed.',
      shannonFormula: 'H = 6.5 bits (1 in 90 TLS client stacks)',
      rawDigest: 't13d1516h2_8daaf6152771_0266e5114131',
      attributes: [
        { key: 'Protocol Version', value: 'TLS 1.3' },
        { key: 'Cipher Suites', value: 'TLS_AES_128_GCM_SHA256, etc.' },
        { key: 'ALPN Protocol', value: 'h2, http/1.1' }
      ]
    }
  },
  {
    id: 'entropy-subnet',
    label: 'Residential BGP Subnet',
    subLabel: '5.1 Bits Entropy',
    category: 'entropy',
    color: '#14b8a6',
    glowColor: 'rgba(20, 184, 166, 0.4)',
    iconType: 'world',
    x: 450,
    y: 90,
    size: 24,
    entropyBits: 5.1,
    details: {
      title: 'Autonomous System & Geohash /24 Subnet',
      description:
        'Aggregates IPv4 /24 subnet (256 addresses) or IPv6 /64 prefix to link devices co-located on the same home or office router.',
      shannonFormula: 'H = 5.1 bits (Spatial household linkage)',
      rawDigest: '198.51.100.0/24 (Comcast Cable)',
      attributes: [
        { key: 'ASN Number', value: 'AS7922 (Comcast IP)' },
        { key: 'Subnet Mask', value: '/24 Residential Dynamic' },
        { key: 'Household Co-location', value: 'Matched across MacBook & PC' }
      ]
    }
  },

  // 4. E-Commerce & Ad Touchpoints (Attribution Chain)
  {
    id: 'touchpoint-yt-imp',
    label: 'YouTube Ad Impression',
    subLabel: 'Preroll • Cost: ₹0.024',
    category: 'touchpoint',
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    iconType: 'youtube',
    x: 670,
    y: 130,
    size: 28,
    confidence: 99.8,
    details: {
      title: 'Touchpoint 01: Cookieless Video Ad Impression',
      description:
        'Nike Air Max Dn 15-second preroll ad played on YouTube. NEXUS tag executed client-side fingerprinting, binding the hardware hash to Campaign "YT_Brand_AirMaxDn_Q4".',
      rawDigest: 'evt_yt_imp_9921',
      attributes: [
        { key: 'Channel', value: 'YouTube Video Ad (Google Ads)' },
        { key: 'Ad Spend', value: '₹0.024 (CPM ₹24.00)' },
        { key: 'Cookie State', value: 'Zero 3rd-Party Cookies Used' },
        { key: 'Device Captured', value: 'MacBook Pro 16" (M3 Max)' }
      ]
    }
  },
  {
    id: 'touchpoint-yt-click',
    label: 'YouTube Ad Click',
    subLabel: 'Dwell: 14.2s • Cost: ₹0.85',
    category: 'touchpoint',
    color: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.4)',
    iconType: 'click',
    x: 670,
    y: 240,
    size: 26,
    confidence: 99.8,
    details: {
      title: 'Touchpoint 02: High-Intent Engagement (Bounced)',
      description:
        'User clicked ad creative, browsed Nike landing page for 14.2 seconds, but closed tab without converting. Traditional ad attribution marks this as a wasted ₹0.85 spend.',
      rawDigest: 'evt_yt_clk_4810',
      attributes: [
        { key: 'Cumulative Spend', value: '₹0.874 (CPM + CPC)' },
        { key: 'Outcome', value: 'Tab Closed (No Transaction)' },
        { key: 'Traditional ROAS', value: '0.0x (Siloed Failure)' }
      ]
    }
  },
  {
    id: 'touchpoint-amz-visit',
    label: 'Amazon Direct Search',
    subLabel: '+6h 18m Latency • 0 UTMs',
    category: 'touchpoint',
    color: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.4)',
    iconType: 'amazon',
    x: 670,
    y: 350,
    size: 28,
    confidence: 99.8,
    details: {
      title: 'Touchpoint 03: Walled-Garden Boundary Crossed',
      description:
        'Hours later, user navigates directly to Amazon.com. Zero tracking cookies or UTM referral params exist. NEXUS Amazon storefront script extracts the same hardware hash, bridging the gap!',
      rawDigest: 'evt_amz_pdp_1092',
      attributes: [
        { key: 'Referrer Type', value: 'Direct Organic Browser Search' },
        { key: 'Walled Garden Barrier', value: 'Crossed (Google → Amazon)' },
        { key: 'Identity Match', value: '100% Deterministic Hardware Match' }
      ]
    }
  },
  {
    id: 'touchpoint-amz-buy',
    label: 'Amazon 1-Click Purchase',
    subLabel: '₹170.00 Gross Rev • 194.5x ROAS',
    category: 'touchpoint',
    color: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.45)',
    iconType: 'cart',
    x: 670,
    y: 460,
    size: 32,
    confidence: 99.8,
    details: {
      title: 'Touchpoint 04: Verified Purchase & Margin Realization',
      description:
        'Order #AMZ-9482-DN77 completed. Closed-loop attribution connects this ₹170.00 sale to the original ₹0.874 YouTube ad spend, demonstrating a 194.5x assisted ROAS!',
      rawDigest: 'ORD-AMZ-9482-DN77',
      attributes: [
        { key: 'Gross Revenue', value: '₹170.00' },
        { key: 'Realized Margin', value: '₹93.50 (55.0% CM2)' },
        { key: 'Total Ad Spend', value: '₹0.874' },
        { key: 'Assisted ROAS', value: '194.5x (Realized closed-loop)' }
      ]
    }
  }
];

const INITIAL_EDGES: GraphEdge[] = [
  // Entropy vectors feeding into MacBook
  { id: 'e1', source: 'entropy-canvas', target: 'device-macbook', label: 'Canvas Hash', color: '#f59e0b', weight: 0.95, category: 'entropy_flow', animated: true },
  { id: 'e2', source: 'entropy-webgl', target: 'device-macbook', label: 'Metal 3.2', color: '#8b5cf6', weight: 0.9, category: 'entropy_flow', animated: true },
  { id: 'e3', source: 'entropy-audio', target: 'device-macbook', label: 'Audio Float', color: '#ec4899', weight: 0.85, category: 'entropy_flow', animated: true },
  { id: 'e4', source: 'entropy-tls', target: 'device-macbook', label: 'TLS Handshake', color: '#0284c7', weight: 0.8, category: 'entropy_flow', animated: true },
  { id: 'e5', source: 'entropy-subnet', target: 'device-macbook', label: 'Comcast /24', color: '#14b8a6', weight: 0.75, category: 'entropy_flow' },

  // Entropy vectors feeding into iPhone
  { id: 'e6', source: 'entropy-canvas', target: 'device-iphone', label: 'WebKit Font', color: '#f59e0b', weight: 0.85, category: 'entropy_flow' },
  { id: 'e7', source: 'entropy-audio', target: 'device-iphone', label: 'Audio Oscillator', color: '#ec4899', weight: 0.95, category: 'entropy_flow', animated: true },

  // Entropy vectors feeding into PC
  { id: 'e8', source: 'entropy-subnet', target: 'device-pc', label: 'Shared Subnet', color: '#14b8a6', weight: 0.9, category: 'entropy_flow' },
  { id: 'e9', source: 'entropy-canvas', target: 'device-pc', label: 'Blink Render', color: '#f59e0b', weight: 0.75, category: 'entropy_flow' },

  // Devices connecting into Central Unified Person Entity
  { id: 'e10', source: 'device-macbook', target: 'entity-unified', label: 'Primary (99.8%)', color: '#06b6d4', weight: 1.0, category: 'stitch', animated: true },
  { id: 'e11', source: 'device-iphone', target: 'entity-unified', label: 'Mobile (99.4%)', color: '#f43f5e', weight: 0.95, category: 'stitch', animated: true },
  { id: 'e12', source: 'device-pc', target: 'entity-unified', label: 'Desktop (99.1%)', color: '#10b981', weight: 0.9, category: 'stitch', animated: true },

  // Attribution touchpoints flowing into Central Entity & each other
  { id: 'e13', source: 'touchpoint-yt-imp', target: 'touchpoint-yt-click', label: 'Ad Click', color: '#ef4444', weight: 0.9, category: 'attribution', animated: true },
  { id: 'e14', source: 'touchpoint-yt-click', target: 'touchpoint-amz-visit', label: 'Walled Bridge', color: '#eab308', weight: 0.95, category: 'attribution', animated: true },
  { id: 'e15', source: 'touchpoint-amz-visit', target: 'touchpoint-amz-buy', label: '1-Click Checkout', color: '#22c55e', weight: 1.0, category: 'attribution', animated: true },
  { id: 'e16', source: 'entity-unified', target: 'touchpoint-yt-imp', label: 'Cookieless Tag', color: '#a855f7', weight: 0.95, category: 'attribution' },
  { id: 'e17', source: 'entity-unified', target: 'touchpoint-amz-buy', label: 'ROAS Resolution', color: '#22c55e', weight: 1.0, category: 'attribution', animated: true }
];

export function FingerprintNetworkGraph() {
  const [nodes, setNodes] = useState<GraphNode[]>(INITIAL_NODES);
  const [edges] = useState<GraphEdge[]>(INITIAL_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('entity-unified');
  const [filterMode, setFilterMode] = useState<'all' | 'stitch' | 'attribution' | 'entropy'>('all');
  const [isSimulatingPhysics, setIsSimulatingPhysics] = useState<boolean>(true);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Derive selected node object
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || nodes[0],
    [nodes, selectedNodeId]
  );

  // Filter edges and active nodes based on user filter
  const visibleEdges = useMemo(() => {
    if (filterMode === 'all') return edges;
    if (filterMode === 'stitch') return edges.filter((e) => e.category === 'stitch' || e.source === 'entropy-subnet');
    if (filterMode === 'attribution') return edges.filter((e) => e.category === 'attribution');
    if (filterMode === 'entropy') return edges.filter((e) => e.category === 'entropy_flow');
    return edges;
  }, [edges, filterMode]);

  const activeNodeIds = useMemo(() => {
    if (filterMode === 'all') return new Set(nodes.map((n) => n.id));
    const ids = new Set<string>();
    visibleEdges.forEach((e) => {
      ids.add(e.source);
      ids.add(e.target);
    });
    // Always include selected node or central entity
    ids.add('entity-unified');
    return ids;
  }, [nodes, visibleEdges, filterMode]);

  // Subtle natural floating motion when physics simulation is on
  useEffect(() => {
    if (!isSimulatingPhysics || draggedNodeId) return;

    let frameId: number;
    let t = 0;

    const animate = () => {
      t += 0.02;
      setNodes((prev) =>
        prev.map((node, i) => {
          // Central entity stays stable, outer nodes float gently with sine waves
          if (node.id === 'entity-unified') return node;
          const deltaX = Math.sin(t + i * 1.3) * 0.35;
          const deltaY = Math.cos(t + i * 1.1) * 0.35;
          return {
            ...node,
            x: Math.min(840, Math.max(60, node.x + deltaX)),
            y: Math.min(520, Math.max(50, node.y + deltaY))
          };
        })
      );
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isSimulatingPhysics, draggedNodeId]);

  // Handle Dragging
  const handleMouseDown = (nodeId: string) => {
    setDraggedNodeId(nodeId);
    setSelectedNodeId(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggedNodeId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 900 / rect.width;
    const scaleY = 560 / rect.height;

    const newX = Math.min(860, Math.max(40, (e.clientX - rect.left) * scaleX));
    const newY = Math.min(520, Math.max(40, (e.clientY - rect.top) * scaleY));

    setNodes((prev) =>
      prev.map((node) => (node.id === draggedNodeId ? { ...node, x: newX, y: newY } : node))
    );
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
  };

  // Node Icon Helper
  const renderNodeIcon = (type: string, color: string) => {
    const size = 16;
    switch (type) {
      case 'identity':
        return <IconSparkles className='size-5 text-white' />;
      case 'laptop':
        return <IconDeviceLaptop className='size-4 text-cyan-200' />;
      case 'mobile':
        return <IconDeviceMobile className='size-4 text-rose-200' />;
      case 'desktop':
        return <IconDeviceDesktop className='size-4 text-emerald-200' />;
      case 'palette':
        return <IconPalette className='size-3.5 text-amber-200' />;
      case 'cpu':
        return <IconCpu className='size-3.5 text-purple-200' />;
      case 'audio':
        return <IconWaveSine className='size-3.5 text-pink-200' />;
      case 'lock':
        return <IconLock className='size-3.5 text-sky-200' />;
      case 'world':
        return <IconWorld className='size-3.5 text-teal-200' />;
      case 'youtube':
        return <IconBrandYoutube className='size-4 text-red-200' />;
      case 'click':
        return <IconClick className='size-3.5 text-orange-200' />;
      case 'amazon':
        return <IconBrandAmazon className='size-4 text-yellow-200' />;
      case 'cart':
        return <IconShoppingCart className='size-4 text-green-200' />;
      default:
        return <IconCpu className='size-4 text-white' />;
    }
  };

  return (
    <div className='flex flex-col gap-5'>
      {/* Top Controls Bar */}
      <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-[#0a0a0c] border border-white/10 p-4 rounded-xl shadow-xl'>
        <div className='flex items-center gap-3'>
          <div className='size-10 rounded-lg bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20'>
            <IconShare className='size-5 text-white' />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h3 className='text-sm font-bold tracking-wide text-white uppercase font-mono'>
                Multi-Node Identity Stitching Graph
              </h3>
              <Badge className='bg-purple-950/80 border border-purple-500/50 text-purple-300 text-[10px] font-mono'>
                N-GRAPH DAG
              </Badge>
            </div>
            <p className='text-xs text-neutral-400 mt-0.5'>
              Interactive Force Topology: Disjoint client entropy vectors collapsed into a unified Entity.
            </p>
          </div>
        </div>

        {/* View Filters & Physics Controls */}
        <div className='flex flex-wrap items-center gap-2'>
          <div className='flex items-center bg-black/60 border border-white/10 rounded-lg p-0.5 text-xs font-mono'>
            <button
              onClick={() => setFilterMode('all')}
              className={cn(
                'px-2.5 py-1 rounded transition-colors',
                filterMode === 'all'
                  ? 'bg-purple-600 text-white font-bold shadow'
                  : 'text-neutral-400 hover:text-white'
              )}
            >
              All (13 Nodes)
            </button>
            <button
              onClick={() => setFilterMode('stitch')}
              className={cn(
                'px-2.5 py-1 rounded transition-colors',
                filterMode === 'stitch'
                  ? 'bg-cyan-600 text-white font-bold shadow'
                  : 'text-neutral-400 hover:text-white'
              )}
            >
              Cross-Device
            </button>
            <button
              onClick={() => setFilterMode('attribution')}
              className={cn(
                'px-2.5 py-1 rounded transition-colors',
                filterMode === 'attribution'
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'text-neutral-400 hover:text-white'
              )}
            >
              Ad Attribution
            </button>
            <button
              onClick={() => setFilterMode('entropy')}
              className={cn(
                'px-2.5 py-1 rounded transition-colors',
                filterMode === 'entropy'
                  ? 'bg-amber-600 text-white font-bold shadow'
                  : 'text-neutral-400 hover:text-white'
              )}
            >
              Entropy Vectors
            </button>
          </div>

          <Button
            size='sm'
            variant='outline'
            onClick={() => setIsSimulatingPhysics(!isSimulatingPhysics)}
            className='h-7 px-2.5 text-xs font-mono border-white/20 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800'
          >
            {isSimulatingPhysics ? (
              <>
                <IconPlayerPause className='size-3 mr-1 text-amber-400' /> Pause
              </>
            ) : (
              <>
                <IconPlayerPlay className='size-3 mr-1 text-emerald-400' /> Float
              </>
            )}
          </Button>

          <Button
            size='sm'
            variant='outline'
            onClick={() => {
              setNodes(INITIAL_NODES);
              setSelectedNodeId('entity-unified');
            }}
            className='h-7 px-2.5 text-xs font-mono border-white/20 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800'
          >
            <IconRefresh className='size-3 mr-1 text-cyan-400' /> Reset
          </Button>
        </div>
      </div>

      {/* Main Graph Canvas and Side Inspector */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-5 items-start'>
        {/* Graph SVG Interactive Canvas (Cols 1-8) */}
        <div className='lg:col-span-8 bg-[#070709] border border-white/10 rounded-xl overflow-hidden relative shadow-2xl flex flex-col'>
          {/* HUD Overlay Stats Header */}
          <div className='absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none'>
            <div className='flex items-center gap-2 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-[11px] font-mono'>
              <span className='size-2 rounded-full bg-emerald-400 animate-ping' />
              <span className='text-neutral-300'>Active Graph Nodes:</span>
              <span className='text-white font-bold'>{activeNodeIds.size} / 13</span>
              <span className='text-neutral-600'>|</span>
              <span className='text-neutral-300'>Edges:</span>
              <span className='text-purple-400 font-bold'>{visibleEdges.length}</span>
            </div>

            <div className='flex items-center gap-2 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-[11px] font-mono'>
              <span className='text-neutral-400'>Total Entropy:</span>
              <span className='text-amber-400 font-bold'>33.5 Bits</span>
              <span className='text-neutral-600'>|</span>
              <span className='text-emerald-400 font-bold'>99.8% Match</span>
            </div>
          </div>

          {/* SVG Canvas Area */}
          <div className='w-full relative aspect-[900/560] min-h-[460px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900/60 via-[#050508] to-[#020204] cursor-crosshair select-none'>
            <svg
              ref={svgRef}
              viewBox='0 0 900 560'
              className='w-full h-full'
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <defs>
                {/* Neon Glow Filters */}
                <filter id='glow-purple' x='-30%' y='-30%' width='160%' height='160%'>
                  <feGaussianBlur stdDeviation='7' result='blur' />
                  <feMerge>
                    <feMergeNode in='blur' />
                    <feMergeNode in='SourceGraphic' />
                  </feMerge>
                </filter>
                <filter id='glow-cyan' x='-30%' y='-30%' width='160%' height='160%'>
                  <feGaussianBlur stdDeviation='5' result='blur' />
                  <feMerge>
                    <feMergeNode in='blur' />
                    <feMergeNode in='SourceGraphic' />
                  </feMerge>
                </filter>
                <filter id='glow-amber' x='-30%' y='-30%' width='160%' height='160%'>
                  <feGaussianBlur stdDeviation='4' result='blur' />
                  <feMerge>
                    <feMergeNode in='blur' />
                    <feMergeNode in='SourceGraphic' />
                  </feMerge>
                </filter>

                {/* Animated Edge Pulse Marker */}
                <linearGradient id='grad-edge-purple' x1='0%' y1='0%' x2='100%' y2='0%'>
                  <stop offset='0%' stopColor='#a855f7' stopOpacity='0.3' />
                  <stop offset='50%' stopColor='#c084fc' stopOpacity='0.9' />
                  <stop offset='100%' stopColor='#a855f7' stopOpacity='0.3' />
                </linearGradient>

                <linearGradient id='grad-edge-cyan' x1='0%' y1='0%' x2='100%' y2='0%'>
                  <stop offset='0%' stopColor='#06b6d4' stopOpacity='0.3' />
                  <stop offset='50%' stopColor='#67e8f9' stopOpacity='0.9' />
                  <stop offset='100%' stopColor='#06b6d4' stopOpacity='0.3' />
                </linearGradient>
              </defs>

              {/* Background Grid Pattern */}
              <g opacity='0.08'>
                {Array.from({ length: 18 }).map((_, i) => (
                  <line
                    key={`vl-${i}`}
                    x1={i * 50}
                    y1={0}
                    x2={i * 50}
                    y2={560}
                    stroke='#ffffff'
                    strokeWidth='1'
                    strokeDasharray='2 4'
                  />
                ))}
                {Array.from({ length: 12 }).map((_, i) => (
                  <line
                    key={`hl-${i}`}
                    x1={0}
                    y1={i * 50}
                    x2={900}
                    y2={i * 50}
                    stroke='#ffffff'
                    strokeWidth='1'
                    strokeDasharray='2 4'
                  />
                ))}
              </g>

              {/* Edge Connections */}
              <g>
                {visibleEdges.map((edge) => {
                  const sourceNode = nodes.find((n) => n.id === edge.source);
                  const targetNode = nodes.find((n) => n.id === edge.target);
                  if (!sourceNode || !targetNode) return null;

                  const isSelected =
                    sourceNode.id === selectedNodeId || targetNode.id === selectedNodeId;

                  // Compute smooth curved bezier path
                  const dx = targetNode.x - sourceNode.x;
                  const dy = targetNode.y - sourceNode.y;
                  const cx1 = sourceNode.x + dx * 0.5;
                  const cy1 = sourceNode.y;
                  const cx2 = sourceNode.x + dx * 0.5;
                  const cy2 = targetNode.y;

                  const pathD = `M ${sourceNode.x} ${sourceNode.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${targetNode.x} ${targetNode.y}`;

                  return (
                    <g key={edge.id} className='transition-all duration-300'>
                      {/* Glow background line */}
                      <path
                        d={pathD}
                        fill='none'
                        stroke={edge.color}
                        strokeWidth={isSelected ? 4 : 2}
                        strokeOpacity={isSelected ? 0.8 : 0.25}
                      />

                      {/* Moving pulse dash array animation */}
                      {edge.animated && (
                        <path
                          d={pathD}
                          fill='none'
                          stroke={edge.color}
                          strokeWidth={isSelected ? 3 : 2}
                          strokeDasharray='6 12'
                          className='animate-dash'
                          strokeOpacity={isSelected ? 1 : 0.7}
                        >
                          <animate
                            attributeName='stroke-dashoffset'
                            from='100'
                            to='0'
                            dur='2.4s'
                            repeatCount='indefinite'
                          />
                        </path>
                      )}

                      {/* Edge Label on midpoint */}
                      <text
                        x={(sourceNode.x + targetNode.x) / 2}
                        y={(sourceNode.y + targetNode.y) / 2 - 4}
                        fill={edge.color}
                        fontSize='9'
                        textAnchor='middle'
                        className='font-mono font-bold select-none'
                        opacity={isSelected ? 0.95 : 0.5}
                      >
                        {edge.label}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* Nodes */}
              <g>
                {nodes.map((node) => {
                  const isActive = activeNodeIds.has(node.id);
                  const isSelected = node.id === selectedNodeId;
                  const isCentral = node.id === 'entity-unified';

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      className='cursor-pointer group'
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(node.id);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNodeId(node.id);
                      }}
                      opacity={isActive ? 1 : 0.25}
                    >
                      {/* Outer pulse wave for central entity */}
                      {isCentral && (
                        <>
                          <circle
                            r={node.size + 14}
                            fill='none'
                            stroke={node.color}
                            strokeWidth='1.5'
                            strokeOpacity='0.3'
                            strokeDasharray='4 4'
                            className='animate-spin'
                            style={{ transformOrigin: '0 0', animationDuration: '14s' }}
                          />
                          <circle
                            r={node.size + 6}
                            fill={node.glowColor}
                            opacity='0.4'
                            className='animate-pulse'
                          />
                        </>
                      )}

                      {/* Halo ring for selected state */}
                      {isSelected && (
                        <circle
                          r={node.size + 7}
                          fill='none'
                          stroke={node.color}
                          strokeWidth='2.5'
                          strokeDasharray='3 3'
                          className='animate-spin'
                          style={{ transformOrigin: '0 0', animationDuration: '8s' }}
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        r={node.size}
                        fill='#0f0f14'
                        stroke={node.color}
                        strokeWidth={isSelected ? 3 : 2}
                        filter={isCentral ? 'url(#glow-purple)' : undefined}
                        className='transition-all duration-200 group-hover:scale-110'
                      />

                      {/* Node Icon */}
                      <foreignObject
                        x={-node.size / 2}
                        y={-node.size / 2}
                        width={node.size}
                        height={node.size}
                        className='pointer-events-none'
                      >
                        <div className='w-full h-full flex items-center justify-center'>
                          {renderNodeIcon(node.iconType, node.color)}
                        </div>
                      </foreignObject>

                      {/* Node Label Below */}
                      <text
                        y={node.size + 14}
                        textAnchor='middle'
                        fill='#ffffff'
                        fontSize={isCentral ? '11' : '10'}
                        fontWeight={isCentral || isSelected ? 'bold' : 'normal'}
                        className='font-mono select-none drop-shadow-md'
                      >
                        {node.label}
                      </text>

                      {/* Sub-label */}
                      <text
                        y={node.size + 25}
                        textAnchor='middle'
                        fill={node.color}
                        fontSize='8'
                        className='font-mono select-none'
                        opacity={0.85}
                      >
                        {node.subLabel}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Instruction Footer Note */}
            <div className='absolute bottom-2.5 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-neutral-400 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md border border-white/5'>
              <span className='flex items-center gap-1.5'>
                <IconInfoCircle className='size-3.5 text-cyan-400' />
                <span>Drag any node to explore graph elasticity. Click node to inspect entropy telemetry.</span>
              </span>
              <span className='text-purple-400 font-bold'>Graph Resolution: Deterministic</span>
            </div>
          </div>
        </div>

        {/* Selected Node Inspector HUD (Cols 9-12) */}
        <div className='lg:col-span-4 bg-[#0a0a0d] border border-white/10 rounded-xl p-5 shadow-2xl flex flex-col gap-4 font-mono'>
          {/* Header */}
          <div className='flex items-start justify-between gap-3 pb-3 border-b border-white/10'>
            <div>
              <div className='flex items-center gap-2'>
                <span
                  className='size-2.5 rounded-full'
                  style={{ backgroundColor: selectedNode.color }}
                />
                <span className='text-xs text-neutral-400 uppercase tracking-widest'>
                  {selectedNode.category} Node
                </span>
              </div>
              <h4 className='text-sm font-bold text-white mt-1'>{selectedNode.details.title}</h4>
            </div>

            {selectedNode.entropyBits && (
              <Badge
                className='text-[10px] font-mono border'
                style={{
                  backgroundColor: `${selectedNode.color}20`,
                  borderColor: selectedNode.color,
                  color: selectedNode.color
                }}
              >
                {selectedNode.entropyBits} Bits
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className='text-xs text-neutral-300 font-sans leading-relaxed'>
            {selectedNode.details.description}
          </p>

          {/* Math / Shannon Formula (Crucial for CS/cybersecurity students) */}
          {selectedNode.details.shannonFormula && (
            <div className='bg-black/80 border border-white/10 rounded-lg p-3'>
              <span className='text-[10px] text-amber-400 uppercase font-bold flex items-center gap-1'>
                <IconSparkles className='size-3' /> Information Theory / Entropy Formula
              </span>
              <div className='text-xs text-neutral-200 mt-1 font-mono font-bold bg-neutral-900/80 px-2 py-1 rounded border border-white/5'>
                {selectedNode.details.shannonFormula}
              </div>
            </div>
          )}

          {/* Raw Digest / Fingerprint Hash */}
          {selectedNode.details.rawDigest && (
            <div className='bg-black/80 border border-white/10 rounded-lg p-3'>
              <span className='text-[10px] text-cyan-400 uppercase font-bold block'>
                Hardware Digest / Signature
              </span>
              <div className='text-[11px] text-emerald-400 font-mono mt-1 break-all bg-neutral-900/80 p-1.5 rounded border border-white/5'>
                {selectedNode.details.rawDigest}
              </div>
            </div>
          )}

          {/* Key Attributes Table */}
          <div className='bg-black/50 border border-white/10 rounded-lg overflow-hidden'>
            <div className='px-3 py-1.5 bg-neutral-900/60 border-b border-white/10 text-[10px] text-neutral-400 uppercase font-bold'>
              Telemetric Parameters
            </div>
            <div className='divide-y divide-white/5 text-xs'>
              {selectedNode.details.attributes.map((attr, idx) => (
                <div key={idx} className='px-3 py-2 flex items-center justify-between gap-2'>
                  <span className='text-neutral-400 text-[11px]'>{attr.key}</span>
                  <span className='text-white font-bold text-right text-[11px] truncate max-w-[190px]'>
                    {attr.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Connected Edges Breakdown */}
          <div>
            <span className='text-[10px] text-neutral-400 uppercase font-bold block mb-1.5'>
              Connected Topology Edges
            </span>
            <div className='flex flex-wrap gap-1.5'>
              {edges
                .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                .map((e) => (
                  <Badge
                    key={e.id}
                    variant='outline'
                    className='text-[10px] font-mono border-white/20 bg-neutral-900/80 text-neutral-300'
                  >
                    {e.source === selectedNode.id ? `→ ${e.target}` : `← ${e.source}`}
                    <span className='ml-1 text-purple-400 font-bold'>({(e.weight * 100).toFixed(0)}%)</span>
                  </Badge>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
