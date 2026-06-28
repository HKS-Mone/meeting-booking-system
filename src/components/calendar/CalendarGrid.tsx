'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday, isSameDay,
} from 'date-fns';
import { Booking } from '@/lib/types';
import CalendarEventChip from './CalendarEventChip';
import { getEventColor, formatTime, getMeetingStatus, getDurationLabel, parseDateOnly } from '@/lib/utils';
import { X, CalendarDays, Clock, Building2 } from 'lucide-react';
import { MeetingStatusBadge } from '@/components/ui/StatusBadge';

interface CalendarGridProps {
  currentDate: Date;
  bookings: Booking[];
}

// ─── Palette for Google Calendar-style event blocks ───────────────────────────
const GC_PALETTE = [
  { bg: '#dbeafe', border: '#3b82f6', text: '#1d4ed8', dot: '#3b82f6' }, // blue
  { bg: '#dcfce7', border: '#22c55e', text: '#15803d', dot: '#22c55e' }, // green
  { bg: '#f3e8ff', border: '#a855f7', text: '#7e22ce', dot: '#a855f7' }, // purple
  { bg: '#ffedd5', border: '#f97316', text: '#c2410c', dot: '#f97316' }, // orange
  { bg: '#fce7f3', border: '#ec4899', text: '#be185d', dot: '#ec4899' }, // pink
  { bg: '#ccfbf1', border: '#14b8a6', text: '#0f766e', dot: '#14b8a6' }, // teal
  { bg: '#e0e7ff', border: '#6366f1', text: '#4338ca', dot: '#6366f1' }, // indigo
  { bg: '#fef9c3', border: '#eab308', text: '#854d0e', dot: '#eab308' }, // yellow
];

const WEEKDAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WEEKDAYS_LONG  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

