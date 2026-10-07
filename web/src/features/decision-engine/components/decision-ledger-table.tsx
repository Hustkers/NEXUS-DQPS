import React, { useState } from 'react';
import { Icons } from '@/components/icons';
import { PlatformLogo } from '@/components/icons/platform-logos';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { GaugesLedgerItem } from '@/lib/gauges-engine';

export interface LedgerItem {
  id: string;
  timestamp: string;
  decision?: string;
  product?: string;
  channel?: string;
  issue?: string;
  actionTaken?: string;
  outcome?: string;
  expectedMargin?: number;
  realizedMargin?: number;
  variancePct?: number;
  accuracyPct?: number;
  confidence?: number;
  status?: string;
  feedback?: string;
  isAuto?: boolean;
}

interface DecisionLedgerTableProps {
  entries: (LedgerItem | GaugesLedgerItem)[];
  className?: string;
  showHeader?: boolean;
}
/**
 * Parses decision text into structured visual components
 * e.g. "Shift ₹1,850/day from meta-315122-001 (Nike Air Force 1 stockout) -> google-CD4371-001 (React Infinity Flyknit)"
 */
function parseDecisionString(raw: string) {
  let action: 'SHIFT' | 'SCALE' | 'THROTTLE' | 'ACTION' = 'ACTION';
  const upper = raw.toUpperCase();
  if (upper.startsWith('SHIFT')) action = 'SHIFT';
  else if (upper.startsWith('SCALE')) action = 'SCALE';
  else if (upper.startsWith('THROTTLE')) action = 'THROTTLE';

  // Amount pattern (e.g. ₹1,850/day, +₹920/day, -₹650/day)
  const amountMatch = raw.match(/([+\-]?₹[0-9,]+(?:\/day)?)/);
  const amount = amountMatch ? amountMatch[1] : '';

  // Shift case: "from <src> (notes) -> <target> (notes)"
  if (action === 'SHIFT') {
    const shiftMatch = raw.match(/from\s+([^\(]+)(?:\(([^)]+)\))?\s*(?:->|→)\s*([^\(]+)(?:\(([^)]+)\))?/i);
    if (shiftMatch) {
      const srcId = shiftMatch[1]?.trim().toUpperCase() || 'SOURCE';
      const srcNote = shiftMatch[2]?.trim() || '';
      const destId = shiftMatch[3]?.trim().toUpperCase() || 'DESTINATION';
      const destNote = shiftMatch[4]?.trim() || '';

      const srcPlatform = srcId.includes('META') ? 'META' : srcId.includes('AMAZON') ? 'AMAZON' : srcId.includes('TIKTOK') ? 'TIKTOK' : srcId.includes('GOOGLE') ? 'GOOGLE' : srcId;
      const destPlatform = destId.includes('GOOGLE') ? 'GOOGLE PMAX' : destId.includes('META') ? 'META' : destId.includes('AMAZON') ? 'AMAZON' : destId;

      return {
        action,
        amount,
        isShift: true,
        source: { platform: srcPlatform, detail: srcNote || srcId },
        target: { platform: destPlatform, detail: destNote || destId },
        raw
      };
    }
  }

  // Scale or Throttle case:
  // e.g. "Scale tiktok-AH8050-100 (Nike Air Max 270) budget +₹920/day on viral footwear trend"
  // e.g. "Throttle amazon-849559-004 (Air Max 2017) spend -₹650/day due to competitor footwear discount"
  const singleMatch = raw.match(/(?:Scale|Throttle)\s+([^\(]+)(?:\(([^)]+)\))?\s*(?:budget|spend)?\s*([+\-]?₹[0-9,]+(?:\/day)?)?\s*(?:on|due to|for)?\s*(.*)?/i);
  if (singleMatch) {
    const targetId = singleMatch[1]?.trim().toUpperCase() || '';
    const targetProduct = singleMatch[2]?.trim() || '';
    const note = singleMatch[4]?.trim() || '';
    const platform = targetId.includes('TIKTOK') ? 'TIKTOK' : targetId.includes('AMAZON') ? 'AMAZON' : targetId.includes('META') ? 'META' : targetId.includes('GOOGLE') ? 'GOOGLE' : targetId;

    return {
      action,
      amount: amount || (singleMatch[3] ? singleMatch[3].trim() : ''),
      isShift: false,
      target: {
        platform,
        product: targetProduct,
        note
      },
      raw
    };
  }

  return {
    action,
    amount,
    isShift: false,
    raw
  };
}

