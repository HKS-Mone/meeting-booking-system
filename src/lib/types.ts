export type Role = 'EMPLOYEE' | 'ADMIN' | 'SUPER_ADMIN';

export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'OUT_OF_SERVICE';

/** Time-derived meeting status — computed from startTime/endTime vs. now. Never stored. */
export type MeetingStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETE';

export interface Department {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId?: string;
  department?: Department;
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  floor: number;
  roomType: string;
  status: RoomStatus;
  imageUrl?: string;
  facilities: string[];
}

export interface Booking {
  id: string;
  bookingCode: string;
  userId: string;
  user?: User;
  roomId: string;
  room?: Room;
  departmentId: string;
  department?: Department;
  purpose: string;
  participants: number;
  startTime: string; // Local date-time string, e.g. 2026-06-15T09:00:00
  endTime: string;   // Local date-time string, e.g. 2026-06-15T10:00:00
  date: string;      // Date-only string, e.g. 2026-06-15
  createdAt: string;
}
