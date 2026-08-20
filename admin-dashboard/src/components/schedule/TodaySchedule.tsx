import React from 'react';
import { Calendar, Clock, MapPin, Users, CheckCircle2, PlayCircle, Plus } from 'lucide-react';
import { Lecture, DayOfWeek } from '../../types';
import {
  formatTimeRange,
  getLectureLiveStatus,
  getCurrentDayOfWeek,
  timeToMinutes,
  getLectureTypeBadgeConfig,
} from '../../utils/scheduleUtils';

interface TodayScheduleProps {
  lectures: Lecture[];
  onLectureClick?: (lecture: Lecture) => void;
  onAddLecture?: () => void;
  selectedDay?: DayOfWeek;
}

export const TodaySchedule: React.FC<TodayScheduleProps> = ({
  lectures,
  onLectureClick,
  onAddLecture,
  selectedDay,
}) => {
  const currentDay = selectedDay || getCurrentDayOfWeek();

  const todayLectures = lectures
    .filter((l) => l.day === currentDay)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs">
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Today's Lectures ({currentDay})
            </h4>
            <p className="text-[11px] text-slate-400">
              {todayLectures.length} scheduled session{todayLectures.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {onAddLecture && (
          <button
            type="button"
            onClick={onAddLecture}
            className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Add Lecture for Today"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {todayLectures.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            No lectures scheduled for {currentDay}.
          </p>
          {onAddLecture && (
            <button
              type="button"
              onClick={onAddLecture}
              className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              + Add lecture for {currentDay}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {todayLectures.map((lec) => {
            const status = getLectureLiveStatus(lec.day, lec.startTime, lec.endTime);
            const badgeConfig = getLectureTypeBadgeConfig(lec.type);

            return (
              <div
                key={lec.id}
                onClick={() => onLectureClick && onLectureClick(lec)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  status === 'In Progress'
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700/80 shadow-xs ring-1 ring-indigo-500/20'
                    : status === 'Completed'
                    ? 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-75'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-2xs'
                }`}
              >
                {/* Header: Timing & Status Badge */}
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-700 dark:text-slate-200">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatTimeRange(lec.startTime, lec.endTime)}</span>
                  </div>

                  {status === 'In Progress' ? (
                    <span className="flex items-center gap-1 text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live Now
                    </span>
                  ) : status === 'Completed' ? (
                    <span className="flex items-center gap-1 text-[10.5px] font-medium text-slate-500">
                      <CheckCircle2 className="w-3 h-3 text-slate-400" />
                      Done
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                      Upcoming
                    </span>
                  )}
                </div>

                {/* Subject & Type */}
                <div className="flex items-baseline justify-between gap-1.5">
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white leading-tight truncate">
                    {lec.subject}
                  </h5>
                  <span className={`text-[10px] font-medium shrink-0 ${badgeConfig.text}`}>
                    {lec.type}
                  </span>
                </div>

                {/* Class & Room */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span>Class {lec.className}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{lec.room}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
