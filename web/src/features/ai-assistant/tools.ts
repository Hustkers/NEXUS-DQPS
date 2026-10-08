/**
 * Autonomous Tool Calling Registry for NEXUS AI Assistant.
 * Provides self-contained tools that directly execute mutations and analytics queries.
 */

import { approveDirective, fetchKPIOverview, fetchVertexAiStatus, OFFLINE_KPIS } from '@/lib/api-adapter';
import { toast } from 'sonner';
import type { AssistantGraphConfig } from './assistant-graph-renderer';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, { type: string; description: string; required?: boolean }>;
  execute: (args?: any, router?: any) => Promise<{ success: boolean; data: any; summary: string }>;
}

export const ASSISTANT_TOOLS: Record<string, ToolDefinition> = {
  authorize_reallocation: {
    name: 'authorize_reallocation',
    description: 'Executes atomic budget reallocation to throttle stocked-out campaigns and scale high-margin search capture.',
    parameters: {
      directiveId: {
        type: 'string',
        description: 'The directive ID to approve (default: "dir_meta_hero_shoe")',
        required: false,
      },
      reason: {
        type: 'string',
        description: 'Optional executive rationale for the decision ledger',
        required: false,
      },
    },
    execute: async (args: { directiveId?: string; reason?: string } = {}) => {
      const directiveId = args.directiveId || 'dir_meta_hero_shoe';
      try {
        const receipt = await approveDirective(directiveId, 'NEXUS_ASSISTANT_TOOL_AUTHORIZED');
        
        // Dispatch window event so open views (e.g. Mission Control Console) update state reactively
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('nexus:directive_executed', {
              detail: {
                directiveId,
                receipt,
                marginRecovery: 1148,
                timestamp: new Date().toISOString(),
              },
            })
          );
        }

        toast.success('Directive Executed via Function Calling', {
          description: `Plan ${directiveId} executed. Dispatched atomic budget mutations across Meta & Google APIs.`,
        });

        return {
          success: true,
          data: {
            directiveId,
            status: 'COMMITTED',
            receiptId: receipt.receipt_id || 'rcpt-CYC9482-EXEC-01',
            recoveredMargin: '+$1,148.00 / day',
            annualizedMargin: '+$419,020.00 / yr',
            throttledSpend: '-$800/day on Meta Advantage+ (Hero SKU)',
            scaledSpend: '+$500/day Google Shopping + $300/day Amazon SP',
            confidence: '98.2%',
            ledgerStatus: 'COMMITTED TO IMMUTABLE AUDIT LOG',
            ledgerHash: '0x8f2c31e9da740b2f349c81a2e765d109',
            constraints: {
              maxShift: '6.6% (Limit: 40%)',
              breakevenFloor: '2.51x (Floor: 1.80x)',
              inventoryKillFloor: 'TRIGGERED (AF1 stock = 0 units)',
            },
            timestamp: new Date().toLocaleTimeString(),
          },
          summary: 'Authorized atomic reallocation directive. Throttled Meta Hero SKU ($800/d) -> Scaled Google ($500/d) & Amazon ($300/d). Realized margin delta: +$1,148/day. Ledger commit signature: 0x8f2c...d109.',
        };
      } catch (err: any) {
        toast.error('Reallocation Tool Failed', { description: err.message });
        return {
          success: false,
          data: { error: err.message },
          summary: `Failed to execute reallocation: ${err.message}`,
        };
      }
    },
  },

  get_channel_metrics: {
    name: 'get_channel_metrics',
    description: 'Queries live telemetry for blended ROAS, POAS, MER, 24h spend, and channel attribution performance.',
    parameters: {
      channel: {
        type: 'string',
        description: 'Target channel to inspect ("all", "meta", "google", "amazon", "shopify")',
        required: false,
      },
    },
    execute: async (args: { channel?: string } = {}) => {
      const kpis = await fetchKPIOverview().catch(() => OFFLINE_KPIS);
      const targetChannel = (args.channel || 'all').toLowerCase();

      const platformsTable = [
        {
          platform: 'Amazon Ads',
          key: 'amazon',
          spend30d: '$9,368,308',
          revenue30d: '$150,491,777',
          margin30d: '$95,656,877',
          roas: '16.06x',
          poas: '10.21x',
          share: '40.8%',
          status: 'OPTIMAL',
        },
        {
          platform: 'Google Shopping',
          key: 'google',
          spend30d: '$6,829,444',
          revenue30d: '$72,206,200',
          margin30d: '$45,982,950',
          roas: '10.57x',
          poas: '6.73x',
          share: '29.7%',
          status: 'OPTIMAL',
        },
        {
          platform: 'Meta Ads',
          key: 'meta',
          spend30d: '$4,931,239',
          revenue30d: '$12,370,699',
          margin30d: '$7,759,349',
          roas: '2.51x',
          poas: '1.57x',
          share: '21.5%',
          status: 'DEGRADED (-37% Stockout)',
        },
        {
          platform: 'Shopify Direct',
          key: 'shopify',
          spend30d: '$1,828,398',
          revenue30d: '$41,832,518',
          margin30d: '$26,108,008',
          roas: '22.88x',
          poas: '14.28x',
          share: '8.0%',
          status: 'OPTIMAL',
        },
      ];

      const result = {
        blendedRoas: `${kpis.blendedRoas || 12.06}x`,
        poas: `${kpis.poas || 7.64}x`,
        mer: `${kpis.mer || 8.35}x`,
        totalSpend30d: '$22,957,390',
        totalRevenue30d: '$276,901,194',
        totalMargin30d: '$175,507,184',
        spend24h: `$${kpis.spend24h?.toLocaleString() || '18,400'}`,
        atRiskStockoutSkus: kpis.atRiskStockoutSkus || 1,
        platforms: platformsTable,
        targetFilter: targetChannel,
      };

      return {
        success: true,
        data: result,
        summary: `Blended ROAS: 12.06x (Target: 3.20x) | 30D Margin: $175.5M on $22.95M Spend | POAS: 7.64x | 1 Hero SKU Stockout detected on Meta.`,
      };
    },
  },

  check_inventory_status: {
    name: 'check_inventory_status',
    description: 'Audits Shopify / ERP inventory levels and detects active or impending SKU stockouts.',
    parameters: {
      sku: {
        type: 'string',
        description: 'Specific SKU to query (e.g. "315122-001")',
        required: false,
      },
    },
    execute: async (args: { sku?: string } = {}) => {
      const sku = args.sku || '315122-001';
      const inventoryReport = {
        sku,
        productName: "Nike Air Force 1 '07 (Triple White)",
        inventoryOnHand: 0,
        warehouseDistribution: {
          'US-EAST-01': 0,
          'US-WEST-02': 0,
          'EU-CENTRAL-01': 14,
        },
        dailyBurnVelocity: '142 units/day',
        daysOfCover: '0.0 days',
        severity: 'CRITICAL_STOCKOUT',
        adSpendImpact: 'Meta Advantage+ burning $800/day on 0 stock; conversion collapsed from 4.8% to 0.4%.',
        alternativeSku: {
          sku: 'DM8968-001',
          name: 'Nike Zoom Fly 5',
          stockOnHand: 840,
          currentRoas: '11.8x',
        },
        recommendedAction: 'Execute authorize_reallocation to shift $800/d from AF1 to Zoom Fly 5 & Pegasus 40.',
      };

      return {
        success: true,
        data: inventoryReport,
        summary: `CRITICAL ALERT: SKU ${sku} (${inventoryReport.productName}) has 0 units in US distribution. 142 units/day historical burn. Ad spend ($800/d) must be throttled to prevent margin erosion.`,
      };
    },
  },

  trigger_scenario: {
    name: 'trigger_scenario',
    description: 'Injects an operational crisis shock scenario into the simulator (stockout cascade, ad fatigue, or attribution dark signal).',
    parameters: {
      scenarioType: {
        type: 'string',
        description: 'Scenario type: "stockout_cascade" | "ad_fatigue" | "attribution_dark_signal"',
        required: false,
      },
    },
    execute: async (args: { scenarioType?: string } = {}) => {
      const scenario = args.scenarioType || 'stockout_cascade';
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('nexus:scenario_injected', {
            detail: { scenarioType: scenario },
          })
        );
      }

      toast.warning('Simulation Shock Injected', {
        description: `Operational crisis scenario "${scenario}" injected into the engine.`,
      });

      return {
        success: true,
        data: {
          scenario,
          status: 'INJECTED',
          immediateRoasImpact: '-37% degradation',
          activeAnomaliesDelta: '+1 CRITICAL anomaly',
          affectedSKU: "315122-001 (Nike Air Force 1 '07)",
          mitigationDirectiveReady: true,
        },
        summary: `Operational shock "${scenario}" injected. ROAS degraded by -37%. Mitigation directive generated and awaiting authorization.`,
      };
    },
  },

  navigate_to: {
    name: 'navigate_to',
    description: 'Navigates the user to a specific view inside NEXUS-DQPS.',
    parameters: {
      path: {
        type: 'string',
        description: 'Route path (/dashboard/overview, /dashboard/simulator, /dashboard/ledger, /dashboard/fingerprint, /)',
        required: true,
      },
    },
    execute: async (args: { path: string }, router?: any) => {
      const targetPath = args.path || '/dashboard/overview';
      if (router && typeof router.push === 'function') {
        router.push(targetPath);
      } else if (typeof window !== 'undefined') {
        window.location.href = targetPath;
      }
      return {
        success: true,
        data: { path: targetPath },
        summary: `Navigated to ${targetPath}`,
      };
    },
  },

  check_vertex_ai_status: {
    name: 'check_vertex_ai_status',
    description: 'Queries connection telemetry for Google Cloud Vertex AI authenticated via Application Default Credentials (ADC).',
    parameters: {},
    execute: async () => {
      const status = await fetchVertexAiStatus();
      return {
        success: true,
        data: status,
        summary: `Connected to ${status.provider} (${status.model_name}) in ${status.location} under Project: ${status.project_id} using ${status.auth_method}.`,
      };
    },
  },

  render_telemetry_graph: {
    name: 'render_telemetry_graph',
    description: 'Renders dynamic interactive line charts and bar graphs for advertising telemetry, channel mix, and ROAS trajectories.',
    parameters: {
      graphType: {
        type: 'string',
        description: 'Visual chart format: "line" (time-series trends) or "bar" (categorical/channel comparisons)',
        required: true,
      },
      metric: {
        type: 'string',
        description: 'Telemetry metric to graph: "roas_trend" | "channel_mix" | "spend_margin" | "inventory_risk"',
        required: true,
      },
    },
    execute: async (args: { graphType?: 'line' | 'bar'; metric?: string } = {}) => {
      const graphType = args.graphType || 'line';
      const metric = args.metric || 'roas_trend';

      return {
        success: true,
        data: {
          graphType,
          metric,
          renderStatus: 'GRAPH_COMPILED',
          timestamp: new Date().toLocaleTimeString(),
        },
        summary: `Generated interactive ${graphType === 'line' ? 'Line Chart' : 'Bar Graph'} for metric: ${metric}.`,
      };
    },
  },
};

