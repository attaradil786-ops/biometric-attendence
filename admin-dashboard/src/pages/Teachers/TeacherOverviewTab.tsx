import React from 'react';
import {
  GraduationCap,
  Clock,
  MapPin,
  Calendar,
  BookOpen,
  CheckCircle,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { TeacherProfile, Lecture, ScheduleStats as ScheduleStatsType } from '../../types';
import { NextLectureCard } from '../../components/schedule/NextLectureCard';
import { TodaySchedule } from '../../components/schedule/TodaySchedule';

interface TeacherOverviewTabProps {
  teacher: TeacherProfile;
  lectures: Lecture[];
  stats: ScheduleStatsType;
  onNavigateToSchedule: () => void;
  onLectureClick: (lecture: Lecture) => void;
  onAddLecture: () => void;
}

export const TeacherOverviewTab: React.FC<TeacherOverviewTabProps> = ({
  teacher,
  lectures,
  stats,
  onNavigateToSchedule,
  onLectureClick,
  onAddLecture,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Grid: Next Lecture & Today's Schedule side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 5 Cols: Next Lecture Hero Card & Quick Stats */}
        <div className="lg:col-span-5 space-y-4">
          <NextLectureCard
            lecture={stats.nextLecture}
            onViewDetails={onLectureClick}
            onAddLecture={onAddLecture}
          />

          {/* Quick Academic Profile Summary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-500" />
              <span>Academic Credentials</span>
            </h4>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Highest Qualification
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {teacher.qualification || 'Doctor of Philosophy (Ph.D.)'}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Office / Consultation Hours
                </span>
                <p className="font-mono font-medium text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {teacher.officeHours || 'Mon – Fri: 14:00 – 16:00'}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Faculty Cabin Location
                </span>
                <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {teacher.cabinRoom || 'Faculty Wing, Room 302'}
                </p>
              </div>
            </div>

            {/* Specialization Tags */}
            {teacher.specialization && teacher.specialization.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                  Key Research & Teaching Areas
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {teacher.specialization.map((spec) => (
                    <span
                      key={spec}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/50"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 7 Cols: Today's Lectures & Weekly Workload Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          <TodaySchedule
            lectures={lectures}
            onLectureClick={onLectureClick}
            onAddLecture={onAddLecture}
          />

          {/* Workload & Full Schedule CTA */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Weekly Teaching Load
                </h4>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {stats.lecturesThisWeek} Lectures • {stats.hoursThisWeek} Hours Scheduled
                </p>
              </div>

              <button
                type="button"
                onClick={onNavigateToSchedule}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer group"
              >
                <span>View Full Timetable</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Distribution Bar */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>Theory ({Math.max(0, stats.hoursThisWeek - stats.practicalLabHours)}h)</span>
                <span>Labs & Practicals ({stats.practicalLabHours}h)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                <div
                  className="bg-indigo-600 h-full"
                  style={{
                    width: `${
                      stats.hoursThisWeek > 0
                        ? Math.round(
                            ((stats.hoursThisWeek - stats.practicalLabHours) / stats.hoursThisWeek) *
                              100
                          )
                        : 50
                    }%`,
                  }}
                />
                <div
                  className="bg-emerald-500 h-full"
                  style={{
                    width: `${
                      stats.hoursThisWeek > 0
                        ? Math.round((stats.practicalLabHours / stats.hoursThisWeek) * 100)
                        : 50
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Bio */}
            {teacher.bio && (
              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                  "{teacher.bio}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
