'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { OrderStatus } from '@/types/order';
import type { OrdersFilters } from './types';

const DEFAULT_PAGE_SIZE = 10;

export function useOrdersFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: OrdersFilters = useMemo(
    () => ({
      q: searchParams.get('q') ?? '',
      status: (searchParams.get('status') as OrderStatus | null) ?? 'all',
      from: searchParams.get('from'),
      to: searchParams.get('to'),
      page: Number(searchParams.get('page') ?? '1'),
      pageSize: Number(
        searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE)
      )
    }),
    [searchParams]
  );

  const updateParams = useCallback(
    (updates: Record<string, string | number | null>, resetPage = false) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '' || value === 'all') {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }
      if (resetPage) {
        params.delete('page');
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const setQuery = useCallback(
    (q: string) => updateParams({ q }, true),
    [updateParams]
  );
  const setStatus = useCallback(
    (status: OrderStatus | 'all') => updateParams({ status }, true),
    [updateParams]
  );
  const setDateRange = useCallback(
    (from: string | null, to: string | null) =>
      updateParams({ from, to }, true),
    [updateParams]
  );
  const setPage = useCallback(
    (page: number) => updateParams({ page }),
    [updateParams]
  );
  const resetFilters = useCallback(
    () => updateParams({ q: '', status: 'all', from: null, to: null }, true),
    [updateParams]
  );

  return { filters, setQuery, setStatus, setDateRange, setPage, resetFilters };
}
