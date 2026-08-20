import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Briefcase,
  Timer,
  Fingerprint,
  RotateCw,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Coffee,
  LogIn,
  LogOut,
  Cpu,
  Building2,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { KPICard } from '../../components/ui/KPICard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatMinutesToHours, formatTimeString } from '../../utils/formatters';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    employees,
    attendance,
    breaks,
    stats,
    activityEvents,
    devices,
    setIsSimulatorOpen,
    syncAllDevices,
  } = useApp();

  const [chartFilter, setChartFilter] = useState<'today' | 'week' | 'month'>('today');
  const [isSyncing, setIsSyncing] = useState(false);

  // Today's attendance records
  const todayRecords = attendance
    .filter((r) => r.date === '2026-08-18')
    .sort((a, b) => (b.checkIn || '').localeCompare(a.checkIn || ''));

  // Currently Working (checked in, not checked out, not on active break)
  const activeBreaks = breaks.filter((b) => b.date === '2026-08-18' && b.status === 'Active');
  const workingEmployees = todayRecords.filter(
    (r) => (r.status === 'Working' || (r.checkIn && !r.checkOut)) &&
      !activeBreaks.some((b) => b.employeeId === r.employeeId)
  );

  const handleSyncAll = async () => {
    setIsSyncing(true);
    await syncAllDevices();
    setIsSyncing(false);
  };

  // Mock trend data based on filter
  const weeklyTrends = [
    { day: 'Mon', present: 15, late: 2, absent: 1, rate: 94 },
    { day: 'Tue (Today)', present: stats.presentToday, late: stats.lateToday, absent: stats.absentToday, rate: stats.attendanceRate },
    { day: 'Wed (Est)', present: 14, late: 1, absent: 2, rate: 88 },
    { day: 'Thu (Est)', present: 16, late: 0, absent: 0, rate: 100 },
    { day: 'Fri (Est)', present: 15, late: 2, absent: 1, rate: 94 },
  ];

  const departmentBreakdown = [
    { name: 'Engineering & Tech', present: 3, total: 3, percent: 100 },
    { name: 'Human Resources', present: 3, total: 3, percent: 100 },
    { name: 'Product & Design', present: 3, total: 3, percent: 100 },
    { name: 'Sales & Growth', present: 3, total: 4, percent: 75 },
    { name: 'Operations & QA', present: 2, total: 3, percent: 67 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Bar */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 border border-indigo-950 rounded-2xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Biometric Gateways Active (4 Nodes)
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Workforce Attendance Central
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Live monitoring for {stats.totalEmployees} registered employees across 5 departments. {stats.workingNow} currently on shift.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing Terminals...' : 'Sync Devices'}
          </button>

          <button
            type="button"
            onClick={() => setIsSimulatorOpen(true)}
            className="flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Fingerprint className="w-4 h-4" />
            <span>Simulate Punch</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <KPICard
          title="Total Staff"
          value={stats.totalEmployees}
          icon={Users}
          accentColor="indigo"
          subtitle="Enrolled personnel"
          onClick={() => navigate('/employees')}
        />
        <KPICard
          title="Present Today"
          value={stats.presentToday}
          icon={UserCheck}
          accentColor="emerald"
          trend={{ value: `${stats.attendanceRate}%`, isPositive: stats.attendanceRate >= 80, label: 'turnout' }}
          onClick={() => navigate('/attendance')}
        />
        <KPICard
          title="Absent Today"
          value={stats.absentToday}
          icon={UserX}
          accentColor="rose"
          subtitle="Unmarked / On Leave"
          onClick={() => navigate('/attendance')}
        />
        <KPICard
          title="Late Arrivals"
          value={stats.lateToday}
          icon={Clock}
          accentColor="amber"
          subtitle="Exceeded 15m grace"
          onClick={() => navigate('/attendance')}
        />
        <KPICard
          title="Working Now"
          value={stats.workingNow}
          icon={Briefcase}
          accentColor="sky"
          subtitle="Active on floor"
          onClick={() => navigate('/attendance')}
        />
        <KPICard
          title="Total Work Hours"
          value={stats.totalWorkHoursFormatted}
          icon={Timer}
          accentColor="purple"
          subtitle="Logged today"
          onClick={() => navigate('/reports')}
        />
      </div>

      {/* Main Row: Attendance Overview Chart & Currently Working */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Analytics Overview Card (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                Attendance Trend & Turnout Overview
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time biometric attendance metrics and department turnout ratios
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setChartFilter('today')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  chartFilter === 'today'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setChartFilter('week')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  chartFilter === 'week'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                This Week
              </button>
              <button
                type="button"
                onClick={() => setChartFilter('month')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  chartFilter === 'month'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                August 2026
              </button>
            </div>
          </div>

          {/* Turnout Gauge Bars */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-slate-700 dark:text-slate-300">
                  Overall Organization Attendance Rate
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                  {stats.attendanceRate}% ({stats.presentToday} / {stats.totalEmployees} present)
                </span>
              </div>
              <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${(stats.workingNow / stats.totalEmployees) * 100}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500"
                  title={`Working: ${stats.workingNow}`}
                />
                <div
                  style={{ width: `${(stats.lateToday / stats.totalEmployees) * 100}%` }}
                  className="bg-amber-500 h-full transition-all duration-500"
                  title={`Late: ${stats.lateToday}`}
                />
                <div
                  style={{ width: `${(stats.onBreakNow / stats.totalEmployees) * 100}%` }}
                  className="bg-sky-400 h-full transition-all duration-500"
                  title={`On Break: ${stats.onBreakNow}`}
                />
                <div
                  style={{ width: `${(stats.absentToday / stats.totalEmployees) * 100}%` }}
                  className="bg-rose-400 h-full transition-all duration-500"
                  title={`Absent: ${stats.absentToday}`}
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 mt-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Working ({stats.workingNow})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Late ({stats.lateToday})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  On Break ({stats.onBreakNow})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  Absent / Leave ({stats.absentToday})
                </span>
              </div>
            </div>

            {/* Department Breakdown */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Department Turnout Breakdown
              </p>
              <div className="space-y-3">
                {departmentBreakdown.map((dept) => (
                  <div key={dept.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {dept.name}
                      </span>
                      <span className="text-slate-500">
                        {dept.present}/{dept.total} ({dept.percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${dept.percent}%` }}
                        className={`h-full rounded-full transition-all ${
                          dept.percent >= 90
                            ? 'bg-emerald-500'
                            : dept.percent >= 70
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Currently Working Live Stream (1 col) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Currently Working
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {workingEmployees.length} staff actively clocked in
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/attendance')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              View All
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[380px] pr-1">
            {workingEmployees.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No active working employees right now.
              </div>
            ) : (
              workingEmployees.map((record) => {
                const emp = employees.find((e) => e.id === record.employeeId);
                return (
                  <div
                    key={record.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={
                          emp?.avatarUrl ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                        }
                        alt=""
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {record.employeeName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {record.departmentName}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                        In {formatTimeString(record.checkIn)}
                      </p>
                      <span className="inline-block mt-0.5 text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        {formatMinutesToHours(record.workDurationMinutes || 0)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Second Row: Today's Attendance Table & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Attendance Table (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Today's Attendance Logs
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest biometric check-ins & check-outs for August 18, 2026
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/attendance')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Full Attendance Table <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] border-y border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Check-In</th>
                  <th className="py-3 px-3">Check-Out</th>
                  <th className="py-3 px-3">Hours</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {todayRecords.slice(0, 7).map((rec) => {
                  const emp = employees.find((e) => e.id === rec.employeeId);
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={emp?.avatarUrl}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white truncate">
                              {rec.employeeName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {rec.employeeId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">{rec.departmentName}</td>
                      <td className="py-3 px-3 font-mono font-medium">
                        {formatTimeString(rec.checkIn)}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">
                        {formatTimeString(rec.checkOut)}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {formatMinutesToHours(rec.workDurationMinutes)}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge type="attendance" status={rec.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Activity Feed (1 col) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              Biometric Activity Feed
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Live</span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {activityEvents.slice(0, 8).map((evt) => {
              let Icon = LogIn;
              let iconColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60';

              if (evt.type === 'check_out') {
                Icon = LogOut;
                iconColor = 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60';
              } else if (evt.type === 'break_start' || evt.type === 'break_end') {
                Icon = Coffee;
                iconColor = 'text-amber-600 bg-amber-50 dark:bg-amber-950/60';
              } else if (evt.type === 'device_sync') {
                Icon = Cpu;
                iconColor = 'text-sky-600 bg-sky-50 dark:bg-sky-950/60';
              } else if (evt.type === 'employee_added') {
                Icon = Users;
                iconColor = 'text-purple-600 bg-purple-50 dark:bg-purple-950/60';
              }

              return (
                <div
                  key={evt.id}
                  className="flex items-start gap-3 text-xs p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className={`p-2 rounded-xl shrink-0 ${iconColor}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {evt.title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {evt.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      {evt.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
