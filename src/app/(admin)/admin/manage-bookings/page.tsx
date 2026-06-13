'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Booking } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import { MeetingStatusBadge } from '@/components/ui/StatusBadge';
import { formatDate, formatTime, getMeetingStatus } from '@/lib/utils';
import { Plus, Pencil, Trash2, Search, CalendarDays, Clock, Building2, FileText, User } from 'lucide-react';
import { format } from 'date-fns';
import {
  deleteBookingAction,
  getBookingsAction,
  updateBookingAction,
} from '@/services/booking.service';
import { useToastStore } from '@/components/ui/Toast';

// ─── Form state shape ─────────────────
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

// ─── Page ───────────
export default function ManageBookingsPage() {
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);
  const [bookingList, setBookingList] = useState<Booking[]>([]);
  const [search, setSearch] = useState('');
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [deleteBooking, setDeleteBooking] = useState<Booking | null>(null);
  const [form, setForm] = useState<BookingForm>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadBookings() {
      setIsLoading(true);
      const result = await getBookingsAction();
      if (ignore) return;

      if (result.success) {
        setBookingList(result.bookings ?? []);
      } else {
        addToast(result.error ?? 'Failed to load bookings.', 'error');
      }

      setIsLoading(false);
    }

    void loadBookings();

    return () => {
      ignore = true;
    };
  }, [addToast]);

  // ─── Filtered list ────────────────────
  const filtered = useMemo(() => {
    if (!search) return bookingList;
    const q = search.toLowerCase();
    return bookingList.filter(
      (b) =>
        b.bookingCode.toLowerCase().includes(q) ||
        b.purpose.toLowerCase().includes(q) ||
        b.department?.name.toLowerCase().includes(q)
    );
  }, [bookingList, search]);

  // ─── Helpers ────────────────────────
  const fieldVal = (f: Partial<BookingForm>) =>
    setForm((prev) => ({ ...prev, ...f }));

  // ─── CRUD ────────────────────────────────
  const handleEdit = async () => {
    if (!editBooking) return;

    setIsSaving(true);
    const result = await updateBookingAction(editBooking.id, {
      departmentId: form.departmentId,
      description: form.purpose,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
    });
    setIsSaving(false);

    if (!result.success || !result.booking) {
      addToast(result.error ?? 'Failed to update booking.', 'error');
      return;
    }

    setBookingList((prev) => prev.map((b) => (b.id === editBooking.id ? result.booking! : b)));
    setEditBooking(null);
    addToast('Booking updated successfully.', 'success');
  };

  const handleDelete = async (b: Booking) => {
    setIsSaving(true);
    const result = await deleteBookingAction(b.id);
    setIsSaving(false);

    if (!result.success) {
      addToast(result.error ?? 'Failed to delete booking.', 'error');
      return;
    }

    setBookingList((prev) => prev.filter((x) => x.id !== b.id));
    setDeleteBooking(null);
    addToast('Booking deleted successfully.', 'success');
  };

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

  // ─── Shared form JSX ───────────────────────
  const bookingFormFields = (
    <div className="space-y-4">
      {/* Department */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Department</label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            id="form-department"
            type="text"
            disabled
            value={editBooking?.department?.name ?? 'Department'}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed select-none"
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
            value={editBooking?.user?.name ?? 'Admin User'}
            disabled
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed select-none"
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
            onChange={(e) => fieldVal({ date: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
              onChange={(e) => fieldVal({ startTime: e.target.value })}
              className="w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all"
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
              onChange={(e) => fieldVal({ endTime: e.target.value })}
              className="w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all"
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
            onChange={(e) => fieldVal({ purpose: e.target.value })}
            placeholder="Enter meeting description or agenda..."
            maxLength={250}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
          />
          <span className="absolute bottom-2.5 right-3 text-[10px] text-gray-400">
            {form.purpose.length} / 250
          </span>
        </div>
      </div>
    </div>
  );

  // ─── Render ───────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Admin Panel › Manage Bookings</p>
        <button
          id="add-booking-btn"
          onClick={() => router.push('/admin/manage-bookings/add-booking')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Booking
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          id="booking-search"
          type="text"
          placeholder="Search by booking ID, description or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* ── MOBILE: Card list ─────────────────────────────────────────── */}
      <div className="sm:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-10 text-center text-gray-400 text-sm">
            No bookings found.
          </div>
        ) : filtered.map((b) => {
          const status = getMeetingStatus(b.startTime, b.endTime);
          return (
            <div key={b.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{b.purpose}</p>
                  <p className="text-xs font-mono text-gray-400 mt-0.5">{b.bookingCode}</p>
                </div>
                <MeetingStatusBadge status={status} />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-500">
                <div><span className="block font-medium text-gray-700">Department</span>{b.department?.name}</div>
                <div><span className="block font-medium text-gray-700">Date</span>{formatDate(b.date)}</div>
                <div><span className="block font-medium text-gray-700">Time</span>{formatTime(b.startTime)} – {formatTime(b.endTime)}</div>
              </div>
              <div className="flex gap-2 pt-1 border-t border-gray-50">
                <button
                  id={`edit-booking-${b.id}`}
                  onClick={() => openEdit(b)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  id={`delete-booking-${b.id}`}
                  onClick={() => setDeleteBooking(b)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── DESKTOP: Table ────────────────────────────────────────────── */}
      <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            All Bookings{' '}
            <span className="text-sm font-normal text-gray-400">({filtered.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Booking ID', 'Department', 'Date & Time', 'Description', 'Status', 'Actions'].map(
                  (h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">No bookings found.</td>
                </tr>
              ) : (
                filtered.map((b) => {
                  const status = getMeetingStatus(b.startTime, b.endTime);
                  return (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-medium text-gray-700">{b.bookingCode}</td>
                      <td className="px-4 py-3 text-gray-600">{b.department?.name}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
                        <div>{formatDate(b.date)}</div>
                        <div className="text-gray-400">{formatTime(b.startTime)} – {formatTime(b.endTime)}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{b.purpose}</td>
                      <td className="px-4 py-3"><MeetingStatusBadge status={status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button id={`edit-booking-${b.id}`} onClick={() => openEdit(b)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button id={`delete-booking-${b.id}`} onClick={() => setDeleteBooking(b)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal open={!!editBooking} onClose={() => setEditBooking(null)} title="Edit Booking" size="md">
        <div className="space-y-5">
          {bookingFormFields}
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setEditBooking(null)}
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              id="save-edit-booking-btn"
              onClick={handleEdit}
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteBooking} onClose={() => setDeleteBooking(null)} title="Delete Booking" size="sm">
        {deleteBooking && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Delete booking{' '}
              <span className="font-semibold text-gray-800">{deleteBooking.bookingCode}</span> —{' '}
              <span className="italic">{deleteBooking.purpose}</span>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteBooking(null)}
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                id={`confirm-delete-booking-${deleteBooking.id}`}
                onClick={() => handleDelete(deleteBooking)}
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                {isSaving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
