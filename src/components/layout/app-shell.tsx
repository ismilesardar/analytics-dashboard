'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LineChart, LogOut, ShoppingCart } from 'lucide-react';

import { ModeToggle } from '@/components/layout/ThemeToggle/theme-toggle';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/features/auth/store';

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
    <SidebarProvider className='h-svh'>
      <Sidebar collapsible='icon'>
        <SidebarHeader>
          <Link
            href='/'
            className='flex items-center gap-2 px-2 py-1 font-semibold'
          >
            <span className='flex size-7 shrink-0 items-center justify-center rounded-lg bg-(--brand-color) text-white'>
              <LineChart className='size-4' />
            </span>
            <span className='truncate group-data-[collapsible=icon]:hidden'>
              Pulse
            </span>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_LINKS.map((link) => {
                  const isActive =
                    link.href === '/'
                      ? pathname === '/'
                      : pathname.startsWith(link.href);
                  return (
                    <SidebarMenuItem key={link.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={link.label}
                      >
                        <Link href={link.href}>
                          <link.icon />
                          <span>{link.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip='Log out'>
                <LogOut />
                <span>Log out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className='flex h-13 shrink-0 items-center justify-between border-b px-4'>
          <SidebarTrigger />
          <ModeToggle />
        </header>
        <div className='flex flex-1'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
