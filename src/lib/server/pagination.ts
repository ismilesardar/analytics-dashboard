export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number
): { data: T[]; meta: PaginationMeta } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;

  return {
    data: items.slice(start, start + pageSize),
    meta: { page, pageSize, total, totalPages }
  };
}
