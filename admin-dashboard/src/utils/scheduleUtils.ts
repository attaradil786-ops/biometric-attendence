import { Lecture, DayOfWeek, LectureType, ScheduleStats, LectureStatus } from '../types';
import { ALL_DAYS } from '../data/scheduleData';

/**
 * Convert "HH:mm" to total minutes from midnight (0 - 1439)
 */
export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

/**
 * Convert total minutes to "HH:mm" format
 */
export const minutesToTime = (totalMinutes: number): string => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

/**
 * Format "09:00" to "9:00 AM" or "14:30" to "2:30 PM"
 */
export const format12Hour = (timeStr: string): string => {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

/**
 * Format "09:00" – "10:00" to "9:00 AM – 10:00 AM"
 */
export const formatTimeRange = (start: string, end: string): string => {
  return `${format12Hour(start)} – ${format12Hour(end)}`;
};

/**
 * Calculate lecture duration in hours (e.g., 1.5)
 */
export const getLectureDurationHours = (start: string, end: string): number => {
  const startMins = timeToMinutes(start);
  const endMins = timeToMinutes(end);
  if (endMins <= startMins) return 0;
  return Math.round(((endMins - startMins) / 60) * 10) / 10;
};

/**
 * Check if two time ranges on the same day overlap
 */
export const checkTimeOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && s2 < e1;
};

/**
 * Get the current day of the week as DayOfWeek
 */
export const getCurrentDayOfWeek = (): DayOfWeek => {
  const dayIndex = new Date().getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const map: Record<number, DayOfWeek> = {
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    0: 'Monday', // Default fallback to Monday for Sunday
  };
  return map[dayIndex] || 'Monday';
};

/**
 * Get current time in "HH:mm"
 */
export const getCurrentTimeString = (): string => {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
};

/**
 * Determine the real-time status of a lecture (Upcoming, In Progress, Completed)
 */
export const getLectureLiveStatus = (
  lectureDay: DayOfWeek,
  startTime: string,
  endTime: string,
  referenceDay?: DayOfWeek,
  referenceTime?: string
): LectureStatus => {
  const currentDay = referenceDay || getCurrentDayOfWeek();
  const currentTime = referenceTime || getCurrentTimeString();

  const dayOrder: Record<DayOfWeek, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const currDayNum = dayOrder[currentDay];
  const lecDayNum = dayOrder[lectureDay];

  if (lecDayNum < currDayNum) {
    return 'Completed';
  } else if (lecDayNum > currDayNum) {
    return 'Upcoming';
  } else {
    // Same day
    const curMins = timeToMinutes(currentTime);
    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);

    if (curMins >= endMins) {
      return 'Completed';
    } else if (curMins >= startMins && curMins < endMins) {
      return 'In Progress';
    } else {
      return 'Upcoming';
    }
  }
};

/**
 * Calculate dynamic schedule statistics from a list of lectures
 */
export const calculateScheduleStats = (
  lectures: Lecture[],
  currentDay: DayOfWeek = getCurrentDayOfWeek(),
  currentTime: string = getCurrentTimeString()
): ScheduleStats => {
  let totalHours = 0;
  let practicalHours = 0;
  const todayLectures: Lecture[] = [];

  lectures.forEach((lec) => {
    const dur = getLectureDurationHours(lec.startTime, lec.endTime);
    totalHours += dur;
    if (lec.type === 'Lab' || lec.type === 'Practical') {
      practicalHours += dur;
    }
    if (lec.day === currentDay) {
      todayLectures.push(lec);
    }
  });

  // Sort today's lectures by start time
  todayLectures.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const curMins = timeToMinutes(currentTime);
  const upcomingToday = todayLectures.filter((l) => timeToMinutes(l.startTime) > curMins);

  // Find next lecture (either upcoming today, or earliest in subsequent days)
  let nextLecture: Lecture | null = null;
  if (upcomingToday.length > 0) {
    nextLecture = upcomingToday[0];
  } else {
    // Look ahead in subsequent days
    const dayOrder: Record<DayOfWeek, number> = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };
    const curDayNum = dayOrder[currentDay];
    const sortedLectures = [...lectures].sort((a, b) => {
      const diff = dayOrder[a.day] - dayOrder[b.day];
      if (diff !== 0) return diff;
      return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    });

    const futureDaysLectures = sortedLectures.filter((l) => dayOrder[l.day] > curDayNum);
    if (futureDaysLectures.length > 0) {
      nextLecture = futureDaysLectures[0];
    } else if (sortedLectures.length > 0) {
      // Loop back to earliest in week
      nextLecture = sortedLectures[0];
    }
  }

  return {
    lecturesThisWeek: lectures.length,
    hoursThisWeek: Math.round(totalHours * 10) / 10,
    lecturesToday: todayLectures.length,
    upcomingLecturesToday: upcomingToday.length,
    practicalLabHours: Math.round(practicalHours * 10) / 10,
    nextLecture,
  };
};

