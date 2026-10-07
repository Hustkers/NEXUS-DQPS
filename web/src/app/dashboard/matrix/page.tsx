'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import initialEngineState from '@/data/nexus-engine-state.json';
import { cn } from '@/lib/utils';

// Channel definitions with badges, colors, and branding
const PLATFORM_CONFIG: Record<string, {
  name: string;
  shortName: string;
  pillColor: string;
  dotColor: string;
  iconBg: string;
  borderColor: string;
}> = {
  tiktok: {
    name: 'TikTok Marketplace',
    shortName: 'TikTok',
    pillColor: 'border-rose-200 dark:border-pink-500/30 text-rose-700 dark:text-pink-400 bg-rose-50 dark:bg-pink-950/20',
    dotColor: 'bg-pink-500',
    iconBg: 'bg-pink-500/10 text-pink-500',
    borderColor: 'border-pink-500/30',
  },
  amazon: {
    name: 'Amazon Marketplace',
    shortName: 'Amazon',
    pillColor: 'border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20',
    dotColor: 'bg-amber-500',
    iconBg: 'bg-amber-500/10 text-amber-500',
    borderColor: 'border-amber-500/30',
  },
  meta: {
    name: 'Meta Ads (FB/IG)',
    shortName: 'Meta',
    pillColor: 'border-sky-200 dark:border-blue-500/30 text-sky-700 dark:text-blue-400 bg-sky-50 dark:bg-blue-950/20',
    dotColor: 'bg-blue-500',
    iconBg: 'bg-blue-500/10 text-blue-500',
    borderColor: 'border-blue-500/30',
  },
  google: {
    name: 'Google Shopping',
    shortName: 'Google',
    pillColor: 'border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20',
    dotColor: 'bg-emerald-500',
    iconBg: 'bg-emerald-500/10 text-emerald-500',
    borderColor: 'border-emerald-500/30',
  },
  shopify: {
    name: 'Shopify Storefront',
    shortName: 'Shopify',
    pillColor: 'border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/20',
    dotColor: 'bg-emerald-600',
    iconBg: 'bg-emerald-600/10 text-emerald-600',
    borderColor: 'border-emerald-500/30',
  },
};

