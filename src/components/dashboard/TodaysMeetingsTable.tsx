'use client';

import { Booking } from '@/lib/types';
import { formatTime, getMeetingTimeStatus } from '@/lib/utils';
import { MeetingTimeBadge } from '@/components/ui/StatusBadge';

interface TodaysMeetingsTableProps {
  bookings: Booking[];
}

export default function TodaysMeetingsTable({ bookings }: TodaysMeetingsTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        No meetings scheduled for today.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {['Time', 'Room', 'Department', 'Meeting', 'Status'].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {bookings.map((b) => {
            const timeStatus = getMeetingTimeStatus(b.startTime, b.endTime);
            return (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                  {formatTime(b.startTime)} – {formatTime(b.endTime)}
                </td>
                <td className="px-4 py-3 text-gray-600">{b.room?.name}</td>
                <td className="px-4 py-3 text-gray-600">{b.department?.name}</td>
                <td className="px-4 py-3 text-gray-800">{b.purpose}</td>
                <td className="px-4 py-3">
                  <MeetingTimeBadge status={timeStatus} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
