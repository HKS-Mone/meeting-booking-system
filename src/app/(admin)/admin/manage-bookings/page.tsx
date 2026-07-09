'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Booking, Department, MeetingStatus } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import { MeetingStatusBadge } from '@/components/ui/StatusBadge';
import { formatDate, formatTime, getMeetingStatus } from '@/lib/utils';
import {
  Plus, Pencil, Trash2, Search, CalendarDays, Clock, Building2, FileText, User,
  Eye, ChevronLeft, ChevronRight,
  CalendarCheck, CircleCheckBig, PlayCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  deleteBookingAction,
  getBookingsAction,
  updateBookingAction,
} from '@/services/booking.service';
import { getDepartments } from '@/services/user.service';
import { useToastStore } from '@/components/ui/Toast';
import { staggerStyle, staggerClass } from '@/lib/animations';

// ─── Filter option types ──────────────────────────────────────────────────────
type StatusFilter = 'ALL' | MeetingStatus;
type SortOption = 'NEWEST' | 'OLDEST';
type ViewMode = 'list' | 'grid';

const PAGE_SIZE_OPTIONS = [5, 10, 20];
const MS_PER_DAY = 24 * 60 * 60 * 1000;

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

// ─── Left-border accent + tab styling per status ──────────────────────────────
const STATUS_ACCENT: Record<MeetingStatus, string> = {
  COMPLETE: 'border-l-emerald-500',
  UPCOMING: 'border-l-amber-500',
  ONGOING: 'border-l-blue-500',
};

// ─── Time helpers ─────────────────────
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function bookingTimeToMinutes(iso: string): number {
  const date = new Date(iso);
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Build a compact page-number sequence with ellipses (e.g. 1 … 4 5 6 … 10).
 */
function getPaginationRange(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 'ellipsis', total];
  if (current >= total - 2) return [1, 'ellipsis', total - 2, total - 1, total];
  return [1, 'ellipsis', current, 'ellipsis', total];
}

