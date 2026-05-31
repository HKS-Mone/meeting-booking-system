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
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useUIStore } from '@/lib/ui-store';
import { useRouter } from 'next/navigation';

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/manage-bookings', label: 'Manage Bookings', icon: ClipboardList },
  // { href: '/admin/manage-departments', label: 'Manage Departments', icon: Building2 }, 
  { href: '/admin/manage-users', label: 'Manage Users', icon: Users },
  { href: '/admin/calendar', label: 'Calendar', icon: Calendar },
  { href: '/admin/reports', label: 'Reports', icon: BarChart2 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
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
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'}
        `}
        style={{ width: '240px', backgroundColor: '#1e2a4a', flexShrink: 0 }}
      >
        {/* Logo / Admin badge */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-base leading-none block">
                Admin Panel
              </span>
              <span className="text-blue-300 text-[10px] font-medium">
                Mone Meeting
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
            {adminLinks.map(({ href, label, icon: Icon }) => {
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
