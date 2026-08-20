import React from 'react';
import { AlertTriangle, Trash2, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Lecture } from '../../types';
import { formatTimeRange } from '../../utils/scheduleUtils';

interface DeleteLectureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  lecture: Lecture | null;
  isDeleting?: boolean;
}

export const DeleteLectureDialog: React.FC<DeleteLectureDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  lecture,
  isDeleting = false,
}) => {
  if (!isOpen || !lecture) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scaleUp">
        <div className="p-5 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center mx-auto mb-3.5">
            <Trash2 className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Delete Lecture Schedule?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            Are you sure you want to remove this lecture from the teacher's weekly timetable? This action cannot be undone.
          </p>

          {/* Lecture summary preview */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-left text-xs space-y-1.5 mb-4">
            <p className="font-bold text-slate-900 dark:text-white truncate">
              {lecture.subject}
            </p>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{lecture.day}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="font-mono">{formatTimeRange(lecture.startTime, lecture.endTime)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
              <Users className="w-3 h-3 text-slate-400 shrink-0" />
              <span>Class {lecture.className}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="font-mono">Room {lecture.room}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
