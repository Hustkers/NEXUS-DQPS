'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {
  INITIAL_PRODUCTS,
  INITIAL_LEDGER,
  deriveProduct,
  generateReallocations,
  buildPlan as buildPlanEngine,
  executeAction as executeActionEngine,
  type ProductModel,
  type DerivedProduct,
  type ReallocationItem,
  type GaugesLedgerItem,
  type ActionPlan,
  type FixPlanSummary,
} from '@/lib/gauges-engine';
import { toast } from 'sonner';

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
  buildPlan: (actionId: string) => ActionPlan;
  executeAction: (
    actionId: string,
    options?: { isAuto?: boolean }
  ) => Promise<{ success: boolean; plan: ActionPlan; ledgerEntry: GaugesLedgerItem }>;
  executeAllReallocations: () => Promise<{ count: number; totalMoved: number; totalLift: number }>;
  toggleAutoPilot: (enabled: boolean) => void;
  resetToDefaults: () => void;
  // Compatibility methods
  executeFix: (productId: string, plan?: FixPlanSummary) => Promise<{ success: boolean }>;
  executeReallocation: (reallocation: ReallocationItem, isAuto?: boolean) => Promise<{ success: boolean }>;
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
  const [executedActionIds, setExecutedActionIds] = useState<Set<string>>(new Set());

  // Concurrency guard ref to prevent synchronous double-clicks
  const inFlightActionsRef = useRef<Set<string>>(new Set());

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

  // Cross-tab synchronization
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

  // Compute derived products dynamically from single source of truth
  const products = useMemo(() => {
    return rawProducts.map((p) => deriveProduct(p));
  }, [rawProducts]);

  // Compute live reallocations stream dynamically from derived products
  const reallocations = useMemo(() => {
    return generateReallocations(products);
  }, [products]);

  // Top dynamic KPIs computed from current state
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

  // PURE FUNCTION 1: buildPlan (looks up from current state)
  const buildPlan = useCallback(
    (actionId: string): ActionPlan => {
      return buildPlanEngine({ products }, actionId);
    },
    [products]
  );

  // PURE FUNCTION 2: executeAction (validates, applies deltas, writes ledger row)
  const executeAction = useCallback(
    async (
      actionId: string,
      options?: { isAuto?: boolean }
    ): Promise<{ success: boolean; plan: ActionPlan; ledgerEntry: GaugesLedgerItem }> => {
      // Idempotency: Reject duplicate executions immediately
      if (inFlightActionsRef.current.has(actionId) || executedActionIds.has(actionId)) {
        throw new Error(`Action "${actionId}" is already executed or in progress.`);
      }

      inFlightActionsRef.current.add(actionId);

      try {
        // Execute pure state transition
        const { updatedProducts, newLedgerEntry, plan } = executeActionEngine(
          rawProducts,
          actionId,
          {
            isAuto: options?.isAuto,
            alreadyExecutedIds: executedActionIds,
          }
        );

        // Apply changes atomically to the store
        setRawProducts(updatedProducts);
        setLedger((currLedger) => [newLedgerEntry, ...currLedger]);
        setExecutedActionIds((prev) => new Set([...prev, actionId]));

        return { success: true, plan, ledgerEntry: newLedgerEntry };
      } catch (err) {
        inFlightActionsRef.current.delete(actionId);
        // Leave store completely unchanged
        throw err;
      }
    },
    [rawProducts, executedActionIds]
  );

  // Execute All: runs recommendations sequentially via executeActionEngine
  const executeAllReallocations = useCallback(async () => {
    let currentCatalog = [...rawProducts];
    const newEntries: GaugesLedgerItem[] = [];
    let count = 0;
    let totalMoved = 0;
    let totalLift = 0;

    while (true) {
      const currentDerived = currentCatalog.map((p) => deriveProduct(p));
      const currentList = generateReallocations(currentDerived);
      if (currentList.length === 0) break;

      const item = currentList[0];
      try {
        const { updatedProducts, newLedgerEntry, plan } = executeActionEngine(
          currentCatalog,
          item.id,
          { isAuto: false, alreadyExecutedIds: inFlightActionsRef.current }
        );

        currentCatalog = updatedProducts;
        newEntries.unshift(newLedgerEntry);
        inFlightActionsRef.current.add(item.id);
        count += 1;
        totalMoved += plan.movedAmount;
        totalLift += plan.netRevenueLift;
      } catch {
        break;
      }
    }

    if (count > 0) {
      setRawProducts(currentCatalog);
      setLedger((currLedger) => [...newEntries, ...currLedger]);
      setExecutedActionIds((prev) => new Set([...prev, ...newEntries.map((e) => e.id)]));
    }

    return { count, totalMoved, totalLift };
  }, [rawProducts]);

  // Toggle Auto-Pilot: when on, executes confidence >= 80% through the same engine
  const toggleAutoPilot = useCallback(
    (enabled: boolean) => {
      setAutoPilotState(enabled);

      if (enabled) {
        let currentCatalog = [...rawProducts];
        const newEntries: GaugesLedgerItem[] = [];
        let count = 0;

        while (true) {
          const currentDerived = currentCatalog.map((p) => deriveProduct(p));
          const currentList = generateReallocations(currentDerived);
          const autoCandidates = currentList.filter((it) => it.confidence >= 80);
          if (autoCandidates.length === 0) break;

          const item = autoCandidates[0];
          try {
            const { updatedProducts, newLedgerEntry } = executeActionEngine(
              currentCatalog,
              item.id,
              { isAuto: true, alreadyExecutedIds: inFlightActionsRef.current }
            );

            currentCatalog = updatedProducts;
            newEntries.unshift(newLedgerEntry);
            inFlightActionsRef.current.add(item.id);
            count += 1;
          } catch {
            break;
          }
        }

        if (count > 0) {
          setRawProducts(currentCatalog);
          setLedger((currLedger) => [...newEntries, ...currLedger]);
          setExecutedActionIds((prev) => new Set([...prev, ...newEntries.map((e) => e.id)]));
          toast.success(`Auto-Pilot moved ${count} budget${count > 1 ? 's' : ''}`);
        }
      }
    },
    [rawProducts]
  );

  // Reset to default seed state
  const resetToDefaults = useCallback(() => {
    setRawProducts(INITIAL_PRODUCTS);
    setLedger(INITIAL_LEDGER);
    setAutoPilotState(false);
    inFlightActionsRef.current.clear();
    setExecutedActionIds(new Set());
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY_PRODUCTS);
      localStorage.removeItem(LOCAL_STORAGE_KEY_LEDGER);
      localStorage.removeItem(LOCAL_STORAGE_KEY_AUTOPILOT);
    } catch {}
  }, []);

  // Backward compatibility handlers
  const executeFix = useCallback(
    async (productId: string) => {
      const res = await executeAction(`fix-${productId}`);
      return { success: res.success };
    },
    [executeAction]
  );

  const executeReallocation = useCallback(
    async (item: ReallocationItem, isAuto = false) => {
      const res = await executeAction(item.id, { isAuto });
      return { success: res.success };
    },
    [executeAction]
  );

  const value = useMemo(
    () => ({
      products,
      ledger,
      reallocations,
      autoPilot,
      topKpis,
      buildPlan,
      executeAction,
      executeAllReallocations,
      toggleAutoPilot,
      resetToDefaults,
      executeFix,
      executeReallocation,
    }),
    [
      products,
      ledger,
      reallocations,
      autoPilot,
      topKpis,
      buildPlan,
      executeAction,
      executeAllReallocations,
      toggleAutoPilot,
      resetToDefaults,
      executeFix,
      executeReallocation,
    ]
  );

  return (
    <DecisionEngineContext.Provider value={value}>
      {children}
    </DecisionEngineContext.Provider>
  );
}

export function useDecisionEngine(): DecisionEngineStoreState {
  const context = useContext(DecisionEngineContext);
  if (!context) {
    throw new Error('useDecisionEngine must be used within a DecisionEngineProvider');
  }
  return context;
}
