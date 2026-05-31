'use client';

import { BookingStatus, RoomStatus } from '@/lib/types';
import { getBookingStatusStyle, getRoomStatusStyle } from '@/lib/utils';

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

interface RoomStatusBadgeProps {
  status: RoomStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const style = getBookingStatusStyle(status);
  const labels: Record<BookingStatus, string> = {
    APPROVED: 'Approved',
    PENDING: 'Pending',
    CANCELLED: 'Cancelled',
    REJECTED: 'Rejected',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}
    >
      {labels[status]}
    </span>
  );
}

export function RoomStatusBadge({ status }: RoomStatusBadgeProps) {
  const style = getRoomStatusStyle(status);
  const labels: Record<RoomStatus, string> = {
    AVAILABLE: 'Available',
    OCCUPIED: 'Occupied',
    MAINTENANCE: 'Maintenance',
    OUT_OF_SERVICE: 'Out of Service',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}
    >
      {labels[status]}
    </span>
  );
}

interface MeetingTimeBadgeProps {
  status: 'ongoing' | 'upcoming' | 'completed';
}

export function MeetingTimeBadge({ status }: MeetingTimeBadgeProps) {
  const styles = {
    ongoing: 'bg-green-100 text-green-700',
    upcoming: 'bg-blue-100 text-blue-700',
    completed: 'bg-gray-100 text-gray-600',
  };
  const labels = { ongoing: 'Ongoing', upcoming: 'Upcoming', completed: 'Completed' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
