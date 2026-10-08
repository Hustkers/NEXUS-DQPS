'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useChannel, AdChannel } from '@/context/channel-context';
import { PlatformLogo } from '@/components/icons/platform-logos';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

// Subtle, professional brand definitions (not neon badges)
const CHANNEL_PRESETS: Record<string, {
  name: string;
  code: string;
  accent: string;
}> = {
  tiktok: {
    name: 'TikTok Ads',
    code: 'TT',
    accent: '#FE2C55'
  },
  amazon: {
    name: 'Amazon Sponsored',
    code: 'AMZ',
    accent: '#FF9900'
  },
  meta: {
    name: 'Meta Advantage+',
    code: 'META',
    accent: '#0668E1'
  },
  google: {
    name: 'Google Shopping',
    code: 'GGL',
    accent: '#4285F4'
  },
  shopify: {
    name: 'Shopify Storefront',
    code: 'SHOP',
    accent: '#96BF48'
  }
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
        headers: { 'Cache-Control': 'no-cache' }
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
          blendedRoas: 0
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
      [sku]: !prev[sku]
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
      [sku]: platform
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
        body: JSON.stringify({ campaignName, targetRoas })
      });
      if (res.ok) {
        await fetchMatrixData(false);
        setEditingCampaign(null);
        toast.success('Target ROAS updated successfully');
      } else {
        toast.error('Failed to update target ROAS');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Connection error while saving');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'SKU',
      'Product Name',
      'Category',
      'Channel',
      'Unit Price',
      'Gross Margin (%)',
      'Inventory',
      'Daily Spend',
      'Daily Revenue',
      'Current ROAS',
      'Target ROAS',
      'Status'
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
    toast.success('Matrix exported to CSV', {
      description: `Exported ${rows.length} product-channel rows.`
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
    averageHealth: 0
  };

  const isConnected = data?.source === 'postgresql_live';

  return (
    <div className='flex flex-1 flex-col w-full min-w-0 max-w-full min-h-screen bg-[#090A0C] text-[#E4E4E7] font-sans p-4 sm:p-6 lg:p-8 space-y-6'>
      {/* 1. CLEAN PRODUCT HEADER & SUBTLE STATUS */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F2023] pb-5'>
        <div>
          <h1 className='text-xl sm:text-2xl font-semibold tracking-tight text-white'>
            SKU &amp; Channel Matrix
          </h1>
          <p className='text-xs text-[#8E8F94] mt-1'>
            Inventory, spend and channel performance across your catalog.
          </p>
        </div>

        {/* Subtle Database Connection / Sync Indicator */}
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2 text-xs text-[#8E8F94]'>
            <span
              className={cn(
                'size-2 rounded-full',
                isConnected ? 'bg-emerald-400' : 'bg-amber-400'
              )}
            />
            <span className='font-medium text-[#C4C4C8]'>
              {isConnected ? 'PostgreSQL' : 'Cached Store'}
            </span>
            <span className='text-[#4B4C52]'>•</span>
            <span>{data?.totalSkus ?? productGroups.length} SKUs</span>
            <span className='text-[#4B4C52]'>•</span>
            <span className='tabular-nums'>
              {data?.timestamp
                ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Synced'}
            </span>
          </div>

          <button
            type='button'
            onClick={() => fetchMatrixData(true)}
            disabled={isRefreshing}
            className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#27282D] bg-[#141518] hover:bg-[#1D1E22] hover:text-white text-xs text-[#C4C4C8] font-medium transition-colors disabled:opacity-50'
            title='Sync latest data (R)'
          >
            <svg
              className={cn('size-3.5', isRefreshing && 'animate-spin')}
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <polyline points='23 4 23 10 17 10' />
              <polyline points='1 20 1 14 7 14' />
              <path d='M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15' />
            </svg>
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* 2. REFINED PERFORMANCE STRIP (Quiet, Horizontal, ROAS Emphasized) */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 bg-[#111215] border border-[#1F2023] rounded-xl p-4 sm:p-5'>
        <div className='space-y-1 pr-4 border-r border-[#1F2023]/60'>
          <div className='text-[11px] font-medium uppercase tracking-wider text-[#7A7B82]'>
            Daily Spend
          </div>
          <div className='text-2xl font-semibold tracking-tight text-white font-mono tabular-nums'>
            ${summary.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className='text-[11px] text-[#6E6F76]'>
            Across {data?.totalCampaigns ?? rawCampaigns.length} active channels
          </div>
        </div>

        <div className='space-y-1 px-0 sm:px-4 lg:border-r border-[#1F2023]/60'>
          <div className='text-[11px] font-medium uppercase tracking-wider text-[#7A7B82]'>
            Attributed Revenue
          </div>
          <div className='text-2xl font-semibold tracking-tight text-white font-mono tabular-nums'>
            ${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className='text-[11px] text-[#6E6F76]'>
            Trailing 24h reconciled
          </div>
        </div>

        <div className='space-y-1 pr-4 lg:px-4 border-r border-[#1F2023]/60'>
          <div className='text-[11px] font-medium uppercase tracking-wider text-[#7A7B82]'>
            Blended ROAS
          </div>
          <div className='text-2xl font-bold tracking-tight text-emerald-400 font-mono tabular-nums flex items-baseline gap-1.5'>
            <span>{summary.blendedRoas.toFixed(2)}x</span>
            <span className='text-[11px] font-normal text-[#6E6F76] font-sans'>target 3.20x</span>
          </div>
          <div className='text-[11px] text-[#6E6F76]'>
            Catalog-wide return ratio
          </div>
        </div>

        <div className='space-y-1 pl-0 sm:pl-4'>
          <div className='text-[11px] font-medium uppercase tracking-wider text-[#7A7B82]'>
            Stockouts
          </div>
          <div className={cn(
            'text-2xl font-semibold tracking-tight font-mono tabular-nums',
            summary.stockoutCount > 0 ? 'text-amber-400' : 'text-[#8E8F94]'
          )}>
            {summary.stockoutCount}
            <span className='text-xs font-normal text-[#6E6F76] font-sans ml-1'>SKUs affected</span>
          </div>
          <div className='text-[11px] text-[#6E6F76]'>
            {summary.stockoutCount > 0 ? 'Ad pausing recommended' : 'Inventory healthy'}
          </div>
        </div>
      </div>

      {/* 3. COMPACT PROFESSIONAL FILTER TOOLBAR */}
      <div className='flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3'>
        {/* Search */}
        <div className='relative flex-1 max-w-sm'>
          <span className='absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6F76]'>
            <svg className='size-3.5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <circle cx='11' cy='11' r='8' />
              <line x1='21' y1='21' x2='16.65' y2='16.65' />
            </svg>
          </span>
          <input
            ref={searchInputRef}
            type='text'
            placeholder='Search product or SKU...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-[#27282D] bg-[#111215] text-white placeholder-[#6E6F76] focus:outline-hidden focus:border-[#4B4C52] transition-colors'
          />
          <kbd className='absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-mono rounded border border-[#27282D] bg-[#18191D] text-[#8E8F94]'>
            /
          </kbd>
        </div>

        {/* Filter Channels & Actions */}
        <div className='flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0'>
          {/* Channel Filters */}
          <div className='inline-flex items-center p-1 rounded-lg border border-[#1F2023] bg-[#111215] gap-1'>
            <button
              type='button'
              onClick={() => setPlatformFilter('all')}
              className={cn(
                'px-2.5 py-1 text-xs rounded-md font-medium transition-colors whitespace-nowrap',
                platformFilter === 'all'
                  ? 'bg-[#27282D] text-white shadow-xs'
                  : 'text-[#8E8F94] hover:text-[#C4C4C8]'
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
                  type='button'
                  onClick={() => setPlatformFilter(plat)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md font-medium transition-colors whitespace-nowrap',
                    isActive
                      ? 'bg-[#27282D] text-white shadow-xs'
                      : 'text-[#8E8F94] hover:text-[#C4C4C8]'
                  )}
                >
                  <PlatformLogo platform={plat} size={12} className='shrink-0' />
                  <span>{cfg.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          <div className='h-5 w-px bg-[#1F2023] mx-1 shrink-0' />

          {/* Expand All */}
          <button
            type='button'
            onClick={toggleExpandAll}
            className='inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#27282D] bg-[#111215] hover:bg-[#18191D] hover:text-white text-xs font-medium text-[#C4C4C8] transition-colors whitespace-nowrap'
            title='Toggle expand all rows (E)'
          >
            <span>
              {productGroups.length > 0 && productGroups.every((p) => expandedSkus[p.sku])
                ? 'Collapse All'
                : 'Expand All'}
            </span>
          </button>

          {/* Export CSV */}
          <button
            type='button'
            onClick={handleExportCsv}
            className='inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#27282D] bg-[#111215] hover:bg-[#18191D] hover:text-white text-xs font-medium text-[#C4C4C8] transition-colors whitespace-nowrap'
            title='Export to CSV'
          >
            <svg className='size-3.5 text-[#8E8F94]' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
              <polyline points='7 10 12 15 17 10' />
              <line x1='12' y1='15' x2='12' y2='3' />
            </svg>
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN PERFORMANCE TABLE */}
      <div
        className='w-full border border-[#1F2023] bg-[#111215] rounded-xl overflow-hidden'
        ref={dropdownRef}
      >
        {isLoading ? (
          <div className='p-16 text-center space-y-3 text-xs text-[#8E8F94]'>
            <svg className='size-5 animate-spin mx-auto text-white' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <circle cx='12' cy='12' r='10' strokeOpacity='0.2' />
              <path d='M12 2a10 10 0 0 1 10 10' />
            </svg>
            <p>Loading catalog performance telemetry...</p>
          </div>
        ) : error ? (
          <div className='p-8 text-center space-y-3 text-xs text-rose-300 bg-rose-950/20 border border-rose-900/40 rounded-lg m-4'>
            <p>Database Connection Error: {error}</p>
            <button
              onClick={() => fetchMatrixData(true)}
              className='px-3 py-1.5 bg-white text-black font-medium rounded-md text-xs'
            >
              Retry Connection
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className='p-16 text-center text-xs text-[#8E8F94]'>
            No products match &quot;{searchQuery}&quot;
          </div>
        ) : (
          <div className='overflow-x-auto w-full'>
            <table className='w-full min-w-[960px] text-left text-xs'>
              <thead>
                <tr className='border-b border-[#1F2023] text-[11px] font-medium text-[#7A7B82] uppercase tracking-wider bg-[#0E0F12]'>
                  <th className='py-3.5 px-4 font-medium'>Product</th>
                  <th className='py-3.5 px-3 font-medium'>Channel</th>
                  <th className='py-3.5 px-3 text-right font-medium'>Price</th>
                  <th className='py-3.5 px-3 text-right font-medium'>Margin</th>
                  <th className='py-3.5 px-3 text-right font-medium'>Inventory</th>
                  <th className='py-3.5 px-3 text-right font-medium'>Spend</th>
                  <th className='py-3.5 px-3 text-right font-medium'>ROAS</th>
                  <th className='py-3.5 px-3 text-center font-medium'>Target</th>
                  <th className='py-3.5 px-3 text-center font-medium'>Health</th>
                  <th className='py-3.5 px-4 text-center font-medium'>Status</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-[#18191C]'>
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
                          'transition-colors group',
                          isStockout
                            ? 'bg-amber-950/5 hover:bg-amber-950/10'
                            : 'hover:bg-[#141518]',
                          isExpanded && 'bg-[#141518]'
                        )}
                      >
                        {/* PRODUCT: Dominant Name, Subtle SKU */}
                        <td className='py-3 px-4'>
                          <div className='flex items-center gap-3'>
                            <button
                              type='button'
                              onClick={() => toggleExpand(p.sku)}
                              aria-label={`Toggle details for ${p.productName}`}
                              className='size-6 rounded-md border border-[#27282D] flex items-center justify-center text-[#8E8F94] hover:text-white hover:bg-[#1F2023] transition-colors shrink-0'
                            >
                              <svg
                                className={cn('size-3.5 transition-transform duration-150', isExpanded && 'rotate-180')}
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              >
                                <polyline points='6 9 12 15 18 9' />
                              </svg>
                            </button>

                            {p.photoUrl ? (
                              <div className='relative size-9 rounded-lg border border-[#27282D] bg-[#18191D] overflow-hidden shrink-0'>
                                <Image
                                  src={p.photoUrl}
                                  alt={p.productName}
                                  fill
                                  sizes='36px'
                                  className='object-cover'
                                />
                              </div>
                            ) : (
                              <div className='size-9 rounded-lg border border-[#27282D] bg-[#18191D] flex items-center justify-center text-[10px] font-mono text-[#6E6F76] shrink-0'>
                                SKU
                              </div>
                            )}

                            <div className='min-w-0'>
                              <div className='font-medium text-white text-[13px] leading-snug truncate group-hover:text-emerald-300 transition-colors'>
                                {p.productName}
                              </div>
                              <div className='flex items-center gap-1.5 mt-0.5 text-[11px] text-[#7A7B82]'>
                                <span className='font-mono'>{p.sku}</span>
                                <span>•</span>
                                <span>{p.category}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* CHANNEL: Compact Identity & Dropdown */}
                        <td className='py-3 px-3 relative'>
                          <div className='inline-block'>
                            <button
                              type='button'
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownSku(isDropdownOpen ? null : p.sku);
                              }}
                              className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#27282D] bg-[#16171B] hover:bg-[#1E1F24] text-xs font-medium text-[#C4C4C8] hover:text-white transition-colors cursor-pointer'
                            >
                              <PlatformLogo platform={activePlatform} size={13} className='shrink-0' />
                              <span>{currentCfg.name.split(' ')[0]}</span>
                              <svg
                                className={cn('size-3 text-[#6E6F76] transition-transform', isDropdownOpen && 'rotate-180')}
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='2'
                              >
                                <polyline points='6 9 12 15 18 9' />
                              </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                              <div
                                className='absolute left-0 top-full mt-1.5 z-50 w-60 rounded-xl border border-[#27282D] bg-[#141518] p-1.5 shadow-2xl space-y-0.5'
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className='px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[#6E6F76] border-b border-[#1F2023] mb-1'>
                                  Available Channels ({p.availablePlatforms.length})
                                </div>

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
                                        'w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors',
                                        isSelected
                                          ? 'bg-[#1E1F24] text-white font-medium'
                                          : 'text-[#8E8F94] hover:text-white hover:bg-[#18191D]'
                                      )}
                                    >
                                      <div className='flex items-center gap-2'>
                                        <PlatformLogo platform={plat} size={14} className='shrink-0' />
                                        <div>
                                          <div className='text-xs text-white font-medium'>
                                            {cfg.name}
                                          </div>
                                          {cData && (
                                            <div className='text-[10px] text-[#6E6F76] font-mono'>
                                              ${cData.currentDailySpend.toFixed(0)}/d • {cData.roas.toFixed(2)}x
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {isSelected && (
                                        <span className='size-1.5 rounded-full bg-emerald-400 shrink-0' />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* PRICE: Clean Financial Numeral */}
                        <td className='py-3 px-3 text-right font-mono tabular-nums text-white'>
                          ${p.price.toFixed(2)}
                        </td>

                        {/* MARGIN: Aligned Percentage */}
                        <td className='py-3 px-3 text-right font-mono tabular-nums text-emerald-400 font-medium'>
                          {activeCampaign ? activeCampaign.marginPct.toFixed(1) : '50.0'}%
                        </td>

                        {/* INVENTORY: Clear Stockout Distinction */}
                        <td className='py-3 px-3 text-right font-mono tabular-nums'>
                          {isStockout ? (
                            <span className='inline-flex items-center gap-1 text-amber-400 font-medium font-sans text-xs'>
                              <span>0</span>
                              <span className='text-[10px] text-amber-500/80 uppercase font-semibold'>out</span>
                            </span>
                          ) : (
                            <span className='text-white'>
                              {p.inventory.toLocaleString()} <span className='text-[11px] text-[#6E6F76] font-sans'>units</span>
                            </span>
                          )}
                        </td>

                        {/* DAILY SPEND */}
                        <td className='py-3 px-3 text-right font-mono tabular-nums text-white'>
                          ${activeCampaign ? activeCampaign.currentDailySpend.toFixed(0) : '0'}
                        </td>

                        {/* ROAS: Visually Emphasized */}
                        <td className='py-3 px-3 text-right font-mono tabular-nums text-[13px] font-semibold'>
                          {activeCampaign ? (
                            <span
                              className={cn(
                                activeCampaign.roas < 1.8
                                  ? 'text-rose-400'
                                  : activeCampaign.roas < 3.2
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              )}
                            >
                              {activeCampaign.roas.toFixed(2)}x
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>

                        {/* TARGET ROAS (Inline Edit) */}
                        <td className='py-3 px-3 text-center font-mono tabular-nums'>
                          {editingCampaign?.name === activeCampaign?.campaign ? (
                            <div className='inline-flex items-center gap-1'>
                              <input
                                type='number'
                                step='0.1'
                                value={editingCampaign.roas}
                                onChange={(e) =>
                                  setEditingCampaign({
                                    ...editingCampaign,
                                    roas: parseFloat(e.target.value) || 0
                                  })
                                }
                                className='w-14 px-1 py-0.5 text-xs font-mono rounded border border-[#3E4048] bg-black text-center text-white'
                              />
                              <button
                                onClick={() =>
                                  handleSaveTargetRoas(activeCampaign.campaign, editingCampaign.roas)
                                }
                                disabled={isSavingEdit}
                                className='px-1.5 py-0.5 rounded bg-white text-black font-medium text-[10px]'
                              >
                                {isSavingEdit ? '...' : 'Save'}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                setEditingCampaign({
                                  name: activeCampaign.campaign,
                                  roas: activeCampaign.targetRoas
                                })
                              }
                              className='text-[#8E8F94] hover:text-white underline decoration-dotted decoration-[#3E4048] transition-colors'
                              title='Click to edit target ROAS'
                            >
                              {activeCampaign?.targetRoas.toFixed(2)}x
                            </button>
                          )}
                        </td>

                        {/* HEALTH: Compact Visual Meter */}
                        <td className='py-3 px-3 text-center'>
                          {activeCampaign ? (
                            <div className='inline-flex items-center gap-2'>
                              <div className='w-12 h-1.5 bg-[#1F2023] rounded-full overflow-hidden'>
                                <div
                                  className={cn(
                                    'h-full rounded-full',
                                    activeCampaign.healthScore >= 80
                                      ? 'bg-emerald-400'
                                      : activeCampaign.healthScore >= 60
                                      ? 'bg-amber-400'
                                      : 'bg-rose-400'
                                  )}
                                  style={{ width: `${Math.min(100, activeCampaign.healthScore)}%` }}
                                />
                              </div>
                              <span className='font-mono tabular-nums text-xs text-[#8E8F94]'>
                                {activeCampaign.healthScore}
                              </span>
                            </div>
                          ) : (
                            <span className='text-[#6E6F76]'>—</span>
                          )}
                        </td>

                        {/* STATUS: Subtle & Clean */}
                        <td className='py-3 px-4 text-center'>
                          {isStockout ? (
                            <span className='inline-block text-[11px] font-semibold text-amber-400 uppercase tracking-wider'>
                              Stockout
                            </span>
                          ) : activeCampaign?.roasStatus === 'ABOVE_TARGET' ? (
                            <span className='inline-block text-[11px] font-medium text-emerald-400 capitalize'>
                              Above target
                            </span>
                          ) : activeCampaign?.roasStatus === 'BELOW_BREAKEVEN' ? (
                            <span className='inline-block text-[11px] font-medium text-rose-400 capitalize'>
                              Below breakeven
                            </span>
                          ) : (
                            <span className='inline-block text-[11px] font-medium text-[#8E8F94] capitalize'>
                              Optimal
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* 6. EXPANDED DETAIL BREAKDOWN ROW */}
                      {isExpanded && (
                        <tr className='bg-[#0E0F12] border-b border-[#1F2023]'>
                          <td colSpan={10} className='p-0'>
                            <div className='p-6 pl-14 space-y-4'>
                              {/* Summary Strip */}
                              <div className='flex flex-wrap items-center justify-between gap-4 border-b border-[#1F2023] pb-3'>
                                <div>
                                  <div className='text-xs font-semibold text-white'>
                                    Performance Breakdown: {p.productName}
                                  </div>
                                  <div className='text-[11px] text-[#7A7B82] mt-0.5'>
                                    {p.sku} • {p.availablePlatforms.length} connected channel{p.availablePlatforms.length > 1 ? 's' : ''}
                                  </div>
                                </div>

                                <div className='flex items-center gap-4 text-xs font-mono tabular-nums'>
                                  <div>
                                    <span className='text-[#6E6F76]'>Combined Daily Spend:</span>{' '}
                                    <span className='text-white font-medium'>${p.totalSpend.toFixed(2)}</span>
                                  </div>
                                  <div>
                                    <span className='text-[#6E6F76]'>Blended ROAS:</span>{' '}
                                    <span className='text-emerald-400 font-bold'>{p.blendedRoas.toFixed(2)}x</span>
                                  </div>
                                </div>
                              </div>

                              {/* Multi-Channel Comparison Grid */}
                              <div className='border border-[#1F2023] rounded-lg overflow-hidden bg-[#111215]'>
                                <table className='w-full text-left text-xs'>
                                  <thead>
                                    <tr className='border-b border-[#1F2023] text-[10px] font-medium text-[#7A7B82] uppercase tracking-wider bg-[#0C0D0F]'>
                                      <th className='py-2.5 px-3 font-medium'>Channel</th>
                                      <th className='py-2.5 px-3 font-medium'>Campaign</th>
                                      <th className='py-2.5 px-3 text-right font-medium'>Daily Spend</th>
                                      <th className='py-2.5 px-3 text-right font-medium'>Share</th>
                                      <th className='py-2.5 px-3 text-right font-medium'>ROAS</th>
                                      <th className='py-2.5 px-3 text-right font-medium'>Margin</th>
                                      <th className='py-2.5 px-3 text-center font-medium'>Health</th>
                                      <th className='py-2.5 px-3 text-center font-medium'>Status</th>
                                      <th className='py-2.5 px-3 text-right font-medium'>View</th>
                                    </tr>
                                  </thead>
                                  <tbody className='divide-y divide-[#18191C]'>
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
                                            isCurrentActive ? 'bg-[#18191E]' : 'hover:bg-[#15161A]'
                                          )}
                                        >
                                          <td className='py-2 px-3 font-medium'>
                                            <div className='flex items-center gap-2'>
                                              <PlatformLogo platform={plat} size={13} className='shrink-0' />
                                              <span className='text-white'>{cfg.name}</span>
                                            </div>
                                          </td>

                                          <td className='py-2 px-3 text-[11px] text-[#7A7B82] truncate max-w-xs'>
                                            {c.campaign}
                                          </td>

                                          <td className='py-2 px-3 text-right font-mono tabular-nums text-white'>
                                            ${c.currentDailySpend.toFixed(0)}
                                          </td>

                                          <td className='py-2 px-3 text-right font-mono tabular-nums text-[#7A7B82] text-[11px]'>
                                            {spendShare.toFixed(1)}%
                                          </td>

                                          <td className='py-2 px-3 text-right font-mono tabular-nums font-semibold'>
                                            <span
                                              className={cn(
                                                c.roas < 1.8
                                                  ? 'text-rose-400'
                                                  : c.roas < 3.2
                                                  ? 'text-amber-400'
                                                  : 'text-emerald-400'
                                              )}
                                            >
                                              {c.roas.toFixed(2)}x
                                            </span>
                                          </td>

                                          <td className='py-2 px-3 text-right font-mono tabular-nums text-emerald-400'>
                                            {c.marginPct.toFixed(1)}%
                                          </td>

                                          <td className='py-2 px-3 text-center font-mono tabular-nums text-[#8E8F94]'>
                                            {c.healthScore}
                                          </td>

                                          <td className='py-2 px-3 text-center'>
                                            {isStockout ? (
                                              <span className='text-[10px] text-amber-400 font-medium'>Stockout</span>
                                            ) : (
                                              <span className='text-[10px] text-[#8E8F94] capitalize'>
                                                {c.roasStatus.replace('_', ' ').toLowerCase()}
                                              </span>
                                            )}
                                          </td>

                                          <td className='py-2 px-3 text-right'>
                                            {isCurrentActive ? (
                                              <span className='text-[11px] text-emerald-400 font-medium'>
                                                Active
                                              </span>
                                            ) : (
                                              <button
                                                type='button'
                                                onClick={() => handleSelectPlatform(p.sku, plat)}
                                                className='px-2 py-0.5 text-[11px] rounded border border-[#27282D] hover:bg-[#1E1F24] text-[#C4C4C8] hover:text-white transition-colors'
                                              >
                                                Select
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

      {/* 5. MINIMAL BOTTOM META */}
      <div className='flex flex-col sm:flex-row items-center justify-between text-xs text-[#6E6F76] pt-2 gap-2 border-t border-[#1F2023]'>
        <div>
          Showing {filteredProducts.length} of {productGroups.length} products
        </div>
        <div className='flex items-center gap-3'>
          <span>Shortcuts:</span>
          <span><kbd className='px-1 py-0.5 rounded border border-[#27282D] bg-[#141518] text-[#8E8F94]'>/</kbd> Search</span>
          <span><kbd className='px-1 py-0.5 rounded border border-[#27282D] bg-[#141518] text-[#8E8F94]'>R</kbd> Sync</span>
          <span><kbd className='px-1 py-0.5 rounded border border-[#27282D] bg-[#141518] text-[#8E8F94]'>E</kbd> Expand</span>
        </div>
      </div>
    </div>
  );
}
