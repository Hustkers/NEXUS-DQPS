'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { ScenarioController } from '@/features/decision-engine/components/scenario-controller';
import { ScenarioSandbox } from '@/features/decision-engine/components/scenario-sandbox';
import initialEngineState from '@/data/nexus-engine-state.json';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SimulatorPage() {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const selectedScenarioObj = initialEngineState.scenarios.find((s: any) => s.id === activeScenario);

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-[#000000] text-white min-h-screen'>
      <div>
        <div className='flex items-center gap-2'>
          <Icons.sparkles className='size-5 text-white' />
          <h1 className='text-xl font-mono font-bold text-white uppercase tracking-tight'>
            Synthetic Simulator &amp; Shock Sandbox
          </h1>
        </div>
        <p className='text-xs font-mono text-[#8A8A8A] mt-1'>
          90-Day Multi-Platform Data Generator • Adstock Decay • Saturation Dynamics • Ground-Truth Anomaly Labels
        </p>
      </div>

      <ScenarioController
        scenarios={initialEngineState.scenarios}
        onTriggerScenario={(s) => {
          setActiveScenario(s.id);
          toast.warning(`Shock Injected: ${s.name}`, {
            description: s.injectedEvent
          });
        }}
        onResetBaseline={() => setActiveScenario(null)}
      />

      {/* Active Injected Shock Response & Recommended Mitigation */}
      {selectedScenarioObj && (
        <div className='p-4 rounded border border-rose-500/40 bg-rose-500/10 space-y-3 font-mono text-xs'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='size-2.5 rounded-full bg-rose-500 animate-ping' />
              <span className='font-bold uppercase tracking-wider text-rose-300'>
                Active Synthetic Shock: {selectedScenarioObj.name}
              </span>
            </div>
            <Badge variant='outline' className='border-rose-500/40 text-rose-300 bg-rose-500/20 text-[10px]'>
              {selectedScenarioObj.severity} SEVERITY
            </Badge>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3 text-zinc-300'>
            <div>
              <span className='text-[#8A8A8A] block text-[10px] uppercase'>Injected Anomaly</span>
              <span className='font-medium text-white'>{selectedScenarioObj.injectedEvent}</span>
            </div>
            <div>
              <span className='text-[#8A8A8A] block text-[10px] uppercase'>Autonomous Response</span>
              <span className='text-emerald-400 font-semibold'>{selectedScenarioObj.autonomousResponse}</span>
            </div>
            <div>
              <span className='text-[#8A8A8A] block text-[10px] uppercase'>Expected Saved Waste</span>
              <span className='text-cyan-400 font-bold'>{selectedScenarioObj.expectedSavedWaste}</span>
            </div>
          </div>
          <div className='flex items-center gap-3 pt-2 border-t border-rose-500/30'>
            <Link href='/dashboard/reallocations'>
              <Button size='sm' className='bg-white text-black hover:bg-neutral-200 font-mono text-xs font-bold'>
                Execute in Budget Reallocations &rarr;
              </Button>
            </Link>
            <Button
              size='sm'
              variant='outline'
              onClick={() => setActiveScenario(null)}
              className='text-xs font-mono border-rose-500/40 text-rose-200 hover:bg-rose-500/20'
            >
              Dismiss Shock
            </Button>
          </div>
        </div>
      )}

      {/* Interactive Hill Saturation Slider Sandbox */}
      <ScenarioSandbox />

      {/* Simulator Mechanics Deep-Dive */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='rounded border border-[#1A1A1A] bg-[#1A1A1A] p-5 shadow-none'>
          <h4 className='font-mono text-sm font-bold text-white mb-2 flex items-center gap-2'>
            <Icons.adjustments className='size-4 text-white' />
            1. Adstock &amp; Saturation
          </h4>
          <p className='text-xs text-[#8A8A8A] leading-relaxed font-sans'>
            Simulates non-linear Hill response curves: <code className='text-white font-mono bg-[#000000] px-1 py-0.5 rounded'>r(s) = a * s^b / (c + s^b)</code>. Models diminishing returns on over-scaled channels to calibrate optimizer bounds.
          </p>
        </div>

        <div className='rounded border border-[#1A1A1A] bg-[#1A1A1A] p-5 shadow-none'>
          <h4 className='font-mono text-sm font-bold text-white mb-2 flex items-center gap-2'>
            <Icons.product className='size-4 text-white' />
            2. ERP Inventory Coupling
          </h4>
          <p className='text-xs text-[#8A8A8A] leading-relaxed font-sans'>
            Couples live warehouse inventory with ad network spend. When units hit 0, conversions collapse while ad spend continues unless the autonomous stockout kill-switch triggers.
          </p>
        </div>

        <div className='rounded border border-[#1A1A1A] bg-[#1A1A1A] p-5 shadow-none'>
          <h4 className='font-mono text-sm font-bold text-white mb-2 flex items-center gap-2'>
            <Icons.check className='size-4 text-white' />
            3. Ground-Truth Scoring
          </h4>
          <p className='text-xs text-[#8A8A8A] leading-relaxed font-sans'>
            Every injected anomaly holds a deterministic ground-truth label. The RCA agent explanation is evaluated against exact injected drivers (e.g. stockout vs CPM spike).
          </p>
        </div>
      </div>
    </div>
  );
}
