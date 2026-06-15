import prisma from '@/lib/prisma';

export class AdminRepository {
  static async getDashboardStats() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [totalUsers, totalBookings, activeBookings, totalDepartments] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { isActive: true } }),
      prisma.department.count(),
    ]);

    const todaysBookings = await prisma.booking.count({
      where: {
        isActive: true,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    return {
      totalUsers,
      totalBookings,
      activeBookings,
      totalDepartments,
      todaysBookings,
    };
  }

  static async getBookingsByDepartmentStats() {
    const stats = await prisma.booking.groupBy({
      by: ['departmentId'],
      where: {
        isActive: true,
      },
      _count: {
        id: true,
      },
    });

    const departments = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return stats.map((stat) => {
      const dept = departments.find((d) => d.id === stat.departmentId);
      return {
        departmentName: dept?.name || 'Unknown',
        bookingCount: stat._count.id,
      };
    });
  }

  static async getMonthlyBookingsStats() {
    // Basic aggregation for monthly grouping (cross-db compatible)
    const bookings = await prisma.booking.findMany({
      where: { isActive: true },
      select: { date: true },
    });

    const months: Record<string, number> = {};
    bookings.forEach((b) => {
      const monthStr = b.date.toISOString().slice(0, 7); // YYYY-MM
      months[monthStr] = (months[monthStr] || 0) + 1;
    });

    return Object.entries(months).map(([month, count]) => ({
      month,
      count,
    })).sort((a, b) => a.month.localeCompare(b.month));
  }
}
