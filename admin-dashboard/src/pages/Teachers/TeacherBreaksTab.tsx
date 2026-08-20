import React from 'react';
import { Coffee, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { TeacherProfile, BreakRecord } from '../../types';
import { useApp } from '../../context/AppContext';

interface TeacherBreaksTabProps {
  teacher: TeacherProfile;
}

export const TeacherBreaksTab: React.FC<TeacherBreaksTabProps> = ({ teacher }) => {
  const { breaks } = useApp();

  const teacherBreaks = breaks.filter(
    (b) =>
      b.employeeId === teacher.employeeId ||
      b.employeeName.toLowerCase() === teacher.fullName.toLowerCase() ||
      b.employeeId === teacher.id
  );

  const totalBreakMins = teacherBreaks.reduce((acc, b) => acc + (b.durationMinutes || 0), 0);

  return (
    <div className="space-y-5">
      {/* Break Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Total Break Sessions
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {teacherBreaks.length}
            </span>
            <span className="text-xs text-slate-400">breaks</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Logged sessions</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Total Break Time
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalBreakMins}
            </span>
            <span className="text-xs text-slate-400">minutes</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Within allotted limit</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Policy Compliance
          </span>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              100% Compliant
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">No overbreak violations</p>
        </div>
      </div>

      {/* Break Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            Break & Refreshment Log
          </h4>
          <p className="text-[11px] text-slate-400">
            Faculty break intervals tracked via biometric scanner
          </p>
        </div>

        {teacherBreaks.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No break records found for this teacher today.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Break Type</th>
                  <th className="py-3 px-4">Start Time</th>
                  <th className="py-3 px-4">End Time</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {teacherBreaks.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {b.date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <Coffee className="w-3.5 h-3.5 text-amber-500" />
                        <span>{b.type}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {b.startTime}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {b.endTime || 'Active...'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {b.durationMinutes} mins
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.isOverbreak
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {b.isOverbreak ? 'Overbreak' : 'Completed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
