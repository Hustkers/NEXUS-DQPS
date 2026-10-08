'use client';

import React, { useState } from 'react';
import {
  IconChartLine,
  IconChartBar,
  IconSparkles,
  IconRefresh,
  IconArrowUpRight,
  IconAlertTriangle,
  IconCheck,
} from '@tabler/icons-react';
import {
  AssistantGraphRenderer,
  AssistantGraphConfig,
} from './assistant-graph-renderer';
import { Badge } from '@/components/ui/badge';
import engineState from '@/data/nexus-engine-state.json';

// --- Preset Datasets from Engine Telemetry ---

// 1. 7-Day ROAS Trajectory
const ROAS_TREND_CONFIG: AssistantGraphConfig = {
  title: 'Blended ROAS Trajectory (7-Day Telemetry)',
  subtitle: 'Daily realized return on ad spend vs target efficiency threshold (3.2x)',
  type: 'line',
  allowTypeToggle: true,
  dataKey: 'date',
  data: [
    { date: 'Sep 25', blendedRoas: 11.2, metaRoas: 2.1, googleRoas: 9.8, amazonRoas: 15.4 },
    { date: 'Sep 26', blendedRoas: 12.4, metaRoas: 2.3, googleRoas: 10.2, amazonRoas: 16.1 },
    { date: 'Sep 27', blendedRoas: 10.8, metaRoas: 1.8, googleRoas: 9.9, amazonRoas: 15.0 },
    { date: 'Sep 28', blendedRoas: 13.1, metaRoas: 2.4, googleRoas: 11.4, amazonRoas: 17.2 },
    { date: 'Sep 29', blendedRoas: 12.0, metaRoas: 2.2, googleRoas: 10.5, amazonRoas: 16.0 },
    { date: 'Sep 30', blendedRoas: 9.4, metaRoas: 1.2, googleRoas: 8.9, amazonRoas: 14.8 }, // Stockout drop
    { date: 'Oct 01', blendedRoas: 12.8, metaRoas: 2.8, googleRoas: 11.8, amazonRoas: 17.5 }, // Post-reallocation
  ],
  series: [
    { key: 'blendedRoas', name: 'Blended ROAS', color: '#10b981', strokeWidth: 2.5, formatter: 'multiplier' },
    { key: 'amazonRoas', name: 'Amazon Ads', color: '#f59e0b', strokeWidth: 1.5, strokeDasharray: '3 3', formatter: 'multiplier' },
    { key: 'googleRoas', name: 'Google Ads', color: '#06b6d4', strokeWidth: 1.5, formatter: 'multiplier' },
    { key: 'metaRoas', name: 'Meta Ads', color: '#3b82f6', strokeWidth: 1.5, formatter: 'multiplier' },
  ],
  referenceLine: {
    y: 3.2,
    label: 'Target (3.2x)',
    color: '#f43f5e',
  },
  yAxisFormatter: 'multiplier',
  summaryBadge: {
    label: 'Current Blended',
    value: '12.8x',
    trend: 'up',
  },
};

// 2. Channel Economics: Spend vs Realized Margin (Bar Graph)
const CHANNEL_ECONOMICS_CONFIG: AssistantGraphConfig = {
  title: 'Channel Capital Allocation & Net Margin',
  subtitle: 'Comparative 30D ad spend vs realized operating margin by platform',
  type: 'bar',
  allowTypeToggle: true,
  dataKey: 'platform',
  data: [
    { platform: 'Amazon', spend: 9368308, margin: 95656877, roas: 16.06 },
    { platform: 'Google', spend: 6829444, margin: 45982950, roas: 10.57 },
    { platform: 'Meta', spend: 4931239, margin: 7759349, roas: 2.51 },
    { platform: 'Shopify', spend: 1828398, margin: 26108008, roas: 22.88 },
  ],
  series: [
    { key: 'spend', name: 'Ad Spend', color: '#71717a', formatter: 'currency' },
    { key: 'margin', name: 'Realized Margin', color: '#10b981', formatter: 'currency' },
  ],
  yAxisFormatter: 'currency',
  summaryBadge: {
    label: 'Total Margin',
    value: '$175.5M',
    trend: 'up',
  },
};

