'use client';

import { Bell, Menu } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useUIStore } from '@/lib/ui-store';
import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/meeting-rooms': 'Meeting Rooms',
  '/book-room': 'Book Meeting Room',
  '/calendar': 'Calendar',
  '/booking-history': 'Meeting Bookings',
  '/departments': 'Departments',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/admin/dashboard': 'Admin Dashboard',
  '/admin/manage-bookings': 'Manage Bookings',
  '/admin/manage-rooms': 'Manage Rooms',
  '/admin/manage-departments': 'Manage Departments',
  '/admin/manage-users': 'Manage Users',
  '/admin/calendar': 'Calendar',
  '/admin/reports': 'Reports',
  '/admin/settings': 'Settings',
};

function getPageTitle(pathname: string): string {
  // Exact match
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Prefix match (e.g. /meeting-rooms/room-1 → Meeting Rooms)
  for (const [key, value] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(key + '/')) return value;
  }
  return 'MeetingHub';
}

export default function TopBar() {
  const { currentUser } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  const initials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-5 h-16">
        {/* Left: hamburger + page title */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
        </div>

        {/* Right: bell + user */}
        <div className="flex items-center gap-3">
          {/* Bell */}
          <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200" />

          {/* User */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
              {initials}
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-800 leading-tight">
                {currentUser?.name ?? 'Guest'}
              </p>
              <p className="text-xs text-gray-500 leading-tight">
                {currentUser?.department?.name ?? currentUser?.role ?? ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
