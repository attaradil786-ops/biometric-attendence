import React from 'react';
import { Clock, MapPin, Users, BookOpen, Edit2, Trash2, GripVertical, AlertCircle } from 'lucide-react';
import { Lecture } from '../../types';
import { formatTimeRange, getLectureColorStyles, getLectureTypeBadgeConfig } from '../../utils/scheduleUtils';

interface LectureCardProps {
  lecture: Lecture;
  onClick?: (lecture: Lecture) => void;
  onEdit?: (lecture: Lecture) => void;
  onDelete?: (lecture: Lecture) => void;
  draggable?: boolean;
  compact?: boolean;
}

export const LectureCard: React.FC<LectureCardProps> = ({
  lecture,
  onClick,
  onEdit,
  onDelete,
  draggable = true,
  compact = false,
}) => {
  const styles = getLectureColorStyles(lecture.type, lecture.colorTheme);
  const badgeConfig = getLectureTypeBadgeConfig(lecture.type);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(lecture));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable={draggable}
      onDragStart={handleDragStart}
      onClick={() => onClick && onClick(lecture)}
      className={`group relative rounded-xl border p-2.5 transition-all duration-200 cursor-pointer select-none shadow-2xs hover:shadow-md hover:-translate-y-0.5 ${styles.cardBg} ${styles.border} ${styles.leftStripe}`}
    >
      {/* Top row: Subject & Type Badge */}
      <div className="flex items-start justify-between gap-1.5 mb-1.5">
        <div className="min-w-0 flex-1">
          <h4
            className={`font-bold text-xs leading-snug line-clamp-2 ${styles.title}`}
            title={lecture.subject}
          >
            {lecture.subject}
          </h4>
          {lecture.courseCode && (
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              {lecture.courseCode}
            </span>
          )}
        </div>

        <span
          className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${badgeConfig.bg} ${badgeConfig.text} ${badgeConfig.border}`}
        >
          {lecture.type}
        </span>
      </div>

      {/* Class & Room */}
      <div className="grid grid-cols-2 gap-1 mb-2 text-[11px]">
        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium truncate">
          <Users className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">Class {lecture.className}</span>
        </div>

        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium truncate justify-end">
          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate font-mono">{lecture.room}</span>
        </div>
      </div>

      {/* Time footer & action buttons */}
      <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60 text-[10.5px]">
        <div className="flex items-center gap-1 font-mono font-semibold text-slate-600 dark:text-slate-300">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{formatTimeRange(lecture.startTime, lecture.endTime)}</span>
        </div>

        {/* Hover Action Controls */}
        <div
          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(lecture)}
              className="p-1 rounded-md bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-2xs border border-slate-200 dark:border-slate-700 transition-colors"
              title="Edit Lecture"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(lecture)}
              className="p-1 rounded-md bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 shadow-2xs border border-slate-200 dark:border-slate-700 transition-colors"
              title="Delete Lecture"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Notes preview if present */}
      {lecture.notes && !compact && (
        <div className="mt-1.5 pt-1 text-[10px] text-slate-500 dark:text-slate-400 italic line-clamp-1">
          {lecture.notes}
        </div>
      )}
    </div>
  );
};
