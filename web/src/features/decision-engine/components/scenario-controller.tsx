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
    <div className={cn('rounded-xl border border-border/80 bg-card p-5 shadow-xs', className)}>
      <div className='flex items-center justify-between border-b border-border/80 pb-3 mb-4'>
        <div className='flex items-center gap-2'>
          <Icons.sparkles className='size-3.5 text-muted-foreground' />
          <h3 className='font-mono text-xs font-bold text-foreground uppercase tracking-wider'>
            Scenario Shock Testing Sandbox
          </h3>
        </div>

        <Button
          size='sm'
          variant='outline'
          onClick={handleReset}
          className='h-8 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-accent border border-border bg-card px-2.5 shadow-2xs active:scale-[0.98]'
        >
          <Icons.clock className='mr-1.5 size-3 text-muted-foreground' />
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
                'group flex flex-col items-start text-left rounded-xl border p-3.5 transition-all active:scale-[0.98]',
                isActive
                  ? 'border-foreground bg-accent/80 shadow-xs ring-1 ring-foreground/20'
                  : 'border-border/80 bg-slate-50/50 dark:bg-zinc-950/30 hover:border-border hover:bg-slate-100/60 dark:hover:bg-zinc-900/40 shadow-2xs'
              )}
            >
              <div className='flex items-center justify-between w-full mb-1.5'>
                <span
                  className={cn(
                    'size-1.5 rounded-full',
                    isCritical ? 'bg-rose-500' : 'bg-amber-500'
                  )}
                />
                <span className='text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 px-1 py-0.2 rounded font-bold'>
                  {s.expectedSavedWaste.split(' ')[0]} saved
                </span>
              </div>
              <div className='font-mono text-xs font-bold text-foreground group-hover:text-foreground line-clamp-1'>
                {s.name}
              </div>
              <div className='text-[11px] text-muted-foreground font-mono mt-1 line-clamp-1'>
                {s.injectedEvent}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
