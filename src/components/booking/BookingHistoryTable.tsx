'use client';

import { useState } from 'react';
import { Booking } from '@/lib/types';
import { MeetingStatusBadge } from '@/components/ui/StatusBadge';
import { formatDate, formatTime, getMeetingStatus } from '@/lib/utils';
import { Eye } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { format } from 'date-fns';

interface BookingHistoryTableProps {
  bookings: Booking[];
}

const ITEMS_PER_PAGE = 10;

export default function BookingHistoryTable({ bookings }: BookingHistoryTableProps) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Booking | null>(null);

  const totalPages = Math.max(1, Math.ceil(bookings.length / ITEMS_PER_PAGE));
  const paginated = bookings.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Booking ID', 'Room', 'Department', 'Date', 'Time', 'Status', 'Action'].map(
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
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
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
                    <td className="px-4 py-3">
                      <button
                        id={`view-booking-${b.id}`}
                        onClick={() => setSelected(b)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
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

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Booking Details" size="md">
        {selected && (() => {
          const status = getMeetingStatus(selected.startTime, selected.endTime);
          return (
            <div className="space-y-3 text-sm">
              <div className="flex gap-3 items-center">
                <span className="w-28 shrink-0 text-gray-500">Status</span>
                <MeetingStatusBadge status={status} />
              </div>
              {[
                ['Booking ID', selected.bookingCode],
                ['Room', selected.room?.name ?? '-'],
                ['Department', selected.department?.name ?? '-'],
                ['Purpose', selected.purpose],
                ['Date', formatDate(selected.date)],
                ['Time', `${formatTime(selected.startTime)} – ${formatTime(selected.endTime)}`],
                ['Participants', String(selected.participants)],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="w-28 shrink-0 text-gray-500">{label}</span>
                  <span className="font-medium text-gray-800">{value}</span>
                </div>
              ))}
            </div>
          );
        })()}
      </Modal>
    </>
  );
}
