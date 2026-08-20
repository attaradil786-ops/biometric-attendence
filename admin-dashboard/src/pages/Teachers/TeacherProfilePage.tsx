import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ChevronLeft,
  LayoutDashboard,
  Calendar,
  CalendarCheck,
  Coffee,
  RotateCw,
  UserX,
  Plus,
} from 'lucide-react';
import { TeacherProfile, Lecture } from '../../types';
import { scheduleService } from '../../services/scheduleService';
import { calculateScheduleStats } from '../../utils/scheduleUtils';
import { TeacherProfileHeader } from './TeacherProfileHeader';
import { TeacherOverviewTab } from './TeacherOverviewTab';
import { TeacherScheduleTab } from './TeacherScheduleTab';
import { TeacherAttendanceTab } from './TeacherAttendanceTab';
import { TeacherBreaksTab } from './TeacherBreaksTab';
import { EditTeacherModal } from './EditTeacherModal';
import { LectureModal } from '../../components/schedule/LectureModal';

type ProfileTab = 'overview' | 'schedule' | 'attendance' | 'breaks';

export const TeacherProfilePage: React.FC = () => {
  const { teacherId, tab } = useParams<{ teacherId: string; tab?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab state
  const activeTab: ProfileTab =
    tab === 'schedule' || tab === 'attendance' || tab === 'breaks' || tab === 'overview'
      ? (tab as ProfileTab)
      : location.pathname.includes('/schedule')
      ? 'schedule'
      : location.pathname.includes('/attendance')
      ? 'attendance'
      : location.pathname.includes('/breaks')
      ? 'breaks'
      : 'overview';

  // Modals
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddLectureOpen, setIsAddLectureOpen] = useState(false);

  // Load teacher profile & lectures
  const loadData = async () => {
    if (!teacherId) return;
    setIsLoading(true);
    setError(null);
    try {
      const teacherData = await scheduleService.getTeacherById(teacherId);
      if (!teacherData) {
        throw new Error(`Teacher with ID "${teacherId}" was not found.`);
      }
      setTeacher(teacherData);

      const lecturesData = await scheduleService.getTeacherSchedule(teacherData.id);
      setLectures(lecturesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load teacher profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [teacherId]);

  const handleTabChange = (newTab: ProfileTab) => {
    if (!teacherId) return;
    if (newTab === 'overview') {
      navigate(`/teachers/${teacherId}`);
    } else {
      navigate(`/teachers/${teacherId}/${newTab}`);
    }
  };

  const handleSaveProfile = async (updates: Partial<TeacherProfile>) => {
    if (!teacher) return;
    const updated = await scheduleService.updateTeacherProfile(teacher.id, updates);
    setTeacher(updated);
  };

  const handleQuickAddLecture = async (lectureData: Partial<Lecture>) => {
    if (!teacher) return;
    const created = await scheduleService.createLecture({
      ...lectureData,
      teacherId: teacher.id,
      teacherName: teacher.fullName,
    } as Omit<Lecture, 'id'>);
    setLectures((prev) => [...prev, created]);
    // Switch to schedule tab if not already there
    navigate(`/teachers/${teacher.id}/schedule`);
  };

  const stats = calculateScheduleStats(lectures);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-32" />
        <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl w-96" />
        <div className="h-96 bg-slate-100 dark:bg-slate-900 rounded-3xl" />
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="p-6 sm:p-12 max-w-lg mx-auto text-center space-y-4">
        <div className="w-14 h-14 rounded-3xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center mx-auto">
          <UserX className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Teacher Not Found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {error || 'The requested faculty profile could not be located in the directory.'}
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            to="/teachers"
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold"
          >
            ← Back to Faculty List
          </Link>
          <button
            type="button"
            onClick={loadData}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link
            to="/teachers"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Faculty Directory</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-bold truncate">
            {teacher.fullName}
          </span>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          Biometric: <strong className="text-indigo-600 dark:text-indigo-400">{teacher.biometricId}</strong>
        </span>
      </div>

      {/* Teacher Profile Header */}
      <TeacherProfileHeader
        teacher={teacher}
        onEditProfile={() => setIsEditProfileOpen(true)}
        onAddLecture={() => setIsAddLectureOpen(true)}
        onPrintTimetable={() => window.print()}
      />

      {/* Tab Navigation Ribbon */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto custom-scrollbar">
        <button
          type="button"
          onClick={() => handleTabChange('overview')}
          className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 shrink-0 ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('schedule')}
          className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 shrink-0 ${
            activeTab === 'schedule'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Weekly Schedule</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'schedule'
                ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {lectures.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('attendance')}
          className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 shrink-0 ${
            activeTab === 'attendance'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Biometric Attendance</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('breaks')}
          className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 shrink-0 ${
            activeTab === 'breaks'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>Breaks & Logs</span>
        </button>
      </div>

      {/* Tab Content Display */}
      <div>
        {activeTab === 'overview' && (
          <TeacherOverviewTab
            teacher={teacher}
            lectures={lectures}
            stats={stats}
            onNavigateToSchedule={() => handleTabChange('schedule')}
            onLectureClick={() => handleTabChange('schedule')}
            onAddLecture={() => setIsAddLectureOpen(true)}
          />
        )}

        {activeTab === 'schedule' && <TeacherScheduleTab teacher={teacher} />}

        {activeTab === 'attendance' && <TeacherAttendanceTab teacher={teacher} />}

        {activeTab === 'breaks' && <TeacherBreaksTab teacher={teacher} />}
      </div>

      {/* Edit Profile Modal */}
      <EditTeacherModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        teacher={teacher}
        onSave={handleSaveProfile}
      />

      {/* Quick Add Lecture Modal from Header */}
      <LectureModal
        isOpen={isAddLectureOpen}
        onClose={() => setIsAddLectureOpen(false)}
        onSave={handleQuickAddLecture}
        teacher={teacher}
      />
    </div>
  );
};
