import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  AlertTriangle,
  RotateCw,
  Sparkles,
  Info,
  CheckCircle,
  LayoutGrid,
} from 'lucide-react';
import {
  TeacherProfile,
  Lecture,
  ScheduleViewMode,
  ScheduleFilterState,
  DayOfWeek,
} from '../../types';
import { scheduleService } from '../../services/scheduleService';
import {
  calculateScheduleStats,
  getWeekInfo,
  getCurrentDayOfWeek,
} from '../../utils/scheduleUtils';
import { ScheduleStats } from '../../components/schedule/ScheduleStats';
import { ScheduleFilters } from '../../components/schedule/ScheduleFilters';
import { WeeklySchedule } from '../../components/schedule/WeeklySchedule';
import { DaySchedule } from '../../components/schedule/DaySchedule';
import { ScheduleList } from '../../components/schedule/ScheduleList';
import { LectureModal } from '../../components/schedule/LectureModal';
import { LectureDetailsModal } from '../../components/schedule/LectureDetailsModal';
import { DeleteLectureDialog } from '../../components/schedule/DeleteLectureDialog';

interface TeacherScheduleTabProps {
  teacher: TeacherProfile;
}

export const TeacherScheduleTab: React.FC<TeacherScheduleTabProps> = ({ teacher }) => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View Controls
  const [viewMode, setViewMode] = useState<ScheduleViewMode>('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getCurrentDayOfWeek());

  // Filter State
  const [filters, setFilters] = useState<ScheduleFilterState>({
    search: '',
    subject: '',
    className: '',
    room: '',
    type: '',
    day: 'All',
  });

  // Modals & Dialogs
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<Lecture | null>(null);
  const [modalDefaultDay, setModalDefaultDay] = useState<DayOfWeek>('Monday');
  const [modalDefaultStartTime, setModalDefaultStartTime] = useState('09:00');
  const [modalDefaultEndTime, setModalDefaultEndTime] = useState('10:00');

  const [selectedLectureForDetails, setSelectedLectureForDetails] = useState<Lecture | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [lectureToDelete, setLectureToDelete] = useState<Lecture | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load schedule data
  const loadSchedule = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await scheduleService.getTeacherSchedule(teacher.id);
      setLectures(data);
    } catch (err: any) {
      setError(err.message || 'Unable to load the teacher schedule.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [teacher.id]);

  const weekInfo = getWeekInfo(weekOffset);
  const stats = calculateScheduleStats(lectures);

  // Handlers for Add Lecture
  const handleOpenAddModal = (
    defaultDay: DayOfWeek = selectedDay,
    defaultStartTime = '09:00'
  ) => {
    setModalInitialData(null);
    setModalDefaultDay(defaultDay);
    setModalDefaultStartTime(defaultStartTime);

    // Default 1 hour later
    const [h, m] = defaultStartTime.split(':').map(Number);
    const endH = (h + 1).toString().padStart(2, '0');
    setModalDefaultEndTime(`${endH}:${m.toString().padStart(2, '0')}`);

    setIsModalOpen(true);
  };

  // Handlers for Edit Lecture
  const handleOpenEditModal = (lecture: Lecture) => {
    setModalInitialData(lecture);
    setIsModalOpen(true);
  };

  // Handlers for Lecture Details
  const handleOpenDetails = (lecture: Lecture) => {
    setSelectedLectureForDetails(lecture);
    setIsDetailsOpen(true);
  };

  // Handlers for Save (Create or Update)
  const handleSaveLecture = async (lectureData: Partial<Lecture>) => {
    const isEdit = Boolean(modalInitialData);
    const previousLectures = [...lectures];

    try {
      if (isEdit && modalInitialData) {
        // Optimistic update
        const updatedLecture: Lecture = {
          ...modalInitialData,
          ...lectureData,
        } as Lecture;

        setLectures((prev) =>
          prev.map((l) => (l.id === modalInitialData.id ? updatedLecture : l))
        );

        await scheduleService.updateLecture(modalInitialData.id, lectureData);
        showToast(`Lecture "${lectureData.subject}" updated successfully.`);
      } else {
        const created = await scheduleService.createLecture(
          lectureData as Omit<Lecture, 'id'>
        );
        setLectures((prev) => [...prev, created]);
        showToast(`New lecture "${created.subject}" scheduled successfully.`);
      }
    } catch (err: any) {
      // Rollback on failure
      setLectures(previousLectures);
      throw err;
    }
  };

  // Handlers for Drag & Drop / Move Lecture
  const handleMoveLecture = async (
    lectureId: string,
    newDay: DayOfWeek,
    newStartTime: string,
    newEndTime: string
  ) => {
    const targetLec = lectures.find((l) => l.id === lectureId);
    if (!targetLec) return;

    if (
      targetLec.day === newDay &&
      targetLec.startTime === newStartTime &&
      targetLec.endTime === newEndTime
    ) {
      return; // No change
    }

    const previousLectures = [...lectures];

    // Optimistic UI update
    setLectures((prev) =>
      prev.map((l) =>
        l.id === lectureId
          ? { ...l, day: newDay, startTime: newStartTime, endTime: newEndTime }
          : l
      )
    );

    try {
      await scheduleService.moveLecture(lectureId, newDay, newStartTime, newEndTime);
      showToast(
        `Moved "${targetLec.subject}" to ${newDay} at ${newStartTime}.`,
        'success'
      );
    } catch (err: any) {
      // Rollback optimistic update
      setLectures(previousLectures);
      showToast(err.message || 'Cannot move lecture due to a schedule conflict.', 'error');
    }
  };

  // Handlers for Delete
  const handleOpenDelete = (lecture: Lecture) => {
    setLectureToDelete(lecture);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!lectureToDelete) return;
    setIsDeleting(true);
    const previousLectures = [...lectures];

    // Optimistic remove
    setLectures((prev) => prev.filter((l) => l.id !== lectureToDelete.id));

    try {
      await scheduleService.deleteLecture(lectureToDelete.id);
      setIsDeleteDialogOpen(false);
      setLectureToDelete(null);
      showToast(`Lecture "${lectureToDelete.subject}" deleted.`);
    } catch (err: any) {
      setLectures(previousLectures);
      showToast(err.message || 'Failed to delete lecture.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast feedback banner */}
      {toastMessage && (
        <div
          className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-md animate-fadeIn ${
            toastMessage.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/70 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              : 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Dynamic Summary Statistics */}
      <ScheduleStats
        stats={stats}
        onViewToday={() => {
          setViewMode('day');
          setSelectedDay(getCurrentDayOfWeek());
        }}
      />

      {/* Controls & Filter Toolbar */}
      <ScheduleFilters
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        weekOffset={weekOffset}
        onWeekChange={setWeekOffset}
        onToday={() => {
          setWeekOffset(0);
          setSelectedDay(getCurrentDayOfWeek());
        }}
        weekLabel={weekInfo.weekLabel}
        filters={filters}
        onFilterChange={setFilters}
        selectedDay={selectedDay}
        onDaySelect={setSelectedDay}
        onAddLecture={() => handleOpenAddModal(selectedDay)}
      />

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 mx-auto" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-48 mx-auto" />
          <div className="h-64 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900 p-8 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
            Unable to load teacher's schedule
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
          <button
            type="button"
            onClick={loadSchedule}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Main Timetable Content */}
      {!isLoading && !error && (
        <>
          {viewMode === 'week' && (
            <WeeklySchedule
              lectures={lectures}
              teacher={teacher}
              daysWithDates={weekInfo.daysWithDates}
              onLectureClick={handleOpenDetails}
              onEditLecture={handleOpenEditModal}
              onDeleteLecture={handleOpenDelete}
              onAddSlotClick={(day, slotTime) => handleOpenAddModal(day, slotTime)}
              onMoveLecture={handleMoveLecture}
            />
          )}

          {viewMode === 'day' && (
            <DaySchedule
              lectures={lectures}
              teacher={teacher}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              onLectureClick={handleOpenDetails}
              onEditLecture={handleOpenEditModal}
              onDeleteLecture={handleOpenDelete}
              onAddLecture={(day) => handleOpenAddModal(day || selectedDay)}
            />
          )}

          {viewMode === 'list' && (
            <ScheduleList
              lectures={lectures}
              filters={filters}
              onLectureClick={handleOpenDetails}
              onEditLecture={handleOpenEditModal}
              onDeleteLecture={handleOpenDelete}
              onAddLecture={() => handleOpenAddModal(selectedDay)}
            />
          )}
        </>
      )}

      {/* Add / Edit Lecture Modal */}
      <LectureModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalInitialData(null);
        }}
        onSave={handleSaveLecture}
        teacher={teacher}
        initialData={modalInitialData}
        defaultDay={modalDefaultDay}
        defaultStartTime={modalDefaultStartTime}
        defaultEndTime={modalDefaultEndTime}
      />

      {/* Lecture Details Modal */}
      <LectureDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedLectureForDetails(null);
        }}
        lecture={selectedLectureForDetails}
        teacher={teacher}
        onEdit={(lec) => {
          setIsDetailsOpen(false);
          handleOpenEditModal(lec);
        }}
        onDelete={(lec) => {
          setIsDetailsOpen(false);
          handleOpenDelete(lec);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteLectureDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setLectureToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        lecture={lectureToDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
