'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { AnomalyCard } from '@/features/decision-engine/components/anomaly-card';
import { ProductAnalysisModal, type ProductAnalysisTarget } from '@/features/decision-engine/components/product-analysis-modal';
import initialEngineState from '@/data/nexus-engine-state.json';
import { toast } from 'sonner';

export default function AnomaliesPage() {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'WARNING'>('ALL');
  const [analyzingProduct, setAnalyzingProduct] = useState<ProductAnalysisTarget | null>(null);
  const anomalies = initialEngineState.anomalies;

  const filtered = anomalies.filter((a: any) =>
    filterSeverity === 'ALL' ? true : a.severity === filterSeverity
  );

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6 bg-[#000000] text-white min-h-screen'>
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-[#8A8A8A] pb-4'>
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

        <div className='flex items-center gap-1.5 bg-[#1A1A1A] p-1 rounded border border-[#8A8A8A] text-xs font-mono'>
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

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
        {filtered.map((anom: any) => (
          <AnomalyCard
            key={anom.id}
            anomaly={anom}
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
            onMitigate={(a) => {
              toast.success(`Dispatched mitigation for ${a.campaign}`, {
                description: 'Sent reallocation order to autonomous optimizer.'
              });
            }}
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
    </div>
  );
}
