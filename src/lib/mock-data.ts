import { Department, User, Room, Booking, Role } from './types';

// ─── Departments 
export const departments: Department[] = [
  { id: 'dept-1', name: 'Activation' },
  { id: 'dept-2', name: 'HR' },
  { id: 'dept-3', name: 'Finance' },
  { id: 'dept-4', name: 'Client Servicing' },
  { id: 'dept-5', name: 'Creative' },
  { id: 'dept-6', name: 'E & E' },
  { id: 'dept-7', name: 'General' },
];

// ─── Roles 
export const roles: { value: Role; label: string }[] = [
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'ADMIN', label: 'Admin' },
];

// ─── Users ───────────────────────────────────────────────────────────────────
export const users: User[] = [
  {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@meetinghub.com',
    role: 'ADMIN',
    departmentId: 'dept-2',
    department: { id: 'dept-2', name: 'IT' },
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    name: 'Dilshan Perera',
    email: 'dilshan@meetinghub.com',
    role: 'EMPLOYEE',
    departmentId: 'dept-2',
    department: { id: 'dept-2', name: 'IT' },
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'user-3',
    name: 'Nimal Silva',
    email: 'nimal@meetinghub.com',
    role: 'EMPLOYEE',
    departmentId: 'dept-1',
    department: { id: 'dept-1', name: 'HR' },
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'user-4',
    name: 'Kavinda Perera',
    email: 'kavinda@meetinghub.com',
    role: 'EMPLOYEE',
    departmentId: 'dept-2',
    department: { id: 'dept-2', name: 'IT' },
    createdAt: '2024-02-10T00:00:00Z',
  },
  {
    id: 'user-5',
    name: 'Samuel Fernando',
    email: 'samuel@meetinghub.com',
    role: 'EMPLOYEE',
    departmentId: 'dept-3',
    department: { id: 'dept-3', name: 'Finance' },
    createdAt: '2024-03-01T00:00:00Z',
  },
  {
    id: 'user-6',
    name: 'Dulihan Jayaweera',
    email: 'dulihan@meetinghub.com',
    role: 'EMPLOYEE',
    departmentId: 'dept-4',
    department: { id: 'dept-4', name: 'Marketing' },
    createdAt: '2024-03-15T00:00:00Z',
  },
];

// ─── Rooms ───────────────────────────────────────────────────────────────────
export const rooms: Room[] = [
  {
    id: 'room-1',
    name: 'Conference Room A',
    capacity: 20,
    floor: 1,
    roomType: 'Conference Room',
    status: 'AVAILABLE',
    imageUrl: '/rooms/conference-a.jpg',
    facilities: ['Projector', 'Whiteboard', 'WiFi', 'Video Call', 'Air Condition'],
  },
  {
    id: 'room-2',
    name: 'Conference Room B',
    capacity: 12,
    floor: 1,
    roomType: 'Conference Room',
    status: 'OCCUPIED',
    imageUrl: '/rooms/conference-b.jpg',
    facilities: ['Projector', 'Whiteboard', 'WiFi', 'Air Condition'],
  },
  {
    id: 'room-3',
    name: 'Meeting Room C',
    capacity: 8,
    floor: 2,
    roomType: 'Meeting Room',
    status: 'AVAILABLE',
    imageUrl: '/rooms/meeting-c.jpg',
    facilities: ['Whiteboard', 'WiFi', 'Air Condition'],
  },
  {
    id: 'room-4',
    name: 'Meeting Room D',
    capacity: 6,
    floor: 2,
    roomType: 'Meeting Room',
    status: 'MAINTENANCE',
    imageUrl: '/rooms/meeting-d.jpg',
    facilities: ['WiFi', 'Whiteboard'],
  },
  {
    id: 'room-5',
    name: 'Board Room E',
    capacity: 16,
    floor: 3,
    roomType: 'Board Room',
    status: 'AVAILABLE',
    imageUrl: '/rooms/board-e.jpg',
    facilities: ['Projector', 'Whiteboard', 'WiFi', 'Video Call', 'Air Condition'],
  },
  {
    id: 'room-6',
    name: 'Training Room F',
    capacity: 30,
    floor: 3,
    roomType: 'Training Room',
    status: 'OUT_OF_SERVICE',
    imageUrl: '/rooms/training-f.jpg',
    facilities: ['Projector', 'Whiteboard', 'WiFi', 'Air Condition'],
  },
];

