'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  IconSearch,
  IconX,
  IconCheck,
  IconAlertTriangle,
  IconWorld,
  IconSparkles,
  IconBoxSeam,
  IconBuildingStore
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlatformLogo } from '@/components/icons/platform-logos';
import { cn } from '@/lib/utils';
import initialEngineState from '@/data/nexus-engine-state.json';

export type EngineCampaign = (typeof initialEngineState.campaigns)[number];

export interface CampaignSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCampaign: EngineCampaign;
  onSelectCampaign: (campaign: EngineCampaign) => void;
  campaigns?: EngineCampaign[];
}

export function CampaignSelectorModal({
  isOpen,
  onClose,
  selectedCampaign,
  onSelectCampaign,
  campaigns = initialEngineState.campaigns,
}: CampaignSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [platformTab, setPlatformTab] = useState<'all' | 'meta' | 'google' | 'amazon' | 'shopify'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'healthy' | 'stockout' | 'surplus'>('all');
  const [skuFilter, setSkuFilter] = useState<'all' | '310805-137' | '942851-002' | '315122-001'>('all');

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      // Platform filter
      if (platformTab !== 'all' && c.platform.toLowerCase() !== platformTab) {
        return false;
      }

      // SKU specific filter
      if (skuFilter !== 'all' && c.sku !== skuFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === 'stockout') {
        if ((c.inventory ?? 0) > 0 && c.roasStatus !== 'CRITICAL_STOCKOUT') return false;
      } else if (statusFilter === 'surplus') {
        if ((c.inventory ?? 0) < 500) return false;
      } else if (statusFilter === 'healthy') {
        if ((c.inventory ?? 0) <= 0 || c.roasStatus === 'CRITICAL_STOCKOUT') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesSku = c.sku.toLowerCase().includes(query);
        const matchesName = (c.productName || '').toLowerCase().includes(query);
        const matchesCampaign = c.campaign.toLowerCase().includes(query);
        const matchesCategory = (c.category || '').toLowerCase().includes(query);
        if (!matchesSku && !matchesName && !matchesCampaign && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [campaigns, platformTab, statusFilter, skuFilter, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in-0 duration-200 select-none'>
      <div className='relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl overflow-hidden'>
        {/* Header Bar */}
        <div className='flex items-center justify-between border-b border-zinc-800/80 px-5 py-4 bg-zinc-900/40 shrink-0'>
          <div className='flex items-center gap-3'>
            <div className='size-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300'>
              <IconWorld className='size-5' />
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <h3 className='font-mono text-base font-bold text-zinc-100 uppercase tracking-tight'>
                  Omnichannel Campaign &amp; Catalog Selector
                </h3>
                <Badge variant='outline' className='font-mono text-[10px] border-zinc-700 bg-zinc-900 text-zinc-300'>
                  DATASET.md Ground Truth
                </Badge>
              </div>
              <p className='text-xs font-mono text-zinc-400 mt-0.5'>
                Select from 40 active campaigns across Meta Ads, Google Ads, Amazon DSP &amp; Shopify D2C
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className='size-8 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-colors'
          >
            <IconX className='size-4' />
          </button>
        </div>

        {/* Filter Controls Strip */}
        <div className='p-4 border-b border-zinc-800/80 bg-zinc-950 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0'>
          {/* Search Box */}
          <div className='relative flex-1 max-w-md'>
            <IconSearch className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500' />
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search by SKU (e.g. 315122-001), shoe name, or platform...'
              className='w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600'
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className='absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300'
              >
                <IconX className='size-3.5' />
              </button>
            )}
          </div>

          {/* Platform Tabs */}
          <div className='flex items-center gap-1 p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono overflow-x-auto'>
            {(
              [
                { id: 'all', label: 'All (40)' },
                { id: 'meta', label: 'Meta (10)' },
                { id: 'google', label: 'Google (10)' },
                { id: 'amazon', label: 'Amazon (10)' },
                { id: 'shopify', label: 'Shopify (10)' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPlatformTab(tab.id)}
                className={cn(
                  'px-2.5 py-1 rounded font-medium whitespace-nowrap transition-colors flex items-center gap-1.5',
                  platformTab === tab.id
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                )}
              >
                {tab.id !== 'all' && <PlatformLogo platform={tab.id} size={13} />}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Status & SKU Quick-Filter Strip */}
        <div className='px-4 py-2 border-b border-zinc-900 bg-zinc-950/60 flex flex-col md:flex-row md:items-center justify-between gap-2 text-[11px] font-mono shrink-0'>
          <div className='flex items-center gap-1.5 flex-wrap'>
            <span className='text-zinc-500 uppercase tracking-wider text-[10px] mr-1'>Filter Catalog:</span>
            <button
              onClick={() => { setStatusFilter('all'); setSkuFilter('all'); }}
              className={cn(
                'px-2 py-0.5 rounded border transition-colors',
                statusFilter === 'all' && skuFilter === 'all'
                  ? 'bg-zinc-800 text-zinc-200 border-zinc-700 font-semibold'
                  : 'bg-zinc-900/50 text-zinc-500 border-zinc-800/80 hover:text-zinc-300'
              )}
            >
              All (40)
            </button>
            <button
              onClick={() => { setStatusFilter('stockout'); setSkuFilter('all'); }}
              className={cn(
                'px-2 py-0.5 rounded border transition-colors flex items-center gap-1',
                statusFilter === 'stockout' && skuFilter === 'all'
                  ? 'bg-rose-950/60 text-rose-300 border-rose-800 font-semibold'
                  : 'bg-zinc-900/50 text-zinc-500 border-zinc-800/80 hover:text-zinc-300'
              )}
            >
              <IconAlertTriangle className='size-3 text-rose-400' />
              All Stockouts (0 Units)
            </button>
            <button
              onClick={() => { setSkuFilter('310805-137'); setStatusFilter('all'); }}
              className={cn(
                'px-2 py-0.5 rounded border transition-colors flex items-center gap-1',
                skuFilter === '310805-137'
                  ? 'bg-rose-950/70 text-rose-200 border-rose-700 font-semibold'
                  : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              )}
            >
              <span className='size-1.5 rounded-full bg-rose-500 animate-pulse' />
              Stockout: AJ10 (310805-137)
            </button>
            <button
              onClick={() => { setSkuFilter('942851-002'); setStatusFilter('all'); }}
              className={cn(
                'px-2 py-0.5 rounded border transition-colors flex items-center gap-1',
                skuFilter === '942851-002'
                  ? 'bg-rose-950/70 text-rose-200 border-rose-700 font-semibold'
                  : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              )}
            >
              <span className='size-1.5 rounded-full bg-rose-500 animate-pulse' />
              Stockout: Pegasus 35 (942851-002)
            </button>
            <button
              onClick={() => { setSkuFilter('315122-001'); setStatusFilter('all'); }}
              className={cn(
                'px-2 py-0.5 rounded border transition-colors flex items-center gap-1',
                skuFilter === '315122-001'
                  ? 'bg-sky-950/70 text-sky-200 border-sky-700 font-semibold'
                  : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              )}
            >
              <span className='size-1.5 rounded-full bg-sky-400' />
              Surplus: AF1 (315122-001 • 520u)
            </button>
            <button
              onClick={() => { setStatusFilter('healthy'); setSkuFilter('all'); }}
              className={cn(
                'px-2 py-0.5 rounded border transition-colors flex items-center gap-1',
                statusFilter === 'healthy' && skuFilter === 'all'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800 font-semibold'
                  : 'bg-zinc-900/50 text-zinc-500 border-zinc-800/80 hover:text-zinc-300'
              )}
            >
              <span className='size-1.5 rounded-full bg-emerald-400' />
              Healthy Inventory
            </button>
          </div>

          <span className='text-zinc-500 hidden sm:inline whitespace-nowrap text-[10px]'>
            Anchor: $1 = ₹84 • {filteredCampaigns.length} Active Campaigns
          </span>
        </div>

        {/* Campaign Cards Grid */}
        <div className='flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono'>
          {filteredCampaigns.length === 0 ? (
            <div className='col-span-full py-16 flex flex-col items-center justify-center text-center text-zinc-500'>
              <IconBoxSeam className='size-10 mb-2 stroke-1' />
              <p className='text-sm font-semibold text-zinc-300'>No campaigns match the filter</p>
              <p className='text-xs mt-1'>Try adjusting the platform tab or search keyword.</p>
            </div>
          ) : (
            filteredCampaigns.map((camp) => {
              const isSelected = camp.campaign === selectedCampaign.campaign;
              const isStockout = (camp.inventory ?? 0) <= 0 || camp.roasStatus === 'CRITICAL_STOCKOUT';
              const isSurplus = (camp.inventory ?? 0) >= 500;

              return (
                <button
                  type='button'
                  key={camp.campaign}
                  onClick={() => {
                    onSelectCampaign(camp);
                    onClose();
                  }}
                  className={cn(
                    'relative p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between group hover:border-zinc-500 w-full',
                    isSelected
                      ? 'bg-zinc-900 border-zinc-300 shadow-md ring-1 ring-zinc-300/40'
                      : 'bg-zinc-950/80 border-zinc-800 hover:bg-zinc-900/60'
                  )}
                >
                  <div className='w-full'>
                    {/* Top line: Platform badge + SKU + Selection icon */}
                    <div className='flex items-center justify-between text-xs mb-2 w-full'>
                      <div className='flex items-center gap-1.5'>
                        <PlatformLogo platform={camp.platform} size={15} />
                        <span className='font-bold uppercase tracking-wider text-[11px] text-zinc-200'>
                          {camp.platform}
                        </span>
                        <span className='text-zinc-500'>•</span>
                        <span className='text-zinc-400 text-[10px]'>{camp.sku}</span>
                      </div>

                      {isSelected ? (
                        <div className='size-5 rounded-full bg-zinc-100 text-zinc-950 flex items-center justify-center shadow-sm'>
                          <IconCheck className='size-3 stroke-[3]' />
                        </div>
                      ) : (
                        <span className='text-[10px] text-zinc-600 group-hover:text-zinc-400'>
                          Select
                        </span>
                      )}
                    </div>

                    {/* Middle: Shoe Image + Product Title */}
                    <div className='flex items-start gap-2.5 my-1.5 w-full'>
                      {camp.photoUrl ? (
                        <div className='relative size-12 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 shrink-0'>
                          <Image
                            src={camp.photoUrl}
                            alt={camp.productName || camp.sku}
                            fill
                            sizes='48px'
                            className='object-cover'
                          />
                        </div>
                      ) : (
                        <div className='size-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-zinc-600'>
                          <IconBuildingStore className='size-5' />
                        </div>
                      )}

                      <div className='min-w-0 flex-1 text-left'>
                        <h4 className='text-xs font-bold text-zinc-100 truncate group-hover:text-white'>
                          {camp.productName || camp.sku}
                        </h4>
                        <div className='flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400'>
                          <span className='font-bold text-zinc-200'>${((camp.price ?? 0) > 1000 ? (camp.price ?? 0) / 83 : (camp.price ?? 0)).toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                          <span className='text-zinc-500 text-[10px]'>(₹{Math.round((camp.price ?? 0) > 1000 ? (camp.price ?? 0) : (camp.price ?? 0) * 84).toLocaleString('en-IN')})</span>
                          <span>•</span>
                          <span className='text-zinc-500'>{camp.category || 'Footwear'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metrics and Stockout Warning Footer */}
                  <div className='pt-2 mt-2 border-t border-zinc-900 text-[10px] flex flex-col gap-1.5 w-full'>
                    <div className='flex items-center justify-between w-full'>
                      <span className='text-zinc-500'>Daily Spend:</span>
                      <div className='text-right'>
                        <span className='font-bold text-zinc-200'>
                          ${((camp.currentDailySpend ?? 0) > 1000 ? (camp.currentDailySpend ?? 0) / 83 : (camp.currentDailySpend ?? 0)).toLocaleString('en-US', { maximumFractionDigits: 2 })}/d
                        </span>
                        <span className='text-zinc-500 text-[9px] ml-1'>
                          (₹{Math.round((camp.currentDailySpend ?? 0) > 1000 ? (camp.currentDailySpend ?? 0) : (camp.currentDailySpend ?? 0) * 84).toLocaleString('en-IN')}/d)
                        </span>
                      </div>
                    </div>

                    <div className='flex items-center justify-between w-full'>
                      <span className='text-zinc-500'>Realized ROAS:</span>
                      <span className={cn('font-bold', camp.roas >= 3.2 ? 'text-emerald-400' : camp.roas < 1.8 ? 'text-rose-400' : 'text-amber-400')}>
                        {camp.roas?.toFixed(2)}x
                      </span>
                    </div>

                    {/* Inventory Badge */}
                    <div className='flex items-center justify-between pt-1 border-t border-zinc-900/60 w-full'>
                      <span className='text-zinc-500'>Warehouse Stock:</span>
                      {isStockout ? (
                        <span className='px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-800 text-rose-300 font-bold flex items-center gap-1 text-[9px]'>
                          <span className='size-1 rounded-full bg-rose-400 animate-pulse' />
                          0 Units (STOCKOUT)
                        </span>
                      ) : isSurplus ? (
                        <span className='px-1.5 py-0.5 rounded bg-sky-950/80 border border-sky-800 text-sky-300 font-bold text-[9px]'>
                          {camp.inventory} Units (Surplus)
                        </span>
                      ) : (
                        <span className='px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium text-[9px]'>
                          {camp.inventory} Units (Healthy)
                        </span>
                      )}
                    </div>

                    {/* Stockout Bleed & Shadow Price Protection Notice */}
                    {isStockout && (
                      <div className='flex items-center justify-between text-[9px] text-rose-300 bg-rose-950/50 px-2 py-1 rounded border border-rose-900/60 mt-0.5'>
                        <span className='flex items-center gap-1 font-mono'>
                          <span className='size-1 rounded-full bg-rose-500 animate-ping' />
                          &lambda;_inv = 999.0
                        </span>
                        <span className='font-bold'>Bleed Prevented: $840/d (₹70,560/d)</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Bar */}
        <div className='flex items-center justify-between border-t border-zinc-800/80 px-5 py-3 bg-zinc-900/40 text-xs font-mono shrink-0'>
          <div className='flex items-center gap-2 text-zinc-400'>
            <IconSparkles className='size-4 text-zinc-300' />
            <span>Select any campaign to simulate live Thompson Bandit RL reallocation</span>
          </div>

          <Button
            size='sm'
            variant='outline'
            onClick={onClose}
            className='bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-mono text-xs font-semibold'
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
