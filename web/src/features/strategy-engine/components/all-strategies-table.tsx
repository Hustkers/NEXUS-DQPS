'use client';

import React, { useState, useMemo } from 'react';
import { CampaignStrategy } from '@/lib/strategy-engine/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  IconSearch,
  IconFilter,
  IconArrowsUpDown,
  IconLayersLinked,
  IconCheck,
  IconX,
  IconEye,
  IconColumns,
  IconScale
} from '@tabler/icons-react';

interface AllStrategiesTableProps {
  strategies: CampaignStrategy[];
  onSelectStrategy: (strategy: CampaignStrategy) => void;
  selectedCompareIds: string[];
  onToggleCompare: (strategyId: string) => void;
  onOpenCompareModal: () => void;
}

type SortField =
  | 'rank'
  | 'expectedRoas'
  | 'expectedRevenue'
  | 'expectedCpa'
  | 'expectedCtr'
  | 'overallScore'
  | 'riskScore';

export function AllStrategiesTable({
  strategies,
  onSelectStrategy,
  selectedCompareIds,
  onToggleCompare,
  onOpenCompareModal
}: AllStrategiesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const filteredStrategies = useMemo(() => {
    let list = [...strategies];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (s) =>
          s.strategyName.toLowerCase().includes(q) ||
          s.strategyId.toLowerCase().includes(q) ||
          s.platform.toLowerCase().includes(q) ||
          s.audienceSegment.toLowerCase().includes(q) ||
          s.adFormat.toLowerCase().includes(q)
      );
    }

    if (platformFilter !== 'all') {
      list = list.filter((s) => s.platform.toLowerCase() === platformFilter);
    }

    if (statusFilter !== 'all') {
      list = list.filter((s) => s.evaluation?.status === statusFilter);
    }

    list.sort((a, b) => {
      const evA = a.evaluation;
      const evB = b.evaluation;
      let valA = 0;
      let valB = 0;

      switch (sortField) {
        case 'rank':
          valA = evA?.rank ?? 99;
          valB = evB?.rank ?? 99;
          break;
        case 'expectedRoas':
          valA = evA?.expectedRoas ?? 0;
          valB = evB?.expectedRoas ?? 0;
          break;
        case 'expectedRevenue':
          valA = evA?.expectedRevenue ?? 0;
          valB = evB?.expectedRevenue ?? 0;
          break;
        case 'expectedCpa':
          valA = evA?.expectedCpa ?? 0;
          valB = evB?.expectedCpa ?? 0;
          break;
        case 'expectedCtr':
          valA = evA?.expectedCtr ?? 0;
          valB = evB?.expectedCtr ?? 0;
          break;
        case 'overallScore':
          valA = evA?.overallScore ?? 0;
          valB = evB?.overallScore ?? 0;
          break;
        case 'riskScore':
          valA = evA?.riskScore ?? 0;
          valB = evB?.riskScore ?? 0;
          break;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return list;
  }, [strategies, searchTerm, platformFilter, statusFilter, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      // For metrics like ROAS or revenue, default descending
      setSortAsc(field === 'rank' || field === 'expectedCpa' || field === 'riskScore');
    }
  };

  const getPlatformBadge = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'google':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'meta':
        return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      case 'amazon':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'tiktok':
        return 'text-pink-400 border-pink-500/30 bg-pink-500/10';
      default:
        return 'text-zinc-400 border-zinc-500/30 bg-zinc-500/10';
    }
  };

  return (
    <div className='rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-4 relative'>
      {/* Table Header & Controls */}
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4'>
        <div className='flex items-center gap-2.5'>
          <div className='p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'>
            <IconLayersLinked className='size-5' />
          </div>
          <div>
            <h2 className='text-base font-mono font-bold text-foreground'>
              All Candidate Strategies ({strategies.length} Strategies)
            </h2>
            <p className='text-xs font-mono text-muted-foreground'>
              Complete simulation results. Click any strategy row to view full parameter decomposition.
            </p>
          </div>
        </div>

        {/* Filter Tools */}
        <div className='flex items-center gap-2.5 flex-wrap'>
          <div className='relative w-48 sm:w-60'>
            <IconSearch className='absolute left-2.5 top-2.5 size-3.5 text-muted-foreground' />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='Search strategy, audience...'
              className='pl-8 font-mono text-xs h-8 bg-muted/20'
            />
          </div>

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className='h-8 rounded-lg border border-border bg-card px-2.5 text-xs font-mono text-foreground'
          >
            <option value='all'>All Platforms</option>
            <option value='meta'>Meta Ads</option>
            <option value='google'>Google Ads</option>
            <option value='amazon'>Amazon Ads</option>
            <option value='tiktok'>TikTok Shop</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='h-8 rounded-lg border border-border bg-card px-2.5 text-xs font-mono text-foreground'
          >
            <option value='all'>All Status</option>
            <option value='SELECTED'>SELECTED Only</option>
            <option value='NOT SELECTED'>NOT SELECTED Only</option>
          </select>
        </div>
      </div>

      {/* Floating Comparison Action Bar */}
      {selectedCompareIds.length > 0 && (
        <div className='flex items-center justify-between bg-cyan-950/40 border border-cyan-500/40 rounded-xl px-4 py-2.5 shadow-lg text-xs font-mono text-cyan-300 animate-in fade-in'>
          <div className='flex items-center gap-2'>
            <IconScale className='size-4 text-cyan-400' />
            <span>
              <strong>{selectedCompareIds.length}</strong> strategies selected for multi-parameter comparison
            </span>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              onClick={onOpenCompareModal}
              className='bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs h-7 px-3'
            >
              Compare Selected ({selectedCompareIds.length})
            </Button>
          </div>
        </div>
      )}

      {/* Responsive Data Table */}
      <div className='overflow-x-auto rounded-xl border border-border/80'>
        <table className='w-full text-left border-collapse text-xs font-mono'>
          <thead>
            <tr className='bg-muted/40 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider font-semibold'>
              <th className='py-3 px-3 w-10 text-center'>Cmp</th>
              <th
                className='py-3 px-3 cursor-pointer hover:text-foreground'
                onClick={() => handleSort('rank')}
              >
                <div className='flex items-center gap-1'>
                  Rank <IconArrowsUpDown className='size-3 text-muted-foreground/60' />
                </div>
              </th>
              <th className='py-3 px-3 min-w-[200px]'>Strategy Name &amp; ID</th>
              <th className='py-3 px-3'>Platform</th>
              <th className='py-3 px-3 min-w-[140px]'>Audience Segment</th>
              <th
                className='py-3 px-3 cursor-pointer hover:text-foreground text-right'
                onClick={() => handleSort('expectedCtr')}
              >
                CTR
              </th>
              <th className='py-3 px-3 text-right'>CPC</th>
              <th className='py-3 px-3 text-right'>CVR</th>
              <th className='py-3 px-3 text-right'>Orders</th>
              <th
                className='py-3 px-3 cursor-pointer hover:text-foreground text-right'
                onClick={() => handleSort('expectedRevenue')}
              >
                Revenue
              </th>
              <th
                className='py-3 px-3 cursor-pointer hover:text-foreground text-right'
                onClick={() => handleSort('expectedRoas')}
              >
                ROAS
              </th>
              <th
                className='py-3 px-3 cursor-pointer hover:text-foreground text-right'
                onClick={() => handleSort('expectedCpa')}
              >
                CPA
              </th>
              <th
                className='py-3 px-3 cursor-pointer hover:text-foreground text-center'
                onClick={() => handleSort('riskScore')}
              >
                Risk
              </th>
              <th className='py-3 px-3 text-center'>Class</th>
              <th className='py-3 px-3 text-center'>Conf.</th>
              <th className='py-3 px-3 text-center'>Status</th>
              <th className='py-3 px-3 text-center w-12'>Action</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border/60 bg-card'>
            {filteredStrategies.length === 0 ? (
              <tr>
                <td colSpan={16} className='py-8 text-center text-muted-foreground font-mono'>
                  No strategies match the selected filters.
                </td>
              </tr>
            ) : (
              filteredStrategies.map((strat) => {
                const ev = strat.evaluation;
                const isSelected = ev?.status === 'SELECTED';
                const isCompared = selectedCompareIds.includes(strat.strategyId);

                return (
                  <tr
                    key={strat.strategyId}
                    className={`transition-colors hover:bg-muted/30 cursor-pointer ${
                      isSelected ? 'bg-cyan-500/5' : ''
                    } ${isCompared ? 'bg-cyan-950/20' : ''}`}
                    onClick={() => onSelectStrategy(strat)}
                  >
                    {/* Checkbox for Compare */}
                    <td
                      className='py-2.5 px-3 text-center'
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCompare(strat.strategyId);
                      }}
                    >
                      <input
                        type='checkbox'
                        checked={isCompared}
                        onChange={() => {}}
                        className='size-3.5 rounded border-border accent-cyan-500 cursor-pointer'
                      />
                    </td>

                    {/* Rank */}
                    <td className='py-2.5 px-3 font-bold'>
                      <span
                        className={`inline-flex items-center justify-center size-6 rounded-md font-mono text-[11px] ${
                          ev?.rank === 1
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : ev?.rank === 2
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                            : ev?.rank === 3
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {ev?.rank ?? '-'}
                      </span>
                    </td>

                    {/* Strategy Name & ID */}
                    <td className='py-2.5 px-3 min-w-[200px]'>
                      <div className='flex items-center gap-1.5'>
                        <span className='font-bold text-foreground text-xs hover:text-cyan-400 transition-colors'>
                          {strat.strategyName.split(' — ')[0]}
                        </span>
                      </div>
                      <div className='flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5'>
                        <span>{strat.strategyId}</span>
                        <span>•</span>
                        <span>{strat.adFormat}</span>
                      </div>
                    </td>

                    {/* Platform */}
                    <td className='py-2.5 px-3'>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getPlatformBadge(
                          strat.platform
                        )}`}
                      >
                        {strat.platform}
                      </span>
                    </td>

                    {/* Audience */}
                    <td className='py-2.5 px-3 text-[11px] text-muted-foreground max-w-[180px] truncate'>
                      {strat.audienceSegment}
                    </td>

                    {/* Expected CTR */}
                    <td className='py-2.5 px-3 text-right font-medium text-foreground'>
                      {((ev?.expectedCtr ?? 0) * 100).toFixed(2)}%
                    </td>

                    {/* Expected CPC */}
                    <td className='py-2.5 px-3 text-right text-muted-foreground'>
                      ${ev?.expectedCpc.toFixed(2)}
                    </td>

                    {/* Expected CVR */}
                    <td className='py-2.5 px-3 text-right text-foreground font-medium'>
                      {((ev?.expectedConversionRate ?? 0) * 100).toFixed(1)}%
                    </td>

                    {/* Conversions */}
                    <td className='py-2.5 px-3 text-right font-bold text-foreground'>
                      {ev?.expectedConversions}
                    </td>

                    {/* Expected Revenue */}
                    <td className='py-2.5 px-3 text-right font-bold text-foreground'>
                      ${ev?.expectedRevenue.toLocaleString()}
                    </td>

                    {/* Expected ROAS */}
                    <td className='py-2.5 px-3 text-right font-bold text-emerald-400'>
                      {ev?.expectedRoas.toFixed(2)}x
                    </td>

                    {/* CPA */}
                    <td className='py-2.5 px-3 text-right text-foreground'>
                      ${ev?.expectedCpa.toLocaleString()}
                    </td>

                    {/* Risk */}
                    <td className='py-2.5 px-3 text-center'>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          (ev?.riskScore ?? 50) < 30
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : (ev?.riskScore ?? 50) < 55
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-rose-400 bg-rose-500/10'
                        }`}
                      >
                        {ev?.riskScore}/100
                      </span>
                    </td>

                    {/* Classification */}
                    <td className='py-2.5 px-3 text-center'>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                          ev?.classification === 'PROVEN'
                            ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/15'
                            : ev?.classification === 'PROMISING'
                            ? 'text-blue-400 border-blue-500/40 bg-blue-500/15'
                            : 'text-purple-400 border-purple-500/40 bg-purple-500/15'
                        }`}
                      >
                        {ev?.classification || 'EXP'}
                      </span>
                    </td>

                    {/* Confidence */}
                    <td className='py-2.5 px-3 text-center text-muted-foreground text-[11px]'>
                      {Math.round((ev?.confidenceScore ?? 0) * 100)}%
                    </td>

                    {/* Status */}
                    <td className='py-2.5 px-3 text-center'>
                      {isSelected ? (
                        <span className='inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border border-zinc-700 bg-zinc-800 text-zinc-200'>
                          <IconCheck className='size-3 text-zinc-300' />
                          SELECTED
                        </span>
                      ) : (
                        <span className='inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-md border border-zinc-800 bg-zinc-900/40 text-zinc-400'>
                          NOT SELECTED
                        </span>
                      )}
                    </td>

                    {/* Inspect Icon */}
                    <td className='py-2.5 px-3 text-center'>
                      <button
                        type='button'
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStrategy(strat);
                        }}
                        className='p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground'
                        title='Inspect strategy details'
                      >
                        <IconEye className='size-3.5' />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
