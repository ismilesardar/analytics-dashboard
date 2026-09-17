import { NextRequest } from 'next/server';

import {
  computeChartSeries,
  defaultGranularity,
  type Period
} from '@/lib/server/analytics';
import { ok, fail } from '@/lib/server/response';
import type { Granularity } from '@/lib/server/date-buckets';

const VALID_PERIODS: Period[] = ['7d', '30d', '90d', '6m'];
const VALID_GRANULARITIES: Granularity[] = ['day', 'week'];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const periodParam = searchParams.get('period') ?? '30d';
  const granularityParam = searchParams.get('granularity');

  if (!VALID_PERIODS.includes(periodParam as Period)) {
    return fail(
      'INVALID_PERIOD',
      'period must be one of 7d, 30d, 90d, 6m.',
      400
    );
  }
  const period = periodParam as Period;

  if (
    granularityParam &&
    !VALID_GRANULARITIES.includes(granularityParam as Granularity)
  ) {
    return fail('INVALID_GRANULARITY', 'granularity must be day or week.', 400);
  }
  const granularity =
    (granularityParam as Granularity | null) ?? defaultGranularity(period);

  return ok(computeChartSeries(period, granularity));
}
