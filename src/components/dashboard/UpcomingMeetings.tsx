'use client';

import { isToday } from 'date-fns';
import { Booking } from '@/lib/types';
import { formatDate, formatTime, parseDateOnly } from '@/lib/utils';

interface UpcomingMeetingsProps {
  bookings: Booking[];
}

const ACCENT_COLORS = ['border-l-blue-500', 'border-l-orange-500', 'border-l-purple-500', 'border-l-teal-500'];

export default function UpcomingMeetings({ bookings }: UpcomingMeetingsProps) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No upcoming meetings.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((b, i) => {
        const meetingIsToday = isToday(parseDateOnly(b.date));
        return (
          <div
            key={b.id}
            className={`flex flex-wrap items-center gap-x-3 gap-y-2 sm:flex-nowrap sm:gap-4 rounded-xl border border-gray-100 border-l-4 ${ACCENT_COLORS[i % ACCENT_COLORS.length]} bg-white px-3 py-3 sm:px-4 hover:shadow-sm transition-shadow`}
          >
            <div className="w-12 shrink-0 text-center sm:w-14">
              <p className="text-sm font-bold text-gray-800 leading-tight">{formatTime(b.startTime).split(' ')[0]}</p>
              <p className="text-[11px] font-medium text-gray-400 uppercase">{formatTime(b.startTime).split(' ')[1]}</p>
            </div>
            <div className="min-w-0 flex-1 basis-40">
              <p className="font-semibold text-sm text-gray-800 truncate">{b.purpose || b.bookingCode}</p>
              <p className="mt-0.5 text-xs text-gray-500 truncate">{b.department?.name ?? 'No department'}</p>
            </div>
            <div className="ml-auto shrink-0 text-right sm:ml-0">
              {meetingIsToday ? (
                <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">
                  Today
                </span>
              ) : (
                <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">
                  {formatDate(b.date)}
                </span>
              )}
              <p className="mt-1 text-[11px] text-gray-400 whitespace-nowrap">
                {formatTime(b.startTime)} - {formatTime(b.endTime)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
