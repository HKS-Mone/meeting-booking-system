export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { format } from 'date-fns';
import { CalendarClock, Clock, Plus, Video } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import TodaysMeetingsTable from '@/components/dashboard/TodaysMeetingsTable';
import { getMyBookingsAction } from '@/services/booking.service';
import { formatDate, formatTime, getMeetingStatus } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Dashboard | Mone Meeting',
  description: 'Employee overview of meeting room bookings.',
};

// Time complexity: O(n log n), where n is the number of bookings for the current user.
export default async function DashboardPage() {
  const bookingsResult = await getMyBookingsAction();
  const bookings = bookingsResult.bookings ?? [];
  const now = new Date();
  const today = format(now, 'yyyy-MM-dd');
  const bookingsWithStatus = bookings.map((booking) => ({
    booking,
    status: getMeetingStatus(booking.startTime, booking.endTime),
  }));

  const todayBookings = bookings.filter((booking) => booking.date === today);
  const ongoingBookings = bookingsWithStatus
    .filter(({ status }) => status === 'ONGOING')
    .map(({ booking }) => booking);
  const upcomingBookings = bookings
    .filter((booking) => new Date(booking.startTime) > now)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const completedBookings = bookingsWithStatus
    .filter(({ status }) => status === 'COMPLETE')
    .map(({ booking }) => booking);
  const nextBooking = upcomingBookings[0];
  const upcomingPreview = upcomingBookings.slice(0, 3);

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Employee dashboard
            </p>
            <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
              M ONE MEETING ROOM
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              Review your active bookings, today&apos;s schedule, and the next meetings waiting in your calendar.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/booking-history/add-booking"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              New Booking
            </Link>
            <Link
              href="/calendar"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <CalendarClock className="h-4 w-4" />
              Open Calendar
            </Link>
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
          title="My Bookings"
          value={bookings.length}
          iconName="LayoutGrid"
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          linkHref="/booking-history"
          linkText="View history"
        />
        <StatsCard
          title="Meetings Today"
          value={todayBookings.length}
          iconName="Calendar"
          iconColor="text-sky-600"
          iconBg="bg-sky-50"
          linkHref="/calendar"
          linkText="Open calendar"
        />
        <StatsCard
          title="Upcoming"
          value={upcomingBookings.length}
          iconName="Video"
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          linkHref="/booking-history"
          linkText="View all"
        />
        <StatsCard
          title="Completed"
          value={completedBookings.length}
          iconName="CheckCircle"
          iconColor="text-slate-600"
          iconBg="bg-slate-100"
          linkHref="/booking-history"
          linkText="View all"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Today&apos;s meetings</h2>
              <p className="text-sm text-slate-500">Your schedule for {format(now, 'MMMM d, yyyy')}.</p>
            </div>
            {ongoingBookings.length > 0 && (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {ongoingBookings.length} ongoing
              </span>
            )}
          </div>
          <TodaysMeetingsTable bookings={todayBookings} />
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-slate-900">Next meeting</h2>
                {nextBooking ? (
                  <div className="mt-3 space-y-2">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {nextBooking.purpose || nextBooking.bookingCode}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatDate(nextBooking.date)}
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {formatTime(nextBooking.startTime)} - {formatTime(nextBooking.endTime)}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {nextBooking.department?.name ?? 'No department'}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">No upcoming meetings.</p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Upcoming queue</h2>
                <p className="text-sm text-slate-500">Next {upcomingPreview.length} meetings.</p>
              </div>
              <Video className="h-5 w-5 text-blue-600" />
            </div>
            <div className="mt-4 space-y-3">
              {upcomingPreview.length > 0 ? (
                upcomingPreview.map((booking) => (
                  <div key={booking.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {booking.purpose || booking.bookingCode}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(booking.date)} at {formatTime(booking.startTime)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No upcoming bookings found.</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
