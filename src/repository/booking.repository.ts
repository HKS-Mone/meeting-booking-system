import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const bookingInclude = {
  user: { include: { department: true } },
  department: true,
} satisfies Prisma.BookingInclude;

function dateRangeForDay(date: Date) {
  // Use UTC methods so the range correctly brackets the UTC calendar day
  // that was stored (dates are persisted as UTC via Prisma / MySQL @db.Date).
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
}

export class BookingRepository {

  static async findAll() {
    return prisma.booking.findMany({
      where: { isActive: true },
      include: bookingInclude,
      orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
    });
  }

  static async findById(id: number) {
    return prisma.booking.findFirst({
      where: { id, isActive: true },
      include: bookingInclude,
    });
  }

  static async findByUserId(userId: number) {
    return prisma.booking.findMany({
      where: { userId, isActive: true },
      include: bookingInclude,
      orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
    });
  }

  static async findByDate(date: Date) {
    // Match bookings whose `date` field falls on the same calendar day
    const { start, end } = dateRangeForDay(date);

    return prisma.booking.findMany({
      where: {
        isActive: true,
        date: { gte: start, lte: end },
      },
      include: bookingInclude,
      orderBy: { startTime: 'asc' },
    });
  }

  // ── Write ─────────────────────────────────────────────────────────────────

  static async findOverlapping(
    date: Date,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: number,
  ) {
    const { start, end } = dateRangeForDay(date);

    return prisma.booking.findFirst({
      where: {
        isActive: true,
        id: excludeBookingId === undefined ? undefined : { not: excludeBookingId },
        date: { gte: start, lte: end },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
      include: bookingInclude,
      orderBy: { startTime: 'asc' },
    });
  }

  static async create(data: Prisma.BookingUncheckedCreateInput) {
    return prisma.booking.create({
      data: { ...data, isActive: true },
      include: bookingInclude,
    });
  }

  static async update(
    id: number,
    data: Prisma.BookingUncheckedUpdateInput,
  ) {
    return prisma.booking.update({
      where: { id },
      data,
      include: bookingInclude,
    });
  }

  static async delete(id: number) {
    return prisma.booking.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
