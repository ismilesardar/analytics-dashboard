'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { STATUS_LABELS } from '@/components/order-status-badge';
import { createOrder, getCustomers } from './api';
import {
  createOrderSchema,
  ORDER_STATUS_OPTIONS,
  type CreateOrderFormInput,
  type CreateOrderFormValues
} from './order-schema';

interface CreateOrderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyItem = { productName: '', quantity: 1, unitPrice: 0 };

export function CreateOrderSheet({
  open,
  onOpenChange
}: CreateOrderSheetProps) {
  const queryClient = useQueryClient();

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
    enabled: open
  });

  const form = useForm<CreateOrderFormInput, unknown, CreateOrderFormValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: { customerId: '', status: 'pending', items: [emptyItem] },
    mode: 'onChange'
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items'
  });

  useEffect(() => {
    if (!open) {
      form.reset({ customerId: '', status: 'pending', items: [emptyItem] });
    }
  }, [open, form]);

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Order created');
      onOpenChange(false);
    },
    onError: (error: AxiosError<{ error?: { message?: string } }>) => {
      toast.error(
        error.response?.data?.error?.message ??
          'Could not create the order. Please try again.'
      );
    }
  });

  const onSubmit = (values: CreateOrderFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>New order</SheetTitle>
          <SheetDescription>
            Pick a customer and add the items being ordered.
          </SheetDescription>
        </SheetHeader>

        <Form
          form={form}
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-1 flex-col overflow-hidden'
        >
          <div className='flex-1 space-y-4 overflow-y-auto px-4 pb-4'>
            <FormField
              control={form.control}
              name='customerId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select a customer' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers?.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select a status' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ORDER_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <p className='text-sm font-medium'>Items</p>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => append(emptyItem)}
                >
                  <Plus className='mr-1 size-4' />
                  Add item
                </Button>
              </div>

              {fields.map((item, index) => (
                <div key={item.id} className='space-y-2 rounded-md border p-3'>
                  <div className='flex items-start gap-2'>
                    <FormField
                      control={form.control}
                      name={`items.${index}.productName`}
                      render={({ field }) => (
                        <FormItem className='flex-1'>
                          <FormLabel className='text-xs'>Product</FormLabel>
                          <FormControl>
                            <Input placeholder='Product name' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='mt-6 shrink-0'
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                    >
                      <Trash2 className='size-4' />
                    </Button>
                  </div>
                  <div className='flex gap-2'>
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className='flex-1'>
                          <FormLabel className='text-xs'>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              min={1}
                              {...field}
                              value={field.value as number}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem className='flex-1'>
                          <FormLabel className='text-xs'>Unit price</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              min={0}
                              step='0.01'
                              {...field}
                              value={field.value as number}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <SheetFooter>
            <Button
              type='submit'
              disabled={mutation.isPending || !form.formState.isValid}
            >
              {mutation.isPending ? 'Creating…' : 'Create order'}
            </Button>
          </SheetFooter>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
