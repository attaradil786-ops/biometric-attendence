import React from 'react';
import {
  Clock,
  MapPin,
  Users,
  BookOpen,
  Calendar,
  Edit2,
  Trash2,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Lecture, DayOfWeek, LectureType, ScheduleFilterState } from '../../types';
import {
  format12Hour,
  formatTimeRange,
  getLectureLiveStatus,
  getLectureTypeBadgeConfig,
  getLectureDurationHours,
  timeToMinutes,
} from '../../utils/scheduleUtils';

interface ScheduleListProps {
  lectures: Lecture[];
  filters: ScheduleFilterState;
  onLectureClick: (lecture: Lecture) => void;
  onEditLecture: (lecture: Lecture) => void;
  onDeleteLecture: (lecture: Lecture) => void;
  onAddLecture: () => void;
}

export const ScheduleList: React.FC<ScheduleListProps> = ({
  lectures,
  filters,
  onLectureClick,
  onEditLecture,
  onDeleteLecture,
  onAddLecture,
}) => {
  // Apply all search and filter conditions
  const filteredLectures = lectures.filter((lec) => {
    // 1. Search keyword
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchSubject = lec.subject.toLowerCase().includes(q);
      const matchClass = lec.className.toLowerCase().includes(q);
      const matchRoom = lec.room.toLowerCase().includes(q);
      const matchNotes = (lec.notes || '').toLowerCase().includes(q);
      const matchCode = (lec.courseCode || '').toLowerCase().includes(q);
      if (!matchSubject && !matchClass && !matchRoom && !matchNotes && !matchCode) {
        return false;
      }
    }

    // 2. Subject filter
    if (filters.subject && lec.subject !== filters.subject) {
      return false;
    }

    // 3. Class filter
    if (filters.className && lec.className !== filters.className) {
      return false;
    }

    // 4. Room filter
    if (filters.room && lec.room !== filters.room) {
      return false;
    }

    // 5. Type filter
    if (filters.type && lec.type !== filters.type) {
      return false;
    }

    // 6. Day filter
    if (filters.day && filters.day !== 'All' && lec.day !== filters.day) {
      return false;
    }

    return true;
  });

  // Sort by day of week, then start time
  const dayOrder: Record<DayOfWeek, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const sortedLectures = [...filteredLectures].sort((a, b) => {
    const diff = dayOrder[a.day] - dayOrder[b.day];
    if (diff !== 0) return diff;
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
      {/* Table Top Counter */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            Schedule Directory Table
          </h4>
          <p className="text-[11px] text-slate-400">
            Showing {sortedLectures.length} of {lectures.length} total scheduled slots
          </p>
        </div>

        <button
          type="button"
          onClick={onAddLecture}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
        >
          + Add Lecture
        </button>
      </div>

      {sortedLectures.length === 0 ? (
        <div className="py-16 text-center max-w-sm mx-auto">
          <p className="font-bold text-sm text-slate-900 dark:text-white">No Lectures Found</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            No lectures match your current search filters. Try clearing some criteria or add a new schedule entry.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Day</th>
                <th className="py-3 px-4">Subject / Course</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-4">Time Window</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedLectures.map((lec) => {
                const badge = getLectureTypeBadgeConfig(lec.type);
                const status = getLectureLiveStatus(lec.day, lec.startTime, lec.endTime);
                const duration = getLectureDurationHours(lec.startTime, lec.endTime);

                return (
                  <tr
                    key={lec.id}
                    onClick={() => onLectureClick(lec)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    {/* Day */}
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{lec.day}</span>
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      <div>
                        <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {lec.subject}
                        </span>
                        {lec.courseCode && (
                          <span className="block text-[10.5px] font-mono text-slate-400">
                            {lec.courseCode}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Class */}
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-semibold">
                        {lec.className}
                      </span>
                    </td>

                    {/* Room */}
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{lec.room}</span>
                      </div>
                    </td>

                    {/* Time Window */}
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatTimeRange(lec.startTime, lec.endTime)}</span>
                        <span className="text-[10px] text-slate-400 font-sans">({duration}h)</span>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {lec.type}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {status === 'In Progress' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live Now
                        </span>
                      ) : status === 'Completed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          <CheckCircle2 className="w-3 h-3 text-slate-400" />
                          Done
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          Upcoming
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onEditLecture(lec)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteLecture(lec)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