/**
 * Return style classes based on lecture type
 */
export const getLectureTypeBadgeConfig = (type: LectureType) => {
  switch (type) {
    case 'Lab':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/50',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800/60',
        dot: 'bg-emerald-500',
      };
    case 'Practical':
      return {
        bg: 'bg-teal-50 dark:bg-teal-950/50',
        text: 'text-teal-700 dark:text-teal-300',
        border: 'border-teal-200 dark:border-teal-800/60',
        dot: 'bg-teal-500',
      };
    case 'Tutorial':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/50',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800/60',
        dot: 'bg-amber-500',
      };
    case 'Exam':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/50',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-200 dark:border-rose-800/60',
        dot: 'bg-rose-500',
      };
    case 'Extra Class':
      return {
        bg: 'bg-purple-50 dark:bg-purple-950/50',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800/60',
        dot: 'bg-purple-500',
      };
    case 'Regular':
    default:
      return {
        bg: 'bg-indigo-50 dark:bg-indigo-950/50',
        text: 'text-indigo-700 dark:text-indigo-300',
        border: 'border-indigo-200 dark:border-indigo-800/60',
        dot: 'bg-indigo-500',
      };
  }
};

/**
 * Return color themes for timetable cards
 */
export const getLectureColorStyles = (type: LectureType, theme?: string) => {
  switch (type) {
    case 'Lab':
    case 'Practical':
      return {
        cardBg: 'bg-emerald-50/80 dark:bg-emerald-950/30 hover:bg-emerald-100/80 dark:hover:bg-emerald-950/50',
        border: 'border-emerald-200/80 dark:border-emerald-800/50',
        title: 'text-emerald-950 dark:text-emerald-100',
        accent: 'text-emerald-700 dark:text-emerald-300',
        badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
        leftStripe: 'border-l-4 border-l-emerald-500',
      };
    case 'Tutorial':
    case 'Extra Class':
      return {
        cardBg: 'bg-amber-50/80 dark:bg-amber-950/30 hover:bg-amber-100/80 dark:hover:bg-amber-950/50',
        border: 'border-amber-200/80 dark:border-amber-800/50',
        title: 'text-amber-950 dark:text-amber-100',
        accent: 'text-amber-700 dark:text-amber-300',
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
        leftStripe: 'border-l-4 border-l-amber-500',
      };
    case 'Exam':
      return {
        cardBg: 'bg-rose-50/80 dark:bg-rose-950/30 hover:bg-rose-100/80 dark:hover:bg-rose-950/50',
        border: 'border-rose-200/80 dark:border-rose-800/50',
        title: 'text-rose-950 dark:text-rose-100',
        accent: 'text-rose-700 dark:text-rose-300',
        badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200',
        leftStripe: 'border-l-4 border-l-rose-500',
      };
    case 'Regular':
    default:
      return {
        cardBg: 'bg-indigo-50/70 dark:bg-indigo-950/30 hover:bg-indigo-100/70 dark:hover:bg-indigo-950/50',
        border: 'border-indigo-200/80 dark:border-indigo-800/50',
        title: 'text-indigo-950 dark:text-indigo-100',
        accent: 'text-indigo-700 dark:text-indigo-300',
        badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200',
        leftStripe: 'border-l-4 border-l-indigo-600',
      };
  }
};

/**
 * Helper to compute dates for a given week offset from today
 */
export const getWeekInfo = (weekOffset = 0) => {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day; // Monday as first day

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday + weekOffset * 7);

  const saturday = new Date(monday);
  saturday.setDate(monday.getDate() + 5);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const formatDate = (d: Date) => `${monthNames[d.getMonth()]} ${d.getDate()}`;

  const daysWithDates = ALL_DAYS.map((d, index) => {
    const current = new Date(monday);
    current.setDate(monday.getDate() + index);
    const isToday =
      weekOffset === 0 &&
      current.getDate() === now.getDate() &&
      current.getMonth() === now.getMonth() &&
      current.getFullYear() === now.getFullYear();

    return {
      day: d,
      dateNum: current.getDate(),
      dateStr: formatDate(current),
      fullDateStr: current.toISOString().split('T')[0],
      isToday,
    };
  });

  return {
    startDateStr: formatDate(monday),
    endDateStr: formatDate(saturday),
    year: monday.getFullYear(),
    weekLabel: `${formatDate(monday)} – ${formatDate(saturday)}, ${monday.getFullYear()}`,
    daysWithDates,
  };
};
