'use client';

import { useState } from 'react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday, isSameDay,
} from 'date-fns';
import { Booking } from '@/lib/types';
import CalendarEventChip from './CalendarEventChip';
import Modal from '@/components/ui/Modal';
import { getEventColor, formatTime } from '@/lib/utils';

interface CalendarGridProps {
  currentDate: Date;
  bookings: Booking[];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarGrid({ currentDate, bookings }: CalendarGridProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getBookingsForDay = (day: Date) =>
    bookings.filter((b) => isSameDay(new Date(b.date), day));

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dayBookings = getBookingsForDay(day);
            const inMonth = isSameMonth(day, currentDate);
            const today = isToday(day);
            return (
              <div
                key={idx}
                className={`
                  min-h-[100px] p-1.5 border-b border-r border-gray-50
                  ${!inMonth ? 'bg-gray-50/50' : ''}
                `}
              >
                {/* Day number */}
                <div className="flex justify-end mb-0.5">
                  <span
                    className={`
                      w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium
                      ${today ? 'bg-blue-600 text-white' : inMonth ? 'text-gray-700' : 'text-gray-300'}
                    `}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
                {/* Events */}
                <div className="space-y-0.5">
                  {dayBookings.slice(0, 3).map((b, i) => (
                    <CalendarEventChip
                      key={b.id}
                      title={b.purpose}
                      colorClass={getEventColor(i)}
                      onClick={() => setSelectedBooking(b)}
                    />
                  ))}
                  {dayBookings.length > 3 && (
                    <p className="text-[9px] text-gray-400 pl-1">
                      +{dayBookings.length - 3} more
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
        {selectedBooking && (
          <div className="space-y-3 text-sm">
            {[
              ['Meeting', selectedBooking.purpose],
              ['Room', selectedBooking.room?.name ?? '-'],
              ['Department', selectedBooking.department?.name ?? '-'],
              ['Date', format(new Date(selectedBooking.date), 'MMMM dd, yyyy')],
              ['Time', `${formatTime(selectedBooking.startTime)} – ${formatTime(selectedBooking.endTime)}`],
              ['Participants', String(selectedBooking.participants)],
              ['Status', selectedBooking.status],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-3">
                <span className="w-28 shrink-0 text-gray-500">{label}</span>
                <span className="font-medium text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
