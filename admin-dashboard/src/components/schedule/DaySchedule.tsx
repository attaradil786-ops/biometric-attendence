import React from 'react';
import { Clock, Plus, MapPin, Users, Calendar, AlertCircle, Sparkles } from 'lucide-react';
import { Lecture, DayOfWeek, TeacherProfile } from '../../types';
import { ALL_DAYS } from '../../data/scheduleData';
import {
  formatTimeRange,
  getLectureLiveStatus,
  getLectureTypeBadgeConfig,
  getLectureDurationHours,
  timeToMinutes,
} from '../../utils/scheduleUtils';
import { LectureCard } from './LectureCard';

interface DayScheduleProps {
  lectures: Lecture[];
  teacher: TeacherProfile;
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  onLectureClick: (lecture: Lecture) => void;
  onEditLecture: (lecture: Lecture) => void;
  onDeleteLecture: (lecture: Lecture) => void;
  onAddLecture: (defaultDay?: DayOfWeek, defaultStartTime?: string) => void;
}

export const DaySchedule: React.FC<DayScheduleProps> = ({
  lectures,
  teacher,
  selectedDay,
  onSelectDay,
  onLectureClick,
  onEditLecture,
  onDeleteLecture,
  onAddLecture,
}) => {
  const dayLectures = lectures
    .filter((l) => l.day === selectedDay)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const totalDayHours = dayLectures.reduce(
    (acc, l) => acc + getLectureDurationHours(l.startTime, l.endTime),
    0
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
      {/* Day Selector Ribbon */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {ALL_DAYS.map((day) => {
            const count = lectures.filter((l) => l.day === day).length;
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                type="button"
                onClick={() => onSelectDay(day)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span>{day}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500 font-medium">
            <strong className="text-slate-900 dark:text-white">{dayLectures.length}</strong> lectures ({totalDayHours}h)
          </span>
          <button
            type="button"
            onClick={() => onAddLecture(selectedDay)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Lecture</span>
          </button>
        </div>
      </div>

      {/* Timeline Schedule Body */}
      <div className="p-4 sm:p-6">
        {dayLectures.length === 0 ? (
          <div className="py-16 text-center max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              No Lectures for {selectedDay}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              This day is currently free for {teacher.fullName}. You can assign a new lecture, practical, or examination slot.
            </p>
            <button
              type="button"
              onClick={() => onAddLecture(selectedDay)}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Lecture for {selectedDay}</span>
            </button>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {dayLectures.map((lecture) => {
              const liveStatus = getLectureLiveStatus(
                lecture.day,
                lecture.startTime,
                lecture.endTime
              );
              const badge = getLectureTypeBadgeConfig(lecture.type);

              return (
                <div key={lecture.id} className="relative group">
                  {/* Timeline node dot */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-3.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                      liveStatus === 'In Progress'
                        ? 'bg-emerald-500 ring-4 ring-emerald-500/20'
                        : liveStatus === 'Completed'
                        ? 'bg-slate-400'
                        : 'bg-indigo-600 ring-4 ring-indigo-500/20'
                    }`}
                  />

                  {/* Card Container */}
                  <div className="max-w-2xl">
                    <LectureCard
                      lecture={lecture}
                      onClick={onLectureClick}
                      onEdit={onEditLecture}
                      onDelete={onDeleteLecture}
                      compact={false}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
