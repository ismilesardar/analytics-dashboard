'use client';

import Link from 'next/link';
import { LineChart } from 'lucide-react';

import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader
} from '@/components/ui/sidebar';
import { SideNavItems } from '@/features/app-sidebar/components/side-nav-items';
import { UserDropdown } from '@/features/app-sidebar/components/user-dropdown';
import { ModeToggle } from './ThemeToggle/theme-toggle';

export function AppSidebar() {
  return (
    <Sidebar collapsible='icon' variant='inset' className='p-1'>
      <div className='grid! w-full grid-cols-5 gap-1 bg-neutral-200/90 dark:bg-neutral-800'>
        <div className='col-span-1 flex flex-col items-center justify-between px-1 py-4'>
          <div className='flex flex-col items-center gap-y-4 px-1'>
            <Link
              className='block overflow-visible rounded-lg px-1 py-1 transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-black/50'
              href='/'
            >
              <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-(--brand-color) to-orange-500 shadow-sm transition-shadow group-hover:shadow-md'>
                <LineChart className='h-5 w-5 text-white' />
              </div>
            </Link>
          </div>

          <div className='flex flex-col items-center gap-2'>
            <ModeToggle />
            <UserDropdown />
          </div>
        </div>

        <ScrollArea className='bg-card col-span-4 h-[calc(100dvh-7px)] rounded-xl'>
          <div className='overflow-hidden rounded-xl'>
            <SidebarHeader>
              <h4 className='text-secondary-foreground px-3 pt-2 text-lg font-semibold'>
                Pulse
              </h4>
            </SidebarHeader>

            <SidebarContent className='overflow-x-hidden'>
              <SideNavItems />
            </SidebarContent>
          </div>
        </ScrollArea>
      </div>
    </Sidebar>
  );
}
