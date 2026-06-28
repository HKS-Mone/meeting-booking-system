'use client';

import { useEffect, useRef } from 'react';

const POLL_INTERVAL_MS = 60_000;

export default function DeploymentWatcher() {
  const currentBuildId = process.env.NEXT_PUBLIC_BUILD_ID;
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    timerRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/build-id', { cache: 'no-store' });
        if (!res.ok) return;
        const { buildId } = await res.json() as { buildId?: string };
        if (buildId && buildId !== currentBuildId) {
          window.location.reload();
        }
      } catch {
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timerRef.current);
  }, [currentBuildId]);

  return null;
}
