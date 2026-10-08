'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useChannel, AdChannel } from '@/context/channel-context';
import { PlatformLogo } from '@/components/icons/platform-logos';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ============================================================================
// MINIMALIST-UI DESIGN TOKENS (Protocol Compliant)
// Warm Monochrome + Specific Desaturated Pastels:
// - Pale Red:    #FDEBEC (Text: #9F2F2D)
// - Pale Blue:   #E1F3FE (Text: #1F6C9F)
// - Pale Green:  #EDF3EC (Text: #346538)
// - Pale Yellow: #FBF3DB (Text: #956400)
// ============================================================================

export interface CampaignData {
  id?: number;
  campaign: string;
  platform: string;
  sku: string;
  productName: string;
  photoUrl: string;
  rating?: number;
  reviews?: number;
  category: string;
  currentDailySpend: number;
  currentDailyRevenue: number;
  currentDailyMargin: number;
  roas: number;
  targetRoas: number;
  breakevenRoas: number;
  roasStatus: string;
  healthScore: number;
  inventory: number;
  price: number;
  marginPct: number;
  pacingPct?: number;
  sparkline?: number[];
  updatedAt?: string;
}

export interface MatrixApiResponse {
  status: 'connected' | 'fallback' | 'error';
  database: string;
  latencyMs: number;
  timestamp: string;
  totalCampaigns: number;
  totalSkus: number;
  campaigns: CampaignData[];
  summary: {
    totalSpend: number;
    totalRevenue: number;
    blendedRoas: number;
    stockoutCount: number;
    averageHealth: number;
  };
  source: 'postgresql_live' | 'engine_state_fallback';
  errorDetails?: string;
}

interface ProductGroup {
  sku: string;
  productName: string;
  photoUrl: string;
  category: string;
  price: number;
  inventory: number;
  marketplaces: Record<string, CampaignData>;
  availablePlatforms: string[];
  totalSpend: number;
  totalRevenue: number;
  blendedRoas: number;
}

// Clean Minimalist SVG Primitives (Standardized 1.5px stroke, no generic lucide)
function SvgDatabase({ className = 'size-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
      <ellipse cx='12' cy='5' rx='9' ry='3' />
      <path d='M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5' />
      <path d='M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3' />
    </svg>
  );
}

function SvgSearch({ className = 'size-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
      <circle cx='11' cy='11' r='8' />
      <line x1='21' y1='21' x2='16.65' y2='16.65' />
    </svg>
  );
}

function SvgRefresh({ className = 'size-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
      <polyline points='23 4 23 10 17 10' />
      <polyline points='1 20 1 14 7 14' />
      <path d='M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15' />
    </svg>
  );
}

function SvgChevronDown({ className = 'size-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
      <polyline points='6 9 12 15 18 9' />
    </svg>
  );
}

function SvgChevronUp({ className = 'size-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
      <polyline points='18 15 12 9 6 15' />
    </svg>
  );
}

function SvgCheck({ className = 'size-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round'>
      <polyline points='20 6 9 17 4 12' />
    </svg>
  );
}

function SvgSliders({ className = 'size-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
      <line x1='4' y1='21' x2='4' y2='14' />
      <line x1='4' y1='10' x2='4' y2='3' />
      <line x1='12' y1='21' x2='12' y2='12' />
      <line x1='12' y1='8' x2='12' y2='3' />
      <line x1='20' y1='21' x2='20' y2='16' />
      <line x1='20' y1='12' x2='20' y2='3' />
      <line x1='1' y1='14' x2='7' y2='14' />
      <line x1='9' y1='8' x2='15' y2='8' />
      <line x1='17' y1='16' x2='23' y2='16' />
    </svg>
  );
}

function SvgDownload({ className = 'size-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
      <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
      <polyline points='7 10 12 15 17 10' />
      <line x1='12' y1='15' x2='12' y2='3' />
    </svg>
  );
}

// Minimalist pastel channel configs
const CHANNEL_PRESETS: Record<string, {
  name: string;
  code: string;
  badgeStyle: string;
  dotColor: string;
}> = {
  tiktok: {
    name: 'TikTok Ads',
    code: 'TT',
    badgeStyle: 'bg-[#FDEBEC] text-[#9F2F2D] border-[#F9D6D8]',
    dotColor: '#9F2F2D',
  },
  amazon: {
    name: 'Amazon Sponsored',
    code: 'AMZ',
    badgeStyle: 'bg-[#FBF3DB] text-[#956400] border-[#F5E6BF]',
    dotColor: '#956400',
  },
  meta: {
    name: 'Meta Advantage+',
    code: 'META',
    badgeStyle: 'bg-[#E1F3FE] text-[#1F6C9F] border-[#CDEBFC]',
    dotColor: '#1F6C9F',
  },
  google: {
    name: 'Google Shopping',
    code: 'GGL',
    badgeStyle: 'bg-[#EDF3EC] text-[#346538] border-[#DCEAD9]',
    dotColor: '#346538',
  },
  shopify: {
    name: 'Shopify Storefront',
    code: 'SHPF',
    badgeStyle: 'bg-[#EDF3EC] text-[#346538] border-[#DCEAD9]',
    dotColor: '#346538',
  },
};