export function DecisionLedgerTable({ entries, className, showHeader = false }: DecisionLedgerTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = entries.filter((item: any) => {
    const text = (item.decision || item.actionTaken || item.product || '') + ' ' + (item.timestamp || '');
    return text.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Allocation Action', 'Expected Margin (INR)', 'Realized Margin (INR)', 'Accuracy (%)', 'Confidence (%)'];
    const rows = filtered.map((e: any) => [
      e.id,
      e.timestamp,
      `"${(e.decision || e.actionTaken || 'Budget reallocated').replace(/"/g, '""')}"`,
      e.expectedMargin ?? 0,
      e.realizedMargin ?? 0,
      (e.accuracyPct ?? 94).toFixed(1),
      ((e.confidence ?? 0.95) * 100).toFixed(0)
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus-decision-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Decision Ledger exported to CSV', {
      description: `Downloaded ${filtered.length} audited decisions.`
    });
  };

  // Deterministic summary KPI calculations from existing ledger entries
  const metrics = React.useMemo(() => {
    if (!entries || entries.length === 0) {
      return { totalDecisions: 0, avgAccuracy: 0, totalRealizedMargin: 0, totalExpectedMargin: 0 };
    }
    const totalDecisions = entries.length;
    const avgAccuracy = entries.reduce((acc, curr: any) => acc + (curr.accuracyPct ?? 94), 0) / totalDecisions;
    const totalRealizedMargin = entries.reduce((acc, curr: any) => acc + (curr.realizedMargin ?? 0), 0);
    const totalExpectedMargin = entries.reduce((acc, curr: any) => acc + (curr.expectedMargin ?? 0), 0);

    return {
      totalDecisions,
      avgAccuracy,
      totalRealizedMargin,
      totalExpectedMargin
    };
  }, [entries]);

  return (
    <div className={cn('space-y-4 font-mono', className)}>
      {/* Optional In-Component Header (used when rendered inside Mission Control) */}
      {showHeader && (
        <div className='flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-3'>
          <div className='flex items-center gap-2'>
            <Icons.check className='size-3.5 text-emerald-500' />
            <h3 className='font-mono text-xs font-bold text-foreground uppercase tracking-wider'>
              DECISION LEDGER
            </h3>
            <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'>
              <span className='size-1.5 rounded-full bg-emerald-500 animate-pulse' />
              ✓ AUDITED
            </span>
          </div>
          <span className='text-xs font-mono text-muted-foreground'>
            {entries.length} AUDITED DECISIONS
          </span>
        </div>
      )}

      {/* Filter and Export Toolbar */}
      <div className='flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card'>
        <div className='flex items-center gap-2 flex-1 max-w-sm'>
          <Icons.search className='size-3.5 text-muted-foreground shrink-0' />
          <input
            type='text'
            placeholder='Search directives (e.g. Meta, Shift, Zoom)...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full text-xs font-mono bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-hidden'
          />
        </div>
        <div className='flex items-center gap-3'>
          <Button
            size='sm'
            variant='outline'
            onClick={handleExportCSV}
            className='h-7 px-2.5 text-xs font-mono font-semibold text-foreground border-border bg-background hover:bg-muted active:scale-[0.98]'
          >
            <Icons.download className='size-3 mr-1.5' />
            Export CSV
          </Button>
          <span className='text-xs font-mono text-muted-foreground'>
            {filtered.length} / {entries.length} decisions
          </span>
        </div>
      </div>

      {/* Compact KPI Strip */}
      <div className='grid grid-cols-3 gap-2.5 sm:gap-3'>
        <div className='rounded-lg border border-border/80 bg-card/80 p-2.5 sm:p-3'>
          <div className='text-[10px] uppercase tracking-wider text-muted-foreground font-semibold'>
            Decisions
          </div>
          <div className='mt-1 text-base sm:text-lg font-bold text-foreground'>
            {metrics.totalDecisions}
          </div>
        </div>

        <div className='rounded-lg border border-border/80 bg-card/80 p-2.5 sm:p-3'>
          <div className='text-[10px] uppercase tracking-wider text-muted-foreground font-semibold'>
            Avg Accuracy
          </div>
          <div className='mt-1 text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400'>
            {metrics.avgAccuracy.toFixed(1)}%
          </div>
        </div>

        <div className='rounded-lg border border-border/80 bg-card/80 p-2.5 sm:p-3'>
          <div className='text-[10px] uppercase tracking-wider text-muted-foreground font-semibold'>
            Margin Realized
          </div>
          <div className='mt-1 text-base sm:text-lg font-bold text-foreground'>
            ₹{metrics.totalRealizedMargin.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='overflow-x-auto rounded-lg border border-border'>
        <table className='w-full text-left text-xs font-mono'>
          <thead>
            <tr className='border-b border-border bg-muted/60 text-[11px] text-muted-foreground uppercase tracking-wider'>
              <th className='py-2.5 px-3.5 font-semibold'>Timestamp</th>
              <th className='py-2.5 px-3.5 font-semibold'>Product / Target</th>
              <th className='py-2.5 px-3.5 font-semibold'>Issue / Context</th>
              <th className='py-2.5 px-3.5 font-semibold'>Allocation Action</th>
              <th className='py-2.5 px-3.5 text-right font-semibold'>Outcome</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className='py-6 text-center text-muted-foreground text-xs'>
                  No audited decisions logged yet.
                </td>
              </tr>
            ) : (
              filtered.map((item: any) => {
                const isAuto = item.isAuto || (item.actionTaken && item.actionTaken.includes('[Auto]'));
                const channel = item.channel || (item.decision && item.decision.includes('meta') ? 'meta' : item.decision && item.decision.includes('google') ? 'google' : 'amazon');
                const displayName = item.product || item.decision?.split('->')[0] || item.decision || 'Catalog Campaign';
                const actionText = item.actionTaken || item.decision || 'Budget reallocated';
                const issueText = item.issue || (item.expectedMargin ? `Exp. Margin: ₹${item.expectedMargin.toLocaleString()}` : 'Algorithmic Optimization');
                const outcomeText = item.outcome || (item.realizedMargin ? `₹${item.realizedMargin.toLocaleString()} (${(item.confidence ? item.confidence * 100 : 95).toFixed(0)}% conf)` : 'Optimized');

                return (
                  <tr key={item.id} className='bg-card hover:bg-muted/40 transition-colors'>
                    <td className='py-3 px-3.5 text-muted-foreground text-[11px] whitespace-nowrap font-medium'>
                      {item.timestamp.split(' ')[1] || item.timestamp}
                    </td>
                    <td className='py-3 px-3.5 text-foreground font-sans text-xs max-w-xs truncate font-medium'>
                      <span className='inline-flex items-center gap-1.5'>
                        <PlatformLogo platform={channel.toLowerCase()} size={12} className='shrink-0' />
                        <span className='truncate'>{displayName}</span>
                        {isAuto && (
                          <span className='text-[9px] font-mono px-1 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/50 uppercase font-bold'>
                            Auto
                          </span>
                        )}
                      </span>
                    </td>
                    <td className='py-3 px-3.5 text-amber-400/90 text-xs font-mono max-w-xs truncate'>
                      {issueText}
                    </td>
                    <td className='py-3 px-3.5 text-muted-foreground text-xs max-w-sm truncate'>
                      {actionText}
                    </td>
                    <td className='py-3 px-3.5 text-right whitespace-nowrap font-mono text-emerald-400 font-semibold'>
                      {outcomeText}
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
