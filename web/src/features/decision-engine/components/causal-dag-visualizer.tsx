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
    { id: 'spend', label: 'Meta Ad Spend', metric: '₹4,200/d', status: 'nominal', x: 20, y: 110 },
    { id: 'impressions', label: 'Impressions', metric: '312k', status: 'nominal', x: 190, y: 35 },
    { id: 'clicks', label: 'Clicks (CTR 1.8%)', metric: '5,616', status: 'nominal', x: 190, y: 185 },
    { id: 'inventory', label: 'Shopify Stock Gate', metric: activeAnomaly ? '0 units' : '420 units', status: activeAnomaly ? 'critical' : 'nominal', x: 380, y: 35 },
    { id: 'cvr', label: 'Conversion Rate', metric: activeAnomaly ? '0.12% (down 94%)' : '2.8%', status: activeAnomaly ? 'critical' : 'nominal', x: 380, y: 185 },
    { id: 'orders', label: 'Net Orders', metric: activeAnomaly ? '7 units' : '157 units', status: activeAnomaly ? 'critical' : 'nominal', x: 570, y: 110 },
    { id: 'profit', label: 'Net Margin (POAS)', metric: activeAnomaly ? '-₹3,008' : '+₹5,140', status: activeAnomaly ? 'critical' : 'nominal', x: 750, y: 110 },
  ];

  const edges: DagEdge[] = [
    { from: 'spend', to: 'impressions' },
    { from: 'spend', to: 'clicks' },
    { from: 'impressions', to: 'clicks' },
    { from: 'clicks', to: 'inventory', critical: activeAnomaly },
    { from: 'clicks', to: 'cvr', critical: activeAnomaly },
    { from: 'inventory', to: 'cvr', critical: activeAnomaly },
    { from: 'cvr', to: 'orders', critical: activeAnomaly },
    { from: 'orders', to: 'profit', critical: activeAnomaly },
  ];

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <Card className="p-5 border border-border bg-card shadow-none rounded text-card-foreground relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded bg-muted/60 flex items-center justify-center border border-border">
            <IconGitBranch className="h-4 w-4 text-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2 font-mono">
              Structural Causal DAG &amp; Counterfactual Attribution Path
              {activeAnomaly && (
                <Badge variant="outline" className="bg-foreground text-background border-none font-bold text-[10px] font-mono">
                  [CRITICAL] Anomaly Path Active
                </Badge>
              )}
            </h3>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              DoWhy-GCM Counterfactual Attribution Flow: Spend → Clicks → Shopify Inventory Gate → Net Margin
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-foreground" /> Healthy Flow
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full border border-border bg-muted" /> Bottleneck Path
          </span>
        </div>
      </div>

      <div className="w-full h-72 border border-border rounded bg-muted/30 relative overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full absolute inset-0 pointer-events-none">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-muted-foreground" />
            </marker>
            <marker id="arrow-crit" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-foreground" />
            </marker>
          </defs>

          {edges.map((e, idx) => {
            const src = nodeMap.get(e.from)!;
            const dst = nodeMap.get(e.to)!;
            return (
              <line
                key={idx}
                x1={src.x + 50}
                y1={src.y + 20}
                x2={dst.x + 50}
                y2={dst.y + 20}
                className={e.critical ? 'stroke-foreground' : 'stroke-muted-foreground/50'}
                strokeWidth={e.critical ? 2 : 1.5}
                strokeDasharray={e.critical ? '4 4' : undefined}
                markerEnd={e.critical ? 'url(#arrow-crit)' : 'url(#arrow)'}
              />
            );
          })}
        </svg>

        {nodes.map((node) => {
          const isCritical = node.status === 'critical';
          const isSelected = selectedNode === node.id;
          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node.id)}
              style={{ left: `${node.x}px`, top: `${node.y}px` }}
              className={cn(
                'absolute w-36 px-3 py-2 rounded border text-left cursor-pointer transition-all duration-200 select-none font-mono',
                isCritical
                  ? 'bg-foreground text-background border-none font-bold shadow-md'
                  : 'bg-card border-border text-foreground hover:border-foreground/50',
                isSelected && (isCritical ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background' : 'ring-1 ring-foreground')
              )}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className={isCritical ? 'text-background' : 'text-foreground'}>
                  {node.label}
                </span>
                <span className={cn('text-[10px]', isCritical ? 'text-background' : 'text-foreground')}>
                  {isCritical ? '■' : '●'}
                </span>
              </div>
              <div className={cn('text-[11px] font-mono mt-0.5 truncate', isCritical ? 'text-background font-bold' : 'text-muted-foreground')}>
                {node.metric}
              </div>
            </div>
          );
        })}
      </div>

      {selectedNode === 'orders' && activeAnomaly && (
        <div className="mt-3 p-3 rounded bg-muted/40 border border-border text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconAlertCircle className="h-4 w-4 text-foreground shrink-0" />
            <span className="text-foreground">
              <strong>Counterfactual Structural Intervention:</strong> Orders node conditioned on physical stockout: Q = min(0, page_views &times; cvr) = 0. Ad spend continues burning with ₹0 conversions.
            </span>
          </div>
          <Badge className="bg-foreground text-background border-none font-bold shrink-0 ml-3">66% Shapley Share</Badge>
        </div>
      )}
    </Card>
  );
}
