import type { Metadata } from 'next';
import { bookings, rooms, departments } from '@/lib/mock-data';
import StatsCard from '@/components/dashboard/StatsCard';
import BookingsTable from '@/components/admin/BookingsTable';
import { format } from 'date-fns';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin Dashboard | MeetingHub',
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
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Bookings This Month"
          value={thisMonthBookings.length}
          iconName="Calendar"
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          trend="This month"
        />
        <StatsCard
          title="Total Rooms"
          value={rooms.length}
          iconName="DoorOpen"
          iconColor="text-green-600"
          iconBg="bg-green-50"
          linkHref="/admin/manage-rooms"
          linkText="Manage rooms"
        />
        <StatsCard
          title="Upcoming Meetings"
          value={upcoming.length}
          iconName="Calendar"
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          linkHref="/admin/calendar"
          linkText="View calendar"
        />
        <StatsCard
          title="Active Meetings Now"
          value={activeNow.length}
          iconName="Video"
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
          trend="Right now"
        />
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Recent Bookings</h2>
          <Link
            href="/admin/manage-bookings"
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Manage all →
          </Link>
        </div>
        <BookingsTable bookings={recent} />
      </div>
    </div>
  );
}
