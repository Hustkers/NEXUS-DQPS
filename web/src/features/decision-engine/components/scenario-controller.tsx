'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ScenarioSimulationModal } from './scenario-simulation-modal';
import type { ShockScenarioId } from '../types/simulation-types';

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

function mapScenarioId(id: string): ShockScenarioId {
  if (id === 'scenario-stockout' || id === 'stockout') return 'stockout';
  if (id === 'scenario-cpm-spike' || id === 'cpm-spike') return 'cpm-spike';
  if (id === 'scenario-creative-fatigue' || id === 'creative-fatigue') return 'creative-fatigue';
  return 'price-undercut';
}

export function ScenarioController({
  scenarios,
  onTriggerScenario,
  onResetBaseline,
  className
}: ScenarioControllerProps) {
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [modalScenarioId, setModalScenarioId] = useState<ShockScenarioId | null>(null);

  const handleTrigger = (scenario: ScenarioDefinition) => {
    setActiveScenarioId(scenario.id);
    const mapped = mapScenarioId(scenario.id);
    setModalScenarioId(mapped);
    toast.warning(`Shock Injected: ${scenario.name}`, {
      description: scenario.autonomousResponse
    });
    onTriggerScenario?.(scenario);
  };

  const handleReset = () => {
    setActiveScenarioId(null);
    setModalScenarioId(null);
    toast.success('Simulation Reset', {
      description: 'Restored baseline steady-state telemetry.'
    });
    onResetBaseline?.();
  };

  return (
    <>
      <div className={cn('rounded border border-[#8A8A8A] bg-[#1A1A1A] p-5 shadow-none text-[#FFFFFF]', className)}>
        <div className='flex items-center justify-between border-b border-[#8A8A8A]/40 pb-3 mb-4'>
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
            className='h-8 text-xs font-mono text-[#FFFFFF] hover:bg-[#000000] hover:border-[#FFFFFF] border border-[#8A8A8A] bg-[#1A1A1A] px-2.5 active:scale-[0.98]'
          >
            <Icons.clock className='mr-1.5 size-3 text-[#8A8A8A]' />
            Reset Baseline
          </Button>
        </div>

        {/* Enhanced interactive shock tiles */}
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3'>
          {scenarios.map((s) => {
            const isActive = activeScenarioId === s.id;
            const isCritical = s.severity === 'CRITICAL';
            const mappedId = mapScenarioId(s.id);

            return (
              <button
                key={s.id}
                onClick={() => handleTrigger(s)}
                className={cn(
                  'group flex flex-col justify-between text-left rounded border p-3.5 transition-all active:scale-[0.98] min-h-[140px] min-w-0',
                  isActive
                    ? 'border-[#FFFFFF] bg-[#000000] ring-1 ring-[#FFFFFF]'
                    : 'border-[#8A8A8A]/40 bg-[#000000] hover:border-[#FFFFFF] hover:bg-zinc-950/80'
                )}
              >
                <div className='w-full'>
                  <div className='flex items-center justify-between w-full mb-1.5'>
                    <span className='font-mono text-xs font-bold text-[#FFFFFF]'>
                      {isCritical ? '■' : '○'}
                    </span>
                    <span className='text-[10px] font-mono text-[#FFFFFF] bg-[#1A1A1A] border border-[#8A8A8A] px-1.5 py-0.5 rounded font-bold'>
                      {s.expectedSavedWaste.split(' ')[0]} saved
                    </span>
                  </div>
                  <div className='font-mono text-xs font-bold text-[#FFFFFF] line-clamp-1 group-hover:text-cyan-400 transition-colors'>
                    {s.name}
                  </div>
                  <div className='text-[11px] text-[#8A8A8A] font-mono mt-1 line-clamp-2 leading-relaxed'>
                    {s.injectedEvent}
                  </div>
                </div>

                <div className='w-full pt-2.5 mt-2 border-t border-[#8A8A8A]/20 flex items-center justify-between text-[10px] font-mono'>
                  <span className='text-[#8A8A8A]'>Autonomous Response</span>
                  <span className='font-bold text-[#FFFFFF] group-hover:translate-x-0.5 transition-transform flex items-center gap-1'>
                    RUN SIMULATION →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dedicated Interactive Scenario Simulation Modal */}
      {modalScenarioId && (
        <ScenarioSimulationModal
          scenarioId={modalScenarioId}
          isOpen={!!modalScenarioId}
          onClose={() => setModalScenarioId(null)}
          onResetBaseline={handleReset}
        />
      )}
    </>
  );
}
