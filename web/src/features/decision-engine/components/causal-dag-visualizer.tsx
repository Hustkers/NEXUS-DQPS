'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconGitBranch, IconAlertCircle } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export interface DAGNode {
  id: string;
  label: string;
  category: 'media' | 'traffic' | 'commerce' | 'financial';
  metric: string;
  status: 'healthy' | 'at_risk' | 'critical';
  x: number;
  y: number;
}

export function CausalDagVisualizer({ activeAnomaly = true }: { activeAnomaly?: boolean }) {
  const [selectedNode, setSelectedNode] = useState<string | null>('orders');

  const nodes: DAGNode[] = [
    { id: 'spend', label: 'Media Spend', category: 'media', metric: '$1,900 / day', status: 'healthy', x: 40, y: 80 },
    { id: 'cpm', label: 'Platform CPM', category: 'media', metric: '$14.20', status: 'healthy', x: 40, y: 220 },
    { id: 'impressions', label: 'Impressions', category: 'traffic', metric: '133.8k', status: 'healthy', x: 200, y: 150 },
    { id: 'clicks', label: 'Ad Clicks', category: 'traffic', metric: '3,210', status: 'healthy', x: 360, y: 150 },
    { id: 'inventory', label: 'Shopify Stock', category: 'commerce', metric: activeAnomaly ? '0 Units (Stockout)' : '500 Units', status: activeAnomaly ? 'critical' : 'healthy', x: 480, y: 50 },
    { id: 'orders', label: 'Storefront Orders', category: 'commerce', metric: activeAnomaly ? '0 Orders' : '98 Orders', status: activeAnomaly ? 'critical' : 'healthy', x: 520, y: 180 },
    { id: 'margin', label: 'Net Margin (NCM)', category: 'financial', metric: activeAnomaly ? '-$500 Loss' : '+$2,508 / day', status: activeAnomaly ? 'critical' : 'healthy', x: 680, y: 180 },
  ];

  const edges = [
    { from: 'spend', to: 'impressions', critical: false },
    { from: 'cpm', to: 'impressions', critical: false },
    { from: 'impressions', to: 'clicks', critical: false },
    { from: 'clicks', to: 'orders', critical: false },
    { from: 'inventory', to: 'orders', critical: activeAnomaly },
    { from: 'orders', to: 'margin', critical: activeAnomaly },
    { from: 'spend', to: 'margin', critical: activeAnomaly },
  ];

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <Card className="p-5 border-border/40 bg-card/60 backdrop-blur-md relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <IconGitBranch className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
              Structural Causal DAG & Counterfactual Attribution Path
              {activeAnomaly && (
                <Badge variant="destructive" className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-[10px] animate-pulse">
                  Anomaly Path Active
                </Badge>
              )}
            </h3>
            <p className="text-xs text-muted-foreground">
              DoWhy-GCM Counterfactual Attribution Flow: Spend → Clicks → Shopify Inventory Gate → Net Margin
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" /> Healthy Flow
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" /> Bottleneck / Stockout Path
          </span>
        </div>
      </div>

      <div className="w-full h-72 border border-border/30 rounded-xl bg-background/50 relative overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full absolute inset-0 pointer-events-none">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
            </marker>
            <marker id="arrow-crit" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
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
                stroke={e.critical ? '#f43f5e' : '#334155'}
                strokeWidth={e.critical ? 2.5 : 1.5}
                strokeDasharray={e.critical ? '4 2' : undefined}
                className={e.critical ? 'animate-pulse' : ''}
                markerEnd={e.critical ? 'url(#arrow-crit)' : 'url(#arrow)'}
              />
            );
          })}
        </svg>

        {nodes.map((node) => (
          <div
            key={node.id}
            onClick={() => setSelectedNode(node.id)}
            style={{ left: `${node.x}px`, top: `${node.y}px` }}
            className={cn(
              'absolute w-36 px-3 py-2 rounded-lg border text-left cursor-pointer transition-all duration-200 backdrop-blur-sm select-none',
              node.status === 'critical'
                ? 'bg-rose-950/40 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.3)] ring-1 ring-rose-500/40'
                : 'bg-card/90 border-border/60 hover:border-border hover:shadow-md',
              selectedNode === node.id && 'ring-2 ring-indigo-500/50'
            )}
          >
            <div className="flex items-center justify-between text-[11px] font-medium">
              <span className={node.status === 'critical' ? 'text-rose-300' : 'text-foreground'}>
                {node.label}
              </span>
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  node.status === 'critical' ? 'bg-rose-500 shadow-[0_0_6px_#f43f5e]' : 'bg-emerald-400'
                )}
              />
            </div>
            <div className="text-[12px] font-mono font-semibold mt-0.5 text-muted-foreground truncate">
              {node.metric}
            </div>
          </div>
        ))}
      </div>

      {selectedNode === 'orders' && activeAnomaly && (
        <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconAlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span className="text-rose-300">
              <strong>Counterfactual Structural Intervention:</strong> Orders node conditioned on physical stockout: Q = min(0, page_views &times; cvr) = 0. Ad spend continues burning with $0 conversions.
            </span>
          </div>
          <Badge className="bg-rose-500 text-white shrink-0">66% Shapley Share</Badge>
        </div>
      )}
    </Card>
  );
}
