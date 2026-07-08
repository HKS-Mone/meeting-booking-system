'use client';

import { Menu } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useUIStore } from '@/lib/ui-store';
import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/meeting-rooms': 'Meeting Rooms',
  '/book-room': 'M ONE INTEGRATION PVT LTD',
  '/calendar': 'M ONE INTEGRATION PVT LTD',
  '/booking-history': 'Meeting Bookings',
  '/departments': 'Departments',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/admin/dashboard': 'M ONE INTEGRATION PVT LTD',
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
  return 'M ONE INTEGRATION PVT LTD';
}

export default function TopBar() {
  const { currentUser } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const displayName = currentUser?.name ?? 'Guest';
  const departmentName = currentUser?.department?.name ?? 'No department';

  const initials = displayName !== 'Guest'
    ? displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
    : '??';

  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-3 sm:px-5 h-14 md:h-16">
        {/* Left: hamburger + page title */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            onClick={toggleSidebar}
            className="md:hidden w-11 h-11 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all duration-150 shrink-0 active:scale-95"
            style={{ transition: 'transform 0.15s ease, background 0.15s ease' }}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Page title — re-mounts on route change for fade-in animation */}
          <h1
            key={pathname}
            className="text-base md:text-lg font-semibold text-gray-800 truncate animate-fade-in-up"
          >
            {pageTitle}
          </h1>
        </div>

        {/* Right: user avatar */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Divider — hidden on very small screens */}
          <div className="hidden xs:block h-8 w-px bg-gray-200" />

          {/* User */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs sm:text-sm font-semibold cursor-default select-none transition-transform duration-200 hover:scale-105"
              title={`${displayName} - ${departmentName}`}
            >
              {initials}
            </div>
            <div className="block text-right min-w-0 max-w-[92px] sm:max-w-[180px]">
              <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-tight truncate">
                {displayName}
              </p>
              <p className="block text-[11px] sm:text-xs font-medium text-gray-500 leading-tight truncate">
                {departmentName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
