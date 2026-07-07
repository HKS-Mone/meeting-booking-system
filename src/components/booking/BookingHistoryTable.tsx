'use client';

import { useState } from 'react';
import { Booking } from '@/lib/types';
import { MeetingStatusBadge } from '@/components/ui/StatusBadge';
import { formatDate, formatTime, getMeetingStatus } from '@/lib/utils';

interface BookingHistoryTableProps {
  bookings: Booking[];
}

const ITEMS_PER_PAGE = 10;

export default function BookingHistoryTable({ bookings }: BookingHistoryTableProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(bookings.length / ITEMS_PER_PAGE));
  const paginated = bookings.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Booking ID', 'Room', 'Department', 'Date', 'Time', 'Status'].map(
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
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                  No bookings found.
                </td>
              </tr>
            ) : (
              paginated.map((b) => {
                const status = getMeetingStatus(b.startTime, b.endTime);
                return (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-gray-700">
                      {b.bookingCode}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{b.room?.name}</td>
                    <td className="px-4 py-3 text-gray-600">{b.department?.name}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatDate(b.date)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatTime(b.startTime)} – {formatTime(b.endTime)}
                    </td>
                    <td className="px-4 py-3">
                      <MeetingStatusBadge status={status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(page * ITEMS_PER_PAGE, bookings.length)} of {bookings.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}
