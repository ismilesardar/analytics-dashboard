export type Granularity = 'day' | 'week';

export interface BucketPoint {
  date: string;
  value: number;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const dayOfWeek = d.getUTCDay(); // 0 = Sunday
  const diffToMonday = (dayOfWeek + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diffToMonday);
  return d;
}

function bucketKey(date: Date, granularity: Granularity): string {
  const bucketDate = granularity === 'week' ? startOfWeek(date) : date;
  return bucketDate.toISOString().slice(0, 10);
}

/**
 * Buckets `items` into continuous day/week windows between `from` and `to`
 * (inclusive), so a chart series has no gaps for periods with zero activity.
 */
export function bucketSeries<T>(
  items: T[],
  from: Date,
  to: Date,
  granularity: Granularity,
  getDate: (item: T) => Date,
  aggregate: (bucketItems: T[]) => number
): BucketPoint[] {
  const grouped = new Map<string, T[]>();
  for (const item of items) {
    const date = getDate(item);
    if (date < from || date > to) continue;
    const key = bucketKey(date, granularity);
    const bucket = grouped.get(key);
    if (bucket) {
      bucket.push(item);
    } else {
      grouped.set(key, [item]);
    }
  }

  const step = granularity === 'day' ? 1 : 7;
  const cursor = new Date(`${bucketKey(from, granularity)}T00:00:00.000Z`);
  const end = new Date(`${bucketKey(to, granularity)}T00:00:00.000Z`);
  const points: BucketPoint[] = [];

  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    points.push({ date: key, value: aggregate(grouped.get(key) ?? []) });
    cursor.setUTCDate(cursor.getUTCDate() + step);
  }

  return points;
}
