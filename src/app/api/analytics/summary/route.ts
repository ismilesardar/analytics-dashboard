import { NextRequest } from 'next/server';

import { computeSummary } from '@/lib/server/analytics';
import { ok } from '@/lib/server/response';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');

  const from = fromParam ? new Date(fromParam) : null;
  const to = toParam ? new Date(toParam) : new Date();

  return ok(computeSummary(from, to));
}
