import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const bookingInclude = {
  user: { include: { department: true } },
  department: true,
} satisfies Prisma.BookingInclude;

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
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

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

  static async create(data: {
    userId: number;
    departmentId: number;
    description: string;
    date: Date;
    startTime: Date;
    endTime: Date;
  }) {
    return prisma.booking.create({
      data: { ...data, isActive: true },
      include: bookingInclude,
    });
  }

  static async update(
    id: number,
    data: Partial<{
      departmentId: number;
      description: string;
      date: Date;
      startTime: Date;
      endTime: Date;
    }>,
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
