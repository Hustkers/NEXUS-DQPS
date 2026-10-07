'use client';

import React, { useState, useEffect } from 'react';
import { Icons } from '@/components/icons';
import { AnomalyCard, type AnomalyItem } from '@/features/decision-engine/components/anomaly-card';
import { ProductAnalysisModal, type ProductAnalysisTarget } from '@/features/decision-engine/components/product-analysis-modal';
import { ReallocationExecutionModal } from '@/features/decision-engine/components/reallocation-execution-modal';
import type { ReallocationExecutionDetails } from '@/features/decision-engine/types/reallocation-execution';
import initialEngineState from '@/data/nexus-engine-state.json';
import { toast } from 'sonner';

export default function AnomaliesPage() {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'WARNING'>('ALL');
  const [analyzingProduct, setAnalyzingProduct] = useState<ProductAnalysisTarget | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>(initialEngineState.anomalies as unknown as AnomalyItem[]);
  
  // Auto-Reallocate Modal state
  const [selectedReallocationDetails, setSelectedReallocationDetails] = useState<ReallocationExecutionDetails | null>(null);
  const [isReallocationModalOpen, setIsReallocationModalOpen] = useState(false);
  const [isAlreadyExecuted, setIsAlreadyExecuted] = useState(false);
  const [mitigatingAnomalyId, setMitigatingAnomalyId] = useState<string | null>(null);

  // Fetch live anomalies status from API on mount
  useEffect(() => {
    let isMounted = true;
    async function loadLiveAnomalies() {
      try {
        const res = await fetch('/api/anomalies');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.anomalies) && isMounted) {
            setAnomalies(data.anomalies);
          }
        }
      } catch {
        // Fallback to initialEngineState if offline
      }
    }
    loadLiveAnomalies();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = anomalies.filter((a) =>
    filterSeverity === 'ALL' ? true : a.severity === filterSeverity
  );

  const handleAutoReallocate = async (anomaly: AnomalyItem) => {
    // Prevent duplicate clicks
    if (mitigatingAnomalyId) return;

    setMitigatingAnomalyId(anomaly.id);
    try {
      const res = await fetch('/api/reallocations/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anomalyId: anomaly.id })
      });

      const data = await res.json();

      if (res.ok && data.success && data.details) {
        setSelectedReallocationDetails(data.details);
        setIsAlreadyExecuted(false);
        setIsReallocationModalOpen(true);
      } else if (data.code === 'ALREADY_REALLOCATED') {
        // If already reallocated, open receipt directly
        if (data.details) {
          setSelectedReallocationDetails(data.details);
        }
        setIsAlreadyExecuted(true);
        setIsReallocationModalOpen(true);
        toast.info('Reallocation Already Audited', {
          description: data.message
        });
      } else {
        toast.error('Reallocation Unavailable', {
          description: data.message || 'No safe reallocation path identified for this campaign.'
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not communicate with autonomous optimization engine.';
      toast.error('Analysis Request Failed', {
        description: message
      });
    } finally {
      setMitigatingAnomalyId(null);
    }
  };

  const handleConfirmExecution = async (details: ReallocationExecutionDetails) => {
    const anomalyId = details.anomaly?.id || details.item.id.replace('realloc-', '');
    try {
      const res = await fetch('/api/reallocations/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anomalyId,
          targetCampaign: details.destination.campaign,
          deltaSpend: details.capitalMoved
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Mark anomaly as reallocated in state
        setAnomalies((prev) =>
          prev.map((a) =>
            a.id === anomalyId
              ? {
                  ...a,
                  isReallocated: true,
                  reallocationId: data.receipt?.id || details.ledgerRecord.id,
                  reallocatedAt: data.receipt?.timestamp || details.ledgerRecord.timestamp
                }
              : a
          )
        );

        toast.success(`Autonomous Reallocation Dispatched`, {
          description: `Shifted ₹${Math.round(details.capitalMoved).toLocaleString('en-IN')}/day to ${details.destination.productName}. Decision ID: ${data.receipt?.id || details.ledgerRecord.id}.`
        });

        return {
          success: true,
          receipt: data.receipt,
          details: data.details || details
        };
      } else {
        toast.error('Reallocation Failed', {
          description: data.message || 'Optimizer rejected budget transfer directive.'
        });
        return {
          success: false,
          error: data.message
        };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to dispatch allocation directive.';
      toast.error('Execution Network Error', {
        description: message
      });
      return {
        success: false,
        error: message
      };
    }
  };

  const handleViewReceipt = (anomaly: AnomalyItem) => {
    handleAutoReallocate(anomaly);
  };

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-[#000000] text-white min-h-screen min-w-0 max-w-full'>
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-[#1A1A1A] pb-4'>
        <div>
          <div className='flex items-center gap-2'>
            <Icons.warning className='size-5 text-white' />
            <h1 className='text-xl font-mono font-bold text-white uppercase tracking-tight'>
              Diagnostic Root-Cause Analysis (RCA) &amp; Anomalies
            </h1>
          </div>
          <p className='text-xs font-mono text-[#8A8A8A] mt-1'>
            modery68 4-Week Rolling Baselines • IsolationForest &amp; Z-Score Attribution (|Z| &gt; 2.2)
          </p>
        </div>

        <div className='flex items-center gap-1.5 bg-[#1A1A1A] p-1 rounded border border-[#1A1A1A] text-xs font-mono'>
          {(['ALL', 'CRITICAL', 'HIGH', 'WARNING'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded transition-all font-semibold ${
                filterSeverity === sev
                  ? 'bg-white text-black font-bold'
                  : 'text-[#8A8A8A] hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5'>
        {filtered.map((anom) => (
          <AnomalyCard
            key={anom.id}
            anomaly={anom}
            isMitigating={mitigatingAnomalyId === anom.id}
            onAnalyze={(a) => {
              setAnalyzingProduct({
                id: a.id,
                productName: a.productName || a.campaign,
                sku: a.sku,
                photoUrl: a.photoUrl,
                platform: a.platform,
                campaign: a.campaign,
                inventory: a.inventory,
                roas: a.roas,
                spend: a.spend,
                explanation: a.explanation,
                severity: a.severity,
                factors: a.factors
              });
            }}
            onMitigate={handleAutoReallocate}
            onViewReceipt={handleViewReceipt}
          />
        ))}
      </div>

      {/* Analysing Phase Modal featuring 3D GitHub Globe */}
      <ProductAnalysisModal
        product={analyzingProduct}
        isOpen={!!analyzingProduct}
        onClose={() => setAnalyzingProduct(null)}
        onMitigate={(prod) => {
          toast.success(`Autonomous mitigation dispatched for ${prod.productName}`);
        }}
      />

      {/* Real Autonomous Capital Reallocation Modal (Analysis, Progress & Receipt) */}
      <ReallocationExecutionModal
        details={selectedReallocationDetails}
        isOpen={isReallocationModalOpen}
        onClose={() => setIsReallocationModalOpen(false)}
        onConfirmExecution={handleConfirmExecution}
        isAlreadyExecuted={isAlreadyExecuted}
      />
    </div>
  );
}
