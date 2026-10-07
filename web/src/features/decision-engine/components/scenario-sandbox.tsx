'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconAdjustmentsHorizontal } from '@tabler/icons-react';

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
  };

  return (
    <Card className="p-5 border-border/40 bg-card/60 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
            <IconAdjustmentsHorizontal className="h-4 w-4 text-indigo-400" />
            Interactive What-If Scenario Sandbox
          </h3>
          <p className="text-xs text-muted-foreground">
            Adjust channel spend allocations in real-time with instant SLSQP Hill saturation & profit recalculation
          </p>
        </div>
        <Button size="sm" onClick={handleApply} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs">
          Apply Scenario Vector
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        {/* Meta Slider */}
        <div className="p-3.5 rounded-xl bg-background/50 border border-border/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-foreground font-medium">Meta Ads</span>
            <span className="font-mono text-muted-foreground font-bold">${metaSpend} / day</span>
          </div>
          <input
            type="range"
            min={0}
            max={1500}
            step={25}
            value={metaSpend}
            onChange={(e) => setMetaSpend(Number(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer"
          />
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Forecasted Rev: ${metaRev.toFixed(0)}</span>
            <Badge variant="outline" className="text-[10px]">Stockout Throttled</Badge>
          </div>
        </div>

        {/* Google Slider */}
        <div className="p-3.5 rounded-xl bg-background/50 border border-border/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-foreground font-medium">Google Search</span>
            <span className="font-mono text-muted-foreground font-bold">${googleSpend} / day</span>
          </div>
          <input
            type="range"
            min={200}
            max={1500}
            step={25}
            value={googleSpend}
            onChange={(e) => setGoogleSpend(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Forecasted Rev: ${googleRev.toFixed(0)}</span>
            <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">In-Stock Hero</Badge>
          </div>
        </div>

        {/* Amazon Slider */}
        <div className="p-3.5 rounded-xl bg-background/50 border border-border/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-foreground font-medium">Amazon SP</span>
            <span className="font-mono text-muted-foreground font-bold">${amazonSpend} / day</span>
          </div>
          <input
            type="range"
            min={200}
            max={1500}
            step={25}
            value={amazonSpend}
            onChange={(e) => setAmazonSpend(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Forecasted Rev: ${amazonRev.toFixed(0)}</span>
            <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">High Buy-Box</Badge>
          </div>
        </div>
      </div>

      {/* Instant Outcome Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-border/30 text-xs">
        <div className="p-2.5 rounded-lg bg-secondary/30">
          <span className="text-muted-foreground block text-[11px]">Total Budget</span>
          <span className="text-sm font-mono font-bold text-foreground">${totalSpend.toLocaleString()}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-secondary/30">
          <span className="text-muted-foreground block text-[11px]">Forecasted Blended ROAS</span>
          <span className="text-sm font-mono font-bold text-emerald-400">{blendedRoas.toFixed(2)}x</span>
        </div>
        <div className="p-2.5 rounded-lg bg-secondary/30">
          <span className="text-muted-foreground block text-[11px]">Blended POAS</span>
          <span className="text-sm font-mono font-bold text-emerald-400">{poas.toFixed(2)}x</span>
        </div>
        <div className="p-2.5 rounded-lg bg-secondary/30">
          <span className="text-muted-foreground block text-[11px]">Net Contribution Margin</span>
          <span className="text-sm font-mono font-bold text-indigo-400">+${netContribution.toFixed(2)}</span>
        </div>
      </div>
    </Card>
  );
}
