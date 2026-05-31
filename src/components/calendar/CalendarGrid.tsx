'use client';

import { useState } from 'react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday, isSameDay,
} from 'date-fns';
import { Booking } from '@/lib/types';
import CalendarEventChip from './CalendarEventChip';
import Modal from '@/components/ui/Modal';
import { getEventColor, formatTime, getMeetingStatus } from '@/lib/utils';
import { MeetingStatusBadge } from '@/components/ui/StatusBadge';

interface CalendarGridProps {
  currentDate: Date;
  bookings: Booking[];
}

// Short on mobile, longer on desktop
const WEEKDAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WEEKDAYS_LONG  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarGrid({ currentDate, bookings }: CalendarGridProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd   = endOfMonth(currentDate);
  const calStart   = startOfWeek(monthStart);
  const calEnd     = endOfWeek(monthEnd);
  const days       = eachDayOfInterval({ start: calStart, end: calEnd });

  const getBookingsForDay = (day: Date) =>
    bookings.filter((b) => isSameDay(new Date(b.date), day));

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {WEEKDAYS_LONG.map((d, i) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide"
            >
              {/* Short initial on mobile, 3-letter on sm+ */}
              <span className="sm:hidden">{WEEKDAYS_SHORT[i]}</span>
              <span className="hidden sm:inline">{d}</span>
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dayBookings = getBookingsForDay(day);
            const inMonth = isSameMonth(day, currentDate);
            const todayDay = isToday(day);
            return (
              <div
                key={idx}
                className={`
                  min-h-[60px] sm:min-h-[100px] p-1 sm:p-1.5
                  border-b border-r border-gray-50
                  ${!inMonth ? 'bg-gray-50/50' : ''}
                `}
              >
                {/* Day number */}
                <div className="flex justify-end mb-0.5">
                  <span
                    className={`
                      w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full
                      text-[10px] sm:text-xs font-medium
                      ${todayDay
                        ? 'bg-blue-600 text-white'
                        : inMonth ? 'text-gray-700' : 'text-gray-300'
                      }
                    `}
                  >
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Events — show 1 on mobile, 3 on desktop */}
                <div className="space-y-0.5">
                  {dayBookings.slice(0, 1).map((b, i) => (
                    <CalendarEventChip
                      key={b.id}
                      title={b.purpose}
                      colorClass={getEventColor(i)}
                      onClick={() => setSelectedBooking(b)}
                    />
                  ))}
                  {/* Extra events on desktop */}
                  <div className="hidden sm:block space-y-0.5">
                    {dayBookings.slice(1, 3).map((b, i) => (
                      <CalendarEventChip
                        key={b.id}
                        title={b.purpose}
                        colorClass={getEventColor(i + 1)}
                        onClick={() => setSelectedBooking(b)}
                      />
                    ))}
                  </div>
                  {/* Overflow count */}
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

      {/* Booking detail modal */}
      <Modal
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="Booking Details"
        size="md"
      >
        {selectedBooking && (() => {
          const status = getMeetingStatus(selectedBooking.startTime, selectedBooking.endTime);
          return (
            <div className="space-y-3 text-sm">
              <div className="flex gap-3 items-center">
                <span className="w-24 shrink-0 text-gray-500">Status</span>
                <MeetingStatusBadge status={status} />
              </div>
              {[
                ['Meeting', selectedBooking.purpose],
                ['Room', selectedBooking.room?.name ?? '-'],
                ['Department', selectedBooking.department?.name ?? '-'],
                ['Date', format(new Date(selectedBooking.date), 'MMMM dd, yyyy')],
                ['Time', `${formatTime(selectedBooking.startTime)} – ${formatTime(selectedBooking.endTime)}`],
                ['Participants', String(selectedBooking.participants)],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="w-24 shrink-0 text-gray-500">{label}</span>
                  <span className="font-medium text-gray-800 break-words min-w-0">{value}</span>
                </div>
              ))}
            </div>
          );
        })()}
      </Modal>
    </>
  );
}
