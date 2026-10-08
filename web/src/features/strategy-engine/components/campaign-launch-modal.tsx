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
  const curSym = '$';

  const handleAuthorize = async () => {
    if (!confirmedRiskUnderstood) {
      toast.error('Risk Acknowledgment Required', {
        description: 'Please check the box confirming you have reviewed the contingency triggers and budget bounds.'
      });
      return;
    }

    setIsAuthorizing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsAuthorizing(false);
    toast.success('Campaign Authorized & Deployed!', {
      description: `"${strategy.strategyName}" is now active in Live Campaign Watchdog.`
    });
    onLaunchSuccess();
    onClose();
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4'>
      <div className='relative w-full max-w-xl rounded-xl border border-border bg-card p-6 shadow-xl text-foreground font-mono space-y-5 animate-in fade-in zoom-in-95 duration-150'>
        {/* Header */}
        <div className='flex items-start justify-between border-b border-border/80 pb-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700'>
              <IconLock className='size-5' />
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
        <div className='rounded-lg border border-border bg-muted/20 p-3.5 text-xs text-muted-foreground flex items-start gap-2.5'>
          <IconShieldCheck className='size-5 text-foreground shrink-0 mt-0.5' />
          <div>
            <span className='font-medium text-foreground block'>Financial Safety Protocol:</span>
            <span>
              The AI Engine never deploys ad spend automatically. You retain full control over budget allocation and campaign activation.
            </span>
          </div>
        </div>

        {/* Strategy Summary Table */}
        <div className='rounded-lg border border-border bg-muted/10 p-4 space-y-2.5 text-xs'>
          <div className='flex justify-between border-b border-border/40 pb-2'>
            <span className='text-muted-foreground'>Strategy Name:</span>
            <span className='font-medium text-foreground text-right'>{strategy.strategyName}</span>
          </div>
          <div className='flex justify-between border-b border-border/40 pb-2'>
            <span className='text-muted-foreground'>Target Channel:</span>
            <span className='font-medium text-foreground uppercase'>{strategy.platform} ({strategy.funnelStage})</span>
          </div>
          <div className='flex justify-between border-b border-border/40 pb-2'>
            <span className='text-muted-foreground'>Committed Spend:</span>
            <span className='font-medium text-foreground'>{curSym}{strategy.budgetAllocation.toLocaleString()}</span>
          </div>
          <div className='flex justify-between border-b border-border/40 pb-2'>
            <span className='text-muted-foreground'>Projected Return (ROAS):</span>
            <span className='font-medium text-foreground'>{ev?.expectedRoas.toFixed(2)}x ({curSym}{ev?.expectedRevenue.toLocaleString()})</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Acquisition Target (CPA):</span>
            <span className='font-medium text-foreground'>{curSym}{ev?.expectedCpa.toLocaleString()} / sale</span>
          </div>
        </div>

        {/* Checkbox Acknowledgment */}
        <label className='flex items-start gap-3 text-xs text-muted-foreground cursor-pointer select-none rounded-lg border border-border p-3 bg-muted/10 hover:bg-muted/20'>
          <input
            type='checkbox'
            checked={confirmedRiskUnderstood}
            onChange={(e) => setConfirmedRiskUnderstood(e.target.checked)}
            className='mt-0.5 size-4 rounded border-border accent-zinc-200'
          />
          <span>
            I have reviewed the strategy risks, contingency trigger caps (max CPA {curSym}{Math.round((ev?.expectedCpa || 38) * 1.25)}), and authorize the deployment of {curSym}{strategy.budgetAllocation.toLocaleString()} across {strategy.platform.toUpperCase()}.
          </span>
        </label>

        {/* Action Controls */}
        <div className='flex items-center justify-end gap-3 pt-2 border-t border-border/80'>
          <Button
            variant='outline'
            size='sm'
            onClick={onClose}
            disabled={isAuthorizing}
            className='text-xs font-mono h-8 rounded-md'
          >
            Cancel
          </Button>

          <Button
            size='sm'
            onClick={handleAuthorize}
            disabled={isAuthorizing || !confirmedRiskUnderstood}
            className='bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-mono font-medium text-xs h-8 px-4 rounded-md transition-colors flex items-center gap-2'
          >
            <IconRocket className='size-3.5' />
            {isAuthorizing ? 'Authorizing Deployment...' : 'Authorize Campaign Execution'}
          </Button>
        </div>
      </div>
    </div>
  );
}
