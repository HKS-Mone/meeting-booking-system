'use client';

import { Booking } from '@/lib/types';
import { formatTime, getMeetingStatus as getMeetingTimeStatus } from '@/lib/utils';
import { MeetingStatusBadge } from '@/components/ui/StatusBadge';

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
    <>
      {/* Mobile / small-tablet: card list */}
      <ul className="md:hidden divide-y divide-gray-100">
        {bookings.map((b) => {
          const timeStatus = getMeetingTimeStatus(b.startTime, b.endTime);
          return (
            <li key={b.id} className="px-4 py-3 flex flex-col gap-1 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-gray-800 truncate">{b.purpose}</p>
                  <p className="text-xs font-mono text-gray-400 mt-0.5">{b.bookingCode}</p>
                </div>
                <MeetingStatusBadge status={timeStatus} />
              </div>
              <p className="text-xs text-gray-500">{b.department?.name}</p>
              <p className="text-xs font-medium text-gray-600">
                {formatTime(b.startTime)} – {formatTime(b.endTime)}
              </p>
            </li>
          );
        })}
      </ul>

      {/* Tablet+ : scrollable table, matching Manage Bookings column set */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Booking ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Time</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Department</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bookings.map((b) => {
              const timeStatus = getMeetingTimeStatus(b.startTime, b.endTime);
              return (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-gray-700">{b.bookingCode}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                    {formatTime(b.startTime)} – {formatTime(b.endTime)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{b.department?.name}</td>
                  <td className="px-4 py-3">
                    <MeetingStatusBadge status={timeStatus} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
