import 'server-only';

import { cookies } from 'next/headers';
import { authCookie, serverAuthService } from '@/services/auth-server.service';
import { BookingRepository } from '@/repository/booking.repository';
import type { Booking, User } from '@/lib/types';

/**
 * Server-only data readers for React Server Components.
 *
 * Server Actions ('use server') are POST endpoints intended for client-invoked
 * mutations; calling them during RSC render for data fetching is unreliable in
 * production. Server Components must read data through these plain functions so
 * the request-scoped cookie is always available.
 */

type BookingRow = Awaited<ReturnType<typeof BookingRepository.findById>>;

function dbDateToDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function dbTimeToTimeOnly(time: Date): string {
  return [
    String(time.getUTCHours()).padStart(2, '0'),
    String(time.getUTCMinutes()).padStart(2, '0'),
    String(time.getUTCSeconds()).padStart(2, '0'),
  ].join(':');
}

function combineDateAndTime(date: Date, time: Date): string {
  return `${dbDateToDateOnly(date)}T${dbTimeToTimeOnly(time)}`;
}

/** Map a Prisma Booking row (with relations) to the app's Booking type. */
export function mapBooking(row: BookingRow): Booking {
  if (!row) throw new Error('Booking not found.');
  return {
    id: String(row.id),
    bookingCode: `BK-${String(row.id).padStart(4, '0')}`,
    userId: String(row.userId),
    user: row.user
      ? {
          id: String(row.user.id),
          name: row.user.name,
          email: row.user.email,
          role: row.user.role,
          departmentId: row.user.departmentId ? String(row.user.departmentId) : undefined,
          department: row.user.department
            ? { id: String(row.user.department.id), name: row.user.department.name }
            : undefined,
          createdAt: row.user.createdAt.toISOString(),
        }
      : undefined,
    roomId: '',          // no Room model in schema yet
    departmentId: String(row.departmentId),
    department: row.department
      ? { id: String(row.department.id), name: row.department.name }
      : undefined,
    purpose: row.description ?? '',
    participants: 1,     // no participants column in schema yet
    startTime: combineDateAndTime(row.date, row.startTime),
    endTime: combineDateAndTime(row.date, row.endTime),
    date: dbDateToDateOnly(row.date),
    createdAt: row.createdAt.toISOString(),
  };
}

/** Verify the caller's session cookie and return their userId. */
export async function getAuthenticatedUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookie.name)?.value;
  const result = await serverAuthService.authenticateToken(token);
  if (!result.success || !result.user) return null;
  return Number(result.user.id);
}

/** Return the currently authenticated user, or null when unauthenticated. */
export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookie.name)?.value;
  const result = await serverAuthService.authenticateToken(token);
  return result.success ? result.user ?? null : null;
}

/** Return bookings for the currently authenticated user (empty when unauthenticated). */
export async function getMyBookings(): Promise<Booking[]> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return [];

  const rows = await BookingRepository.findByUserId(userId);
  return rows.map((row) => mapBooking(row));
}

/** Return all bookings across every user (for shared-room views like "Ongoing Now"). */
export async function getAllBookings(): Promise<Booking[]> {
  const rows = await BookingRepository.findAll();
  return rows.map((row) => mapBooking(row));
}
