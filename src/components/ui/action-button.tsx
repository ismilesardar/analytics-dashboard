'use client';

import { type ComponentProps, type ReactNode, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Spinner } from './spinner';

export function ActionButton({
  action,
  requireAreYouSure = false,
  showChildren = true,
  areYouSureDescription = 'This action cannot be undone.',
  ...props
}: ComponentProps<typeof Button> & {
  action: () => Promise<{ error: boolean; message?: string }>;
  showChildren?: boolean;
  requireAreYouSure?: boolean;
  areYouSureDescription?: ReactNode;
}) {
  const [isLoading, startTransition] = useTransition();

  function performAction() {
    startTransition(async () => {
      const data = await action();
      if (data.error) {
        toast.error(data.message ?? 'Error');
      } else if (data.message) {
        toast.success(data.message);
      }
    });
  }

  if (requireAreYouSure) {
    return (
      <AlertDialog open={isLoading ? true : undefined}>
        <AlertDialogTrigger asChild>
          <Button {...props} />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {areYouSureDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isLoading} onClick={performAction}>
              {isLoading && <Spinner />} Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Button
      {...props}
      disabled={props.disabled ?? isLoading}
      onClick={(e) => {
        performAction();
        props.onClick?.(e);
      }}
    >
      {isLoading && <Spinner />}
      {!showChildren && isLoading ? null : props.children}
    </Button>
  );
}
