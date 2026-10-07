'use client';

import React from 'react';
import {
  IconTarget,
  IconCalendar,
  IconCoins,
  IconChevronDown,
  IconPackage
} from '@tabler/icons-react';
import type { CampaignConfig } from '@/lib/strategy-engine/types';

interface StrategyCampaignContextProps {
  campaign: CampaignConfig;
  onOpenConfigForm: () => void;
}

export function StrategyCampaignContext({
  campaign,
  onOpenConfigForm
}: StrategyCampaignContextProps) {
  const curSym = '₹';

  return (
    <div className='rounded-xl border border-border/80 bg-card p-4 font-mono shadow-2xs'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        {/* Left: Campaign Name, Product & Parameters */}
        <div className='flex items-center gap-3 min-w-0'>
          <div className='size-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0'>
            <IconPackage className='size-5' />
          </div>

          <div className='min-w-0'>
            <div className='flex items-center gap-2'>
              <span className='text-[10px] uppercase font-bold tracking-wider text-muted-foreground'>
                CAMPAIGN CONTEXT
              </span>
              <span className='text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted/60 text-foreground border border-border/60'>
                {campaign.objective}
              </span>
            </div>

            <h2 className='text-sm sm:text-base font-bold text-foreground truncate mt-0.5'>
              {campaign.campaignName.toUpperCase()}
            </h2>

            <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5'>
              <span className='text-cyan-400 font-bold'>
                {curSym}{campaign.totalBudget.toLocaleString('en-IN')} budget
              </span>
              <span>•</span>
              <span>{campaign.campaignDuration} days horizon</span>
              <span>•</span>
              <span className='truncate'>{campaign.productService}</span>
            </div>
          </div>
        </div>

        {/* Right: Change Campaign CTA */}
        <div className='flex items-center gap-2 shrink-0'>
          <button
            type='button'
            onClick={onOpenConfigForm}
            className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-muted/30 hover:bg-muted/60 text-xs text-foreground font-semibold transition-colors'
          >
            <span>Change Campaign</span>
            <IconChevronDown className='size-3.5 text-muted-foreground' />
          </button>
        </div>
      </div>
    </div>
  );
}
