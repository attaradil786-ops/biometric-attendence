import React, { useState } from 'react';
import {
  User,
  Fingerprint,
  ScanFace,
  CreditCard,
  Mail,
  Phone,
  Building2,
  Calendar,
  Clock,
  Coffee,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Employee, AttendanceRecord, BreakRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatMinutesToHours, formatTimeString, formatDateString } from '../../utils/formatters';

interface EmployeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  attendanceHistory: AttendanceRecord[];
  breakHistory: BreakRecord[];
  onEdit: (emp: Employee) => void;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  isOpen,
  onClose,
  employee,
  attendanceHistory,
  breakHistory,
  onEdit,
}) => {
  const { openBiometricEnrollment } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'breaks' | 'biometrics'>('overview');

  if (!employee) return null;

  const empAttendance = attendanceHistory.filter((a) => a.employeeId === employee.id);
  const empBreaks = breakHistory.filter((b) => b.employeeId === employee.id);

  const presentDays = empAttendance.filter((a) => ['Present', 'Working', 'Early Checkout'].includes(a.status)).length;
  const lateDays = empAttendance.filter((a) => a.status === 'Late' || a.lateMinutes > 0).length;
  const absentDays = empAttendance.filter((a) => a.status === 'Absent').length;

  const totalMinutes = empAttendance.reduce((acc, curr) => acc + (curr.workDurationMinutes || 0), 0);
  const avgHours = empAttendance.length > 0 ? (totalMinutes / empAttendance.length / 60).toFixed(1) : '0';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee.fullName}
      subtitle={`${employee.id} • ${employee.designation} • ${employee.departmentName}`}
      maxWidth="3xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-slate-500">
            Enrolled: {formatDateString(employee.joiningDate)}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(employee);
              }}
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              Edit Profile
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Profile Card Header */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <img
            src={employee.avatarUrl}
            alt={employee.fullName}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-slate-700 shadow-md shrink-0"
          />
          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {employee.fullName}
              </h4>
              <StatusBadge type="employee" status={employee.status} size="sm" />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {employee.designation} • {employee.departmentName}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                {employee.biometricId}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {employee.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {employee.phone}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Overview & Stats
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'attendance'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Attendance Logs ({empAttendance.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('breaks')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'breaks'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Break History ({empBreaks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('biometrics')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'biometrics'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Biometric Enrolment
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* KPI Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-center">
                <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase">
                  Present Days
                </p>
                <p className="text-xl font-bold text-emerald-900 dark:text-emerald-200 mt-0.5">
                  {presentDays}
                </p>
              </div>
              <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl text-center">
                <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase">
                  Late Days
                </p>
                <p className="text-xl font-bold text-amber-900 dark:text-amber-200 mt-0.5">
                  {lateDays}
                </p>
              </div>
              <div className="p-3 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-xl text-center">
                <p className="text-[11px] font-semibold text-rose-800 dark:text-rose-300 uppercase">
                  Absent Days
                </p>
                <p className="text-xl font-bold text-rose-900 dark:text-rose-200 mt-0.5">
                  {absentDays}
                </p>
              </div>
              <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 rounded-xl text-center">
                <p className="text-[11px] font-semibold text-indigo-800 dark:text-indigo-300 uppercase">
                  Avg Daily Hours
                </p>
                <p className="text-xl font-bold text-indigo-900 dark:text-indigo-200 mt-0.5">
                  {avgHours}h
                </p>
              </div>
            </div>

            {/* Profile Detail Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-400">Emergency Contact:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {employee.emergencyContact || 'Not specified'}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Office Location / Address:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {employee.address || 'Headquarters'}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Assigned Shift:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  General Shift (09:00 - 18:00)
                </p>
              </div>
              <div>
                <span className="text-slate-400">Total Logged Minutes:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {formatMinutesToHours(totalMinutes)}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] sticky top-0">
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Check-In</th>
                  <th className="p-2.5">Check-Out</th>
                  <th className="p-2.5">Work Duration</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {empAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  empAttendance.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-2.5 font-medium">{formatDateString(rec.date)}</td>
                      <td className="p-2.5 font-mono">{formatTimeString(rec.checkIn)}</td>
                      <td className="p-2.5 font-mono">{formatTimeString(rec.checkOut)}</td>
                      <td className="p-2.5 font-mono">{formatMinutesToHours(rec.workDurationMinutes)}</td>
                      <td className="p-2.5">
                        <StatusBadge type="attendance" status={rec.status} size="sm" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'breaks' && (
          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] sticky top-0">
                <tr>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Start</th>
                  <th className="p-2.5">End</th>
                  <th className="p-2.5">Duration</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {empBreaks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No break records logged today.
                    </td>
                  </tr>
                ) : (
                  empBreaks.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-2.5 font-semibold">{b.type}</td>
                      <td className="p-2.5 font-mono">{formatTimeString(b.startTime)}</td>
                      <td className="p-2.5 font-mono">{formatTimeString(b.endTime)}</td>
                      <td className="p-2.5 font-mono">{b.durationMinutes} mins</td>
                      <td className="p-2.5">
                        <StatusBadge type="break" status={b.status} size="sm" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'biometrics' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hardware biometric template registration status across organization scanners:
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openBiometricEnrollment(employee.id);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Launch Hardware Enrollment</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <ScanFace className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Face ID Mesh</span>
                </div>
                {employee.enrolledBiometrics.face ? (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                    ✓ Enrolled
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    Not Set
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Fingerprint</span>
                </div>
                {employee.enrolledBiometrics.fingerprint ? (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                    ✓ Enrolled
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    Not Set
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">RFID Smart Card</span>
                </div>
                {employee.enrolledBiometrics.rfidCard ? (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                    ✓ Enrolled
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    Not Set
                  </span>
                )}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Biometric Terminal UID: <code className="font-mono text-indigo-600 dark:text-indigo-400">{employee.biometricId}</code>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Replicated across 4 physical gateways with 256-bit SHA keying.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openBiometricEnrollment(employee.id);
                }}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Re-scan or Update Identity →
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
