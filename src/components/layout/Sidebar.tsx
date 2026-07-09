'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  ClipboardList,
  LayoutDashboard,
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
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/booking-history', label: 'My Bookings', icon: ClipboardList },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth({ checkSessionOnMount: false });
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
        style={{
          background: 'linear-gradient(160deg, #07104a 0%, #0d2a66 55%, #123c87 100%)',
          flexShrink: 0,
          boxShadow: '4px 0 32px rgba(7,16,74,0.45)',
        }}
      >
        {/* Logo & Toggle Section */}
        <div className={`
          flex flex-col py-5 transition-all duration-300
          border-b border-white/10
          ${sidebarCollapsed ? 'items-center px-0 lg:items-stretch lg:px-5' : 'px-5'}
        `}
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)' }}
        >
          <div className="flex items-center justify-between w-full">
            <div className={`flex items-center gap-2 ${sidebarCollapsed ? 'md:justify-center md:w-full lg:justify-start lg:w-auto' : ''}`}>
              {/* Logo icon with glassmorphic glow */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden transition-all duration-300 hover:scale-110"
                style={{
                  boxShadow: '0 0 18px rgba(96,165,250,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                  transition: 'transform 0.25s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.2s ease',
                }}
              >
                <Image
                  src="/mone_logo.png"
                  alt="Mone Meeting logo"
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
              <div className={sidebarCollapsed ? "block md:hidden lg:block" : "block"}>
                <span className="text-white font-bold text-base leading-none block tracking-tight">
                  Mone Meeting
                </span>  
              </div>
            </div>
            {!sidebarCollapsed && (
              <button
                onClick={toggleSidebar}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-white/80 hover:text-white hover:bg-white/10"
                style={{ transition: 'transform 0.2s cubic-bezier(0.34,1.4,0.64,1), color 0.15s ease' }}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Toggle Button Under Logo (Visible ONLY on Tablet) */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex lg:hidden mt-3 w-full items-center gap-2 py-2.5 rounded-xl text-xs font-medium text-white/70 hover:text-white hover:bg-white/8 transition-all duration-150 justify-center border border-white/0 hover:border-white/10"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 shrink-0 transition-transform duration-200" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 shrink-0 transition-transform duration-200" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-4 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'px-2 lg:px-3' : 'px-3'}`}>
          <ul className="space-y-0.5">
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
                      group relative flex items-center gap-3 py-2.5 md:py-3 rounded-xl text-sm font-medium
                      transition-all duration-200
                      ${sidebarCollapsed ? 'px-0 justify-center lg:px-3 lg:justify-start' : 'px-3 justify-start'}
                      ${
                        active
                          ? 'text-white'
                          : 'text-white/70 hover:text-white hover:bg-white/8'
                      }
                    `}
                    style={active ? {
                      background: 'linear-gradient(90deg, rgba(96,165,250,0.25) 0%, rgba(59,130,246,0.12) 100%)',
                      boxShadow: '0 2px 16px rgba(59,130,246,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
                      border: '1px solid rgba(96,165,250,0.25)',
                    } : {}}
                  >
                    {/* Active indicator bar */}
                    {active && (
                      <span
                        className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                        style={{ background: 'linear-gradient(180deg, #60a5fa, #38bdf8)', boxShadow: '0 0 8px rgba(96,165,250,0.8)' }}
                      />
                    )}

                    <Icon
                      className={`w-[18px] h-[18px] md:w-5 md:h-5 shrink-0 transition-all duration-200 ${
                        active ? 'text-white drop-shadow' : 'group-hover:scale-110 group-hover:text-white'
                      }`}
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
        <div
          className={`py-4 border-t border-white/10 transition-all duration-300 ${sidebarCollapsed ? 'px-2 lg:px-3' : 'px-3'}`}
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <button
            onClick={handleLogout}
            title={sidebarCollapsed ? 'Logout' : undefined}
            className={`
              group w-full flex items-center gap-3 py-2.5 md:py-3 rounded-xl text-sm font-medium
              text-white/70 hover:text-white hover:bg-red-500/20 hover:border-red-400/20
              transition-all duration-200 border border-transparent
              ${sidebarCollapsed ? 'px-0 justify-center lg:px-3 lg:justify-start' : 'px-3 justify-start'}
            `}
          >
            <LogOut className="w-[18px] h-[18px] md:w-5 md:h-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-red-300" />
            <span className={sidebarCollapsed ? "inline md:hidden lg:inline" : "inline"}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
