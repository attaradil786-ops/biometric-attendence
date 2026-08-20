import React, { useState, useMemo } from 'react';
import {
  Coffee,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Download,
  Play,
  Square,
  Users,
  Timer,
} from 'lucide-react';
import { BreakRecord, BreakType } from '../../types';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatTimeString, downloadCSV } from '../../utils/formatters';

export const BreaksPage: React.FC = () => {
  const {
    breaks,
    employees,
    settings,
    startBreak,
    endBreak,
    stats,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Manual Start Break Modal
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [selectedBreakType, setSelectedBreakType] = useState<BreakType>('Tea / Coffee');

  // Active breaks
  const activeBreaks = breaks.filter((b) => b.date === '2026-08-18' && b.status === 'Active');
  const completedToday = breaks.filter((b) => b.date === '2026-08-18' && b.status === 'Completed');
  const overbreakCount = breaks.filter((b) => b.date === '2026-08-18' && (b.status === 'Overbreak' || b.isOverbreak)).length;

  const totalBreakMinutes = completedToday.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  const avgBreakDuration = completedToday.length > 0 ? Math.round(totalBreakMinutes / completedToday.length) : 0;

  // Filtered break history
  const filteredBreaks = useMemo(() => {
    return breaks.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        b.employeeName.toLowerCase().includes(q) ||
        b.employeeId.toLowerCase().includes(q) ||
        b.departmentName.toLowerCase().includes(q);

      const matchesType = selectedType === 'all' || b.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || b.status === selectedStatus;

      return matchesQuery && matchesType && matchesStatus;
    }).sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.startTime.localeCompare(a.startTime);
    });
  }, [breaks, searchQuery, selectedType, selectedStatus]);

  const paginatedBreaks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBreaks.slice(start, start + pageSize);
  }, [filteredBreaks, currentPage, pageSize]);

  const handleStartBreakSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;
    startBreak(selectedEmpId, selectedBreakType);
    setIsStartModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Employee ID',
      'Employee Name',
      'Department',
      'Break Type',
      'Start Time',
      'End Time',
      'Duration (Mins)',
      'Status',
      'Overbreak',
    ];
    const rows = filteredBreaks.map((b) => [
      b.date,
      b.employeeId,
      b.employeeName,
      b.departmentName,
      b.type,
      b.startTime,
      b.endTime || 'Active',
      b.durationMinutes || 0,
      b.status,
      b.isOverbreak ? 'Yes' : 'No',
    ]);
    downloadCSV('Break_Records_BioSync.csv', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Break Monitoring & Tracking
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time meal & rest period management, policy duration limits, and overbreak alerts
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
            onClick={() => setIsStartModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Coffee className="w-4 h-4" />
            Start Break
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3 shadow-xs">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">
              Active Breaks Now
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {activeBreaks.length} Staff
            </p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3 shadow-xs">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">
              Total Breaks Today
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {breaks.filter((b) => b.date === '2026-08-18').length} Logs
            </p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3 shadow-xs">
          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">
              Avg Break Length
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {avgBreakDuration} Mins
            </p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3 shadow-xs">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">
              Overbreak Alerts
            </p>
            <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
              {overbreakCount} Exceeded
            </p>
          </div>
        </div>
      </div>

      {/* Active Breaks Live Monitor */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              Live Active Breaks Monitor
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Max daily allowed break allowance: {settings.breakRules.maxDailyBreakMinutes} minutes
            </p>
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-800">
            {activeBreaks.length} On Break
          </span>
        </div>

        {activeBreaks.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No employees are currently on a break. All clocked-in staff are on duty.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeBreaks.map((b) => {
              const emp = employees.find((e) => e.id === b.employeeId);
              const maxAllowance = b.type === 'Lunch' ? 45 : 15;
              const isOver = (b.durationMinutes || 0) > maxAllowance;

              return (
                <div
                  key={b.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isOver
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={emp?.avatarUrl}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {b.employeeName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {b.departmentName}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200">
                      {b.type}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Started at {formatTimeString(b.startTime)}</span>
                      <span className={`font-mono font-bold ${isOver ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
                        {b.durationMinutes}m elapsed
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, ((b.durationMinutes || 0) / maxAllowance) * 100)}%` }}
                        className={`h-full rounded-full transition-all ${
                          isOver ? 'bg-rose-500' : 'bg-amber-500'
                        }`}
                      />
                    </div>

                    {isOver && (
                      <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Exceeded policy allowance of {maxAllowance} mins
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => endBreak(b.employeeId)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Square className="w-3.5 h-3.5" />
                    End Break & Resume Work
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Break History Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
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

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Break Types</option>
              <option value="Tea Break">Tea Break</option>
              <option value="Lunch">Lunch</option>
              <option value="Coffee Break">Coffee Break</option>
              <option value="Personal">Personal</option>
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
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Employee</th>
                <th className="py-3.5 px-4 font-semibold">Department</th>
                <th className="py-3.5 px-4 font-semibold">Break Type</th>
                <th className="py-3.5 px-4 font-semibold">Start Time</th>
                <th className="py-3.5 px-4 font-semibold">End Time</th>
                <th className="py-3.5 px-4 font-semibold">Duration</th>
                <th className="py-3.5 px-4 font-semibold">Overbreak</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {paginatedBreaks.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={Coffee}
                      title="No break logs found"
                      description="No records match the current filter criteria."
                      actionLabel="Clear Filters"
                      onAction={() => {
                        setSearchQuery('');
                        setSelectedType('all');
                        setSelectedStatus('all');
                      }}
                    />
                  </td>
                </tr>
              ) : (
                paginatedBreaks.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {b.employeeName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {b.employeeId}
                        </p>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium">
                      {b.departmentName}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {b.type}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      {formatTimeString(b.startTime)}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-500">
                      {b.endTime ? formatTimeString(b.endTime) : 'In Progress'}
                    </td>

                    <td className="py-3 px-4 font-mono font-medium">
                      {b.durationMinutes} mins
                    </td>

                    <td className="py-3 px-4">
                      {b.isOverbreak ? (
                        <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded">
                          Yes (+{b.durationMinutes - (b.type === 'Lunch' ? 45 : 15)}m)
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Within Policy</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge type="break" status={b.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredBreaks.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Start Break Modal */}
      <Modal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        title="Initiate Employee Break"
        subtitle="Log break start for active clocked-in personnel"
        maxWidth="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsStartModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStartBreakSubmit}
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              Start Break
            </button>
          </>
        }
      >
        <form onSubmit={handleStartBreakSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Employee *
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.id}) - {emp.departmentName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Break Type *
            </label>
            <select
              value={selectedBreakType}
              onChange={(e) => setSelectedBreakType(e.target.value as BreakType)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Tea Break">Tea Break (15 mins max)</option>
              <option value="Lunch">Lunch Break (45 mins max)</option>
              <option value="Coffee Break">Coffee Break (15 mins max)</option>
              <option value="Personal">Personal Break (15 mins max)</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};
