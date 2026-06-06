'use client';

import { MeetingStatus, RoomStatus } from '@/lib/types';
import { getMeetingStatusStyle, getRoomStatusStyle } from '@/lib/utils';

// ─── Meeting Status Badge (Upcoming / Ongoing / Complete) ─────────────────────
interface MeetingStatusBadgeProps {
  status: MeetingStatus;
}

export function MeetingStatusBadge({ status }: MeetingStatusBadgeProps) {
  const style = getMeetingStatusStyle(status);
  const labels: Record<MeetingStatus, string> = {
    UPCOMING: 'Upcoming',
    ONGOING: 'Ongoing',
    COMPLETE: 'Complete',
  };

  const dot: Record<MeetingStatus, string> = {
    UPCOMING: 'bg-blue-500',
    ONGOING: 'bg-green-500',
    COMPLETE: 'bg-gray-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {status === 'ONGOING' ? (
        <span className="relative flex w-2 h-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className={`relative inline-flex rounded-full w-2 h-2 ${dot[status]}`} />
        </span>
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`} />
      )}
      {labels[status]}
    </span>
  );
}

// ─── Room Status Badge ────────────────────────────────────────────────────────
interface RoomStatusBadgeProps {
  status: RoomStatus;
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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {labels[status]}
    </span>
  );
}