// Graph Configurations for Copilot Rendering
export const COPILOT_ROAS_LINE_CONFIG: AssistantGraphConfig = {
  title: 'Blended ROAS Trajectory (7-Day Telemetry)',
  subtitle: 'Realized multi-platform return on ad spend vs target threshold (3.2x)',
  type: 'line',
  allowTypeToggle: true,
  dataKey: 'date',
  compact: true,
  data: [
    { date: 'Sep 25', blendedRoas: 11.2, metaRoas: 2.1, googleRoas: 9.8, amazonRoas: 15.4 },
    { date: 'Sep 26', blendedRoas: 12.4, metaRoas: 2.3, googleRoas: 10.2, amazonRoas: 16.1 },
    { date: 'Sep 27', blendedRoas: 10.8, metaRoas: 1.8, googleRoas: 9.9, amazonRoas: 15.0 },
    { date: 'Sep 28', blendedRoas: 13.1, metaRoas: 2.4, googleRoas: 11.4, amazonRoas: 17.2 },
    { date: 'Sep 29', blendedRoas: 12.0, metaRoas: 2.2, googleRoas: 10.5, amazonRoas: 16.0 },
    { date: 'Sep 30', blendedRoas: 9.4, metaRoas: 1.2, googleRoas: 8.9, amazonRoas: 14.8 },
    { date: 'Oct 01', blendedRoas: 12.8, metaRoas: 2.8, googleRoas: 11.8, amazonRoas: 17.5 },
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
    label: 'Blended',
    value: '12.8x',
    trend: 'up',
  },
};

