import { format, intervalToDuration } from 'date-fns';
import { BookingStatus, RoomStatus } from './types';

// ─── Class merge helper ───────────────────────────────────────────────────────
// Simple implementation without clsx since we haven't installed it
export function cn(...classes: (string | undefined | null | false | 0)[]) {
  return classes.filter(Boolean).join(' ');
}

// ─── Date / Time formatters ───────────────────────────────────────────────────
export function formatDate(iso: string): string {
  return format(new Date(iso), 'MMM dd, yyyy');
}

export function formatTime(iso: string): string {
  return format(new Date(iso), 'hh:mm a');
}

export function formatDateShort(iso: string): string {
  return format(new Date(iso), 'MMM dd');
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy');
}

export function getDurationLabel(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const dur = intervalToDuration({ start, end });
  const parts: string[] = [];
  if (dur.hours) parts.push(`${dur.hours}h`);
  if (dur.minutes) parts.push(`${dur.minutes}m`);
  return parts.join(' ') || '0m';
}

// ─── Status badge colours ─────────────────────────────────────────────────────
export function getBookingStatusStyle(status: BookingStatus): string {
  switch (status) {
    case 'APPROVED':
      return 'bg-green-100 text-green-700';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-700';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-600';
    case 'REJECTED':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

export function getRoomStatusStyle(status: RoomStatus): string {
  switch (status) {
    case 'AVAILABLE':
      return 'bg-green-100 text-green-700';
    case 'OCCUPIED':
      return 'bg-red-100 text-red-700';
    case 'MAINTENANCE':
      return 'bg-yellow-100 text-yellow-700';
    case 'OUT_OF_SERVICE':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

// ─── Meeting time status ──────────────────────────────────────────────────────
export function getMeetingTimeStatus(startIso: string, endIso: string): 'ongoing' | 'upcoming' | 'completed' {
  const now = new Date();
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (now >= start && now <= end) return 'ongoing';
  if (now < start) return 'upcoming';
  return 'completed';
}

export function getMeetingTimeStatusStyle(status: 'ongoing' | 'upcoming' | 'completed'): string {
  switch (status) {
    case 'ongoing':
      return 'bg-green-100 text-green-700';
    case 'upcoming':
      return 'bg-blue-100 text-blue-700';
    case 'completed':
      return 'bg-gray-100 text-gray-600';
  }
}

// ─── Booking ID formatter ─────────────────────────────────────────────────────
export function formatBookingId(index: number): string {
  return `BK-${1000 + index + 1}`;
}

// ─── Event chip colours (cycle through palette) ───────────────────────────────
const EVENT_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
];

export function getEventColor(index: number): string {
  return EVENT_COLORS[index % EVENT_COLORS.length];
}
