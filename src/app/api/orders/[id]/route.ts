import { z } from 'zod';

import {
  activities,
  orders,
  type OrderStatus,
  type SystemActivity
} from '@/lib/server/dataset';
import { ok, fail } from '@/lib/server/response';

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
];

const updateOrderBodySchema = z.object({
  status: z.enum(ORDER_STATUSES as [OrderStatus, ...OrderStatus[]])
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return fail('NOT_FOUND', 'Order not found.', 404);
  }

  return ok(order);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = orders.findIndex((o) => o.id === id);

  if (index === -1) {
    return fail('NOT_FOUND', 'Order not found.', 404);
  }

  if (!orders[index].isUserCreated) {
    return fail('FORBIDDEN', 'This order cannot be deleted.', 403);
  }

  orders.splice(index, 1);

  const newActivity: SystemActivity = {
    id: `act_${String(activities.length + 1).padStart(5, '0')}`,
    type: 'order_cancelled',
    message: `Order #${id} was cancelled`,
    relatedOrderId: id,
    createdAt: new Date().toISOString()
  };
  activities.unshift(newActivity);

  return ok({ id });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return fail('NOT_FOUND', 'Order not found.', 404);
  }

  if (!order.isUserCreated) {
    return fail('FORBIDDEN', 'This order cannot be modified.', 403);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateOrderBodySchema.safeParse(body);

  if (!parsed.success) {
    return fail('INVALID_REQUEST', 'A valid status is required.', 400);
  }

  const { status } = parsed.data;
  order.status = status;
  order.updatedAt = new Date().toISOString();

  const newActivity: SystemActivity = {
    id: `act_${String(activities.length + 1).padStart(5, '0')}`,
    type: 'order_status_changed',
    message: `Order #${id} status changed to ${status}`,
    relatedOrderId: id,
    createdAt: order.updatedAt
  };
  activities.unshift(newActivity);

  return ok(order);
}
