'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/components/order-status-badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/format';
import { getOrder } from './api';
import { ordersKeys } from './query-keys';

interface OrderDetailSheetProps {
  orderId: string | null;
  onClose: () => void;
}

export function OrderDetailSheet({ orderId, onClose }: OrderDetailSheetProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ordersKeys.detail(orderId ?? ''),
    queryFn: () => getOrder(orderId as string),
    enabled: !!orderId
  });

  return (
    <Sheet open={!!orderId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className='sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>{orderId ?? 'Order'}</SheetTitle>
          <SheetDescription>Order details</SheetDescription>
        </SheetHeader>

        <div className='flex-1 space-y-4 overflow-y-auto px-4 pb-4'>
          {isLoading ? (
            <div className='space-y-3'>
              <Skeleton className='h-5 w-32' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-24 w-full' />
            </div>
          ) : isError || !data ? (
            <div className='flex flex-col items-center gap-3 py-10 text-center'>
              <AlertCircle className='text-destructive size-6' />
              <p className='text-muted-foreground text-sm'>
                Couldn&apos;t load this order.
              </p>
              <Button variant='outline' size='sm' onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : (
            <>
              <div className='flex items-center justify-between'>
                <OrderStatusBadge status={data.status} />
                <p className='text-lg font-semibold'>
                  {formatCurrency(data.amount, data.currency)}
                </p>
              </div>

              <dl className='grid grid-cols-2 gap-y-2 text-sm'>
                <dt className='text-muted-foreground'>Customer</dt>
                <dd className='text-right'>{data.customerName}</dd>
                <dt className='text-muted-foreground'>Placed</dt>
                <dd className='text-right'>{formatDate(data.createdAt)}</dd>
                <dt className='text-muted-foreground'>Last updated</dt>
                <dd className='text-right'>{formatDate(data.updatedAt)}</dd>
              </dl>

              <div>
                <p className='mb-2 text-sm font-medium'>Items</p>
                <ul className='space-y-2'>
                  {data.items.map((item, index) => (
                    <li
                      key={index}
                      className='flex items-center justify-between rounded-md border px-3 py-2 text-sm'
                    >
                      <div>
                        <p>{item.productName}</p>
                        <p className='text-muted-foreground text-xs'>
                          Qty {item.quantity} × {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <p className='font-medium'>
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
