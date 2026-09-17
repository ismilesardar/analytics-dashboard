import type { Order, OrderStatus } from '@/types/order';
import type { PaginationMeta } from '@/lib/server/pagination';

export type { Order, OrderStatus };

export interface OrdersFilters {
  q: string;
  status: OrderStatus | 'all';
  from: string | null;
  to: string | null;
  page: number;
  pageSize: number;
}

export interface OrdersResponse {
  data: Order[];
  meta: PaginationMeta;
}
