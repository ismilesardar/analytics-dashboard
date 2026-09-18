'use client';

import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
  AlertCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMinLoadingDuration } from '@/hooks/use-min-loading-duration';
import { formatCurrency } from '@/lib/format';
import { getSummary } from './api';
import { dashboardKeys } from './query-keys';
import type { AnalyticsSummary } from './types';

const CARDS: {
  key: keyof AnalyticsSummary;
  label: string;
  icon: typeof DollarSign;
  format: (value: number) => string;
}[] = [
  {
    key: 'totalRevenue',
    label: 'Total Revenue',
    icon: DollarSign,
    format: (value) => formatCurrency(value)
  },
  {
    key: 'totalOrders',
    label: 'Total Orders',
    icon: ShoppingBag,
    format: (value) => value.toLocaleString('en-US')
  },
  {
    key: 'activeCustomers',
    label: 'Active Customers',
    icon: Users,
    format: (value) => value.toLocaleString('en-US')
  },
  {
    key: 'conversionRate',
    label: 'Conversion Rate',
    icon: TrendingUp,
    format: (value) => `${value}%`
  }
];

export function StatCards() {
  const {
    data,
    isLoading: isLoadingQuery,
    isError,
    refetch
  } = useQuery({
    queryKey: dashboardKeys.summary,
    queryFn: getSummary
  });
  const isLoading = useMinLoadingDuration(isLoadingQuery);

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {CARDS.map((card) => (
          <Card key={card.key}>
            <CardHeader className='flex flex-row items-center justify-between gap-2 pb-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='size-4 rounded-full' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-20' />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className='border-destructive/30'>
        <CardContent className='flex items-center justify-between gap-4 pt-6'>
          <div className='text-muted-foreground flex items-center gap-2 text-sm'>
            <AlertCircle className='text-destructive size-4' />
            Couldn&apos;t load summary metrics.
          </div>
          <Button variant='outline' size='sm' onClick={() => refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {CARDS.map((card) => (
        <Card key={card.key}>
          <CardHeader className='flex flex-row items-center justify-between gap-2 pb-2'>
            <CardTitle className='text-muted-foreground text-sm font-medium'>
              {card.label}
            </CardTitle>
            <card.icon className='text-muted-foreground size-4' />
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold tracking-tight'>
              {card.format(data[card.key])}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