interface CampaignData {
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

export default function MatrixPage() {
  const rawCampaigns: CampaignData[] = (initialEngineState.campaigns as CampaignData[]) || [];

  // Group campaigns by SKU/Product
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

    // Compute blended ROAS and sort platforms in consistent order: tiktok, amazon, meta, google, shopify
    const priority = ['tiktok', 'amazon', 'meta', 'google', 'shopify'];
    return Object.values(map).map((p) => {
      p.availablePlatforms.sort((a, b) => priority.indexOf(a) - priority.indexOf(b));
      p.blendedRoas = p.totalSpend > 0 ? p.totalRevenue / p.totalSpend : 0;
      return p;
    });
  }, [rawCampaigns]);

  // Selected marketplace per SKU (default: 'tiktok' for 310805-137 as requested, or first available)
  const [selectedPlatforms, setSelectedPlatforms] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    productGroups.forEach((p) => {
      if (p.sku === '310805-137' && p.marketplaces['tiktok']) {
        initial[p.sku] = 'tiktok';
      } else {
        initial[p.sku] = p.availablePlatforms[0] || 'meta';
      }
    });
    return initial;
  });

  // Track expanded accordion dropdown rows
  const [expandedSkus, setExpandedSkus] = useState<Record<string, boolean>>({});

  // Active open dropdown menu
  const [openDropdownSku, setOpenDropdownSku] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  // Close dropdown on outside click
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownSku(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleExpand = (sku: string) => {
    setExpandedSkus((prev) => ({
      ...prev,
      [sku]: !prev[sku],
    }));
  };

  const handleSelectPlatform = (sku: string, platform: string) => {
    setSelectedPlatforms((prev) => ({
      ...prev,
      [sku]: platform,
    }));
    setOpenDropdownSku(null);
  };

  const toggleExpandAll = () => {
    const allExpanded = productGroups.every((p) => expandedSkus[p.sku]);
    const newState: Record<string, boolean> = {};
    productGroups.forEach((p) => {
      newState[p.sku] = !allExpanded;
    });
    setExpandedSkus(newState);
  };

  // Filtered products
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

  // Overall statistics
  const totalSpend = useMemo(() => rawCampaigns.reduce((acc, c) => acc + c.currentDailySpend, 0), [rawCampaigns]);
  const stockoutCount = useMemo(() => productGroups.filter((p) => p.inventory === 0).length, [productGroups]);

  const handleExportCsv = () => {
    const headers = [
      'SKU',
      'Shoe Name',
      'Category',
      'Marketplace',
      'Unit Price (INR)',
      'Gross Margin (%)',
      'ERP Stock',
      'Daily Spend (INR)',
      'Daily Revenue (INR)',
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

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/50 dark:bg-[#07090e] text-foreground min-h-screen'>
      {/* Top Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <div className='flex items-center gap-2'>
            <Icons.product className='size-5 text-emerald-600 dark:text-emerald-400' />
            <h1 className='text-xl font-mono font-bold text-foreground uppercase tracking-tight'>
              Nike SKU Economics &amp; Channel Allocation Matrix
            </h1>
          </div>
          <p className='text-xs font-mono text-muted-foreground mt-1'>
            Cross-platform Nike Footwear intelligence: Multi-Marketplace Dropdown • ERP Inventory • Gross Margin % • Marginal ROAS
          </p>
        </div>
        <div className='flex items-center gap-2 flex-wrap'>
          <Badge
            variant='outline'
            className='font-mono text-xs border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 py-1 px-2.5 shadow-xs'
          >
            <span className='size-1.5 rounded-full bg-emerald-500 mr-2 animate-ping' />
            POSTGRESQL 16 CONNECTED
          </Badge>
          <Badge
            variant='outline'
            className='font-mono text-xs border-border text-muted-foreground bg-muted/40 py-1 px-2.5'
          >
            {rawCampaigns.length} ACTIVE CAMPAIGNS ACROSS {productGroups.length} SKUS
          </Badge>
        </div>
      </div>

      {/* Global Filter Bar */}
      <div className='flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-card shadow-xs'>
        <div className='flex items-center gap-2.5 flex-1 max-w-md'>
          <div className='relative w-full'>
            <Icons.search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
            <input
              type='text'
              placeholder='Filter shoes by model name or SKU code...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-9 pr-3 py-1.5 text-xs font-mono rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-foreground'
            />
          </div>
        </div>

        {/* Marketplace Filter Pills */}
        <div className='flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0'>
          <button
            onClick={() => setPlatformFilter('all')}
            className={cn(
              'px-2.5 py-1 text-xs font-mono rounded-md border transition-colors',
              platformFilter === 'all'
                ? 'bg-foreground text-background border-foreground font-bold'
                : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted/60'
            )}
          >
            All Marketplaces
          </button>
          {(['tiktok', 'amazon', 'meta', 'google', 'shopify'] as const).map((plat) => {
            const cfg = PLATFORM_CONFIG[plat];
            const isActive = platformFilter === plat;
            return (
              <button
                key={plat}
                onClick={() => setPlatformFilter(plat)}
                className={cn(
                  'px-2.5 py-1 text-xs font-mono rounded-md border flex items-center gap-1.5 transition-colors',
                  isActive
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted/60'
                )}
              >
                <span className={cn('size-1.5 rounded-full', cfg.dotColor)} />
                {cfg.shortName}
              </button>
            );
          })}

          <button
            onClick={toggleExpandAll}
            className='ml-auto md:ml-2 px-3 py-1 text-xs font-mono rounded-md border border-border bg-muted/40 text-foreground hover:bg-muted flex items-center gap-1.5 shrink-0 transition-colors'
          >
            <Icons.chevronsUpDown className='size-3.5 text-muted-foreground' />
            <span>
              {productGroups.every((p) => expandedSkus[p.sku])
                ? 'Collapse All'
                : 'Expand All Marketplaces'}
            </span>
          </button>

          <button
            onClick={handleExportCsv}
            className='px-3 py-1 text-xs font-mono rounded-md border border-border bg-muted/40 text-foreground hover:bg-muted flex items-center gap-1.5 shrink-0 transition-colors'
            title='Export filtered SKU economics matrix to CSV'
          >
            <Icons.download className='size-3.5 text-muted-foreground' />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main SKU Economics Matrix Table */}
      <div className='rounded-xl border border-border bg-card p-5 shadow-xs overflow-x-auto' ref={dropdownRef}>
        <table className='w-full text-left text-xs font-mono'>
          <thead>
            <tr className='border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider bg-slate-50/50 dark:bg-zinc-900/40'>
              <th className='py-3 px-3'>Shoe / Model</th>
              <th className='py-3 px-3'>Campaign</th>
              <th className='py-3 px-3'>Marketplace (Select)</th>
              <th className='py-3 px-3'>Category</th>
              <th className='py-3 px-3 text-right'>Unit Price</th>
              <th className='py-3 px-3 text-right'>Gross Margin</th>
              <th className='py-3 px-3 text-right'>ERP Stock</th>
              <th className='py-3 px-3 text-right'>Daily Spend</th>
              <th className='py-3 px-3 text-right'>Current ROAS</th>
              <th className='py-3 px-3 text-center'>Health</th>
              <th className='py-3 px-3 text-center'>Status</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {filteredProducts.map((p) => {
              const activePlatform = selectedPlatforms[p.sku] || p.availablePlatforms[0] || 'meta';
              const activeCampaign = p.marketplaces[activePlatform] || Object.values(p.marketplaces)[0];
              const isStockout = p.inventory === 0;
              const isExpanded = !!expandedSkus[p.sku];
              const isDropdownOpen = openDropdownSku === p.sku;
              const currentCfg = PLATFORM_CONFIG[activePlatform] || PLATFORM_CONFIG['meta'];

              return (
                <React.Fragment key={p.sku}>
                  {/* Main Product Row */}
                  <tr
                    className={cn(
                      'hover:bg-muted/30 transition-colors',
                      isExpanded && 'bg-muted/20 border-b-transparent'
                    )}
                  >
                    {/* Shoe / Model with Quick Dropdown Toggle Button */}
                    <td className='py-3 px-3 font-medium text-foreground'>
                      <div className='flex items-center gap-2.5'>
                        {/* Dropdown Expand Chevron */}
                        <button
                          onClick={() => toggleExpand(p.sku)}
                          aria-label={`Toggle marketplace breakdown for ${p.productName}`}
                          className={cn(
                            'size-6 rounded flex items-center justify-center transition-colors shrink-0',
                            isExpanded
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          {isExpanded ? (
                            <Icons.chevronUp className='size-3.5' />
                          ) : (
                            <Icons.chevronDown className='size-3.5' />
                          )}
                        </button>

                        {p.photoUrl ? (
                          <div className='relative size-8 rounded border border-border bg-muted/20 overflow-hidden shrink-0'>
                            <Image
                              src={p.photoUrl}
                              alt={p.productName || p.sku}
                              fill
                              sizes='32px'
                              className='object-cover'
                            />
                          </div>
                        ) : (
                          <div className='size-8 rounded border border-border bg-muted/40 flex items-center justify-center text-[9px] text-muted-foreground font-bold shrink-0'>
                            NIKE
                          </div>
                        )}
                        <div>
                          <div className='font-bold text-foreground flex items-center gap-1.5'>
                            <span>{p.productName}</span>
                          </div>
                          <div className='flex items-center gap-1.5 mt-0.5'>
                            <span className='text-[10px] text-muted-foreground'>{p.sku}</span>
                            <button
                              onClick={() => toggleExpand(p.sku)}
                              className='text-[9px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors'
                            >
                              {p.availablePlatforms.length} Marketplaces ▾
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Campaign Identifier */}
                    <td className='py-3 px-3 font-mono text-muted-foreground'>
                      {activeCampaign ? activeCampaign.campaign : `camp-${p.sku}`}
                    </td>

                    {/* Interactive Marketplace Dropdown Component */}
                    <td className='py-3 px-3 relative'>
                      <div className='inline-block'>
                        <button
                          type='button'
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownSku(isDropdownOpen ? null : p.sku);
                          }}
                          className={cn(
                            'group px-3 py-1.5 rounded-lg text-[11px] font-semibold border flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-[0.97]',
                            currentCfg.pillColor,
                            'hover:ring-1 hover:ring-current'
                          )}
                        >
                          <span className={cn('size-1.5 rounded-full shrink-0', currentCfg.dotColor)} />
                          <span>{currentCfg.name}</span>
                          <Icons.chevronDown
                            className={cn(
                              'size-3 opacity-60 transition-transform duration-150',
                              isDropdownOpen && 'rotate-180'
                            )}
                          />
                        </button>

                        {/* Floating Dropdown Menu Panel with Apple Glass Material & Origin Spring */}
                        {isDropdownOpen && (
                          <div
                            className='absolute left-3 top-full mt-2 z-50 w-64 rounded-2xl border border-border/80 bg-popover/95 dark:bg-zinc-900/95 backdrop-blur-xl text-popover-foreground p-2 shadow-2xl origin-top-left animate-in fade-in-0 zoom-in-95'
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className='px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 mb-1.5'>
                              Select Marketplace: {p.productName}
                            </div>

                            <div className='flex flex-col gap-1'>
                              {p.availablePlatforms.map((plat) => {
                                const cData = p.marketplaces[plat];
                                const cfg = PLATFORM_CONFIG[plat] || PLATFORM_CONFIG['meta'];
                                const isSelected = plat === activePlatform;

                                return (
                                  <button
                                    key={plat}
                                    type='button'
                                    onClick={() => handleSelectPlatform(p.sku, plat)}
                                    className={cn(
                                      'w-full text-left px-2.5 py-2 rounded-xl text-xs font-mono flex items-center justify-between transition-all active:scale-[0.98]',
                                      isSelected
                                        ? 'bg-muted font-bold text-foreground shadow-2xs'
                                        : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                                    )}
                                  >
                                    <div className='flex items-center gap-2'>
                                      <span className={cn('size-2 rounded-full shrink-0', cfg.dotColor)} />
                                      <div>
                                        <div className='text-[11px] font-bold text-foreground leading-tight'>
                                          {cfg.name}
                                        </div>
                                        {cData && (
                                          <div className='text-[10px] text-muted-foreground leading-tight'>
                                            ₹{cData.currentDailySpend.toFixed(0)}/d • {cData.roas.toFixed(2)}x ROAS
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {isSelected && (
                                      <Icons.check className='size-3.5 text-emerald-500 shrink-0 ml-2' />
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            <div className='mt-1 pt-1 border-t border-border'>
                              <button
                                type='button'
                                onClick={() => {
                                  toggleExpand(p.sku);
                                  setOpenDropdownSku(null);
                                }}
                                className='w-full text-left px-2 py-1.5 rounded-md text-[10px] font-mono text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 flex items-center justify-between'
                              >
                                <span>{isExpanded ? '▴ Hide Breakdown' : '▾ Dropdown Full Breakdown'}</span>
                                <Icons.chevronsUpDown className='size-3' />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className='py-3 px-3 text-muted-foreground text-[11px]'>{p.category}</td>

                    {/* Unit Price */}
                    <td className='py-3 px-3 text-right text-foreground font-bold tabular-nums'>
                      ₹{p.price.toFixed(2)}
                    </td>

                    {/* Gross Margin % */}
                    <td className='py-3 px-3 text-right text-emerald-600 dark:text-emerald-400 font-bold tabular-nums'>
                      {activeCampaign ? activeCampaign.marginPct.toFixed(1) : '50.0'}%
                    </td>

                    {/* ERP Stock */}
                    <td className='py-3 px-3 text-right font-bold tabular-nums'>
                      {isStockout ? (
                        <span className='text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-500/40 px-2 py-0.5 rounded'>
                          0 (OUT)
                        </span>
                      ) : (
                        <span className='text-foreground'>{p.inventory.toLocaleString()} units</span>
                      )}
                    </td>

                    {/* Daily Spend */}
                    <td className='py-3 px-3 text-right text-foreground tabular-nums'>
                      ₹{activeCampaign ? activeCampaign.currentDailySpend.toFixed(0) : '0'}
                    </td>

                    {/* Current ROAS */}
                    <td className='py-3 px-3 text-right font-bold tabular-nums'>
                      {activeCampaign ? (
                        <span
                          className={cn(
                            activeCampaign.roas < 1.8
                              ? 'text-rose-600 dark:text-rose-400'
                              : activeCampaign.roas < 3.2
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          )}
                        >
                          {activeCampaign.roas.toFixed(2)}x
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Health Score */}
                    <td className='py-3 px-3 text-center'>
                      <Badge
                        variant='outline'
                        className='text-[10px] py-0 px-1.5 border-border text-foreground font-mono bg-muted/30'
                      >
                        {activeCampaign ? activeCampaign.healthScore : 75}/100
                      </Badge>
                    </td>

                    {/* Status Badge */}
                    <td className='py-3 px-3 text-center'>
                      <Badge
                        variant='outline'
                        className={cn(
                          'text-[10px] font-mono py-0 px-1.5',
                          isStockout
                            ? 'border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30'
                            : activeCampaign?.roasStatus === 'ABOVE_TARGET'
                            ? 'border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                            : 'border-border text-muted-foreground'
                        )}
                      >
                        {isStockout ? 'CRITICAL_STOCKOUT' : activeCampaign?.roasStatus || 'OPTIMAL'}
                      </Badge>
                    </td>
                  </tr>

                  {/* Drop-Down Expanded Sub-Table: Shows stats across Amazon, Meta, TikTok, and Google side-by-side */}
                  {isExpanded && (
                    <tr className='bg-muted/10 border-b border-border'>
                      <td colSpan={11} className='p-0'>
                        <div className='p-4 pl-12 bg-slate-100/60 dark:bg-zinc-950/60 border-l-2 border-emerald-500 space-y-3 animate-in fade-in duration-200'>
                          {/* Sub-Header */}
                          <div className='flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-border/60'>
                            <div className='flex items-center gap-2'>
                              <span className='size-2 rounded-full bg-emerald-500 animate-pulse' />
                              <span className='font-mono font-bold text-xs uppercase tracking-wider text-foreground'>
                                Marketplace Breakdown: {p.productName} ({p.sku})
                              </span>
                              <span className='text-[11px] text-muted-foreground'>
                                Available on {p.availablePlatforms.length} Marketplaces
                              </span>
                            </div>
                            <div className='flex items-center gap-3 text-[11px] font-mono text-muted-foreground'>
                              <span>
                                Combined Daily Spend:{' '}
                                <strong className='text-foreground'>₹{p.totalSpend.toFixed(0)}</strong>
                              </span>
                              <span>•</span>
                              <span>
                                Blended ROAS:{' '}
                                <strong className='text-emerald-600 dark:text-emerald-400'>
                                  {p.blendedRoas.toFixed(2)}x
                                </strong>
                              </span>
                            </div>
                          </div>

                          {/* Sub-Table of All Marketplaces for this Shoe */}
                          <div className='rounded-lg border border-border bg-card overflow-hidden'>
                            <table className='w-full text-left text-xs font-mono'>
                              <thead>
                                <tr className='border-b border-border text-[10px] text-muted-foreground uppercase tracking-wider bg-muted/40'>
                                  <th className='py-2 px-3'>Marketplace</th>
                                  <th className='py-2 px-3'>Campaign Name</th>
                                  <th className='py-2 px-3 text-right'>Daily Spend</th>
                                  <th className='py-2 px-3 text-right'>Spend Share</th>
                                  <th className='py-2 px-3 text-right'>Current ROAS</th>
                                  <th className='py-2 px-3 text-right'>Gross Margin</th>
                                  <th className='py-2 px-3 text-right'>ERP Stock</th>
                                  <th className='py-2 px-3 text-center'>Health</th>
                                  <th className='py-2 px-3 text-center'>Status</th>
                                  <th className='py-2 px-3 text-right'>Row Selection</th>
                                </tr>
                              </thead>
                              <tbody className='divide-y divide-border/60'>
                                {p.availablePlatforms.map((plat) => {
                                  const c = p.marketplaces[plat];
                                  const cfg = PLATFORM_CONFIG[plat] || PLATFORM_CONFIG['meta'];
                                  const isCurrentActive = plat === activePlatform;
                                  const spendShare = p.totalSpend > 0 ? (c.currentDailySpend / p.totalSpend) * 100 : 0;

                                  return (
                                    <tr
                                      key={plat}
                                      className={cn(
                                        'transition-colors',
                                        isCurrentActive ? 'bg-emerald-500/5 dark:bg-emerald-950/20' : 'hover:bg-muted/40'
                                      )}
                                    >
                                      {/* Marketplace Badge */}
                                      <td className='py-2.5 px-3 font-semibold'>
                                        <div className='flex items-center gap-2'>
                                          <span className={cn('size-2 rounded-full', cfg.dotColor)} />
                                          <span className={cn('px-2 py-0.5 rounded text-[10px] border font-bold', cfg.pillColor)}>
                                            {cfg.name}
                                          </span>
                                        </div>
                                      </td>

                                      {/* Campaign ID */}
                                      <td className='py-2.5 px-3 font-mono text-muted-foreground text-[11px]'>
                                        {c.campaign}
                                      </td>

                                      {/* Daily Spend */}
                                      <td className='py-2.5 px-3 text-right font-bold tabular-nums text-foreground'>
                                        ₹{c.currentDailySpend.toFixed(0)}
                                      </td>

                                      {/* Spend Share */}
                                      <td className='py-2.5 px-3 text-right tabular-nums text-muted-foreground text-[11px]'>
                                        {spendShare.toFixed(1)}%
                                      </td>

                                      {/* Current ROAS */}
                                      <td className='py-2.5 px-3 text-right font-bold tabular-nums'>
                                        <span
                                          className={cn(
                                            c.roas < 1.8
                                              ? 'text-rose-600 dark:text-rose-400'
                                              : c.roas < 3.2
                                              ? 'text-amber-600 dark:text-amber-400'
                                              : 'text-emerald-600 dark:text-emerald-400'
                                          )}
                                        >
                                          {c.roas.toFixed(2)}x
                                        </span>
                                      </td>

                                      {/* Gross Margin % */}
                                      <td className='py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-bold tabular-nums'>
                                        {c.marginPct.toFixed(1)}%
                                      </td>

                                      {/* ERP Stock */}
                                      <td className='py-2.5 px-3 text-right font-bold tabular-nums'>
                                        {isStockout ? (
                                          <span className='text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-500/40 px-1.5 py-0.5 rounded text-[10px]'>
                                            0 (OUT)
                                          </span>
                                        ) : (
                                          <span className='text-foreground'>{c.inventory.toLocaleString()} units</span>
                                        )}
                                      </td>

                                      {/* Health */}
                                      <td className='py-2.5 px-3 text-center'>
                                        <Badge
                                          variant='outline'
                                          className='text-[9px] py-0 px-1.5 border-border text-foreground font-mono bg-muted/40'
                                        >
                                          {c.healthScore}/100
                                        </Badge>
                                      </td>

                                      {/* Status */}
                                      <td className='py-2.5 px-3 text-center'>
                                        <Badge
                                          variant='outline'
                                          className={cn(
                                            'text-[9px] font-mono py-0 px-1.5',
                                            isStockout
                                              ? 'border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30'
                                              : c.roasStatus === 'ABOVE_TARGET'
                                              ? 'border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                                              : 'border-border text-muted-foreground'
                                          )}
                                        >
                                          {isStockout ? 'CRITICAL_STOCKOUT' : c.roasStatus}
                                        </Badge>
                                      </td>

                                      {/* Quick Select Button */}
                                      <td className='py-2.5 px-3 text-right'>
                                        {isCurrentActive ? (
                                          <span className='text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-end gap-1'>
                                            <Icons.check className='size-3' /> Active View
                                          </span>
                                        ) : (
                                          <button
                                            type='button'
                                            onClick={() => handleSelectPlatform(p.sku, plat)}
                                            className='px-2 py-0.5 text-[10px] font-mono rounded border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors'
                                          >
                                            View in Row
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
    </div>
  );
}
