import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Fingerprint,
  CheckCheck,
  Trash2,
  User,
  Shield,
  LogOut,
  ExternalLink,
  ChevronDown,
  ScanFace,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface TopHeaderProps {
  onToggleMobileSidebar: () => void;
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Admin Overview', subtitle: 'Live workforce attendance, biometric logs & statistics' },
  '/employees': { title: 'Employee Directory', subtitle: 'Manage organization staff, profiles & biometric registrations' },
  '/attendance': { title: 'Attendance Management', subtitle: 'Daily check-in/out timestamps, hours worked & exceptions' },
  '/breaks': { title: 'Break Monitoring', subtitle: 'Track active breaks, meal durations & overbreak policies' },
  '/reports': { title: 'Reports & Analytics', subtitle: 'Export payroll-ready attendance, daily audits & timesheets' },
  '/departments': { title: 'Departments & Teams', subtitle: 'Organize organizational units, shifts & department leads' },
  '/devices': { title: 'Biometric Gateways', subtitle: 'Monitor hardware scanners, IP gateways, sync & templates' },
  '/users': { title: 'Admin Users & RBAC', subtitle: 'Configure staff roles, access privileges & permission matrices' },
  '/settings': { title: 'System Settings', subtitle: 'Configure office shifts, grace rules, break limits & policies' },
};

export const TopHeader: React.FC<TopHeaderProps> = ({ onToggleMobileSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    setIsSimulatorOpen,
    openBiometricEnrollment,
    setIsSearchOpen,
  } = useApp();
  const { currentUser, logout } = useAuth();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter((n) => !n.read);
  const currentPath = location.pathname;
  const pageMeta = pageTitles[currentPath] || { title: 'Dashboard', subtitle: 'Biometric Attendance System' };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile trigger & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
              {pageMeta.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate">
              {pageMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Hardware Biometric Enrollment Trigger */}
          <button
            type="button"
            onClick={() => openBiometricEnrollment()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 hover:border-emerald-300 transition-all shadow-2xs cursor-pointer"
            title="Open Biometric Hardware Terminal Enrollment"
          >
            <ScanFace className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">Enroll Identity</span>
            <span className="md:hidden">Enroll</span>
          </button>

          {/* Quick Biometric Terminal Trigger */}
          <button
            type="button"
            onClick={() => setIsSimulatorOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 hover:border-indigo-300 transition-all shadow-2xs cursor-pointer"
            title="Open Live Biometric Scanner Simulator"
          >
            <Fingerprint className="w-4 h-4 text-indigo-600 animate-pulse" />
            <span className="hidden md:inline">Simulate Scan</span>
            <span className="md:hidden">Scan</span>
          </button>

          {/* Global Search Button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search anything...</span>
            <kbd className="text-[10px] font-semibold bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 text-slate-400">
              Ctrl+K
            </kbd>
          </button>

          {/* Search Icon Mobile */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="sm:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-fadeIn">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Notifications
                    </span>
                    {unreadNotifs.length > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-50 text-rose-600 rounded-full">
                        {unreadNotifs.length} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {unreadNotifs.length > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 p-1 flex items-center gap-1 font-medium"
                        title="Mark all as read"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={clearNotifications}
                        className="text-[11px] text-slate-400 hover:text-rose-500 p-1"
                        title="Clear all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No notifications at this time.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          if (notif.link) {
                            navigate(notif.link);
                            setIsNotifOpen(false);
                          }
                        }}
                        className={`p-3.5 text-left cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                          !notif.read ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {notif.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile & Role Switcher */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <img
                src={
                  currentUser?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                }
                alt={currentUser?.name || 'Admin'}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <div className="hidden xl:block text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                  {currentUser?.name || 'Administrator'}
                </p>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                  {currentUser?.role || 'Super Admin'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-fadeIn">
                <div className="p-3.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {currentUser?.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser?.email}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                      <Shield className="w-3 h-3" />
                      {currentUser?.role}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      ● Active Session
                    </span>
                  </div>
                </div>

                <div className="p-1.5 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full text-left px-2.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Account Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full text-left px-2.5 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out / Lock Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
