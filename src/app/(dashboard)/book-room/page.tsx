'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { rooms, departments, bookings } from '@/lib/mock-data';
import { useAuthStore } from '@/lib/auth-store';
import { useToastStore } from '@/components/ui/Toast';
import { ToastContainer } from '@/components/ui/Toast';
import { getDurationLabel } from '@/lib/utils';
import { ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function BookRoomPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { addToast } = useToastStore();

  const preselectedRoomId = searchParams.get('roomId') ?? '';

  const [form, setForm] = useState({
    departmentId: currentUser?.departmentId ?? '',
    roomId: preselectedRoomId,
    date: new Date().toISOString().slice(0, 10),
    startTime: '09:00',
    endTime: '10:30',
    purpose: '',
    participants: '',
  });

  const [availability, setAvailability] = useState<null | 'available' | 'conflict'>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedRoom = rooms.find((r) => r.id === form.roomId);

  const duration = form.startTime && form.endTime
    ? getDurationLabel(
        `${form.date}T${form.startTime}:00`,
        `${form.date}T${form.endTime}:00`
      )
    : '—';

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setAvailability(null);
  };

  const handleCheckAvailability = () => {
    if (!form.roomId || !form.date || !form.startTime || !form.endTime) {
      addToast('Please select a room, date, and time first.', 'warning');
      return;
    }
    const slotStart = new Date(`${form.date}T${form.startTime}:00`);
    const slotEnd = new Date(`${form.date}T${form.endTime}:00`);

    if (slotEnd <= slotStart) {
      addToast('End time must be after start time.', 'error');
      return;
    }

    const conflict = bookings.some((b) => {
      if (b.roomId !== form.roomId || b.date !== form.date) return false;
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);
      return bStart < slotEnd && bEnd > slotStart;
    });
    setAvailability(conflict ? 'conflict' : 'available');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.purpose) { addToast('Please enter a meeting purpose.', 'error'); return; }
    if (!form.participants) { addToast('Please enter participant count.', 'error'); return; }
    if (selectedRoom && Number(form.participants) > selectedRoom.capacity) {
      addToast(`Participants exceed room capacity (${selectedRoom.capacity}).`, 'error');
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    addToast('Booking submitted successfully! Awaiting approval.', 'success');
    setTimeout(() => router.push('/booking-history'), 1500);
  };

  return (
    <>
      <ToastContainer />
      <div className="space-y-5">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-800 font-medium">Book Meeting Room</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Booking form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5"
          >
            <h2 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-4">
              Booking Details
            </h2>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Department
              </label>
              <select
                id="book-department"
                name="departmentId"
                value={form.departmentId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Room */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Room</label>
              <select
                id="book-room"
                name="roomId"
                value={form.roomId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Room</option>
                {rooms
                  .filter((r) => r.status === 'AVAILABLE')
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (Cap: {r.capacity})
                    </option>
                  ))}
              </select>
            </div>

            {/* Date + Times row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                <input
                  type="date"
                  id="book-date"
                  name="date"
                  value={form.date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
                <input
                  type="time"
                  id="book-start-time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
                <input
                  type="time"
                  id="book-end-time"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Purpose / Meeting Title
              </label>
              <input
                type="text"
                id="book-purpose"
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                placeholder="Enter meeting purpose or title"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Participants */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Participants
              </label>
              <input
                type="number"
                id="book-participants"
                name="participants"
                value={form.participants}
                onChange={handleChange}
                placeholder="Number of participants"
                min="1"
                max={selectedRoom?.capacity ?? 999}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {selectedRoom && (
                <p className="text-xs text-gray-400 mt-1">
                  Room capacity: {selectedRoom.capacity} people
                </p>
              )}
            </div>

            {/* Availability result */}
            {availability && (
              <div
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm ${
                  availability === 'available'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                {availability === 'available' ? (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                {availability === 'available'
                  ? 'Room is available for the selected time slot!'
                  : 'There is a conflict! The room is already booked for part of this time.'}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                id="check-availability-btn"
                onClick={handleCheckAvailability}
                className="flex-1 py-2.5 rounded-xl border border-blue-200 text-blue-600 font-medium text-sm hover:bg-blue-50 transition-colors"
              >
                Check Availability
              </button>
              <button
                type="button"
                onClick={() => router.push('/meeting-rooms')}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Right: Summary panel */}
          <div className="bg-blue-600 rounded-xl shadow-sm p-6 text-white self-start">
            <h3 className="font-semibold text-base mb-5 pb-4 border-b border-white/20">
              Booking Summary
            </h3>
            <div className="space-y-4 text-sm">
              {[
                { label: 'Room', value: selectedRoom?.name ?? '—' },
                { label: 'Date', value: form.date || '—' },
                { label: 'Time', value: form.startTime && form.endTime ? `${form.startTime} – ${form.endTime}` : '—' },
                { label: 'Duration', value: duration },
                {
                  label: 'Department',
                  value: departments.find((d) => d.id === form.departmentId)?.name ?? '—',
                },
                { label: 'Participants', value: form.participants || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-white/70">{label}</span>
                  <span className="font-medium text-right">{value}</span>
                </div>
              ))}
            </div>

            <button
              id="confirm-booking-btn"
              onClick={handleSubmit as any}
              disabled={submitting || availability === 'conflict'}
              className="mt-6 w-full py-3 rounded-xl bg-white text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
