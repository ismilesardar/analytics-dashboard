import { customers } from '@/lib/server/dataset';
import { ok } from '@/lib/server/response';

export async function GET() {
  return ok(customers);
}
