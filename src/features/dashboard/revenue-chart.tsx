'use client';

import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { useMinLoadingDuration } from '@/hooks/use-min-loading-duration';
import { formatCurrency, formatDate } from '@/lib/format';
import { getChartSeries } from './api';
import { dashboardKeys } from './query-keys';
import type { ChartPeriod } from './types';

const chartConfig = {
  value: { label: 'Revenue', color: 'var(--chart-1)' }
} satisfies ChartConfig;

export function RevenueChart({ period }: { period: ChartPeriod }) {
  const {
    data,
    isLoading: isLoadingQuery,
    isError
  } = useQuery({
    queryKey: dashboardKeys.charts(period),
    queryFn: () => getChartSeries(period)
  });
  const isLoading = useMinLoadingDuration(isLoadingQuery);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className='h-64 w-full' />
        ) : isError || !data ? (
          <div className='text-muted-foreground flex h-64 items-center justify-center text-sm'>
            Couldn&apos;t load revenue data.
          </div>
        ) : data.revenue.every((point) => point.value === 0) ? (
          <div className='text-muted-foreground flex h-64 items-center justify-center text-sm'>
            No revenue in this period.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className='h-64 w-full'>
            <AreaChart data={data.revenue}>
              <defs>
                <linearGradient id='revenueFill' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='5%'
                    stopColor='var(--color-value)'
                    stopOpacity={0.35}
                  />
                  <stop
                    offset='95%'
                    stopColor='var(--color-value)'
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray='3 3' />
              <XAxis
                dataKey='date'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tickFormatter={(value: string) =>
                  formatDate(value, {
                    month: 'short',
                    day: 'numeric',
                    year: undefined
                  })
                }
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => formatDate(value as string)}
                    formatter={(value) => formatCurrency(value as number)}
                  />
                }
              />
              <Area
                dataKey='value'
                type='monotone'
                fill='url(#revenueFill)'
                stroke='var(--color-value)'
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
