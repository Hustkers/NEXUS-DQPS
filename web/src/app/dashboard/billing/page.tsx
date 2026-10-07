'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useOrganization, OrganizationSwitcher, PricingTable } from '@clerk/nextjs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { billingInfoContent } from '@/config/infoconfig';

export default function BillingPage() {
  const { organization, isLoaded } = useOrganization();

  return (
    <PageContainer
      isLoading={!isLoaded}
      access={!!organization}
      accessFallback={
        <div className='space-y-6 py-4'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border bg-card'>
            <div>
              <h2 className='text-lg font-semibold'>Organization Workspaces</h2>
              <p className='text-xs text-muted-foreground mt-0.5'>
                Select an organization workspace to synchronize team billing, or review autonomous tiers below.
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <OrganizationSwitcher
                afterCreateOrganizationUrl='/dashboard/billing'
                afterSelectOrganizationUrl='/dashboard/billing'
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
            {/* Tier 1: Growth */}
            <Card className='flex flex-col justify-between border shadow-xs'>
              <CardHeader>
                <Badge variant='outline' className='w-fit text-[11px] font-mono mb-2'>
                  Growth Tier
                </Badge>
                <CardTitle className='text-xl'>Autonomous Pro</CardTitle>
                <CardDescription className='text-xs'>
                  For high-velocity DTC brands spending ₹5L - ₹20L/mo.
                </CardDescription>
                <div className='pt-3 font-mono'>
                  <span className='text-3xl font-bold'>₹24,999</span>
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
                  variant='outline'
                  onClick={() => {
                    toast.info('Autonomous Pro Tier Selected', {
                      description: 'Connect an organization workspace above to activate billing subscription.'
                    });
                  }}
                >
                  Select Pro Plan
                </Button>
              </CardContent>
            </Card>

            {/* Tier 2: Enterprise (Popular) */}
            <Card className='flex flex-col justify-between border-2 border-emerald-500/60 shadow-md relative bg-emerald-500/5'>
              <div className='absolute -top-3 right-4'>
                <Badge className='bg-emerald-600 text-white text-[10px] uppercase font-bold tracking-wider'>
                  Most Popular
                </Badge>
              </div>
              <CardHeader>
                <Badge variant='outline' className='w-fit text-[11px] font-mono border-emerald-500/40 text-emerald-600 mb-2'>
                  Scale Tier
                </Badge>
                <CardTitle className='text-xl'>Autonomous Enterprise</CardTitle>
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
                  onClick={() => {
                    toast.success('Autonomous Enterprise Tier Selected', {
                      description: 'Connect an organization workspace above to activate billing subscription.'
                    });
                  }}
                >
                  Deploy Enterprise Tier
                </Button>
              </CardContent>
            </Card>

            {/* Tier 3: Sovereign Dedicated */}
            <Card className='flex flex-col justify-between border shadow-xs'>
              <CardHeader>
                <Badge variant='outline' className='w-fit text-[11px] font-mono mb-2'>
                  Sovereign Tier
                </Badge>
                <CardTitle className='text-xl'>Private VPC Cloud</CardTitle>
                <CardDescription className='text-xs'>
                  Custom isolated infrastructure and dedicated ML models.
                </CardDescription>
                <div className='pt-3 font-mono'>
                  <span className='text-3xl font-bold'>Custom</span>
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
                      description: 'Enterprise solutions team has been notified for consultation.'
                    });
                  }}
                >
                  Contact Solutions Team
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      }
      infoContent={billingInfoContent}
      pageTitle='Billing & Plans'
      pageDescription={`Manage your subscription and usage limits for ${organization?.name}`}
    >
      <div className='space-y-6'>
        {/* Info Alert */}
        <Alert>
          <Icons.info className='h-4 w-4' />
          <AlertDescription>
            Plans and subscriptions are managed through Clerk Billing. Subscribe to a plan to unlock
            features and higher limits.
          </AlertDescription>
        </Alert>

        {/* Clerk Pricing Table */}
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>Choose a plan that fits your organization's needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='mx-auto max-w-4xl'>
              <PricingTable for='organization' />
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
