import { NextRequest } from 'next/server';

import { activities } from '@/lib/server/dataset';
import { ok, fail } from '@/lib/server/response';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export async function GET(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get('limit');
  const limit = limitParam ? Number(limitParam) : DEFAULT_LIMIT;

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    return fail(
      'INVALID_LIMIT',
      `limit must be between 1 and ${MAX_LIMIT}.`,
      400
    );
  }

  return ok(activities.slice(0, limit));
}
