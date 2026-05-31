'use client';

import { useState } from 'react';
import { Booking, BookingStatus } from '@/lib/types';
import { BookingStatusBadge } from '@/components/ui/StatusBadge';
import { formatDate, formatTime } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface BookingApprovalTableProps {
  initialBookings: Booking[];
  showAll?: boolean;
}

export default function BookingApprovalTable({
  initialBookings,
  showAll = false,
}: BookingApprovalTableProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  const handleApprove = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'APPROVED' as BookingStatus } : b))
    );
  };

  const handleReject = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'REJECTED' as BookingStatus } : b))
    );
  };

  const displayed = showAll ? bookings : bookings.slice(0, 10);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {['Booking ID', 'Room', 'Requested By', 'Department', 'Date & Time', 'Purpose', 'Status', 'Action'].map(
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
            displayed.map((b) => (
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
                <td className="px-4 py-3">
                  <BookingStatusBadge status={b.status} />
                </td>
                <td className="px-4 py-3">
                  {b.status === 'PENDING' ? (
                    <div className="flex gap-1.5">
                      <button
                        id={`approve-${b.id}`}
                        onClick={() => handleApprove(b.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                        title="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        id={`reject-${b.id}`}
                        onClick={() => handleReject(b.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1.5 opacity-30 pointer-events-none">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-100 text-green-700">
                        <Check className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100 text-red-700">
                        <X className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
