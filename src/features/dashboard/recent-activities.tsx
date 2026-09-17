'use client';

import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertCircle,
  Package,
  RefreshCcw,
  UserPlus,
  Wallet,
  XCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getActivities } from './api';
import { dashboardKeys } from './query-keys';
import type { ActivityType } from './types';

const LIMIT = 8;

const ACTIVITY_ICONS: Record<ActivityType, typeof Package> = {
  order_created: Package,
  order_status_changed: RefreshCcw,
  order_cancelled: XCircle,
  customer_signed_up: UserPlus,
  payment_received: Wallet,
  refund_issued: RefreshCcw
};

export function RecentActivities() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: dashboardKeys.activities(LIMIT),
    queryFn: () => getActivities(LIMIT)
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='space-y-3'>
            {Array.from({ length: LIMIT }).map((_, i) => (
              <Skeleton key={i} className='h-8 w-full' />
            ))}
          </div>
        ) : isError || !data ? (
          <div className='flex items-center justify-between gap-4 py-6'>
            <div className='text-muted-foreground flex items-center gap-2 text-sm'>
              <AlertCircle className='text-destructive size-4' />
              Couldn&apos;t load activity.
            </div>
            <Button variant='outline' size='sm' onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : data.length === 0 ? (
          <p className='text-muted-foreground py-6 text-center text-sm'>
            No recent activity.
          </p>
        ) : (
          <ul className='space-y-3'>
            {data.map((activity) => {
              const Icon = ACTIVITY_ICONS[activity.type];
              return (
                <li
                  key={activity.id}
                  className='flex items-start gap-3 text-sm'
                >
                  <span className='bg-accent mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full'>
                    <Icon className='text-muted-foreground size-3.5' />
                  </span>
                  <div className='min-w-0'>
                    <p className='truncate'>{activity.message}</p>
                    <p className='text-muted-foreground text-xs'>
                      {formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true
                      })}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
