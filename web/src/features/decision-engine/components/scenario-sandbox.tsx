'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { MetaLogo, GoogleLogo, AmazonLogo } from '@/components/icons/platform-logos';
import { toast } from 'sonner';

export function ScenarioSandbox({ onApplyReallocation }: { onApplyReallocation?: (alloc: any) => void }) {
  const [metaSpend, setMetaSpend] = useState(0); // Shifted away from stockout
  const [googleSpend, setGoogleSpend] = useState(750);
  const [amazonSpend, setAmazonSpend] = useState(625);

  const totalSpend = metaSpend + googleSpend + amazonSpend;

  // Real-time Hill saturation estimation
  const googleRev = 5500 * (Math.pow(googleSpend, 1.45) / (Math.pow(1250, 1.45) + Math.pow(googleSpend, 1.45)));
  const amazonRev = 5000 * (Math.pow(amazonSpend, 2.1) / (Math.pow(700, 2.1) + Math.pow(amazonSpend, 2.1)));
  const metaRev = metaSpend > 0 ? 4500 * (Math.pow(metaSpend, 1.75) / (Math.pow(850, 1.75) + Math.pow(metaSpend, 1.75))) : 0;

  const totalRev = googleRev + amazonRev + metaRev;
  const totalCogs = totalRev * 0.35;
  const grossMargin = totalRev - totalCogs;
  const netContribution = grossMargin - totalSpend - totalRev * 0.03;
  const blendedRoas = totalSpend > 0 ? totalRev / totalSpend : 0;
  const poas = totalSpend > 0 ? grossMargin / totalSpend : 0;

  const handleApply = () => {
    if (onApplyReallocation) {
      onApplyReallocation({ meta: metaSpend, google: googleSpend, amazon: amazonSpend });
    }
    toast.success('Applied Scenario Reallocation Vector', {
      description: `Meta: ₹${metaSpend}/d • Google: ₹${googleSpend}/d • Amazon: ₹${amazonSpend}/d. Net Margin Lift: +₹${Math.round(netContribution).toLocaleString()}.`
    });
  };

  return (
    <Card className="p-5 border border-border bg-card shadow-none rounded text-card-foreground">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2 font-mono">
            <IconAdjustmentsHorizontal className="h-4 w-4 text-foreground" />
            Interactive What-If Scenario Sandbox
          </h3>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            Adjust channel spend allocations in real-time with instant SLSQP Hill saturation &amp; profit recalculation
          </p>
        </div>
        <Button size="sm" onClick={handleApply} className="bg-foreground hover:bg-foreground/90 text-background text-xs font-mono font-semibold border-none active:scale-[0.98]">
          Apply Scenario Vector
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        {/* Meta Slider */}
        <div className="p-3.5 rounded bg-muted/40 border border-border space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-medium">
            <span className="flex items-center gap-1.5 text-foreground">
              <MetaLogo size={14} className="shrink-0" /> Meta Ads
            </span>
            <span className="font-mono text-foreground font-bold">₹{metaSpend} / day</span>
          </div>
          <input
            type="range"
            min={0}
            max={1500}
            step={25}
            value={metaSpend}
            onChange={(e) => setMetaSpend(Number(e.target.value))}
            className="w-full accent-foreground cursor-pointer"
          />
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span>Forecasted Rev: ₹{metaRev.toFixed(0)}</span>
            <Badge variant="outline" className="text-[10px] font-mono border border-border text-muted-foreground bg-muted">Stockout Throttled</Badge>
          </div>
        </div>

        {/* Google Slider */}
        <div className="p-3.5 rounded bg-muted/40 border border-border space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-medium">
            <span className="flex items-center gap-1.5 text-foreground">
              <GoogleLogo size={14} className="shrink-0" /> Google Search
            </span>
            <span className="font-mono text-foreground font-bold">₹{googleSpend} / day</span>
          </div>
          <input
            type="range"
            min={200}
            max={1500}
            step={25}
            value={googleSpend}
            onChange={(e) => setGoogleSpend(Number(e.target.value))}
            className="w-full accent-foreground cursor-pointer"
          />
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span>Forecasted Rev: ₹{googleRev.toFixed(0)}</span>
            <Badge variant="outline" className="text-[10px] font-mono border border-border text-foreground bg-muted">In-Stock Hero</Badge>
          </div>
        </div>

        {/* Amazon Slider */}
        <div className="p-3.5 rounded bg-muted/40 border border-border space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-medium">
            <span className="flex items-center gap-1.5 text-foreground">
              <AmazonLogo size={14} className="shrink-0" /> Amazon SP
            </span>
            <span className="font-mono text-foreground font-bold">₹{amazonSpend} / day</span>
          </div>
          <input
            type="range"
            min={200}
            max={1500}
            step={25}
            value={amazonSpend}
            onChange={(e) => setAmazonSpend(Number(e.target.value))}
            className="w-full accent-foreground cursor-pointer"
          />
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span>Forecasted Rev: ₹{amazonRev.toFixed(0)}</span>
            <Badge variant="outline" className="text-[10px] font-mono border border-border text-foreground bg-muted">High Buy-Box</Badge>
          </div>
        </div>
      </div>

      {/* Instant Outcome Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-border text-xs font-mono">
        <div className="p-2.5 rounded bg-muted/40 border border-border">
          <span className="text-muted-foreground block text-[11px]">Total Budget</span>
          <span className="text-sm font-mono font-bold text-foreground">₹{totalSpend.toLocaleString()}</span>
        </div>
        <div className="p-2.5 rounded bg-muted/40 border border-border">
          <span className="text-muted-foreground block text-[11px]">Forecasted Blended ROAS</span>
          <span className="text-sm font-mono font-bold text-foreground">{blendedRoas.toFixed(2)}x</span>
        </div>
        <div className="p-2.5 rounded bg-muted/40 border border-border">
          <span className="text-muted-foreground block text-[11px]">Blended POAS</span>
          <span className="text-sm font-mono font-bold text-foreground">{poas.toFixed(2)}x</span>
        </div>
        <div className="p-2.5 rounded bg-muted/40 border border-border">
          <span className="text-muted-foreground block text-[11px]">Net Contribution Margin</span>
          <span className="text-sm font-mono font-bold text-foreground">+₹{netContribution.toFixed(2)}</span>
        </div>
      </div>
    </Card>
  );
}
