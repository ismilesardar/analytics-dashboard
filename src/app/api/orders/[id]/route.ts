import { orders } from '@/lib/server/dataset';
import { ok, fail } from '@/lib/server/response';

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
