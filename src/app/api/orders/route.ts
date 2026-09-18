import { NextRequest } from 'next/server';
import { z } from 'zod';

import {
  activities,
  customers,
  orders,
  type Order,
  type OrderStatus,
  type SystemActivity
} from '@/lib/server/dataset';
import { paginate } from '@/lib/server/pagination';
import { ok, okPaginated, fail } from '@/lib/server/response';

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
];

type SortKey =
  | 'createdAt:desc'
  | 'createdAt:asc'
  | 'amount:desc'
  | 'amount:asc';
const SORT_KEYS: SortKey[] = [
  'createdAt:desc',
  'createdAt:asc',
  'amount:desc',
  'amount:asc'
];

function sortOrders(items: Order[], sort: SortKey): Order[] {
  const [field, direction] = sort.split(':') as [
    'createdAt' | 'amount',
    'asc' | 'desc'
  ];
  const sorted = [...items].sort((a, b) => {
    const aValue =
      field === 'amount' ? a.amount : new Date(a.createdAt).getTime();
    const bValue =
      field === 'amount' ? b.amount : new Date(b.createdAt).getTime();
    return aValue - bValue;
  });
  return direction === 'desc' ? sorted.reverse() : sorted;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const q = params.get('q')?.trim().toLowerCase() ?? '';
  const statusParam = params.get('status');
  const fromParam = params.get('from');
  const toParam = params.get('to');
  const sortParam = (params.get('sort') as SortKey | null) ?? 'createdAt:desc';
  const page = Number(params.get('page') ?? '1');
  const pageSize = Number(params.get('pageSize') ?? '10');

  if (statusParam && !ORDER_STATUSES.includes(statusParam as OrderStatus)) {
    return fail('INVALID_STATUS', 'Unknown order status filter.', 400);
  }
  if (!SORT_KEYS.includes(sortParam)) {
    return fail('INVALID_SORT', 'Unknown sort key.', 400);
  }
  if (!Number.isInteger(page) || page < 1) {
    return fail('INVALID_PAGE', 'page must be a positive integer.', 400);
  }
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    return fail(
      'INVALID_PAGE_SIZE',
      'pageSize must be between 1 and 100.',
      400
    );
  }

  let filtered = orders;

  if (q) {
    filtered = filtered.filter(
      (order) =>
        order.id.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q)
    );
  }
  if (statusParam) {
    filtered = filtered.filter((order) => order.status === statusParam);
  }
  if (fromParam) {
    const from = new Date(fromParam);
    filtered = filtered.filter((order) => new Date(order.createdAt) >= from);
  }
  if (toParam) {
    const to = new Date(toParam);
    filtered = filtered.filter((order) => new Date(order.createdAt) <= to);
  }

  const sorted = sortOrders(filtered, sortParam);
  const { data, meta } = paginate(sorted, page, pageSize);

  return okPaginated(data, meta);
}

const createOrderBodySchema = z.object({
  customerId: z.string().min(1),
  status: z.enum(ORDER_STATUSES as [OrderStatus, ...OrderStatus[]]),
  items: z
    .array(
      z.object({
        productName: z.string().trim().min(1),
        quantity: z.coerce.number().int().min(1),
        unitPrice: z.coerce.number().min(0)
      })
    )
    .min(1)
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createOrderBodySchema.safeParse(body);

  if (!parsed.success) {
    return fail(
      'INVALID_REQUEST',
      'A customer and at least one item are required.',
      400
    );
  }

  const { customerId, status, items } = parsed.data;
  const customer = customers.find((c) => c.id === customerId);

  if (!customer) {
    return fail('NOT_FOUND', 'Customer not found.', 404);
  }

  const amount = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const now = new Date().toISOString();
  const newOrder: Order = {
    id: `ord_${String(orders.length + 1).padStart(5, '0')}`,
    customerId: customer.id,
    customerName: customer.name,
    status,
    amount,
    currency: 'USD',
    createdAt: now,
    updatedAt: now,
    items,
    isUserCreated: true
  };

  orders.unshift(newOrder);

  const newActivity: SystemActivity = {
    id: `act_${String(activities.length + 1).padStart(5, '0')}`,
    type: 'order_created',
    message: `Order #${newOrder.id} was placed`,
    relatedOrderId: newOrder.id,
    relatedCustomerId: newOrder.customerId,
    createdAt: now
  };
  activities.unshift(newActivity);

  return ok(newOrder, 201);
}
