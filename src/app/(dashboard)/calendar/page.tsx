'use client';

import { useEffect, useMemo, useState } from 'react';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import { formatMonthYear } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, subMonths } from 'date-fns';
import type { Booking } from '@/lib/types';
import { getBookingsAction } from '@/services/booking.service';
import { useToastStore } from '@/components/ui/Toast';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    let ignore = false;

    async function loadBookings() {
      setIsLoading(true);
      const result = await getBookingsAction();
      if (ignore) return;

      if (result.success) {
        setBookings(result.bookings ?? []);
      } else {
        addToast(result.error ?? 'Failed to load bookings.', 'error');
      }

      setIsLoading(false);
    }

    void loadBookings();

    return () => {
      ignore = true;
    };
  }, [addToast]);

  const monthBookings = useMemo(
    () =>
      bookings.filter((booking) => {
        const bookingDate = new Date(booking.date);
        return (
          bookingDate.getFullYear() === currentDate.getFullYear() &&
          bookingDate.getMonth() === currentDate.getMonth()
        );
      }),
    [bookings, currentDate],
  );

  return (
    <div className="space-y-5">
      {/* Controls row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            id="calendar-prev"
            onClick={() => setCurrentDate((d) => subMonths(d, 1))}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-base font-semibold text-gray-800 min-w-[160px] text-center">
            {formatMonthYear(currentDate)}
          </h2>
          <button
            id="calendar-next"
            onClick={() => setCurrentDate((d) => addMonths(d, 1))}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Status legend */}
        <div className="flex items-center gap-4 text-xs text-gray-500 bg-white border border-gray-200 rounded-xl px-4 py-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            Upcoming
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
            Ongoing
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" />
            Complete
          </span>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Loading bookings...
        </div>
      )}

      {/* Calendar */}
      <CalendarGrid currentDate={currentDate} bookings={monthBookings} />
    </div>
  );
}
