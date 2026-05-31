'use client';

import { useState } from 'react';
import { bookings, getBookingsForMonth } from '@/lib/mock-data';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import { formatMonthYear } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, subMonths } from 'date-fns';

export default function CalendarPage() {
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

        {/* View toggle (visual only for now) */}
        <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden text-sm">
          {['Month', 'Week', 'Day'].map((v) => (
            <button
              key={v}
              className={`px-4 py-2 transition-colors ${
                v === 'Month' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <CalendarGrid currentDate={currentDate} bookings={monthBookings} />
    </div>
  );
}
