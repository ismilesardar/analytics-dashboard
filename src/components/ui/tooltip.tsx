'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/lib/utils';

export interface TooltipProps
  extends Omit<TooltipPrimitive.TooltipContentProps, 'content'> {
  content:
    | React.ReactNode
    | string
    | ((props: { setOpen: (open: boolean) => void }) => React.ReactNode);
  contentClassName?: string;
  disabled?: boolean;
  disableHoverableContent?: TooltipPrimitive.TooltipProps['disableHoverableContent'];
  delayDuration?: TooltipPrimitive.TooltipProps['delayDuration'];
}

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot='tooltip-provider'
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot='tooltip' {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot='tooltip-trigger' {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot='tooltip-content'
        sideOffset={sideOffset}
        className={cn(
          'bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance',
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className='bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]' />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

function DynamicTooltipWrapper({
  children,
  tooltipProps
}: {
  children: React.ReactNode;
  tooltipProps?: TooltipProps;
}) {
  const [open, setOpen] = React.useState(false);

  if (!tooltipProps) return children;

  const {
    content,
    contentClassName,
    disabled,
    disableHoverableContent,
    delayDuration,
    ...contentProps
  } = tooltipProps;

  if (disabled) return children;

  const isFunctionContent = typeof content === 'function';

  return (
    <Tooltip
      {...(isFunctionContent ? { open, onOpenChange: setOpen } : {})}
      disableHoverableContent={disableHoverableContent}
      delayDuration={delayDuration}
    >
      <TooltipTrigger asChild>
        <span className='inline-flex w-full'>{children}</span>
      </TooltipTrigger>
      <TooltipContent className={contentClassName} {...contentProps}>
        {isFunctionContent ? content({ setOpen }) : content}
      </TooltipContent>
    </Tooltip>
  );
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  DynamicTooltipWrapper
};
