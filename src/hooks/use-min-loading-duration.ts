'use client';

import { useEffect, useState } from 'react';

/**
 * Stretches a `true` loading flag to last at least `minMs`, but passes
 * `false` straight through. Used so a fast local fetch still shows a
 * perceptible skeleton on a fresh page load, without adding latency to
 * background refetches (which never flip the underlying flag to `true`).
 */
export function useMinLoadingDuration(isLoading: boolean, minMs = 2500) {
  const [show, setShow] = useState(isLoading);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => {
      setShow(true);
      setStartedAt((prev) => prev ?? Date.now());
    }, 0);
    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    if (isLoading || !show) return;
    const elapsed = startedAt === null ? minMs : Date.now() - startedAt;
    const remaining = Math.max(0, minMs - elapsed);
    const timer = setTimeout(() => {
      setShow(false);
      setStartedAt(null);
    }, remaining);
    return () => clearTimeout(timer);
  }, [isLoading, show, startedAt, minMs]);

  return show;
}
