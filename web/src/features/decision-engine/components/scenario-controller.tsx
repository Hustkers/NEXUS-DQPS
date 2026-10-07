'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  injectedEvent: string;
  autonomousResponse: string;
  expectedSavedWaste: string;
  severity: string;
}

interface ScenarioControllerProps {
  scenarios: ScenarioDefinition[];
  onTriggerScenario?: (scenario: ScenarioDefinition) => void;
  onResetBaseline?: () => void;
  className?: string;
}

export function ScenarioController({
  scenarios,
  onTriggerScenario,
  onResetBaseline,
  className
}: ScenarioControllerProps) {
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const handleTrigger = (scenario: ScenarioDefinition) => {
    setActiveScenarioId(scenario.id);
    toast.warning(`Shock Injected: ${scenario.name}`, {
      description: scenario.autonomousResponse
    });
    onTriggerScenario?.(scenario);
  };

  const handleReset = () => {
    setActiveScenarioId(null);
    toast.success('Simulation Reset', {
      description: 'Restored baseline steady-state telemetry.'
    });
    onResetBaseline?.();
  };

  return (
    <div className={cn('rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-5 shadow-none', className)}>
      <div className='flex items-center justify-between border-b border-zinc-800/60 pb-3 mb-4'>
        <div className='flex items-center gap-2'>
          <Icons.sparkles className='size-3.5 text-zinc-400' />
          <h3 className='font-mono text-xs font-bold text-zinc-200 uppercase tracking-wider'>
            Scenario Shock Testing Sandbox
          </h3>
        </div>

        <Button
          size='sm'
          variant='ghost'
          onClick={handleReset}
          className='h-7 text-xs font-mono text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 px-2.5 active:scale-[0.98]'
        >
          <Icons.clock className='mr-1.5 size-3 text-zinc-500' />
          Reset Baseline
        </Button>
      </div>

      {/* Utilitarian shock tiles */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
        {scenarios.map((s) => {
          const isActive = activeScenarioId === s.id;
          const isCritical = s.severity === 'CRITICAL';

          return (
            <button
              key={s.id}
              onClick={() => handleTrigger(s)}
              className={cn(
                'group flex flex-col items-start text-left rounded-lg border p-3.5 transition-all active:scale-[0.98]',
                isActive
                  ? 'border-zinc-400 bg-zinc-900/80 shadow-none'
                  : 'border-zinc-800/60 bg-zinc-950/30 hover:border-zinc-700/80 hover:bg-zinc-900/40'
              )}
            >
              <div className='flex items-center justify-between w-full mb-1.5'>
                <span
                  className={cn(
                    'size-1.5 rounded-full',
                    isCritical ? 'bg-rose-400' : 'bg-amber-400'
                  )}
                />
                <span className='text-[10px] font-mono text-emerald-400/90 font-medium'>
                  {s.expectedSavedWaste.split(' ')[0]} saved
                </span>
              </div>
              <div className='font-mono text-xs font-semibold text-zinc-200 group-hover:text-zinc-100 line-clamp-1'>
                {s.name}
              </div>
              <div className='text-[11px] text-zinc-500 font-mono mt-1 line-clamp-1'>
                {s.injectedEvent}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
