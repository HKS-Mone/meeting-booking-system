'use client';

import { useState, useMemo } from 'react';
import { bookings } from '@/lib/mock-data';
import { MeetingStatus } from '@/lib/types';
import { getMeetingStatus, formatDate, formatTime } from '@/lib/utils';
import { MeetingStatusBadge } from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { Search, Eye } from 'lucide-react';
import { format } from 'date-fns';

type StatusFilter = '' | MeetingStatus;

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: 'All Status', value: '' },
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'Ongoing', value: 'ONGOING' },
  { label: 'Complete', value: 'COMPLETE' },
];

const ITEMS_PER_PAGE = 10;

export default function BookingHistoryPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<(typeof bookings)[0] | null>(null);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const meetingStatus = getMeetingStatus(b.startTime, b.endTime);
      const matchSearch =
        !search ||
        b.room?.name.toLowerCase().includes(search.toLowerCase()) ||
        b.purpose.toLowerCase().includes(search.toLowerCase()) ||
        b.bookingCode.toLowerCase().includes(search.toLowerCase()) ||
        b.department?.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || meetingStatus === statusFilter;
      const matchFrom = !fromDate || b.date >= fromDate;
      const matchTo = !toDate || b.date <= toDate;
      return matchSearch && matchStatus && matchFrom && matchTo;
    });
  }, [search, statusFilter, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFilterChange = (newStatus: StatusFilter) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="booking-search"
            type="text"
            placeholder="Search by room, purpose, code or department…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          id="booking-status-filter"
          value={statusFilter}
          onChange={(e) => handleFilterChange(e.target.value as StatusFilter)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          id="booking-to-date"
          value={toDate}
          onChange={(e) => { setToDate(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            Meeting Bookings{' '}
            <span className="text-sm font-normal text-gray-400">({filtered.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Booking ID', 'Room', 'Department', 'Date', 'Time', 'Purpose', 'Status', 'Details'].map((h) => (
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
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">
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
                      <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">
                        {b.purpose}
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
              {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
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
      </div>

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Booking Details" size="md">
        {selected && (() => {
          const status = getMeetingStatus(selected.startTime, selected.endTime);
          return (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
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
    </div>
  );
}
