export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { format } from 'date-fns';
import { CalendarDays, Plus, Video, CheckCircle } from 'lucide-react';
import UpcomingMeetings from '@/components/dashboard/UpcomingMeetings';
import MiniCalendar from '@/components/dashboard/MiniCalendar';
import { getAllBookings, getMyBookings, getSessionUser } from '@/services/booking.reader';
import { formatDate, formatTime, getBusinessNowIso, getMeetingStatus } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'M ONE INTEGRATION PVT LTD',
  description: 'Employee overview of meeting room bookings.',
};

function getGreeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// Time complexity: O(n log n), where n is the total number of bookings scanned.
export default async function DashboardPage() {
  const [bookings, allBookings, sessionUser] = await Promise.all([
    getMyBookings(),
    getAllBookings(),
    getSessionUser(),
  ]);

  const firstName = sessionUser?.name.split(' ')[0];
  const now = new Date();
  const nowIso = getBusinessNowIso();

  const bookingsWithStatus = bookings.map((booking) => ({
    booking,
    status: getMeetingStatus(booking.startTime, booking.endTime),
  }));

  const upcomingBookings = bookingsWithStatus
    .filter(({ status }) => status === 'UPCOMING' || status === 'ONGOING')
    .map(({ booking }) => booking)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const upcomingPreview = upcomingBookings.slice(0, 4);

  // "Ongoing Now" and "Next Meeting" reflect the shared room, so they use every user's bookings.
  const activeNow = allBookings.filter(
    (b) => b.startTime <= nowIso && b.endTime >= nowIso,
  );
  const currentOngoingBooking = activeNow[0];
  const upcoming = allBookings.filter((b) => b.startTime > nowIso);
  const nextMeeting = upcoming.reduce(
    (earliest, booking) =>
      earliest && earliest.startTime <= booking.startTime ? earliest : booking,
    upcoming[0],
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            {getGreeting(now.getHours())}{firstName ? `, ${firstName}` : ''}! 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">Here&apos;s your meeting overview for today.</p>
        </div>
        <div className="inline-flex w-fit items-center gap-3 self-center rounded-xl border border-gray-100 bg-white px-4 py-2.5 shadow-sm sm:self-auto">
          <CalendarDays className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-semibold text-gray-800">{format(now, 'MMM dd, yyyy')}</p>
            <p className="text-xs text-gray-500">{format(now, 'EEEE')}</p>
          </div>
        </div>
      </section>

      {!sessionUser && (
        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Your session has expired. Please <Link href="/login" className="font-semibold underline">sign in</Link> again to see your bookings.
        </div>
      )}

      <div className="grid gap-3 sm:gap-4">
        <div
          className={`group min-h-[240px] rounded-xl border border-l-4 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:min-h-[230px] sm:p-5 ${
            currentOngoingBooking
              ? 'border-orange-200 border-l-orange-500 bg-gradient-to-br from-orange-50 via-white to-white hover:border-orange-300 hover:shadow-orange-100'
              : 'border-gray-100 border-l-gray-200 bg-white hover:border-gray-200'
          }`}
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-xs font-medium text-gray-500 sm:text-sm">Ongoing Now</p>
                {currentOngoingBooking && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-600">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-500" />
                    </span>
                    Live
                  </span>
                )}
              </div>
              <p className="mt-1 text-3xl font-bold leading-none text-gray-900 sm:text-4xl">
                WIP Meeting
              </p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:bg-orange-100 sm:h-14 sm:w-14">
              <Video className="h-5 w-5 text-orange-600 transition-transform duration-200 group-hover:-translate-y-0.5 sm:h-7 sm:w-7" />
            </div>
          </div>
          {currentOngoingBooking ? (
            <div className="mt-8 grid gap-3 sm:mt-7 sm:grid-cols-2">
              <div className="rounded-lg bg-orange-50/70 px-3 py-2.5 transition-colors duration-200 group-hover:bg-orange-100/70">
                <p className="text-[11px] font-medium uppercase text-orange-600">Time period</p>
                <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                  {formatTime(currentOngoingBooking.startTime)} - {formatTime(currentOngoingBooking.endTime)}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2.5 transition-colors duration-200 group-hover:bg-slate-100">
                <p className="text-[11px] font-medium uppercase text-gray-500">Department</p>
                <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                  {currentOngoingBooking.department?.name ?? 'No department'}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-8 text-sm font-medium text-gray-400 sm:mt-7">
              No ongoing meeting now.
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-2 sm:gap-4">
          <div className="bg-white rounded-xl shadow-sm px-4 py-2.5 flex items-center gap-3 sm:gap-4 border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-black-500 truncate">Next Meeting</p>
              {nextMeeting ? (
                <>
                  <p className="mt-1 truncate text-xs text-gray-500">
                    {formatDate(nextMeeting.startTime)} · {formatTime(nextMeeting.startTime)} - {formatTime(nextMeeting.endTime)}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {nextMeeting.department?.name ?? 'No department'}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm font-medium text-gray-400">No upcoming meeting.</p>
              )}
            </div>
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 bg-emerald-50">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
          </div>
        </div>
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
