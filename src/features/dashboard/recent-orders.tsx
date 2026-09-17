'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderStatusBadge } from '@/components/order-status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/format';
import { getRecentOrders } from './api';
import { dashboardKeys } from './query-keys';

const LIMIT = 6;

export function RecentOrders() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: dashboardKeys.recentOrders(LIMIT),
    queryFn: () => getRecentOrders(LIMIT)
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='space-y-3'>
            {Array.from({ length: LIMIT }).map((_, i) => (
              <Skeleton key={i} className='h-10 w-full' />
            ))}
          </div>
        ) : isError || !data ? (
          <div className='flex items-center justify-between gap-4 py-6'>
            <div className='text-muted-foreground flex items-center gap-2 text-sm'>
              <AlertCircle className='text-destructive size-4' />
              Couldn&apos;t load recent orders.
            </div>
            <Button variant='outline' size='sm' onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : data.length === 0 ? (
          <p className='text-muted-foreground py-6 text-center text-sm'>
            No orders yet.
          </p>
        ) : (
          <div className='space-y-1'>
            {data.map((order) => (
              <div
                key={order.id}
                className='hover:bg-accent/50 flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm'
              >
                <div className='min-w-0 flex-1'>
                  <p className='truncate font-medium'>{order.customerName}</p>
                  <p className='text-muted-foreground text-xs'>
                    {order.id} · {formatDate(order.createdAt)}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
                <p className='w-20 shrink-0 text-right font-medium'>
                  {formatCurrency(order.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
