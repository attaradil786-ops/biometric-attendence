import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  Fingerprint,
  Building2,
  ShieldCheck,
  ScanFace,
} from 'lucide-react';
import { Employee, EmployeeStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { EmployeeDetailModal } from './EmployeeDetailModal';
import { EmployeeFormModal } from "./Employeeformmodal";
import { formatDateString, downloadCSV } from '../../utils/formatters';

export const EmployeesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const {
    employees,
    departments,
    attendance,
    breaks,
    deleteEmployee,
    openBiometricEnrollment,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'id' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState<Employee | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  // Filtered & Sorted Employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        emp.fullName.toLowerCase().includes(q) ||
        emp.id.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.designation.toLowerCase().includes(q) ||
        emp.biometricId.toLowerCase().includes(q);

      const matchesDept = selectedDept === 'all' || emp.departmentId === selectedDept;
      const matchesStatus = selectedStatus === 'all' || emp.status === selectedStatus;

      return matchesQuery && matchesDept && matchesStatus;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.fullName.localeCompare(b.fullName);
      } else if (sortBy === 'id') {
        comparison = a.id.localeCompare(b.id);
      } else if (sortBy === 'date') {
        comparison = a.joiningDate.localeCompare(b.joiningDate);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [employees, searchQuery, selectedDept, selectedStatus, sortBy, sortOrder]);

  // Paginated records
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Department', 'Designation', 'Biometric ID', 'Joining Date', 'Status'];
    const rows = filteredEmployees.map((e) => [
      e.id,
      e.fullName,
      e.email,
      e.phone,
      e.departmentName,
      e.designation,
      e.biometricId,
      e.joiningDate,
      e.status,
    ]);
    downloadCSV('Employee_Roster_BioSync.csv', headers, rows);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Employee Directory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total of {employees.length} employees enrolled in biometric records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openBiometricEnrollment()}
            className="px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 rounded-xl hover:bg-emerald-100 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <ScanFace className="w-3.5 h-3.5" />
            Hardware Enrollment
          </button>
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
              setEmployeeToEdit(null);
              setIsFormOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Enroll Employee
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search name, ID, biometric..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Department Filter */}
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
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
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
            <option value="On Leave">On Leave</option>
            <option value="Suspended">Suspended</option>
            <option value="Terminated">Terminated</option>
          </select>

          {/* Sort By */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('-');
              setSortBy(sb as any);
              setSortOrder(so as any);
            }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="id-asc">Employee ID (Asc)</option>
            <option value="date-desc">Newest Joined</option>
            <option value="date-asc">Oldest Joined</option>
          </select>
        </div>
      </div>

      {/* Main Employee Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Employee</th>
                <th className="py-3.5 px-4 font-semibold">Department</th>
                <th className="py-3.5 px-4 font-semibold">Designation</th>
                <th className="py-3.5 px-4 font-semibold">Biometric ID</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Joining Date</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={Users}
                      title="No employees found"
                      description="No records match the current filter criteria."
                      actionLabel="Reset Filters"
                      onAction={() => {
                        setSearchQuery('');
                        setSelectedDept('all');
                        setSelectedStatus('all');
                      }}
                    />
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Employee Profile */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatarUrl}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">
                            {emp.fullName}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {emp.id} • {emp.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4">
                      <span className="font-medium">{emp.departmentName}</span>
                    </td>

                    {/* Designation */}
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {emp.designation}
                    </td>

                    {/* Biometric ID & Credentials */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Fingerprint className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {emp.biometricId}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <StatusBadge type="employee" status={emp.status} />
                    </td>

                    {/* Joining Date */}
                    <td className="py-3 px-4 text-slate-500">
                      {formatDateString(emp.joiningDate)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openBiometricEnrollment(emp.id)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors cursor-pointer"
                          title="Hardware Biometric Enrollment (Face / Fingerprint / RFID)"
                        >
                          <ScanFace className="w-4 h-4 text-emerald-500" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEmployeeForDetail(emp);
                            setIsDetailOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Profile & Attendance"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEmployeeToEdit(emp);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Employee"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEmployeeToDelete(emp);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
          totalItems={filteredEmployees.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Modals */}
      <EmployeeFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEmployeeToEdit(null);
        }}
        employeeToEdit={employeeToEdit}
      />

      <EmployeeDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedEmployeeForDetail(null);
        }}
        employee={selectedEmployeeForDetail}
        attendanceHistory={attendance}
        breakHistory={breaks}
        onEdit={(emp) => {
          setEmployeeToEdit(emp);
          setIsFormOpen(true);
        }}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setEmployeeToDelete(null);
        }}
        onConfirm={() => {
          if (employeeToDelete) {
            deleteEmployee(employeeToDelete.id);
          }
        }}
        title="Archive Employee Record"
        message={`Are you sure you want to remove ${employeeToDelete?.fullName} (${employeeToDelete?.id})? This will archive their biometric enrollment and attendance records.`}
        confirmText="Archive Employee"
        isDestructive
      />
    </div>
  );
};
