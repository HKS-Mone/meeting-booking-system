'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  DoorOpen,
  Building2,
  Users,
  BarChart2,
  Settings,
  LogOut,
  Calendar,
  ShieldCheck,
  ClipboardList,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useUIStore } from '@/lib/ui-store';
import { useRouter } from 'next/navigation';

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/manage-bookings', label: 'Manage Bookings', icon: ClipboardList },
  { href: '/admin/manage-users', label: 'Manage Users', icon: Users },
  { href: '/admin/calendar', label: 'Calendar', icon: Calendar },
  { href: '/admin/reports', label: 'Reports', icon: BarChart2 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/add-admin', label: 'Add Admin', icon: Building2 },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useUIStore();
  const router = useRouter();

  // Automatically collapse sidebar when navigating on mobile only
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
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
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
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
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className={sidebarCollapsed ? "block md:hidden lg:block" : "block"}>
                <span className="text-white font-bold text-base leading-none block">
                  Admin Panel
                </span>
                <span className="text-blue-300 text-[10px] font-medium">
                  Mone Meeting
                </span>
              </div>
            </div>
            {!sidebarCollapsed && (
              <button
                onClick={toggleSidebar}
                className="md:hidden text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Toggle Button Under Logo (Visible ONLY on Tablet) */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex mt-3 w-full items-center gap-2 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150 justify-center"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 shrink-0" />
                
              </>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-4 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'px-2 lg:px-3' : 'px-3'}`}>
          <ul className="space-y-1">
            {adminLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <li key={href}>
                  <Link
                    href={href}
                    title={sidebarCollapsed ? label : undefined}
                    className={`
                      flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium
                      transition-all duration-150
                      ${sidebarCollapsed ? 'px-0 justify-center lg:px-3 lg:justify-start' : 'px-3 justify-start'}
                      ${
                        active
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                    <span className={sidebarCollapsed ? "inline md:hidden lg:inline" : "inline"}>{label}</span>
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
              w-full flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-red-500/20 transition-all duration-150
              ${sidebarCollapsed ? 'px-0 justify-center lg:px-3 lg:justify-start' : 'px-3 justify-start'}
            `}
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            <span className={sidebarCollapsed ? "inline md:hidden lg:inline" : "inline"}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
