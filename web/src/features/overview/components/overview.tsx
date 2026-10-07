import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaGraph } from './area-graph';
import { BarGraph } from './bar-graph';
import { PieGraph } from './pie-graph';
import { RecentSales } from './recent-sales';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { toast } from 'sonner';

export default function OverViewPage() {
  const handleExportTelemetry = () => {
    const telemetryData = {
      timestamp: new Date().toISOString(),
      system: 'NEXUS Autonomous Decision Engine',
      channel_kpis: {
        totalRevenue: '₹1,250,450',
        activeAccounts: 45231,
        growthRate: '+12.5%',
        averageRoas: '3.42x',
        conversionRate: '4.8%',
        blendedCpa: '₹412.50'
      },
      telemetryStatus: 'HEALTHY_SYNCED',
      engineVersion: '2.4.0-dqps'
    };
    const blob = new Blob([JSON.stringify(telemetryData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-telemetry-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('System telemetry exported successfully', {
      description: 'Downloaded nexus-telemetry JSON payload.'
    });
  };

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight text-foreground font-mono'>System Overview</h2>
          <div className='flex items-center space-x-2'>
            <Link href='/dashboard/strategy-engine'>
              <Button className='bg-emerald-600 dark:bg-[#39FF14] text-white dark:text-black hover:bg-emerald-700 dark:hover:bg-[#32e012] font-mono font-semibold flex items-center gap-1.5 shadow-sm'>
                <Icons.bot className='size-4' /> AI Strategy Engine
              </Button>
            </Link>
            <Button
              onClick={handleExportTelemetry}
              variant='outline'
              className='hidden md:inline-flex font-semibold transition-all active:scale-[0.98]'
            >
              Export Telemetry
            </Button>
          </div>
        </div>
        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList className='bg-muted border border-border'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='analytics'>
              Analytics
            </TabsTrigger>
          </TabsList>
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
              <Card className='@container/card bg-card border-border shadow-none text-card-foreground'>
                <CardHeader>
                  <CardDescription className='text-muted-foreground font-mono'>Total Revenue</CardDescription>
                  <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-foreground font-mono'>
                    ₹1,250.00
                  </CardTitle>
                  <CardAction>
                    <Badge variant='outline' className='border border-border text-foreground bg-muted font-mono'>
                      <Icons.trendingUp className='text-emerald-500' />
                      +12.5%
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                  <div className='line-clamp-1 flex gap-2 font-medium text-foreground'>
                    Trending up this month <Icons.trendingUp className='size-4 text-emerald-500' />
                  </div>
                  <div className='text-muted-foreground text-xs font-mono'>Visitors for the last 6 months</div>
                </CardFooter>
              </Card>
              <Card className='@container/card bg-card border-border shadow-none text-card-foreground'>
                <CardHeader>
                  <CardDescription className='text-muted-foreground font-mono'>New Customers</CardDescription>
                  <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-foreground font-mono'>
                    1,234
                  </CardTitle>
                  <CardAction>
                    <Badge variant='outline' className='border border-border text-foreground bg-muted font-mono'>
                      <Icons.trendingDown className='text-rose-500' />
                      -20%
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                  <div className='line-clamp-1 flex gap-2 font-medium text-foreground'>
                    Down 20% this period <Icons.trendingDown className='size-4 text-rose-500' />
                  </div>
                  <div className='text-muted-foreground text-xs font-mono'>Acquisition needs attention</div>
                </CardFooter>
              </Card>
              <Card className='@container/card bg-card border-border shadow-none text-card-foreground'>
                <CardHeader>
                  <CardDescription className='text-muted-foreground font-mono'>Active Accounts</CardDescription>
                  <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-foreground font-mono'>
                    45,678
                  </CardTitle>
                  <CardAction>
                    <Badge variant='outline' className='border border-border text-foreground bg-muted font-mono'>
                      <Icons.trendingUp className='text-emerald-500' />
                      +12.5%
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                  <div className='line-clamp-1 flex gap-2 font-medium text-foreground'>
                    Strong user retention <Icons.trendingUp className='size-4 text-emerald-500' />
                  </div>
                  <div className='text-muted-foreground text-xs font-mono'>Engagement exceed targets</div>
                </CardFooter>
              </Card>
              <Card className='@container/card bg-card border-border shadow-none text-card-foreground'>
                <CardHeader>
                  <CardDescription className='text-muted-foreground font-mono'>Growth Rate</CardDescription>
                  <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-foreground font-mono'>
                    4.5%
                  </CardTitle>
                  <CardAction>
                    <Badge variant='outline' className='border border-border text-foreground bg-muted font-mono'>
                      <Icons.trendingUp className='text-emerald-500' />
                      +4.5%
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                  <div className='line-clamp-1 flex gap-2 font-medium text-foreground'>
                    Steady performance increase <Icons.trendingUp className='size-4 text-emerald-500' />
                  </div>
                  <div className='text-muted-foreground text-xs font-mono'>Meets growth projections</div>
                </CardFooter>
              </Card>
            </div>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
              <div className='col-span-4'>
                <BarGraph />
              </div>
              <Card className='col-span-4 md:col-span-3 bg-card border-border shadow-none text-card-foreground'>
                <RecentSales />
              </Card>
              <div className='col-span-4'>
                <AreaGraph />
              </div>
              <div className='col-span-4 md:col-span-3'>
                <PieGraph />
              </div>
            </div>
          </TabsContent>
          <TabsContent value='analytics' className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <Card className='bg-card border-border p-5 text-card-foreground'>
                <CardHeader className='p-0 pb-3'>
                  <CardDescription className='text-muted-foreground font-mono text-xs uppercase'>Cross-Channel Blended ROAS</CardDescription>
                  <CardTitle className='text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400'>3.84x</CardTitle>
                </CardHeader>
                <CardFooter className='p-0 pt-2 text-xs text-muted-foreground font-mono'>
                  +0.42x lift compared to manual baseline allocation
                </CardFooter>
              </Card>

              <Card className='bg-card border-border p-5 text-card-foreground'>
                <CardHeader className='p-0 pb-3'>
                  <CardDescription className='text-muted-foreground font-mono text-xs uppercase'>Customer Acquisition Cost (CAC)</CardDescription>
                  <CardTitle className='text-3xl font-bold font-mono text-foreground'>₹412.50</CardTitle>
                </CardHeader>
                <CardFooter className='p-0 pt-2 text-xs text-emerald-600 dark:text-emerald-400 font-mono'>
                  -18.4% reduction via autonomous stockout suppression
                </CardFooter>
              </Card>

              <Card className='bg-card border-border p-5 text-card-foreground'>
                <CardHeader className='p-0 pb-3'>
                  <CardDescription className='text-muted-foreground font-mono text-xs uppercase'>Estimated Lifetime Value (LTV)</CardDescription>
                  <CardTitle className='text-3xl font-bold font-mono text-foreground'>₹3,840.00</CardTitle>
                </CardHeader>
                <CardFooter className='p-0 pt-2 text-xs text-cyan-600 dark:text-cyan-400 font-mono'>
                  LTV:CAC Ratio of 9.3x across repeat buyers
                </CardFooter>
              </Card>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='p-5 rounded-xl bg-card border border-border space-y-3 text-card-foreground'>
                <h4 className='text-sm font-mono font-bold text-foreground uppercase tracking-wider flex items-center gap-2'>
                  <Icons.trendingUp className='size-4 text-emerald-600 dark:text-emerald-400' /> Channel Efficiency &amp; Marginal Return
                </h4>
                <div className='space-y-2 text-xs font-mono'>
                  <div className='flex justify-between py-1 border-b border-border text-muted-foreground'>
                    <span>Google Search High-Intent</span>
                    <span className='text-foreground font-bold'>5.64x ROAS (₹6,100/d spend)</span>
                  </div>
                  <div className='flex justify-between py-1 border-b border-border text-muted-foreground'>
                    <span>Amazon Sponsored Products</span>
                    <span className='text-foreground font-bold'>6.12x ROAS (₹3,950/d spend)</span>
                  </div>
                  <div className='flex justify-between py-1 border-b border-border text-muted-foreground'>
                    <span>Meta Advantage+ Video Retargeting</span>
                    <span className='text-foreground font-bold'>3.21x ROAS (₹8,400/d spend)</span>
                  </div>
                  <div className='flex justify-between py-1 text-muted-foreground'>
                    <span>TikTok Dynamic Showcase</span>
                    <span className='text-amber-500 font-bold'>2.10x ROAS (₹1,200/d spend)</span>
                  </div>
                </div>
              </div>

              <div className='p-5 rounded-xl bg-card border border-border space-y-3 text-card-foreground'>
                <h4 className='text-sm font-mono font-bold text-foreground uppercase tracking-wider flex items-center gap-2'>
                  <Icons.check className='size-4 text-cyan-600 dark:text-cyan-400' /> Autonomous Directive Efficiency
                </h4>
                <p className='text-xs text-muted-foreground leading-relaxed font-sans'>
                  Real-time convex optimization dynamically tracks Hill saturation thresholds to prevent ad spend waste on saturated fatigue curves.
                </p>
                <div className='pt-2 flex items-center gap-3'>
                  <Link href='/dashboard/strategy-engine'>
                    <Button size='sm' className='bg-emerald-600 dark:bg-[#39FF14] text-white dark:text-black hover:bg-emerald-700 dark:hover:bg-[#32e012] font-mono text-xs font-semibold'>
                      Open Strategy Engine &rarr;
                    </Button>
                  </Link>
                  <Link href='/dashboard/gauges'>
                    <Button size='sm' variant='outline' className='text-xs font-mono border-border text-foreground hover:bg-muted'>
                      View ROAS Gauges
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
