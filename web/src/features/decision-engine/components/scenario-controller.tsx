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
    <div className={cn('rounded border border-[#1A1A1A] bg-[#1A1A1A] p-5 shadow-none text-[#FFFFFF]', className)}>
      <div className='flex items-center justify-between border-b border-[#000000] pb-3 mb-4'>
        <div className='flex items-center gap-2'>
          <Icons.sparkles className='size-3.5 text-[#8A8A8A]' />
          <h3 className='font-mono text-xs font-bold text-[#FFFFFF] uppercase tracking-wider'>
            Scenario Shock Testing Sandbox
          </h3>
        </div>

        <Button
          size='sm'
          variant='outline'
          onClick={handleReset}
          className='h-8 text-xs font-mono text-[#FFFFFF] hover:bg-[#000000] hover:border-[#FFFFFF] border border-[#1A1A1A] bg-[#000000] px-2.5 active:scale-[0.98]'
        >
          <Icons.clock className='mr-1.5 size-3 text-[#8A8A8A]' />
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
                'group flex flex-col items-start text-left rounded p-3.5 transition-all active:scale-[0.98]',
                isActive
                  ? 'border border-[#FFFFFF] bg-[#000000] ring-1 ring-[#FFFFFF]'
                  : 'border border-[#1A1A1A] bg-[#000000] hover:border-[#8A8A8A]'
              )}
            >
              <div className='flex items-center justify-between w-full mb-1.5'>
                <span className='font-mono text-xs font-bold text-[#FFFFFF]'>
                  {isCritical ? '■' : '○'}
                </span>
                <span className='text-[10px] font-mono text-[#FFFFFF] bg-[#1A1A1A] px-1.5 py-0.5 rounded font-semibold'>
                  {s.expectedSavedWaste.split(' ')[0]} saved
                </span>
              </div>
              <div className='font-mono text-xs font-bold text-[#FFFFFF] line-clamp-1'>
                {s.name}
              </div>
              <div className='text-[11px] text-[#8A8A8A] font-mono mt-1 line-clamp-1'>
                {s.injectedEvent}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
