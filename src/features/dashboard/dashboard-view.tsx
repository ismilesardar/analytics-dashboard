'use client';

import { useState } from 'react';

import { PageShell } from '@/components/layout/page-shell';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { OrdersChart } from './orders-chart';
import { RecentActivities } from './recent-activities';
import { RecentOrders } from './recent-orders';
import { RevenueChart } from './revenue-chart';
import { StatCards } from './stat-cards';
import type { ChartPeriod } from './types';

const PERIODS: { value: ChartPeriod; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '6m', label: 'Last 6 months' }
];

export function DashboardView() {
  const [period, setPeriod] = useState<ChartPeriod>('30d');

  return (
    <PageShell
      title='Dashboard'
      description='Revenue, orders, and customer activity at a glance.'
      actions={
        <Select
          value={period}
          onValueChange={(value) => setPeriod(value as ChartPeriod)}
        >
          <SelectTrigger size='sm' className='w-36'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      <StatCards />

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <RevenueChart period={period} />
        <OrdersChart period={period} />
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <RecentOrders />
        <RecentActivities />
      </div>
    </PageShell>
  );
}
