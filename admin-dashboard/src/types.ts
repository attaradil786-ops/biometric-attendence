export type EmployeeStatus = 'Active' | 'On Leave' | 'Suspended' | 'Terminated';

export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'Early Checkout' | 'On Leave' | 'Working';

export type BreakStatus = 'Active' | 'Completed' | 'Overbreak';

export type BreakType = 'Lunch' | 'Tea / Coffee' | 'Short Break' | 'Personal';

export type DeviceStatus = 'Online' | 'Offline' | 'Syncing' | 'Error';

export type DeviceType = 'Fingerprint' | 'Facial Recognition' | 'Hybrid (Face + Fingerprint)' | 'RFID & Biometric';

export type UserRole = 'Super Admin' | 'Admin' | 'HR Manager' | 'Attendance Manager' | 'Viewer';

export interface Employee {
  id: string; // e.g. EMP-1001
  fullName: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  designation: string;
  biometricId: string; // e.g. BIO-8042
  avatarUrl?: string;
  joiningDate: string; // YYYY-MM-DD
  status: EmployeeStatus;
  shiftId: string;
  enrolledBiometrics: {
    fingerprint: boolean;
    face: boolean;
    rfidCard: boolean;
  };
  emergencyContact?: string;
  address?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null; // HH:mm:ss or null
  checkOut: string | null; // HH:mm:ss or null
  workDurationMinutes: number; // calculated
  breakDurationMinutes: number;
  status: AttendanceStatus;
  lateMinutes: number;
  earlyCheckoutMinutes: number;
  overtimeMinutes: number;
  deviceId?: string;
  verificationMethod?: 'Fingerprint' | 'Face ID' | 'Manual' | 'RFID';
  notes?: string;
}

export interface BreakRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string | null; // HH:mm:ss or null if active
  durationMinutes: number;
  status: BreakStatus;
  type: BreakType;
  notes?: string;
  isOverbreak?: boolean;
}

export interface Department {
  id: string; // e.g. DEP-01
  name: string;
  code: string;
  managerId: string;
  managerName: string;
  employeeCount: number;
  activeCount: number;
  location: string;
  description: string;
  createdAt: string;
}

export interface BiometricDevice {
  id: string; // e.g. DEV-01
  name: string;
  model: string;
  location: string;
  ipAddress: string;
  port: number;
  status: DeviceStatus;
  type: DeviceType;
  deviceType?: string;
  lastSyncTime: string;
  lastSync?: string;
  lastPing?: string;
  registeredUsersCount: number;
  registeredTemplates?: number;
  maxCapacity: number;
  firmwareVersion: string;
  serialNumber: string;
  isSyncing?: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  avatar?: string;
  password?: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string; // "09:00"
  endTime: string; // "17:30"
  breakDurationMinutes: number;
  gracePeriodMinutes: number;
  halfDayHours: number;
  isDefault?: boolean;
}

export interface SystemSettings {
  companyName: string;
  officeLocation: string;
  timeZone: string;
  workingDays: string[]; // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  officeOpeningTime: string; // "09:00"
  officeClosingTime: string; // "18:00"
  gracePeriodMinutes: number; // 15
  shifts: Shift[];
  breakRules: {
    maxDailyBreakMinutes: number; // 60
    maxAllowedBreaksPerDay: number; // 3
    overbreakAlertThresholdMinutes: number; // 15
    autoDeductUnpaidBreak: boolean;
  };
  attendanceRules: {
    lateThresholdMinutes: number; // 15
    earlyCheckoutThresholdMinutes: number; // 15
    minWorkingHoursFullDay: number; // 8
    minWorkingHoursHalfDay: number; // 4
    overtimeThresholdMinutes: number; // 30
    requireBiometricForBreak: boolean;
    autoMarkAbsentAfterHours: string; // "12:00"
  };
  biometricSettings: {
    autoSyncIntervalMinutes: number; // 5
    livePunchLogging: boolean;
    allowManualAdjustment: boolean;
  };
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: 'check_in' | 'check_out' | 'break_start' | 'break_end' | 'device_sync' | 'employee_added' | 'manual_override';
  title: string;
  description: string;
  employeeName?: string;
  employeeId?: string;
  departmentName?: string;
  deviceName?: string;
  method?: string;
}

export interface RolePermissions {
  viewDashboard: boolean;
  manageEmployees: boolean;
  manageAttendance: boolean;
  manageBreaks: boolean;
  viewReports: boolean;
  exportReports: boolean;
  manageDepartments: boolean;
  manageDevices: boolean;
  manageUsers: boolean;
  manageSettings: boolean;
}

// Teacher & Lecture Scheduling Types
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export type LectureType = 'Regular' | 'Practical' | 'Lab' | 'Tutorial' | 'Exam' | 'Extra Class';

export type LectureStatus = 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Lecture {
  id: string;
  teacherId: string;
  teacherName?: string;
  subject: string;
  className: string; // e.g. "12-A", "CS-301", "11-B"
  room: string; // e.g. "B-204", "Lab-1", "A-101"
  day: DayOfWeek;
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  type: LectureType;
  notes?: string;
  colorTheme?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet';
  batchYear?: string;
  courseCode?: string;
}

export interface TeacherProfile {
  id: string; // e.g. "TCH-1001" or "EMP-1001"
  employeeId: string; // "EMP-1001"
  fullName: string;
  avatarUrl: string;
  department: string;
  departmentId: string;
  designation: string;
  email: string;
  phone: string;
  employmentStatus: EmployeeStatus;
  biometricId: string;
  qualification: string;
  cabinRoom: string;
  joiningDate: string;
  specialization: string[];
  officeHours: string;
  bio?: string;
  totalWeeklyHours?: number;
}

export interface ScheduleConflict {
  hasConflict: boolean;
  conflictingLecture?: Lecture;
  message?: string;
}

export interface ScheduleStats {
  lecturesThisWeek: number;
  hoursThisWeek: number;
  lecturesToday: number;
  upcomingLecturesToday: number;
  practicalLabHours: number;
  nextLecture: Lecture | null;
}

export type ScheduleViewMode = 'week' | 'day' | 'list';

export interface ScheduleFilterState {
  search: string;
  subject: string;
  className: string;
  room: string;
  type: string;
  day?: DayOfWeek | 'All';
}

