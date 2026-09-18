'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/features/auth/store';
import { cn } from '@/lib/utils';

export function UserDropdown() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = () => {
    clearSession();
    router.replace('/login');
  };

  const initials = user?.name?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'group relative flex size-11 items-center justify-center rounded-lg transition-colors duration-150',
            'hover:bg-neutral-300/60 dark:hover:bg-neutral-600/70',
            'outline-none focus-visible:ring-2 focus-visible:ring-black/50'
          )}
        >
          <Avatar className='size-7'>
            <AvatarFallback className='text-xs'>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' side='right' className='min-w-56'>
        <div className='px-2 py-1.5'>
          <p className='truncate text-sm font-medium'>{user?.name}</p>
          <p className='text-muted-foreground truncate text-sm'>
            {user?.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