export default function SkuChannelMatrixPage() {
  const [data, setData] = useState<MatrixApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingCampaign, setEditingCampaign] = useState<{ name: string; roas: number } | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  // Global channel context
  const { channel, setChannel } = useChannel();
  const platformFilter = channel;
  const setPlatformFilter = (plat: string) => setChannel(plat as AdChannel);

  // Expanded rows and dropdown states
  const [expandedSkus, setExpandedSkus] = useState<Record<string, boolean>>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<Record<string, string>>({});
  const [openDropdownSku, setOpenDropdownSku] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Live Backend Fetch from /api/matrix
  const fetchMatrixData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const res = await fetch('/api/matrix', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to query PostgreSQL`);
      }
      const json: MatrixApiResponse = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      console.error('[Matrix View] Backend fetch error:', err);
      setError(err?.message || 'Database connection error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchMatrixData();
  }, [fetchMatrixData]);

  // Real-time event listeners for live mutations dispatched by AI Coach or other components
  useEffect(() => {
    const handleInventoryUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ sku: string; quantity: number }>;
      const { sku, quantity } = customEvent.detail || {};
      if (sku && quantity !== undefined) {
        setData((prev) => {
          if (!prev) return prev;
          const cleanSku = String(sku).trim().toLowerCase();
          const updatedCampaigns = prev.campaigns.map((c) => {
            const matchesSku =
              c.sku.toLowerCase() === cleanSku ||
              c.productName.toLowerCase().includes(cleanSku) ||
              cleanSku.includes(c.sku.toLowerCase());
            if (matchesSku) {
              const newInv = Number(quantity);
              return {
                ...c,
                inventory: newInv,
                roasStatus: newInv === 0 ? 'CRITICAL_KILL' : c.roasStatus === 'CRITICAL_KILL' ? 'OPTIMAL' : c.roasStatus,
              };
            }
            return c;
          });

          const stockouts = new Set(updatedCampaigns.filter((c) => c.inventory === 0).map((c) => c.sku));

          return {
            ...prev,
            campaigns: updatedCampaigns,
            summary: {
              ...prev.summary,
              stockoutCount: stockouts.size,
            },
          };
        });
      }
    };

    const handleBudgetUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ target: string; budget: number; channel?: string }>;
      const { target, budget, channel } = customEvent.detail || {};
      if (target !== undefined && budget !== undefined) {
        setData((prev) => {
          if (!prev) return prev;
          const cleanTarget = String(target).trim().toLowerCase();
          const updatedCampaigns = prev.campaigns.map((c) => {
            const matches =
              c.sku.toLowerCase() === cleanTarget ||
              c.productName.toLowerCase().includes(cleanTarget) ||
              c.campaign.toLowerCase().includes(cleanTarget);
            const matchesChannel = !channel || channel === 'all' || c.platform.toLowerCase() === channel.toLowerCase();
            if (matches && matchesChannel) {
              return {
                ...c,
                currentDailySpend: Number(budget),
              };
            }
            return c;
          });

          const totalSpend = updatedCampaigns.reduce((acc, c) => acc + c.currentDailySpend, 0);
          const totalRevenue = updatedCampaigns.reduce((acc, c) => acc + c.currentDailyRevenue, 0);
          const blendedRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

          return {
            ...prev,
            campaigns: updatedCampaigns,
            summary: {
              ...prev.summary,
              totalSpend: Math.round(totalSpend * 100) / 100,
              blendedRoas: Math.round(blendedRoas * 100) / 100,
            },
          };
        });
      }
    };

    const handleGenericUiAction = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: string; payload: any }>;
      const { type, payload } = customEvent.detail || {};
      if (type === 'UPDATE_INVENTORY') {
        handleInventoryUpdate(new CustomEvent('nexus:inventory_updated', { detail: payload }));
      } else if (type === 'UPDATE_BUDGET') {
        handleBudgetUpdate(new CustomEvent('nexus:budget_updated', { detail: payload }));
      }
    };

    window.addEventListener('nexus:inventory_updated', handleInventoryUpdate);
    window.addEventListener('nexus:budget_updated', handleBudgetUpdate);
    window.addEventListener('nexus:ui_action', handleGenericUiAction);

    return () => {
      window.removeEventListener('nexus:inventory_updated', handleInventoryUpdate);
      window.removeEventListener('nexus:budget_updated', handleBudgetUpdate);
      window.removeEventListener('nexus:ui_action', handleGenericUiAction);
    };
  }, []);

  // Click outside listener for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownSku(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut listener: R to refresh, / to search, E to expand all
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        fetchMatrixData(true);
      } else if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        toggleExpandAll();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const rawCampaigns = useMemo(() => data?.campaigns || [], [data]);

  // Group raw campaigns into ProductGroup items
  const productGroups: ProductGroup[] = useMemo(() => {
    const map: Record<string, ProductGroup> = {};

    rawCampaigns.forEach((c) => {
      const sku = c.sku;
      if (!map[sku]) {
        map[sku] = {
          sku,
          productName: c.productName || sku,
          photoUrl: c.photoUrl,
          category: c.category || 'Sportswear',
          price: c.price,
          inventory: c.inventory,
          marketplaces: {},
          availablePlatforms: [],
          totalSpend: 0,
          totalRevenue: 0,
          blendedRoas: 0,
        };
      }
      map[sku].marketplaces[c.platform] = c;
      if (!map[sku].availablePlatforms.includes(c.platform)) {
        map[sku].availablePlatforms.push(c.platform);
      }
      map[sku].totalSpend += c.currentDailySpend;
      map[sku].totalRevenue += c.currentDailyRevenue;
    });

    const priority = ['tiktok', 'amazon', 'meta', 'google', 'shopify'];
    return Object.values(map).map((p) => {
      p.availablePlatforms.sort((a, b) => priority.indexOf(a) - priority.indexOf(b));
      p.blendedRoas = p.totalSpend > 0 ? p.totalRevenue / p.totalSpend : 0;
      return p;
    });
  }, [rawCampaigns]);

  // Set default selected platform if unset
  useEffect(() => {
    if (productGroups.length > 0 && Object.keys(selectedPlatforms).length === 0) {
      const initial: Record<string, string> = {};
      productGroups.forEach((p) => {
        initial[p.sku] = p.marketplaces['tiktok'] ? 'tiktok' : (p.availablePlatforms[0] || 'meta');
      });
      setSelectedPlatforms(initial);
    }
  }, [productGroups, selectedPlatforms]);

  const toggleExpand = (sku: string) => {
    setExpandedSkus((prev) => ({
      ...prev,
      [sku]: !prev[sku],
    }));
  };

  const toggleExpandAll = () => {
    const allExpanded = productGroups.length > 0 && productGroups.every((p) => expandedSkus[p.sku]);
    const newState: Record<string, boolean> = {};
    productGroups.forEach((p) => {
      newState[p.sku] = !allExpanded;
    });
    setExpandedSkus(newState);
  };

  const handleSelectPlatform = (sku: string, platform: string) => {
    setSelectedPlatforms((prev) => ({
      ...prev,
      [sku]: platform,
    }));
    setOpenDropdownSku(null);
  };

  // Live save target ROAS mutation directly to PostgreSQL
  const handleSaveTargetRoas = async (campaignName: string, targetRoas: number) => {
    setIsSavingEdit(true);
    try {
      const res = await fetch('/api/matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignName, targetRoas }),
      });
      if (res.ok) {
        await fetchMatrixData(false);
        setEditingCampaign(null);
      } else {
        alert('Failed to update campaign in database');
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'SKU',
      'Shoe Name',
      'Category',
      'Marketplace',
      'Unit Price',
      'Gross Margin (%)',
      'ERP Stock',
      'Daily Spend',
      'Daily Revenue',
      'Current ROAS',
      'Target ROAS',
      'ROAS Status'
    ];

    const rows: string[][] = [];
    filteredProducts.forEach((p) => {
      Object.entries(p.marketplaces).forEach(([platform, camp]) => {
        rows.push([
          `"${p.sku}"`,
          `"${p.productName.replace(/"/g, '""')}"`,
          `"${p.category}"`,
          `"${platform.toUpperCase()}"`,
          `"${p.price}"`,
          `"${camp.marginPct}%"`,
          `"${p.inventory}"`,
          `"${camp.currentDailySpend}"`,
          `"${camp.currentDailyRevenue}"`,
          `"${camp.roas.toFixed(2)}x"`,
          `"${camp.targetRoas.toFixed(2)}x"`,
          `"${camp.roasStatus}"`
        ]);
      });
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nexus-sku-matrix-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('SKU Economics Matrix exported to CSV', {
      description: `Exported ${rows.length} marketplace SKU campaigns.`
    });
  };

  // Filter products by search and platform
  const filteredProducts = useMemo(() => {
    return productGroups.filter((p) => {
      const matchesSearch =
        p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPlatform =
        platformFilter === 'all' || p.availablePlatforms.includes(platformFilter);

      return matchesSearch && matchesPlatform;
    });
  }, [productGroups, searchQuery, platformFilter]);

  // Overall KPI metrics calculated directly from database payload
  const summary = data?.summary || {
    totalSpend: 0,
    totalRevenue: 0,
    blendedRoas: 0,
    stockoutCount: 0,
    averageHealth: 0,
  };

  return (
    <div className='relative flex flex-1 flex-col w-full min-w-0 min-h-screen bg-[#FBFBFA] dark:bg-[#0C0D0E] text-[#111111] dark:text-[#EEEEEE] font-sans p-4 sm:p-6 md:p-8 space-y-6'>
      
      {/* 1. FAUX-OS WINDOW CHROME & METADATA BAR (Technical Document Header) */}
      <div className='w-full border border-[#EAEAEA] dark:border-[#262626] bg-[#FFFFFF] dark:bg-[#141517] rounded-[8px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          {/* macOS window control primitives */}
          <div className='flex items-center gap-1.5'>
            <span className='size-2.5 rounded-full bg-[#E5E5E5] dark:bg-[#333333]' />
            <span className='size-2.5 rounded-full bg-[#E5E5E5] dark:bg-[#333333]' />
            <span className='size-2.5 rounded-full bg-[#E5E5E5] dark:bg-[#333333]' />
          </div>
          <div className='h-4 w-px bg-[#EAEAEA] dark:bg-[#262626]' />
          <div className='flex items-center gap-2'>
            <SvgDatabase className='size-3.5 text-[#787774]' />
            <span className='font-mono text-xs text-[#787774]'>
              NODE: <strong className='text-[#111111] dark:text-[#EEEEEE]'>{data?.database || 'Connecting...'}</strong>
            </span>
          </div>
        </div>

        {/* Real Backend Connection Badge & Latency */}
        <div className='flex items-center gap-3 flex-wrap'>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider border',
              data?.source === 'postgresql_live'
                ? 'bg-[#EDF3EC] text-[#346538] border-[#DCEAD9]'
                : 'bg-[#FBF3DB] text-[#956400] border-[#F5E6BF]'
            )}
          >
            <span
              className={cn(
                'size-1.5 rounded-full',
                data?.source === 'postgresql_live' ? 'bg-[#346538]' : 'bg-[#956400]'
              )}
            />
            {data?.source === 'postgresql_live' ? 'POSTGRESQL 16 LIVE' : 'OFFLINE BUFFER'}
          </span>

          <span className='font-mono text-xs text-[#787774]'>
            RTT: <strong className='text-[#111111] dark:text-[#EEEEEE]'>{data?.latencyMs ?? 0}ms</strong>
          </span>

          <span className='font-mono text-xs text-[#787774]'>
            ROWS: <strong className='text-[#111111] dark:text-[#EEEEEE]'>{data?.totalCampaigns ?? 0}</strong>
          </span>

          <button
            onClick={() => fetchMatrixData(true)}
            disabled={isRefreshing}
            className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#111111] dark:bg-[#EEEEEE] text-[#FFFFFF] dark:text-[#111111] text-xs font-mono transition-transform active:scale-[0.98] disabled:opacity-50'
            title='Refresh database connection (Key: R)'
          >
            <SvgRefresh className={cn('size-3', isRefreshing && 'animate-spin')} />
            <span>Sync</span>
            <kbd className='px-1 py-0.2 text-[9px] font-mono bg-white/20 rounded border border-white/30'>R</kbd>
          </button>
        </div>
      </div>

      {/* 2. SECTION HEADER (Clean Sans + Disciplined Scale) */}
      <div className='space-y-1.5 border-b border-[#EAEAEA] dark:border-[#262626] pb-4 w-full'>
        <div className='flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#787774]'>
          <span>Allocation Ledger</span>
          <span>/</span>
          <span>Footwear Analytics</span>
        </div>
        <h1 className='text-xl sm:text-2xl font-semibold text-[#111111] dark:text-[#FFFFFF] tracking-tight'>
          SKU Allocation Matrix
        </h1>
        <p className='text-xs sm:text-sm text-[#787774] max-w-3xl leading-normal'>
          Unit economics and daily ad spend reconciled across Meta, Google, Amazon, and Shopify.
        </p>
      </div>

      {/* 3. BENTO BOX SUMMARY CARDS (Ultra-flat, 1px solid #EAEAEA, Crisp 8px radius) */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 w-full'>
        <div className='border border-[#EAEAEA] dark:border-[#262626] bg-[#FFFFFF] dark:bg-[#141517] rounded-[8px] p-5 space-y-1.5'>
          <div className='text-[11px] font-mono uppercase tracking-wider text-[#787774]'>
            Total Daily Spend
          </div>
          <div className='text-2xl font-mono font-semibold tracking-tight text-[#111111] dark:text-[#FFFFFF]'>
            ${summary.totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className='text-[10px] font-mono text-[#787774]'>
            Across {data?.totalCampaigns ?? 0} active channels
          </div>
        </div>

        <div className='border border-[#EAEAEA] dark:border-[#262626] bg-[#FFFFFF] dark:bg-[#141517] rounded-[8px] p-5 space-y-1.5'>
          <div className='text-[11px] font-mono uppercase tracking-wider text-[#787774]'>
            Attributed Revenue
          </div>
          <div className='text-2xl font-mono font-semibold tracking-tight text-[#111111] dark:text-[#FFFFFF]'>
            ${summary.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className='text-[10px] font-mono text-[#346538]'>
            Trailing 24h reconciled
          </div>
        </div>

        <div className='border border-[#EAEAEA] dark:border-[#262626] bg-[#FFFFFF] dark:bg-[#141517] rounded-[8px] p-5 space-y-1.5'>
          <div className='text-[11px] font-mono uppercase tracking-wider text-[#787774]'>
            Blended ROAS
          </div>
          <div className='text-2xl font-mono font-semibold tracking-tight text-[#111111] dark:text-[#FFFFFF]'>
            {summary.blendedRoas.toFixed(2)}x
          </div>
          <div className='text-[10px] font-mono text-[#787774]'>
            Target benchmark: 3.20x
          </div>
        </div>

        <div className='border border-[#EAEAEA] dark:border-[#262626] bg-[#FFFFFF] dark:bg-[#141517] rounded-[8px] p-5 space-y-1.5'>
          <div className='text-[11px] font-mono uppercase tracking-wider text-[#787774]'>
            Stockout Alerts
          </div>
          <div className='text-2xl font-mono font-semibold tracking-tight text-[#9F2F2D]'>
            {summary.stockoutCount} <span className='text-xs font-normal text-[#787774]'>SKUs</span>
          </div>
          <div className='text-[10px] font-mono text-[#9F2F2D]'>
            Requires ad pause
          </div>
        </div>
      </div>

      {/* 4. FILTER BAR & KEYSTROKE SHORTCUTS */}
      <div className='w-full border border-[#EAEAEA] dark:border-[#262626] bg-[#FFFFFF] dark:bg-[#141517] rounded-[8px] p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3'>
        {/* Search Input with Keyboard shortcut [/] */}
        <div className='relative flex-1 max-w-md'>
          <span className='absolute left-3 top-1/2 -translate-y-1/2 text-[#787774]'>
            <SvgSearch className='size-3.5' />
          </span>
          <input
            ref={searchInputRef}
            type='text'
            placeholder='Filter by shoe model or SKU code...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-9 pr-14 py-1.5 text-xs font-mono rounded-[6px] border border-[#EAEAEA] dark:border-[#262626] bg-[#FBFBFA] dark:bg-[#0C0D0E] text-[#111111] dark:text-[#EEEEEE] focus:outline-hidden focus:border-[#111111] dark:focus:border-[#EEEEEE]'
          />
          <kbd className='absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-mono rounded border border-[#EAEAEA] dark:border-[#262626] bg-[#FFFFFF] dark:bg-[#141517] text-[#787774]'>
            /
          </kbd>
        </div>

        {/* Marketplace Selection Pills (Warm Monochrome + Spot Pastels) */}
        <div className='flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0'>
          <button
            onClick={() => setPlatformFilter('all')}
            className={cn(
              'px-2.5 py-1 text-xs font-mono rounded-[4px] border transition-colors',
              platformFilter === 'all'
                ? 'bg-[#111111] text-[#FFFFFF] dark:bg-[#EEEEEE] dark:text-[#111111] border-transparent font-medium'
                : 'bg-transparent text-[#787774] border-[#EAEAEA] dark:border-[#262626] hover:text-[#111111] dark:hover:text-[#FFFFFF]'
            )}
          >
            All Channels
          </button>

          {(['tiktok', 'amazon', 'meta', 'google', 'shopify'] as const).map((plat) => {
            const cfg = CHANNEL_PRESETS[plat];
            const isActive = platformFilter === plat;
            return (
              <button
                key={plat}
                onClick={() => setPlatformFilter(plat)}
                className={cn(
                  'px-2.5 py-1 text-xs font-mono rounded-[4px] border flex items-center gap-2 transition-colors',
                  isActive
                    ? 'border-[#111111] dark:border-[#EEEEEE] bg-[#F7F6F3] dark:bg-[#1E1F21] text-[#111111] dark:text-[#FFFFFF] font-medium'
                    : 'border-[#EAEAEA] dark:border-[#262626] text-[#787774] hover:text-[#111111] dark:hover:text-[#FFFFFF]'
                )}
              >
                <PlatformLogo platform={plat} size={13} className='shrink-0' />
                <span>{cfg.name}</span>
              </button>
            );
          })}

          <button
            onClick={toggleExpandAll}
            className='ml-auto px-2.5 py-1 text-xs font-mono rounded-[4px] border border-[#EAEAEA] dark:border-[#262626] bg-[#F7F6F3] dark:bg-[#1E1F21] text-[#111111] dark:text-[#EEEEEE] hover:bg-[#EAEAEA] dark:hover:bg-[#262626] flex items-center gap-1.5 transition-colors'
            title='Toggle expand all marketplaces (Key: E)'
          >
            <span>
              {productGroups.length > 0 && productGroups.every((p) => expandedSkus[p.sku])
                ? 'Collapse All'
                : 'Expand All'}
            </span>
            <kbd className='px-1 py-0.2 text-[9px] font-mono rounded border border-[#EAEAEA] dark:border-[#262626] bg-[#FFFFFF] dark:bg-[#141517] text-[#787774]'>
              E
            </kbd>
          </button>

          <button
            onClick={handleExportCsv}
            className='px-2.5 py-1 text-xs font-mono rounded-[4px] border border-[#EAEAEA] dark:border-[#262626] bg-[#F7F6F3] dark:bg-[#1E1F21] text-[#111111] dark:text-[#EEEEEE] hover:bg-[#EAEAEA] dark:hover:bg-[#262626] flex items-center gap-1.5 transition-colors'
            title='Export filtered matrix to CSV'
          >
            <SvgDownload className='size-3 text-[#787774]' />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 5. MAIN TABULAR MATRIX (Clean 1px border, generous cell padding, strict monospace numbers) */}
      <div
        className='w-full border border-[#EAEAEA] dark:border-[#262626] bg-[#FFFFFF] dark:bg-[#141517] rounded-[8px] overflow-hidden'
        ref={dropdownRef}
      >
        {isLoading ? (
          <div className='p-12 text-center space-y-3 font-mono text-xs text-[#787774]'>
            <SvgRefresh className='size-5 animate-spin mx-auto text-[#111111] dark:text-[#EEEEEE]' />
            <p>Querying PostgreSQL 16 database cluster...</p>
          </div>
        ) : error ? (
          <div className='p-8 text-center space-y-3 font-mono text-xs text-[#9F2F2D] bg-[#FDEBEC] border border-[#F9D6D8] rounded-[6px] m-4'>
            <p>Database Error: {error}</p>
            <button
              onClick={() => fetchMatrixData(true)}
              className='px-3 py-1 bg-[#111111] text-[#FFFFFF] rounded-[4px] text-xs'
            >
              Retry Connection
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className='p-12 text-center space-y-2 font-mono text-xs text-[#787774]'>
            <p>No products match query &quot;{searchQuery}&quot;.</p>
          </div>
        ) : (
          <div className='overflow-x-auto w-full'>
            <table className='w-full min-w-full text-left text-xs font-mono'>
              <thead>
                <tr className='border-b border-[#EAEAEA] dark:border-[#262626] text-[11px] text-[#787774] uppercase tracking-wider bg-[#FBFBFA] dark:bg-[#111214]'>
                  <th className='py-3.5 px-4'>Shoe &amp; SKU</th>
                  <th className='py-3.5 px-3'>Active Channel</th>
                  <th className='py-3.5 px-3 text-right'>Unit Price</th>
                  <th className='py-3.5 px-3 text-right'>Gross Margin</th>
                  <th className='py-3.5 px-3 text-right'>ERP Stock</th>
                  <th className='py-3.5 px-3 text-right'>Daily Spend</th>
                  <th className='py-3.5 px-3 text-right'>Current ROAS</th>
                  <th className='py-3.5 px-3 text-center'>Target ROAS</th>
                  <th className='py-3.5 px-3 text-center'>Health</th>
                  <th className='py-3.5 px-4 text-center'>Channel Status</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-[#EAEAEA] dark:divide-[#262626]'>
                {filteredProducts.map((p) => {
                  const activePlatform = selectedPlatforms[p.sku] || p.availablePlatforms[0] || 'meta';
                  const activeCampaign = p.marketplaces[activePlatform] || Object.values(p.marketplaces)[0];
                  const isStockout = p.inventory === 0;
                  const isExpanded = !!expandedSkus[p.sku];
                  const isDropdownOpen = openDropdownSku === p.sku;
                  const currentCfg = CHANNEL_PRESETS[activePlatform] || CHANNEL_PRESETS['meta'];

                  return (
                    <React.Fragment key={p.sku}>
                      {/* Main Product Row */}
                      <tr
                        className={cn(
                          'hover:bg-[#F9F9F8] dark:hover:bg-[#18191B] transition-colors',
                          isExpanded && 'bg-[#F7F6F3]/50 dark:bg-[#18191B]/40'
                        )}
                      >
                        {/* Shoe & SKU */}
                        <td className='py-3 px-4'>
                          <div className='flex items-center gap-3'>
                            <button
                              onClick={() => toggleExpand(p.sku)}
                              aria-label={`Toggle marketplace breakdown for ${p.productName}`}
                              className='size-5 rounded-[4px] border border-[#EAEAEA] dark:border-[#262626] flex items-center justify-center text-[#787774] hover:text-[#111111] dark:hover:text-[#FFFFFF] transition-colors shrink-0'
                            >
                              {isExpanded ? (
                                <SvgChevronUp className='size-3' />
                              ) : (
                                <SvgChevronDown className='size-3' />
                              )}
                            </button>

                            {p.photoUrl ? (
                              <div className='relative size-9 rounded-[6px] border border-[#EAEAEA] dark:border-[#262626] bg-[#FFFFFF] dark:bg-[#141517] overflow-hidden shrink-0'>
                                <Image
                                  src={p.photoUrl}
                                  alt={p.productName}
                                  fill
                                  sizes='36px'
                                  className='object-cover'
                                />
                              </div>
                            ) : (
                              <div className='size-9 rounded-[6px] border border-[#EAEAEA] dark:border-[#262626] bg-[#F7F6F3] dark:bg-[#1E1F21] flex items-center justify-center text-[9px] font-mono text-[#787774] shrink-0'>
                                NIKE
                              </div>
                            )}

                            <div>
                              <div className='font-sans font-medium text-[#111111] dark:text-[#FFFFFF] leading-tight'>
                                {p.productName}
                              </div>
                              <div className='flex items-center gap-2 mt-0.5'>
                                <span className='text-[10px] text-[#787774] font-mono'>{p.sku}</span>
                                <span className='text-[10px] text-[#787774]'>•</span>
                                <span className='text-[10px] text-[#787774]'>{p.category}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Interactive Marketplace Dropdown */}
                        <td className='py-3 px-3 relative'>
                          <div className='inline-block'>
                            <button
                              type='button'
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownSku(isDropdownOpen ? null : p.sku);
                              }}
                              className={cn(
                                'px-2.5 py-1 rounded-[4px] text-[10px] font-mono border flex items-center gap-1.5 transition-colors cursor-pointer',
                                currentCfg.badgeStyle
                              )}
                            >
                              <PlatformLogo platform={activePlatform} size={13} className='shrink-0' />
                              <span>{currentCfg.name}</span>
                              <SvgChevronDown className={cn('size-2.5 transition-transform', isDropdownOpen && 'rotate-180')} />
                            </button>

                            {/* Dropdown Menu Panel */}
                            {isDropdownOpen && (
                              <div
                                className='absolute left-0 top-full mt-1.5 z-50 w-64 rounded-[6px] border border-[#EAEAEA] dark:border-[#262626] bg-[#FFFFFF] dark:bg-[#141517] p-1.5 shadow-sm'
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className='px-2 py-1 text-[9px] font-mono uppercase tracking-wider text-[#787774] border-b border-[#EAEAEA] dark:border-[#262626] mb-1'>
                                  Available Channels ({p.availablePlatforms.length})
                                </div>

                                <div className='space-y-0.5'>
                                  {p.availablePlatforms.map((plat) => {
                                    const cData = p.marketplaces[plat];
                                    const cfg = CHANNEL_PRESETS[plat] || CHANNEL_PRESETS['meta'];
                                    const isSelected = plat === activePlatform;

                                    return (
                                      <button
                                        key={plat}
                                        type='button'
                                        onClick={() => handleSelectPlatform(p.sku, plat)}
                                        className={cn(
                                          'w-full text-left px-2 py-1.5 rounded-[4px] text-xs font-mono flex items-center justify-between transition-colors',
                                          isSelected
                                            ? 'bg-[#F7F6F3] dark:bg-[#1E1F21] text-[#111111] dark:text-[#FFFFFF] font-medium'
                                            : 'hover:bg-[#F9F9F8] dark:hover:bg-[#18191B] text-[#787774] hover:text-[#111111]'
                                        )}
                                      >
                                        <div className='flex items-center gap-2'>
                                          <div className='size-5 rounded-[3px] border border-[#EAEAEA] dark:border-[#262626] bg-[#FFFFFF] dark:bg-[#141517] flex items-center justify-center shrink-0 p-0.5'>
                                            <PlatformLogo platform={plat} size={12} className='shrink-0' />
                                          </div>
                                          <div>
                                            <div className='text-[10px] font-medium text-[#111111] dark:text-[#FFFFFF] flex items-center gap-1.5'>
                                              <span>{cfg.name}</span>
                                              <span className='text-[8px] text-[#787774] font-mono px-1 py-0.2 rounded bg-[#F7F6F3] dark:bg-[#1E1F21] border border-[#EAEAEA] dark:border-[#262626]'>
                                                {cfg.code}
                                              </span>
                                            </div>
                                            {cData && (
                                              <div className='text-[9px] text-[#787774]'>
                                                ${cData.currentDailySpend.toFixed(0)}/d • {cData.roas.toFixed(2)}x ROAS
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {isSelected && (
                                          <SvgCheck className='size-3 text-[#346538] shrink-0 ml-2' />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Unit Price */}
                        <td className='py-3 px-3 text-right tabular-nums text-[#111111] dark:text-[#FFFFFF]'>
                          {p.price > 1000 ? `$${(p.price / 83).toFixed(2)} / ₹${p.price.toLocaleString('en-IN')}` : `$${p.price.toFixed(2)}`}
                        </td>

                        {/* Gross Margin */}
                        <td className='py-3 px-3 text-right tabular-nums text-[#346538] font-medium'>
                          {activeCampaign ? activeCampaign.marginPct.toFixed(1) : '50.0'}%
                        </td>

                        {/* ERP Stock */}
                        <td className='py-3 px-3 text-right tabular-nums'>
                          {isStockout ? (
                            <span className='inline-block px-1.5 py-0.5 rounded-[3px] text-[10px] font-mono bg-[#FDEBEC] text-[#9F2F2D] border border-[#F9D6D8]'>
                              0 (OUT)
                            </span>
                          ) : (
                            <span className='text-[#111111] dark:text-[#FFFFFF]'>
                              {p.inventory.toLocaleString()} u
                            </span>
                          )}
                        </td>

                        {/* Daily Spend */}
                        <td className='py-3 px-3 text-right tabular-nums text-[#111111] dark:text-[#FFFFFF]'>
                          ${activeCampaign ? activeCampaign.currentDailySpend.toFixed(0) : '0'}
                        </td>

                        {/* Current ROAS */}
                        <td className='py-3 px-3 text-right tabular-nums font-semibold'>
                          {activeCampaign ? (
                            <span
                              className={cn(
                                activeCampaign.roas < 1.8
                                  ? 'text-[#9F2F2D]'
                                  : activeCampaign.roas < 3.2
                                  ? 'text-[#956400]'
                                  : 'text-[#346538]'
                              )}
                            >
                              {activeCampaign.roas.toFixed(2)}x
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>

                        {/* Target ROAS (Interactive Inline Edit) */}
                        <td className='py-3 px-3 text-center'>
                          {editingCampaign?.name === activeCampaign?.campaign ? (
                            <div className='inline-flex items-center gap-1'>
                              <input
                                type='number'
                                step='0.1'
                                value={editingCampaign.roas}
                                onChange={(e) =>
                                  setEditingCampaign({
                                    ...editingCampaign,
                                    roas: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className='w-14 px-1 py-0.5 text-xs font-mono rounded border border-[#111111] dark:border-[#EEEEEE] bg-transparent text-center'
                              />
                              <button
                                onClick={() =>
                                  handleSaveTargetRoas(activeCampaign.campaign, editingCampaign.roas)
                                }
                                disabled={isSavingEdit}
                                className='px-1.5 py-0.5 rounded bg-[#111111] dark:bg-[#EEEEEE] text-[#FFFFFF] dark:text-[#111111] text-[10px]'
                              >
                                {isSavingEdit ? '...' : 'Save'}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                setEditingCampaign({
                                  name: activeCampaign.campaign,
                                  roas: activeCampaign.targetRoas,
                                })
                              }
                              className='text-[11px] font-mono text-[#787774] hover:text-[#111111] dark:hover:text-[#FFFFFF] underline decoration-dotted decoration-[#787774]'
                              title='Click to edit target in PostgreSQL'
                            >
                              {activeCampaign?.targetRoas.toFixed(2)}x
                            </button>
                          )}
                        </td>

                        {/* Health Score */}
                        <td className='py-3 px-3 text-center'>
                          <span className='inline-block px-1.5 py-0.5 rounded-[3px] text-[10px] font-mono bg-[#F7F6F3] dark:bg-[#1E1F21] border border-[#EAEAEA] dark:border-[#262626] text-[#787774]'>
                            {activeCampaign ? activeCampaign.healthScore : 75}/100
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className='py-3 px-4 text-center'>
                          <span
                            className={cn(
                              'inline-block px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider border',
                              isStockout
                                ? 'bg-[#FDEBEC] text-[#9F2F2D] border-[#F9D6D8]'
                                : activeCampaign?.roasStatus === 'ABOVE_TARGET'
                                ? 'bg-[#EDF3EC] text-[#346538] border-[#DCEAD9]'
                                : activeCampaign?.roasStatus === 'BELOW_BREAKEVEN'
                                ? 'bg-[#FDEBEC] text-[#9F2F2D] border-[#F9D6D8]'
                                : 'bg-[#FBF3DB] text-[#956400] border-[#F5E6BF]'
                            )}
                          >
                            {isStockout ? 'STOCKOUT' : activeCampaign?.roasStatus || 'OPTIMAL'}
                          </span>
                        </td>
                      </tr>

                      {/* Drop-Down Expanded Sub-Table: Cross-Platform Side-by-Side Breakdown */}
                      {isExpanded && (
                        <tr className='bg-[#FBFBFA] dark:bg-[#111214] border-b border-[#EAEAEA] dark:border-[#262626]'>
                          <td colSpan={10} className='p-0'>
                            <div className='p-5 pl-12 border-l-2 border-[#111111] dark:border-[#EEEEEE] space-y-3'>
                              <div className='flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#EAEAEA] dark:border-[#262626]'>
                                <div className='font-mono text-xs uppercase tracking-wider text-[#111111] dark:text-[#FFFFFF]'>
                                  Marketplace Breakdown: {p.productName} ({p.sku})
                                </div>
                                <div className='flex items-center gap-3 text-[11px] font-mono text-[#787774]'>
                                  <span>
                                    Combined Spend: <strong className='text-[#111111] dark:text-[#FFFFFF]'>${p.totalSpend.toFixed(0)}</strong>
                                  </span>
                                  <span>•</span>
                                  <span>
                                    Blended ROAS:{' '}
                                    <strong className='text-[#346538]'>
                                      {p.blendedRoas.toFixed(2)}x
                                    </strong>
                                  </span>
                                </div>
                              </div>

                              <div className='border border-[#EAEAEA] dark:border-[#262626] rounded-[6px] overflow-hidden bg-[#FFFFFF] dark:bg-[#141517]'>
                                <table className='w-full text-left text-xs font-mono'>
                                  <thead>
                                    <tr className='border-b border-[#EAEAEA] dark:border-[#262626] text-[10px] text-[#787774] uppercase tracking-wider bg-[#FBFBFA] dark:bg-[#111214]'>
                                      <th className='py-2 px-3'>Marketplace</th>
                                      <th className='py-2 px-3'>Campaign Key</th>
                                      <th className='py-2 px-3 text-right'>Daily Spend</th>
                                      <th className='py-2 px-3 text-right'>Spend Share</th>
                                      <th className='py-2 px-3 text-right'>ROAS</th>
                                      <th className='py-2 px-3 text-right'>Margin %</th>
                                      <th className='py-2 px-3 text-right'>ERP Stock</th>
                                      <th className='py-2 px-3 text-center'>Health</th>
                                      <th className='py-2 px-3 text-center'>Status</th>
                                      <th className='py-2 px-3 text-right'>Row Action</th>
                                    </tr>
                                  </thead>
                                  <tbody className='divide-y divide-[#EAEAEA] dark:divide-[#262626]'>
                                    {p.availablePlatforms.map((plat) => {
                                      const c = p.marketplaces[plat];
                                      const cfg = CHANNEL_PRESETS[plat] || CHANNEL_PRESETS['meta'];
                                      const isCurrentActive = plat === activePlatform;
                                      const spendShare = p.totalSpend > 0 ? (c.currentDailySpend / p.totalSpend) * 100 : 0;

                                      return (
                                        <tr
                                          key={plat}
                                          className={cn(
                                            'transition-colors',
                                            isCurrentActive ? 'bg-[#F7F6F3] dark:bg-[#1E1F21]' : 'hover:bg-[#F9F9F8] dark:hover:bg-[#18191B]'
                                          )}
                                        >
                                          <td className='py-2 px-3'>
                                            <div className='flex items-center gap-2'>
                                              <div className='size-5 rounded-[3px] border border-[#EAEAEA] dark:border-[#262626] bg-[#FFFFFF] dark:bg-[#141517] flex items-center justify-center shrink-0 p-0.5'>
                                                <PlatformLogo platform={plat} size={12} className='shrink-0' />
                                              </div>
                                              <span className={cn('px-2 py-0.5 rounded-[3px] text-[10px] font-mono border font-medium', cfg.badgeStyle)}>
                                                {cfg.name}
                                              </span>
                                            </div>
                                          </td>

                                          <td className='py-2 px-3 text-[10px] text-[#787774]'>
                                            {c.campaign}
                                          </td>

                                          <td className='py-2 px-3 text-right tabular-nums text-[#111111] dark:text-[#FFFFFF]'>
                                            ${c.currentDailySpend.toFixed(0)}
                                          </td>

                                          <td className='py-2 px-3 text-right tabular-nums text-[#787774] text-[11px]'>
                                            {spendShare.toFixed(1)}%
                                          </td>

                                          <td className='py-2 px-3 text-right tabular-nums font-semibold'>
                                            <span
                                              className={cn(
                                                c.roas < 1.8
                                                  ? 'text-[#9F2F2D]'
                                                  : c.roas < 3.2
                                                  ? 'text-[#956400]'
                                                  : 'text-[#346538]'
                                              )}
                                            >
                                              {c.roas.toFixed(2)}x
                                            </span>
                                          </td>

                                          <td className='py-2 px-3 text-right tabular-nums text-[#346538]'>
                                            {c.marginPct.toFixed(1)}%
                                          </td>

                                          <td className='py-2 px-3 text-right tabular-nums'>
                                            {isStockout ? (
                                              <span className='text-[#9F2F2D] text-[10px]'>0 (OUT)</span>
                                            ) : (
                                              <span>{c.inventory.toLocaleString()} u</span>
                                            )}
                                          </td>

                                          <td className='py-2 px-3 text-center'>
                                            <span className='text-[10px] text-[#787774]'>
                                              {c.healthScore}/100
                                            </span>
                                          </td>

                                          <td className='py-2 px-3 text-center'>
                                            <span
                                              className={cn(
                                                'inline-block px-1.5 py-0.2 rounded-full text-[9px] font-mono tracking-wider border',
                                                isStockout
                                                  ? 'bg-[#FDEBEC] text-[#9F2F2D] border-[#F9D6D8]'
                                                  : c.roasStatus === 'ABOVE_TARGET'
                                                  ? 'bg-[#EDF3EC] text-[#346538] border-[#DCEAD9]'
                                                  : 'bg-[#FBF3DB] text-[#956400] border-[#F5E6BF]'
                                              )}
                                            >
                                              {isStockout ? 'OUT' : c.roasStatus}
                                            </span>
                                          </td>

                                          <td className='py-2 px-3 text-right'>
                                            {isCurrentActive ? (
                                              <span className='text-[10px] font-mono text-[#346538] font-medium flex items-center justify-end gap-1'>
                                                <SvgCheck className='size-3' /> Active
                                              </span>
                                            ) : (
                                              <button
                                                type='button'
                                                onClick={() => handleSelectPlatform(p.sku, plat)}
                                                className='px-2 py-0.5 text-[10px] font-mono rounded-[3px] border border-[#EAEAEA] dark:border-[#262626] hover:bg-[#EAEAEA] dark:hover:bg-[#262626] transition-colors'
                                              >
                                                Switch View
                                              </button>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. TECHNICAL AUDIT FOOTER & KEYSTROKE REFERENCE */}
      <div className='w-full border-t border-[#EAEAEA] dark:border-[#262626] pt-4 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#787774] gap-2'>
        <div className='flex items-center gap-3'>
          <span>STORAGE: DuckDB + PostgreSQL 16</span>
          <span>•</span>
          <span>SCHEMA: v_daily_unit_economics</span>
          <span>•</span>
          <span>UPDATED: {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'Pending'}</span>
        </div>
        <div className='flex items-center gap-2'>
          <span>Shortcuts:</span>
          <kbd className='px-1.5 py-0.5 rounded border border-[#EAEAEA] dark:border-[#262626] bg-[#FFFFFF] dark:bg-[#141517]'>/</kbd>
          <span>Search</span>
          <kbd className='px-1.5 py-0.5 rounded border border-[#EAEAEA] dark:border-[#262626] bg-[#FFFFFF] dark:bg-[#141517]'>R</kbd>
          <span>Sync</span>
          <kbd className='px-1.5 py-0.5 rounded border border-[#EAEAEA] dark:border-[#262626] bg-[#FFFFFF] dark:bg-[#141517]'>E</kbd>
          <span>Expand</span>
        </div>
      </div>

    </div>
  );
}
