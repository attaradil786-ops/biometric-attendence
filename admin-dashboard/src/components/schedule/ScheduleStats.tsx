import React from 'react';
import { Calendar, Clock, BookOpen, FlaskConical, Sparkles, ArrowUpRight } from 'lucide-react';
import { ScheduleStats as ScheduleStatsType } from '../../types';
import { formatTimeRange } from '../../utils/scheduleUtils';

interface ScheduleStatsProps {
  stats: ScheduleStatsType;
  onViewToday?: () => void;
}

export const ScheduleStats: React.FC<ScheduleStatsProps> = ({ stats, onViewToday }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Lectures This Week */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Weekly Lectures
          </span>
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.lecturesThisWeek}
          </span>
          <span className="text-xs text-slate-500 font-medium">classes</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Across Mon – Sat Timetable</p>
      </div>

      {/* Teaching Hours This Week */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Workload
          </span>
          <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.hoursThisWeek}
          </span>
          <span className="text-xs text-slate-500 font-medium">hours / week</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Scheduled academic load</p>
      </div>

      {/* Lectures Today */}
      <div
        onClick={onViewToday}
        className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs ${
          onViewToday ? 'cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Today's Lectures
          </span>
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.lecturesToday}
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {stats.upcomingLecturesToday} upcoming
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Active for today</p>
      </div>

      {/* Practical / Lab Hours */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Labs & Practicals
          </span>
          <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
            <FlaskConical className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.practicalLabHours}
          </span>
          <span className="text-xs text-slate-500 font-medium">hours</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Hands-on & Lab Sessions</p>
      </div>
    </div>
  );
};
