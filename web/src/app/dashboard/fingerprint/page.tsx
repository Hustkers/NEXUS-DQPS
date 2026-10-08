'use client';

import React from 'react';
import { FingerprintTrackerDemo } from '@/features/decision-engine/components/fingerprint-tracker-demo';

export default function FingerprintPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full'>
      <FingerprintTrackerDemo />
    </div>
  );
}
