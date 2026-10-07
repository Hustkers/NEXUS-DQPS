'use client';

import React, { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { billingInfoContent } from '@/config/infoconfig';

const INVOICE_HISTORY = [
  { id: 'INV-2026-10-092', date: 'Oct 01, 2026', amount: 79999, status: 'Paid', method: 'Visa •••• 4242' },
  { id: 'INV-2026-09-081', date: 'Sep 01, 2026', amount: 79999, status: 'Paid', method: 'Visa •••• 4242' },
  { id: 'INV-2026-08-074', date: 'Aug 01, 2026', amount: 79999, status: 'Paid', method: 'Visa •••• 4242' },
  { id: 'INV-2026-07-063', date: 'Jul 01, 2026', amount: 24999, status: 'Paid', method: 'Visa •••• 4242' }
];

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'enterprise' | 'sovereign'>('enterprise');
  const [autoRenew, setAutoRenew] = useState<boolean>(true);

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.success(`Invoice ${invoiceId} Downloaded`, {
      description: 'Tax invoice PDF generated and saved to your device.'
    });
  };

  const handleSelectPlan = (tier: 'pro' | 'enterprise' | 'sovereign', name: string) => {
    setSelectedPlan(tier);
    toast.success(`Plan Updated to ${name}`, {
      description: 'Your autonomous orchestration limits have been updated accordingly.'
    });
  };

  return (
    <PageContainer
      pageTitle='Billing & Subscriptions'
      pageDescription='Autonomous D2C compute tiers, usage quotas, invoice ledger, and payment methods'
      infoContent={billingInfoContent}
    >
      <div className='space-y-6 font-mono text-xs'>
        {/* Active Workspace Header Card */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border border-border/80 bg-card shadow-xs'>
          <div>
            <div className='flex items-center gap-2'>
              <span className='size-2.5 rounded-full bg-emerald-500 animate-pulse' />
              <h2 className='text-base font-bold text-foreground font-sans'>
                Workspace: NEXUS Omnichannel Production (#8824)
              </h2>
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Active Plan: <strong className='text-emerald-600 dark:text-emerald-400 uppercase'>{selectedPlan} Autonomous Tier</strong> • Next renewal on Nov 01, 2026
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              variant='outline'
              onClick={() => {
                setAutoRenew(!autoRenew);
                toast.info(autoRenew ? 'Auto-renew disabled' : 'Auto-renew enabled', {
                  description: autoRenew ? 'Plan will expire at current billing cycle.' : 'Next invoice will be charged automatically.'
                });
              }}
              className='text-xs'
            >
              Auto-Renew: {autoRenew ? 'ON' : 'OFF'}
            </Button>
            <Button
              size='sm'
              onClick={() => {
                toast.success('Billing Details Synchronized', {
                  description: 'Payment gateway status verified with Stripe & GSTIN compliance.'
                });
              }}
              className='text-xs font-bold bg-foreground text-background hover:bg-foreground/90'
            >
              Sync Gateway
            </Button>
          </div>
        </div>

        {/* Pricing Tiers Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
          {/* Tier 1: Pro */}
          <Card className={`flex flex-col justify-between border shadow-xs transition-all ${selectedPlan === 'pro' ? 'border-primary ring-1 ring-primary/20' : ''}`}>
            <CardHeader>
              <Badge variant='outline' className='w-fit text-[11px] font-mono mb-2'>
                Growth Tier
              </Badge>
              <CardTitle className='text-xl font-bold font-sans'>Autonomous Pro</CardTitle>
              <CardDescription className='text-xs'>
                For high-velocity DTC brands spending ₹5L - ₹20L/mo.
              </CardDescription>
              <div className='pt-3 font-mono'>
                <span className='text-3xl font-bold text-foreground'>₹24,999</span>
                <span className='text-xs text-muted-foreground'> / month</span>
              </div>
            </CardHeader>
            <CardContent className='space-y-4 text-xs flex-1 flex flex-col justify-between'>
              <ul className='space-y-2 text-muted-foreground'>
                <li className='flex items-center gap-2 text-foreground'>
                  <Icons.check className='size-3.5 text-emerald-500 shrink-0' />
                  <span>Real-time Causal DAG & Anomaly Detection</span>
                </li>
                <li className='flex items-center gap-2 text-foreground'>
                  <Icons.check className='size-3.5 text-emerald-500 shrink-0' />
                  <span>Cross-platform ROAS / POAS Optimization</span>
                </li>
                <li className='flex items-center gap-2 text-foreground'>
                  <Icons.check className='size-3.5 text-emerald-500 shrink-0' />
                  <span>Up to 25 Active SKU Automations</span>
                </li>
                <li className='flex items-center gap-2 text-foreground'>
                  <Icons.check className='size-3.5 text-emerald-500 shrink-0' />
                  <span>1-Click Fix Protocol Execution</span>
                </li>
              </ul>
              <Button
                className='w-full mt-4 font-mono text-xs'
                variant={selectedPlan === 'pro' ? 'secondary' : 'outline'}
                onClick={() => handleSelectPlan('pro', 'Autonomous Pro')}
              >
                {selectedPlan === 'pro' ? 'Active Tier' : 'Downgrade to Pro'}
              </Button>
            </CardContent>
          </Card>

          {/* Tier 2: Enterprise (Popular) */}
          <Card className={`flex flex-col justify-between border-2 shadow-md relative transition-all ${selectedPlan === 'enterprise' ? 'border-emerald-500 bg-emerald-500/5' : 'border-border'}`}>
            <div className='absolute -top-3 right-4'>
              <Badge className='bg-emerald-600 text-white text-[10px] uppercase font-bold tracking-wider'>
                {selectedPlan === 'enterprise' ? 'Current Plan' : 'Most Popular'}
              </Badge>
            </div>
            <CardHeader>
              <Badge variant='outline' className='w-fit text-[11px] font-mono border-emerald-500/40 text-emerald-600 mb-2'>
                Scale Tier
              </Badge>
              <CardTitle className='text-xl font-bold font-sans'>Autonomous Enterprise</CardTitle>
              <CardDescription className='text-xs'>
                For omnichannel enterprises spending ₹20L - ₹1Cr+/mo.
              </CardDescription>
              <div className='pt-3 font-mono'>
                <span className='text-3xl font-bold text-foreground'>₹79,999</span>
                <span className='text-xs text-muted-foreground'> / month</span>
              </div>
            </CardHeader>
            <CardContent className='space-y-4 text-xs flex-1 flex flex-col justify-between'>
              <ul className='space-y-2 text-muted-foreground'>
                <li className='flex items-center gap-2 text-foreground font-medium'>
                  <Icons.check className='size-3.5 text-emerald-500 shrink-0' />
                  <span>Sub-second Webhook Telemetry &amp; Sync</span>
                </li>
                <li className='flex items-center gap-2 text-foreground font-medium'>
                  <Icons.check className='size-3.5 text-emerald-500 shrink-0' />
                  <span>Reinforcement Learning Contextual Bandit Policy</span>
                </li>
                <li className='flex items-center gap-2 text-foreground font-medium'>
                  <Icons.check className='size-3.5 text-emerald-500 shrink-0' />
                  <span>Unlimited SKU Catalogs &amp; Marketplaces</span>
                </li>
                <li className='flex items-center gap-2 text-foreground font-medium'>
                  <Icons.check className='size-3.5 text-emerald-500 shrink-0' />
                  <span>Automatic Stockout Suppression Kill Switches</span>
                </li>
                <li className='flex items-center gap-2 text-foreground font-medium'>
                  <Icons.check className='size-3.5 text-emerald-500 shrink-0' />
                  <span>Dedicated Solution Engineer &amp; SLA</span>
                </li>
              </ul>
              <Button
                className='w-full mt-4 font-mono text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold'
                onClick={() => handleSelectPlan('enterprise', 'Autonomous Enterprise')}
              >
                {selectedPlan === 'enterprise' ? 'Current Active Tier' : 'Upgrade to Enterprise'}
              </Button>
            </CardContent>
          </Card>

          {/* Tier 3: Sovereign Dedicated */}
          <Card className={`flex flex-col justify-between border shadow-xs transition-all ${selectedPlan === 'sovereign' ? 'border-primary ring-1 ring-primary/20' : ''}`}>
            <CardHeader>
              <Badge variant='outline' className='w-fit text-[11px] font-mono mb-2'>
                Sovereign Tier
              </Badge>
              <CardTitle className='text-xl font-bold font-sans'>Private VPC Cloud</CardTitle>
              <CardDescription className='text-xs'>
                Custom isolated infrastructure and dedicated ML models.
              </CardDescription>
              <div className='pt-3 font-mono'>
                <span className='text-3xl font-bold text-foreground'>Custom</span>
                <span className='text-xs text-muted-foreground'> / annual contract</span>
              </div>
            </CardHeader>
            <CardContent className='space-y-4 text-xs flex-1 flex flex-col justify-between'>
              <ul className='space-y-2 text-muted-foreground'>
                <li className='flex items-center gap-2 text-foreground'>
                  <Icons.check className='size-3.5 text-emerald-500 shrink-0' />
                  <span>Self-Hosted Isolated VPC Deployment</span>
                </li>
                <li className='flex items-center gap-2 text-foreground'>
                  <Icons.check className='size-3.5 text-emerald-500 shrink-0' />
                  <span>Zero Data Retention Guarantees</span>
                </li>
                <li className='flex items-center gap-2 text-foreground'>
                  <Icons.check className='size-3.5 text-emerald-500 shrink-0' />
                  <span>Custom Fine-Tuned Attribution Weights</span>
                </li>
                <li className='flex items-center gap-2 text-foreground'>
                  <Icons.check className='size-3.5 text-emerald-500 shrink-0' />
                  <span>24/7 Priority Emergency Hotline</span>
                </li>
              </ul>
              <Button
                className='w-full mt-4 font-mono text-xs'
                variant='outline'
                onClick={() => {
                  toast.info('Sovereign Cloud Requested', {
                    description: 'Enterprise solutions team has been notified for private cluster deployment.'
                  });
                }}
              >
                Contact Solutions Team
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Telemetry Quota Meters */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='rounded-xl border border-border/80 bg-card p-4 space-y-2'>
            <div className='flex items-center justify-between text-xs'>
              <span className='text-muted-foreground'>Causal DAG Inferences</span>
              <span className='font-bold text-foreground'>842k / 1M (84%)</span>
            </div>
            <div className='h-2 w-full bg-muted rounded-full overflow-hidden'>
              <div className='h-full bg-emerald-500 rounded-full' style={{ width: '84%' }} />
            </div>
          </div>

          <div className='rounded-xl border border-border/80 bg-card p-4 space-y-2'>
            <div className='flex items-center justify-between text-xs'>
              <span className='text-muted-foreground'>Active SKU Automations</span>
              <span className='font-bold text-foreground'>18 / 25 SKUs (72%)</span>
            </div>
            <div className='h-2 w-full bg-muted rounded-full overflow-hidden'>
              <div className='h-full bg-indigo-500 rounded-full' style={{ width: '72%' }} />
            </div>
          </div>

          <div className='rounded-xl border border-border/80 bg-card p-4 space-y-2'>
            <div className='flex items-center justify-between text-xs'>
              <span className='text-muted-foreground'>Telemetry Throughput</span>
              <span className='font-bold text-foreground'>4.2M / 10M events (42%)</span>
            </div>
            <div className='h-2 w-full bg-muted rounded-full overflow-hidden'>
              <div className='h-full bg-cyan-500 rounded-full' style={{ width: '42%' }} />
            </div>
          </div>
        </div>

        {/* Invoices History Table */}
        <div className='rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs'>
          <div className='p-4 border-b border-border/80 flex items-center justify-between'>
            <div>
              <h3 className='text-sm font-bold text-foreground font-sans'>Billing &amp; Tax Invoices</h3>
              <p className='text-xs text-muted-foreground mt-0.5'>GST compliant tax receipts with automatic monthly deduction.</p>
            </div>
            <Button
              size='sm'
              variant='outline'
              onClick={() => {
                toast.success('All Invoices Exported', {
                  description: 'Historical billing ledger exported as consolidated CSV.'
                });
              }}
              className='text-xs font-semibold'
            >
              <Icons.download className='size-3 mr-1.5' />
              Export All CSV
            </Button>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-xs font-mono border-collapse'>
              <thead>
                <tr className='border-b border-border/80 bg-muted/40 text-[10px] text-muted-foreground uppercase tracking-wider select-none'>
                  <th className='py-2.5 px-4 font-semibold'>Invoice ID</th>
                  <th className='py-2.5 px-4 font-semibold'>Date</th>
                  <th className='py-2.5 px-4 font-semibold'>Payment Method</th>
                  <th className='py-2.5 px-4 text-right font-semibold'>Amount</th>
                  <th className='py-2.5 px-4 text-center font-semibold'>Status</th>
                  <th className='py-2.5 px-4 text-right font-semibold'>Action</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border/60'>
                {INVOICE_HISTORY.map((inv) => (
                  <tr key={inv.id} className='hover:bg-muted/30 transition-colors'>
                    <td className='py-3 px-4 font-bold text-foreground'>{inv.id}</td>
                    <td className='py-3 px-4 text-muted-foreground'>{inv.date}</td>
                    <td className='py-3 px-4 text-muted-foreground'>{inv.method}</td>
                    <td className='py-3 px-4 text-right font-bold text-foreground'>
                      ₹{inv.amount.toLocaleString('en-IN')}
                    </td>
                    <td className='py-3 px-4 text-center'>
                      <Badge variant='outline' className='bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]'>
                        {inv.status}
                      </Badge>
                    </td>
                    <td className='py-3 px-4 text-right'>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => handleDownloadInvoice(inv.id)}
                        className='h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground'
                      >
                        <Icons.download className='size-3 mr-1' />
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
