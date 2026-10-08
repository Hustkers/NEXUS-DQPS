'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { RangeSlider } from '@/components/ui/slider';
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
        totalBudget: 220000,
        riskTolerance: 'aggressive',
        explorationBudgetPct: 20
      });
    } else if (preset === 'CONSERVATIVE_GROWTH') {
      onChangeInputs({
        ...inputs,
        totalBudget: 95000,
        riskTolerance: 'conservative',
        explorationBudgetPct: 5
      });
    }
  };

  return (
    <div className={cn('rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 font-mono shadow-none space-y-4', className)}>
      <div className='flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3'>
        <div className='flex items-center gap-2'>
          <Icons.sliders className='size-3.5 text-zinc-500' />
          <h3 className='text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100'>
            What-If Scenario Simulation Parameters
          </h3>
        </div>
        <Button
          size='sm'
          variant='outline'
          onClick={onResetDefaults}
          className='h-7 text-[11px] border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
        >
          <Icons.clock className='mr-1 size-3' />
          Reset Baseline
        </Button>
      </div>

      {/* Preset Scenario Buttons */}
      <div className='space-y-1.5'>
        <div className='text-[10px] text-zinc-500 uppercase font-semibold tracking-wider'>
          Scenario Presets
        </div>
        <div className='flex flex-wrap gap-1.5'>
          {[
            { id: 'NORMAL', label: 'Baseline' },
            { id: 'HIGH_DEMAND', label: 'Demand Surge' },
            { id: 'LOW_INVENTORY', label: 'Stockout Pressure' },
            { id: 'CPC_SPIKE', label: 'Auction CPM Spike (+45%)' },
            { id: 'CREATIVE_FATIGUE', label: 'Ad Fatigue' },
            { id: 'HIGH_MARGIN', label: 'High Margin (+12%)' },
            { id: 'AGGRESSIVE_GROWTH', label: 'Aggressive ($220k)' },
            { id: 'CONSERVATIVE_GROWTH', label: 'Conservative ($95k)' }
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              className='px-2.5 py-1 rounded text-[10px] font-medium border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors'
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Variable Sliders */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1 text-xs'>
        {/* Total Budget Slider */}
        <div className='rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-3 space-y-1.5'>
          <div className='flex justify-between items-center text-[10px] font-semibold uppercase'>
            <span className='text-zinc-500'>Total Cycle Spend</span>
            <span className='text-zinc-900 dark:text-zinc-100 font-mono font-bold'>
              ${inputs.totalBudget.toLocaleString('en-US')}
            </span>
          </div>
          <RangeSlider
            min={40000}
            max={350000}
            step={5000}
            value={inputs.totalBudget}
            onChange={(e) => updateField('totalBudget', Number(e.target.value))}
            activeColor='#10b981'
          />
          <span className='text-[9px] text-zinc-500 font-mono block'>Operating range: $40k to $350k</span>
        </div>

        {/* Expected CPC Shift Slider */}
        <div className='rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-3 space-y-1.5'>
          <div className='flex justify-between items-center text-[10px] font-semibold uppercase'>
            <span className='text-zinc-500'>Auction CPC Shift</span>
            <span className={cn('font-mono font-bold', inputs.cpcShiftPct > 0 ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-600')}>
              {inputs.cpcShiftPct > 0 ? '+' : ''}{inputs.cpcShiftPct}%
            </span>
          </div>
          <RangeSlider
            min={-40}
            max={80}
            step={5}
            value={inputs.cpcShiftPct}
            onChange={(e) => updateField('cpcShiftPct', Number(e.target.value))}
            activeColor='#f59e0b'
          />
          <span className='text-[9px] text-zinc-500 block'>Auction bid competition</span>
        </div>

        {/* Conversion Rate Shift Slider */}
        <div className='rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-3 space-y-1.5'>
          <div className='flex justify-between items-center text-[10px] font-semibold uppercase'>
            <span className='text-zinc-500'>Conversion Rate (CVR)</span>
            <span className='font-mono font-bold text-zinc-900 dark:text-zinc-100'>
              {inputs.cvrShiftPct > 0 ? '+' : ''}{inputs.cvrShiftPct}%
            </span>
          </div>
          <RangeSlider
            min={-50}
            max={50}
            step={5}
            value={inputs.cvrShiftPct}
            onChange={(e) => updateField('cvrShiftPct', Number(e.target.value))}
            activeColor='#10b981'
          />
          <span className='text-[9px] text-zinc-500 block'>Shopper checkout elasticity</span>
        </div>

        {/* Gross Margin Shift Slider */}
        <div className='rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-3 space-y-1.5'>
          <div className='flex justify-between items-center text-[10px] font-semibold uppercase'>
            <span className='text-zinc-500'>Gross Margin Shift</span>
            <span className='font-mono font-bold text-zinc-900 dark:text-zinc-100'>
              {inputs.grossMarginShiftPct > 0 ? '+' : ''}{inputs.grossMarginShiftPct}%
            </span>
          </div>
          <RangeSlider
            min={-20}
            max={20}
            step={2}
            value={inputs.grossMarginShiftPct}
            onChange={(e) => updateField('grossMarginShiftPct', Number(e.target.value))}
            activeColor='#06b6d4'
          />
          <span className='text-[9px] text-zinc-500 block'>ERP unit COGS perturbation</span>
        </div>

        {/* Inventory Shock Slider */}
        <div className='rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-3 space-y-1.5'>
          <div className='flex justify-between items-center text-[10px] font-semibold uppercase'>
            <span className='text-zinc-500'>Inventory Shock</span>
            <span className='font-mono font-bold text-zinc-900 dark:text-zinc-100'>
              {inputs.inventoryShockPct > 0 ? '+' : ''}{inputs.inventoryShockPct}%
            </span>
          </div>
          <RangeSlider
            min={-100}
            max={50}
            step={10}
            value={inputs.inventoryShockPct}
            onChange={(e) => updateField('inventoryShockPct', Number(e.target.value))}
            activeColor='#f97316'
          />
          <span className='text-[9px] text-zinc-500 block'>Warehouse buffer perturbation</span>
        </div>

        {/* Creative Fatigue Days Slider */}
        <div className='rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-3 space-y-1.5'>
          <div className='flex justify-between items-center text-[10px] font-semibold uppercase'>
            <span className='text-zinc-500'>Creative Wearout Age</span>
            <span className='font-mono font-bold text-zinc-900 dark:text-zinc-100'>
              {inputs.creativeFatigueDays} Days
            </span>
          </div>
          <RangeSlider
            min={0}
            max={30}
            step={1}
            value={inputs.creativeFatigueDays}
            onChange={(e) => updateField('creativeFatigueDays', Number(e.target.value))}
            activeColor='#a855f7'
          />
          <span className='text-[9px] text-zinc-500 block'>Adstock wearout decay</span>
        </div>
      </div>
    </div>
  );
}
