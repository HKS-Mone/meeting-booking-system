'use client';

import { useCallback, useState } from 'react';
import type { Booking, User } from '@/lib/types';
import {
  adminService,
  type AdminDashboardStats,
} from '@/services/admin.service';

export function useAdmin() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async <T,>(action: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);

    try {
      return await action();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : 'Unable to load admin data.';
      setError(message);
      throw caughtError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    const result = await run(() => adminService.getAdminDashboardStats());
    setStats(result);
    return result;
  }, [run]);

  const loadRecentBookings = useCallback(
    async (limit?: number) => {
      const result = await run(() => adminService.getRecentBookings(limit));
      setRecentBookings(result);
      return result;
    },
    [run]
  );

  const loadAdmins = useCallback(async () => {
    const result = await run(() => adminService.getAdmins());
    setAdmins(result);
    return result;
  }, [run]);

  return {
    stats,
    recentBookings,
    admins,
    isLoading,
    error,
    loadStats,
    loadRecentBookings,
    loadAdmins,
  };
}
