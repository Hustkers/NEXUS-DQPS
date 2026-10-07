'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AdPlaygroundConsole } from '@/features/decision-engine/components/ad-playground/ad-playground-console';
import { IconAdjustments } from '@tabler/icons-react';

export default function AdPlaygroundPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/50 dark:bg-[#07090e] text-foreground min-h-screen'>
      {/* Top Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4'>
        <div>
          <div className='flex items-center gap-2'>
            <IconAdjustments className='size-5 text-cyan-500 dark:text-cyan-400' />
            <h1 className='text-xl font-mono font-bold text-foreground uppercase tracking-tight'>
              Ad Playground • Campaign Exploration &amp; Profit Engine
            </h1>
          </div>
          <p className='text-xs font-mono text-muted-foreground mt-1'>
            Explore 10 Candidate Configurations • Response Saturation Curves (Hill Model) • Net Profit Maximization Ranking
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <Badge
            variant='outline'
            className='font-mono text-xs border-cyan-500/40 text-cyan-400 bg-cyan-950/30 py-1 px-2.5 shadow-xs'
          >
            <span className='size-1.5 rounded-full bg-cyan-400 mr-2 animate-ping' />
            RESPONSE CURVES ACTIVE
          </Badge>
          <Badge
            variant='outline'
            className='font-mono text-xs border-border text-muted-foreground bg-muted/40 py-1 px-2.5'
          >
            10 CANDIDATES EVALUATED
          </Badge>
        </div>
      </div>

      {/* Main Console */}
      <AdPlaygroundConsole />
    </div>
  );
}
