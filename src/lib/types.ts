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


export interface Booking {
  id: string;
  bookingCode: string;
  userId: string;
  user?: User;
  roomId: string;
  departmentId: string;
  department?: Department;
  purpose: string;
  participants: number;
  startTime: string; 
  endTime: string;   
  date: string;      
  createdAt: string;
}
