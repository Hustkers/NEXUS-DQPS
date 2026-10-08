'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  INITIAL_PRODUCTS,
  INITIAL_LEDGER,
  deriveProduct,
  generateReallocations,
  applyFixPlan,
  applyReallocation,
  type ProductModel,
  type DerivedProduct,
  type FixPlanSummary,
  type ReallocationItem,
  type GaugesLedgerItem,
} from '@/lib/gauges-engine';

export interface DecisionEngineStoreState {
  products: DerivedProduct[];
  ledger: GaugesLedgerItem[];
  reallocations: ReallocationItem[];
  autoPilot: boolean;
  topKpis: {
    blendedRoas: number;
    totalDailySpend: number;
    openIssuesCount: number;
    spendAtRisk: number;
  };
  executeFix: (productId: string, plan: FixPlanSummary) => void;
  executeReallocation: (reallocation: ReallocationItem, isAuto?: boolean) => void;
  executeAllReallocations: () => Promise<{ count: number; totalMoved: number; totalLift: number }>;
  toggleAutoPilot: (enabled: boolean) => void;
  resetToDefaults: () => void;
  recordDecision: (entry: Partial<GaugesLedgerItem>) => void;
}

const LOCAL_STORAGE_KEY_PRODUCTS = 'nexus_shared_products_v4';
const LOCAL_STORAGE_KEY_LEDGER = 'nexus_shared_ledger_v4';
const LOCAL_STORAGE_KEY_AUTOPILOT = 'nexus_shared_autopilot_v4';

const DecisionEngineContext = createContext<DecisionEngineStoreState | null>(null);

