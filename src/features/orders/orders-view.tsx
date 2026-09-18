'use client';

import { useCallback, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData
} from '@tanstack/react-query';
import { AlertCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { PageShell } from '@/components/layout/page-shell';
import { useMinLoadingDuration } from '@/hooks/use-min-loading-duration';
import { deleteOrder, getOrders, updateOrderStatus } from './api';
import { CreateOrderSheet } from './create-order-sheet';
import { OrderDetailSheet } from './order-detail-sheet';
import { OrdersFiltersBar } from './orders-filters';
import { OrdersPagination } from './orders-pagination';
import { OrdersTable } from './orders-table';
import { ordersKeys } from './query-keys';
import type { OrderStatus } from './types';
import { useOrdersFilters } from './use-orders-filters';

export function OrdersView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const { filters, setQuery, setStatus, setDateRange, setPage, resetFilters } =
    useOrdersFilters();

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Order deleted');
      setDeleteOrderId(null);
    },
    onError: (error: AxiosError<{ error?: { message?: string } }>) => {
      toast.error(
        error.response?.data?.error?.message ??
          'Could not delete the order. Please try again.'
      );
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Order status updated');
    },
    onError: (error: AxiosError<{ error?: { message?: string } }>) => {
      toast.error(
        error.response?.data?.error?.message ??
          'Could not update the order status. Please try again.'
      );
    }
  });

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
      actions={
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className='mr-2 size-4' />
          Add order
        </Button>
      }
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
              <OrdersTable
                orders={data.data}
                onSelectOrder={selectOrder}
                onDeleteOrder={setDeleteOrderId}
                onChangeStatus={(id, status) =>
                  statusMutation.mutate({ id, status })
                }
              />
              <OrdersPagination meta={data.meta} onPageChange={setPage} />
            </>
          )
        )}
      </div>

      <OrderDetailSheet orderId={orderId} onClose={closeOrder} />
      <CreateOrderSheet open={isCreateOpen} onOpenChange={setCreateOpen} />

      <AlertDialog
        open={!!deleteOrderId}
        onOpenChange={(open) => !open && setDeleteOrderId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete order</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete order {deleteOrderId}. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={() =>
                deleteOrderId && deleteMutation.mutate(deleteOrderId)
              }
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
