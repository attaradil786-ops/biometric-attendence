import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  Building2,
  Cpu,
  Clock,
  ArrowRight,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, employees, departments, devices, attendance } = useApp();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredEmployees = q
    ? employees.filter(
        (e) =>
          e.fullName.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          e.biometricId.toLowerCase().includes(q) ||
          e.designation.toLowerCase().includes(q) ||
          e.departmentName.toLowerCase().includes(q)
      )
    : [];

  const filteredDepartments = q
    ? departments.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q) ||
          d.managerName.toLowerCase().includes(q)
      )
    : [];

  const filteredDevices = q
    ? devices.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q) ||
          d.ipAddress.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q)
      )
    : [];

  const filteredAttendance = q
    ? attendance.filter(
        (a) =>
          a.employeeName.toLowerCase().includes(q) ||
          a.employeeId.toLowerCase().includes(q) ||
          a.date.toLowerCase().includes(q) ||
          a.status.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const hasResults =
    filteredEmployees.length > 0 ||
    filteredDepartments.length > 0 ||
    filteredDevices.length > 0 ||
    filteredAttendance.length > 0;

  const handleSelect = (path: string) => {
    setIsSearchOpen(false);
    setQuery('');
    navigate(path);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0"
        onClick={() => setIsSearchOpen(false)}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search employees, biometric IDs, departments, terminals, attendance..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-4 max-h-[60vh]">
          {!q ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <p className="font-medium text-slate-600 dark:text-slate-300 mb-1">
                Global Search
              </p>
              <p>Type an employee name, ID (e.g. EMP-1001), department, or biometric device.</p>
            </div>
          ) : !hasResults ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No matching records found for "{query}".
            </div>
          ) : (
            <>
              {/* Employees */}
              {filteredEmployees.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Employees ({filteredEmployees.length})
                  </p>
                  <div className="space-y-1">
                    {filteredEmployees.map((emp) => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => handleSelect(`/employees?search=${encodeURIComponent(emp.fullName)}`)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={emp.avatarUrl}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                              {emp.fullName}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {emp.id} • {emp.designation} • {emp.departmentName}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Departments */}
              {filteredDepartments.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    Departments ({filteredDepartments.length})
                  </p>
                  <div className="space-y-1">
                    {filteredDepartments.map((dept) => (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => handleSelect('/departments')}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {dept.name} ({dept.code})
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Manager: {dept.managerName} • {dept.employeeCount} Employees • {dept.location}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Devices */}
              {filteredDevices.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    Biometric Devices ({filteredDevices.length})
                  </p>
                  <div className="space-y-1">
                    {filteredDevices.map((dev) => (
                      <button
                        key={dev.id}
                        type="button"
                        onClick={() => handleSelect('/devices')}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {dev.name} ({dev.model})
                          </p>
                          <p className="text-[11px] text-slate-500">
                            IP: {dev.ipAddress} • {dev.location} • Status: {dev.status}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Attendance */}
              {filteredAttendance.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Attendance Records ({filteredAttendance.length})
                  </p>
                  <div className="space-y-1">
                    {filteredAttendance.map((att) => (
                      <button
                        key={att.id}
                        type="button"
                        onClick={() => handleSelect('/attendance')}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {att.employeeName} ({att.date})
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Check-in: {att.checkIn || 'None'} • Check-out: {att.checkOut || 'None'} • Status: {att.status}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
