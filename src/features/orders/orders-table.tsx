'use client';

import { memo, useCallback } from 'react';

import { OrderStatusBadge } from '@/components/order-status-badge';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Order } from '@/types/order';

interface OrdersTableProps {
  orders: Order[];
  onSelectOrder: (id: string) => void;
}

export function OrdersTable({ orders, onSelectOrder }: OrdersTableProps) {
  return (
    <div className='overflow-x-auto rounded-lg border'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='bg-muted/50 text-muted-foreground border-b text-left text-xs'>
            <th className='px-4 py-2.5 font-medium'>Order</th>
            <th className='px-4 py-2.5 font-medium'>Customer</th>
            <th className='px-4 py-2.5 font-medium'>Status</th>
            <th className='px-4 py-2.5 font-medium'>Date</th>
            <th className='px-4 py-2.5 text-right font-medium'>Amount</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} onSelect={onSelectOrder} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

const OrderRow = memo(function OrderRow({
  order,
  onSelect
}: {
  order: Order;
  onSelect: (id: string) => void;
}) {
  const handleClick = useCallback(
    () => onSelect(order.id),
    [onSelect, order.id]
  );

  return (
    <tr
      role='button'
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className='hover:bg-accent/50 cursor-pointer border-b last:border-0'
    >
      <td className='px-4 py-3 font-medium'>{order.id}</td>
      <td className='px-4 py-3'>{order.customerName}</td>
      <td className='px-4 py-3'>
        <OrderStatusBadge status={order.status} />
      </td>
      <td className='text-muted-foreground px-4 py-3'>
        {formatDate(order.createdAt, { month: 'short', day: 'numeric' })}
      </td>
      <td className='px-4 py-3 text-right font-medium'>
        {formatCurrency(order.amount)}
      </td>
    </tr>
  );
});
