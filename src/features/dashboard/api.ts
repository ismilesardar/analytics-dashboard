import { api } from '@/lib/api-setting/axios';
import type { Order } from '@/types/order';
import type {
  AnalyticsSummary,
  ChartPeriod,
  ChartSeries,
  SystemActivity
} from './types';

export async function getSummary(): Promise<AnalyticsSummary> {
  const res = await api.get<{ data: AnalyticsSummary }>(
    '/api/analytics/summary'
  );
  return res.data.data;
}

export async function getChartSeries(
  period: ChartPeriod
): Promise<ChartSeries> {
  const res = await api.get<{ data: ChartSeries }>('/api/analytics/charts', {
    params: { period }
  });
  return res.data.data;
}

export async function getActivities(limit: number): Promise<SystemActivity[]> {
  const res = await api.get<{ data: SystemActivity[] }>('/api/activities', {
    params: { limit }
  });
  return res.data.data;
}

export async function getRecentOrders(limit: number): Promise<Order[]> {
  const res = await api.get<{ data: Order[] }>('/api/orders', {
    params: { page: 1, pageSize: limit, sort: 'createdAt:desc' }
  });
  return res.data.data;
}
