export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { format } from 'date-fns';
import { CalendarDays, Plus } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import UpcomingMeetings from '@/components/dashboard/UpcomingMeetings';
import MiniCalendar from '@/components/dashboard/MiniCalendar';
import { getMyBookingsAction } from '@/services/booking.service';
import { authService } from '@/services/auth.service';
import { getMeetingStatus } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Dashboard | Mone Meeting',
  description: 'Employee overview of meeting room bookings.',
};

function getGreeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// Time complexity: O(n log n), where n is the number of bookings for the current user.
export default async function DashboardPage() {
  const [bookingsResult, sessionResult] = await Promise.all([
    getMyBookingsAction(),
    authService.getSession(),
  ]);

  const bookings = bookingsResult.bookings ?? [];
  const firstName = sessionResult.success ? sessionResult.user?.name.split(' ')[0] : undefined;
  const now = new Date();
  const monthKey = format(now, 'yyyy-MM');

  const bookingsWithStatus = bookings.map((booking) => ({
    booking,
    status: getMeetingStatus(booking.startTime, booking.endTime),
  }));

  const monthlyBookings = bookings.filter((booking) => booking.date.startsWith(monthKey));
  const completedBookings = bookingsWithStatus.filter(({ status }) => status === 'COMPLETE');
  const upcomingBookings = bookingsWithStatus
    .filter(({ status }) => status === 'UPCOMING' || status === 'ONGOING')
    .map(({ booking }) => booking)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const upcomingPreview = upcomingBookings.slice(0, 4);

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            {getGreeting(now.getHours())}{firstName ? `, ${firstName}` : ''}! 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">Here&apos;s your meeting overview for today.</p>
        </div>
        <div className="inline-flex w-fit items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-2.5 shadow-sm">
          <CalendarDays className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-semibold text-gray-800">{format(now, 'MMM dd, yyyy')}</p>
            <p className="text-xs text-gray-500">{format(now, 'EEEE')}</p>
          </div>
        </div>
      </section>

      {!bookingsResult.success && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {bookingsResult.error ?? 'Failed to load dashboard bookings.'}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatsCard
          title="Total Bookings"
          value={monthlyBookings.length}
          iconName="Calendar"
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          trend="This month"
        />
        <StatsCard
          title="Completed"
          value={completedBookings.length}
          iconName="CheckCircle"
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          trend={bookings.length > 0 ? `${Math.round((completedBookings.length / bookings.length) * 100)}% of total` : '0% of total'}
        />
        <StatsCard
          title="Upcoming"
          value={upcomingBookings.length}
          iconName="Video"
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          trend="Next 7 days"
        />
        <StatsCard
          title="Cancelled"
          value={0}
          iconName="XCircle"
          iconColor="text-red-600"
          iconBg="bg-red-50"
          trend="This month"
        />
      </div>

      <div className="flex justify-center">
        <Link
          href="/booking-history/add-booking"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
        >
          <Plus className="h-4 w-7" />
          Add Booking
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="text-base font-semibold text-gray-900">Upcoming Meetings</h2>
            <a href="/calendar" className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-100 rounded-lg px-3 py-1.5">
              View Calendar
            </a>
          </div>
          <UpcomingMeetings bookings={upcomingPreview} />
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Monthly Calendar</h2>
          <MiniCalendar bookings={bookings} />
        </section>
      </div>
    </div>
  );
}
