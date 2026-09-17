'use client';

import { queryClient } from '@/lib/api-setting/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

export default function ReactQueryProviders({
  children
}: {
  children: ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
