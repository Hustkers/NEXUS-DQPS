'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  IconGitBranch,
  IconAlertCircle,
  IconCoins,
  IconPointer,
  IconShoppingCart,
  IconPackage,
  IconReceipt,
  IconTrendingUp
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface DagNode {
  id: string;
  stageNum: string;
  label: string;
  metricName: string;
  primaryValue: string;
  secondaryMetric: string;
  status: 'nominal' | 'critical' | 'warning';
  detail: string;
  icon: React.ElementType;
  x: number;
  y: number;
  isSideBranch?: boolean;
}

interface CausalDagVisualizerProps {
  activeAnomaly?: boolean;
}

export function CausalDagVisualizer({ activeAnomaly = false }: CausalDagVisualizerProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>('orders');

  const nodes: DagNode[] = [
    {
      id: 'spend',
      stageNum: '01 · SPEND',
      label: 'Ad Spend',
      metricName: 'Daily Budget Burn',
      primaryValue: '₹4,200/d',
      secondaryMetric: 'Steady-State Burn',
      status: 'nominal',
      detail: 'Daily budget allocated to campaign. Steady-state burn across connected ad networks.',
      icon: IconCoins,
      x: 90,
      y: 20
    },
    {
      id: 'clicks',
      stageNum: '02 · CLICKS',
      label: 'Clicks',
      metricName: 'Traffic Volume',
      primaryValue: '5,616',
      secondaryMetric: '1.80% CTR Benchmark',
      status: 'nominal',
      detail: 'Ad creative click-through volume. Stable inbound traffic to footwear product landing page.',
      icon: IconPointer,
      x: 90,
      y: 124
    },
    {
      id: 'inventory',
      stageNum: 'SIDE · INVENTORY',
      label: 'Inventory',
      metricName: 'Warehouse Buffer',
      primaryValue: activeAnomaly ? '0 units' : '420 units',
      secondaryMetric: activeAnomaly ? 'Depleted (Out of Stock)' : '24 days runway',
      status: activeAnomaly ? 'critical' : 'nominal',
      detail: activeAnomaly
        ? 'Stock depletion gate: Zero purchasable inventory available in distribution center.'
        : 'In-stock inventory healthy with 24 days fulfillment buffer.',
      icon: IconPackage,
      x: 390,
      y: 172,
      isSideBranch: true
    },
    {
      id: 'conversion',
      stageNum: '03 · CONVERSION',
      label: 'Conversion',
      metricName: 'Checkout CVR',
      primaryValue: activeAnomaly ? '0.12%' : '2.80%',
      secondaryMetric: activeAnomaly ? '-94% Anomaly Drop' : 'Nominal Benchmark',
      status: activeAnomaly ? 'critical' : 'nominal',
      detail: activeAnomaly
        ? 'Conversion collapsed by -94% due to physical warehouse stock depletion.'
        : 'Nominal checkout conversion matching 30d baseline benchmark.',
      icon: IconShoppingCart,
      x: 90,
      y: 244
    },
    {
      id: 'orders',
      stageNum: '04 · ORDERS',
      label: 'Orders',
      metricName: 'Fulfilled Units',
      primaryValue: activeAnomaly ? '7 units' : '157 units',
      secondaryMetric: activeAnomaly ? '-96% Order Shortfall' : 'Target Met (100%)',
      status: activeAnomaly ? 'critical' : 'nominal',
      detail: activeAnomaly
        ? 'Severe order shortfall (-96% volume). Ad budget burning with zero fulfilled units.'
        : 'Consistent order velocity meeting daily target sales volume.',
      icon: IconReceipt,
      x: 90,
      y: 348
    },
    {
      id: 'margin',
      stageNum: '05 · MARGIN',
      label: 'Margin',
      metricName: 'Net Daily Yield',
      primaryValue: activeAnomaly ? '-₹3,008' : '+₹5,140',
      secondaryMetric: activeAnomaly ? 'Deficit Loss Burn' : '+41% Margin Yield',
      status: activeAnomaly ? 'critical' : 'nominal',
      detail: activeAnomaly
        ? 'Net daily margin deficit: -₹3,008 observed loss attributable to stockout ad burn.'
        : 'Positive net contribution margin yield: +₹5,140/day.',
      icon: IconTrendingUp,
      x: 90,
      y: 452
    }
  ];

  const activeNodeData = nodes.find((n) => n.id === selectedNode);

  return (
    <Card className='p-4 sm:p-5 border border-slate-800/80 bg-[#0B101B] shadow-lg rounded-xl text-card-foreground relative overflow-hidden min-w-0 max-w-full space-y-4'>
      {/* Header Bar */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/70 pb-3'>
        <div className='flex items-center gap-2.5'>
          <div className='size-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400'>
            <IconGitBranch className='size-4' />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h3 className='text-xs font-semibold text-slate-100 uppercase tracking-wider'>
                Causal DAG Attribution
              </h3>
              {activeAnomaly ? (
                <Badge variant='outline' className='bg-rose-500/10 text-rose-400 border-rose-500/30 text-[10px] font-semibold px-2 py-0.5 animate-pulse'>
                  Stockout Bottleneck Detected
                </Badge>
              ) : (
                <Badge variant='outline' className='bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-medium px-2 py-0.5'>
                  Equilibrium Path
                </Badge>
              )}
            </div>
            <p className='text-[11px] text-slate-400'>
              Directed acyclic attribution modeling downstream conversion yield and inventory stockout gates
            </p>
          </div>
        </div>

        <div className='flex items-center gap-4 text-[11px] text-slate-400'>
          <span className='flex items-center gap-1.5'>
            <span className='size-2 rounded-full bg-emerald-400/90' /> Primary Causal Spine
          </span>
          <span className='flex items-center gap-1.5'>
            <span className='size-2 rounded-full bg-indigo-400/80' /> Branch Constraint
          </span>
          {activeAnomaly && (
            <span className='flex items-center gap-1.5 text-rose-400 font-medium'>
              <span className='size-2 rounded-full bg-rose-500 animate-ping' /> Bottleneck Cascade
            </span>
          )}
        </div>
      </div>

      {/* SVG & Node Flow Canvas */}
      <div className='w-full min-h-[550px] border border-slate-800/80 rounded-xl bg-[#070B13] relative overflow-x-auto overflow-y-hidden select-none'>
        <div className='w-[660px] h-[540px] mx-auto relative'>
          {/* SVG Dotted Grid & Curved Cubic-Bezier Connectors */}
          <svg className='w-full h-full absolute inset-0 pointer-events-none'>
            <defs>
              {/* Subtle Dotted Background Pattern */}
              <pattern id='causal-dots' x='0' y='0' width='20' height='20' patternUnits='userSpaceOnUse'>
                <circle cx='2' cy='2' r='1' fill='#475569' fillOpacity='0.25' />
              </pattern>

              {/* Enhanced Directional Arrow Markers */}
              <marker id='arrow-primary' viewBox='0 0 12 12' refX='9' refY='6' markerWidth='6' markerHeight='6' orient='auto'>
                <path d='M 1 2 L 10 6 L 1 10 z' fill='#38BDF8' />
              </marker>
              <marker id='arrow-secondary' viewBox='0 0 12 12' refX='9' refY='6' markerWidth='5' markerHeight='5' orient='auto'>
                <path d='M 1 2 L 10 6 L 1 10 z' fill='#818CF8' />
              </marker>
              <marker id='arrow-critical' viewBox='0 0 12 12' refX='9' refY='6' markerWidth='7' markerHeight='7' orient='auto'>
                <path d='M 1 2 L 10 6 L 1 10 z' fill='#F43F5E' />
              </marker>

              {/* Radial gradient glow for bottleneck indicator */}
              <radialGradient id='bottleneck-glow' cx='50%' cy='50%' r='50%'>
                <stop offset='0%' stopColor='#F43F5E' stopOpacity='0.3' />
                <stop offset='100%' stopColor='#F43F5E' stopOpacity='0' />
              </radialGradient>
            </defs>

            {/* Dotted Grid Background */}
            <rect width='100%' height='100%' fill='url(#causal-dots)' />

            {/* Bottleneck Aura on Inventory when Active */}
            {activeAnomaly && (
              <circle cx='500' cy='204' r='140' fill='url(#bottleneck-glow)' />
            )}

            {/* 1. Primary Connector: SPEND (200, 88) -> CLICKS (200, 124) */}
            <path
              d='M 200 88 C 200 100, 200 112, 200 120'
              fill='none'
              stroke='#38BDF8'
              strokeWidth='2.5'
              strokeLinecap='round'
              markerEnd='url(#arrow-primary)'
            />

            {/* 2. Primary Spine Connector: CLICKS (200, 192) -> CONVERSION (200, 244) */}
            <path
              d='M 200 192 C 200 208, 200 226, 200 240'
              fill='none'
              stroke={activeAnomaly ? '#F43F5E' : '#38BDF8'}
              strokeWidth={activeAnomaly ? '3' : '2.5'}
              strokeDasharray={activeAnomaly ? '5 3' : undefined}
              className={activeAnomaly ? 'animate-pulse' : undefined}
              strokeLinecap='round'
              markerEnd={activeAnomaly ? 'url(#arrow-critical)' : 'url(#arrow-primary)'}
            />

            {/* 3. Secondary Branch Connector: CLICKS (310, 156) -> INVENTORY (390, 204) */}
            <path
              d='M 310 156 C 352 156, 350 204, 386 204'
              fill='none'
              stroke={activeAnomaly ? '#F43F5E' : '#818CF8'}
              strokeWidth={activeAnomaly ? '2.5' : '1.5'}
              strokeDasharray='4 4'
              className={activeAnomaly ? 'animate-pulse' : undefined}
              strokeLinecap='round'
              markerEnd={activeAnomaly ? 'url(#arrow-critical)' : 'url(#arrow-secondary)'}
            />

            {/* 4. Secondary Return Branch Connector: INVENTORY (390, 220) -> CONVERSION (310, 276) */}
            <path
              d='M 390 220 C 348 220, 352 276, 314 276'
              fill='none'
              stroke={activeAnomaly ? '#F43F5E' : '#818CF8'}
              strokeWidth={activeAnomaly ? '3' : '1.5'}
              strokeDasharray={activeAnomaly ? '6 3' : '4 4'}
              className={activeAnomaly ? 'animate-pulse' : undefined}
              strokeLinecap='round'
              markerEnd={activeAnomaly ? 'url(#arrow-critical)' : 'url(#arrow-secondary)'}
            />

            {/* 5. Primary Spine Connector: CONVERSION (200, 312) -> ORDERS (200, 348) */}
            <path
              d='M 200 312 C 200 324, 200 334, 200 344'
              fill='none'
              stroke={activeAnomaly ? '#F43F5E' : '#38BDF8'}
              strokeWidth={activeAnomaly ? '2.5' : '2.5'}
              strokeDasharray={activeAnomaly ? '5 3' : undefined}
              strokeLinecap='round'
              markerEnd={activeAnomaly ? 'url(#arrow-critical)' : 'url(#arrow-primary)'}
            />

            {/* 6. Primary Spine Connector: ORDERS (200, 416) -> MARGIN (200, 452) */}
            <path
              d='M 200 416 C 200 428, 200 438, 200 448'
              fill='none'
              stroke={activeAnomaly ? '#F43F5E' : '#38BDF8'}
              strokeWidth={activeAnomaly ? '2.5' : '2.5'}
              strokeDasharray={activeAnomaly ? '5 3' : undefined}
              strokeLinecap='round'
              markerEnd={activeAnomaly ? 'url(#arrow-critical)' : 'url(#arrow-primary)'}
            />
          </svg>

          {/* Interactive Node Cards */}
          {nodes.map((node) => {
            const isCritical = node.status === 'critical';
            const isSelected = selectedNode === node.id;
            const IconComponent = node.icon;

            return (
              <button
                key={node.id}
                type='button'
                onClick={() => setSelectedNode(node.id)}
                style={{ left: `${node.x}px`, top: `${node.y}px` }}
                className={cn(
                  'absolute w-[220px] p-3 rounded-xl border text-left cursor-pointer transition-all duration-150',
                  'bg-[#0F1626]/95 backdrop-blur-sm shadow-md',
                  isCritical
                    ? 'border-rose-500 shadow-rose-950/50 ring-2 ring-rose-500/80 scale-[1.02]'
                    : node.isSideBranch
                    ? 'border-indigo-800/70 hover:border-indigo-600/80'
                    : 'border-slate-800/90 hover:border-slate-600',
                  isSelected && (isCritical ? 'ring-2 ring-rose-400' : 'ring-2 ring-emerald-500/70 border-emerald-500/50'),
                  node.isSideBranch && 'border-dashed'
                )}
              >
                {/* Top Row: Stage Number & Status Indicator */}
                <div className='flex items-center justify-between text-[10px] font-semibold tracking-wider uppercase mb-1.5'>
                  <span className={cn('text-xs font-bold', isCritical ? 'text-rose-400 font-extrabold' : 'text-slate-400')}>
                    {node.stageNum}
                  </span>
                  <span
                    className={cn(
                      'size-2 rounded-full',
                      isCritical ? 'bg-rose-500 animate-ping' : node.isSideBranch ? 'bg-indigo-400' : 'bg-emerald-400/80'
                    )}
                  />
                </div>

                {/* Main Content Row: Icon + Values */}
                <div className='flex items-center gap-2.5'>
                  <div
                    className={cn(
                      'size-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors',
                      isCritical
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                        : node.isSideBranch
                        ? 'bg-indigo-950/40 border-indigo-700/50 text-indigo-300'
                        : 'bg-slate-800/60 border-slate-700/50 text-slate-300'
                    )}
                  >
                    <IconComponent className='size-4' />
                  </div>

                  <div className='min-w-0 flex-1'>
                    <div className='text-[11px] font-medium text-slate-400 truncate'>
                      {node.metricName}
                    </div>
                    <div
                      className={cn(
                        'text-sm font-semibold font-mono tabular-nums leading-tight truncate',
                        isCritical ? 'text-rose-300 font-bold' : 'text-slate-100'
                      )}
                    >
                      {node.primaryValue}
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Secondary Metric */}
                <div className='mt-1.5 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px]'>
                  <span className={isCritical ? 'text-rose-400 font-medium' : 'text-slate-400'}>
                    {node.secondaryMetric}
                  </span>
                  {node.isSideBranch && (
                    <span className='text-[9px] font-medium text-indigo-400/90 uppercase tracking-tight'>
                      Supply Constraint
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Node Inspection Strip */}
      {activeNodeData && (
        <div className='p-3 rounded-xl bg-[#090D15] border border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-3'>
          <div className='flex items-center gap-2.5 min-w-0 flex-1'>
            <div
              className={cn(
                'size-6 rounded-md flex items-center justify-center shrink-0',
                activeNodeData.status === 'critical'
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              )}
            >
              <IconAlertCircle className='size-3.5' />
            </div>
            <div className='min-w-0'>
              <div className='flex items-center gap-2'>
                <span className='font-semibold text-slate-200 uppercase tracking-wide text-[11px]'>
                  {activeNodeData.stageNum}
                </span>
                <span className='text-slate-500'>•</span>
                <span className='text-slate-400 text-[11px] font-medium'>{activeNodeData.metricName}</span>
              </div>
              <p className='text-slate-400 text-[11px] truncate mt-0.5'>{activeNodeData.detail}</p>
            </div>
          </div>

          <div className='flex items-center gap-2 shrink-0'>
            <span className='text-xs text-slate-400'>Observed:</span>
            <span
              className={cn(
                'font-mono font-semibold text-xs px-2 py-0.5 rounded-md border',
                activeNodeData.status === 'critical'
                  ? 'bg-rose-950/40 text-rose-300 border-rose-500/40'
                  : 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30'
              )}
            >
              {activeNodeData.primaryValue}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