// ─── Component ───────────────────────────────────────────────────────────────
export default function CalendarGrid({ currentDate, bookings }: CalendarGridProps) {

  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [closing, setClosing]         = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Portal container — mounts once on client so position:fixed is viewport-relative
  const portalRef = useRef<HTMLDivElement | null>(null);
  const [portalMounted, setPortalMounted] = useState(false);
  useEffect(() => {
    const el = document.createElement('div');
    el.id = 'calendar-popup-portal';
    document.body.appendChild(el);
    portalRef.current = el;
    setPortalMounted(true);
    return () => { document.body.removeChild(el); };
  }, []);

  // Dismiss: trigger exit animation, then clear the day after it finishes
  const handleClose = () => {
    setClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setSelectedDay(null);
      setClosing(false);
    }, 220);
  };

  // If the parent swaps the month while a day is open, close immediately
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Lock body scroll while popup is open
  useEffect(() => {
    if (selectedDay) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedDay]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd   = endOfMonth(currentDate);
  const calStart   = startOfWeek(monthStart);
  const calEnd     = endOfWeek(monthEnd);
  const days       = eachDayOfInterval({ start: calStart, end: calEnd });

  const getBookingsForDay = (day: Date) =>
    bookings.filter((b) => isSameDay(parseDateOnly(b.date), day));

  // Bookings for popup
  const selectedDayBookings = selectedDay ? getBookingsForDay(selectedDay) : [];
  const selectedDayLabel    = selectedDay ? format(selectedDay, 'EEEE, MMMM d, yyyy') : '';

  return (
    <>
      {/* ── Calendar grid ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {WEEKDAYS_LONG.map((d, i) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide"
            >
              <span className="sm:hidden">{WEEKDAYS_SHORT[i]}</span>
              <span className="hidden sm:inline">{d}</span>
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dayBookings = getBookingsForDay(day);
            const inMonth     = isSameMonth(day, currentDate);
            const todayDay    = isToday(day);
            const isSelected  = selectedDay ? isSameDay(day, selectedDay) : false;

            return (
              <div
                key={idx}
                role="button"
                tabIndex={0}
                aria-label={`View meetings for ${format(day, 'MMMM d, yyyy')}`}
                onClick={() => setSelectedDay(day)}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedDay(day)}
                className={`
                  min-h-[60px] md:min-h-[110px] p-1 md:p-2 cursor-pointer
                  border-b border-r border-gray-50
                  transition-colors duration-100
                  ${!inMonth ? 'bg-gray-50/50 hover:bg-gray-100/60' : 'hover:bg-blue-50/40'}
                  ${isSelected ? 'ring-2 ring-inset ring-blue-400 bg-blue-50/30' : ''}
                `}
              >
                {/* Day number */}
                <div className="flex justify-end mb-0.5">
                  <span
                    className={`
                      w-5 h-5 md:w-7 md:h-7 flex items-center justify-center rounded-full
                      text-[10px] md:text-sm font-medium select-none
                      ${todayDay
                        ? 'bg-blue-600 text-white'
                        : inMonth ? 'text-gray-700' : 'text-gray-300'
                      }
                    `}
                  >
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Event chips — 1 on mobile, up to 3 on desktop */}
                <div className="space-y-0.5">
                  {dayBookings.slice(0, 1).map((b, i) => (
                    <CalendarEventChip
                      key={b.id}
                      title={b.department?.name ?? b.purpose}
                      colorClass={getEventColor(i)}
                      onClick={(e) => { e.stopPropagation(); setSelectedDay(day); }}
                    />
                  ))}
                  <div className="hidden sm:block space-y-0.5">
                    {dayBookings.slice(1, 3).map((b, i) => (
                      <CalendarEventChip
                        key={b.id}
                        title={b.department?.name ?? b.purpose}
                        colorClass={getEventColor(i + 1)}
                        onClick={(e) => { e.stopPropagation(); setSelectedDay(day); }}
                      />
                    ))}
                  </div>
                  {dayBookings.length > 3 && (
                    <p className="text-[9px] text-gray-400 pl-0.5">
                      +{dayBookings.length - 3} more
                    </p>
                  )}
                  {dayBookings.length > 1 && (
                    <p className="sm:hidden text-[9px] text-gray-400 pl-0.5">
                      +{dayBookings.length - 1} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Day popup overlay — rendered via portal to escape sidebar stacking context ── */}
      {portalMounted && portalRef.current && (selectedDay || closing) && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {/* Backdrop — fades in/out */}
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm ${closing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
            onClick={handleClose}
          />

          {/* Panel — centered on all screen sizes */}
          <div
            className={`
              relative w-full max-w-[calc(100%-0rem)] sm:max-w-lg
              bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden
              ${closing ? 'animate-scale-out' : 'animate-scale-in'}
            `}
            style={{ maxHeight: 'calc(100dvh - 2rem)' }}
          >
            {/* Header */}
            <div
              className="px-5 py-4 flex items-start justify-between flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}
            >
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <CalendarDays className="w-4 h-4 text-blue-200" />
                  <p className="text-xs text-blue-200 font-medium uppercase tracking-wide">
                    {selectedDayBookings.length === 0
                      ? 'No meetings'
                      : `${selectedDayBookings.length} meeting${selectedDayBookings.length > 1 ? 's' : ''}`}
                  </p>
                </div>
                <h2 className="text-lg font-bold text-white leading-tight">
                  {selectedDayLabel}
                </h2>
              </div>
              <button
                id="day-popup-close-btn"
                onClick={handleClose}
                className="w-12 h-12 rounded-xl flex items-center justify-center bg-white text-red-500 hover:bg-red-50 hover:text-red-600 shrink-0 ml-4 hover:rotate-90"
                style={{ transition: 'transform 0.2s cubic-bezier(0.34,1.4,0.64,1), color 0.15s ease, background 0.15s ease' }}
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body — scrollable */}
            <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(100dvh - 2rem - 84px)' }}>
              {selectedDayBookings.length === 0 ? (
                /* ── Empty state ── */
                <div className="flex flex-col items-center justify-center py-14 px-6 text-center animate-fade-in-up">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)' }}
                  >
                    <CalendarDays className="w-7 h-7 text-blue-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-700 mb-1">No meetings today</h3>
                  <p className="text-sm text-gray-400 max-w-xs">
                    There are no meetings scheduled for this day
                  </p>
                </div>
              ) : (
                /* ── Meetings list (Google Calendar style) ── */
                <div className="divide-y divide-gray-50">
                  {selectedDayBookings.map((b, idx) => {
                    const palette  = GC_PALETTE[idx % GC_PALETTE.length];
                    const status   = getMeetingStatus(b.startTime, b.endTime);
                    const duration = getDurationLabel(b.startTime, b.endTime);

                    return (
                      <div
                        key={b.id}
                        className="px-5 py-4 group hover:bg-gray-50/60 transition-colors animate-stagger-in"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        {/* Time + title row */}
                        <div className="flex gap-4 items-start">
                          {/* Time column */}
                          <div className="shrink-0 w-16 text-right">
                            <p className="text-xs font-semibold text-gray-500 leading-tight">
                              {formatTime(b.startTime)}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {formatTime(b.endTime)}
                            </p>
                          </div>

                          {/* Coloured left bar + content */}
                          <div className="flex gap-3 flex-1 min-w-0">
                            {/* Left accent bar */}
                            <div
                              className="w-1 rounded-full shrink-0 self-stretch min-h-[40px]"
                              style={{ backgroundColor: palette.border }}
                            />

                            {/* Content */}
                            <div
                              className="flex-1 min-w-0 rounded-xl px-3.5 py-3"
                              style={{ backgroundColor: palette.bg }}
                            >
                              {/* Title row — department name */}
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h3
                                  className="font-semibold text-sm leading-tight truncate"
                                  style={{ color: palette.text }}
                                >
                                  {b.department?.name ?? '—'}
                                </h3>
                                <MeetingStatusBadge status={status} />
                              </div>

                              {/* Meta */}
                              <div className="space-y-2">
                                {/* Time & duration */}
                                <div className="flex items-center gap-1.5">
                                  <Clock
                                    className="w-3 h-3 shrink-0"
                                    style={{ color: palette.border }}
                                  />
                                  <span className="text-xs text-gray-600">
                                    {formatTime(b.startTime)} – {formatTime(b.endTime)}
                                    <span className="ml-1.5 text-gray-400">({duration})</span>
                                  </span>
                                </div>

                                {/* Description */}
                                {b.purpose && (
                                  <div className="mt-1">
                                    <p
                                      className="text-[10px] font-medium mb-1"
                                      style={{ color: palette.border }}
                                    >
                                      Description
                                    </p>
                                    <div
                                      className="w-full min-h-[56px] rounded-lg px-2.5 py-2 text-xs text-gray-600 leading-relaxed whitespace-pre-wrap break-words border"
                                      style={{
                                        backgroundColor: 'rgba(255,255,255,0.65)',
                                        borderColor: palette.border + '55',
                                      }}
                                    >
                                      {b.purpose}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>,
        portalRef.current,
      )}
    </>
  );
}
