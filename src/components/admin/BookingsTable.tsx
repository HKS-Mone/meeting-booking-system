'use client';

import { Booking } from '@/lib/types';
import { MeetingStatusBadge } from '@/components/ui/StatusBadge';
import { formatDate, formatTime, getMeetingStatus } from '@/lib/utils';

interface BookingsTableProps {
  bookings: Booking[];
  /** When false, caps display at 10 rows */
  showAll?: boolean;
}

export default function BookingsTable({ bookings, showAll = false }: BookingsTableProps) {
  const displayed = showAll ? bookings : bookings.slice(0, 10);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {['Booking ID', 'Room', 'Booked By', 'Department', 'Date & Time', 'Purpose', 'Participants', 'Status'].map(
              (h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {displayed.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">
                No bookings found.
              </td>
            </tr>
          ) : (
            displayed.map((b) => {
              const meetingStatus = getMeetingStatus(b.startTime, b.endTime);
              return (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-gray-700">
                    {b.bookingCode}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{b.room?.name}</td>
                  <td className="px-4 py-3 text-gray-700">{b.user?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{b.department?.name}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
                    <div>{formatDate(b.date)}</div>
                    <div className="text-gray-400">
                      {formatTime(b.startTime)} – {formatTime(b.endTime)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">
                    {b.purpose}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-center">
                    {b.participants}
                  </td>
                  <td className="px-4 py-3">
                    <MeetingStatusBadge status={meetingStatus} />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
