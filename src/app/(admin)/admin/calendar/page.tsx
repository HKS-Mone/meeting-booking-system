'use client';

import { useState } from 'react';
import { getBookingsForMonth } from '@/lib/mock-data';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import { formatMonthYear } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, subMonths } from 'date-fns';

export default function AdminCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthBookings = getBookingsForMonth(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );

  return (
    <div className="space-y-5">
      {/* Controls row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            id="admin-calendar-prev"
            onClick={() => setCurrentDate((d) => subMonths(d, 1))}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-base font-semibold text-gray-800 min-w-[160px] text-center">
            {formatMonthYear(currentDate)}
          </h2>
          <button
            id="admin-calendar-next"
            onClick={() => setCurrentDate((d) => addMonths(d, 1))}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
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

      {/* Calendar */}
      <CalendarGrid currentDate={currentDate} bookings={monthBookings} />
    </div>
  );
}
