'use client';

import type { ReactNode } from 'react';
import PageContainer from './page-container';
import { Button } from '@/components/ui/button';
import { IconRefresh, IconAlertCircle, IconInbox } from '@tabler/icons-react';

export interface PageShellProps {
  /** Page title displayed in the header */
  title: string;
  /** Optional description below the title */
  description?: string;
  /** Optional action buttons/elements in the header */
  actions?: ReactNode;
  /** Loading state — shows skeleton */
  isLoading?: boolean;
  /** Custom skeleton to render during loading. Falls back to a default if omitted. */
  skeleton?: ReactNode;
  /** Error state */
  isError?: boolean;
  /** Error message shown in the error state */
  errorMessage?: string;
  /** Called when the user clicks "Try again" */
  onRetry?: () => void;
  /** Empty state — shown when data is empty and not loading/error */
  isEmpty?: boolean;
  /** Message shown in the empty state */
  emptyMessage?: string;
  /** Optional action in the empty state */
  emptyAction?: ReactNode;
  /** Hero section rendered between the header and children */
  hero?: ReactNode;
  /** Page content */
  children: ReactNode;
  /** Max width constraint (default: max-w-6xl) */
  maxWidth?: string;
}

export function PageShell({
  title,
  description,
  actions,
  isLoading,
  skeleton,
  isError,
  errorMessage = 'Something went wrong. Please try again.',
  onRetry,
  isEmpty,
  emptyMessage = 'No data available yet.',
  emptyAction,
  hero,
  children,
  maxWidth = 'max-w-6xl'
}: PageShellProps) {
  // ── Loading ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <PageContainer>
        <div className={`mx-auto w-full ${maxWidth} space-y-8 p-6`}>
          {skeleton ?? <DefaultSkeleton />}
        </div>
      </PageContainer>
    );
  }

  // ── Error ──────────────────────────────────────────────────
  if (isError) {
    return (
      <PageContainer>
        <div
          className={`mx-auto flex ${maxWidth} flex-col items-center justify-center p-6 pt-24`}
        >
          <div className='w-full max-w-md rounded-2xl border border-red-200 bg-red-50/80 p-8 text-center shadow-sm backdrop-blur-sm dark:border-red-900 dark:bg-red-950/50'>
            <div className='mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50'>
              <IconAlertCircle className='size-6 text-red-600 dark:text-red-400' />
            </div>
            <p className='text-foreground text-lg font-semibold'>
              Unable to load
            </p>
            <p className='text-muted-foreground mt-1.5 text-sm'>
              {errorMessage}
            </p>
            {onRetry && (
              <Button
                onClick={onRetry}
                variant='outline'
                className='mt-5 cursor-pointer'
              >
                <IconRefresh className='mr-2 size-4' />
                Try again
              </Button>
            )}
          </div>
        </div>
      </PageContainer>
    );
  }

  // ── Empty ──────────────────────────────────────────────────
  if (isEmpty) {
    return (
      <PageContainer>
        <div className={`mx-auto w-full ${maxWidth} space-y-8 p-6`}>
          <PageHeader
            title={title}
            description={description}
            actions={actions}
          />
          <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 p-16 text-center dark:border-neutral-700'>
            <div className='mb-3 flex size-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800'>
              <IconInbox className='size-6 text-neutral-400' />
            </div>
            <p className='text-muted-foreground text-sm'>{emptyMessage}</p>
            {emptyAction && <div className='mt-4'>{emptyAction}</div>}
          </div>
        </div>
      </PageContainer>
    );
  }

  // ── Normal ─────────────────────────────────────────────────
  return (
    <PageContainer>
      <div className={`mx-auto w-full ${maxWidth} space-y-8 p-6`}>
        <PageHeader title={title} description={description} actions={actions} />
        {hero && <div>{hero}</div>}
        {children}
      </div>
    </PageContainer>
  );
}

// ── Internal header ─────────────────────────────────────────

function PageHeader({
  title,
  description,
  actions
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
      <div className='space-y-1'>
        <h1 className='text-foreground text-2xl font-bold tracking-tight'>
          {title}
        </h1>
        {description && (
          <p className='text-muted-foreground text-sm'>{description}</p>
        )}
      </div>
      <div className='flex shrink-0 items-center gap-3'>
        {actions}
        <time className='text-muted-foreground hidden pt-1 text-sm sm:block'>
          {today}
        </time>
      </div>
    </div>
  );
}

// ── Default skeleton ────────────────────────────────────────

function DefaultSkeleton() {
  return (
    <>
      <div className='space-y-2'>
        <div className='bg-muted h-8 w-64 animate-pulse rounded-lg' />
        <div className='bg-muted h-4 w-96 animate-pulse rounded-lg' />
      </div>
      <div className='bg-muted h-56 animate-pulse rounded-2xl' />
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='bg-muted h-32 animate-pulse rounded-2xl' />
        ))}
      </div>
    </>
  );
}
