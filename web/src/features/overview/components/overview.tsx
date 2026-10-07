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

export default function OverViewPage() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight text-white font-mono'>System Overview</h2>
          <div className='flex items-center space-x-2'>
            <Link href='/dashboard/strategy-engine'>
              <Button className='bg-[#39FF14] text-black hover:bg-[#32e012] font-mono font-semibold flex items-center gap-1.5 shadow-sm shadow-[#39FF14]/20'>
                <Icons.bot className='size-4 text-black' /> AI Strategy Engine
              </Button>
            </Link>
            <Button className='hidden md:inline-flex bg-white text-black hover:bg-[#8A8A8A] font-semibold'>Export Telemetry</Button>
          </div>
        </div>
        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList className='bg-[#1A1A1A] border border-[#1A1A1A]'>
            <TabsTrigger value='overview' className='data-[state=active]:bg-white data-[state=active]:text-black'>Overview</TabsTrigger>
            <TabsTrigger value='analytics' disabled className='text-[#8A8A8A]'>
              Analytics
            </TabsTrigger>
          </TabsList>
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
              <Card className='@container/card bg-[#1A1A1A] border-[#1A1A1A] shadow-none'>
                <CardHeader>
                  <CardDescription className='text-[#8A8A8A] font-mono'>Total Revenue</CardDescription>
                  <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-white font-mono'>
                    ₹1,250.00
                  </CardTitle>
                  <CardAction>
                    <Badge variant='outline' className='border-none text-white bg-[#000000] font-mono'>
                      <Icons.trendingUp className='text-white' />
                      +12.5%
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                  <div className='line-clamp-1 flex gap-2 font-medium text-white'>
                    Trending up this month <Icons.trendingUp className='size-4 text-white' />
                  </div>
                  <div className='text-[#8A8A8A] text-xs font-mono'>Visitors for the last 6 months</div>
                </CardFooter>
              </Card>
              <Card className='@container/card bg-[#1A1A1A] border-[#1A1A1A] shadow-none'>
                <CardHeader>
                  <CardDescription className='text-[#8A8A8A] font-mono'>New Customers</CardDescription>
                  <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-white font-mono'>
                    1,234
                  </CardTitle>
                  <CardAction>
                    <Badge variant='outline' className='border-none text-white bg-[#000000] font-mono'>
                      <Icons.trendingDown className='text-[#8A8A8A]' />
                      -20%
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                  <div className='line-clamp-1 flex gap-2 font-medium text-white'>
                    Down 20% this period <Icons.trendingDown className='size-4 text-[#8A8A8A]' />
                  </div>
                  <div className='text-[#8A8A8A] text-xs font-mono'>Acquisition needs attention</div>
                </CardFooter>
              </Card>
              <Card className='@container/card bg-[#1A1A1A] border-[#1A1A1A] shadow-none'>
                <CardHeader>
                  <CardDescription className='text-[#8A8A8A] font-mono'>Active Accounts</CardDescription>
                  <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-white font-mono'>
                    45,678
                  </CardTitle>
                  <CardAction>
                    <Badge variant='outline' className='border-none text-white bg-[#000000] font-mono'>
                      <Icons.trendingUp className='text-white' />
                      +12.5%
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                  <div className='line-clamp-1 flex gap-2 font-medium text-white'>
                    Strong user retention <Icons.trendingUp className='size-4 text-white' />
                  </div>
                  <div className='text-[#8A8A8A] text-xs font-mono'>Engagement exceed targets</div>
                </CardFooter>
              </Card>
              <Card className='@container/card bg-[#1A1A1A] border-[#1A1A1A] shadow-none'>
                <CardHeader>
                  <CardDescription className='text-[#8A8A8A] font-mono'>Growth Rate</CardDescription>
                  <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-white font-mono'>
                    4.5%
                  </CardTitle>
                  <CardAction>
                    <Badge variant='outline' className='border-none text-white bg-[#000000] font-mono'>
                      <Icons.trendingUp className='text-white' />
                      +4.5%
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                  <div className='line-clamp-1 flex gap-2 font-medium text-white'>
                    Steady performance increase <Icons.trendingUp className='size-4 text-white' />
                  </div>
                  <div className='text-[#8A8A8A] text-xs font-mono'>Meets growth projections</div>
                </CardFooter>
              </Card>
            </div>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
              <div className='col-span-4'>
                <BarGraph />
              </div>
              <Card className='col-span-4 md:col-span-3 bg-[#1A1A1A] border-[#1A1A1A] shadow-none'>
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
        </Tabs>
      </div>
    </PageContainer>
  );
}
