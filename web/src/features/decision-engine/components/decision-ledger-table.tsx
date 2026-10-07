'use client';

import React from 'react';
import { Icons } from '@/components/icons';
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
    <div className={cn('rounded border border-[#8A8A8A] bg-[#1A1A1A] p-5 shadow-none text-[#FFFFFF]', className)}>
      <div className='flex items-center justify-between border-b border-[#8A8A8A]/40 pb-3 mb-4'>
        <div className='flex items-center gap-2'>
          <Icons.check className='size-3.5 text-[#FFFFFF]' />
          <h3 className='font-mono text-xs font-bold text-[#FFFFFF] uppercase tracking-wider'>
            Decision Ledger &amp; Counterfactual Calibration
          </h3>
        </div>
        <span className='text-xs font-mono text-[#8A8A8A]'>
          {entries.length} audited decisions
        </span>
      </div>

      {/* Table */}
      <div className='overflow-x-auto rounded border border-[#8A8A8A]/40'>
        <table className='w-full text-left text-xs font-mono'>
          <thead>
            <tr className='border-b border-[#8A8A8A] bg-[#000000] text-[11px] text-[#8A8A8A] uppercase tracking-wider'>
              <th className='py-2.5 px-3 font-semibold'>Timestamp</th>
              <th className='py-2.5 px-3 font-semibold'>Allocation Action</th>
              <th className='py-2.5 px-3 text-right font-semibold'>Exp. Margin</th>
              <th className='py-2.5 px-3 text-right font-semibold'>Realized</th>
              <th className='py-2.5 px-3 text-right font-semibold'>Accuracy</th>
              <th className='py-2.5 px-3 text-right font-semibold'>Confidence</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-[#000000]'>
            {entries.map((item) => {
              return (
                <tr key={item.id} className='bg-[#1A1A1A] hover:bg-[#000000] hover:outline hover:outline-1 hover:outline-[#8A8A8A] transition-colors'>
                  <td className='py-2.5 px-3 text-[#8A8A8A] text-[11px] whitespace-nowrap font-medium'>
                    {item.timestamp.split(' ')[1] || item.timestamp}
                  </td>
                  <td className='py-2.5 px-3 text-[#FFFFFF] font-sans text-xs max-w-md truncate font-medium'>
                    {item.decision}
                  </td>
                  <td className='py-2.5 px-3 text-right text-[#8A8A8A] whitespace-nowrap font-mono'>
                    ₹{item.expectedMargin.toLocaleString()}
                  </td>
                  <td className='py-2.5 px-3 text-right whitespace-nowrap font-mono'>
                    <span className='font-bold text-[#FFFFFF]'>
                      ₹{item.realizedMargin.toLocaleString()}
                    </span>
                  </td>
                  <td className='py-2.5 px-3 text-right whitespace-nowrap font-mono'>
                    <span className='font-bold text-[#FFFFFF]'>
                      {item.accuracyPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className='py-2.5 px-3 text-right text-[#FFFFFF] font-bold whitespace-nowrap font-mono'>
                    {(item.confidence * 100).toFixed(0)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
