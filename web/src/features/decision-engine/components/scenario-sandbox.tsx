'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { MetaLogo, GoogleLogo, AmazonLogo } from '@/components/icons/platform-logos';

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
    <Card className="p-5 border border-[#1A1A1A] bg-[#1A1A1A] shadow-none rounded text-[#FFFFFF]">
      <div className="flex items-center justify-between mb-4 border-b border-[#000000] pb-3">
        <div>
          <h3 className="text-sm font-semibold text-[#FFFFFF] tracking-tight flex items-center gap-2 font-mono">
            <IconAdjustmentsHorizontal className="h-4 w-4 text-[#FFFFFF]" />
            Interactive What-If Scenario Sandbox
          </h3>
          <p className="text-xs text-[#8A8A8A] font-mono mt-0.5">
            Adjust channel spend allocations in real-time with instant SLSQP Hill saturation &amp; profit recalculation
          </p>
        </div>
        <Button size="sm" onClick={handleApply} className="bg-[#FFFFFF] hover:bg-[#8A8A8A] text-[#000000] text-xs font-mono font-semibold border-none active:scale-[0.98]">
          Apply Scenario Vector
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        {/* Meta Slider */}
        <div className="p-3.5 rounded bg-[#000000] border border-[#1A1A1A] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-medium">
            <span className="flex items-center gap-1.5 text-[#FFFFFF]">
              <MetaLogo size={14} className="shrink-0" /> Meta Ads
            </span>
            <span className="font-mono text-[#FFFFFF] font-bold">${metaSpend} / day</span>
          </div>
          <input
            type="range"
            min={0}
            max={1500}
            step={25}
            value={metaSpend}
            onChange={(e) => setMetaSpend(Number(e.target.value))}
            className="w-full accent-[#FFFFFF] cursor-pointer"
          />
          <div className="flex items-center justify-between text-[11px] font-mono text-[#8A8A8A]">
            <span>Forecasted Rev: ${metaRev.toFixed(0)}</span>
            <Badge variant="outline" className="text-[10px] font-mono border-none text-[#8A8A8A] bg-[#1A1A1A]">Stockout Throttled</Badge>
          </div>
        </div>

        {/* Google Slider */}
        <div className="p-3.5 rounded bg-[#000000] border border-[#1A1A1A] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-medium">
            <span className="flex items-center gap-1.5 text-[#FFFFFF]">
              <GoogleLogo size={14} className="shrink-0" /> Google Search
            </span>
            <span className="font-mono text-[#FFFFFF] font-bold">${googleSpend} / day</span>
          </div>
          <input
            type="range"
            min={200}
            max={1500}
            step={25}
            value={googleSpend}
            onChange={(e) => setGoogleSpend(Number(e.target.value))}
            className="w-full accent-[#FFFFFF] cursor-pointer"
          />
          <div className="flex items-center justify-between text-[11px] font-mono text-[#8A8A8A]">
            <span>Forecasted Rev: ${googleRev.toFixed(0)}</span>
            <Badge variant="outline" className="text-[10px] font-mono border-none text-[#FFFFFF] bg-[#1A1A1A]">In-Stock Hero</Badge>
          </div>
        </div>

        {/* Amazon Slider */}
        <div className="p-3.5 rounded bg-[#000000] border border-[#1A1A1A] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-medium">
            <span className="flex items-center gap-1.5 text-[#FFFFFF]">
              <AmazonLogo size={14} className="shrink-0" /> Amazon SP
            </span>
            <span className="font-mono text-[#FFFFFF] font-bold">${amazonSpend} / day</span>
          </div>
          <input
            type="range"
            min={200}
            max={1500}
            step={25}
            value={amazonSpend}
            onChange={(e) => setAmazonSpend(Number(e.target.value))}
            className="w-full accent-[#FFFFFF] cursor-pointer"
          />
          <div className="flex items-center justify-between text-[11px] font-mono text-[#8A8A8A]">
            <span>Forecasted Rev: ${amazonRev.toFixed(0)}</span>
            <Badge variant="outline" className="text-[10px] font-mono border-none text-[#FFFFFF] bg-[#1A1A1A]">High Buy-Box</Badge>
          </div>
        </div>
      </div>

      {/* Instant Outcome Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-[#000000] text-xs font-mono">
        <div className="p-2.5 rounded bg-[#000000]">
          <span className="text-[#8A8A8A] block text-[11px]">Total Budget</span>
          <span className="text-sm font-mono font-bold text-[#FFFFFF]">${totalSpend.toLocaleString()}</span>
        </div>
        <div className="p-2.5 rounded bg-[#000000]">
          <span className="text-[#8A8A8A] block text-[11px]">Forecasted Blended ROAS</span>
          <span className="text-sm font-mono font-bold text-[#FFFFFF]">{blendedRoas.toFixed(2)}x</span>
        </div>
        <div className="p-2.5 rounded bg-[#000000]">
          <span className="text-[#8A8A8A] block text-[11px]">Blended POAS</span>
          <span className="text-sm font-mono font-bold text-[#FFFFFF]">{poas.toFixed(2)}x</span>
        </div>
        <div className="p-2.5 rounded bg-[#000000]">
          <span className="text-[#8A8A8A] block text-[11px]">Net Contribution Margin</span>
          <span className="text-sm font-mono font-bold text-[#FFFFFF]">+${netContribution.toFixed(2)}</span>
        </div>
      </div>
    </Card>
  );
}
