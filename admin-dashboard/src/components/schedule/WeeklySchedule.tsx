import React, { useState } from 'react';
import { Clock, Plus, AlertCircle } from 'lucide-react';
import { Lecture, DayOfWeek, TeacherProfile } from '../../types';
import { ALL_DAYS } from '../../data/scheduleData';
import { LectureCard } from './LectureCard';
import { timeToMinutes, minutesToTime, format12Hour } from '../../utils/scheduleUtils';

interface WeeklyScheduleProps {
  lectures: Lecture[];
  teacher: TeacherProfile;
  daysWithDates: { day: DayOfWeek; dateStr: string; dateNum: number; isToday: boolean }[];
  onLectureClick: (lecture: Lecture) => void;
  onEditLecture: (lecture: Lecture) => void;
  onDeleteLecture: (lecture: Lecture) => void;
  onAddSlotClick: (day: DayOfWeek, startTime: string) => void;
  onMoveLecture: (lectureId: string, newDay: DayOfWeek, newStartTime: string, newEndTime: string) => Promise<void>;
}

// Time slots from 08:00 to 17:00
const TIME_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
];

export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({
  lectures,
  teacher,
  daysWithDates,
  onLectureClick,
  onEditLecture,
  onDeleteLecture,
  onAddSlotClick,
  onMoveLecture,
}) => {
  const [dragOverSlot, setDragOverSlot] = useState<{ day: DayOfWeek; time: string } | null>(null);

  const handleDragOver = (e: React.DragEvent, day: DayOfWeek, time: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSlot?.day !== day || dragOverSlot?.time !== time) {
      setDragOverSlot({ day, time });
    }
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = async (e: React.DragEvent, day: DayOfWeek, targetStartTime: string) => {
    e.preventDefault();
    setDragOverSlot(null);
    const dataStr = e.dataTransfer.getData('text/plain');
    if (!dataStr) return;

    try {
      const draggedLecture: Lecture = JSON.parse(dataStr);
      if (!draggedLecture || !draggedLecture.id) return;

      const durationMins =
        timeToMinutes(draggedLecture.endTime) - timeToMinutes(draggedLecture.startTime);
      const targetStartMins = timeToMinutes(targetStartTime);
      const targetEndMins = targetStartMins + Math.max(durationMins, 60);
      const targetEndTime = minutesToTime(targetEndMins);

      // Optimistic move
      await onMoveLecture(draggedLecture.id, day, targetStartTime, targetEndTime);
    } catch (err) {
      console.error('Failed to move lecture', err);
    }
  };

  // Group lectures by day and find which ones start within a slot hour
  const getLecturesForSlot = (day: DayOfWeek, slotTime: string) => {
    const slotStart = timeToMinutes(slotTime);
    const slotEnd = slotStart + 60;

    return lectures.filter((lec) => {
      if (lec.day !== day) return false;
      const lecStart = timeToMinutes(lec.startTime);
      return lecStart >= slotStart && lecStart < slotEnd;
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
      {/* Horizontally scrollable timetable container */}
      <div className="overflow-x-auto min-w-full custom-scrollbar">
        <div className="min-w-[840px]">
          {/* Header Row: Days of Week */}
          <div className="grid grid-cols-[80px_repeat(6,1fr)] border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 sticky top-0 z-10">
            {/* Corner time label */}
            <div className="p-3 text-center border-r border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 mr-1" />
              <span>Time</span>
            </div>

            {/* Columns for Monday to Saturday */}
            {daysWithDates.map((d) => (
              <div
                key={d.day}
                className={`p-3 text-center border-r border-slate-200 dark:border-slate-800 last:border-r-0 ${
                  d.isToday ? 'bg-indigo-50/70 dark:bg-indigo-950/40' : ''
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span
                    className={`font-bold text-xs ${
                      d.isToday
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {d.day}
                  </span>
                  {d.isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-ping" />
                  )}
                </div>
                <span
                  className={`text-[11px] font-mono block mt-0.5 ${
                    d.isToday
                      ? 'text-indigo-600 dark:text-indigo-300 font-bold'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {d.dateStr}
                </span>
              </div>
            ))}
          </div>

          {/* Timetable Grid Rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {TIME_SLOTS.map((slotTime) => (
              <div
                key={slotTime}
                className="grid grid-cols-[80px_repeat(6,1fr)] min-h-[105px] transition-colors"
              >
                {/* Left Hour Label */}
                <div className="p-2.5 text-center border-r border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 flex flex-col items-center justify-start">
                  <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                    {slotTime}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {format12Hour(slotTime).split(' ')[1]}
                  </span>
                </div>

                {/* Day Slot Cells */}
                {ALL_DAYS.map((day) => {
                  const slotLectures = getLecturesForSlot(day, slotTime);
                  const isDragOver =
                    dragOverSlot?.day === day && dragOverSlot?.time === slotTime;

                  return (
                    <div
                      key={`${day}-${slotTime}`}
                      onDragOver={(e) => handleDragOver(e, day, slotTime)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, day, slotTime)}
                      className={`relative p-1.5 border-r border-slate-200/60 dark:border-slate-800/60 last:border-r-0 group transition-colors ${
                        isDragOver
                          ? 'bg-indigo-100/60 dark:bg-indigo-900/40 ring-2 ring-indigo-500 ring-inset'
                          : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Slot Content */}
                      {slotLectures.length > 0 ? (
                        <div className="space-y-1.5">
                          {slotLectures.map((lec) => (
                            <LectureCard
                              key={lec.id}
                              lecture={lec}
                              onClick={onLectureClick}
                              onEdit={onEditLecture}
                              onDelete={onDeleteLecture}
                            />
                          ))}
                        </div>
                      ) : (
                        /* Empty Slot Add Action */
                        <div
                          onClick={() => onAddSlotClick(day, slotTime)}
                          className="w-full h-full min-h-[90px] rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer"
                        >
                          <span className="text-[11px] font-semibold flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
