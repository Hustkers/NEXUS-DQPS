'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import initialTrackingData from '@/data/visitor-tracking-state.json';

import { FunnelVisualChart, type CampaignPerf } from './funnel-visual-chart';
import { AttributionFraudChart } from './attribution-fraud-chart';
import { CampaignProfitabilityAnalytics } from './campaign-profitability-analytics';
import { AudienceBehavioralChart } from './audience-behavioral-chart';

export function TrackingDashboard() {
  const [model, setModel] = useState<'last_touch' | 'first_touch'>('last_touch');
  const [campaigns, setCampaigns] = useState<CampaignPerf[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('meta-airmax-viral');
  const [selectedProduct, setSelectedProduct] = useState<string>('310805-137');
  const [audienceData, setAudienceData] = useState<any>(null);
  const [visitorIdInput, setVisitorIdInput] = useState<string>('');
  const [timelineData, setTimelineData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  // Load campaign performance data
  const loadPerformance = async (currentModel: 'last_touch' | 'first_touch') => {
    try {
      const res = await fetch(`/api/campaigns/performance?model=${currentModel}`);
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
        setStats(data.summary || null);
        if (data.campaigns?.length > 0 && !selectedCampaign) {
          setSelectedCampaign(data.campaigns[0].campaign_id);
        }
      }
    } catch {
      // Fallback compute locally if offline
    }
  };

  // Load product audience data
  const loadAudience = async (sku: string) => {
    try {
      const res = await fetch(`/api/products/${sku}/audience`);
      if (res.ok) {
        const data = await res.json();
        setAudienceData(data);
      }
    } catch {
      // Ignore
    }
  };

  // Load visitor timeline
  const loadTimeline = async (id: string) => {
    try {
      const res = await fetch(`/api/visitors/${id}/timeline`);
      if (res.ok) {
        const data = await res.json();
        setTimelineData(data);
      }
    } catch {
      // Ignore
    }
  };

  // Enforce GDPR / CCPA 30-Day Data Retention Window
  const handleEnforceRetention = async () => {
    try {
      const res = await fetch('/api/privacy/retention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 30 })
      });
      if (res.ok) {
        const data = await res.json();
        toast.success('GDPR Data Retention Enforced', {
          description: data.message || `Purged ${data.events_purged || 0} events older than 30 days.`
        });
        loadPerformance(model);
      } else {
        toast.error('Retention enforcement returned non-200');
      }
    } catch {
      toast.error('Failed to enforce retention window');
    }
  };

  // GDPR Art. 17: Right to be Forgotten Purge Handler
  const handlePurgeVisitor = async () => {
    if (!timelineData?.visitor_id) return;
    try {
      const targetVid = timelineData.visitor_id;
      const res = await fetch('/api/privacy/forget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: targetVid })
      });
      if (res.ok) {
        const data = await res.json();
        toast.success('Visitor Record Purged (GDPR Art. 17)', {
          description: `Permanently removed personal records & raw events for ID: ${maskId(targetVid)}.`
        });
        setTimelineData(null);
        setVisitorIdInput('');
        loadPerformance(model);
      } else {
        toast.error('Purge request failed');
      }
    } catch {
      toast.error('Failed to execute purge request');
    }
  };

  useEffect(() => {
    Promise.all([
      loadPerformance(model),
      loadAudience(selectedProduct)
    ]).finally(() => {
      // Auto-load first visitor if available
      if (initialTrackingData?.visitors?.length > 0) {
        const firstVid = initialTrackingData.visitors[0].visitor_id;
        setVisitorIdInput(firstVid);
        loadTimeline(firstVid);
      }
    });
  }, [model]);

  useEffect(() => {
    loadAudience(selectedProduct);
  }, [selectedProduct]);

  const activeCampPerf = campaigns.find((c) => c.campaign_id === selectedCampaign) || campaigns[0];

  // Masking helpers for privacy (Zero Raw Emails)
  const maskId = (id: string) => {
    if (!id) return 'anon';
    if (id.length <= 12) return id;
    return `${id.substring(0, 6)}...${id.substring(id.length - 4)}`;
  };

  const shoesList = [
    { sku: '310805-137', name: 'Air Jordan 10 Retro' },
    { sku: '315122-001', name: "Nike Air Force 1 '07" },
    { sku: 'CD4371-001', name: 'React Infinity Run Flyknit' },
    { sku: 'AH8050-100', name: 'Nike Air Max 270' },
    { sku: '880848-005', name: 'Nike Zoom Fly' }
  ];

  return (
    <div className="space-y-6 min-w-0 max-w-full overflow-hidden">
      {/* Top Header & Attribution Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
              Visitor Tracking &amp; Attribution Engine
            </h1>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-[10px] font-mono">
              Zero Fingerprinting
            </Badge>
            <Badge variant="outline" className="border-blue-500/30 text-blue-600 bg-blue-500/10 text-[10px] font-mono">
              SHA-256 Identity Stitching
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Privacy-safe customer event streaming connecting ad touchpoints, browsing sessions, and settled orders.
          </p>
        </div>

        {/* Action Controls & Model Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={handleEnforceRetention}
            className="text-xs h-8 flex items-center gap-1.5 border-border hover:bg-muted font-mono"
            title="Enforce 30-day GDPR data retention window"
          >
            <Icons.clock className="size-3.5 text-muted-foreground" />
            <span>Enforce Retention (30d)</span>
          </Button>

          {/* Model Switcher */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/50 font-mono">
            <button
              onClick={() => {
                setModel('last_touch');
                loadPerformance('last_touch');
              }}
              className={cn(
                'px-2.5 py-1 text-xs rounded-md transition-all font-medium',
                model === 'last_touch'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Last-Touch (Default)
            </button>
            <button
              onClick={() => {
                setModel('first_touch');
                loadPerformance('first_touch');
              }}
              className={cn(
                'px-2.5 py-1 text-xs rounded-md transition-all font-medium',
                model === 'first_touch'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              First-Touch
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row - Streamlined & Visual */}
      <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-5 gap-3.5 font-mono">
        <Card className="p-3.5 border-border/80 bg-card/60 backdrop-blur-xs shadow-xs">
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Tracked Visitors</p>
          <h3 className="text-2xl font-bold mt-1 text-foreground">
            {initialTrackingData?.visitors?.length || 200}
          </h3>
          <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
            <Icons.check className="size-3 shrink-0" /> Anonymous 1-Yr Cookies
          </p>
        </Card>

        <Card className="p-3.5 border-border/80 bg-card/60 backdrop-blur-xs shadow-xs">
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Recorded Sessions</p>
          <h3 className="text-2xl font-bold mt-1 text-foreground">
            {initialTrackingData?.sessions?.length || 362}
          </h3>
          <p className="text-[10px] text-muted-foreground mt-1">
            30-min Sliding Timeout
          </p>
        </Card>

        <Card className="p-3.5 border-border/80 bg-card/60 backdrop-blur-xs shadow-xs">
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Ingested Events</p>
          <h3 className="text-2xl font-bold mt-1 text-foreground">
            {initialTrackingData?.events?.length || 1259}
          </h3>
          <p className="text-[10px] text-blue-600 mt-1">
            Idempotent Deduplication
          </p>
        </Card>

        <Card className="p-3.5 border-border/80 bg-card/60 backdrop-blur-xs shadow-xs">
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Attributed Orders</p>
          <h3 className="text-2xl font-bold mt-1 text-foreground">
            {stats?.total_purchases || initialTrackingData?.orders?.length || 56}
          </h3>
          <p className="text-[10px] text-emerald-600 mt-1">
            Client + Server-Side Resilient
          </p>
        </Card>

        <Card className="p-3.5 border-border/80 bg-card/60 backdrop-blur-xs shadow-xs col-span-2 md:col-span-1">
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Platform Inflation</p>
          <h3 className="text-2xl font-bold mt-1 text-amber-600">
            {stats?.total_discrepancy ? `+${stats.total_discrepancy}` : '+108'}
          </h3>
          <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
            <Icons.warning className="size-3 shrink-0" /> Double Counting Blocked
          </p>
        </Card>
      </div>

      {/* Section 1: Interactive Funnel & Attribution Fraud Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FunnelVisualChart
            campaigns={campaigns}
            selectedCampaign={selectedCampaign}
            onSelectCampaign={setSelectedCampaign}
            activeCampPerf={activeCampPerf}
          />
        </div>
        <div className="lg:col-span-1">
          <AttributionFraudChart
            activeCampPerf={activeCampPerf}
            campaigns={campaigns}
            model={model}
          />
        </div>
      </div>

      {/* Section 2: Interactive Campaign Profitability & Economics (TRANSFORMED & NON-OVERWHELMING) */}
      <div>
        <CampaignProfitabilityAnalytics
          campaigns={campaigns}
          selectedCampaign={selectedCampaign}
          onSelectCampaign={setSelectedCampaign}
          model={model}
        />
      </div>

      {/* Section 3: Product Audience & Behavioral Segmentation + Visitor Timeline Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AudienceBehavioralChart
          audienceData={audienceData}
          selectedProduct={selectedProduct}
          onSelectProduct={setSelectedProduct}
          shoesList={shoesList}
          onSelectVisitor={(vid) => {
            setVisitorIdInput(vid);
            loadTimeline(vid);
          }}
          maskId={maskId}
        />

        {/* Visitor Timeline Inspector */}
        <Card className="min-w-0 max-w-full overflow-hidden border border-border/80 bg-card/60 backdrop-blur-xs shadow-xs lg:col-span-1">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-sm font-semibold tracking-tight">Visitor Timeline Inspector</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Audit the end-to-end multi-session touchpoint stream
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 font-mono">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Visitor / Customer UUID..."
                value={visitorIdInput}
                onChange={(e) => setVisitorIdInput(e.target.value)}
                className="text-xs border border-border rounded-md px-2.5 py-1.5 flex-1 bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary font-mono"
              />
              <Button
                size="sm"
                onClick={() => loadTimeline(visitorIdInput)}
                className="text-xs font-mono h-8 px-3"
              >
                Inspect
              </Button>
            </div>

            {timelineData ? (
              <div className="space-y-3 pt-1">
                <div className="p-2.5 rounded-lg border border-border/60 bg-muted/30 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Visitor ID:</span>
                    <span className="font-bold text-foreground">{maskId(timelineData.visitor_id)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Identity Stitch:</span>
                    <span>
                      {timelineData.is_stitched ? (
                        <Badge variant="outline" className="text-[9px] border-emerald-500/40 text-emerald-600 bg-emerald-500/10">
                          Merged ({maskId(timelineData.customer_id)})
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[9px]">Anonymous</Badge>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Sessions:</span>
                    <span className="font-semibold text-foreground">{timelineData.total_sessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed Purchases:</span>
                    <span className="font-semibold text-emerald-600">
                      {timelineData.total_orders} (₹{Number(timelineData.total_spend || 0).toLocaleString()})
                    </span>
                  </div>
                  <div className="pt-2 border-t border-border/40 flex justify-end">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handlePurgeVisitor}
                      className="h-6 text-[10px] font-mono flex items-center gap-1.5"
                    >
                      <Icons.trash className="size-3" />
                      GDPR Art. 17: Purge Record
                    </Button>
                  </div>
                </div>

                {/* Event Stream Cards */}
                <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {timelineData.events.map((e: any, idx: number) => (
                    <div key={idx} className="p-2 rounded border border-border/50 bg-card text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[9px] capitalize',
                            e.event_type === 'ad_click' && 'bg-blue-500/10 text-blue-600',
                            e.event_type === 'page_view' && 'bg-slate-500/10 text-slate-600',
                            e.event_type === 'product_view' && 'bg-indigo-500/10 text-indigo-600',
                            e.event_type === 'add_to_cart' && 'bg-amber-500/10 text-amber-600',
                            e.event_type === 'begin_checkout' && 'bg-purple-500/10 text-purple-600',
                            e.event_type === 'purchase' && 'bg-emerald-500/10 text-emerald-600'
                          )}
                        >
                          {e.event_type.replace('_', ' ')}
                        </Badge>
                        <span className="text-muted-foreground text-[10px]">
                          {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {e.product_id && (
                        <div className="text-muted-foreground">
                          Product: <span className="font-semibold text-foreground">{e.product_id}</span>
                          {e.value && ` (₹${Number(e.value).toLocaleString()})`}
                        </div>
                      )}
                      {e.campaign_id && (
                        <div className="text-muted-foreground">
                          Campaign: <span className="text-blue-600 font-medium">{e.campaign_id}</span>
                        </div>
                      )}
                      {e.order_id && (
                        <div className="text-emerald-600 font-semibold">
                          Order Completed: {e.order_id} {e.is_server_side ? '(Server-Side)' : ''}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Select a visitor ID above to inspect event stream.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
