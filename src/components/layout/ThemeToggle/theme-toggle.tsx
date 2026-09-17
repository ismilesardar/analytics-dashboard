'use client';

import { IconBrightness } from '@tabler/icons-react';
import { useTheme } from 'next-themes';
import * as React from 'react';

import { Button } from '@/components/ui/button';

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  const handleThemeToggle = React.useCallback(
    (e?: React.MouseEvent) => {
      const newMode = resolvedTheme === 'dark' ? 'light' : 'dark';
      const root = document.documentElement;

      if (!document.startViewTransition) {
        setTheme(newMode);
        return;
      }

      // Set coordinates from the click event
      if (e) {
        root.style.setProperty('--x', `${e.clientX}px`);
        root.style.setProperty('--y', `${e.clientY}px`);
      }

      document.startViewTransition(() => {
        setTheme(newMode);
      });
    },
    [resolvedTheme, setTheme]
  );

  return (
    <Button
      variant='secondary'
      size='icon'
      className='flex size-11 items-center justify-center rounded-lg border-none bg-transparent p-1.5 text-left text-sm shadow-none transition-all duration-75 outline-none hover:bg-neutral-300/60 dark:hover:bg-neutral-600/70'
      onClick={handleThemeToggle}
    >
      <div className='flex items-center justify-center'>
        <IconBrightness className='size-4.5' />
        <span className='sr-only'>Toggle theme</span>
      </div>
    </Button>
  );
}
