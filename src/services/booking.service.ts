'use server';

import { cookies } from 'next/headers';
import { authCookie, serverAuthService } from '@/services/auth-server.service';
import { BookingRepository } from '@/repository/booking.repository';
import type { Booking } from '@/lib/types';

type BookingUpdateData = {
  departmentId?: number;
  description?: string | null;
  date?: Date;
  startTime?: Date;
  endTime?: Date;
};

// ─── Input types ─────────────────────────────────────────────────────────────

export interface CreateBookingInput {
  departmentId: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  userId?: string;
}

export interface UpdateBookingInput {
  departmentId?: string;
  description?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
}

export interface BookingResult {
  success: boolean;
  booking?: Booking;
  error?: string;
}

export interface BookingsResult {
  success: boolean;
  bookings?: Booking[];
  error?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Verify the caller's session cookie and return their userId. */
async function getAuthenticatedUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookie.name)?.value;
  const result = await serverAuthService.authenticateToken(token);
  if (!result.success || !result.user) return null;
  return Number(result.user.id);
}

/**
 * Convert a date string + time string into a single Date object.
 * date: "YYYY-MM-DD", time: "HH:MM"
 */
function buildDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`);
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function dateTimeToMinutes(time: Date): number {
  return time.getUTCHours() * 60 + time.getUTCMinutes();
}

function bookingCode(id: number): string {
  return `BK-${String(id).padStart(4, '0')}`;
}

function normalizeDescription(description?: string): string | null {
  const value = description?.trim();
  return value ? value : null;
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

function combineDateAndTime(date: Date, time: Date): Date {
  const datePart = date.toISOString().slice(0, 10);
  const timePart = time.toISOString().slice(11, 19);
  return new Date(`${datePart}T${timePart}.000Z`);
}

/** Map a Prisma Booking row (with relations) to the app's Booking type. */
function toSafeBooking(row: Awaited<ReturnType<typeof BookingRepository.findById>>): Booking {
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
    startTime: combineDateAndTime(row.date, row.startTime).toISOString(),
    endTime: combineDateAndTime(row.date, row.endTime).toISOString(),
    date: row.date.toISOString().slice(0, 10),
    createdAt: row.createdAt.toISOString(),
  };
}

// ─── Server Actions ───────────────────────────────────────────────────────────

/** Return all active bookings. */
export async function getBookingsAction(): Promise<BookingsResult> {
  try {
    const rows = await BookingRepository.findAll();
    return { success: true, bookings: rows.map((r) => toSafeBooking(r)) };
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err, 'Failed to load bookings.') };
  }
}

/** Return bookings for the currently logged-in user. */
export async function getMyBookingsAction(): Promise<BookingsResult> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return { success: false, error: 'Unauthorized.' };

    const rows = await BookingRepository.findByUserId(userId);
    return { success: true, bookings: rows.map((r) => toSafeBooking(r)) };
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err, 'Failed to load bookings.') };
  }
}

/** Return bookings for a given calendar date (YYYY-MM-DD). */
export async function getBookingsByDateAction(dateStr: string): Promise<BookingsResult> {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return { success: false, error: 'Invalid date.' };

    const rows = await BookingRepository.findByDate(date);
    return { success: true, bookings: rows.map((r) => toSafeBooking(r)) };
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err, 'Failed to load bookings.') };
  }
}

/** Create a new booking */
export async function createBookingAction(input: CreateBookingInput): Promise<BookingResult> {
  try {
    const sessionUserId = await getAuthenticatedUserId();
    if (!sessionUserId) return { success: false, error: 'Unauthorized.' };

    if (!input.date) return { success: false, error: 'Date is required.' };
    if (!input.startTime || !input.endTime) return { success: false, error: 'Start and end time are required.' };

    const date = new Date(input.date);
    if (isNaN(date.getTime())) return { success: false, error: 'Invalid date.' };
    if (timeToMinutes(input.startTime) >= timeToMinutes(input.endTime)) {
      return { success: false, error: 'End time must be after start time.' };
    }

    const startTime = buildDateTime(input.date, input.startTime);
    const endTime = buildDateTime(input.date, input.endTime);
    const targetUserId = input.userId ? Number(input.userId) : sessionUserId;
    const overlappingBooking = await BookingRepository.findOverlapping(date, startTime, endTime);

    if (overlappingBooking) {
      return {
        success: false,
        error: `Selected date and time overlaps with booking ${bookingCode(overlappingBooking.id)}.`,
      };
    }

    const row = await BookingRepository.create({
      userId: targetUserId,
      departmentId: Number(input.departmentId),
      description: normalizeDescription(input.description),
      date,
      startTime,
      endTime,
    });

    return { success: true, booking: toSafeBooking(row) };
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err, 'Failed to create booking.') };
  }
}

/** Update an existing booking (admin only, or the owning user). */
export async function updateBookingAction(
  id: string,
  input: UpdateBookingInput,
): Promise<BookingResult> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return { success: false, error: 'Unauthorized.' };

    const existing = await BookingRepository.findById(Number(id));
    if (!existing) return { success: false, error: 'Booking not found.' };

    const data: BookingUpdateData = {};
    if (input.departmentId !== undefined) data.departmentId = Number(input.departmentId);
    if (input.description !== undefined) data.description = normalizeDescription(input.description);

    // Resolve date and time changes together so we can validate the pair
    const dateStr = input.date ?? existing.date.toISOString().slice(0, 10);
    const nextStartTime = input.startTime ? buildDateTime(dateStr, input.startTime) : existing.startTime;
    const nextEndTime = input.endTime ? buildDateTime(dateStr, input.endTime) : existing.endTime;
    const nextDate = new Date(dateStr);

    if (isNaN(nextDate.getTime())) return { success: false, error: 'Invalid date.' };

    if (input.date) data.date = nextDate;
    if (input.startTime) data.startTime = nextStartTime;
    if (input.endTime) data.endTime = nextEndTime;

    if (
      input.startTime &&
      input.endTime &&
      timeToMinutes(input.startTime) >= timeToMinutes(input.endTime)
    ) {
      return { success: false, error: 'End time must be after start time.' };
    }

    if (dateTimeToMinutes(nextStartTime) >= dateTimeToMinutes(nextEndTime)) {
      return { success: false, error: 'End time must be after start time.' };
    }

    const overlappingBooking = await BookingRepository.findOverlapping(
      nextDate,
      nextStartTime,
      nextEndTime,
      Number(id),
    );
    if (overlappingBooking) {
      return {
        success: false,
        error: `Selected date and time overlaps with booking ${bookingCode(overlappingBooking.id)}.`,
      };
    }

    const row = await BookingRepository.update(Number(id), data);
    return { success: true, booking: toSafeBooking(row) };
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err, 'Failed to update booking.') };
  }
}

/** Soft-delete a booking. */
export async function deleteBookingAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return { success: false, error: 'Unauthorized.' };

    const existing = await BookingRepository.findById(Number(id));
    if (!existing) return { success: false, error: 'Booking not found.' };

    await BookingRepository.delete(Number(id));
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err, 'Failed to delete booking.') };
  }
}
