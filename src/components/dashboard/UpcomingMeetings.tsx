'use client';

import { Booking } from '@/lib/types';
import { formatDate, formatTime } from '@/lib/utils';
import { MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

interface UpcomingMeetingsProps {
  bookings: Booking[];
}

export default function UpcomingMeetings({ bookings }: UpcomingMeetingsProps) {
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500'];

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No upcoming meetings.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
      {bookings.map((b, i) => (
        <div
          key={b.id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
        >
          <div className={`h-1.5 ${colors[i % colors.length]}`} />
          <div className="p-4">
            <h4 className="font-semibold text-gray-800 text-sm truncate">{b.purpose}</h4>
            <div className="mt-2 space-y-1.5">       
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {formatDate(b.date)}, {formatTime(b.startTime)} – {formatTime(b.endTime)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
