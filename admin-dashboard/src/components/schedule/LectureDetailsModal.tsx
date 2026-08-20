import React from 'react';
import {
  X,
  Clock,
  MapPin,
  Users,
  BookOpen,
  Calendar,
  Edit2,
  Trash2,
  FileText,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { Lecture, TeacherProfile } from '../../types';
import {
  formatTimeRange,
  getLectureDurationHours,
  getLectureTypeBadgeConfig,
  getLectureLiveStatus,
} from '../../utils/scheduleUtils';

interface LectureDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lecture: Lecture | null;
  teacher?: TeacherProfile;
  onEdit: (lecture: Lecture) => void;
  onDelete: (lecture: Lecture) => void;
}

export const LectureDetailsModal: React.FC<LectureDetailsModalProps> = ({
  isOpen,
  onClose,
  lecture,
  teacher,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !lecture) return null;

  const duration = getLectureDurationHours(lecture.startTime, lecture.endTime);
  const badgeConfig = getLectureTypeBadgeConfig(lecture.type);
  const liveStatus = getLectureLiveStatus(lecture.day, lecture.startTime, lecture.endTime);

  const getStatusBadge = () => {
    switch (liveStatus) {
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live / In Progress
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
            Completed
          </span>
        );
      case 'Upcoming':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            Upcoming
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badgeConfig.bg} ${badgeConfig.text} ${badgeConfig.border}`}
              >
                {lecture.type}
              </span>
              {getStatusBadge()}
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {lecture.subject}
            </h3>
            {lecture.courseCode && (
              <span className="text-xs font-mono text-slate-400">{lecture.courseCode}</span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Key metadata grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Day & Schedule</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{lecture.day}</p>
              <p className="text-slate-500 font-mono mt-0.5">
                {formatTimeRange(lecture.startTime, lecture.endTime)} ({duration}h)
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Class & Hall</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">Class {lecture.className}</p>
              <p className="text-slate-500 font-mono mt-0.5">Room {lecture.room}</p>
            </div>
          </div>

          {/* Teacher Reference */}
          {teacher && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={teacher.avatarUrl}
                  alt={teacher.fullName}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{teacher.fullName}</p>
                  <p className="text-[11px] text-slate-400">{teacher.designation} • {teacher.department}</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-500">{teacher.biometricId}</span>
            </div>
          )}

          {/* Syllabus / Notes */}
          {lecture.notes && (
            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
              <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-semibold mb-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Lecture Syllabus & Notes</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                {lecture.notes}
              </p>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50/70 dark:bg-slate-900/70 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete(lecture);
            }}
            className="px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Lecture
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(lecture);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Lecture
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
