'use server';

import { BookingRepository } from '@/repository/booking.repository';
import { getAuthenticatedUserId, mapBooking } from '@/services/booking.reader';
import type { Booking } from '@/lib/types';

type BookingUpdateData = {
  departmentId?: number;
  description?: string | null;
  date?: Date;
  startTime?: Date;
  endTime?: Date;
};

type ParsedTime = {
  hours: number;
  minutes: number;
};

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_ONLY_PATTERN = /^(\d{2}):(\d{2})$/;

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

function parseDateOnly(value: string): Date | null {
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function parseTimeOnly(value: string): ParsedTime | null {
  const match = TIME_ONLY_PATTERN.exec(value);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;

  return { hours, minutes };
}

function timeOnlyToDbDate(time: ParsedTime): Date {
  return new Date(Date.UTC(1970, 0, 1, time.hours, time.minutes, 0, 0));
}

function dbDateToDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function timeToMinutes(time: ParsedTime): number {
  return time.hours * 60 + time.minutes;
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

// ─── Server Actions ───────────────────────────────────────────────────────────

/** Return all active bookings. */
export async function getBookingsAction(): Promise<BookingsResult> {
  try {
    const rows = await BookingRepository.findAll();
    return { success: true, bookings: rows.map((r) => mapBooking(r)) };
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
    return { success: true, bookings: rows.map((r) => mapBooking(r)) };
  } catch (err: unknown) {
    return { success: false, error: errorMessage(err, 'Failed to load bookings.') };
  }
}

/** Return bookings for a given calendar date (YYYY-MM-DD). */
export async function getBookingsByDateAction(dateStr: string): Promise<BookingsResult> {
  try {
    const date = parseDateOnly(dateStr);
    if (!date) return { success: false, error: 'Invalid date.' };

    const rows = await BookingRepository.findByDate(date);
    return { success: true, bookings: rows.map((r) => mapBooking(r)) };
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

    const date = parseDateOnly(input.date);
    if (!date) return { success: false, error: 'Invalid date.' };

    const startTimeParts = parseTimeOnly(input.startTime);
    const endTimeParts = parseTimeOnly(input.endTime);
    if (!startTimeParts || !endTimeParts) {
      return { success: false, error: 'Invalid time.' };
    }

    if (timeToMinutes(startTimeParts) >= timeToMinutes(endTimeParts)) {
      return { success: false, error: 'End time must be after start time.' };
    }

    const startTime = timeOnlyToDbDate(startTimeParts);
    const endTime = timeOnlyToDbDate(endTimeParts);
    const targetUserId = input.userId ? Number(input.userId) : sessionUserId;
    const overlappingBooking = await BookingRepository.findOverlapping(date, startTime, endTime);

    if (overlappingBooking) {
      return {
        success: false,
        error: `This date and time slot has already been booked`,
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

    return { success: true, booking: mapBooking(row) };
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
    const dateStr = input.date ?? dbDateToDateOnly(existing.date);
    const nextDate = parseDateOnly(dateStr);

    if (!nextDate) return { success: false, error: 'Invalid date.' };

    const nextStartTimeParts = input.startTime ? parseTimeOnly(input.startTime) : null;
    const nextEndTimeParts = input.endTime ? parseTimeOnly(input.endTime) : null;
    if ((input.startTime && !nextStartTimeParts) || (input.endTime && !nextEndTimeParts)) {
      return { success: false, error: 'Invalid time.' };
    }

    const nextStartTime = nextStartTimeParts ? timeOnlyToDbDate(nextStartTimeParts) : existing.startTime;
    const nextEndTime = nextEndTimeParts ? timeOnlyToDbDate(nextEndTimeParts) : existing.endTime;

    if (input.date) data.date = nextDate;
    if (input.startTime) data.startTime = nextStartTime;
    if (input.endTime) data.endTime = nextEndTime;

    if (
      nextStartTimeParts &&
      nextEndTimeParts &&
      timeToMinutes(nextStartTimeParts) >= timeToMinutes(nextEndTimeParts)
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
    return { success: true, booking: mapBooking(row) };
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
