'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconGitBranch, IconAlertCircle } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface DagNode {
  id: string;
  label: string;
  metric: string;
  status: 'nominal' | 'critical' | 'warning';
  detail: string;
  x: number;
  y: number;
}

interface DagEdge {
  from: string;
  to: string;
  critical?: boolean;
}

interface CausalDagVisualizerProps {
  activeAnomaly?: boolean;
}

export function CausalDagVisualizer({ activeAnomaly = false }: CausalDagVisualizerProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>('orders');

  const nodes: DagNode[] = [
    {
      id: 'spend',
      label: 'Spend',
      metric: '₹4,200/d',
      status: 'nominal',
      detail: 'Daily budget allocated to campaign. Steady-state burn across ad networks.',
      x: 20,
      y: 90
    },
    {
      id: 'clicks',
      label: 'Clicks',
      metric: '5,616 (1.8% CTR)',
      status: 'nominal',
      detail: 'Ad creative click-through volume. Stable traffic inbound to catalog landing page.',
      x: 160,
      y: 90
    },
    {
      id: 'conversion',
      label: 'Conversion',
      metric: activeAnomaly ? '0.12% (-94%)' : '2.8% CVR',
      status: activeAnomaly ? 'critical' : 'nominal',
      detail: activeAnomaly
        ? 'Conversion collapsed by -94% due to physical warehouse stock depletion.'
        : 'Nominal checkout conversion matching 30d baseline benchmark.',
      x: 310,
      y: 40
    },
    {
      id: 'inventory',
      label: 'Inventory',
      metric: activeAnomaly ? '0 units' : '420 units',
      status: activeAnomaly ? 'critical' : 'nominal',
      detail: activeAnomaly
        ? 'Stock depletion gate: Zero purchasable inventory available in distribution center.'
        : 'In-stock inventory healthy with 24 days buffer.',
      x: 310,
      y: 140
    },
    {
      id: 'orders',
      label: 'Orders',
      metric: activeAnomaly ? '7 units' : '157 units',
      status: activeAnomaly ? 'critical' : 'nominal',
      detail: activeAnomaly
        ? 'Severe order shortfall (-96% volume). Budget burning without fulfilled orders.'
        : 'Consistent order velocity meeting daily target volume.',
      x: 470,
      y: 90
    },
    {
      id: 'margin',
      label: 'Margin',
      metric: activeAnomaly ? '-₹3,008' : '+₹5,140',
      status: activeAnomaly ? 'critical' : 'nominal',
      detail: activeAnomaly
        ? 'Net daily margin deficit: -₹3,008 observed loss attributable to stockout waste.'
        : 'Positive net contribution margin yield: +₹5,140/day.',
      x: 620,
      y: 90
    },
  ];

  const edges: DagEdge[] = [
    { from: 'spend', to: 'clicks' },
    { from: 'clicks', to: 'conversion', critical: activeAnomaly },
    { from: 'clicks', to: 'inventory', critical: activeAnomaly },
    { from: 'inventory', to: 'conversion', critical: activeAnomaly },
    { from: 'conversion', to: 'orders', critical: activeAnomaly },
    { from: 'orders', to: 'margin', critical: activeAnomaly },
  ];

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const activeNodeData = nodes.find((n) => n.id === selectedNode);

  return (
    <Card className='p-4 sm:p-5 border border-border bg-card shadow-none rounded-xl text-card-foreground relative overflow-hidden min-w-0 max-w-full font-mono space-y-3.5'>
      {/* Header Bar */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3'>
        <div className='flex items-center gap-2'>
          <IconGitBranch className='size-4 text-primary' />
          <h3 className='text-xs font-bold text-foreground uppercase tracking-wider'>
            Causal DAG Attribution
          </h3>
          {activeAnomaly && (
            <Badge variant='outline' className='bg-rose-500/10 text-rose-500 border-rose-500/30 font-bold text-[10px]'>
              Anomaly Path
            </Badge>
          )}
        </div>

        <div className='flex items-center gap-3 text-[11px] text-muted-foreground'>
          <span className='flex items-center gap-1.5'>
            <span className='size-2 rounded-full bg-foreground' /> Nominal
          </span>
          <span className='flex items-center gap-1.5'>
            <span className='size-2 rounded-full bg-rose-500' /> Bottleneck
          </span>
        </div>
      </div>

      {/* SVG DAG Canvas */}
      <div className='w-full h-56 border border-border/70 rounded-lg bg-muted/20 relative overflow-x-auto overflow-y-hidden'>
        <div className='min-w-[760px] w-full h-full relative'>
          <svg className='w-full h-full absolute inset-0 pointer-events-none'>
            <defs>
              <marker id='dag-arrow' viewBox='0 0 10 10' refX='20' refY='5' markerWidth='5' markerHeight='5' orient='auto-start-reverse'>
                <path d='M 0 0 L 10 5 L 0 10 z' className='fill-muted-foreground/60' />
              </marker>
              <marker id='dag-arrow-crit' viewBox='0 0 10 10' refX='20' refY='5' markerWidth='5' markerHeight='5' orient='auto-start-reverse'>
                <path d='M 0 0 L 10 5 L 0 10 z' className='fill-rose-500' />
              </marker>
            </defs>

            {edges.map((e, idx) => {
              const src = nodeMap.get(e.from)!;
              const dst = nodeMap.get(e.to)!;
              return (
                <line
                  key={idx}
                  x1={src.x + 55}
                  y1={src.y + 18}
                  x2={dst.x + 55}
                  y2={dst.y + 18}
                  className={e.critical ? 'stroke-rose-500' : 'stroke-muted-foreground/40'}
                  strokeWidth={e.critical ? 2 : 1.5}
                  strokeDasharray={e.critical ? '3 3' : undefined}
                  markerEnd={e.critical ? 'url(#dag-arrow-crit)' : 'url(#dag-arrow)'}
                />
              );
            })}
          </svg>

          {nodes.map((node) => {
            const isCritical = node.status === 'critical';
            const isSelected = selectedNode === node.id;
            return (
              <button
                key={node.id}
                type='button'
                onClick={() => setSelectedNode(node.id)}
                style={{ left: `${node.x}px`, top: `${node.y}px` }}
                className={cn(
                  'absolute w-28 px-2.5 py-1.5 rounded-lg border text-left cursor-pointer transition-all duration-150 select-none font-mono',
                  isCritical
                    ? 'bg-rose-950/40 border-rose-500/60 text-foreground font-bold shadow-xs'
                    : 'bg-card border-border text-foreground hover:border-foreground/50',
                  isSelected && (isCritical ? 'ring-2 ring-rose-500' : 'ring-1 ring-foreground')
                )}
              >
                <div className='flex items-center justify-between text-[10px] font-bold uppercase'>
                  <span className={isCritical ? 'text-rose-400' : 'text-foreground'}>
                    {node.label}
                  </span>
                  <span className={isCritical ? 'text-rose-500' : 'text-muted-foreground'}>
                    {isCritical ? '■' : '●'}
                  </span>
                </div>
                <div className={cn('text-[10px] font-mono mt-0.5 truncate', isCritical ? 'text-rose-300 font-bold' : 'text-muted-foreground')}>
                  {node.metric}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Node Compact Detail Strip */}
      {activeNodeData && (
        <div className='p-2.5 rounded-lg bg-muted/30 border border-border/70 text-xs flex flex-wrap items-center justify-between gap-2'>
          <div className='flex items-center gap-2 min-w-0'>
            <IconAlertCircle className={cn('size-3.5 shrink-0', activeNodeData.status === 'critical' ? 'text-rose-500' : 'text-foreground')} />
            <span className='font-bold text-foreground uppercase'>{activeNodeData.label}:</span>
            <span className='text-muted-foreground truncate'>{activeNodeData.detail}</span>
          </div>
          <span className={cn('font-bold shrink-0 text-[11px]', activeNodeData.status === 'critical' ? 'text-rose-400' : 'text-emerald-400')}>
            {activeNodeData.metric}
          </span>
        </div>
      )}
    </Card>
  );
}
