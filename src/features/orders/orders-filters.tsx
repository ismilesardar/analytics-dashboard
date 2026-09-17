'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import type { OrderStatus } from '@/types/order';
import type { OrdersFilters } from './types';

const STATUS_OPTIONS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
];

interface OrdersFiltersBarProps {
  filters: OrdersFilters;
  onQueryChange: (q: string) => void;
  onStatusChange: (status: OrderStatus | 'all') => void;
  onDateRangeChange: (from: string | null, to: string | null) => void;
}

export function OrdersFiltersBar({
  filters,
  onQueryChange,
  onStatusChange,
  onDateRangeChange
}: OrdersFiltersBarProps) {
  const [searchInput, setSearchInput] = useState(filters.q);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    if (debouncedSearch !== filters.q) {
      onQueryChange(debouncedSearch);
    }
    // Only re-run when the debounced value itself changes — including
    // `filters.q`/`onQueryChange` here would refire on every URL update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
      <div className='relative flex-1 sm:max-w-xs'>
        <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2' />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder='Search order id or customer…'
          className='pl-8'
        />
      </div>

      <Select
        value={filters.status}
        onValueChange={(value) => onStatusChange(value as OrderStatus | 'all')}
      >
        <SelectTrigger className='w-full sm:w-40'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className='flex items-center gap-2'>
        <Input
          type='date'
          value={filters.from ?? ''}
          onChange={(e) =>
            onDateRangeChange(e.target.value || null, filters.to)
          }
          className='w-full sm:w-40'
          aria-label='From date'
        />
        <span className='text-muted-foreground text-sm'>to</span>
        <Input
          type='date'
          value={filters.to ?? ''}
          onChange={(e) =>
            onDateRangeChange(filters.from, e.target.value || null)
          }
          className='w-full sm:w-40'
          aria-label='To date'
        />
      </div>
    </div>
  );
}
