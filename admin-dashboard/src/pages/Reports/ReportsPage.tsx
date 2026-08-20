import React, { useState, useMemo } from 'react';
import {
  FileBarChart2,
  Download,
  Printer,
  Calendar,
  Filter,
  Users,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  Building2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PrintReportModal } from './PrintReportModal';
import {
  formatMinutesToHours,
  formatTimeString,
  formatDateString,
  downloadCSV,
} from '../../utils/formatters';

type ReportType = 'daily' | 'monthly' | 'employee' | 'overtime';

export const ReportsPage: React.FC = () => {
  const { attendance, employees, departments } = useApp();

  const [reportType, setReportType] = useState<ReportType>('daily');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-18');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('all');

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Filter attendance data
  const filteredData = useMemo(() => {
    return attendance.filter((rec) => {
      // Date range filter
      if (rec.date < startDate || rec.date > endDate) return false;

      // Department filter
      if (selectedDept !== 'all' && rec.departmentName !== selectedDept) return false;

      // Employee filter
      if (selectedEmployeeId !== 'all' && rec.employeeId !== selectedEmployeeId) return false;

      return true;
    }).sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return a.employeeName.localeCompare(b.employeeName);
    });
  }, [attendance, startDate, endDate, selectedDept, selectedEmployeeId]);

  // Aggregate stats
  const summaryStats = useMemo(() => {
    let totalMinutes = 0;
    let overtimeMinutes = 0;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;

    filteredData.forEach((r) => {
      const dur = r.workDurationMinutes || 0;
      totalMinutes += dur;
      if (dur > 480) {
        overtimeMinutes += dur - 480;
      }
      if (['Present', 'Working', 'Early Checkout'].includes(r.status)) presentCount++;
      if (r.status === 'Late' || r.lateMinutes > 0) lateCount++;
      if (r.status === 'Absent') absentCount++;
    });

    return {
      totalRecords: filteredData.length,
      totalHours: formatMinutesToHours(totalMinutes),
      totalOvertime: formatMinutesToHours(overtimeMinutes),
      presentCount,
      absentCount,
      lateCount,
      attendanceRate: filteredData.length > 0 ? Math.round((presentCount / filteredData.length) * 100) : 0,
    };
  }, [filteredData]);

  const handleExportCSV = () => {
    let filename = `BioSync_Report_${reportType}_${startDate}_to_${endDate}.csv`;
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (reportType === 'daily' || reportType === 'employee') {
      headers = [
        'Date',
        'Employee ID',
        'Employee Name',
        'Department',
        'Check-In',
        'Check-Out',
        'Work Hours',
        'Late (Mins)',
        'Status',
      ];
      rows = filteredData.map((r) => [
        r.date,
        r.employeeId,
        r.employeeName,
        r.departmentName,
        r.checkIn || 'N/A',
        r.checkOut || 'N/A',
        formatMinutesToHours(r.workDurationMinutes),
        r.lateMinutes || 0,
        r.status,
      ]);
    } else if (reportType === 'overtime') {
      headers = [
        'Employee ID',
        'Employee Name',
        'Department',
        'Date',
        'Actual Hours Logged',
        'Standard Shift (Hours)',
        'Overtime Earned',
        'Status',
      ];
      rows = filteredData.map((r) => {
        const dur = r.workDurationMinutes || 0;
        const ot = dur > 480 ? dur - 480 : 0;
        return [
          r.employeeId,
          r.employeeName,
          r.departmentName,
          r.date,
          formatMinutesToHours(dur),
          '8h 00m',
          formatMinutesToHours(ot),
          r.status,
        ];
      });
    } else {
      headers = [
        'Date',
        'Total Headcount',
        'Employee',
        'Department',
        'Check-In',
        'Check-Out',
        'Hours',
        'Status',
      ];
      rows = filteredData.map((r) => [
        r.date,
        employees.length,
        r.employeeName,
        r.departmentName,
        r.checkIn || 'N/A',
        r.checkOut || 'N/A',
        formatMinutesToHours(r.workDurationMinutes),
        r.status,
      ]);
    }

    downloadCSV(filename, headers, rows);
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'daily':
        return 'Daily Biometric Attendance Report';
      case 'monthly':
        return 'Monthly Attendance Summary & Audit';
      case 'employee':
        return 'Individual Employee Timesheet Audit';
      case 'overtime':
        return 'Work Hours & Overtime Payroll Report';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Reports & Attendance Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate and export payroll-ready attendance sheets, audit logs, and overtime reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV / Excel
          </button>
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Report Sheet
          </button>
        </div>
      </div>

      {/* Report Type Selector Pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setReportType('daily')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            reportType === 'daily'
              ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
            <Calendar className="w-4 h-4 text-indigo-600" />
            Daily Attendance
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Day-by-day check-in/out timestamps and attendance exceptions
          </p>
        </button>

        <button
          type="button"
          onClick={() => setReportType('monthly')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            reportType === 'monthly'
              ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
            <FileBarChart2 className="w-4 h-4 text-indigo-600" />
            Monthly Turnout Summary
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Aggregated calendar days, present counts, and monthly turnout rates
          </p>
        </button>

        <button
          type="button"
          onClick={() => setReportType('employee')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            reportType === 'employee'
              ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
            <Users className="w-4 h-4 text-indigo-600" />
            Employee Timesheet
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Detailed chronological timesheets for individual staff members
          </p>
        </button>

        <button
          type="button"
          onClick={() => setReportType('overtime')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            reportType === 'overtime'
              ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
            <Clock className="w-4 h-4 text-indigo-600" />
            Work Hours & Overtime
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Standard hours, approved overtime credits, and payroll metrics
          </p>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Start Date */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
            />
          </div>

          {/* Department */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Employee Selector (when in employee timesheet mode) */}
          {reportType === 'employee' && (
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="all">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.id})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-bold text-slate-900 dark:text-white">{filteredData.length}</span> matching records
        </div>
      </div>

      {/* Summary KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 rounded-xl">
          <p className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 uppercase">
            Total Hours Logged
          </p>
          <p className="text-xl font-bold text-indigo-950 dark:text-indigo-100 mt-0.5">
            {summaryStats.totalHours}
          </p>
        </div>

        <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl">
          <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase">
            Overtime Recorded
          </p>
          <p className="text-xl font-bold text-emerald-950 dark:text-emerald-100 mt-0.5">
            {summaryStats.totalOvertime}
          </p>
        </div>

        <div className="p-3.5 bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40 rounded-xl">
          <p className="text-[11px] font-semibold text-sky-700 dark:text-sky-300 uppercase">
            Turnout Rate
          </p>
          <p className="text-xl font-bold text-sky-950 dark:text-sky-100 mt-0.5">
            {summaryStats.attendanceRate}%
          </p>
        </div>

        <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl">
          <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase">
            Late Flags
          </p>
          <p className="text-xl font-bold text-amber-950 dark:text-amber-100 mt-0.5">
            {summaryStats.lateCount} events
          </p>
        </div>
      </div>

      {/* Generated Report Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {getReportTitle()}
          </h3>
          <span className="text-xs text-slate-400">
            {formatDateString(startDate)} to {formatDateString(endDate)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Check-In</th>
                <th className="py-3 px-4">Check-Out</th>
                <th className="py-3 px-4">Duration</th>
                {reportType === 'overtime' && <th className="py-3 px-4">Overtime</th>}
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No attendance records found for the selected period.
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => {
                  const dur = row.workDurationMinutes || 0;
                  const ot = dur > 480 ? dur - 480 : 0;
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {row.date}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {row.employeeName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {row.employeeId}
                        </p>
                      </td>
                      <td className="py-3 px-4">{row.departmentName}</td>
                      <td className="py-3 px-4 font-mono font-medium">
                        {formatTimeString(row.checkIn)}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {formatTimeString(row.checkOut)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {formatMinutesToHours(dur)}
                      </td>
                      {reportType === 'overtime' && (
                        <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                          {ot > 0 ? `+${formatMinutesToHours(ot)}` : '0h 00m'}
                        </td>
                      )}
                      <td className="py-3 px-4">
                        <StatusBadge type="attendance" status={row.status} size="sm" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print / Export Document Preview Modal */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        reportType={getReportTitle()}
        dateRange={{ start: startDate, end: endDate }}
        departmentName={selectedDept === 'all' ? 'All Departments' : selectedDept}
        data={filteredData}
        summaryStats={summaryStats}
      />
    </div>
  );
};
