'use client';

import React from 'react';
import { FingerprintTrackerDemo } from '@/features/decision-engine/components/fingerprint-tracker-demo';

export default function FingerprintPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-[#000000] text-white min-h-screen'>
      <FingerprintTrackerDemo />
    </div>
  );
}
