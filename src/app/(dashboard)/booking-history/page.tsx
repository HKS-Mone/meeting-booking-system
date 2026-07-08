'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import type { Booking, MeetingStatus } from '@/lib/types';
import { getMeetingStatus, formatDate, formatTime } from '@/lib/utils';
import { MeetingStatusBadge } from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { Eye, Plus, Pencil, Trash2, CalendarDays, Clock, Building2, FileText, User } from 'lucide-react';
import { useAuth } from '../../../../hook/useAuth';
import { useBooking } from '../../../../hook/useBooking';
import { useInfiniteScroll } from '../../../../hook/useInfiniteScroll';
import { useToastStore } from '@/components/ui/Toast';

type StatusFilter = '' | MeetingStatus;

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: 'All Status', value: '' },
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'Ongoing', value: 'ONGOING' },
  { label: 'Complete', value: 'COMPLETE' },
];

const PAGE_SIZE = 20;

const STATUS_ORDER: Record<MeetingStatus, number> = { ONGOING: 0, UPCOMING: 1, COMPLETE: 2 };

interface BookingForm {
  departmentId: string;
  purpose: string;
  date: string;
  startTime: string;
  endTime: string;
}

const EMPTY_FORM: BookingForm = {
  departmentId: '',
  purpose: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  startTime: '09:00',
  endTime: '10:00',
};

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function bookingTimeToMinutes(iso: string): number {
  const date = new Date(iso);
  return date.getHours() * 60 + date.getMinutes();
}

