'use client';

import { useState, useMemo } from 'react';
import { bookings } from '@/lib/mock-data';
import { BookingStatus } from '@/lib/types';
import BookingHistoryTable from '@/components/booking/BookingHistoryTable';
import { Search } from 'lucide-react';

const STATUS_OPTIONS: { label: string; value: '' | BookingStatus }[] = [
  { label: 'All Status', value: '' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Rejected', value: 'REJECTED' },
];

export default function BookingHistoryPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | BookingStatus>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Use all bookings (in a real app, filter by current user)
  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchSearch =
        !search ||
        b.room?.name.toLowerCase().includes(search.toLowerCase()) ||
        b.purpose.toLowerCase().includes(search.toLowerCase()) ||
        b.bookingCode.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || b.status === statusFilter;
      const matchFrom = !fromDate || b.date >= fromDate;
      const matchTo = !toDate || b.date <= toDate;
      return matchSearch && matchStatus && matchFrom && matchTo;
    });
  }, [search, statusFilter, fromDate, toDate]);

  return (
    <div className="space-y-5">
      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="booking-search"
            type="text"
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          id="booking-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as '' | BookingStatus)}
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
          onChange={(e) => setFromDate(e.target.value)}
          placeholder="From date"
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          id="booking-to-date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          placeholder="To date"
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            My Bookings{' '}
            <span className="text-sm font-normal text-gray-400">({filtered.length})</span>
          </h2>
        </div>
        <BookingHistoryTable bookings={filtered} />
      </div>
    </div>
  );
}
