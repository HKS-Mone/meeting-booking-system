import type { Metadata } from 'next';
import { bookings, rooms, departments } from '@/lib/mock-data';
import StatsCard from '@/components/dashboard/StatsCard';
import BookingsTable from '@/components/admin/BookingsTable';
import { format } from 'date-fns';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Mone Meeting',
  description: 'Administrator overview of bookings, rooms, and departments.',
};

export default function AdminDashboardPage() {
  const now = new Date();
  const thisMonth = format(now, 'yyyy-MM');
  const thisMonthBookings = bookings.filter((b) => b.date.startsWith(thisMonth));
  const activeNow = bookings.filter((b) => {
    const start = new Date(b.startTime);
    const end = new Date(b.endTime);
    return start <= now && end >= now;
  });

  const upcoming = bookings.filter((b) => new Date(b.startTime) > now);

  // 10 most recent bookings
  const recent = [...bookings]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold align-center text-gray-800">Recent Bookings</h2>
        </div>
        <BookingsTable bookings={recent} />
      </div>
    </div>
  );
}
