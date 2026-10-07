'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { ScenarioController } from '@/features/decision-engine/components/scenario-controller';
import initialEngineState from '@/data/nexus-engine-state.json';
import { toast } from 'sonner';

export default function SimulatorPage() {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/50 dark:bg-[#07090e] text-foreground min-h-screen'>
      <div>
        <div className='flex items-center gap-2'>
          <Icons.sparkles className='size-5 text-indigo-600 dark:text-purple-400' />
          <h1 className='text-xl font-mono font-bold text-foreground uppercase tracking-tight'>
            Synthetic Simulator &amp; Shock Sandbox
          </h1>
        </div>
        <p className='text-xs font-mono text-muted-foreground mt-1'>
          90-Day Multi-Platform Data Generator • Adstock Decay • Saturation Dynamics • Ground-Truth Anomaly Labels
        </p>
      </div>

      <ScenarioController
        scenarios={initialEngineState.scenarios}
        onTriggerScenario={(s) => setActiveScenario(s.id)}
        onResetBaseline={() => setActiveScenario(null)}
      />

      {/* Simulator Mechanics Deep-Dive */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='rounded-xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm'>
          <h4 className='font-mono text-sm font-bold text-foreground mb-2 flex items-center gap-2'>
            <Icons.adjustments className='size-4 text-emerald-600 dark:text-emerald-400' />
            1. Adstock &amp; Saturation
          </h4>
          <p className='text-xs text-muted-foreground leading-relaxed font-sans'>
            Simulates non-linear Hill response curves: <code className='text-emerald-700 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/40 px-1 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50'>r(s) = a * s^b / (c + s^b)</code>. Models diminishing returns on over-scaled channels to calibrate optimizer bounds.
          </p>
        </div>

        <div className='rounded-xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm'>
          <h4 className='font-mono text-sm font-bold text-foreground mb-2 flex items-center gap-2'>
            <Icons.product className='size-4 text-sky-600 dark:text-cyan-400' />
            2. ERP Inventory Coupling
          </h4>
          <p className='text-xs text-muted-foreground leading-relaxed font-sans'>
            Couples live warehouse inventory with ad network spend. When units hit 0, conversions collapse while ad spend continues unless the autonomous stockout kill-switch triggers.
          </p>
        </div>

        <div className='rounded-xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm'>
          <h4 className='font-mono text-sm font-bold text-foreground mb-2 flex items-center gap-2'>
            <Icons.check className='size-4 text-indigo-600 dark:text-purple-400' />
            3. Ground-Truth Scoring
          </h4>
          <p className='text-xs text-muted-foreground leading-relaxed font-sans'>
            Every injected anomaly holds a deterministic ground-truth label. The RCA agent explanation is evaluated against exact injected drivers (e.g. stockout vs CPM spike).
          </p>
        </div>
      </div>
    </div>
  );
}
