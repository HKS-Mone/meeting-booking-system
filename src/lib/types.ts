export type Role = 'USER' | 'ADMIN';

export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'OUT_OF_SERVICE';

export type BookingStatus = 'PENDING' | 'APPROVED' | 'CANCELLED' | 'REJECTED';

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
  startTime: string; // ISO string
  endTime: string;   // ISO string
  date: string;      // ISO date string YYYY-MM-DD
  status: BookingStatus;
  createdAt: string;
}
