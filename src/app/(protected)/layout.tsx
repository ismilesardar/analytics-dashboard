'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthHasHydrated, useAuthStore } from '@/features/auth/store';
import { AppSidebar } from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Spinner } from '@/components/ui/spinner';

export default function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const hasHydrated = useAuthHasHydrated();
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!hasHydrated || token) return;
    // Give the persisted token a brief moment to settle right after
    // hydration completes before treating this as "logged out" — avoids
    // redirecting on a transient render where hydration has just finished
    // but the store hasn't fully propagated the restored token yet.
    const timer = setTimeout(() => {
      if (!useAuthStore.getState().token) {
        router.replace('/login');
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [hasHydrated, token, router]);

  if (!hasHydrated || !token) {
    return (
      <div className='flex min-h-svh items-center justify-center'>
        <Spinner />
      </div>
    );
  }

  return (
    <SidebarProvider className='gap-1 bg-neutral-200/90! dark:bg-neutral-800!'>
      <AppSidebar />
      <SidebarInset className='h-[calc(100dvh-15px)]! overflow-hidden! bg-white dark:bg-neutral-950/90'>
        <Header />
        <ScrollArea className='h-[calc(100%-64px)] rounded-md'>
          {children}
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}
