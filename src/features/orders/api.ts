import { api } from '@/lib/api-setting/axios';
import type { CreateOrderFormValues } from './order-schema';
import type { Customer, Order, OrdersFilters, OrdersResponse } from './types';

export async function getOrders(
  filters: OrdersFilters
): Promise<OrdersResponse> {
  const res = await api.get<OrdersResponse>('/api/orders', {
    params: {
      q: filters.q || undefined,
      status: filters.status === 'all' ? undefined : filters.status,
      from: filters.from || undefined,
      to: filters.to || undefined,
      page: filters.page,
      pageSize: filters.pageSize
    }
  });
  return res.data;
}

export async function getOrder(id: string): Promise<Order> {
  const res = await api.get<{ data: Order }>(`/api/orders/${id}`);
  return res.data.data;
}

export async function createOrder(
  input: CreateOrderFormValues
): Promise<Order> {
  const res = await api.post<{ data: Order }>('/api/orders', input);
  return res.data.data;
}

export async function getCustomers(): Promise<Customer[]> {
  const res = await api.get<{ data: Customer[] }>('/api/customers');
  return res.data.data;
}
