import React from 'react';
import { Building2, User, Users, MapPin, CheckCircle2, Clock } from 'lucide-react';
import { Department, Employee, AttendanceRecord } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatTimeString } from '../../utils/formatters';

interface DepartmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department | null;
  employees: Employee[];
  attendance: AttendanceRecord[];
}

export const DepartmentDetailModal: React.FC<DepartmentDetailModalProps> = ({
  isOpen,
  onClose,
  department,
  employees,
  attendance,
}) => {
  if (!department) return null;

  const deptEmployees = employees.filter((e) => e.departmentId === department.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={department.name}
      subtitle={`${department.code} • Led by ${department.managerName}`}
      maxWidth="2xl"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50"
        >
          Close
        </button>
      }
    >
      <div className="space-y-4">
        {/* Info Header Strip */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400">Department Lead:</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">
              {department.managerName}
            </p>
          </div>
          <div>
            <span className="text-slate-400">Assigned Location:</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">
              {department.location}
            </p>
          </div>
          <div>
            <span className="text-slate-400">Total Enrolled Staff:</span>
            <p className="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
              {deptEmployees.length} Members
            </p>
          </div>
        </div>

        {department.description && (
          <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/20 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
            {department.description}
          </p>
        )}

        {/* Assigned Team Members Table */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Team Members & Today's Attendance ({deptEmployees.length})
          </h4>

          <div className="overflow-x-auto max-h-60 border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] sticky top-0">
                <tr>
                  <th className="p-2.5">Employee</th>
                  <th className="p-2.5">Designation</th>
                  <th className="p-2.5">Biometric ID</th>
                  <th className="p-2.5">Today Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {deptEmployees.map((emp) => {
                  const todayAtt = attendance.find(
                    (a) => a.employeeId === emp.id && a.date === '2026-08-18'
                  );

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-2.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={emp.avatarUrl}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {emp.fullName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {emp.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-300">
                        {emp.designation}
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-500">
                        {emp.biometricId}
                      </td>
                      <td className="p-2.5">
                        {todayAtt ? (
                          <StatusBadge type="attendance" status={todayAtt.status} size="sm" />
                        ) : (
                          <span className="text-[11px] text-slate-400">Unmarked</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
};
