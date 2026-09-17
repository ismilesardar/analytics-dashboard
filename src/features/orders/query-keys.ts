import type { OrdersFilters } from './types';

export const ordersKeys = {
  list: (filters: OrdersFilters) => ['orders', 'list', filters] as const,
  detail: (id: string) => ['orders', 'detail', id] as const
};
