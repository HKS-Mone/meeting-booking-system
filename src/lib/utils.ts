import { format, intervalToDuration } from 'date-fns';
import { MeetingStatus, RoomStatus } from './types';

// ─── Class merge helper ───────────────────────────────────────────────────────
export function cn(...classes: (string | undefined | null | false | 0)[]) {
  return classes.filter(Boolean).join(' ');
}

// ─── Date / Time formatters ───────────────────────────────────────────────────
export function parseDateOnly(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function parseDisplayDate(value: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseDateOnly(value) : new Date(value);
}

export function formatDate(iso: string): string {
  return format(parseDisplayDate(iso), 'MMM dd, yyyy');
}

export function formatTime(iso: string): string {
  return format(new Date(iso), 'hh:mm a');
}


export const BUSINESS_TIME_ZONE = 'Asia/Colombo';

export function getBusinessNowIso(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '00';

  const hour = get('hour') === '24' ? '00' : get('hour');
  return `${get('year')}-${get('month')}-${get('day')}T${hour}:${get('minute')}:${get('second')}`;
}

export function formatDateShort(iso: string): string {
  return format(parseDisplayDate(iso), 'MMM dd');
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

// ─── Room status badge colours ────────────────────────────────────────────────
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

// ─── Meeting time status (time-derived, never stored) ─────────────────────────
export function getMeetingStatus(startIso: string, endIso: string): MeetingStatus {
  const now = new Date();
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (now >= start && now <= end) return 'ONGOING';
  if (now < start) return 'UPCOMING';
  return 'COMPLETE';
}

export function getMeetingStatusStyle(status: MeetingStatus): string {
  switch (status) {
    case 'ONGOING':
      return 'bg-green-100 text-green-700';
    case 'UPCOMING':
      return 'bg-blue-100 text-blue-700';
    case 'COMPLETE':
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
