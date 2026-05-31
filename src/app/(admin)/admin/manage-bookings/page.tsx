'use client';

import { useState, useMemo } from 'react';
import {
  bookings as initialBookings,
  rooms,
  departments,
  users,
} from '@/lib/mock-data';
import { Booking } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import { MeetingStatusBadge } from '@/components/ui/StatusBadge';
import { formatDate, formatTime, getMeetingStatus } from '@/lib/utils';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { format } from 'date-fns';

// ─── Form state shape ─────────────────────────────────────────────────────────
interface BookingForm {
  roomId: string;
  departmentId: string;
  userId: string;
  purpose: string;
  participants: string;
  date: string;
  startTime: string;
  endTime: string;
}

const EMPTY_FORM: BookingForm = {
  roomId: rooms[0]?.id ?? '',
  departmentId: departments[0]?.id ?? '',
  userId: users[0]?.id ?? '',
  purpose: '',
  participants: '1',
  date: format(new Date(), 'yyyy-MM-dd'),
  startTime: '09:00',
  endTime: '10:00',
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ManageBookingsPage() {
  const [bookingList, setBookingList] = useState<Booking[]>(initialBookings);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [deleteBooking, setDeleteBooking] = useState<Booking | null>(null);
  const [form, setForm] = useState<BookingForm>(EMPTY_FORM);

  // ─── Filtered list ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return bookingList;
    const q = search.toLowerCase();
    return bookingList.filter(
      (b) =>
        b.bookingCode.toLowerCase().includes(q) ||
        b.purpose.toLowerCase().includes(q) ||
        b.room?.name.toLowerCase().includes(q) ||
        b.department?.name.toLowerCase().includes(q)
    );
  }, [bookingList, search]);

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const fieldVal = (f: Partial<BookingForm>) =>
    setForm((prev) => ({ ...prev, ...f }));

  const buildBooking = (f: BookingForm, id?: string, code?: string): Booking => {
    const room = rooms.find((r) => r.id === f.roomId)!;
    const department = departments.find((d) => d.id === f.departmentId)!;
    const user = users.find((u) => u.id === f.userId)!;
    const startIso = new Date(`${f.date}T${f.startTime}:00`).toISOString();
    const endIso = new Date(`${f.date}T${f.endTime}:00`).toISOString();
    const newId = id ?? `bk-${Date.now()}`;
    const newCode = code ?? `BK-${Date.now().toString().slice(-4)}`;
    return {
      id: newId,
      bookingCode: newCode,
      userId: user.id,
      user,
      roomId: room.id,
      room,
      departmentId: department.id,
      department,
      purpose: f.purpose,
      participants: Number(f.participants),
      startTime: startIso,
      endTime: endIso,
      date: f.date,
      createdAt: new Date().toISOString(),
    };
  };

  // ─── CRUD ─────────────────────────────────────────────────────────────────
  const handleAdd = () => {
    if (!form.purpose.trim()) return;
    const newBooking = buildBooking(form);
    setBookingList((prev) => [newBooking, ...prev]);
    setForm(EMPTY_FORM);
    setAddOpen(false);
  };

  const handleEdit = () => {
    if (!editBooking || !form.purpose.trim()) return;
    const updated = buildBooking(form, editBooking.id, editBooking.bookingCode);
    setBookingList((prev) => prev.map((b) => (b.id === editBooking.id ? updated : b)));
    setEditBooking(null);
  };

  const handleDelete = (b: Booking) => {
    setBookingList((prev) => prev.filter((x) => x.id !== b.id));
    setDeleteBooking(null);
  };

  const openEdit = (b: Booking) => {
    setForm({
      roomId: b.roomId,
      departmentId: b.departmentId,
      userId: b.userId,
      purpose: b.purpose,
      participants: String(b.participants),
      date: b.date,
      startTime: format(new Date(b.startTime), 'HH:mm'),
      endTime: format(new Date(b.endTime), 'HH:mm'),
    });
    setEditBooking(b);
  };

  // ─── Shared form JSX ──────────────────────────────────────────────────────
  const BookingFormFields = () => (
    <div className="space-y-4">
      {/* Room */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Room</label>
          <select
            id="form-room"
            value={form.roomId}
            onChange={(e) => fieldVal({ roomId: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
          <select
            id="form-department"
            value={form.departmentId}
            onChange={(e) => fieldVal({ departmentId: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Booked by */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Booked By</label>
        <select
          id="form-user"
          value={form.userId}
          onChange={(e) => fieldVal({ userId: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name} ({u.department?.name})</option>
          ))}
        </select>
      </div>

      {/* Purpose */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Purpose</label>
        <input
          id="form-purpose"
          type="text"
          value={form.purpose}
          onChange={(e) => fieldVal({ purpose: e.target.value })}
          placeholder="e.g. Quarterly Review"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Participants + Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Participants</label>
          <input
            id="form-participants"
            type="number"
            min="1"
            value={form.participants}
            onChange={(e) => fieldVal({ participants: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
          <input
            id="form-date"
            type="date"
            value={form.date}
            onChange={(e) => fieldVal({ date: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Start / End Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
          <input
            id="form-start-time"
            type="time"
            value={form.startTime}
            onChange={(e) => fieldVal({ startTime: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
          <input
            id="form-end-time"
            type="time"
            value={form.endTime}
            onChange={(e) => fieldVal({ endTime: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Admin Panel › Manage Bookings</p>
        <button
          id="add-booking-btn"
          onClick={() => { setForm(EMPTY_FORM); setAddOpen(true); }}
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
          placeholder="Search by booking ID, purpose, room or department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            All Bookings{' '}
            <span className="text-sm font-normal text-gray-400">({filtered.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Booking ID', 'Room', 'Department', 'Date & Time', 'Purpose', 'Participants', 'Status', 'Actions'].map(
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => {
                  const status = getMeetingStatus(b.startTime, b.endTime);
                  return (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-medium text-gray-700">
                        {b.bookingCode}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{b.room?.name}</td>
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
                        <MeetingStatusBadge status={status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button
                            id={`edit-booking-${b.id}`}
                            onClick={() => openEdit(b)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`delete-booking-${b.id}`}
                            onClick={() => setDeleteBooking(b)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
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

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New Booking" size="md">
        <div className="space-y-5">
          <BookingFormFields />
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setAddOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              id="save-new-booking-btn"
              onClick={handleAdd}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Create Booking
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editBooking} onClose={() => setEditBooking(null)} title="Edit Booking" size="md">
        <div className="space-y-5">
          <BookingFormFields />
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setEditBooking(null)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              id="save-edit-booking-btn"
              onClick={handleEdit}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Save Changes
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
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                id={`confirm-delete-booking-${deleteBooking.id}`}
                onClick={() => handleDelete(deleteBooking)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
