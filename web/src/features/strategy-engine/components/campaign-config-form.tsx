'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  IconSparkles,
  IconRocket,
  IconAdjustments,
  IconHistory,
  IconLayersLinked
} from '@tabler/icons-react';
import { CampaignConfig } from '@/lib/strategy-engine/types';

interface CampaignConfigFormProps {
  onSubmit: (config: Partial<CampaignConfig>) => Promise<void>;
  isLoading: boolean;
}

const PRESETS = [
  {
    name: 'Nike Pegasus 36 Scale',
    productService: 'Nike Air Zoom Pegasus 36 (AO2924-401)',
    targetAudience: 'Marathon runners, daily fitness joggers & urban commuters (Ages 20-45)',
    targetLocation: 'United States (Tier 1 Metros: New York, Los Angeles, Chicago, San Francisco, Seattle)',
    industryCategory: 'Athletic Footwear & Performance Apparel',
    totalBudget: 50000,
    campaignDuration: 30,
    objective: 'CONVERSIONS' as const,
    preferredPlatforms: ['meta', 'google', 'amazon', 'tiktok'],
    productPrice: 120.00,
    pastRoas: 3.42,
    pastCtr: 0.024,
    pastCpc: 2.15
  },
  {
    name: 'Nike Air Force 1 Holiday Drop',
    productService: "Nike Air Force 1 '07 (315122-001)",
    targetAudience: 'Sneakerheads, streetwear enthusiasts & college fashion tastemakers (Ages 18-32)',
    targetLocation: 'US Lifestyle & Urban Metros',
    industryCategory: 'Streetwear & Lifestyle Footwear',
    totalBudget: 75000,
    campaignDuration: 21,
    objective: 'ROAS' as const,
    preferredPlatforms: ['meta', 'tiktok', 'amazon'],
    productPrice: 87.89,
    pastRoas: 4.10,
    pastCtr: 0.031,
    pastCpc: 1.85
  },
  {
    name: 'Nike React Infinity Run Clearance',
    productService: 'Nike React Infinity Run Flyknit (CD4371-001)',
    targetAudience: 'Marathon runners & high-mileage road runners (Ages 18-50)',
    targetLocation: 'United States (National D2C)',
    industryCategory: 'Footwear & Sporting Goods',
    totalBudget: 35000,
    campaignDuration: 14,
    objective: 'CONVERSIONS' as const,
    preferredPlatforms: ['google', 'meta', 'amazon'],
    productPrice: 168.61,
    pastRoas: 2.85,
    pastCtr: 0.019,
    pastCpc: 2.40
  }
];

