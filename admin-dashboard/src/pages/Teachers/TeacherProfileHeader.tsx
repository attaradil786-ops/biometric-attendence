import React from 'react';
import {
  Mail,
  Phone,
  Building2,
  Briefcase,
  Fingerprint,
  GraduationCap,
  MapPin,
  Clock,
  Edit2,
  Plus,
  Printer,
  Calendar,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { TeacherProfile } from '../../types';

interface TeacherProfileHeaderProps {
  teacher: TeacherProfile;
  onEditProfile: () => void;
  onAddLecture: () => void;
  onPrintTimetable?: () => void;
}

export const TeacherProfileHeader: React.FC<TeacherProfileHeaderProps> = ({
  teacher,
  onEditProfile,
  onAddLecture,
  onPrintTimetable,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs relative overflow-hidden">
      {/* Background Accent Gradient */}
      <div className="absolute top-0 right-0 w-96 h-40 bg-gradient-to-l from-indigo-500/10 via-sky-500/5 to-transparent pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Left: Avatar & Identity details */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative group">
            <img
              src={teacher.avatarUrl}
              alt={teacher.fullName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-indigo-200 dark:border-indigo-800 shadow-md"
            />
            <span
              className={`absolute -bottom-1.5 -right-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border shadow-2xs ${
                teacher.employmentStatus === 'Active'
                  ? 'bg-emerald-500 text-white border-white dark:border-slate-900'
                  : 'bg-amber-500 text-white border-white dark:border-slate-900'
              }`}
            >
              {teacher.employmentStatus}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {teacher.fullName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold text-xs border border-indigo-200 dark:border-indigo-800/60">
                {teacher.designation}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {teacher.department}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                ID: {teacher.employeeId}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1 font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                <Fingerprint className="w-3.5 h-3.5" />
                {teacher.biometricId}
              </span>
            </div>

            {/* Contact & Cabin row */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 pt-1 text-xs text-slate-500 dark:text-slate-400">
              <a
                href={`mailto:${teacher.email}`}
                className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{teacher.email}</span>
              </a>

              <a
                href={`tel:${teacher.phone}`}
                className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{teacher.phone}</span>
              </a>

              {teacher.cabinRoom && (
                <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{teacher.cabinRoom}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 pt-2 lg:pt-0">
          <button
            type="button"
            onClick={onEditProfile}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          {onPrintTimetable && (
            <button
              type="button"
              onClick={onPrintTimetable}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Print Timetable"
            >
              <Printer className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onAddLecture}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Lecture</span>
          </button>
        </div>
      </div>
    </div>
  );
};