export default function BookingHistoryPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { bookings, isLoading, loadBookings, updateBooking, deleteBooking } = useBooking();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selected, setSelected] = useState<Booking | null>(null);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);
  const [form, setForm] = useState<BookingForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    loadBookings().catch((err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to load bookings.';
      addToast(message, 'error');
    });
  }, [loadBookings, addToast]);


  const withStatus = useMemo(
    () => bookings.map((booking) => ({ booking, status: getMeetingStatus(booking.startTime, booking.endTime) })),
    [bookings],
  );


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
        return a.status === 'COMPLETE'
          ? b.booking.startTime.localeCompare(a.booking.startTime)
          : a.booking.startTime.localeCompare(b.booking.startTime);
      })
      .map(({ booking }) => booking);
  }, [withStatus, statusFilter, fromDate, toDate]);


  const { visibleCount, hasMore, sentinelRef } = useInfiniteScroll(
    filtered.length,
    PAGE_SIZE,
    `${statusFilter}|${fromDate}|${toDate}`,
  );
  const visibleBookings = filtered.slice(0, visibleCount);

  const handleFilterChange = (newStatus: StatusFilter) => {
    setStatusFilter(newStatus);
  };

  const isOwnBooking = (b: Booking) => !!currentUser && b.userId === currentUser.id;

  // ─── Edit / Delete ──────────────────────────────────────────────────────────
  const overlappingBooking = useMemo(() => {
    if (!editBooking) return null;

    const start = timeToMinutes(form.startTime);
    const end = timeToMinutes(form.endTime);
    if (start >= end) return null;

    return (
      bookings.find((booking) => {
        if (booking.id === editBooking.id || booking.date !== form.date) return false;

        const existingStart = bookingTimeToMinutes(booking.startTime);
        const existingEnd = bookingTimeToMinutes(booking.endTime);
        return start < existingEnd && end > existingStart;
      }) ?? null
    );
  }, [bookings, editBooking, form.date, form.endTime, form.startTime]);

  const openEdit = (b: Booking) => {
    setForm({
      departmentId: b.departmentId,
      purpose: b.purpose,
      date: b.date,
      startTime: format(new Date(b.startTime), 'HH:mm'),
      endTime: format(new Date(b.endTime), 'HH:mm'),
    });
    setEditBooking(b);
  };

  const handleEdit = async () => {
    if (!editBooking) return;

    if (timeToMinutes(form.startTime) >= timeToMinutes(form.endTime)) {
      addToast('End time must be after start time.', 'error');
      return;
    }

    if (overlappingBooking) {
      addToast(`This time overlaps with booking ${overlappingBooking.bookingCode}.`, 'error');
      return;
    }

    setIsSaving(true);
    try {
      await updateBooking(editBooking.id, {
        departmentId: form.departmentId,
        description: form.purpose,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
      });
      setEditBooking(null);
      addToast('Booking updated successfully.', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update booking.';
      addToast(message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (b: Booking) => {
    setIsSaving(true);
    try {
      await deleteBooking(b.id);
      setDeleteTarget(null);
      addToast('Booking deleted successfully.', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete booking.';
      addToast(message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Input style ──────────────────────────
  const inputCls = 'w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-end">
        <button
          id="add-booking-btn"
          onClick={() => router.push('/booking-history/add-booking')}
          className="group flex items-center gap-2 px-5 py-2.5 md:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-200 active:scale-95"
        >
          <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
          New Booking
        </button>
      </div>

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
          onChange={(e) => setFromDate(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          id="booking-to-date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
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
        {visibleBookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-10 text-center text-gray-400 text-sm">
            No bookings found.
          </div>
        ) : visibleBookings.map((b) => {
          const status = getMeetingStatus(b.startTime, b.endTime);
          const own = isOwnBooking(b);
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
              <div className="flex justify-end gap-2 pt-1 border-t border-gray-50">
                {own && (
                  <>
                    <button
                      id={`edit-booking-${b.id}`}
                      onClick={() => openEdit(b)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      id={`delete-booking-${b.id}`}
                      onClick={() => setDeleteTarget(b)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </>
                )}
                <button
                  id={`view-booking-${b.id}`}
                  onClick={() => setSelected(b)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
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
                {['Department', 'Date', 'Time', 'Description', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visibleBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                    No bookings found.
                  </td>
                </tr>
              ) : visibleBookings.map((b) => {
                const status = getMeetingStatus(b.startTime, b.endTime);
                const own = isOwnBooking(b);
                return (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600">{b.department?.name}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(b.date)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatTime(b.startTime)} – {formatTime(b.endTime)}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[130px] truncate">{b.purpose}</td>
                    <td className="px-4 py-3"><MeetingStatusBadge status={status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          id={`view-booking-${b.id}`}
                          onClick={() => setSelected(b)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {own && (
                          <>
                            <button
                              id={`edit-booking-${b.id}`}
                              onClick={() => openEdit(b)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              id={`delete-booking-${b.id}`}
                              onClick={() => setDeleteTarget(b)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Infinite-scroll sentinel — loads the next 20 rows when it enters view */}
      {hasMore && (
        <div ref={sentinelRef} className="flex items-center justify-center py-4 text-xs text-gray-400">
          Loading more…
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

      {/* Edit Modal */}
      <Modal open={!!editBooking} onClose={() => setEditBooking(null)} title="Edit Booking" size="md">
        <div className="space-y-5">
          <div className="space-y-4">
            {/* Department (locked) */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="form-department"
                  type="text"
                  disabled
                  value={editBooking?.department?.name ?? 'Department'}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed select-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  locked
                </span>
              </div>
            </div>

            {/* Booked By (locked) */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Booked By</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="form-user"
                  type="text"
                  value={editBooking?.user?.name ?? currentUser?.name ?? 'You'}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed select-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  locked
                </span>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="form-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Start & End Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    id="form-start-time"
                    value={form.startTime}
                    onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                    className={`${inputCls} pr-8 appearance-none bg-white`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                    }}
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hh = String(i).padStart(2, '0');
                      return (
                        <option key={`${hh}:00`} value={`${hh}:00`}>
                          {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    id="form-end-time"
                    value={form.endTime}
                    onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                    className={`${inputCls} pr-8 appearance-none bg-white`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                    }}
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hh = String(i).padStart(2, '0');
                      return (
                        <option key={`${hh}:00`} value={`${hh}:00`}>
                          {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                <textarea
                  id="form-purpose"
                  rows={3}
                  value={form.purpose}
                  onChange={(e) => setForm((prev) => ({ ...prev, purpose: e.target.value }))}
                  placeholder="Enter meeting description or agenda..."
                  maxLength={250}
                  className={`${inputCls} resize-none`}
                />
                <span className="absolute bottom-2.5 right-3 text-[10px] text-gray-400">
                  {form.purpose.length} / 250
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setEditBooking(null)}
              disabled={isSaving}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-all duration-150 active:scale-95"
            >
              Cancel
            </button>
            <button
              id="save-edit-booking-btn"
              onClick={handleEdit}
              disabled={isSaving}
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin-smooth" />
                  Saving…
                </span>
              ) : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Booking" size="sm">
        {deleteTarget && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Delete booking{' '}
              <span className="font-semibold text-gray-800">{deleteTarget.bookingCode}</span> —{' '}
              <span className="italic">{deleteTarget.purpose}</span>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-all duration-150 active:scale-95"
              >
                Cancel
              </button>
              <button
                id={`confirm-delete-booking-${deleteTarget.id}`}
                onClick={() => handleDelete(deleteTarget)}
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md hover:shadow-red-200"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin-smooth" />
                    Deleting…
                  </span>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