export function DecisionEngineProvider({ children }: { children: React.ReactNode }) {
  const [rawProducts, setRawProducts] = useState<ProductModel[]>(INITIAL_PRODUCTS);
  const [ledger, setLedger] = useState<GaugesLedgerItem[]>(INITIAL_LEDGER);
  const [autoPilot, setAutoPilotState] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedProducts = localStorage.getItem(LOCAL_STORAGE_KEY_PRODUCTS);
        const storedLedger = localStorage.getItem(LOCAL_STORAGE_KEY_LEDGER);
        const storedAutoPilot = localStorage.getItem(LOCAL_STORAGE_KEY_AUTOPILOT);

        if (storedProducts) {
          const parsed = JSON.parse(storedProducts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRawProducts(parsed);
          }
        }
        if (storedLedger) {
          const parsed = JSON.parse(storedLedger);
          if (Array.isArray(parsed)) {
            setLedger(parsed);
          }
        }
        if (storedAutoPilot !== null) {
          setAutoPilotState(storedAutoPilot === 'true');
        }

        // Merge decisions recorded on backend API
        fetch('/api/ledger')
          .then((r) => r.json())
          .then((data) => {
            if (data.success && Array.isArray(data.ledger)) {
              setLedger((curr) => {
                const map = new Map<string, GaugesLedgerItem>();
                for (const item of curr) {
                  map.set(item.id, item);
                }
                for (const item of data.ledger) {
                  if (!map.has(item.id)) {
                    map.set(item.id, {
                      id: item.id,
                      timestamp: item.timestamp,
                      product: item.product || 'Portfolio Catalog',
                      channel: item.channel || 'Meta',
                      issue: item.issue || 'Optimization Directive',
                      actionTaken: item.actionTaken || item.decision || 'Algorithmic Optimization',
                      outcome: item.outcome || 'Optimized',
                      expectedMargin: item.expectedMargin,
                      realizedMargin: item.realizedMargin,
                      variancePct: item.variancePct,
                      accuracyPct: item.accuracyPct,
                      confidence: item.confidence,
                      status: item.status,
                      feedback: item.feedback,
                      isAuto: item.isAuto,
                      surface: item.surface || 'Decision Engine',
                    });
                  }
                }
                return Array.from(map.values());
              });
            }
          })
          .catch(() => {});
      }
    } catch {
      // Fallback cleanly to seed data
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Sync state to localStorage upon change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(LOCAL_STORAGE_KEY_PRODUCTS, JSON.stringify(rawProducts));
        localStorage.setItem(LOCAL_STORAGE_KEY_LEDGER, JSON.stringify(ledger));
        localStorage.setItem(LOCAL_STORAGE_KEY_AUTOPILOT, String(autoPilot));
      }
    } catch {
      // Ignore write errors
    }
  }, [rawProducts, ledger, autoPilot, isHydrated]);

  // Listen for storage events across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY_PRODUCTS && e.newValue) {
        try {
          setRawProducts(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === LOCAL_STORAGE_KEY_LEDGER && e.newValue) {
        try {
          setLedger(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === LOCAL_STORAGE_KEY_AUTOPILOT && e.newValue !== null) {
        setAutoPilotState(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Action: Execute Fix from card
  const executeFix = useCallback((productId: string, plan: FixPlanSummary) => {
    setRawProducts((prev) => {
      const { updatedProducts, newLedgerEntry } = applyFixPlan(prev, productId, plan);
      setLedger((currLedger) => [newLedgerEntry, ...currLedger]);
      try {
        fetch('/api/ledger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLedgerEntry),
        }).catch(() => {});
      } catch {}
      return updatedProducts;
    });
  }, []);

  // Action: Execute single Reallocation from stream
  const executeReallocation = useCallback((item: ReallocationItem, isAuto = false) => {
    setRawProducts((prev) => {
      const { updatedProducts, newLedgerEntry } = applyReallocation(prev, item, isAuto);
      setLedger((currLedger) => [newLedgerEntry, ...currLedger]);
      try {
        fetch('/api/ledger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLedgerEntry),
        }).catch(() => {});
      } catch {}
      return updatedProducts;
    });
  }, []);

  // Action: Execute All pending Reallocations
  const executeAllReallocations = useCallback(async () => {
    let currentCatalog = [...rawProducts];
    const newEntries: GaugesLedgerItem[] = [];
    let count = 0;
    let totalMoved = 0;
    let totalLift = 0;

    // Continuously generate and apply until no more pending reallocations exist
    while (true) {
      const currentDerived = currentCatalog.map((p) => deriveProduct(p));
      const currentList = generateReallocations(currentDerived);
      if (currentList.length === 0) break;

      const item = currentList[0];
      const { updatedProducts, newLedgerEntry } = applyReallocation(currentCatalog, item, false);
      currentCatalog = updatedProducts;
      newEntries.unshift(newLedgerEntry);
      count += 1;
      totalMoved += item.movedAmount;
      totalLift += item.netRevenueLift;
    }

    setRawProducts(currentCatalog);
    setLedger((currLedger) => [...newEntries, ...currLedger]);

    for (const entry of newEntries) {
      try {
        fetch('/api/ledger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        }).catch(() => {});
      } catch {}
    }

    return { count, totalMoved, totalLift };
  }, [rawProducts]);

  // Action: Toggle Auto-Pilot
  const toggleAutoPilot = useCallback((enabled: boolean) => {
    setAutoPilotState(enabled);

    // If enabled, immediately execute all recommendations with confidence >= 80%
    if (enabled) {
      setRawProducts((prev) => {
        let currentCatalog = [...prev];
        const newEntries: GaugesLedgerItem[] = [];

        while (true) {
          const currentDerived = currentCatalog.map((p) => deriveProduct(p));
          const currentList = generateReallocations(currentDerived);
          const autoCandidates = currentList.filter((it) => it.confidence >= 80);
          if (autoCandidates.length === 0) break;

          const item = autoCandidates[0];
          const { updatedProducts, newLedgerEntry } = applyReallocation(currentCatalog, item, true);
          currentCatalog = updatedProducts;
          newEntries.unshift(newLedgerEntry);
        }

        if (newEntries.length > 0) {
          setLedger((currLedger) => [...newEntries, ...currLedger]);
          for (const entry of newEntries) {
            try {
              fetch('/api/ledger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry),
              }).catch(() => {});
            } catch {}
          }
        }
        return currentCatalog;
      });
    }
  }, []);

  // Action: Reset to defaults
  const resetToDefaults = useCallback(() => {
    setRawProducts(INITIAL_PRODUCTS);
    setLedger(INITIAL_LEDGER);
    setAutoPilotState(false);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY_PRODUCTS);
      localStorage.removeItem(LOCAL_STORAGE_KEY_LEDGER);
      localStorage.removeItem(LOCAL_STORAGE_KEY_AUTOPILOT);
    } catch {}
  }, []);

  // Action: Record arbitrary decision from any surface into the unified ledger
  const recordDecision = useCallback((entry: Partial<GaugesLedgerItem>) => {
    if (!entry) return;
    const now = new Date();
    const timeFormatted = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 8)}`;
    const newEntry: GaugesLedgerItem = {
      id: entry.id || `ledg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: entry.timestamp || timeFormatted,
      product: entry.product || 'Portfolio Catalog',
      channel: (entry.channel as any) || 'Meta',
      issue: entry.issue || 'Optimization Directive',
      actionTaken: entry.actionTaken || 'Budget optimization executed',
      outcome: entry.outcome || 'Optimized',
      isAuto: Boolean(entry.isAuto),
      expectedMargin: entry.expectedMargin,
      realizedMargin: entry.realizedMargin,
      variancePct: entry.variancePct,
      accuracyPct: entry.accuracyPct ?? 94.8,
      confidence: entry.confidence ?? 0.95,
      status: entry.status || 'COMMITTED',
      feedback: entry.feedback || 'Decision committed to immutable closed-loop ledger.',
      surface: entry.surface || 'Decision Engine',
    };

    setLedger((curr) => {
      const filtered = curr.filter((l) => l.id !== newEntry.id);
      return [newEntry, ...filtered];
    });

    try {
      fetch('/api/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      }).catch(() => {});
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('nexus:ledger_entry_added', { detail: newEntry })
      );
    }
  }, []);

  // Listen for AI Coach operational events and UI actions
  useEffect(() => {
    const handleUiAction = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: string; payload: any }>;
      const { type, payload } = customEvent.detail || {};

      if (type === 'UPDATE_BUDGET') {
        const { target, budget } = payload || {};
        setRawProducts((prev) =>
          prev.map((p) => {
            if (
              p.id === target ||
              p.sku === target ||
              p.name.toLowerCase().includes(String(target).toLowerCase())
            ) {
              return { ...p, dailySpend: Number(budget) };
            }
            return p;
          })
        );
      } else if (type === 'UPDATE_INVENTORY') {
        const { sku, quantity } = payload || {};
        setRawProducts((prev) =>
          prev.map((p) => {
            if (
              p.sku === sku ||
              p.id === sku ||
              p.name.toLowerCase().includes(String(sku).toLowerCase())
            ) {
              return {
                ...p,
                inventory: Number(quantity),
                isFixed: Number(quantity) > 0 ? true : p.isFixed,
                paused: Number(quantity) > 0 ? false : p.paused,
              };
            }
            return p;
          })
        );
      } else if (type === 'TOGGLE_AUTOPILOT') {
        toggleAutoPilot(Boolean(payload?.enabled));
      } else if (type === 'EXECUTE_REALLOCATION') {
        executeAllReallocations();
      } else if (type === 'APPLY_FIX') {
        const { productId } = payload || {};
        const targetProduct = rawProducts.find(
          (p) => p.id === productId || p.sku === productId
        );
        if (targetProduct) {
          executeFix(targetProduct.id, {
            issueType: 'stockout',
            issueBanner: `AI Coach Fix: ${targetProduct.name}`,
            evidence: ['Automated mitigation policy executed by AI Coach'],
            steps: [
              {
                title: 'Throttle Bleed & Restock',
                description: 'Recover ad spend and rebalance inventory',
                before: 'Active Bleed',
                after: 'Protected Margin',
              },
            ],
            resultTiles: [
              { label: 'Margin Recovery', before: '-$840/d', after: '+$975/d' },
            ],
            projectionNote: 'Automated mitigation shift to protect contribution margin',
            receivingProductId: 'prod-02',
            receivingProductName: 'Nike Zoom Fly',
            reallocatedSpend: 1148,
            actionTakenText: 'Shifted capital to scale cluster',
            outcomeText: 'Recovered margin and restored ROAS floor',
          });
        }
      }
    };

    const handleBudgetUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{
        target: string;
        budget: number;
        channel?: string;
      }>;
      const { target, budget, channel } = customEvent.detail || {};
      if (target !== undefined && budget !== undefined) {
        setRawProducts((prev) =>
          prev.map((p) => {
            if (
              p.id === target ||
              p.sku === target ||
              p.name.toLowerCase().includes(String(target).toLowerCase())
            ) {
              recordDecision({
                id: `ledg-copilot-bgt-${Date.now().toString(36)}`,
                product: p.name,
                channel: (channel || p.channel) as any,
                issue: 'Ad Spend Allocation Adjustment',
                actionTaken: `Updated daily spend on ${p.name} to $${Number(budget).toLocaleString()}/day`,
                outcome: 'Spend Pacing Rebalanced',
                surface: 'AI Copilot & Controls',
                expectedMargin: Math.round(Number(budget) * p.roas * 0.4),
                realizedMargin: Math.round(Number(budget) * p.roas * 0.38),
                status: 'COMMITTED',
                feedback: `Direct ad spend adjustment applied to ${p.channel} Ads.`,
              });
              return { ...p, dailySpend: Number(budget) };
            }
            return p;
          })
        );
      }
    };

    const handleInventoryUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{
        sku: string;
        quantity: number;
      }>;
      const { sku, quantity } = customEvent.detail || {};
      if (sku && quantity !== undefined) {
        setRawProducts((prev) =>
          prev.map((p) => {
            if (
              p.sku === sku ||
              p.id === sku ||
              p.name.toLowerCase().includes(String(sku).toLowerCase())
            ) {
              recordDecision({
                id: `ledg-restock-${Date.now().toString(36)}`,
                product: p.name,
                channel: p.channel,
                issue: p.inventory <= 0 ? 'Stockout Shock Resolution' : 'Inventory Replenishment',
                actionTaken: `Replenished ${quantity} units into ERP warehouse (${p.sku || p.id})`,
                outcome: Number(quantity) > 0 ? 'Ad Kill-Switch Deactivated' : 'Zero Inventory Warning',
                surface: 'Inventory & ERP System',
                expectedMargin: Math.round(Number(quantity) * (p.msrp || 120) * 0.38),
                realizedMargin: Math.round(Number(quantity) * (p.msrp || 120) * 0.36),
                status: 'COMMITTED',
                feedback: `Restock shipment logged. Inventory increased to ${quantity} units.`,
              });
              return {
                ...p,
                inventory: Number(quantity),
                isFixed: Number(quantity) > 0 ? true : p.isFixed,
                paused: Number(quantity) > 0 ? false : p.paused,
              };
            }
            return p;
          })
        );
      }
    };

    const handleAutopilotToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      if (customEvent.detail?.enabled !== undefined) {
        const enabled = Boolean(customEvent.detail.enabled);
        toggleAutoPilot(enabled);
        recordDecision({
          id: `ledg-auto-${Date.now().toString(36)}`,
          product: 'Cross-Portfolio Engine',
          channel: 'Omnichannel',
          issue: enabled ? 'Autonomous Execution Engaged' : 'Manual Oversight Restored',
          actionTaken: enabled ? 'Engaged Auto-Pilot automated convex reallocations' : 'Paused Auto-Pilot mode',
          outcome: enabled ? 'Continuous Pacing Active' : 'Manual Pacing Active',
          surface: 'Autonomous Engine',
          status: 'COMMITTED',
          feedback: enabled
            ? 'AutoPilot engaged: recommendations with >=80% confidence execute automatically.'
            : 'AutoPilot paused by operator.',
        });
      }
    };

    const handleRecordDecision = (e: Event) => {
      const customEvent = e as CustomEvent<Partial<GaugesLedgerItem>>;
      if (customEvent.detail) {
        recordDecision(customEvent.detail);
      }
    };

    const handleStrategyChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ strategy: string }>;
      const { strategy } = customEvent.detail || {};
      if (strategy) {
        recordDecision({
          id: `ledg-strat-${Date.now().toString(36)}`,
          product: 'Global Portfolio',
          channel: 'Omnichannel',
          issue: 'Portfolio Strategy Shift',
          actionTaken: `Switched optimization objective to "${strategy}"`,
          outcome: 'Weights Recalibrated',
          surface: 'Campaign Strategy Engine',
          status: 'COMMITTED',
          feedback: `Optimization objective shifted to ${strategy}. Bayesian prior weights adjusted.`,
        });
      }
    };

    const handleScenarioInjected = (e: Event) => {
      const customEvent = e as CustomEvent<{ scenarioType: string; description?: string }>;
      const { scenarioType, description } = customEvent.detail || {};
      if (scenarioType) {
        recordDecision({
          id: `ledg-sim-${Date.now().toString(36)}`,
          product: 'Simulated Portfolio',
          channel: 'Omnichannel',
          issue: `Scenario Stress: ${scenarioType}`,
          actionTaken: description || `Injected stress test scenario: ${scenarioType}`,
          outcome: 'Loss Mitigated',
          surface: 'Simulator',
          status: 'COMMITTED',
          feedback: `Black-swan shock simulation resolved with dynamic shadow price pacing.`,
        });
      }
    };

    const handleDirectiveExecuted = (e: Event) => {
      const customEvent = e as CustomEvent<{ directiveId?: string; marginRecovery?: number }>;
      const { directiveId, marginRecovery } = customEvent.detail || {};
      recordDecision({
        id: directiveId || `ledg-dir-${Date.now().toString(36)}`,
        product: 'Target Campaign Cluster',
        channel: 'Meta',
        issue: 'Budget Reallocation Execution',
        actionTaken: 'Shifted capital to scale cluster and throttled low-ROAS bleed',
        outcome: `+$${marginRecovery || 1148}/day recovered margin`,
        surface: 'Reallocations Engine',
        expectedMargin: marginRecovery || 1148,
        realizedMargin: marginRecovery || 1148,
        status: 'COMMITTED',
        feedback: 'Reallocation directive executed via Copilot event dispatch.',
      });
    };

    window.addEventListener('nexus:ui_action', handleUiAction);
    window.addEventListener('nexus:budget_updated', handleBudgetUpdate);
    window.addEventListener('nexus:inventory_updated', handleInventoryUpdate);
    window.addEventListener('nexus:autopilot_toggled', handleAutopilotToggle);
    window.addEventListener('nexus:record_decision', handleRecordDecision);
    window.addEventListener('nexus:strategy_changed', handleStrategyChanged);
    window.addEventListener('nexus:scenario_injected', handleScenarioInjected);
    window.addEventListener('nexus:directive_executed', handleDirectiveExecuted);

    return () => {
      window.removeEventListener('nexus:ui_action', handleUiAction);
      window.removeEventListener('nexus:budget_updated', handleBudgetUpdate);
      window.removeEventListener(
        'nexus:inventory_updated',
        handleInventoryUpdate
      );
      window.removeEventListener(
        'nexus:autopilot_toggled',
        handleAutopilotToggle
      );
      window.removeEventListener('nexus:record_decision', handleRecordDecision);
      window.removeEventListener('nexus:strategy_changed', handleStrategyChanged);
      window.removeEventListener('nexus:scenario_injected', handleScenarioInjected);
      window.removeEventListener('nexus:directive_executed', handleDirectiveExecuted);
    };
  }, [rawProducts, executeFix, executeAllReallocations, toggleAutoPilot, recordDecision]);

  // Compute derived products dynamically
  const products = useMemo(() => {
    return rawProducts.map((p) => deriveProduct(p));
  }, [rawProducts]);

  // Compute live reallocations feed dynamically from real product state
  const reallocations = useMemo(() => {
    return generateReallocations(products);
  }, [products]);

  // Top dynamic KPIs
  const topKpis = useMemo(() => {
    let totalSpend = 0;
    let totalRev = 0;
    let issues = 0;
    let atRisk = 0;

    for (const p of products) {
      totalSpend += p.dailySpend;
      totalRev += p.revenue;

      const needsFix = !p.isFixed && p.status !== 'target met';
      if (needsFix) {
        issues += 1;
        atRisk += p.dailySpend;
      }
    }

    const blended = totalSpend > 0 ? totalRev / totalSpend : 0;
    return {
      blendedRoas: blended,
      totalDailySpend: totalSpend,
      openIssuesCount: issues,
      spendAtRisk: atRisk,
    };
  }, [products]);

  const value = useMemo(
    () => ({
      products,
      ledger,
      reallocations,
      autoPilot,
      topKpis,
      executeFix,
      executeReallocation,
      executeAllReallocations,
      toggleAutoPilot,
      resetToDefaults,
      recordDecision,
    }),
    [
      products,
      ledger,
      reallocations,
      autoPilot,
      topKpis,
      executeFix,
      executeReallocation,
      executeAllReallocations,
      toggleAutoPilot,
      resetToDefaults,
      recordDecision,
    ]
  );

  return (
    <DecisionEngineContext.Provider value={value}>
      {children}
    </DecisionEngineContext.Provider>
  );
}

export function useDecisionEngine(): DecisionEngineStoreState {
  const ctx = useContext(DecisionEngineContext);
  if (!ctx) {
    throw new Error('useDecisionEngine must be used within a DecisionEngineProvider');
  }
  return ctx;
}
