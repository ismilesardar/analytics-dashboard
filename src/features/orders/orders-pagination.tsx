'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { PaginationMeta } from '@/lib/server/pagination';

interface OrdersPaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function OrdersPagination({
  meta,
  onPageChange
}: OrdersPaginationProps) {
  const { page, totalPages, total } = meta;

  return (
    <div className='text-muted-foreground flex items-center justify-between gap-4 text-sm'>
      <p>
        Page {page} of {totalPages} · {total} orders
      </p>
      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className='size-4' />
          Previous
        </Button>
        <Button
          variant='outline'
          size='sm'
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className='size-4' />
        </Button>
      </div>
    </div>
  );
}
