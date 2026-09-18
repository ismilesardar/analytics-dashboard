'use client';

import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { useMinLoadingDuration } from '@/hooks/use-min-loading-duration';
import { formatDate } from '@/lib/format';
import { getChartSeries } from './api';
import { dashboardKeys } from './query-keys';
import type { ChartPeriod } from './types';

const chartConfig = {
  value: { label: 'Orders', color: 'var(--chart-2)' }
} satisfies ChartConfig;

export function OrdersChart({ period }: { period: ChartPeriod }) {
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
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className='h-64 w-full' />
        ) : isError || !data ? (
          <div className='text-muted-foreground flex h-64 items-center justify-center text-sm'>
            Couldn&apos;t load orders data.
          </div>
        ) : data.orders.every((point) => point.value === 0) ? (
          <div className='text-muted-foreground flex h-64 items-center justify-center text-sm'>
            No orders in this period.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className='h-64 w-full'>
            <BarChart data={data.orders}>
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
                  />
                }
              />
              <Bar dataKey='value' fill='var(--color-value)' radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