// 3. Conversion Rate & CPM Drift
const EFFICIENCY_TREND_CONFIG: AssistantGraphConfig = {
  title: 'Adstock Conversion Rate & CPM Volatility',
  subtitle: 'Cycle-by-cycle conversion rate (%) and auction CPM ($) tracking',
  type: 'line',
  allowTypeToggle: true,
  dataKey: 'cycle',
  data: [
    { cycle: 'C-9476', cvr: 4.8, cpm: 24.5, cpa: 28.2 },
    { cycle: 'C-9477', cvr: 5.1, cpm: 25.1, cpa: 26.4 },
    { cycle: 'C-9478', cvr: 4.9, cpm: 26.0, cpa: 29.1 },
    { cycle: 'C-9479', cvr: 3.2, cpm: 31.5, cpa: 42.0 }, // Shock cycle
    { cycle: 'C-9480', cvr: 3.0, cpm: 33.2, cpa: 46.5 },
    { cycle: 'C-9481', cvr: 4.6, cpm: 27.8, cpa: 31.0 }, // Post mitigation
    { cycle: 'C-9482', cvr: 5.3, cpm: 24.2, cpa: 25.8 },
  ],
  series: [
    { key: 'cvr', name: 'CVR (%)', color: '#10b981', strokeWidth: 2, formatter: 'percentage' },
    { key: 'cpa', name: 'CPA ($)', color: '#f59e0b', strokeWidth: 1.5, formatter: 'currency' },
    { key: 'cpm', name: 'CPM ($)', color: '#a855f7', strokeWidth: 1.5, strokeDasharray: '2 2', formatter: 'currency' },
  ],
  yAxisFormatter: 'number',
  summaryBadge: {
    label: 'Current CVR',
    value: '5.3%',
    trend: 'up',
  },
};

// 4. SKU Stockout Risk & Burn Velocity (Bar Graph)
const INVENTORY_RISK_CONFIG: AssistantGraphConfig = {
  title: 'Footwear SKU Stock Level vs Daily Burn',
  subtitle: 'Real-time units on hand vs 24h burn rate. Zero stock triggers ad throttles.',
  type: 'bar',
  allowTypeToggle: true,
  dataKey: 'skuName',
  data: [
    { skuName: 'Air Force 1', stock: 0, burnRate: 142, status: 'STOCKOUT' },
    { skuName: 'Zoom Fly 5', stock: 840, burnRate: 78, status: 'OPTIMAL' },
    { skuName: 'Pegasus 40', stock: 610, burnRate: 64, status: 'OPTIMAL' },
    { skuName: 'Air Max 270', stock: 450, burnRate: 92, status: 'WARNING' },
    { skuName: 'InfinityRN 4', stock: 320, burnRate: 35, status: 'OPTIMAL' },
  ],
  series: [
    { key: 'stock', name: 'Units on Hand', color: '#3b82f6', formatter: 'number' },
    { key: 'burnRate', name: 'Daily Burn (units)', color: '#f43f5e', formatter: 'number' },
  ],
  yAxisFormatter: 'number',
  summaryBadge: {
    label: 'AF1 Stockout',
    value: '0 Units',
    trend: 'down',
  },
};

interface AssistantGraphsViewProps {
  onSwitchToChat?: (initialPrompt: string) => void;
  router?: any;
}

