'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { FingerprintTrackerDemo } from '@/features/decision-engine/components/fingerprint-tracker-demo';

export default function FingerprintPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-[#000000] text-white min-h-screen'>
      <div>
        <div className='flex items-center gap-2'>
          <Icons.fingerprint className='size-5 text-white' />
          <h1 className='text-xl font-mono font-bold text-white uppercase tracking-tight'>
            Cookieless Fingerprint Identity &amp; Cross-Channel Attribution
          </h1>
        </div>
        <p className='text-xs font-mono text-[#8A8A8A] mt-1'>
          Hardware Entropy Graph • Deterministic Device Matching • YouTube Preroll &rarr; Amazon 1-Click Buy Attribution
        </p>
      </div>

      <FingerprintTrackerDemo />
    </div>
  );
}
