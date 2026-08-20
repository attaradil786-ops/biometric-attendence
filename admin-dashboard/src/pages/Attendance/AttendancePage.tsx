import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  Search,
  Filter,
  Download,
  Plus,
  Clock,
  UserCheck,
  UserX,
  AlertTriangle,
  FileSpreadsheet,
  Edit2,
  Eye,
  Calendar,
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import { ManualAttendanceModal } from './ManualAttendanceModal';
import {
  formatDateString,
  formatTimeString,
  formatMinutesToHours,
  downloadCSV,
} from '../../utils/formatters';

export const AttendancePage: React.FC = () => {
  const {
    attendance,
    departments,
    employees,
    stats,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<AttendanceRecord | null>(null);

  // Filter records
  const filteredRecords = useMemo(() => {
    return attendance.filter((rec) => {
      // Tab filter
      if (activeTab === 'today' && rec.date !== '2026-08-18') return false;

      // Search query
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        rec.employeeName.toLowerCase().includes(q) ||
        rec.employeeId.toLowerCase().includes(q) ||
        rec.departmentName.toLowerCase().includes(q);

      // Department filter
      const matchesDept = selectedDept === 'all' || rec.departmentName === selectedDept;

      // Status filter
      const matchesStatus = selectedStatus === 'all' || rec.status === selectedStatus;

      // Date filter (only in history mode)
      const matchesDate = !dateFilter || rec.date === dateFilter;

      return matchesQuery && matchesDept && matchesStatus && matchesDate;
    }).sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return (b.checkIn || '').localeCompare(a.checkIn || '');
    });
  }, [attendance, activeTab, searchQuery, selectedDept, selectedStatus, dateFilter]);

  // Paginated records
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Employee ID',
      'Employee Name',
      'Department',
      'Check-In',
      'Check-Out',
      'Work Duration',
      'Status',
      'Late (Mins)',
      'Device Name',
      'Notes',
    ];
    const rows = filteredRecords.map((r) => [
      r.date,
      r.employeeId,
      r.employeeName,
      r.departmentName,
      r.checkIn || 'N/A',
      r.checkOut || 'N/A',
      formatMinutesToHours(r.workDurationMinutes),
      r.status,
      r.lateMinutes || 0,
      r.deviceName || 'N/A',
      r.notes || '',
    ]);
    downloadCSV(`Attendance_Report_${activeTab}.csv`, headers, rows);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Attendance Logs & Time Tracking
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time biometric attendance records, check-in timestamps, and working hours
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => {
              setRecordToEdit(null);
              setIsManualModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Manual Attendance Entry
          </button>
        </div>
      </div>

      {/* Stats Mini Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase text-slate-400">
              Present Today
            </p>
            <p className="text-base font-bold text-slate-900 dark:text-white">
              {stats.presentToday} Staff
            </p>
          </div>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase text-slate-400">
              Late Arrivals
            </p>
            <p className="text-base font-bold text-slate-900 dark:text-white">
              {stats.lateToday} Staff
            </p>
          </div>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600">
            <UserX className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase text-slate-400">
              Absent / Leave
            </p>
            <p className="text-base font-bold text-slate-900 dark:text-white">
              {stats.absentToday} Staff
            </p>
          </div>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase text-slate-400">
              Total Logged Hours
            </p>
            <p className="text-base font-bold text-slate-900 dark:text-white">
              {stats.totalWorkHoursFormatted}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          {/* Tab buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('today');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'today'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Today's Live Logs (Aug 18)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('history');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Attendance History
            </button>
          </div>

          <span className="text-xs text-slate-400">
            Showing {filteredRecords.length} records
          </span>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-1">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search employee, ID, department..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {activeTab === 'history' && (
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            )}

            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Working">Working</option>
              <option value="Late">Late</option>
              <option value="Early Checkout">Early Checkout</option>
              <option value="Absent">Absent</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Employee</th>
                <th className="py-3.5 px-4 font-semibold">Department</th>
                <th className="py-3.5 px-4 font-semibold">Date</th>
                <th className="py-3.5 px-4 font-semibold">Check-In</th>
                <th className="py-3.5 px-4 font-semibold">Check-Out</th>
                <th className="py-3.5 px-4 font-semibold">Work Hours</th>
                <th className="py-3.5 px-4 font-semibold">Late / Early</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <EmptyState
                      icon={CalendarCheck}
                      title="No attendance records found"
                      description="No records match the current filter criteria."
                      actionLabel="Clear Filters"
                      onAction={() => {
                        setSearchQuery('');
                        setSelectedDept('all');
                        setSelectedStatus('all');
                        setDateFilter('');
                      }}
                    />
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((rec) => {
                  const emp = employees.find((e) => e.id === rec.employeeId);
                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={emp?.avatarUrl}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {rec.employeeName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {rec.employeeId}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium">
                        {rec.departmentName}
                      </td>

                      <td className="py-3 px-4 text-slate-500 font-mono">
                        {rec.date}
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {formatTimeString(rec.checkIn)}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-500">
                        {formatTimeString(rec.checkOut)}
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {formatMinutesToHours(rec.workDurationMinutes)}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {rec.lateMinutes > 0 ? (
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                            +{rec.lateMinutes}m late
                          </span>
                        ) : rec.earlyCheckoutMinutes > 0 ? (
                          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                            -{rec.earlyCheckoutMinutes}m early
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">On Time</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge type="attendance" status={rec.status} />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setRecordToEdit(rec);
                            setIsManualModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Adjust Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredRecords.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Manual Attendance Modal */}
      <ManualAttendanceModal
        isOpen={isManualModalOpen}
        onClose={() => {
          setIsManualModalOpen(false);
          setRecordToEdit(null);
        }}
        recordToEdit={recordToEdit}
      />
    </div>
  );
};
