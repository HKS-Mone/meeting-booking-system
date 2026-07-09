export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { format } from 'date-fns';
import { Video } from 'lucide-react';
import { AdminRepository } from '@/repository/admin.repository';
import { getBookingsAction } from '@/services/booking.service';
import StatsCard from '@/components/dashboard/StatsCard';
import TodaysMeetingsTable from '@/components/dashboard/TodaysMeetingsTable';
import { formatTime } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Mone Meeting',
  description: 'Administrator overview of bookings, rooms, and departments.',
};

// Time complexity: O(n), where n is the number of bookings.
export default async function AdminDashboardPage() {
  const [stats, bookingsResult] = await Promise.all([
    AdminRepository.getDashboardStats(),
    getBookingsAction(),
  ]);

  const allBookings = bookingsResult.bookings ?? [];
  const now = new Date();
  const today = format(now, 'yyyy-MM-dd');

  const todayBookings = allBookings.filter((b) => b.date === today);
  const activeNow = allBookings.filter((b) => {
    const start = new Date(b.startTime);
    const end = new Date(b.endTime);
    return start <= now && end >= now;
  });
  const currentOngoingBooking = activeNow[0];
  const upcoming = allBookings.filter((b) => new Date(b.startTime) > now);

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#07104a] via-[#0d2a66] to-[#123c87] p-4 sm:p-6 text-white shadow-[0_20px_50px_rgba(13,42,102,0.28)]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-16 right-0 h-40 w-40 rounded-full bg-sky-400 blur-3xl" />
          <div className="absolute bottom-0 left-10 h-40 w-40 rounded-full bg-cyan-300 blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-blue-100">
              Admin overview
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
                M ONE MEETING ROOM
              </h1>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link
                href="/admin/manage-bookings/add-booking"
                className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0d2a66] transition hover:bg-slate-100"
              >
                Book Meeting
              </Link>
              <Link
                href="/admin/calendar"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Open Calendar
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:gap-4">
        <div className="min-h-[190px] rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:min-h-[180px] sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-gray-500 sm:text-sm">Ongoing Now</p>
              <p className="mt-1 text-2xl font-bold leading-none text-gray-900 sm:text-3xl">
                {activeNow.length}
              </p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 sm:h-14 sm:w-14">
              <Video className="h-5 w-5 text-orange-600 sm:h-7 sm:w-7" />
            </div>
          </div>
          {currentOngoingBooking ? (
            <div className="mt-6 grid gap-3 sm:mt-5 sm:grid-cols-2">
              <div className="rounded-lg bg-orange-50/70 px-3 py-2">
                <p className="text-[11px] font-medium uppercase text-orange-600">Time period</p>
                <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                  {formatTime(currentOngoingBooking.startTime)} - {formatTime(currentOngoingBooking.endTime)}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-medium uppercase text-gray-500">Department</p>
                <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                  {currentOngoingBooking.department?.name ?? 'No department'}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm font-medium text-gray-400 sm:mt-5">
              No ongoing meeting now.
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <StatsCard
            title="Meetings Today"
            value={stats.todaysBookings}
            iconName="Calendar"
            iconColor="text-sky-600"
            iconBg="bg-sky-50"
            linkHref="/admin/calendar"
          />
          <StatsCard
            title="Active Bookings"
            value={upcoming.length + activeNow.length}
            iconName="CheckCircle"
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            linkHref=""
          />
        </div>
      </div>

      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Today&apos;s meetings</h2>
              <p className="text-sm text-slate-500">What is happening right now across all rooms.</p>
            </div>
          </div>
          <TodaysMeetingsTable bookings={todayBookings} />
        </section>
      </div>
    </div>
  );
}
