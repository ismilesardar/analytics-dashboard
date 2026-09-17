import { NextResponse } from 'next/server';
import type { PaginationMeta } from './pagination';

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function okPaginated<T>(data: T[], meta: PaginationMeta, status = 200) {
  return NextResponse.json({ data, meta }, { status });
}

export function fail(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}
