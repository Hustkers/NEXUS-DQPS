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

function getImpactMetric(id: string): string {
  if (id.includes('stockout')) return '-96% ROAS • 0 Stock';
  if (id.includes('cpm')) return '+45% CPM • Auction Surge';
  if (id.includes('creative') || id.includes('fatigue')) return '-60% CTR • Ad Exhaustion';
  return '-32% Price • Buy-Box Undercut';
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
    toast.warning(`Shock Injected: ${scenario.name}`);
    onTriggerScenario?.(scenario);
  };

  const handleReset = () => {
    setActiveScenarioId(null);
    setModalScenarioId(null);
    toast.success('Simulation Reset');
    onResetBaseline?.();
  };

  return (
    <>
      <div className={cn('rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs text-card-foreground', className)}>
        <div className='flex items-center justify-between border-b border-border/70 pb-3 mb-3.5'>
          <div className='flex items-center gap-2'>
            <Icons.sparkles className='size-3.5 text-primary' />
            <h3 className='font-mono text-xs font-bold text-foreground uppercase tracking-wider'>
              Scenario Shock Testing Sandbox
            </h3>
          </div>

          <Button
            size='sm'
            variant='outline'
            onClick={handleReset}
            className='h-7 text-xs font-mono text-foreground border-border bg-muted/30 hover:bg-muted px-2.5 active:scale-[0.98]'
          >
            <Icons.clock className='mr-1.5 size-3 text-muted-foreground' />
            Reset Baseline
          </Button>
        </div>

        {/* Compact visual scenario cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-3'>
          {scenarios.map((s) => {
            const isActive = activeScenarioId === s.id;
            const isCritical = s.severity === 'CRITICAL';
            const impactMetric = getImpactMetric(s.id);

            return (
              <button
                key={s.id}
                type='button'
                onClick={() => handleTrigger(s)}
                className={cn(
                  'group flex flex-col justify-between text-left rounded-lg border p-3.5 transition-all active:scale-[0.98] min-h-[120px] font-mono',
                  isActive
                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                    : 'border-border bg-muted/20 hover:border-foreground/40 hover:bg-muted/40'
                )}
              >
                <div className='w-full space-y-1.5'>
                  <div className='flex items-center justify-between'>
                    <span className={cn('text-xs font-bold', isCritical ? 'text-rose-500' : 'text-amber-500')}>
                      {isCritical ? '● HIGH' : '○ MODERATE'}
                    </span>
                    <span className='text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded'>
                      {s.expectedSavedWaste.split(' ')[0]} saved
                    </span>
                  </div>

                  <div className='text-xs font-bold text-foreground line-clamp-1 group-hover:text-cyan-400 transition-colors'>
                    {s.name}
                  </div>

                  <div className='text-[11px] text-muted-foreground font-semibold'>
                    {impactMetric}
                  </div>
                </div>

                <div className='w-full pt-2 mt-2 border-t border-border/40 flex items-center justify-between text-[10px]'>
                  <span className='text-muted-foreground'>Simulation</span>
                  <span className='font-bold text-foreground group-hover:translate-x-0.5 transition-transform flex items-center gap-1'>
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
