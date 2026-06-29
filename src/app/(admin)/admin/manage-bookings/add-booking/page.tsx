'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatTime } from '@/lib/utils';
import { format } from 'date-fns';
import { useAuth } from '../../../../../../hook/useAuth';
import {
  createBookingAction,
  getBookingsByDateAction,
} from '@/services/booking.service';
import { getDepartments } from '@/services/user.service';
import { useToastStore } from '@/components/ui/Toast';
import type { Booking, Department } from '@/lib/types';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Building2,
} from 'lucide-react';

// ─── Form state ───────────────────────────────────────────────────────────────
interface BookingForm {
  departmentId: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
}

const today = format(new Date(), 'yyyy-MM-dd');
const START_HOUR = 6;
const END_HOUR = 19;

function formatSlotLabel(slot: string): string {
  const [hStr, mStr] = slot.split(':');
  const h = parseInt(hStr);
  const m = mStr === '30' ? '30' : '00';
  const suffix = h < 12 ? 'AM' : 'PM';
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}:${m} ${suffix}`;
}

const TIME_SLOTS: string[] = [];
for (let h = START_HOUR; h <= END_HOUR; h++) {
  TIME_SLOTS.push(String(h).padStart(2, '0') + ':00');
  if (h < END_HOUR) {
    TIME_SLOTS.push(String(h).padStart(2, '0') + ':30');
  }
}

const EMPTY_FORM: BookingForm = {
  departmentId: '',
  description: '',
  date: today,
  startTime: '09:00',
  endTime: '10:00',
};

const CARD_COLORS = [
  { bg: 'bg-blue-50', border: 'border-blue-100', dot: 'bg-blue-500', text: 'text-blue-600' },
  { bg: 'bg-green-50', border: 'border-green-100', dot: 'bg-green-500', text: 'text-green-600' },
  { bg: 'bg-purple-50', border: 'border-purple-100', dot: 'bg-purple-500', text: 'text-purple-600' },
  { bg: 'bg-orange-50', border: 'border-orange-100', dot: 'bg-orange-400', text: 'text-orange-600' },
  { bg: 'bg-cyan-50', border: 'border-cyan-100', dot: 'bg-cyan-500', text: 'text-cyan-600' },
  { bg: 'bg-pink-50', border: 'border-pink-100', dot: 'bg-pink-500', text: 'text-pink-600' },
  { bg: 'bg-indigo-50', border: 'border-indigo-100', dot: 'bg-indigo-500', text: 'text-indigo-600' },
  { bg: 'bg-teal-50', border: 'border-teal-100', dot: 'bg-teal-500', text: 'text-teal-600' },
];

export default function AddBookingPage() {
  const router = useRouter();
  const { currentUser, isCheckingSession } = useAuth();
  const addToast = useToastStore((state) => state.addToast);
  const [form, setForm] = useState<BookingForm>(EMPTY_FORM);
  const [calDate, setCalDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todaysBookings, setTodaysBookings] = useState<Booking[]>([]);
  const [deptsList, setDeptsList] = useState<Department[]>([]);
  const canUsePage = !isCheckingSession && Boolean(currentUser);

  useEffect(() => {
    if (isCheckingSession) return;
    if (!canUsePage || !currentUser) {
      router.replace('/login');
    }
  }, [canUsePage, currentUser, isCheckingSession, router]);

  useEffect(() => {
    if (!canUsePage) return;
    let ignore = false;

    getDepartments()
      .then((list) => {
        if (!ignore) setDeptsList(list);
      })
      .catch(() => {
        if (!ignore) addToast('Failed to load departments.', 'error');
      });

    return () => {
      ignore = true;
    };
  }, [addToast, canUsePage]);

  useEffect(() => {
    if (!canUsePage) return;
    let ignore = false;

    const dateStr = format(calDate, 'yyyy-MM-dd');
    getBookingsByDateAction(dateStr).then((result) => {
      if (ignore) return;

      if (result.success) {
        setTodaysBookings(result.bookings ?? []);
      } else {
        addToast(result.error ?? 'Failed to load bookings.', 'error');
      }
    });

    return () => {
      ignore = true;
    };
  }, [addToast, calDate, canUsePage]);

  const fieldVal = (f: Partial<BookingForm>) => {
    setForm((prev) => {
      const next = { ...prev, ...f };
      if (next.startTime >= next.endTime) {
        const startIdx = TIME_SLOTS.indexOf(next.startTime);
        const nextIdx = Math.min(startIdx + 1, TIME_SLOTS.length - 1);
        next.endTime = TIME_SLOTS[nextIdx];
      }
      return next;
    });
    if (f.date) {
      setCalDate(new Date(`${f.date}T00:00:00`));
    }
  };

  const calDateLabel = format(calDate, 'MMM d, yyyy');
  const selectedDepartmentId =
    form.departmentId || currentUser?.departmentId || deptsList[0]?.id || '';

  const shiftDate = (delta: number) => {
    setCalDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + delta);
      return d;
    });
  };

  const goToday = () => setCalDate(new Date());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canUsePage || !currentUser) {
      router.replace('/login');
      return;
    }

    if (!selectedDepartmentId) {
      addToast('Please select a department.', 'error');
      return;
    }

    if (!form.date) {
      addToast('Please select a date.', 'error');
      return;
    }

    if (!form.startTime || !form.endTime) {
      addToast('Please select start and end time.', 'error');
      return;
    }

    if (form.startTime >= form.endTime) {
      addToast('End time must be after start time.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createBookingAction({
        departmentId: selectedDepartmentId,
        description: form.description,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        userId: String(currentUser.id),
      });
      if (!result.success) {
        addToast(result.error ?? 'Failed to create booking.', 'error');
        return;
      }
      addToast('Booking created successfully.', 'success');
    } catch {
      addToast('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/manage-bookings');
  };

  if (isCheckingSession) {
    return (
      <div className="flex min-h-[280px] items-center justify-center text-sm text-gray-500">
        Loading booking form...
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <button
          type="button"
          onClick={handleCancel}
          className="hover:text-gray-700 transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Manage Bookings
        </button>
        <span>/</span>
        <span className="text-gray-700 font-medium">Add New Booking</span>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── LEFT PANEL: Form ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Card header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-50">
            <h1 className="text-base font-bold text-gray-800">Add New Meeting Booking</h1>
          </div>

          <form onSubmit={handleSubmit} id="add-booking-form" noValidate className="p-6 space-y-5">
            {/* Date */}
            <div className="space-y-1.5">
              <label htmlFor="ab-date" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="ab-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => fieldVal({ date: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Start / End Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="ab-start" className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    id="ab-start"
                    value={form.startTime}
                    onChange={(e) => fieldVal({ startTime: e.target.value })}
                    className="w-full pl-10 pr-8 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                    }}
                  >
                    {TIME_SLOTS.slice(0, -1).map((slot) => (
                      <option key={slot} value={slot}>
                        {formatSlotLabel(slot)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="ab-end" className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    id="ab-end"
                    value={form.endTime}
                    onChange={(e) => fieldVal({ endTime: e.target.value })}
                    className="w-full pl-10 pr-8 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                    }}
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {formatSlotLabel(slot)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <label htmlFor="ab-department" className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  id="ab-department"
                  value={selectedDepartmentId}
                  onChange={(e) => fieldVal({ departmentId: e.target.value })}
                  className="w-full pl-10 pr-8 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                  }}
                >
                  {deptsList.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="ab-description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="ab-description"
                  type="text"
                  value={form.description}
                  onChange={(e) => fieldVal({ description: e.target.value })}
                  placeholder="Enter meeting description..."
                  maxLength={250}
                  required={false}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                id="cancel-add-booking-btn"
                onClick={handleCancel}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="submit-add-booking-btn"
                disabled={isSubmitting || !canUsePage}
                className="flex-1 py-3 rounded-xl text-white text-sm font-semibold transition-all duration-150 hover:shadow-lg hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Book Meeting'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ── RIGHT PANEL: Today's Booked Meetings ───────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          {/* Panel header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-50">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-800">Booked Meetings</h2>
                <p className="text-xs text-gray-400 mt-0.5">{calDateLabel}</p>
              </div>

              {/* Calendar nav */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  id="cal-prev-btn"
                  onClick={() => shiftDate(-1)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>
                <button
                  type="button"
                  id="cal-next-btn"
                  onClick={() => shiftDate(1)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </button>
                <button
                  type="button"
                  id="cal-today-btn"
                  onClick={goToday}
                  className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
                >
                  Today
                </button>
              </div>
            </div>
          </div>

          {/* Bookings list */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-h-[560px]">
            {todaysBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <CalendarDays className="w-8 h-8 text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">No meetings booked for this day.</p>
              </div>
            ) : (
              todaysBookings.map((b, idx) => {
                const color = CARD_COLORS[idx % CARD_COLORS.length];
                return (
                  <div
                    key={b.id}
                    className={`flex items-start gap-3 p-5 rounded-xl border ${color.bg} ${color.border} group`}
                  >
                    {/* Time label */}
                    <div className="shrink-0 text-xs text-gray-400 w-14 pt-0.5 leading-tight">
                      {formatTime(b.startTime)}
                    </div>

                    {/* Dot + info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${color.dot}`} />
                        <p className={`font-semibold text-sm ${color.text} truncate`}>{b.department?.name}</p>
                      </div>
                      <p className="text-xs text-gray-500 pl-4">
                        {formatTime(b.startTime)} – {formatTime(b.endTime)}
                        {b.purpose && (
                          <span className="before:content-['•'] before:mx-1.5 before:text-gray-300">
                            {b.purpose}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* More button */}
                    <button
                      type="button"
                      className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:bg-white/60 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="More options"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
