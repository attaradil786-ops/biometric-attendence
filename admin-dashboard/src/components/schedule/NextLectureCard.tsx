import React from 'react';
import { Sparkles, Clock, MapPin, Users, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';
import { Lecture } from '../../types';
import { format12Hour, formatTimeRange, getLectureLiveStatus } from '../../utils/scheduleUtils';

interface NextLectureCardProps {
  lecture: Lecture | null;
  onViewDetails?: (lecture: Lecture) => void;
  onAddLecture?: () => void;
}

export const NextLectureCard: React.FC<NextLectureCardProps> = ({
  lecture,
  onViewDetails,
  onAddLecture,
}) => {
  if (!lecture) {
    return (
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 rounded-2xl p-5 text-white border border-indigo-950 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
        <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Upcoming Schedule</span>
        </div>
        <h4 className="text-base font-bold text-slate-100">No More Lectures Today</h4>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          All scheduled sessions for today have concluded or no lectures are currently booked.
        </p>
        {onAddLecture && (
          <button
            type="button"
            onClick={onAddLecture}
            className="mt-3.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>+ Schedule New Lecture</span>
          </button>
        )}
      </div>
    );
  }

  const liveStatus = getLectureLiveStatus(lecture.day, lecture.startTime, lecture.endTime);
  const isLive = liveStatus === 'In Progress';

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-2xl p-5 text-white border border-indigo-800/50 shadow-lg relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl" />

      {/* Header Tag */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-300" />
            {isLive ? 'Currently Happening' : 'Next Lecture'}
          </span>
          <span className="text-xs text-indigo-300 font-semibold">{lecture.day}</span>
        </div>

        {isLive && (
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Live Now
          </span>
        )}
      </div>

      {/* Subject & Code */}
      <div className="mb-3">
        <h4 className="text-lg font-black text-white tracking-tight leading-snug">
          {lecture.subject}
        </h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-indigo-200 font-medium">{lecture.type}</span>
          {lecture.courseCode && (
            <span className="text-[11px] font-mono text-indigo-300/80">({lecture.courseCode})</span>
          )}
        </div>
      </div>

      {/* Metadata Badges */}
      <div className="grid grid-cols-2 gap-2 text-xs py-2.5 border-y border-indigo-800/40 my-3">
        <div className="flex items-center gap-2 text-indigo-100">
          <Users className="w-3.5 h-3.5 text-indigo-300" />
          <span className="font-semibold">Class {lecture.className}</span>
        </div>

        <div className="flex items-center gap-2 text-indigo-100 justify-end">
          <MapPin className="w-3.5 h-3.5 text-indigo-300" />
          <span className="font-mono font-semibold">{lecture.room}</span>
        </div>
      </div>

      {/* Timing and CTA */}
      <div className="flex items-center justify-between text-xs pt-1">
        <div className="flex items-center gap-1.5 font-mono font-bold text-indigo-200">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            {isLive
              ? `Ends at ${format12Hour(lecture.endTime)}`
              : `Starts at ${format12Hour(lecture.startTime)}`}
          </span>
        </div>

        {onViewDetails && (
          <button
            type="button"
            onClick={() => onViewDetails(lecture)}
            className="text-xs font-semibold text-white hover:text-indigo-200 flex items-center gap-1 transition-colors cursor-pointer group"
          >
            <span>View Details</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};
