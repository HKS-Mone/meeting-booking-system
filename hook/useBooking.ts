'use client';

import { useCallback, useState } from 'react';
import type { Booking } from '@/lib/types';
import {
  getBookingsAction,
  getMyBookingsAction,
  getBookingsByDateAction,
  createBookingAction,
  updateBookingAction,
  deleteBookingAction,
  type CreateBookingInput,
  type UpdateBookingInput,
} from '@/services/booking.service';

export function useBooking() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Wrap any async action with loading + error state management. */
  const run = useCallback(async <T,>(action: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    setError(null);
    try {
      return await action();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : 'An unexpected error occurred.';
      setError(message);
      throw caughtError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Load all bookings 

  const loadBookings = useCallback(async () => {
    return run(async () => {
      const result = await getBookingsAction();
      if (!result.success) throw new Error(result.error);
      setBookings(result.bookings ?? []);
      return result.bookings ?? [];
    });
  }, [run]);

  // ── Load the current user's own bookings 

  const loadMyBookings = useCallback(async () => {
    return run(async () => {
      const result = await getMyBookingsAction();
      if (!result.success) throw new Error(result.error);
      setBookings(result.bookings ?? []);
      return result.bookings ?? [];
    });
  }, [run]);

  // ── Load bookings for a specific date 

  const loadBookingsByDate = useCallback(
    async (dateStr: string) => {
      return run(async () => {
        const result = await getBookingsByDateAction(dateStr);
        if (!result.success) throw new Error(result.error);
        return result.bookings ?? [];
      });
    },
    [run],
  );

  // ── Create 

  const createBooking = useCallback(
    async (input: CreateBookingInput) => {
      return run(async () => {
        const result = await createBookingAction(input);
        if (!result.success || !result.booking) throw new Error(result.error);
        // Prepend to local state so the UI updates immediately
        setBookings((prev) => [result.booking!, ...prev]);
        return result.booking;
      });
    },
    [run],
  );

  // ── Update ────────────────────────────────────────────────────────────────

  const updateBooking = useCallback(
    async (id: string, input: UpdateBookingInput) => {
      return run(async () => {
        const result = await updateBookingAction(id, input);
        if (!result.success || !result.booking) throw new Error(result.error);
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? result.booking! : b)),
        );
        return result.booking;
      });
    },
    [run],
  );

  // ── Delete ────────────────────────────────────────────────────────────────

  const deleteBooking = useCallback(
    async (id: string) => {
      return run(async () => {
        const result = await deleteBookingAction(id);
        if (!result.success) throw new Error(result.error);
        setBookings((prev) => prev.filter((b) => b.id !== id));
        return true;
      });
    },
    [run],
  );

  return {
    bookings,
    isLoading,
    error,
    loadBookings,
    loadMyBookings,
    loadBookingsByDate,
    createBooking,
    updateBooking,
    deleteBooking,
  };
}
