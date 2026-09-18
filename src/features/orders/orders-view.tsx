'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/layout/page-shell';
import { useMinLoadingDuration } from '@/hooks/use-min-loading-duration';
import { getOrders } from './api';
import { OrderDetailSheet } from './order-detail-sheet';
import { OrdersFiltersBar } from './orders-filters';
import { OrdersPagination } from './orders-pagination';
import { OrdersTable } from './orders-table';
import { ordersKeys } from './query-keys';
import { useOrdersFilters } from './use-orders-filters';

export function OrdersView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { filters, setQuery, setStatus, setDateRange, setPage, resetFilters } =
    useOrdersFilters();

  const orderId = searchParams.get('orderId');

  const selectOrder = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('orderId', id);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const closeOrder = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('orderId');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  const {
    data,
    isLoading: isLoadingQuery,
    isError,
    refetch
  } = useQuery({
    queryKey: ordersKeys.list(filters),
    queryFn: () => getOrders(filters),
    placeholderData: keepPreviousData
  });
  const isLoading = useMinLoadingDuration(isLoadingQuery && !data);

  return (
    <PageShell
      title='Orders'
      description='Search, filter, and review every order.'
      isLoading={isLoading}
    >
      <div className='space-y-4'>
        <OrdersFiltersBar
          filters={filters}
          onQueryChange={setQuery}
          onStatusChange={setStatus}
          onDateRangeChange={setDateRange}
          onReset={resetFilters}
        />

        {isError && !data ? (
          <div className='flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center'>
            <AlertCircle className='text-destructive size-6' />
            <p className='text-muted-foreground text-sm'>
              Couldn&apos;t load orders.
            </p>
            <Button variant='outline' size='sm' onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : data && data.data.length === 0 ? (
          <div className='text-muted-foreground rounded-lg border border-dashed py-16 text-center text-sm'>
            No orders match these filters.
          </div>
        ) : (
          data && (
            <>
              <OrdersTable orders={data.data} onSelectOrder={selectOrder} />
              <OrdersPagination meta={data.meta} onPageChange={setPage} />
            </>
          )
        )}
      </div>

      <OrderDetailSheet orderId={orderId} onClose={closeOrder} />
    </PageShell>
  );
}
