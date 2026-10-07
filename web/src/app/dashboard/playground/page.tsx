'use client';

import React from 'react';
import { AdPlaygroundConsole } from '@/features/decision-engine/components/ad-playground/ad-playground-console';

export default function AdPlaygroundPage() {
  return (
    <div className='flex flex-1 flex-col p-4 md:p-6 bg-slate-50/50 dark:bg-[#07090e] text-foreground min-h-screen'>
      <AdPlaygroundConsole />
    </div>
  );
}
