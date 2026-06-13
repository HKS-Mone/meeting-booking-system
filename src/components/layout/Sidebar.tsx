'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  ClipboardList,
  LogOut,
  X,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../../hook/useAuth';
import { useUIStore } from '@/lib/ui-store';
import { useRouter } from 'next/navigation';

const navLinks = [
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/booking-history', label: 'My Bookings', icon: ClipboardList },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useUIStore();
  const router = useRouter();

  // Automatically collapse sidebar when navigating on mobile only
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  }, [pathname, setSidebarCollapsed]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden animate-backdrop-in"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          transition-all duration-300 ease-in-out
          md:translate-x-0 md:static md:z-auto
          ${
            sidebarCollapsed
              ? '-translate-x-full md:w-16 lg:w-[240px]'
              : 'translate-x-0 w-[240px]'
          }
        `}
        style={{ backgroundColor: '#1e2a4a', flexShrink: 0 }}
      >
        {/* Logo & Toggle Section */}
        <div className={`
          flex flex-col border-b border-white/10 py-5 transition-all duration-300
          ${sidebarCollapsed ? 'items-center px-0 lg:items-stretch lg:px-5' : 'px-5'}
        `}>
          <div className="flex items-center justify-between w-full">
            <div className={`flex items-center gap-2 ${sidebarCollapsed ? 'md:justify-center md:w-full lg:justify-start lg:w-auto' : ''}`}>
              {/* Logo icon with hover scale */}
              <div
                className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0"
                style={{ transition: 'transform 0.25s cubic-bezier(0.34,1.4,0.64,1)' }}
              >
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className={sidebarCollapsed ? "block md:hidden lg:block" : "block"}>
                <span className="text-white font-bold text-base leading-none block">
                  Mone Meeting
                </span>
                <span className="text-blue-300 text-[10px] font-medium">
                  Meeting Booking System
                </span>
              </div>
            </div>
            {!sidebarCollapsed && (
              <button
                onClick={toggleSidebar}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg text-white/60 hover:text-white"
                style={{ transition: 'transform 0.2s cubic-bezier(0.34,1.4,0.64,1), color 0.15s ease' }}
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Toggle Button Under Logo (Visible ONLY on Tablet) */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex lg:hidden mt-3 w-full items-center gap-2 py-3 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150 justify-center"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5 shrink-0 transition-transform duration-200" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 shrink-0 transition-transform duration-200" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-4 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'px-2 lg:px-3' : 'px-3'}`}>
          <ul className="space-y-1">
            {navLinks.map(({ href, label, icon: Icon }, idx) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <li
                  key={href}
                  className="animate-stagger-in"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <Link
                    href={href}
                    title={sidebarCollapsed ? label : undefined}
                    className={`
                      group relative flex items-center gap-3 py-2.5 md:py-3 rounded-lg text-sm font-medium
                      transition-all duration-200
                      ${sidebarCollapsed ? 'px-0 justify-center lg:px-3 lg:justify-start' : 'px-3 justify-start'}
                      ${
                        active
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    {/* Active indicator bar */}
                    {active && (
                      <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-white rounded-full animate-active-bar" />
                    )}

                    <Icon
                      className={`w-4.5 h-4.5 md:w-5 md:h-5 shrink-0 transition-transform duration-200 ${active ? '' : 'group-hover:scale-110'}`}
                    />
                    <span className={sidebarCollapsed ? "inline md:hidden lg:inline" : "inline"}>
                      {label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className={`py-4 border-t border-white/10 transition-all duration-300 ${sidebarCollapsed ? 'px-2 lg:px-3' : 'px-3'}`}>
          <button
            onClick={handleLogout}
            title={sidebarCollapsed ? 'Logout' : undefined}
            className={`
              group w-full flex items-center gap-3 py-2.5 md:py-3 rounded-lg text-sm font-medium
              text-slate-300 hover:text-white hover:bg-red-500/20
              transition-all duration-200
              ${sidebarCollapsed ? 'px-0 justify-center lg:px-3 lg:justify-start' : 'px-3 justify-start'}
            `}
          >
            <LogOut className="w-4.5 h-4.5 md:w-5 md:h-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
            <span className={sidebarCollapsed ? "inline md:hidden lg:inline" : "inline"}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
