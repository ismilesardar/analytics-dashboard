'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LineChart, LogOut, ShoppingCart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/layout/ThemeToggle/theme-toggle';
import { useAuthStore } from '@/features/auth/store';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Dashboard', icon: LineChart },
  { href: '/orders', label: 'Orders', icon: ShoppingCart }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = () => {
    clearSession();
    router.replace('/login');
  };

  return (
    <div className='flex min-h-svh flex-col'>
      <header className='flex h-13 shrink-0 items-center justify-between border-b px-4 md:px-6'>
        <div className='flex items-center gap-6'>
          <Link href='/' className='flex items-center gap-2 font-semibold'>
            <span className='flex size-7 items-center justify-center rounded-lg bg-(--brand-color) text-white'>
              <LineChart className='size-4' />
            </span>
            <span className='hidden sm:inline'>Pulse</span>
          </Link>

          <nav className='flex items-center gap-1'>
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <link.icon className='size-4' />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className='flex items-center gap-2'>
          <ModeToggle />
          <Button
            variant='ghost'
            size='icon'
            onClick={handleLogout}
            aria-label='Log out'
          >
            <LogOut className='size-4' />
          </Button>
        </div>
      </header>

      <div className='flex flex-1'>{children}</div>
    </div>
  );
}
