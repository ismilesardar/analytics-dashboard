import { customers, orders, type Order } from './dataset';
import { bucketSeries, type Granularity } from './date-buckets';

const DAY = 24 * 60 * 60 * 1000;

/** Orders in these statuses count as confirmed revenue; `pending`/`cancelled` don't. */
const REVENUE_STATUSES: Order['status'][] = [
  'delivered',
  'shipped',
  'processing'
];

export type Period = '7d' | '30d' | '90d' | '6m';

const PERIOD_DAYS: Record<Period, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '6m': 182
};

export function resolvePeriodRange(period: Period): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date(to.getTime() - PERIOD_DAYS[period] * DAY);
  return { from, to };
}

export function defaultGranularity(period: Period): Granularity {
  return period === '90d' || period === '6m' ? 'week' : 'day';
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeSummary(from: Date | null, to: Date) {
  const scoped = orders.filter((order) => {
    const createdAt = new Date(order.createdAt);
    return (!from || createdAt >= from) && createdAt <= to;
  });

  const totalOrders = scoped.length;
  const totalRevenue = scoped
    .filter((order) => REVENUE_STATUSES.includes(order.status))
    .reduce((sum, order) => sum + order.amount, 0);
  const activeCustomers = customers.filter(
    (customer) => customer.status === 'active'
  ).length;
  // No visitor/session entity exists in this mock dataset, so conversion
  // rate is approximated as the share of the customer base that's active
  // (placed an order in the trailing 90 days) rather than orders/visitors.
  const conversionRate =
    customers.length > 0 ? (activeCustomers / customers.length) * 100 : 0;

  return {
    totalRevenue: round2(totalRevenue),
    totalOrders,
    activeCustomers,
    conversionRate: round2(conversionRate)
  };
}

export function computeChartSeries(period: Period, granularity: Granularity) {
  const { from, to } = resolvePeriodRange(period);

  const revenue = bucketSeries(
    orders.filter((order) => REVENUE_STATUSES.includes(order.status)),
    from,
    to,
    granularity,
    (order) => new Date(order.createdAt),
    (bucket) => round2(bucket.reduce((sum, order) => sum + order.amount, 0))
  );

  const ordersSeries = bucketSeries(
    orders,
    from,
    to,
    granularity,
    (order) => new Date(order.createdAt),
    (bucket) => bucket.length
  );

  return { revenue, orders: ordersSeries };
}
