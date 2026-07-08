export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { format } from 'date-fns';
import { AdminRepository } from '@/repository/admin.repository';
import { getBookingsAction } from '@/services/booking.service';
import StatsCard from '@/components/dashboard/StatsCard';
import TodaysMeetingsTable from '@/components/dashboard/TodaysMeetingsTable';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Mone Meeting',
  description: 'Administrator overview of bookings, rooms, and departments.',
};

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
        <StatsCard
          title="Ongoing Now"
          value={activeNow.length}
          iconName="Video"
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
          linkHref=""
        />
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
