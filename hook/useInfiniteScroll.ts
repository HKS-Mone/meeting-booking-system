'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Progressively reveal an already-loaded list ("infinite scroll").
 *
 * Renders `batchSize` items, then reveals another batch each time the observed
 * sentinel element scrolls into view — until `totalCount` items are shown.
 * Pass a `resetKey` (e.g. the active search/filter) to jump back to the first
 * batch whenever the underlying list changes.
 *
 * Time complexity: O(1) per scroll event; observer is recreated per batch so a
 * sentinel that stays on screen keeps loading until the list is exhausted.
 */
export function useInfiniteScroll(
  totalCount: number,
  batchSize = 20,
  resetKey?: unknown,
) {
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  const sentinelRef = useRef<HTMLDivElement | null>(null);


  if (prevResetKey !== resetKey) {
    setPrevResetKey(resetKey);
    setVisibleCount(batchSize);
  }

  const hasMore = visibleCount < totalCount;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => Math.min(prev + batchSize, totalCount));
      }
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
    // `visibleCount` is a dependency so the observer is rebuilt after each batch:
    // if the sentinel is still visible, a fresh observer fires again immediately.
  }, [hasMore, visibleCount, totalCount, batchSize]);

  return { visibleCount, hasMore, sentinelRef };
}
