import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Search,
  Filter,
  Layers,
  LayoutGrid,
  List,
  CalendarDays,
  X,
} from 'lucide-react';
import { ScheduleViewMode, ScheduleFilterState, DayOfWeek } from '../../types';
import { ALL_DAYS, SUBJECT_OPTIONS, CLASS_OPTIONS, ROOM_OPTIONS, LECTURE_TYPES } from '../../data/scheduleData';

interface ScheduleFiltersProps {
  viewMode: ScheduleViewMode;
  onViewModeChange: (mode: ScheduleViewMode) => void;
  weekOffset: number;
  onWeekChange: (offset: number) => void;
  onToday: () => void;
  weekLabel: string;
  filters: ScheduleFilterState;
  onFilterChange: (filters: ScheduleFilterState) => void;
  selectedDay?: DayOfWeek;
  onDaySelect?: (day: DayOfWeek) => void;
  onAddLecture?: () => void;
}

export const ScheduleFilters: React.FC<ScheduleFiltersProps> = ({
  viewMode,
  onViewModeChange,
  weekOffset,
  onWeekChange,
  onToday,
  weekLabel,
  filters,
  onFilterChange,
  selectedDay,
  onDaySelect,
  onAddLecture,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const hasActiveFilters =
    filters.search ||
    filters.subject ||
    filters.className ||
    filters.room ||
    filters.type ||
    (filters.day && filters.day !== 'All');

  const clearFilters = () => {
    onFilterChange({
      search: '',
      subject: '',
      className: '',
      room: '',
      type: '',
      day: 'All',
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-2xs space-y-3">
      {/* Top row: Week navigation & View mode switch */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Week navigation */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => onWeekChange(weekOffset - 1)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onToday}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                weekOffset === 0
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => onWeekChange(weekOffset + 1)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{weekLabel}</span>
          </div>
        </div>

        {/* View mode toggle (Week / Day / List) & Quick Add */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => onViewModeChange('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Week</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'day'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Day</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          {onAddLecture && (
            <button
              type="button"
              onClick={onAddLecture}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <span>+ Add Lecture</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Search subject, class, room, or topic notes..."
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Subject Filter */}
          <select
            value={filters.subject}
            onChange={(e) => onFilterChange({ ...filters, subject: e.target.value })}
            className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="">All Subjects</option>
            {SUBJECT_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Quick Lecture Type */}
          <select
            value={filters.type}
            onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
            className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="">All Types</option>
            {LECTURE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Toggle More Filters */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`p-1.5 rounded-xl border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
              showAdvanced || hasActiveFilters
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-300 font-semibold'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
            title="Toggle Detailed Filters"
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer px-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Drawer */}
      {showAdvanced && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs animate-fadeIn">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Class Section
            </label>
            <select
              value={filters.className}
              onChange={(e) => onFilterChange({ ...filters, className: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="">All Classes</option>
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  Class {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Room / Lab
            </label>
            <select
              value={filters.room}
              onChange={(e) => onFilterChange({ ...filters, room: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="">All Rooms</option>
              {ROOM_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  Room {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Specific Day
            </label>
            <select
              value={filters.day || 'All'}
              onChange={(e) => onFilterChange({ ...filters, day: e.target.value as any })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="All">All Days (Mon–Sat)</option>
              {ALL_DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
