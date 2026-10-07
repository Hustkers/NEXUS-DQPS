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
    <Card className="p-5 border border-[#8A8A8A] bg-[#1A1A1A] shadow-none rounded text-[#FFFFFF] relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-[#8A8A8A]/40 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded bg-[#000000] flex items-center justify-center border border-[#8A8A8A]">
            <IconGitBranch className="h-4 w-4 text-[#FFFFFF]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#FFFFFF] tracking-tight flex items-center gap-2 font-mono">
              Structural Causal DAG &amp; Counterfactual Attribution Path
              {activeAnomaly && (
                <Badge variant="outline" className="bg-[#FFFFFF] text-[#000000] border-none font-bold text-[10px] font-mono">
                  [CRITICAL] Anomaly Path Active
                </Badge>
              )}
            </h3>
            <p className="text-xs text-[#8A8A8A] font-mono mt-0.5">
              DoWhy-GCM Counterfactual Attribution Flow: Spend → Clicks → Shopify Inventory Gate → Net Margin
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-[#8A8A8A]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#FFFFFF]" /> Healthy Flow
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full border border-[#8A8A8A] bg-[#000000]" /> Bottleneck Path
          </span>
        </div>
      </div>

      <div className="w-full h-72 border border-[#8A8A8A]/40 rounded bg-[#000000] relative overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full absolute inset-0 pointer-events-none">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#8A8A8A" />
            </marker>
            <marker id="arrow-crit" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#FFFFFF" />
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
                stroke={e.critical ? '#FFFFFF' : '#8A8A8A'}
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
                  ? 'bg-[#FFFFFF] text-[#000000] border-none font-bold'
                  : 'bg-[#1A1A1A] border-[#8A8A8A] text-[#FFFFFF] hover:border-[#FFFFFF]',
                isSelected && (isCritical ? 'outline outline-2 outline-[#FFFFFF] ring-2 ring-[#000000]' : 'outline outline-1 outline-[#FFFFFF]')
              )}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className={isCritical ? 'text-[#000000]' : 'text-[#FFFFFF]'}>
                  {node.label}
                </span>
                <span className={cn('text-[10px]', isCritical ? 'text-[#000000]' : 'text-[#FFFFFF]')}>
                  {isCritical ? '■' : '●'}
                </span>
              </div>
              <div className={cn('text-[11px] font-mono mt-0.5 truncate', isCritical ? 'text-[#000000] font-bold' : 'text-[#8A8A8A]')}>
                {node.metric}
              </div>
            </div>
          );
        })}
      </div>

      {selectedNode === 'orders' && activeAnomaly && (
        <div className="mt-3 p-3 rounded bg-[#000000] border border-[#8A8A8A] text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconAlertCircle className="h-4 w-4 text-[#FFFFFF] shrink-0" />
            <span className="text-[#FFFFFF]">
              <strong>Counterfactual Structural Intervention:</strong> Orders node conditioned on physical stockout: Q = min(0, page_views &times; cvr) = 0. Ad spend continues burning with $0 conversions.
            </span>
          </div>
          <Badge className="bg-[#FFFFFF] text-[#000000] border-none font-bold shrink-0 ml-3">66% Shapley Share</Badge>
        </div>
      )}
    </Card>
  );
}
