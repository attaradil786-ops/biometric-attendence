import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Coffee,
  FileBarChart2,
  Building2,
  Cpu,
  ShieldCheck,
  Settings,
  Fingerprint,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItemConfig {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
  permissionKey?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { currentUser, logout } = useAuth();
  const { stats, devices } = useApp();

  const offlineDevices = devices.filter((d) => d.status === 'Offline').length;

  const navItems: NavItemConfig[] = [
    {
      label: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
    },
    {
      label: 'Teachers & Timetable',
      path: '/teachers',
      icon: GraduationCap,
      badge: 'New',
      badgeColor: 'bg-indigo-600 text-white',
    },
    {
      label: 'Employees',
      path: '/employees',
      icon: Users,
      badge: stats.totalEmployees,
    },
    {
      label: 'Attendance',
      path: '/attendance',
      icon: CalendarCheck,
      badge: stats.workingNow > 0 ? `${stats.workingNow} Live` : undefined,
      badgeColor: 'bg-emerald-500 text-white',
    },
    {
      label: 'Breaks',
      path: '/breaks',
      icon: Coffee,
      badge: stats.onBreakNow > 0 ? stats.onBreakNow : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: FileBarChart2,
    },
    {
      label: 'Departments',
      path: '/departments',
      icon: Building2,
    },
    {
      label: 'Biometric Devices',
      path: '/devices',
      icon: Cpu,
      badge: offlineDevices > 0 ? `${offlineDevices} offline` : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      label: 'Users & Permissions',
      path: '/users',
      icon: ShieldCheck,
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden animate-fadeIn"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-all duration-300 ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/20">
              <Fingerprint className="w-6 h-6" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold text-white tracking-tight">
                    BioSync
                  </span>
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                    Pro
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  Biometric Attendance
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                  } ${collapsed && !mobileOpen ? 'justify-center px-2' : ''}`
                }
                title={collapsed && !mobileOpen ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105`} />
                {(!collapsed || mobileOpen) && (
                  <span className="truncate flex-1">{item.label}</span>
                )}
                {(!collapsed || mobileOpen) && item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom User / Footer Card */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          {(!collapsed || mobileOpen) ? (
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={
                    currentUser?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                  }
                  alt=""
                  className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {currentUser?.name || 'Administrator'}
                  </p>
                  <p className="text-[10px] text-indigo-400 truncate">
                    {currentUser?.role || 'Super Admin'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