export function CampaignConfigForm({ onSubmit, isLoading }: CampaignConfigFormProps) {
  const [campaignName, setCampaignName] = useState(PRESETS[0].name);
  const [productService, setProductService] = useState(PRESETS[0].productService);
  const [targetAudience, setTargetAudience] = useState(PRESETS[0].targetAudience);
  const [targetLocation, setTargetLocation] = useState(PRESETS[0].targetLocation);
  const [industryCategory, setIndustryCategory] = useState(PRESETS[0].industryCategory);
  const [totalBudget, setTotalBudget] = useState<number>(PRESETS[0].totalBudget);
  const [campaignDuration, setCampaignDuration] = useState<number>(PRESETS[0].campaignDuration);
  const [objective, setObjective] = useState<'CONVERSIONS' | 'ROAS' | 'AWARENESS' | 'TRAFFIC'>('CONVERSIONS');
  const [productPrice, setProductPrice] = useState<number>(PRESETS[0].productPrice);
  const [platforms, setPlatforms] = useState<string[]>(['meta', 'google', 'amazon', 'tiktok']);
  const [targetRoasFloor, setTargetRoasFloor] = useState<number>(3.2);

  // Historical data inputs (optional)
  const [includeHistorical, setIncludeHistorical] = useState(true);
  const [pastRoas, setPastRoas] = useState<number>(3.42);
  const [pastCtr, setPastCtr] = useState<number>(0.024);
  const [pastCpc, setPastCpc] = useState<number>(2.15);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setCampaignName(preset.name);
    setProductService(preset.productService);
    setTargetAudience(preset.targetAudience);
    setTargetLocation(preset.targetLocation);
    setIndustryCategory(preset.industryCategory);
    setTotalBudget(preset.totalBudget);
    setCampaignDuration(preset.campaignDuration);
    setObjective(preset.objective);
    setProductPrice(preset.productPrice);
    setPlatforms(preset.preferredPlatforms);
    setPastRoas(preset.pastRoas);
    setPastCtr(preset.pastCtr);
    setPastCpc(preset.pastCpc);
    setIncludeHistorical(true);
  };

  const togglePlatform = (p: string) => {
    if (platforms.includes(p)) {
      if (platforms.length > 1) {
        setPlatforms(platforms.filter((x) => x !== p));
      }
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const configData: Partial<CampaignConfig> = {
      campaignName,
      productService,
      targetAudience,
      targetLocation,
      industryCategory,
      totalBudget: Number(totalBudget),
      campaignDuration: Number(campaignDuration),
      objective,
      preferredPlatforms: platforms,
      productPrice: Number(productPrice),
      historicalData: includeHistorical
        ? {
            pastRoas: Number(pastRoas),
            pastCtr: Number(pastCtr),
            pastCpc: Number(pastCpc)
          }
        : {},
      constraints: {
        targetRoas: Number(targetRoasFloor)
      }
    };
    await onSubmit(configData);
  };

  return (
    <form onSubmit={handleSubmit} className='rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-6'>
      {/* Header and Quick Presets */}
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4'>
        <div>
          <h2 className='text-base font-mono font-bold text-foreground flex items-center gap-2'>
            <IconRocket className='size-5 text-cyan-500' />
            Campaign Configuration &amp; Parameter Constraints
          </h2>
          <p className='text-xs font-mono text-muted-foreground mt-0.5'>
            Define product attributes, budget envelope, and audience criteria to trigger strategic evaluation.
          </p>
        </div>

        {/* Quick Presets */}
        <div className='flex items-center gap-2 flex-wrap'>
          <span className='text-[11px] font-mono text-muted-foreground'>Quick Presets:</span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type='button'
              onClick={() => applyPreset(p)}
              className='text-xs font-mono px-2.5 py-1 rounded border border-border bg-muted/40 hover:bg-muted text-foreground transition-all hover:border-cyan-500/40'
            >
              {p.name.split(' ')[1] || p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Inputs */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {/* Campaign Name */}
        <div className='space-y-1.5'>
          <Label className='text-xs font-mono text-foreground'>Campaign Identifier / Name</Label>
          <Input
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder='e.g. Nike Pegasus Launch'
            className='font-mono text-xs bg-muted/20'
            required
          />
        </div>

        {/* Product / Service */}
        <div className='space-y-1.5'>
          <Label className='text-xs font-mono text-foreground'>Product or Service</Label>
          <Input
            value={productService}
            onChange={(e) => setProductService(e.target.value)}
            placeholder='e.g. Nike Air Zoom Pegasus 40'
            className='font-mono text-xs bg-muted/20'
            required
          />
        </div>

        {/* Industry Category */}
        <div className='space-y-1.5'>
          <Label className='text-xs font-mono text-foreground'>Industry / Category</Label>
          <Input
            value={industryCategory}
            onChange={(e) => setIndustryCategory(e.target.value)}
            placeholder='e.g. Athletic Footwear'
            className='font-mono text-xs bg-muted/20'
            required
          />
        </div>

        {/* Target Audience */}
        <div className='space-y-1.5 md:col-span-2'>
          <Label className='text-xs font-mono text-foreground'>Target Audience Demographics &amp; Interests</Label>
          <Input
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder='e.g. Marathon runners, daily fitness joggers (Ages 20-45)'
            className='font-mono text-xs bg-muted/20'
            required
          />
        </div>

        {/* Target Location */}
        <div className='space-y-1.5'>
          <Label className='text-xs font-mono text-foreground'>Geographic Location</Label>
          <Input
            value={targetLocation}
            onChange={(e) => setTargetLocation(e.target.value)}
            placeholder='e.g. United States (Tier 1 Metros)'
            className='font-mono text-xs bg-muted/20'
            required
          />
        </div>

        {/* Budget */}
        <div className='space-y-1.5'>
          <Label className='text-xs font-mono text-foreground'>Total Budget ($)</Label>
          <Input
            type='number'
            min={1000}
            step={1000}
            value={totalBudget}
            onChange={(e) => setTotalBudget(Number(e.target.value))}
            className='font-mono text-xs bg-muted/20'
            required
          />
        </div>

        {/* Duration */}
        <div className='space-y-1.5'>
          <Label className='text-xs font-mono text-foreground'>Campaign Duration (Days)</Label>
          <Input
            type='number'
            min={1}
            max={180}
            value={campaignDuration}
            onChange={(e) => setCampaignDuration(Number(e.target.value))}
            className='font-mono text-xs bg-muted/20'
            required
          />
        </div>

        {/* Unit Price / AOV */}
        <div className='space-y-1.5'>
          <Label className='text-xs font-mono text-foreground'>Product Sale Price / AOV ($)</Label>
          <Input
            type='number'
            min={10}
            step={5}
            value={productPrice}
            onChange={(e) => setProductPrice(Number(e.target.value))}
            className='font-mono text-xs bg-muted/20'
            required
          />
        </div>
      </div>

      {/* Platform & Objective Selector */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border/60 pt-4'>
        {/* Objective */}
        <div>
          <Label className='text-xs font-mono text-foreground mb-2 block'>Primary Campaign Objective</Label>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
            {(['CONVERSIONS', 'ROAS', 'AWARENESS', 'TRAFFIC'] as const).map((obj) => (
              <button
                key={obj}
                type='button'
                onClick={() => setObjective(obj)}
                className={`px-3 py-2 rounded-lg border text-xs font-mono font-semibold transition-all ${
                  objective === obj
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-xs'
                    : 'border-border bg-muted/20 text-muted-foreground hover:text-foreground'
                }`}
              >
                {obj}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Platforms */}
        <div>
          <Label className='text-xs font-mono text-foreground mb-2 block'>Preferred Advertising Platforms</Label>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
            {[
              { id: 'meta', name: 'Meta Ads', color: 'border-blue-500/40 text-blue-400' },
              { id: 'google', name: 'Google Ads', color: 'border-emerald-500/40 text-emerald-400' },
              { id: 'amazon', name: 'Amazon Ads', color: 'border-amber-500/40 text-amber-400' },
              { id: 'tiktok', name: 'TikTok Shop', color: 'border-pink-500/40 text-pink-400' }
            ].map((p) => {
              const active = platforms.includes(p.id);
              return (
                <button
                  key={p.id}
                  type='button'
                  onClick={() => togglePlatform(p.id)}
                  className={`px-2.5 py-2 rounded-lg border text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    active
                      ? `${p.color} bg-muted/40 font-bold`
                      : 'border-border bg-muted/10 text-muted-foreground/60'
                  }`}
                >
                  <span className={`size-2 rounded-full ${active ? 'bg-current' : 'bg-zinc-600'}`} />
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Historical Data & Constraints Panel */}
      <div className='rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <IconHistory className='size-4 text-cyan-400' />
            <span className='text-xs font-mono font-bold text-foreground'>
              Historical Performance Calibration &amp; Constraints (Optional)
            </span>
          </div>
          <label className='flex items-center gap-2 text-xs font-mono cursor-pointer'>
            <input
              type='checkbox'
              checked={includeHistorical}
              onChange={(e) => setIncludeHistorical(e.target.checked)}
              className='rounded border-border accent-cyan-500 size-3.5'
            />
            <span>Use Historical Baseline</span>
          </label>
        </div>

        {includeHistorical ? (
          <div className='grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1'>
            <div className='space-y-1'>
              <span className='text-[11px] font-mono text-muted-foreground'>Past Blended ROAS</span>
              <Input
                type='number'
                step='0.1'
                value={pastRoas}
                onChange={(e) => setPastRoas(Number(e.target.value))}
                className='font-mono text-xs h-8 bg-background'
              />
            </div>
            <div className='space-y-1'>
              <span className='text-[11px] font-mono text-muted-foreground'>Past CTR (e.g. 0.024)</span>
              <Input
                type='number'
                step='0.001'
                value={pastCtr}
                onChange={(e) => setPastCtr(Number(e.target.value))}
                className='font-mono text-xs h-8 bg-background'
              />
            </div>
            <div className='space-y-1'>
              <span className='text-[11px] font-mono text-muted-foreground'>Past CPC ($)</span>
              <Input
                type='number'
                step='0.1'
                value={pastCpc}
                onChange={(e) => setPastCpc(Number(e.target.value))}
                className='font-mono text-xs h-8 bg-background'
              />
            </div>
            <div className='space-y-1'>
              <span className='text-[11px] font-mono text-muted-foreground'>Target ROAS Floor</span>
              <Input
                type='number'
                step='0.1'
                value={targetRoasFloor}
                onChange={(e) => setTargetRoasFloor(Number(e.target.value))}
                className='font-mono text-xs h-8 bg-background'
              />
            </div>
          </div>
        ) : (
          <p className='text-xs font-mono text-muted-foreground italic'>
            Historical calibration inactive: Strategy Engine will evaluate using transparent Platform Empirical Benchmark Prior Models. Predictions will be marked as model estimates.
          </p>
        )}
      </div>

      {/* Submit Action */}
      <div className='flex items-center justify-between pt-2'>
        <div className='flex items-center gap-2 text-xs font-mono text-muted-foreground'>
          <IconLayersLinked className='size-4 text-muted-foreground' />
          <span>Generates 20 to 25 distinct candidate strategies across all funnel stages</span>
        </div>

        <Button
          type='submit'
          disabled={isLoading}
          className='bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-mono font-medium text-xs px-5 h-9 rounded-md transition-colors'
        >
          {isLoading ? (
            <span className='flex items-center gap-2'>
              <span className='size-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin' />
              Simulating Strategies...
            </span>
          ) : (
            <span className='flex items-center gap-2'>
              <IconSparkles className='size-4' />
              Generate &amp; Evaluate Strategies
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
