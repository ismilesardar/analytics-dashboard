import type { ChartPeriod } from './types';

export const dashboardKeys = {
  summary: ['analytics', 'summary'] as const,
  charts: (period: ChartPeriod) => ['analytics', 'charts', period] as const,
  activities: (limit: number) => ['activities', limit] as const,
  recentOrders: (limit: number) => ['orders', 'recent', limit] as const
};
