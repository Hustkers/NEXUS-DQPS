'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { WhatIfScenarioInputs } from '@/lib/autonomous-learning/types';

interface LiveWhatIfControlPanelProps {
  inputs: WhatIfScenarioInputs;
  onChangeInputs: (newInputs: WhatIfScenarioInputs) => void;
  onResetDefaults: () => void;
  className?: string;
}

export function LiveWhatIfControlPanel({
  inputs,
  onChangeInputs,
  onResetDefaults,
  className
}: LiveWhatIfControlPanelProps) {
  const updateField = <K extends keyof WhatIfScenarioInputs>(
    key: K,
    val: WhatIfScenarioInputs[K]
  ) => {
    onChangeInputs({
      ...inputs,
      [key]: val
    });
  };

  // Scenario Presets
  const applyPreset = (preset: string) => {
    if (preset === 'NORMAL') {
      onResetDefaults();
    } else if (preset === 'HIGH_DEMAND') {
      onChangeInputs({
        ...inputs,
        cvrShiftPct: 25,
        aovShiftPct: 15,
        cpcShiftPct: 10,
        inventoryShockPct: 0,
        creativeFatigueDays: 0
      });
    } else if (preset === 'LOW_INVENTORY') {
      onChangeInputs({
        ...inputs,
        inventoryShockPct: -75,
        cpcShiftPct: 0,
        cvrShiftPct: 0
      });
    } else if (preset === 'CPC_SPIKE') {
      onChangeInputs({
        ...inputs,
        cpcShiftPct: 45,
        cvrShiftPct: -10,
        inventoryShockPct: 0
      });
    } else if (preset === 'CREATIVE_FATIGUE') {
      onChangeInputs({
        ...inputs,
        creativeFatigueDays: 16,
        cvrShiftPct: -25,
        cpcShiftPct: 15
      });
    } else if (preset === 'HIGH_MARGIN') {
      onChangeInputs({
        ...inputs,
        grossMarginShiftPct: 12,
        aovShiftPct: 10
      });
    } else if (preset === 'AGGRESSIVE_GROWTH') {
      onChangeInputs({
        ...inputs,
        totalBudget: 1600000,
        riskTolerance: 'aggressive',
        explorationBudgetPct: 20
      });
    } else if (preset === 'CONSERVATIVE_GROWTH') {
      onChangeInputs({
        ...inputs,
        totalBudget: 750000,
        riskTolerance: 'conservative',
        explorationBudgetPct: 5
      });
    }
  };

  return (
    <div className={cn('rounded-2xl border border-border/80 bg-card p-5 font-mono shadow-xs space-y-4', className)}>
      <div className='flex items-center justify-between border-b border-border/60 pb-3'>
        <div className='flex items-center gap-2'>
          <Icons.sliders className='size-4 text-primary' />
          <h3 className='text-xs font-bold uppercase tracking-wider text-foreground'>
            Live What-If Ad Simulator Controls
          </h3>
        </div>
        <Button
          size='sm'
          variant='outline'
          onClick={onResetDefaults}
          className='h-7 text-[11px] border-border text-muted-foreground hover:text-foreground'
        >
          <Icons.clock className='mr-1 size-3' />
          Reset Baseline
        </Button>
      </div>

      {/* Preset Scenario Buttons */}
      <div className='space-y-1.5'>
        <div className='text-[10px] text-muted-foreground uppercase font-bold tracking-wider'>
          Instant Scenario Presets
        </div>
        <div className='flex flex-wrap gap-1.5'>
          {[
            { id: 'NORMAL', label: 'Normal' },
            { id: 'HIGH_DEMAND', label: 'High Demand' },
            { id: 'LOW_INVENTORY', label: 'Low Inventory' },
            { id: 'CPC_SPIKE', label: 'CPC Spike (+45%)' },
            { id: 'CREATIVE_FATIGUE', label: 'Creative Fatigue' },
            { id: 'HIGH_MARGIN', label: 'High Margin (+12%)' },
            { id: 'AGGRESSIVE_GROWTH', label: 'Aggressive Growth' },
            { id: 'CONSERVATIVE_GROWTH', label: 'Conservative' }
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              className='px-2.5 py-1 rounded-md text-[10px] font-bold border border-border/70 bg-muted/30 text-foreground hover:bg-card hover:border-foreground transition-all active:scale-[0.98]'
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Variable Sliders */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1 text-xs'>
        {/* Total Budget Slider */}
        <div className='rounded-lg border border-border/60 bg-muted/10 p-3 space-y-1.5'>
          <div className='flex justify-between items-center text-[10px] font-bold uppercase'>
            <span className='text-muted-foreground'>Total Budget</span>
            <span className='text-foreground font-bold'>
              ₹{(inputs.totalBudget / 100000).toFixed(2)}L
            </span>
          </div>
          <input
            type='range'
            min={200000}
            max={2500000}
            step={25000}
            value={inputs.totalBudget}
            onChange={(e) => updateField('totalBudget', Number(e.target.value))}
            className='w-full accent-primary h-1 bg-border rounded-lg cursor-pointer'
          />
          <span className='text-[9px] text-muted-foreground block'>Range: ₹2.0L to ₹25.0L</span>
        </div>

        {/* Expected CPC Shift Slider */}
        <div className='rounded-lg border border-border/60 bg-muted/10 p-3 space-y-1.5'>
          <div className='flex justify-between items-center text-[10px] font-bold uppercase'>
            <span className='text-muted-foreground'>Market CPC Shift</span>
            <span className={cn('font-bold', inputs.cpcShiftPct > 0 ? 'text-rose-500' : 'text-emerald-500')}>
              {inputs.cpcShiftPct > 0 ? '+' : ''}{inputs.cpcShiftPct}%
            </span>
          </div>
          <input
            type='range'
            min={-40}
            max={80}
            step={5}
            value={inputs.cpcShiftPct}
            onChange={(e) => updateField('cpcShiftPct', Number(e.target.value))}
            className='w-full accent-primary h-1 bg-border rounded-lg cursor-pointer'
          />
          <span className='text-[9px] text-muted-foreground block'>Simulates auction bid pressure</span>
        </div>

        {/* Conversion Rate Shift Slider */}
        <div className='rounded-lg border border-border/60 bg-muted/10 p-3 space-y-1.5'>
          <div className='flex justify-between items-center text-[10px] font-bold uppercase'>
            <span className='text-muted-foreground'>Conversion Rate (CVR)</span>
            <span className={cn('font-bold', inputs.cvrShiftPct >= 0 ? 'text-emerald-500' : 'text-rose-500')}>
              {inputs.cvrShiftPct > 0 ? '+' : ''}{inputs.cvrShiftPct}%
            </span>
          </div>
          <input
            type='range'
            min={-50}
            max={50}
            step={5}
            value={inputs.cvrShiftPct}
            onChange={(e) => updateField('cvrShiftPct', Number(e.target.value))}
            className='w-full accent-primary h-1 bg-border rounded-lg cursor-pointer'
          />
          <span className='text-[9px] text-muted-foreground block'>Audience intent lift / decay</span>
        </div>

        {/* Gross Margin Shift Slider */}
        <div className='rounded-lg border border-border/60 bg-muted/10 p-3 space-y-1.5'>
          <div className='flex justify-between items-center text-[10px] font-bold uppercase'>
            <span className='text-muted-foreground'>Gross Margin Shift</span>
            <span className={cn('font-bold', inputs.grossMarginShiftPct >= 0 ? 'text-emerald-500' : 'text-rose-500')}>
              {inputs.grossMarginShiftPct > 0 ? '+' : ''}{inputs.grossMarginShiftPct}%
            </span>
          </div>
          <input
            type='range'
            min={-20}
            max={20}
            step={2}
            value={inputs.grossMarginShiftPct}
            onChange={(e) => updateField('grossMarginShiftPct', Number(e.target.value))}
            className='w-full accent-primary h-1 bg-border rounded-lg cursor-pointer'
          />
          <span className='text-[9px] text-muted-foreground block'>COGS / product pricing shift</span>
        </div>

        {/* Inventory Shock Slider */}
        <div className='rounded-lg border border-border/60 bg-muted/10 p-3 space-y-1.5'>
          <div className='flex justify-between items-center text-[10px] font-bold uppercase'>
            <span className='text-muted-foreground'>Inventory Availability</span>
            <span className={cn('font-bold', inputs.inventoryShockPct < 0 ? 'text-amber-500' : 'text-foreground')}>
              {inputs.inventoryShockPct > 0 ? '+' : ''}{inputs.inventoryShockPct}%
            </span>
          </div>
          <input
            type='range'
            min={-100}
            max={50}
            step={10}
            value={inputs.inventoryShockPct}
            onChange={(e) => updateField('inventoryShockPct', Number(e.target.value))}
            className='w-full accent-primary h-1 bg-border rounded-lg cursor-pointer'
          />
          <span className='text-[9px] text-muted-foreground block'>Warehouse physical stock coupling</span>
        </div>

        {/* Creative Fatigue Days Slider */}
        <div className='rounded-lg border border-border/60 bg-muted/10 p-3 space-y-1.5'>
          <div className='flex justify-between items-center text-[10px] font-bold uppercase'>
            <span className='text-muted-foreground'>Creative Wearout Age</span>
            <span className={cn('font-bold', inputs.creativeFatigueDays > 7 ? 'text-rose-500' : 'text-foreground')}>
              {inputs.creativeFatigueDays} Days
            </span>
          </div>
          <input
            type='range'
            min={0}
            max={30}
            step={1}
            value={inputs.creativeFatigueDays}
            onChange={(e) => updateField('creativeFatigueDays', Number(e.target.value))}
            className='w-full accent-primary h-1 bg-border rounded-lg cursor-pointer'
          />
          <span className='text-[9px] text-muted-foreground block'>Frequency saturation decay factor</span>
        </div>
      </div>
    </div>
  );
}