// ─── Helpers for dynamic dates ────────────────────────────────────────────────
function today(hour: number, minute = 0) {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function daysFromNow(n: number, hour: number, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function dateOnly(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// ─── Bookings ─────────────────────────────────────────────────────────────────
// Status is no longer stored — it is derived at runtime via getMeetingStatus()
export const bookings: Booking[] = [
  {
    id: 'bk-1001',
    bookingCode: 'BK-1001',
    userId: 'user-3',
    user: users[2],
    roomId: 'room-1',
    room: rooms[0],
    departmentId: 'dept-1',
    department: departments[0],
    purpose: 'Interview',
    participants: 4,
    startTime: today(9, 30),
    endTime: today(10, 30),
    date: dateOnly(0),
    createdAt: daysFromNow(-3, 10),
  },
  {
    id: 'bk-1002',
    bookingCode: 'BK-1002',
    userId: 'user-3',
    user: users[2],
    roomId: 'room-2',
    room: rooms[1],
    departmentId: 'dept-3',
    department: departments[2],
    purpose: 'Budget Review',
    participants: 8,
    startTime: today(11, 0),
    endTime: today(12, 0),
    date: dateOnly(0),
    createdAt: daysFromNow(-2, 9),
  },
  {
    id: 'bk-1003',
    bookingCode: 'BK-1003',
    userId: 'user-4',
    user: users[3],
    roomId: 'room-3',
    room: rooms[2],
    departmentId: 'dept-2',
    department: departments[1],
    purpose: 'Project Discussion',
    participants: 6,
    startTime: today(13, 0),
    endTime: today(14, 0),
    date: dateOnly(0),
    createdAt: daysFromNow(-1, 14),
  },
  {
    id: 'bk-1004',
    bookingCode: 'BK-1004',
    userId: 'user-6',
    user: users[5],
    roomId: 'room-5',
    room: rooms[4],
    departmentId: 'dept-4',
    department: departments[3],
    purpose: 'Strategy Meeting',
    participants: 12,
    startTime: today(15, 0),
    endTime: today(16, 0),
    date: dateOnly(0),
    createdAt: daysFromNow(-1, 11),
  },
  {
    id: 'bk-1005',
    bookingCode: 'BK-1005',
    userId: 'user-2',
    user: users[1],
    roomId: 'room-1',
    room: rooms[0],
    departmentId: 'dept-2',
    department: departments[1],
    purpose: 'Project Kickoff',
    participants: 15,
    startTime: daysFromNow(1, 10, 0),
    endTime: daysFromNow(1, 11, 30),
    date: dateOnly(1),
    createdAt: daysFromNow(-2, 8),
  },
  {
    id: 'bk-1006',
    bookingCode: 'BK-1006',
    userId: 'user-4',
    user: users[3],
    roomId: 'room-3',
    room: rooms[2],
    departmentId: 'dept-2',
    department: departments[1],
    purpose: 'Client Meeting',
    participants: 5,
    startTime: daysFromNow(2, 14, 0),
    endTime: daysFromNow(2, 15, 0),
    date: dateOnly(2),
    createdAt: daysFromNow(-1, 16),
  },
  {
    id: 'bk-1007',
    bookingCode: 'BK-1007',
    userId: 'user-4',
    user: users[3],
    roomId: 'room-5',
    room: rooms[4],
    departmentId: 'dept-2',
    department: departments[1],
    purpose: 'Team Sync',
    participants: 10,
    startTime: daysFromNow(3, 9, 0),
    endTime: daysFromNow(3, 10, 0),
    date: dateOnly(3),
    createdAt: daysFromNow(-4, 13),
  },
  {
    id: 'bk-1008',
    bookingCode: 'BK-1008',
    userId: 'user-5',
    user: users[4],
    roomId: 'room-2',
    room: rooms[1],
    departmentId: 'dept-3',
    department: departments[2],
    purpose: 'Budget Review',
    participants: 7,
    startTime: daysFromNow(4, 11, 0),
    endTime: daysFromNow(4, 12, 30),
    date: dateOnly(4),
    createdAt: daysFromNow(-1, 9),
  },
  {
    id: 'bk-1009',
    bookingCode: 'BK-1009',
    userId: 'user-2',
    user: users[1],
    roomId: 'room-1',
    room: rooms[0],
    departmentId: 'dept-2',
    department: departments[1],
    purpose: 'Training Session',
    participants: 20,
    startTime: daysFromNow(5, 9, 0),
    endTime: daysFromNow(5, 12, 0),
    date: dateOnly(5),
    createdAt: daysFromNow(-5, 10),
  },
  {
    id: 'bk-1010',
    bookingCode: 'BK-1010',
    userId: 'user-6',
    user: users[5],
    roomId: 'room-3',
    room: rooms[2],
    departmentId: 'dept-4',
    department: departments[3],
    purpose: 'Marketing Campaign Review',
    participants: 6,
    startTime: daysFromNow(6, 14, 0),
    endTime: daysFromNow(6, 15, 30),
    date: dateOnly(6),
    createdAt: daysFromNow(-6, 14),
  },
];

// ─── Derived stats helpers ────────────────────────────────────────────────────
export function getRoomStats() {
  const available = rooms.filter((r) => r.status === 'AVAILABLE').length;
  const occupied = rooms.filter((r) => r.status === 'OCCUPIED').length;
  const maintenance = rooms.filter((r) => r.status === 'MAINTENANCE').length;
  const outOfService = rooms.filter((r) => r.status === 'OUT_OF_SERVICE').length;
  return { total: rooms.length, available, occupied, maintenance, outOfService };
}

export function getTodaysBookings() {
  const today = new Date().toISOString().slice(0, 10);
  return bookings.filter((b) => b.date === today);
}

export function getUpcomingBookings(limit = 3) {
  const now = new Date().toISOString();
  return bookings
    .filter((b) => b.startTime > now)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .slice(0, limit);
}

export function getUserBookings(userId: string) {
  return bookings.filter((b) => b.userId === userId);
}

export function getBookingsForMonth(year: number, month: number) {
  return bookings.filter((b) => {
    const d = new Date(b.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

export function getRoomAvailability(roomId: string, date: string) {
  const hours: { hour: number; booked: boolean }[] = [];
  for (let h = 8; h <= 17; h++) {
    const slotStart = new Date(`${date}T${String(h).padStart(2, '0')}:00:00`);
    const slotEnd = new Date(`${date}T${String(h + 1).padStart(2, '0')}:00:00`);
    const booked = bookings.some((b) => {
      if (b.roomId !== roomId || b.date !== date) return false;
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);
      return bStart < slotEnd && bEnd > slotStart;
    });
    hours.push({ hour: h, booked });
  }
  return hours;
}
