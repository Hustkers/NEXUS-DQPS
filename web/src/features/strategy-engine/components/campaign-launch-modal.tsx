'use client';

import React, { useState } from 'react';
import { CampaignStrategy, Top3BudgetAllocation } from '@/lib/strategy-engine/types';
import { Button } from '@/components/ui/button';
import {
  IconShieldCheck,
  IconAlertTriangle,
  IconRocket,
  IconCheck,
  IconLock,
  IconCoin,
  IconClock
} from '@tabler/icons-react';
import { toast } from 'sonner';

interface CampaignLaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategy: CampaignStrategy | null;
  budgetAllocation?: Top3BudgetAllocation;
  onLaunchSuccess: () => void;
}

export function CampaignLaunchModal({
  isOpen,
  onClose,
  strategy,
  budgetAllocation,
  onLaunchSuccess
}: CampaignLaunchModalProps) {
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [confirmedRiskUnderstood, setConfirmedRiskUnderstood] = useState(false);

  if (!isOpen || !strategy) return null;

  const ev = strategy.evaluation;
  const curSym = '₹';

  const handleAuthorize = async () => {
    if (!confirmedRiskUnderstood) {
      toast.error('Risk Acknowledgment Required', {
        description: 'Please check the box confirming you have reviewed the contingency triggers and budget bounds.'
      });
      return;
    }

    setIsAuthorizing(true);
    try {
      toast.success('Campaign Authorized & Deployed!', {
        description: `"${strategy.strategyName}" is now active in Live Campaign Watchdog.`
      });
      onLaunchSuccess();
      onClose();
    } finally {
      setIsAuthorizing(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4'>
      <div className='relative w-full max-w-xl rounded-2xl border border-amber-500/40 bg-card p-6 shadow-2xl text-foreground font-mono space-y-5 animate-in fade-in zoom-in-95 duration-150'>
        {/* Header */}
        <div className='flex items-start justify-between border-b border-border/80 pb-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30'>
              <IconLock className='size-6' />
            </div>
            <div>
              <h2 className='text-base font-bold text-foreground flex items-center gap-2'>
                Authorize Campaign Execution
              </h2>
              <p className='text-xs text-muted-foreground'>
                Explicit Human-in-the-Loop Financial Authorization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-muted-foreground hover:text-foreground text-sm px-2 py-1 rounded-md'
          >
            ✕
          </button>
        </div>

        {/* Protection Banner */}
        <div className='rounded-xl border border-blue-500/40 bg-blue-500/10 p-3.5 text-xs text-blue-300 flex items-start gap-2.5'>
          <IconShieldCheck className='size-5 text-blue-400 shrink-0 mt-0.5' />
          <div>
            <span className='font-bold block'>Financial Safety Protocol Active:</span>
            <span>
              The AI Engine never deploys ad spend automatically. You retain full control over budget allocation and campaign activation.
            </span>
          </div>
        </div>

        {/* Strategy Summary Table */}
        <div className='rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2.5 text-xs'>
          <div className='flex justify-between border-b border-border/40 pb-2'>
            <span className='text-muted-foreground'>Strategy Name:</span>
            <span className='font-bold text-foreground text-right'>{strategy.strategyName}</span>
          </div>
          <div className='flex justify-between border-b border-border/40 pb-2'>
            <span className='text-muted-foreground'>Target Channel:</span>
            <span className='font-bold text-cyan-400 uppercase'>{strategy.platform} ({strategy.funnelStage})</span>
          </div>
          <div className='flex justify-between border-b border-border/40 pb-2'>
            <span className='text-muted-foreground'>Committed Spend:</span>
            <span className='font-bold text-foreground'>{curSym}{strategy.budgetAllocation.toLocaleString()}</span>
          </div>
          <div className='flex justify-between border-b border-border/40 pb-2'>
            <span className='text-muted-foreground'>Projected Return (ROAS):</span>
            <span className='font-bold text-emerald-400'>{ev?.expectedRoas.toFixed(2)}x ({curSym}{ev?.expectedRevenue.toLocaleString()})</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Acquisition Target (CPA):</span>
            <span className='font-bold text-foreground'>{curSym}{ev?.expectedCpa.toLocaleString()} / sale</span>
          </div>
        </div>

        {/* Checkbox Acknowledgment */}
        <label className='flex items-start gap-3 text-xs text-muted-foreground cursor-pointer select-none rounded-xl border border-border/60 p-3 bg-muted/10 hover:bg-muted/20'>
          <input
            type='checkbox'
            checked={confirmedRiskUnderstood}
            onChange={(e) => setConfirmedRiskUnderstood(e.target.checked)}
            className='mt-0.5 size-4 rounded border-border accent-amber-500'
          />
          <span>
            I have reviewed the strategy risks, contingency trigger caps (max CPA {curSym}{Math.round((ev?.expectedCpa || 400) * 1.25)}), and authorize the deployment of {curSym}{strategy.budgetAllocation.toLocaleString()} across {strategy.platform.toUpperCase()}.
          </span>
        </label>

        {/* Action Controls */}
        <div className='flex items-center justify-end gap-3 pt-2 border-t border-border/80'>
          <Button
            variant='outline'
            size='sm'
            onClick={onClose}
            disabled={isAuthorizing}
            className='text-xs font-mono h-9'
          >
            Cancel
          </Button>

          <Button
            size='sm'
            onClick={handleAuthorize}
            disabled={isAuthorizing || !confirmedRiskUnderstood}
            className='bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs h-9 px-4 flex items-center gap-2'
          >
            <IconRocket className={`size-4 ${isAuthorizing ? 'animate-bounce' : ''}`} />
            {isAuthorizing ? 'Authorizing Live Channel...' : 'Authorize Campaign Execution'}
          </Button>
        </div>
      </div>
    </div>
  );
}
