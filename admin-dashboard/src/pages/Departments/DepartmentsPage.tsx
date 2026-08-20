import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Users,
  MapPin,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { Department } from '../../types';
import { useApp } from '../../context/AppContext';
import { DepartmentFormModal } from './DepartmentFormModal';
import { DepartmentDetailModal } from './DepartmentDetailModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export const DepartmentsPage: React.FC = () => {
  const { departments, employees, attendance, deleteDepartment } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deptToEdit, setDeptToEdit] = useState<Department | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDeptForDetail, setSelectedDeptForDetail] = useState<Department | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);

  const filteredDepartments = departments.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      d.managerName.toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Departments & Organizational Units
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage organizational divisions, shift schedules, and department managers
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setDeptToEdit(null);
            setIsFormOpen(true);
          }}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search department, code, lead..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <span className="text-xs text-slate-400">
          {filteredDepartments.length} Departments Configured
        </span>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepartments.map((dept) => {
          const deptEmployees = employees.filter((e) => e.departmentId === dept.id);
          const activeToday = attendance.filter(
            (a) =>
              deptEmployees.some((e) => e.id === a.employeeId) &&
              a.date === '2026-08-18' &&
              ['Present', 'Working'].includes(a.status)
          ).length;

          return (
            <div
              key={dept.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div>
                {/* Header Strip */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {dept.code}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {dept.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {dept.location}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {deptEmployees.length} Staff
                  </span>
                </div>

                {dept.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                    {dept.description}
                  </p>
                )}

                {/* Manager & Live Stats */}
                <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Department Lead:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {dept.managerName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Turnout Today:</span>
                    <span className="font-bold text-emerald-600">
                      {activeToday} / {deptEmployees.length} on shift
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDeptForDetail(dept);
                    setIsDetailOpen(true);
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Members
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDeptToEdit(dept);
                      setIsFormOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Edit Department"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeptToDelete(dept);
                      setIsDeleteOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Delete Department"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Modal */}
      <DepartmentFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setDeptToEdit(null);
        }}
        deptToEdit={deptToEdit}
      />

      {/* Detail Modal */}
      <DepartmentDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedDeptForDetail(null);
        }}
        department={selectedDeptForDetail}
        employees={employees}
        attendance={attendance}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeptToDelete(null);
        }}
        onConfirm={() => {
          if (deptToDelete) {
            deleteDepartment(deptToDelete.id);
          }
        }}
        title="Delete Department"
        message={`Are you sure you want to delete ${deptToDelete?.name}? Assigned employees will need to be reallocated.`}
        confirmText="Delete Department"
        isDestructive
      />
    </div>
  );
};
