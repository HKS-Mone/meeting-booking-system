import type { Metadata } from 'next';
import StatsCard from '@/components/dashboard/StatsCard';
import TodaysMeetingsTable from '@/components/dashboard/TodaysMeetingsTable';
import RoomStatusDonut from '@/components/dashboard/RoomStatusDonut';
import UpcomingMeetings from '@/components/dashboard/UpcomingMeetings';
import { getRoomStats, getTodaysBookings, getUpcomingBookings, departments } from '@/lib/mock-data';
import { format } from 'date-fns';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard | MeetingHub',
  description: 'View your meeting room booking overview and today\'s schedule.',
};

export default function DashboardPage() {
  const stats = getRoomStats();
  const todaysBookings = getTodaysBookings();
  const upcomingBookings = getUpcomingBookings(3);
  const today = format(new Date(), 'EEEE, MMMM dd, yyyy');

  const activeMeetings = todaysBookings.filter((b) => {
    const now = new Date();
    return new Date(b.startTime) <= now && new Date(b.endTime) >= now;
  }).length;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Rooms"
          value={stats.total}
          iconName="Building2"
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          linkHref="/meeting-rooms"
          linkText="View all rooms"
        />
        <StatsCard
          title="Available Rooms"
          value={stats.available}
          iconName="CheckCircle"
          iconColor="text-green-600"
          iconBg="bg-green-50"
          linkHref="/meeting-rooms"
          linkText="View availability"
        />
        <StatsCard
          title="Active Meetings"
          value={activeMeetings}
          iconName="Video"
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          linkHref="/calendar"
          linkText="View all meetings"
        />
        <StatsCard
          title="Departments"
          value={departments.length}
          iconName="LayoutGrid"
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
          linkHref="/departments"
          linkText="View all departments"
        />
      </div>

      {/* Middle row: Today's meetings + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Meetings */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-semibold text-gray-800">Today&apos;s Meetings</h2>
              <p className="text-xs text-gray-400 mt-0.5">{today}</p>
            </div>
            <Link
              href="/booking-history"
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              View all →
            </Link>
          </div>
          <TodaysMeetingsTable bookings={todaysBookings} />
        </div>

        {/* Room Status Donut */}
        <RoomStatusDonut
          available={stats.available}
          occupied={stats.occupied}
          maintenance={stats.maintenance}
          outOfService={stats.outOfService}
          total={stats.total}
        />
      </div>

      {/* Upcoming Meetings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Upcoming Meetings</h2>
          <Link
            href="/calendar"
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            View Calendar →
          </Link>
        </div>
        <UpcomingMeetings bookings={upcomingBookings} />
      </div>
    </div>
  );
}
