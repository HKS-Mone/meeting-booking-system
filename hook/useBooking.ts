// 'use client';

// import { useCallback, useState } from 'react';
// import type { Booking } from '@/lib/types';
// import {
//   bookingService,
//   type CreateBookingInput,
//   type UpdateBookingInput,
// } from '@/services/booking.service';

// export function useBooking() {
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const run = useCallback(async <T,>(action: () => Promise<T>) => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       return await action();
//     } catch (caughtError) {
//       const message =
//         caughtError instanceof Error ? caughtError.message : 'Unable to load bookings.';
//       setError(message);
//       throw caughtError;
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   const loadBookings = useCallback(async () => {
//     const result = await run(() => bookingService.getBookings());
//     setBookings(result);
//     return result;
//   }, [run]);

//   const getBookingById = useCallback(
//     async (id: string) => {
//       const result = await run(() => bookingService.getBookingById(id));
//       setSelectedBooking(result);
//       return result;
//     },
//     [run]
//   );

//   const loadBookingsByUser = useCallback(
//     async (userId: string) => {
//       const result = await run(() => bookingService.getBookingsByUser(userId));
//       setBookings(result);
//       return result;
//     },
//     [run]
//   );

//   const loadBookingsForMonth = useCallback(
//     async (year: number, month: number) => {
//       const result = await run(() => bookingService.getBookingsForMonth(year, month));
//       setBookings(result);
//       return result;
//     },
//     [run]
//   );

//   const loadTodaysBookings = useCallback(async () => {
//     const result = await run(() => bookingService.getTodaysBookings());
//     setBookings(result);
//     return result;
//   }, [run]);

//   const loadUpcomingBookings = useCallback(
//     async (limit?: number) => {
//       const result = await run(() => bookingService.getUpcomingBookings(limit));
//       setBookings(result);
//       return result;
//     },
//     [run]
//   );

//   const createBooking = useCallback(
//     async (input: CreateBookingInput) => {
//       const result = await run(() => bookingService.createBooking(input));
//       setBookings((current) => [result, ...current]);
//       return result;
//     },
//     [run]
//   );

//   const updateBooking = useCallback(
//     async (id: string, input: UpdateBookingInput) => {
//       const result = await run(() => bookingService.updateBooking(id, input));

//       if (result) {
//         setBookings((current) =>
//           current.map((booking) => (booking.id === id ? result : booking))
//         );
//         setSelectedBooking((current) => (current?.id === id ? result : current));
//       }

//       return result;
//     },
//     [run]
//   );

//   const deleteBooking = useCallback(
//     async (id: string) => {
//       const result = await run(() => bookingService.deleteBooking(id));

//       if (result) {
//         setBookings((current) => current.filter((booking) => booking.id !== id));
//         setSelectedBooking((current) => (current?.id === id ? null : current));
//       }

//       return result;
//     },
//     [run]
//   );

//   return {
//     bookings,
//     selectedBooking,
//     isLoading,
//     error,
//     loadBookings,
//     getBookingById,
//     loadBookingsByUser,
//     loadBookingsForMonth,
//     loadTodaysBookings,
//     loadUpcomingBookings,
//     createBooking,
//     updateBooking,
//     deleteBooking,
//   };
// }
