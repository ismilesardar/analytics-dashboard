import type { Order } from '@/types/order';

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  activeCustomers: number;
  conversionRate: number;
}

export type ChartPeriod = '7d' | '30d' | '90d' | '6m';

export interface ChartPoint {
  date: string;
  value: number;
}

export interface ChartSeries {
  revenue: ChartPoint[];
  orders: ChartPoint[];
}

export type ActivityType =
  | 'order_created'
  | 'order_status_changed'
  | 'order_cancelled'
  | 'customer_signed_up'
  | 'payment_received'
  | 'refund_issued';

export interface SystemActivity {
  id: string;
  type: ActivityType;
  message: string;
  relatedOrderId?: string;
  relatedCustomerId?: string;
  createdAt: string;
}

export type RecentOrder = Order;
