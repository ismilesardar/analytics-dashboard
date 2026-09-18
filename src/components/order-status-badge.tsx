import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types/order';

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-warning/15 text-warning border-warning/30',
  processing: 'bg-info/15 text-info border-info/30',
  shipped: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
  delivered: 'bg-success/15 text-success border-success/30',
  cancelled: 'bg-destructive/15 text-destructive border-destructive/30'
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant='outline' className={cn(STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
