import { NextRequest } from 'next/server';

import { orders, type Order, type OrderStatus } from '@/lib/server/dataset';
import { paginate } from '@/lib/server/pagination';
import { okPaginated, fail } from '@/lib/server/response';

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
