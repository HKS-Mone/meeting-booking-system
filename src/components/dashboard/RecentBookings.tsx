import Link from 'next/link';
import { CheckCircle2, Clock } from 'lucide-react';
import { Booking, MeetingStatus } from '@/lib/types';
import { formatDate, formatTime, getMeetingStatus } from '@/lib/utils';

interface RecentBookingsProps {
  bookings: Booking[];
}

const STATUS_ICON: Record<MeetingStatus, { icon: typeof CheckCircle2; bg: string; text: string }> = {
  COMPLETE: { icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-600' },
  ONGOING: { icon: Clock, bg: 'bg-amber-50', text: 'text-amber-600' },
  UPCOMING: { icon: Clock, bg: 'bg-amber-50', text: 'text-amber-600' },
};

const STATUS_LABEL: Record<MeetingStatus, { label: string; className: string }> = {
  COMPLETE: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700' },
  ONGOING: { label: 'Ongoing', className: 'bg-amber-50 text-amber-700' },
  UPCOMING: { label: 'Upcoming', className: 'bg-amber-50 text-amber-700' },
};

export default function RecentBookings({ bookings }: RecentBookingsProps) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Recent Bookings</h2>
        <Link href="/booking-history" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
          View All
        </Link>
      </div>

      {bookings.length === 0 ? (
        <p className="text-center py-8 text-gray-400 text-sm">No bookings yet.</p>
      ) : (
        <div className="space-y-1">
          {bookings.map((b) => {
            const status = getMeetingStatus(b.startTime, b.endTime);
            const { icon: Icon, bg, text } = STATUS_ICON[status];
            const { label, className } = STATUS_LABEL[status];
            return (
              <div key={b.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
                  <Icon className={`w-4 h-4 ${text}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">{b.purpose || b.bookingCode}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(b.date)} • {formatTime(b.startTime)} - {formatTime(b.endTime)}
                  </p>
                </div>
                <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold ${className}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
