import { TeacherProfile, Lecture, ScheduleConflict } from '../types';
import { initialTeachers, initialLectures } from '../data/scheduleData';
import { checkTimeOverlap, format12Hour } from '../utils/scheduleUtils';

const TEACHERS_STORAGE_KEY = 'biosync_teachers_data';
const LECTURES_STORAGE_KEY = 'biosync_lectures_data';

// Helper to simulate realistic API latency for smooth loading skeletons
const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Service to manage Teacher Profiles & Lecture Schedules
 * Encapsulates all data access and conflict validation.
 * Ready for future backend endpoints:
 * - GET    /api/teachers/:teacherId/schedule
 * - POST   /api/schedules
 * - PUT    /api/schedules/:lectureId
 * - DELETE /api/schedules/:lectureId
 */
class ScheduleService {
  private getStoredTeachers(): TeacherProfile[] {
    const saved = localStorage.getItem(TEACHERS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse stored teachers', e);
      }
    }
    localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(initialTeachers));
    return initialTeachers;
  }

  private getStoredLectures(): Lecture[] {
    const saved = localStorage.getItem(LECTURES_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse stored lectures', e);
      }
    }
    localStorage.setItem(LECTURES_STORAGE_KEY, JSON.stringify(initialLectures));
    return initialLectures;
  }

  private saveTeachers(teachers: TeacherProfile[]) {
    localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(teachers));
  }

  private saveLectures(lectures: Lecture[]) {
    localStorage.setItem(LECTURES_STORAGE_KEY, JSON.stringify(lectures));
  }

  /**
   * Fetch all teacher profiles
   */
  async getTeachers(): Promise<TeacherProfile[]> {
    await delay(150);
    return this.getStoredTeachers();
  }

  /**
   * Fetch single teacher profile by ID
   */
  async getTeacherById(teacherId: string): Promise<TeacherProfile | null> {
    await delay(120);
    const teachers = this.getStoredTeachers();
    const teacher = teachers.find((t) => t.id === teacherId || t.employeeId === teacherId);
    return teacher || null;
  }

  /**
   * Update teacher profile details
   */
  async updateTeacherProfile(
    teacherId: string,
    updates: Partial<TeacherProfile>
  ): Promise<TeacherProfile> {
    await delay(180);
    const teachers = this.getStoredTeachers();
    const index = teachers.findIndex((t) => t.id === teacherId || t.employeeId === teacherId);

    if (index === -1) {
      throw new Error(`Teacher with ID "${teacherId}" was not found.`);
    }

    const updated: TeacherProfile = {
      ...teachers[index],
      ...updates,
    };

    teachers[index] = updated;
    this.saveTeachers(teachers);
    return updated;
  }

  /**
   * Fetch all lectures across the institution
   */
  async getAllLectures(): Promise<Lecture[]> {
    await delay(150);
    return this.getStoredLectures();
  }

  /**
   * Fetch weekly schedule for a specific teacher
   */
  async getTeacherSchedule(teacherId: string): Promise<Lecture[]> {
    await delay(180);
    const all = this.getStoredLectures();
    return all.filter((l) => l.teacherId === teacherId);
  }

  /**
   * Validate potential schedule collisions (Teacher double-booking or Room collision)
   */
  async validateScheduleConflict(
    lectureData: Partial<Lecture>,
    excludeLectureId?: string
  ): Promise<ScheduleConflict> {
    const all = this.getStoredLectures();

    if (!lectureData.day || !lectureData.startTime || !lectureData.endTime) {
      return { hasConflict: false };
    }

    // 1. Check if Teacher is already busy on this day at this time
    const teacherConflict = all.find((lec) => {
      if (excludeLectureId && lec.id === excludeLectureId) return false;
      if (lec.teacherId !== lectureData.teacherId) return false;
      if (lec.day !== lectureData.day) return false;
      return checkTimeOverlap(
        lectureData.startTime!,
        lectureData.endTime!,
        lec.startTime,
        lec.endTime
      );
    });

    if (teacherConflict) {
      return {
        hasConflict: true,
        conflictingLecture: teacherConflict,
        message: `This teacher already has a lecture scheduled: "${teacherConflict.subject}" for ${teacherConflict.className} from ${format12Hour(teacherConflict.startTime)} to ${format12Hour(teacherConflict.endTime)} in Room ${teacherConflict.room}.`,
      };
    }

    // 2. Check if Room is already occupied on this day at this time
    if (lectureData.room) {
      const roomConflict = all.find((lec) => {
        if (excludeLectureId && lec.id === excludeLectureId) return false;
        if (lec.room !== lectureData.room) return false;
        if (lec.day !== lectureData.day) return false;
        return checkTimeOverlap(
          lectureData.startTime!,
          lectureData.endTime!,
          lec.startTime,
          lec.endTime
        );
      });

      if (roomConflict) {
        return {
          hasConflict: true,
          conflictingLecture: roomConflict,
          message: `Room ${lectureData.room} is already booked for "${roomConflict.subject}" (${roomConflict.className}) from ${format12Hour(roomConflict.startTime)} to ${format12Hour(roomConflict.endTime)}.`,
        };
      }
    }

    return { hasConflict: false };
  }

  /**
   * Add a new lecture to schedule
   */
  async createLecture(data: Omit<Lecture, 'id'>): Promise<Lecture> {
    await delay(200);

    // Validate conflict on service side
    const conflict = await this.validateScheduleConflict(data);
    if (conflict.hasConflict) {
      throw new Error(conflict.message || 'Schedule conflict detected.');
    }

    const all = this.getStoredLectures();
    const newId = `LEC-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`;

    const newLecture: Lecture = {
      ...data,
      id: newId,
    };

    all.push(newLecture);
    this.saveLectures(all);
    return newLecture;
  }

  /**
   * Update an existing lecture
   */
  async updateLecture(lectureId: string, updates: Partial<Lecture>): Promise<Lecture> {
    await delay(200);

    // Check conflict excluding current lecture
    const all = this.getStoredLectures();
    const index = all.findIndex((l) => l.id === lectureId);

    if (index === -1) {
      throw new Error(`Lecture with ID "${lectureId}" not found.`);
    }

    const merged = { ...all[index], ...updates };
    const conflict = await this.validateScheduleConflict(merged, lectureId);
    if (conflict.hasConflict) {
      throw new Error(conflict.message || 'Schedule conflict detected.');
    }

    all[index] = merged;
    this.saveLectures(all);
    return merged;
  }

  /**
   * Delete a lecture
   */
  async deleteLecture(lectureId: string): Promise<{ success: boolean; id: string }> {
    await delay(180);
    const all = this.getStoredLectures();
    const filtered = all.filter((l) => l.id !== lectureId);

    if (filtered.length === all.length) {
      throw new Error(`Lecture with ID "${lectureId}" was not found.`);
    }

    this.saveLectures(filtered);
    return { success: true, id: lectureId };
  }

  /**
   * Move a lecture to another day/time (optimistic drag & drop)
   */
  async moveLecture(
    lectureId: string,
    newDay: Lecture['day'],
    newStartTime: string,
    newEndTime: string
  ): Promise<Lecture> {
    return this.updateLecture(lectureId, {
      day: newDay,
      startTime: newStartTime,
      endTime: newEndTime,
    });
  }

  /**
   * Reset all mock data to factory state
   */
  resetToDefault() {
    localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(initialTeachers));
    localStorage.setItem(LECTURES_STORAGE_KEY, JSON.stringify(initialLectures));
  }
}

export const scheduleService = new ScheduleService();
