import React, { useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface LedgerItem {
  id: string;
  timestamp: string;
  decision: string;
  expectedMargin: number;
  realizedMargin: number;
  variancePct: number;
  accuracyPct: number;
  confidence: number;
  status: string;
  feedback: string;
}

interface DecisionLedgerTableProps {
  entries: LedgerItem[];
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

  const filtered = entries.filter((item) =>
    item.decision.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.timestamp.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Allocation Action', 'Expected Margin (INR)', 'Realized Margin (INR)', 'Accuracy (%)', 'Confidence (%)'];
    const rows = filtered.map((e) => [
      e.id,
      e.timestamp,
      `"${e.decision.replace(/"/g, '""')}"`,
      e.expectedMargin,
      e.realizedMargin,
      e.accuracyPct.toFixed(1),
      (e.confidence * 100).toFixed(0)
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
    const avgAccuracy = entries.reduce((acc, curr) => acc + curr.accuracyPct, 0) / totalDecisions;
    const totalRealizedMargin = entries.reduce((acc, curr) => acc + curr.realizedMargin, 0);
    const totalExpectedMargin = entries.reduce((acc, curr) => acc + curr.expectedMargin, 0);

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

      {/* Main Redesigned Table */}
      <div className='rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-xs font-mono border-collapse'>
            <thead>
              <tr className='border-b border-border/80 bg-muted/40 text-[10px] text-muted-foreground uppercase tracking-wider select-none'>
                <th className='py-2.5 px-3.5 font-semibold w-[90px]'>TIME</th>
                <th className='py-2.5 px-3.5 font-semibold'>DECISION</th>
                <th className='py-2.5 px-3 text-right font-semibold w-[105px]'>EXPECTED</th>
                <th className='py-2.5 px-3 text-right font-semibold w-[125px]'>REALIZED</th>
                <th className='py-2.5 px-3 text-right font-semibold w-[110px]'>ACCURACY</th>
                <th className='py-2.5 px-3.5 text-right font-semibold w-[95px]'>CONFIDENCE</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/60'>
              {entries.map((item) => {
                const isPositiveVariance = item.realizedMargin >= item.expectedMargin;
                const variance = +(item.realizedMargin - item.expectedMargin).toFixed(1);
                const parsed = parseDecisionString(item.decision);
                const timeStr = item.timestamp.split(' ')[1] || item.timestamp;

                // Accuracy bounded 0-100 for visual bar
                const accClamped = Math.max(0, Math.min(100, item.accuracyPct));

                return (
                  <tr
                    key={item.id}
                    className='group hover:bg-muted/40 transition-colors h-[64px] border-b border-border/40 last:border-b-0'
                  >
                    {/* 1. TIME */}
                    <td className='py-2.5 px-3.5 text-muted-foreground text-[11px] whitespace-nowrap font-medium align-middle'>
                      {timeStr}
                    </td>

                    {/* 2. DECISION (Strongest Visual Element) */}
                    <td className='py-2.5 px-3.5 align-middle'>
                      <div className='flex flex-wrap items-center gap-1.5 sm:gap-2 leading-tight'>
                        {/* Action Badge */}
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border',
                            parsed.action === 'SHIFT' && 'bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border-cyan-500/20',
                            parsed.action === 'SCALE' && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                            parsed.action === 'THROTTLE' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                            parsed.action === 'ACTION' && 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          )}
                        >
                          {parsed.action}
                        </span>

                        {/* Amount */}
                        {parsed.amount && (
                          <span className='font-bold text-foreground text-xs'>
                            {parsed.amount}
                          </span>
                        )}

                        {/* Structured details */}
                        {parsed.isShift && parsed.source && parsed.target ? (
                          <div className='inline-flex items-center gap-1 text-[11px] text-foreground font-sans'>
                            <span className='text-muted-foreground font-mono text-[10px]'>from</span>
                            <span className='font-bold text-foreground'>{parsed.source.platform}</span>
                            {parsed.source.detail && (
                              <span className='text-muted-foreground text-[10px] hidden lg:inline truncate max-w-[130px]'>
                                ({parsed.source.detail})
                              </span>
                            )}
                            <span className='text-muted-foreground font-bold px-0.5'>→</span>
                            <span className='font-bold text-foreground'>{parsed.target.platform}</span>
                            {parsed.target.detail && (
                              <span className='text-muted-foreground text-[10px] hidden md:inline truncate max-w-[160px]'>
                                ({parsed.target.detail})
                              </span>
                            )}
                          </div>
                        ) : parsed.target ? (
                          <div className='inline-flex items-center gap-1 text-[11px] text-foreground font-sans'>
                            <span className='font-bold text-foreground'>{parsed.target.platform}</span>
                            {parsed.target.product && (
                              <span className='text-muted-foreground text-[10px] truncate max-w-[150px]'>
                                ({parsed.target.product})
                              </span>
                            )}
                            {parsed.target.note && (
                              <span className='text-muted-foreground text-[10px] hidden lg:inline truncate max-w-[180px]'>
                                • {parsed.target.note}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className='text-foreground font-sans text-xs truncate max-w-sm'>
                            {item.decision}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 3. EXPECTED */}
                    <td className='py-2.5 px-3 text-right text-muted-foreground whitespace-nowrap font-medium align-middle'>
                      ₹{item.expectedMargin.toLocaleString()}
                    </td>

                    {/* 4. REALIZED + DYNAMIC ARROW + VARIANCE */}
                    <td className='py-2.5 px-3 text-right whitespace-nowrap align-middle'>
                      <div className='flex flex-col items-end'>
                        <div className='flex items-center gap-1 justify-end'>
                          <span
                            className={cn(
                              'font-bold text-xs',
                              isPositiveVariance
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            )}
                          >
                            ₹{item.realizedMargin.toLocaleString()}
                          </span>
                          <span
                            className={cn(
                              'text-[10px] font-bold',
                              isPositiveVariance
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            )}
                          >
                            {isPositiveVariance ? '↑' : '↓'}
                          </span>
                        </div>
                        {/* Variance badge / delta */}
                        <span
                          className={cn(
                            'text-[9px] font-mono font-medium',
                            isPositiveVariance
                              ? 'text-emerald-600/80 dark:text-emerald-400/80'
                              : 'text-rose-600/80 dark:text-rose-400/80'
                          )}
                        >
                          {variance >= 0 ? `+₹${variance}` : `-₹${Math.abs(variance)}`}
                        </span>
                      </div>
                    </td>

                    {/* 5. ACCURACY + MICRO CONFIDENCE/ACCURACY BAR */}
                    <td className='py-2.5 px-3 text-right whitespace-nowrap align-middle'>
                      <div className='flex flex-col items-end gap-1'>
                        <span
                          className={cn(
                            'font-bold text-xs',
                            item.accuracyPct >= 95
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          )}
                        >
                          {item.accuracyPct.toFixed(1)}%
                        </span>
                        {/* Tiny Horizontal Micro-Bar */}
                        <div className='w-14 h-1 bg-muted rounded-full overflow-hidden'>
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              item.accuracyPct >= 95 ? 'bg-emerald-500' : 'bg-amber-500'
                            )}
                            style={{ width: `${accClamped}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* 6. CONFIDENCE BADGE */}
                    <td className='py-2.5 px-3.5 text-right whitespace-nowrap align-middle'>
                      <span
                        className={cn(
                          'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border tracking-tight',
                          item.confidence >= 0.9
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-muted text-muted-foreground border-border'
                        )}
                      >
                        {(item.confidence * 100).toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
