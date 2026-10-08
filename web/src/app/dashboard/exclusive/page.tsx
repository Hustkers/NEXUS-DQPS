'use client';

import React, { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { RangeSlider } from '@/components/ui/slider';
import Link from 'next/link';

export default function ExclusivePage() {
  const [arbitrageActive, setArbitrageActive] = useState(true);
  const [shapleyWeight, setShapleyWeight] = useState(0.85);

  return (
    <PageContainer
      pageTitle='Sovereign Exclusive Features'
      pageDescription='Enterprise-grade multi-touch attribution, autonomous bid arbitrage, and high-frequency hedging'
    >
      <div className='space-y-6 font-mono text-xs'>
        {/* Tier Status Banner */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 shadow-xs'>
          <div>
            <div className='flex items-center gap-2'>
              <Icons.sparkles className='size-5 text-indigo-500' />
              <h2 className='text-base font-bold text-foreground font-sans'>
                Sovereign Enterprise Features Unlocked
              </h2>
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Your organization is operating with dedicated low-latency inference pipelines and zero telemetry retention.
            </p>
          </div>
          <Badge className='bg-indigo-600 text-white font-mono text-xs px-3 py-1'>
            SOVEREIGN TIER ACTIVE
          </Badge>
        </div>

        {/* Feature Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          {/* Card 1: Shapley Incremental Attribution */}
          <Card className='border border-border/80 bg-card shadow-xs'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <Badge variant='outline' className='text-[10px] text-cyan-500 border-cyan-500/30'>
                  ALGORITHMIC ATTRIBUTION
                </Badge>
                <span className='text-[11px] text-muted-foreground'>Calibrated 2m ago</span>
              </div>
              <CardTitle className='text-base font-bold font-sans mt-2'>
                Shapley Value &amp; Markov Chain Attribution
              </CardTitle>
              <CardDescription className='text-xs'>
                Eliminate last-touch bias by computing true cooperative game theory contribution across Meta, Google Search, and Amazon Ads.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex justify-between text-xs'>
                  <span className='text-muted-foreground'>Incrementality Weight</span>
                  <span className='font-bold text-foreground font-mono'>{(shapleyWeight * 100).toFixed(0)}%</span>
                </div>
                <RangeSlider
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={shapleyWeight}
                  onChange={(e) => setShapleyWeight(parseFloat(e.target.value))}
                  activeColor='#6366f1'
                />
              </div>

              <div className='p-3 rounded-lg border border-border/60 bg-muted/30 grid grid-cols-3 gap-2 text-center text-xs'>
                <div>
                  <span className='text-muted-foreground block text-[10px]'>Meta Incrementality</span>
                  <strong className='text-emerald-500 font-bold'>+38.4%</strong>
                </div>
                <div>
                  <span className='text-muted-foreground block text-[10px]'>Google Search</span>
                  <strong className='text-indigo-400 font-bold'>+54.2%</strong>
                </div>
                <div>
                  <span className='text-muted-foreground block text-[10px]'>Amazon Ads</span>
                  <strong className='text-cyan-400 font-bold'>+41.9%</strong>
                </div>
              </div>

              <Button
                size='sm'
                className='w-full text-xs font-bold'
                onClick={() => {
                  toast.success('Attribution Weights Recalibrated', {
                    description: `Shapley incrementality weight set to ${(shapleyWeight * 100).toFixed(0)}% across all channels.`
                  });
                }}
              >
                Apply Shapley Weights
              </Button>
            </CardContent>
          </Card>

          {/* Card 2: Autonomous Bid Arbitrage */}
          <Card className='border border-border/80 bg-card shadow-xs'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <Badge variant='outline' className='text-[10px] text-emerald-500 border-emerald-500/30'>
                  HIGH-FREQUENCY ARBITRAGE
                </Badge>
                <span className='text-[11px] text-muted-foreground'>Latency: 48ms</span>
              </div>
              <CardTitle className='text-base font-bold font-sans mt-2'>
                Cross-Platform CPM Hedging &amp; Killswitch
              </CardTitle>
              <CardDescription className='text-xs'>
                Dynamically withdraw auction bids when real-time CPM surges past conversion margin thresholds.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='p-3 rounded-lg border border-border/60 bg-muted/30 flex items-center justify-between'>
                <div>
                  <div className='font-bold text-foreground text-xs'>Auction Guard Status</div>
                  <div className='text-[10px] text-muted-foreground'>Killswitches trigger on &gt;35% CPM surge</div>
                </div>
                <Button
                  size='sm'
                  variant={arbitrageActive ? 'secondary' : 'outline'}
                  onClick={() => {
                    setArbitrageActive(!arbitrageActive);
                    toast.info(arbitrageActive ? 'Auction Guard Disabled' : 'Auction Guard Activated', {
                      description: arbitrageActive ? 'Bids will not be automatically throttled.' : 'Autonomous throttling active on CPM volatility.'
                    });
                  }}
                  className='text-xs font-mono font-bold'
                >
                  {arbitrageActive ? 'GUARD: ACTIVE' : 'GUARD: INACTIVE'}
                </Button>
              </div>

              <div className='grid grid-cols-2 gap-2 text-xs'>
                <div className='p-2.5 rounded-lg border border-border/60 bg-card'>
                  <span className='text-muted-foreground block text-[10px]'>Avoided Budget Bleed</span>
                  <strong className='text-emerald-500 text-sm font-bold'>+$148,200</strong>
                </div>
                <div className='p-2.5 rounded-lg border border-border/60 bg-card'>
                  <span className='text-muted-foreground block text-[10px]'>Tripped Circuit Breakers</span>
                  <strong className='text-foreground text-sm font-bold'>14 Events</strong>
                </div>
              </div>

              <Button
                size='sm'
                variant='outline'
                className='w-full text-xs font-bold'
                onClick={() => {
                  toast.success('Arbitrage Parameters Synced', {
                    description: 'Updated auction thresholds pushed to Meta Graph and Google Ads API.'
                  });
                }}
              >
                Sync Hedging Thresholds
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
