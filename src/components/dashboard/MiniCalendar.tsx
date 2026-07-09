'use client';

import { useState } from 'react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday, isSameDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Booking } from '@/lib/types';
import { getMeetingStatus, parseDateOnly } from '@/lib/utils';

interface MiniCalendarProps {
  bookings: Booking[];
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const DOT_STYLE: Record<'UPCOMING' | 'COMPLETE' | 'CANCELLED', string> = {
  UPCOMING: 'bg-amber-500',
  COMPLETE: 'bg-emerald-500',
  CANCELLED: 'bg-red-500',
};

// Time complexity: O(d), where d is the number of days rendered in the visible month grid.
export default function MiniCalendar({ bookings }: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const getDayDotStatus = (day: Date) => {
    const dayBookings = bookings.filter((b) => isSameDay(parseDateOnly(b.date), day));
    if (dayBookings.length === 0) return null;
    const isOngoingOrUpcoming = dayBookings.some(
      (b) => getMeetingStatus(b.startTime, b.endTime) !== 'COMPLETE'
    );
    return isOngoingOrUpcoming ? 'UPCOMING' : 'COMPLETE';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
          className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="text-sm font-semibold text-gray-800">{format(currentMonth, 'MMMM yyyy')}</p>
        <button
          type="button"
          onClick={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((d) => (
          <span key={d} className="text-[11px] font-medium text-gray-400">
            {d}
          </span>
        ))}
        {days.map((day) => {
          const inMonth = isSameMonth(day, currentMonth);
          const dotStatus = getDayDotStatus(day);
          return (
            <div key={day.toISOString()} className="flex flex-col items-center gap-0.5 py-0.5">
              <span
                className={`
                  w-7 h-7 flex items-center justify-center rounded-full text-xs
                  ${isToday(day) ? 'bg-blue-600 text-white font-semibold' : inMonth ? 'text-gray-700' : 'text-gray-300'}
                `}
              >
                {format(day, 'd')}
              </span>
              <span className={`w-1 h-1 rounded-full ${dotStatus ? DOT_STYLE[dotStatus] : 'bg-transparent'}`} />
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-4 pt-3 border-t border-gray-100">
        {(['UPCOMING', 'COMPLETE', 'CANCELLED'] as const).map((status) => (
          <div key={status} className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${DOT_STYLE[status]}`} />
            <span className="text-[11px] text-gray-500 capitalize">{status.toLowerCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
