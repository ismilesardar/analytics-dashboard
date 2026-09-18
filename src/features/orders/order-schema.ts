import { z } from 'zod';

export const ORDER_STATUS_OPTIONS = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
] as const;

export const createOrderSchema = z.object({
  customerId: z.string().min(1, 'Select a customer'),
  status: z.enum(ORDER_STATUS_OPTIONS),
  items: z
    .array(
      z.object({
        productName: z.string().trim().min(1, 'Required'),
        quantity: z.coerce.number().int().min(1, 'Min 1'),
        unitPrice: z.coerce.number().min(0, 'Min 0')
      })
    )
    .min(1, 'Add at least one item')
});

export type CreateOrderFormInput = z.input<typeof createOrderSchema>;
export type CreateOrderFormValues = z.output<typeof createOrderSchema>;
