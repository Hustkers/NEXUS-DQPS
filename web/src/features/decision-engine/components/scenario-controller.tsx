'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface ScenarioDefinition {
  id: string;
  name: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | string;
  injectedEvent: string;
  autonomousAction?: string;
  autonomousResponse?: string;
  expectedSavedWaste: string;
  responseSpeed?: string;
  description?: string;
}

interface ScenarioControllerProps {
  scenarios: ScenarioDefinition[];
  onTriggerScenario: (scenario: ScenarioDefinition) => void;
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

  const handleTrigger = (s: ScenarioDefinition) => {
    setActiveScenarioId(s.id);
    onTriggerScenario(s);
  };

  const handleReset = () => {
    setActiveScenarioId(null);
    toast.info('Telemetry Baseline Restored', {
      description: 'Restored baseline steady-state telemetry.'
    });
    onResetBaseline?.();
  };

  return (
    <div className={cn('rounded border border-border bg-card p-5 shadow-none text-card-foreground', className)}>
      <div className='flex items-center justify-between border-b border-border pb-3 mb-4'>
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
          className='h-8 text-xs font-mono text-foreground hover:bg-muted border border-border bg-background px-2.5 active:scale-[0.98]'
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
                'group flex flex-col items-start text-left rounded p-3.5 transition-all active:scale-[0.98] cursor-pointer',
                isActive
                  ? 'border border-foreground bg-muted ring-1 ring-foreground'
                  : 'border border-border bg-background hover:border-foreground/40'
              )}
            >
              <div className='flex items-center justify-between w-full mb-1.5'>
                <span className={cn('font-mono text-xs font-bold', isCritical ? 'text-rose-500' : 'text-foreground')}>
                  {isCritical ? '■' : '○'}
                </span>
                <span className='text-[10px] font-mono text-foreground bg-muted px-1.5 py-0.5 rounded font-semibold border border-border'>
                  {s.expectedSavedWaste.split(' ')[0]} saved
                </span>
              </div>
              <div className='font-mono text-xs font-bold text-foreground line-clamp-1'>
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
