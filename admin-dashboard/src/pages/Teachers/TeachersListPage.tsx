import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Search,
  Building2,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  Filter,
  ShieldCheck,
  Fingerprint,
  Users,
  ChevronRight,
  BookOpen,
  Award,
} from 'lucide-react';
import { TeacherProfile, Lecture } from '../../types';
import { scheduleService } from '../../services/scheduleService';
import { calculateScheduleStats } from '../../utils/scheduleUtils';

export const TeachersListPage: React.FC = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [allLectures, setAllLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [teachersData, lecturesData] = await Promise.all([
          scheduleService.getTeachers(),
          scheduleService.getAllLectures(),
        ]);
        setTeachers(teachersData);
        setAllLectures(lecturesData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Department options derived from data
  const departments = ['All', ...Array.from(new Set(teachers.map((t) => t.department)))];

  const filteredTeachers = teachers.filter((t) => {
    const matchSearch =
      t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.biometricId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchDept = departmentFilter === 'All' || t.department === departmentFilter;

    return matchSearch && matchDept;
  });

  // Calculate high-level institutional stats
  const totalFaculty = teachers.length;
  const activeFaculty = teachers.filter((t) => t.employmentStatus === 'Active').length;
  const totalLecturesCount = allLectures.length;
  const totalLabLectures = allLectures.filter(
    (l) => l.type === 'Lab' || l.type === 'Practical'
  ).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Teacher Profiles & Lecture Scheduling
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage academic faculty, weekly timetable grids, classroom assignments, and biometric attendance
          </p>
        </div>
      </div>

      {/* Institutional Statistics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Total Faculty
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalFaculty}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {activeFaculty} Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across 3 academic faculties</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Scheduled Lectures
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalLecturesCount}
            </span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              slots / week
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Mon – Sat active timetables</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Practical / Lab Slots
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalLabLectures}
            </span>
            <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">
              sessions
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Hands-on lab allocations</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Biometric Sync Status
          </span>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              100% Enrolled
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Biometric IDs matched</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search faculty by name, department, designation, employee ID..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'All' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Teacher Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 h-64 animate-pulse"
            />
          ))}
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-md mx-auto">
          <GraduationCap className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Faculty Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            No teachers matched your search query "{searchQuery}".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((teacher) => {
            const teacherLectures = allLectures.filter((l) => l.teacherId === teacher.id);
            const teacherStats = calculateScheduleStats(teacherLectures);

            return (
              <div
                key={teacher.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/80 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Row: Avatar & Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={teacher.avatarUrl}
                        alt={teacher.fullName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                      />
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {teacher.fullName}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          {teacher.designation}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        teacher.employmentStatus === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {teacher.employmentStatus}
                    </span>
                  </div>

                  {/* Department & Biometric ID */}
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 mb-3">
                    <div className="flex items-center gap-1.5 truncate">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{teacher.department}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-slate-400">{teacher.employeeId}</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                        <Fingerprint className="w-3 h-3" />
                        {teacher.biometricId}
                      </span>
                    </div>
                  </div>

                  {/* Schedule Workload metrics */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800 grid grid-cols-2 gap-2 text-center text-xs mb-4">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                        Weekly Lectures
                      </span>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {teacherStats.lecturesThisWeek} classes
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                        Workload
                      </span>
                      <span className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                        {teacherStats.hoursThisWeek} hrs
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    to={`/teachers/${teacher.id}`}
                    className="px-3 py-1.5 text-xs font-semibold text-center text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    View Profile
                  </Link>
                  <Link
                    to={`/teachers/${teacher.id}/schedule`}
                    className="px-3 py-1.5 text-xs font-semibold text-center text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs flex items-center justify-center gap-1 transition-all"
                  >
                    <span>Timetable</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
