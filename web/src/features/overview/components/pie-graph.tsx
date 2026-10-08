'use client';

import { LabelList, Pie, PieChart } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';

const chartData = [
  { browser: 'chrome', visitors: 275, fill: '#FFFFFF' },
  { browser: 'safari', visitors: 200, fill: '#8A8A8A' },
  { browser: 'firefox', visitors: 187, fill: '#1A1A1A' },
  { browser: 'edge', visitors: 173, fill: '#8A8A8A' },
  { browser: 'other', visitors: 90, fill: '#FFFFFF' }
];

const chartConfig = {
  visitors: {
    label: 'Visitors'
  },
  chrome: {
    label: 'Chrome',
    color: '#FFFFFF'
  },
  safari: {
    label: 'Safari',
    color: '#8A8A8A'
  },
  firefox: {
    label: 'Firefox',
    color: '#1A1A1A'
  },
  edge: {
    label: 'Edge',
    color: '#8A8A8A'
  },
  other: {
    label: 'Other',
    color: '#FFFFFF'
  }
} satisfies ChartConfig;

export function PieGraph() {
  return (
    <Card className='flex h-full flex-col bg-[#1A1A1A] border-[#1A1A1A] shadow-none'>
      <CardHeader className='items-center pb-0'>
        <CardTitle className='text-white font-orbitron flex items-center justify-between w-full'>
          <span>Device Distribution</span>
          <Badge variant='outline' className='border-none text-white bg-[#000000] font-orbitron'>
            <Icons.trendingUp className='text-white' />
            +5.2%
          </Badge>
        </CardTitle>
        <CardDescription className='text-[#8A8A8A] font-orbitron'>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-1 items-center justify-center pb-0'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[300px] min-h-[250px]'
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey='visitors' hideLabel />} />
            <Pie
              data={chartData}
              innerRadius={30}
              dataKey='visitors'
              radius={10}
              cornerRadius={2}
              paddingAngle={4}
              stroke='#8A8A8A'
              strokeWidth={1}
            >
              <LabelList
                dataKey='visitors'
                stroke='none'
                fontSize={12}
                fontWeight={600}
                fill='#FFFFFF'
                formatter={(value) => String(value ?? '')}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
