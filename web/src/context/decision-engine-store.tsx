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

  // Action: Execute Fix from card
  const executeFix = useCallback((productId: string, plan: FixPlanSummary) => {
    setRawProducts((prev) => {
      const { updatedProducts, newLedgerEntry } = applyFixPlan(prev, productId, plan);
      setLedger((currLedger) => [newLedgerEntry, ...currLedger]);
      return updatedProducts;
    });
  }, []);

  // Action: Execute single Reallocation from stream
  const executeReallocation = useCallback((item: ReallocationItem, isAuto = false) => {
    setRawProducts((prev) => {
      const { updatedProducts, newLedgerEntry } = applyReallocation(prev, item, isAuto);
      setLedger((currLedger) => [newLedgerEntry, ...currLedger]);
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
