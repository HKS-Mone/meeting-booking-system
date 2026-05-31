'use client';

import { useState, useMemo } from 'react';
import { bookings } from '@/lib/mock-data';
import { BookingStatus } from '@/lib/types';
import BookingApprovalTable from '@/components/admin/BookingApprovalTable';

const STATUS_OPTIONS: { label: string; value: '' | BookingStatus }[] = [
  { label: 'All Status', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export default function BookingApprovalPage() {
  const [statusFilter, setStatusFilter] = useState<'' | BookingStatus>('');

  const filtered = useMemo(() => {
    if (!statusFilter) return bookings;
    return bookings.filter((b) => b.status === statusFilter);
  }, [statusFilter]);

  return (
    <div className="space-y-5">
      {/* Breadcrumb label */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Admin Panel › Booking Approval</p>
        </div>
        <select
          id="approval-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as '' | BookingStatus)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            All Bookings{' '}
            <span className="text-sm font-normal text-gray-400">({filtered.length})</span>
          </h2>
        </div>
        <BookingApprovalTable initialBookings={filtered} showAll />
      </div>
    </div>
  );
}