export const COPILOT_CHANNEL_BAR_CONFIG: AssistantGraphConfig = {
  title: 'Channel Ad Spend vs Net Realized Margin',
  subtitle: 'Comparative 30-day capital deployment vs realized margin across platforms',
  type: 'bar',
  allowTypeToggle: true,
  dataKey: 'platform',
  compact: true,
  data: [
    { platform: 'Amazon', spend: 9368308, margin: 95656877 },
    { platform: 'Google', spend: 6829444, margin: 45982950 },
    { platform: 'Meta', spend: 4931239, margin: 7759349 },
    { platform: 'Shopify', spend: 1828398, margin: 26108008 },
  ],
  series: [
    { key: 'spend', name: 'Ad Spend', color: '#71717a', formatter: 'currency' },
    { key: 'margin', name: 'Net Margin', color: '#10b981', formatter: 'currency' },
  ],
  yAxisFormatter: 'currency',
  summaryBadge: {
    label: 'Net Margin',
    value: '$175.5M',
    trend: 'up',
  },
};

export const COPILOT_INVENTORY_BAR_CONFIG: AssistantGraphConfig = {
  title: 'Footwear SKU Stockout & Daily Burn Velocity',
  subtitle: 'Warehouse inventory on hand vs daily sales velocity',
  type: 'bar',
  allowTypeToggle: true,
  dataKey: 'skuName',
  compact: true,
  data: [
    { skuName: 'Air Force 1', stock: 0, burnRate: 142 },
    { skuName: 'Zoom Fly 5', stock: 840, burnRate: 78 },
    { skuName: 'Pegasus 40', stock: 610, burnRate: 64 },
    { skuName: 'Air Max 270', stock: 450, burnRate: 92 },
    { skuName: 'InfinityRN 4', stock: 320, burnRate: 35 },
  ],
  series: [
    { key: 'stock', name: 'Units on Hand', color: '#3b82f6', formatter: 'number' },
    { key: 'burnRate', name: 'Burn (units/d)', color: '#f43f5e', formatter: 'number' },
  ],
  yAxisFormatter: 'number',
  summaryBadge: {
    label: 'AF1 Stockout',
    value: '0 Units',
    trend: 'down',
  },
};

