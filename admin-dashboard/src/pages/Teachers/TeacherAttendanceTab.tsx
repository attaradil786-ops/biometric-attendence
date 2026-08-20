import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Fingerprint,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { TeacherProfile, AttendanceRecord } from '../../types';
import { useApp } from '../../context/AppContext';

interface TeacherAttendanceTabProps {
  teacher: TeacherProfile;
}

export const TeacherAttendanceTab: React.FC<TeacherAttendanceTabProps> = ({ teacher }) => {
  const { attendance } = useApp();
  const [filterMonth, setFilterMonth] = useState('All');

  // Filter attendance records for this teacher
  const teacherRecords = attendance.filter(
    (rec) =>
      rec.employeeId === teacher.employeeId ||
      rec.employeeName.toLowerCase() === teacher.fullName.toLowerCase() ||
      rec.employeeId === teacher.id
  );

  const presentCount = teacherRecords.filter((r) => r.status === 'Present' || r.status === 'Working').length;
  const lateCount = teacherRecords.filter((r) => r.status === 'Late').length;
  const totalMinutes = teacherRecords.reduce((acc, r) => acc + (r.workDurationMinutes || 0), 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  return (
    <div className="space-y-5">
      {/* Metrics Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Recorded Days
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {teacherRecords.length}
            </span>
            <span className="text-xs text-slate-400">logs</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            {presentCount} Present / Active
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Total Logged Hours
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalHours}
            </span>
            <span className="text-xs text-slate-400">hours</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Biometric punches</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Late Check-ins
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {lateCount}
            </span>
            <span className="text-xs text-slate-400">occurrences</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Within grace window</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Biometric Enrolled
          </span>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              {teacher.biometricId}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Face ID & RFID Active</p>
        </div>
      </div>

      {/* Attendance Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Biometric Punch History
            </h4>
            <p className="text-[11px] text-slate-400">
              Terminal verification records for faculty member {teacher.fullName}
            </p>
          </div>
        </div>

        {teacherRecords.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No biometric attendance records found for this teacher ID.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4">Effective Hours</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {teacherRecords.map((rec) => {
                  const hours = Math.round((rec.workDurationMinutes / 60) * 10) / 10;

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {rec.date}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {rec.checkIn || '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {rec.checkOut || 'Active In-Office'}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                        {hours}h
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10.5px]">
                          <Fingerprint className="w-3 h-3 text-indigo-500" />
                          <span>{rec.verificationMethod || 'Face ID'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            rec.status === 'Present' || rec.status === 'Working'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : rec.status === 'Late'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
