'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  ClipboardList,
  LogOut,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useUIStore } from '@/lib/ui-store';
import { useRouter } from 'next/navigation';

const navLinks = [
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/booking-history', label: 'My Bookings', icon: ClipboardList },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useUIStore();
  const router = useRouter();

  // Automatically collapse sidebar when navigating on mobile/tablet
  useEffect(() => {
    setSidebarCollapsed(true);
  }, [pathname, setSidebarCollapsed]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'}
        `}
        style={{ width: '240px', backgroundColor: '#1e2a4a', flexShrink: 0 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-base leading-none block">
                Mone Meeting
              </span>
              <span className="text-blue-300 text-[10px] font-medium">
                Room Booking System
              </span>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-all duration-150
                      ${
                        active
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-red-500/20 transition-all duration-150"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