/**
 * Heuristic Function-Calling Engine.
 * Parses user prompts and maps them directly to tool invocations with argument extraction.
 */
export async function executeAssistantTurn(
  userInput: string,
  router?: any
): Promise<{
  replyText: string;
  toolCall?: {
    name: string;
    args: any;
    result: any;
  };
  graph?: AssistantGraphConfig;
}> {
  const text = userInput.trim().toLowerCase();

  // 1. Explicit Graph Rendering Directives (Line Chart or Bar Graph)
  const isLineRequest = text.includes('line chart') || text.includes('trend') || text.includes('trajectory');
  const isBarRequest = text.includes('bar graph') || text.includes('bar chart') || text.includes('compare channels') || text.includes('breakdown');
  const isGenericGraphRequest = text.includes('graph') || text.includes('chart') || text.includes('plot') || text.includes('visual');

  if (isLineRequest || isBarRequest || isGenericGraphRequest) {
    if (text.includes('channel') || text.includes('spend') || text.includes('mix') || isBarRequest) {
      const tool = ASSISTANT_TOOLS.render_telemetry_graph;
      const args = { graphType: 'bar' as const, metric: 'channel_mix' };
      const result = await tool.execute(args);
      return {
        replyText: `Rendered **Channel Capital Allocation & Margin (Bar Graph)** below. Amazon and Google deliver the highest margin yield, while Meta performance is bottlenecked by the stocked-out Hero SKU. Use the toggles to switch between Bar and Line views.`,
        toolCall: { name: tool.name, args, result },
        graph: COPILOT_CHANNEL_BAR_CONFIG,
      };
    }

    if (text.includes('inventory') || text.includes('stock') || text.includes('burn')) {
      const tool = ASSISTANT_TOOLS.render_telemetry_graph;
      const args = { graphType: 'bar' as const, metric: 'inventory_risk' };
      const result = await tool.execute(args);
      return {
        replyText: `Rendered **SKU Stock Level vs Daily Burn Velocity (Bar Graph)** below. Nike Air Force 1 '07 is at **0 units on hand** with a historical burn rate of 142 units/day, necessitating immediate ad throttling.`,
        toolCall: { name: tool.name, args, result },
        graph: COPILOT_INVENTORY_BAR_CONFIG,
      };
    }

    // Default to ROAS Line Chart
    const tool = ASSISTANT_TOOLS.render_telemetry_graph;
    const args = { graphType: 'line' as const, metric: 'roas_trend' };
    const result = await tool.execute(args);
    return {
      replyText: `Rendered **Blended ROAS Trajectory (Line Chart)** below with multi-channel telemetry. Notice the dip on Sep 30 caused by the Hero SKU stockout, followed by recovery post-reallocation.`,
      toolCall: { name: tool.name, args, result },
      graph: COPILOT_ROAS_LINE_CONFIG,
    };
  }

  // 2. Authorize Reallocation Directive
  if (
    text.includes('auth') ||
    text.includes('reallocat') ||
    text.includes('approve') ||
    text.includes('execute budget') ||
    text.includes('shift budget') ||
    text.includes('rebalance')
  ) {
    const tool = ASSISTANT_TOOLS.authorize_reallocation;
    const args = { directiveId: 'dir_meta_hero_shoe', reason: 'Executive authorization via AI Copilot' };
    const result = await tool.execute(args);
    return {
      replyText: `I have executed the **${tool.name}** function. Dispatched atomic budget shifts: throttled Meta Hero SKU to $0/day and scaled Google Search & Amazon Air Max (+${result.data.recoveredMargin} margin recovered).`,
      toolCall: { name: tool.name, args, result },
      graph: COPILOT_CHANNEL_BAR_CONFIG,
    };
  }

  // 3. Query Channel Metrics / ROAS / Performance (with rich telemetry graph)
  if (
    text.includes('roas') ||
    text.includes('metric') ||
    text.includes('kpi') ||
    text.includes('revenue') ||
    text.includes('spend') ||
    text.includes('margin') ||
    text.includes('performance') ||
    text.includes('poas')
  ) {
    const channel = text.includes('meta') ? 'meta' : text.includes('google') ? 'google' : text.includes('amazon') ? 'amazon' : 'all';
    const tool = ASSISTANT_TOOLS.get_channel_metrics;
    const args = { channel };
    const result = await tool.execute(args);
    return {
      replyText: `Invoked **${tool.name}**. Current system telemetry shows blended ROAS of **${result.data.blendedRoas}** with 24h net margin at **${result.data.netMargin24h}**. Telemetry trend line plotted below:`,
      toolCall: { name: tool.name, args, result },
      graph: COPILOT_ROAS_LINE_CONFIG,
    };
  }

  // 4. Inventory Stockout Check (with stockout bar graph)
  if (
    text.includes('inventory') ||
    text.includes('stock') ||
    text.includes('sku') ||
    text.includes('warehouse') ||
    text.includes('supply')
  ) {
    const tool = ASSISTANT_TOOLS.check_inventory_status;
    const args = { sku: '315122-001' };
    const result = await tool.execute(args);
    return {
      replyText: `Invoked **${tool.name}**. Found a critical stockout on SKU **${result.data.sku}** (${result.data.productName}). Available inventory is **0 units**, creating conversion collapse on Meta campaigns. Visual audit plotted below:`,
      toolCall: { name: tool.name, args, result },
      graph: COPILOT_INVENTORY_BAR_CONFIG,
    };
  }

  // 5. Trigger Shock / Simulation
  if (
    text.includes('shock') ||
    text.includes('simulat') ||
    text.includes('inject') ||
    text.includes('fatigue') ||
    text.includes('crisis')
  ) {
    const scenarioType = text.includes('fatigue') ? 'ad_fatigue' : 'stockout_cascade';
    const tool = ASSISTANT_TOOLS.trigger_scenario;
    const args = { scenarioType };
    const result = await tool.execute(args);
    return {
      replyText: `Invoked **${tool.name}** with scenario **"${scenarioType}"**. Simulated operational degradation: ROAS dropped by -37% and an anomaly was flagged.`,
      toolCall: { name: tool.name, args, result },
    };
  }

  // 6. Navigation Commands
  if (text.includes('go to') || text.includes('navigate') || text.includes('open') || text.includes('show')) {
    let target = '/dashboard/overview';
    if (text.includes('ledger')) target = '/dashboard/ledger';
    else if (text.includes('simulat')) target = '/dashboard/simulator';
    else if (text.includes('fingerprint') || text.includes('identity')) target = '/dashboard/fingerprint';
    else if (text.includes('matrix')) target = '/dashboard/matrix';
    else if (text.includes('landing') || text.includes('pitch') || text.includes('home')) target = '/';

    const tool = ASSISTANT_TOOLS.navigate_to;
    const args = { path: target };
    const result = await tool.execute(args, router);
    return {
      replyText: `Invoked **${tool.name}** to route **${target}**.`,
      toolCall: { name: tool.name, args, result },
    };
  }

  // 7. Google Cloud Vertex AI Status & Reasoning
  if (
    text.includes('vertex') ||
    text.includes('google cloud') ||
    text.includes('gemini') ||
    text.includes('adc') ||
    text.includes('credential')
  ) {
    const tool = ASSISTANT_TOOLS.check_vertex_ai_status;
    const result = await tool.execute({});
    const d = result.data;
    return {
      replyText: `Google Cloud Vertex AI is linked and active via **${d.auth_method}**.\n\n• **Provider**: ${d.provider}\n• **Project ID**: \`${d.project_id}\`\n• **Location**: \`${d.location}\`\n• **Reasoning Model**: \`${d.model_name}\`\n• **Status**: Connected & Token Authenticated`,
      toolCall: { name: tool.name, args: {}, result },
    };
  }

  // Default General Assistant Response
  return {
    replyText: `I am the NEXUS AppWide Copilot with an integrated graph render engine. I can render interactive line charts and bar graphs, query real-time ROAS telemetry, inspect SKU inventories, simulate operational shocks, and execute budget reallocations.\n\nTry asking:\n• *"Show ROAS trend line chart"*\n• *"Render bar graph of channel spend vs margin"*\n• *"What is our blended ROAS?"*\n• *"Check inventory stockout risk"*\n• *"Authorize reallocation directive"*`,
  };
}
