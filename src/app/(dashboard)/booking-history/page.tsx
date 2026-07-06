'use client';

import { useEffect, useState, useMemo } from 'react';
import type { Booking, MeetingStatus } from '@/lib/types';
import { getMeetingStatus, formatDate, formatTime } from '@/lib/utils';
import { MeetingStatusBadge } from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { Eye } from 'lucide-react';
import { useBooking } from '../../../../hook/useBooking';
import { useToastStore } from '@/components/ui/Toast';

const LATEST_BOOKINGS_LIMIT = 20;

type StatusFilter = '' | MeetingStatus;

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: 'All Status', value: '' },
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'Ongoing', value: 'ONGOING' },
  { label: 'Complete', value: 'COMPLETE' },
];

const ITEMS_PER_PAGE = 10;

// Display order for meeting statuses: Ongoing first, then Upcoming, then Complete.
const STATUS_ORDER: Record<MeetingStatus, number> = { ONGOING: 0, UPCOMING: 1, COMPLETE: 2 };

export default function BookingHistoryPage() {
  const { bookings, isLoading, loadBookings } = useBooking();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Booking | null>(null);
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    loadBookings().catch((err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to load bookings.';
      addToast(message, 'error');
    });
  }, [loadBookings, addToast]);

  const latestBookings = useMemo(
    () =>
      [...bookings]
        .sort((a, b) => b.startTime.localeCompare(a.startTime))
        .slice(0, LATEST_BOOKINGS_LIMIT),
    [bookings],
  );

  // Compute each booking's status once so it stays consistent across the whole
  // filter/sort pass (getMeetingStatus reads `now`, which could otherwise shift
  // mid-sort and break the comparator). Time complexity: O(n).
  const withStatus = useMemo(
    () => latestBookings.map((booking) => ({ booking, status: getMeetingStatus(booking.startTime, booking.endTime) })),
    [latestBookings],
  );

  // Filter, then order by status (Ongoing → Upcoming → Complete) using the
  // cached status. Time complexity: O(n log n).
  const filtered = useMemo(() => {
    return withStatus
      .filter(({ booking, status }) => {
        const matchStatus = !statusFilter || status === statusFilter;
        const matchFrom = !fromDate || booking.date >= fromDate;
        const matchTo = !toDate || booking.date <= toDate;
        return matchStatus && matchFrom && matchTo;
      })
      .sort((a, b) => {
        if (STATUS_ORDER[a.status] !== STATUS_ORDER[b.status]) {
          return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        }
        // Within COMPLETE, most recent first; within ONGOING/UPCOMING, soonest first
        return a.status === 'COMPLETE'
          ? b.booking.startTime.localeCompare(a.booking.startTime)
          : a.booking.startTime.localeCompare(b.booking.startTime);
      })
      .map(({ booking }) => booking);
  }, [withStatus, statusFilter, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFilterChange = (newStatus: StatusFilter) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          id="booking-status-filter"
          value={statusFilter}
          onChange={(e) => handleFilterChange(e.target.value as StatusFilter)}
          className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <input
          type="date"
          id="booking-from-date"
          value={fromDate}
          onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
          className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          id="booking-to-date"
          value={toDate}
          onChange={(e) => { setToDate(e.target.value); setPage(1); }}
          className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Loading bookings...
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-gray-500">
        {filtered.length} meeting{filtered.length !== 1 ? 's' : ''} found
      </p>

      {/* ── MOBILE: Card List ─────────────────────────────────────────────── */}
      <div className="sm:hidden space-y-3">
        {paginated.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-10 text-center text-gray-400 text-sm">
            No bookings found.
          </div>
        ) : paginated.map((b) => {
          const status = getMeetingStatus(b.startTime, b.endTime);
          return (
            <div
              key={b.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{b.purpose}</p>
                  <p className="text-xs font-mono text-gray-400 mt-0.5">{b.bookingCode}</p>
                </div>
                <MeetingStatusBadge status={status} />
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-500">
                <div>
                  <span className="block font-medium text-gray-700">Department</span>
                  {b.department?.name}
                </div>
                <div>
                  <span className="block font-medium text-gray-700">Date</span>
                  {formatDate(b.date)}
                </div>
                <div>
                  <span className="block font-medium text-gray-700">Time</span>
                  {formatTime(b.startTime)} – {formatTime(b.endTime)}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end pt-1 border-t border-gray-50">
                <button
                  id={`view-booking-${b.id}`}
                  onClick={() => setSelected(b)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── DESKTOP: Table ────────────────────────────────────────────────── */}
      <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            Meeting Bookings{' '}
            <span className="text-sm font-normal text-gray-400">({filtered.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Department', 'Date', 'Time', 'Description', 'Status', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                    No bookings found.
                  </td>
                </tr>
              ) : paginated.map((b) => {
                const status = getMeetingStatus(b.startTime, b.endTime);
                return (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600">{b.department?.name}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(b.date)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatTime(b.startTime)} – {formatTime(b.endTime)}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[130px] truncate">{b.purpose}</td>
                    <td className="px-4 py-3"><MeetingStatusBadge status={status} /></td>
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
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Previous</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile pagination */}
      {totalPages > 1 && (
        <div className="sm:hidden flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white disabled:opacity-40">Previous</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Booking Details" size="md">
        {selected && (() => {
          const status = getMeetingStatus(selected.startTime, selected.endTime);
          return (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-gray-500">Status</span>
                <MeetingStatusBadge status={status} />
              </div>
              {[
                ['Department', selected.department?.name ?? '-'],
                ['Description', selected.purpose],
                ['Date', formatDate(selected.date)],
                ['Time', `${formatTime(selected.startTime)} – ${formatTime(selected.endTime)}`],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="w-24 shrink-0 text-gray-500">{label}</span>
                  <span className="font-medium text-gray-800 break-words">{value}</span>
                </div>
              ))}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
