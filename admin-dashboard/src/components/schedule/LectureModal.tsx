import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Sparkles,
  Info,
} from 'lucide-react';
import { Lecture, TeacherProfile, DayOfWeek, LectureType } from '../../types';
import {
  ALL_DAYS,
  SUBJECT_OPTIONS,
  CLASS_OPTIONS,
  ROOM_OPTIONS,
  LECTURE_TYPES,
} from '../../data/scheduleData';
import {
  timeToMinutes,
  getLectureDurationHours,
  format12Hour,
} from '../../utils/scheduleUtils';
import { scheduleService } from '../../services/scheduleService';

interface LectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lectureData: Partial<Lecture>) => Promise<void>;
  teacher: TeacherProfile;
  initialData?: Lecture | null;
  defaultDay?: DayOfWeek;
  defaultStartTime?: string;
  defaultEndTime?: string;
}

export const LectureModal: React.FC<LectureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  teacher,
  initialData,
  defaultDay = 'Monday',
  defaultStartTime = '09:00',
  defaultEndTime = '10:00',
}) => {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState<{
    subject: string;
    customSubject: string;
    className: string;
    room: string;
    day: DayOfWeek;
    startTime: string;
    endTime: string;
    type: LectureType;
    notes: string;
    courseCode: string;
  }>({
    subject: initialData?.subject || SUBJECT_OPTIONS[0],
    customSubject: '',
    className: initialData?.className || CLASS_OPTIONS[0],
    room: initialData?.room || ROOM_OPTIONS[0],
    day: initialData?.day || defaultDay,
    startTime: initialData?.startTime || defaultStartTime,
    endTime: initialData?.endTime || defaultEndTime,
    type: initialData?.type || 'Regular',
    notes: initialData?.notes || '',
    courseCode: initialData?.courseCode || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state on open / initialData change
  useEffect(() => {
    if (isOpen) {
      const isKnownSubject = initialData ? SUBJECT_OPTIONS.includes(initialData.subject) : true;
      setFormData({
        subject: initialData
          ? isKnownSubject
            ? initialData.subject
            : 'Other'
          : SUBJECT_OPTIONS[0],
        customSubject: initialData && !isKnownSubject ? initialData.subject : '',
        className: initialData?.className || CLASS_OPTIONS[0],
        room: initialData?.room || ROOM_OPTIONS[0],
        day: initialData?.day || defaultDay,
        startTime: initialData?.startTime || defaultStartTime,
        endTime: initialData?.endTime || defaultEndTime,
        type: initialData?.type || 'Regular',
        notes: initialData?.notes || '',
        courseCode: initialData?.courseCode || '',
      });
      setErrors({});
      setConflictWarning(null);
    }
  }, [isOpen, initialData, defaultDay, defaultStartTime, defaultEndTime]);

  // Live conflict checking as user adjusts day, times, room
  useEffect(() => {
    if (!isOpen) return;

    const checkConflict = async () => {
      setIsCheckingConflict(true);
      const effectiveSubject =
        formData.subject === 'Other' ? formData.customSubject : formData.subject;

      try {
        const conflict = await scheduleService.validateScheduleConflict(
          {
            teacherId: teacher.id,
            day: formData.day,
            startTime: formData.startTime,
            endTime: formData.endTime,
            room: formData.room,
            subject: effectiveSubject,
            className: formData.className,
          },
          initialData?.id
        );

        if (conflict.hasConflict) {
          setConflictWarning(conflict.message || 'Schedule overlap detected.');
        } else {
          setConflictWarning(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsCheckingConflict(false);
      }
    };

    const timer = setTimeout(checkConflict, 200);
    return () => clearTimeout(timer);
  }, [
    isOpen,
    formData.day,
    formData.startTime,
    formData.endTime,
    formData.room,
    formData.subject,
    formData.customSubject,
    formData.className,
    teacher.id,
    initialData?.id,
  ]);

  if (!isOpen) return null;

  const durationHours = getLectureDurationHours(formData.startTime, formData.endTime);

  const validate = () => {
    const errs: Record<string, string> = {};

    const effectiveSubject =
      formData.subject === 'Other' ? formData.customSubject.trim() : formData.subject.trim();

    if (!effectiveSubject) {
      errs.subject = 'Subject name is required.';
    }

    if (!formData.className.trim()) {
      errs.className = 'Class / Section is required.';
    }

    if (!formData.room.trim()) {
      errs.room = 'Room / Lecture Hall is required.';
    }

    if (!formData.startTime) {
      errs.startTime = 'Start time is required.';
    }

    if (!formData.endTime) {
      errs.endTime = 'End time is required.';
    }

    if (formData.startTime && formData.endTime) {
      const startMins = timeToMinutes(formData.startTime);
      const endMins = timeToMinutes(formData.endTime);

      if (endMins <= startMins) {
        errs.endTime = 'End time must be after start time.';
      } else if (endMins - startMins < 20) {
        errs.endTime = 'Lecture duration must be at least 20 minutes.';
      } else if (endMins - startMins > 300) {
        errs.endTime = 'Single lecture duration cannot exceed 5 hours.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const effectiveSubject =
      formData.subject === 'Other' ? formData.customSubject.trim() : formData.subject.trim();

    setIsSubmitting(true);
    try {
      await onSave({
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        subject: effectiveSubject,
        className: formData.className,
        room: formData.room,
        day: formData.day,
        startTime: formData.startTime,
        endTime: formData.endTime,
        type: formData.type,
        notes: formData.notes.trim(),
        courseCode: formData.courseCode.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setConflictWarning(err.message || 'Failed to save lecture.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Edit Lecture Schedule' : 'Schedule New Lecture'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Faculty: <span className="font-semibold text-slate-700 dark:text-slate-200">{teacher.fullName}</span> ({teacher.designation})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Conflict Alert Banner */}
          {conflictWarning && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 flex items-start gap-2.5 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-xs">Schedule Conflict Detected</p>
                <p className="text-[11px] mt-0.5 leading-relaxed text-amber-700 dark:text-amber-300">
                  {conflictWarning}
                </p>
                <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-1">
                  Please select an alternate time slot, day, or classroom to prevent collision.
                </p>
              </div>
            </div>
          )}

          {/* Teacher (Read-only reference) */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={teacher.avatarUrl}
                alt={teacher.fullName}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{teacher.fullName}</p>
                <p className="text-[11px] text-slate-400 font-mono">{teacher.department} • {teacher.employeeId}</p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
              Instructor
            </span>
          </div>

          {/* Subject & Course Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subject / Course Title <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              >
                {SUBJECT_OPTIONS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
                <option value="Other">+ Custom Subject...</option>
              </select>
              {errors.subject && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.subject}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Course Code
              </label>
              <input
                type="text"
                value={formData.courseCode}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                placeholder="e.g. CS-301"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          {formData.subject === 'Other' && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Enter Custom Subject Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.customSubject}
                onChange={(e) => setFormData({ ...formData, customSubject: e.target.value })}
                placeholder="e.g. Advanced Cryptography & Blockchain"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          )}

          {/* Class, Room, Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Class / Section <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              >
                {CLASS_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Room / Hall <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
              >
                {ROOM_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lecture Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as LectureType })}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              >
                {LECTURE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Day & Timings */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Scheduled Day of the Week <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {ALL_DAYS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setFormData({ ...formData, day: d })}
                    className={`py-1.5 rounded-lg text-center font-semibold text-[11px] transition-all cursor-pointer ${
                      formData.day === d
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Start Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
                />
                {errors.startTime && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.startTime}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  End Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
                />
                {errors.endTime && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.endTime}</p>
                )}
              </div>

              <div className="flex flex-col justify-end">
                <div className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-200 dark:border-indigo-800/60 text-center">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 block">
                    Total Duration
                  </span>
                  <span className="font-bold text-xs text-indigo-900 dark:text-indigo-200 font-mono">
                    {durationHours > 0 ? `${durationHours} Hours` : 'Invalid'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Lecture Syllabus Topics / Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Unit 3: Graph Traversal, DFS vs BFS comparison, coding lab test announcement..."
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-hidden resize-none"
            />
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Saving Lecture...</span>
              ) : isEditing ? (
                <span>Save Changes</span>
              ) : (
                <span>+ Add to Timetable</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