export default function ManageBookingsPage() {
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);

  const [bookingList, setBookingList] = useState<Booking[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ─── Filters, sort, view, pagination ────
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('NEWEST');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [prevFilterKey, setPrevFilterKey] = useState('');

  // ─── Modals ─────────────────────────────
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [deleteBooking, setDeleteBooking] = useState<Booking | null>(null);
  const [form, setForm] = useState<BookingForm>(EMPTY_FORM);

  // ─── Load bookings + departments ────────
  useEffect(() => {
    let ignore = false;

    async function loadData() {
      setIsLoading(true);
      const [bookingsResult, deptList] = await Promise.all([
        getBookingsAction(),
        getDepartments().catch(() => [] as Department[]),
      ]);
      if (ignore) return;

      if (bookingsResult.success) {
        setBookingList(bookingsResult.bookings ?? []);
      } else {
        addToast(bookingsResult.error ?? 'Failed to load bookings.', 'error');
      }
      setDepartments(deptList);
      setIsLoading(false);
    }

    void loadData();
    return () => {
      ignore = true;
    };
  }, [addToast]);

  // ─── Reset to first page whenever the filters/sort/page-size change ────
  // Derived during render (no effect) to avoid cascading re-renders.
  const filterKey = `${search}|${statusFilter}|${departmentFilter}|${dateFilter}|${sortOption}|${pageSize}`;
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  // ─── Stat card figures ──────────────────
  const stats = useMemo(() => {
    const now = new Date();
    const monthKey = format(now, 'yyyy-MM');
    const weekAhead = new Date(now.getTime() + 7 * MS_PER_DAY);

    let thisMonth = 0;
    let completed = 0;
    let upcomingNext7 = 0;
    let ongoing = 0;

    for (const booking of bookingList) {
      const status = getMeetingStatus(booking.startTime, booking.endTime);
      if (booking.date.startsWith(monthKey)) thisMonth += 1;
      if (status === 'COMPLETE') completed += 1;
      if (status === 'ONGOING') ongoing += 1;
      if (status === 'UPCOMING') {
        const start = new Date(booking.startTime);
        if (start <= weekAhead) upcomingNext7 += 1;
      }
    }

    const completedPct = bookingList.length > 0 ? Math.round((completed / bookingList.length) * 100) : 0;
    return { thisMonth, completed, completedPct, upcomingNext7, ongoing };
  }, [bookingList]);


  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    const matches = bookingList.filter((booking) => {
      const status = getMeetingStatus(booking.startTime, booking.endTime);

      if (statusFilter !== 'ALL' && status !== statusFilter) return false;
      if (departmentFilter !== 'ALL' && booking.departmentId !== departmentFilter) return false;
      if (dateFilter && booking.date !== dateFilter) return false;

      if (!query) return true;
      return (
        booking.bookingCode.toLowerCase().includes(query) ||
        booking.purpose.toLowerCase().includes(query) ||
        (booking.department?.name.toLowerCase().includes(query) ?? false)
      );
    });

    return matches.sort((a, b) =>
      sortOption === 'NEWEST'
        ? b.startTime.localeCompare(a.startTime)
        : a.startTime.localeCompare(b.startTime)
    );
  }, [bookingList, search, statusFilter, departmentFilter, dateFilter, sortOption]);

  // ─── Pagination slice ───────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const visibleBookings = filtered.slice(pageStart, pageStart + pageSize);

  const hasActiveFilters =
    search !== '' || statusFilter !== 'ALL' || departmentFilter !== 'ALL' || dateFilter !== '';

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setDepartmentFilter('ALL');
    setDateFilter('');
  };



  // ─── Helpers ────────────────────────
  const fieldVal = (f: Partial<BookingForm>) => setForm((prev) => ({ ...prev, ...f }));

  // ─── CRUD ────────────────────────────────
  const overlappingBooking = useMemo(() => {
    if (!editBooking) return null;

    const start = timeToMinutes(form.startTime);
    const end = timeToMinutes(form.endTime);
    if (start >= end) return null;

    return (
      bookingList.find((booking) => {
        if (booking.id === editBooking.id || booking.date !== form.date) return false;
        const existingStart = bookingTimeToMinutes(booking.startTime);
        const existingEnd = bookingTimeToMinutes(booking.endTime);
        return start < existingEnd && end > existingStart;
      }) ?? null
    );
  }, [bookingList, editBooking, form.date, form.endTime, form.startTime]);

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

  // ─── Input style ──────────────────────────
  const inputCls = 'w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200';
  const selectCls = `${inputCls} pr-8 appearance-none bg-white`;
  const selectBg = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: 'right 12px center',
  };

  // ─── Stat cards config ──────────────────
  const statCards = [
    { title: 'Total Bookings', value: stats.thisMonth, sub: 'This Month', Icon: CalendarCheck, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-50', subColor: 'text-gray-400' },
    { title: 'Completed', value: stats.completed, sub: `${stats.completedPct}% of total`, Icon: CircleCheckBig, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50', subColor: 'text-emerald-600' },
    { title: 'Upcoming', value: stats.upcomingNext7, sub: 'Next 7 days', Icon: Clock, iconColor: 'text-amber-600', iconBg: 'bg-amber-50', subColor: 'text-gray-400' },
    { title: 'Ongoing', value: stats.ongoing, sub: 'Happening now', Icon: PlayCircle, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', subColor: 'text-blue-600' },
  ];

  // ─── Status tabs config ─────────────────
  const tabs: { key: StatusFilter; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'UPCOMING', label: 'Upcoming' },
    { key: 'ONGOING', label: 'Ongoing' },
    { key: 'COMPLETE', label: 'Completed' },
  ];

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
            value={editBooking?.user?.name ?? 'Admin User'}
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
            onChange={(e) => fieldVal({ date: e.target.value })}
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
              onChange={(e) => fieldVal({ startTime: e.target.value })}
              className={selectCls}
              style={selectBg}
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
              className={selectCls}
              style={selectBg}
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
            className={`${inputCls} resize-none`}
          />
          <span className="absolute bottom-2.5 right-3 text-[10px] text-gray-400">
            {form.purpose.length} / 250
          </span>
        </div>
      </div>
    </div>
  );

  // ─── Single booking card ────────────────
  const renderBookingCard = (b: Booking, idx: number) => {
    const status = getMeetingStatus(b.startTime, b.endTime);
    return (
      <div
        key={b.id}
        className={`bg-white rounded-xl border border-gray-100 border-l-4 ${STATUS_ACCENT[status]} shadow-sm p-4 sm:p-5 hover-lift ${staggerClass()}`}
        style={staggerStyle(idx, 30)}
      >
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{b.purpose}</h3>
            <p className="text-xs font-mono text-gray-400 mt-0.5">{b.bookingCode}</p>
          </div>
          <MeetingStatusBadge status={status} />
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 mt-4">
          <div className="flex items-start gap-2 min-w-0">
            <Building2 className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-gray-400">Department</p>
              <p className="text-xs text-gray-700 truncate">{b.department?.name ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 min-w-0">
            <CalendarDays className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-gray-400">Date</p>
              <p className="text-xs text-gray-700 truncate">{formatDate(b.date)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 min-w-0">
            <Clock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-gray-400">Time</p>
              <p className="text-xs text-gray-700 truncate">{formatTime(b.startTime)} – {formatTime(b.endTime)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 min-w-0">
            <User className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-gray-400">Booked By</p>
              <p className="text-xs text-gray-700 truncate">{b.user?.name ?? '—'}</p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-50">
          <button
            id={`view-booking-${b.id}`}
            onClick={() => setViewBooking(b)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
          <div className="flex gap-2">
            <button
              id={`edit-booking-${b.id}`}
              onClick={() => openEdit(b)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 border border-blue-100 hover:bg-blue-50 transition-all duration-150 active:scale-95"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              id={`delete-booking-${b.id}`}
              onClick={() => setDeleteBooking(b)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-100 hover:bg-red-50 transition-all duration-150 active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─── Render ───────────────────────────────
  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* ── Header + stat cards ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Manage Bookings</h1>
        <p className="mt-1 text-sm text-gray-500">View, manage and organize all meeting bookings</p>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mt-5">
          {statCards.map(({ title, value, sub, Icon, iconColor, iconBg, subColor }) => (
            <div
              key={title}
              className="flex items-center gap-3 sm:gap-4 rounded-xl border border-gray-100 bg-white p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 leading-none">
                  {isLoading ? '—' : value}
                </p>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1 truncate">{title}</p>
                <p className={`text-[11px] mt-0.5 ${subColor}`}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Toolbar: search, new booking, filters ───────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="booking-search"
              type="text"
              placeholder="Search by booking ID, description or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          <button
            id="add-booking-btn"
            onClick={() => router.push('/admin/manage-bookings/add-booking')}
            className="group flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-200 active:scale-95"
          >
            <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
            New Booking
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Department filter */}
          <select
            id="filter-department"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2.5 pr-8 border border-gray-200 rounded-xl text-sm text-gray-700 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            style={selectBg}
          >
            <option value="ALL">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            id="filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-2.5 pr-8 border border-gray-200 rounded-xl text-sm text-gray-700 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            style={selectBg}
          >
            <option value="ALL">All Status</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETE">Completed</option>
          </select>

          {/* Date filter */}
          <input
            id="filter-date"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
          />

          {/* Clear filters */}
          <button
            id="clear-filters-btn"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* ── Tabs + sort + view toggle + list ────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-gray-100 pb-4">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  statusFilter === tab.key
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        
        </div>

        {/* Booking list */}
        <div className="pt-4">
          {isLoading ? (
            <div className="py-16 text-center text-sm text-gray-400">Loading bookings…</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">No bookings found.</div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 xl:grid-cols-2 gap-4' : 'space-y-4'}>
              {visibleBookings.map((b, idx) => renderBookingCard(b, idx))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && filtered.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 mt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Showing {pageStart + 1} to {Math.min(pageStart + pageSize, filtered.length)} of {filtered.length} bookings
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {getPaginationRange(currentPage, totalPages).map((item, i) =>
                  item === 'ellipsis' ? (
                    <span key={`e-${i}`} className="px-2 text-xs text-gray-400">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                        item === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1.5 pr-7 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                style={selectBg}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>{size} per page</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      <Modal open={!!viewBooking} onClose={() => setViewBooking(null)} title="Booking Details" size="md">
        {viewBooking && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-gray-800 truncate">{viewBooking.purpose}</h3>
                <p className="text-xs font-mono text-gray-400 mt-0.5">{viewBooking.bookingCode}</p>
              </div>
              <MeetingStatusBadge status={getMeetingStatus(viewBooking.startTime, viewBooking.endTime)} />
            </div>
            <dl className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <dt className="text-[11px] font-medium text-gray-400">Department</dt>
                <dd className="text-sm text-gray-700 mt-0.5">{viewBooking.department?.name ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium text-gray-400">Booked By</dt>
                <dd className="text-sm text-gray-700 mt-0.5">{viewBooking.user?.name ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium text-gray-400">Date</dt>
                <dd className="text-sm text-gray-700 mt-0.5">{formatDate(viewBooking.date)}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium text-gray-400">Time</dt>
                <dd className="text-sm text-gray-700 mt-0.5">
                  {formatTime(viewBooking.startTime)} – {formatTime(viewBooking.endTime)}
                </dd>
              </div>
            </dl>
            {viewBooking.purpose && (
              <div>
                <dt className="text-[11px] font-medium text-gray-400">Description</dt>
                <dd className="text-sm text-gray-600 mt-1 leading-relaxed whitespace-pre-wrap break-words">
                  {viewBooking.purpose}
                </dd>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setViewBooking(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-all duration-150 active:scale-95"
              >
                Close
              </button>
              <button
                onClick={() => {
                  openEdit(viewBooking);
                  setViewBooking(null);
                }}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Edit Booking
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editBooking} onClose={() => setEditBooking(null)} title="Edit Booking" size="md">
        <div className="space-y-5">
          {bookingFormFields}
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
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-all duration-150 active:scale-95"
              >
                Cancel
              </button>
              <button
                id={`confirm-delete-booking-${deleteBooking.id}`}
                onClick={() => handleDelete(deleteBooking)}
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
