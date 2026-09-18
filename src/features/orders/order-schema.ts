import { z } from 'zod';

export const createOrderSchema = z.object({
  customerId: z.string().min(1, 'Select a customer'),
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