export function AssistantGraphsView({ onSwitchToChat, router }: AssistantGraphsViewProps) {
  const [selectedDataset, setSelectedDataset] = useState<'roas' | 'channel' | 'efficiency' | 'inventory'>('roas');

  const configs: Record<string, AssistantGraphConfig> = {
    roas: ROAS_TREND_CONFIG,
    channel: CHANNEL_ECONOMICS_CONFIG,
    efficiency: EFFICIENCY_TREND_CONFIG,
    inventory: INVENTORY_RISK_CONFIG,
  };

  const activeConfig = configs[selectedDataset];

  const handleAskAiAboutGraph = () => {
    let prompt = '';
    switch (selectedDataset) {
      case 'roas':
        prompt = 'Analyze our 7-day ROAS trajectory across Meta, Google, and Amazon. Where is the efficiency bottleneck?';
        break;
      case 'channel':
        prompt = 'Compare our ad spend versus realized margin across Amazon, Google, Meta, and Shopify. How should we reallocate?';
        break;
      case 'efficiency':
        prompt = 'Review our conversion rate and CPA drift from cycle C-9476 to C-9482. What caused the volatility?';
        break;
      case 'inventory':
        prompt = 'Audit our SKU inventory levels and stockout risks. Which campaigns are burning spend on 0 stock?';
        break;
    }

    if (onSwitchToChat) {
      onSwitchToChat(prompt);
    }
  };

  return (
    <div className="flex flex-col h-[380px] p-3 space-y-2.5 font-mono text-xs overflow-y-auto">
      {/* Top Telemetry KPI Strip */}
      <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[10px]">
        <div>
          <span className="text-[9px] text-zinc-500 block">Blended ROAS</span>
          <span className="font-bold text-emerald-400">12.06x</span>
        </div>
        <div>
          <span className="text-[9px] text-zinc-500 block">30D Margin</span>
          <span className="font-bold text-zinc-100">$175.5M</span>
        </div>
        <div>
          <span className="text-[9px] text-zinc-500 block">24h Spend</span>
          <span className="font-bold text-zinc-300">$18.4k</span>
        </div>
        <div>
          <span className="text-[9px] text-zinc-500 block">Stockout Risk</span>
          <span className="font-bold text-rose-400 flex items-center gap-0.5">
            <IconAlertTriangle className="size-2.5" />
            1 SKU
          </span>
        </div>
      </div>

      {/* Dataset Selection Pills */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
        <button
          type="button"
          onClick={() => setSelectedDataset('roas')}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] whitespace-nowrap transition-all ${
            selectedDataset === 'roas'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium'
              : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          <IconChartLine className="size-3 text-emerald-400" />
          <span>ROAS Trend (Line)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedDataset('channel')}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] whitespace-nowrap transition-all ${
            selectedDataset === 'channel'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium'
              : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          <IconChartBar className="size-3 text-cyan-400" />
          <span>Channel Mix (Bar)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedDataset('efficiency')}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] whitespace-nowrap transition-all ${
            selectedDataset === 'efficiency'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-medium'
              : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          <IconChartLine className="size-3 text-purple-400" />
          <span>Conversion / CPA</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedDataset('inventory')}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] whitespace-nowrap transition-all ${
            selectedDataset === 'inventory'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-medium'
              : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          <IconChartBar className="size-3 text-rose-400" />
          <span>Stockout Velocity</span>
        </button>
      </div>

      {/* Main Interactive Graph Renderer */}
      <AssistantGraphRenderer config={activeConfig} />

      {/* Graph Actions Footer: Ask AI Copilot */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/60 text-[10px]">
        <span className="text-zinc-400 text-[9px] flex items-center gap-1">
          <IconCheck className="size-3 text-emerald-400" />
          Interactive Telemetry Engine · Line Charts &amp; Bar Graphs
        </span>

        {onSwitchToChat && (
          <button
            type="button"
            onClick={handleAskAiAboutGraph}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all shadow-xs shrink-0"
          >
            <IconSparkles className="size-3 text-emerald-200" />
            <span>Ask AI Copilot</span>
            <IconArrowUpRight className="size-2.5" />
          </button>
        )}
      </div>
    </div>
  );
}
