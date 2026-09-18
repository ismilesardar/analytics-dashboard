'use client';

import { memo, useCallback } from 'react';
import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  OrderStatusBadge,
  STATUS_LABELS
} from '@/components/order-status-badge';
import { formatCurrency, formatDate } from '@/lib/format';
import { ORDER_STATUS_OPTIONS } from './order-schema';
import type { Order, OrderStatus } from '@/types/order';

interface OrdersTableProps {
  orders: Order[];
  onSelectOrder: (id: string) => void;
  onDeleteOrder: (id: string) => void;
  onChangeStatus: (id: string, status: OrderStatus) => void;
}

export function OrdersTable({
  orders,
  onSelectOrder,
  onDeleteOrder,
  onChangeStatus
}: OrdersTableProps) {
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
            <th className='px-4 py-2.5 font-medium'>
              <span className='sr-only'>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              onSelect={onSelectOrder}
              onDelete={onDeleteOrder}
              onChangeStatus={onChangeStatus}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

const OrderRow = memo(function OrderRow({
  order,
  onSelect,
  onDelete,
  onChangeStatus
}: {
  order: Order;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onChangeStatus: (id: string, status: OrderStatus) => void;
}) {
  const handleClick = useCallback(
    () => onSelect(order.id),
    [onSelect, order.id]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(order.id);
    },
    [onDelete, order.id]
  );

  const handleStatusChange = useCallback(
    (status: string) => onChangeStatus(order.id, status as OrderStatus),
    [onChangeStatus, order.id]
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
        {order.isUserCreated ? (
          <div onClick={(e) => e.stopPropagation()}>
            <Select value={order.status} onValueChange={handleStatusChange}>
              <SelectTrigger size='sm' className='h-7 w-32 text-xs'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <OrderStatusBadge status={order.status} />
        )}
      </td>
      <td className='text-muted-foreground px-4 py-3'>
        {formatDate(order.createdAt, { month: 'short', day: 'numeric' })}
      </td>
      <td className='px-4 py-3 text-right font-medium'>
        {formatCurrency(order.amount)}
      </td>
      <td className='px-4 py-3 text-right'>
        {order.isUserCreated ? (
          <Button
            variant='ghost'
            size='icon'
            className='text-muted-foreground hover:text-destructive size-8'
            onClick={handleDelete}
            aria-label={`Delete order ${order.id}`}
          >
            <Trash2 className='size-4' />
          </Button>
        ) : null}
      </td>
    </tr>
  );
});
