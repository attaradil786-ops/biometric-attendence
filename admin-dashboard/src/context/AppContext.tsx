import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Employee,
  AttendanceRecord,
  BreakRecord,
  Department,
  BiometricDevice,
  AdminUser,
  SystemSettings,
  AppNotification,
  ActivityEvent,
  AttendanceStatus,
  BreakStatus,
} from '../types';
import {
  initialEmployees,
  initialAttendanceRecords,
  initialBreakRecords,
  initialDepartments,
  initialBiometricDevices,
  initialAdminUsers,
  initialSettings,
  initialNotifications,
  initialActivityEvents,
  TODAY_STR,
} from '../data/mockData';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  // Data
  employees: Employee[];
  attendance: AttendanceRecord[];
  breaks: BreakRecord[];
  departments: Department[];
  devices: BiometricDevice[];
  adminUsers: AdminUser[];
  settings: SystemSettings;
  notifications: AppNotification[];
  activityEvents: ActivityEvent[];
  toasts: ToastMessage[];

  // Modals & Terminals
  isSimulatorOpen: boolean;
  setIsSimulatorOpen: (open: boolean) => void;
  isEnrollmentOpen: boolean;
  setIsEnrollmentOpen: (open: boolean) => void;
  enrollmentEmployeeId: string | null;
  setEnrollmentEmployeeId: (id: string | null) => void;
  enrollmentDeviceId: string | null;
  setEnrollmentDeviceId: (id: string | null) => void;
  openBiometricEnrollment: (employeeId?: string, deviceId?: string) => void;
  enrollBiometricIdentity: (data: {
    employeeId: string;
    method: 'fingerprint' | 'face' | 'rfidCard' | 'all';
    deviceId?: string;
    qualityScore?: number;
    templateHash?: string;
    badgeCode?: string;
  }) => { success: boolean; message: string };
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Computed Dashboard Metrics
  stats: {
    totalEmployees: number;
    presentToday: number;
    absentToday: number;
    lateToday: number;
    workingNow: number;
    onBreakNow: number;
    totalWorkHoursFormatted: string;
    totalWorkMinutes: number;
    attendanceRate: number;
    onlineDevicesCount: number;
    totalDevicesCount: number;
  };

  // Actions
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  addDepartment: (dept: Omit<Department, 'id' | 'employeeCount' | 'activeCount' | 'createdAt'>) => void;
  updateDepartment: (id: string, dept: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  addDevice: (dev: Omit<BiometricDevice, 'id'>) => void;
  updateDevice: (id: string, dev: Partial<BiometricDevice>) => void;
  deleteDevice: (id: string) => void;
  syncDevice: (deviceId: string) => Promise<void>;
  syncAllDevices: () => Promise<void>;
  restartDevice: (deviceId: string) => Promise<void>;

  addAdminUser: (user: Omit<AdminUser, 'id' | 'lastLogin'>) => void;
  updateAdminUser: (id: string, user: Partial<AdminUser>) => void;
  deleteAdminUser: (id: string) => void;

  updateSettings: (newSettings: SystemSettings) => void;

  // Biometric punch & attendance actions
  simulateBiometricScan: (
    employeeId: string,
    action: 'check_in' | 'check_out' | 'break_start' | 'break_end',
    deviceId?: string,
    method?: 'Fingerprint' | 'Face ID' | 'RFID'
  ) => { success: boolean; message: string };

  manualAttendanceAdjustment: (
    employeeId: string,
    date: string,
    checkIn: string | null,
    checkOut: string | null,
    status: AttendanceStatus,
    notes?: string
  ) => void;

  startBreak: (employeeId: string, type: 'Lunch' | 'Tea / Coffee' | 'Short Break' | 'Personal', notes?: string) => void;
  endBreak: (breakId: string) => void;

  // Notifications & Toast
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    if (typeof window === 'undefined') return initialEmployees;

    const saved = localStorage.getItem('biosync_employees');
    try {
      return saved ? JSON.parse(saved) : initialEmployees;
    } catch {
      return initialEmployees;
    }
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch('https://biometric-attendence-p6nc.onrender.com/api/employees');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const formatted = data.map((emp: any) => ({
              ...emp,
              id: emp.id?.toString() || emp.employee_id || String(Math.random()),
              employeeId: emp.employee_id || emp.employeeId || `EMP-${emp.id || '0000'}`,
              name: emp.full_name || emp.name || 'Unnamed Employee',
              email: emp.email || '',
              department: emp.department || 'General',
              role: emp.role || emp.designation || 'Staff',
              status: emp.status || 'Active',
              joiningDate: emp.created_at ? new Date(emp.created_at).toLocaleDateString() : 'Jan 1, 2026',
              biometrics: emp.biometrics || {
                fingerprint: false,
                face: false,
                rfid: false,
              },
            }));
            setEmployees(formatted);
          }
        }
      } catch (err) {
        console.error('Error loading employees:', err);
      }
    };

    fetchEmployees();
  }, []);

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    if (typeof window === 'undefined') return initialAttendanceRecords;

    const saved = localStorage.getItem('biosync_attendance');
    try {
      return saved ? JSON.parse(saved) : initialAttendanceRecords;
    } catch {
      return initialAttendanceRecords;
    }
  });

  const [breaks, setBreaks] = useState<BreakRecord[]>(() => {
    if (typeof window === 'undefined') return initialBreakRecords;

    const saved = localStorage.getItem('biosync_breaks');
    try {
      return saved ? JSON.parse(saved) : initialBreakRecords;
    } catch {
      return initialBreakRecords;
    }
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    if (typeof window === 'undefined') return initialDepartments;

    const saved = localStorage.getItem('biosync_departments');
    try {
      return saved ? JSON.parse(saved) : initialDepartments;
    } catch {
      return initialDepartments;
    }
  });

  const [devices, setDevices] = useState<BiometricDevice[]>(() => {
    if (typeof window === 'undefined') return initialBiometricDevices;

    const saved = localStorage.getItem('biosync_devices');
    try {
      return saved ? JSON.parse(saved) : initialBiometricDevices;
    } catch {
      return initialBiometricDevices;
    }
  });

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    if (typeof window === 'undefined') return initialAdminUsers;

    const saved = localStorage.getItem('biosync_admin_users');
    try {
      return saved ? JSON.parse(saved) : initialAdminUsers;
    } catch {
      return initialAdminUsers;
    }
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    if (typeof window === 'undefined') return initialSettings;

    const saved = localStorage.getItem('biosync_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...initialSettings,
          ...parsed,
          breakRules: { ...initialSettings.breakRules, ...(parsed.breakRules || {}) },
          attendanceRules: { ...initialSettings.attendanceRules, ...(parsed.attendanceRules || {}) },
          biometricSettings: { ...initialSettings.biometricSettings, ...(parsed.biometricSettings || {}) },
        };
      } catch {
        return initialSettings;
      }
    }
    return initialSettings;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('biosync_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>(() => {
    const saved = localStorage.getItem('biosync_activity');
    return saved ? JSON.parse(saved) : initialActivityEvents;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
  const [enrollmentEmployeeId, setEnrollmentEmployeeId] = useState<string | null>(null);
  const [enrollmentDeviceId, setEnrollmentDeviceId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const openBiometricEnrollment = (employeeId?: string, deviceId?: string) => {
    if (employeeId) setEnrollmentEmployeeId(employeeId);
    if (deviceId) setEnrollmentDeviceId(deviceId);
    setIsEnrollmentOpen(true);
  };

  const enrollBiometricIdentity = (data: {
    employeeId: string;
    method: 'fingerprint' | 'face' | 'rfidCard' | 'all';
    deviceId?: string;
    qualityScore?: number;
    templateHash?: string;
    badgeCode?: string;
  }) => {
    const emp = employees.find((e) => e.id === data.employeeId);
    if (!emp) {
      return { success: false, message: 'Employee profile not found.' };
    }

    const dev = devices.find((d) => d.id === (data.deviceId || 'DEV-01')) || devices[0];
    const quality = data.qualityScore || 98;
    const hash = data.templateHash || `SHA256_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // Update Employee Enrolled Biometrics
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id === data.employeeId) {
          const currentEnrolled = { ...e.enrolledBiometrics };
          if (data.method === 'fingerprint' || data.method === 'all') currentEnrolled.fingerprint = true;
          if (data.method === 'face' || data.method === 'all') currentEnrolled.face = true;
          if (data.method === 'rfidCard' || data.method === 'all') currentEnrolled.rfidCard = true;

          return {
            ...e,
            enrolledBiometrics: currentEnrolled,
          };
        }
        return e;
      })
    );

    // Update Device Registered Template Count
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === dev.id) {
          return {
            ...d,
            registeredUsersCount: (d.registeredUsersCount || 18) + 1,
            lastSyncTime: 'Just now',
          };
        }
        return d;
      })
    );

    // Log Activity
    const modalityLabel =
      data.method === 'all'
        ? 'Triple-Modal (Face + Fingerprint + RFID)'
        : data.method === 'face'
        ? '3D Facial Mesh'
        : data.method === 'fingerprint'
        ? 'Capacitive Fingerprint Minutiae'
        : 'RFID Smart Badge';

    logActivity({
      type: 'device_sync',
      title: 'Biometric Identity Enrolled',
      description: `Hardware enrollment completed for ${emp.fullName} (${emp.id}) via ${dev.name}. Modality: ${modalityLabel}. Quality Score: ${quality}%. Hash: ${hash}. Synced across network.`,
      employeeName: emp.fullName,
      employeeId: emp.id,
      departmentName: emp.departmentName,
      deviceName: dev.name,
      method: modalityLabel,
    });

    showToast(
      'Biometric Identity Enrolled',
      `${emp.fullName} registered on ${dev.name} (${quality}% Quality match)`,
      'success'
    );

    return {
      success: true,
      message: `Successfully enrolled ${modalityLabel} for ${emp.fullName} on ${dev.name}.`,
    };
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('biosync_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('biosync_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('biosync_breaks', JSON.stringify(breaks));
  }, [breaks]);

  useEffect(() => {
    localStorage.setItem('biosync_departments', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('biosync_devices', JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem('biosync_admin_users', JSON.stringify(adminUsers));
  }, [adminUsers]);

  useEffect(() => {
    localStorage.setItem('biosync_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('biosync_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('biosync_activity', JSON.stringify(activityEvents));
  }, [activityEvents]);

  // Toast Notification helper
  const showToast = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const newToast: ToastMessage = {
      id: 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      title,
      message,
      type,
    };
    setToasts((prev) => [newToast, ...prev].slice(0, 5));
    setTimeout(() => {
      removeToast(newToast.id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper to add activity
  const logActivity = (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newEvent: ActivityEvent = {
      ...event,
      id: 'ACT-' + Date.now(),
      timestamp: timeStr,
    };
    setActivityEvents((prev) => [newEvent, ...prev].slice(0, 50));
  };

  // Live Calculations (Prompt Requirement #27)
  const todayAttendance = attendance.filter((r) => r.date === TODAY_STR);
  const activeEmployees = employees.filter((e) => e.status === 'Active');
  const activeBreaks = breaks.filter((b) => b.date === TODAY_STR && b.status === 'Active');

  const presentCount = todayAttendance.filter((r) =>
    ['Present', 'Working', 'Late', 'Early Checkout'].includes(r.status)
  ).length;

  const absentCount = todayAttendance.filter((r) => r.status === 'Absent').length +
    (activeEmployees.length - todayAttendance.length > 0 ? activeEmployees.length - todayAttendance.length : 0);

  const lateCount = todayAttendance.filter((r) => r.status === 'Late' || r.lateMinutes > 0).length;

  const workingNowCount = todayAttendance.filter(
    (r) => (r.status === 'Working' || (r.checkIn && !r.checkOut)) &&
      !activeBreaks.some((b) => b.employeeId === r.employeeId)
  ).length;

  const onBreakNowCount = activeBreaks.length;

  const totalWorkMinutes = todayAttendance.reduce((acc, curr) => acc + (curr.workDurationMinutes || 0), 0);
  const totalHrs = Math.floor(totalWorkMinutes / 60);
  const remMins = totalWorkMinutes % 66;
  const totalWorkHoursFormatted = `${totalHrs}h ${remMins}m`;

  const attendanceRate = activeEmployees.length > 0
    ? Math.round((presentCount / activeEmployees.length) * 100)
    : 0;

  const onlineDevicesCount = devices.filter((d) => d.status === 'Online').length;

  const stats = {
    totalEmployees: activeEmployees.length,
    presentToday: presentCount,
    absentToday: absentCount,
    lateToday: lateCount,
    workingNow: workingNowCount,
    onBreakNow: onBreakNowCount,
    totalWorkHoursFormatted,
    totalWorkMinutes,
    attendanceRate,
    onlineDevicesCount,
    totalDevicesCount: devices.length,
  };

  // Actions: Employee
  const addEmployee = (empData: Omit<Employee, 'id'>) => {
    const newId = `EMP-${1000 + employees.length + 1}`;
    const newBioId = empData.biometricId || `BIO-${8000 + employees.length + 1}`;
    const dept = departments.find((d) => d.id === empData.departmentId);

    const newEmp: Employee = {
      ...empData,
      id: newId,
      biometricId: newBioId,
      departmentName: dept ? dept.name : empData.departmentName,
      avatarUrl:
        empData.avatarUrl ||
        `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    };

    setEmployees((prev) => [newEmp, ...prev]);

    // Update department counts
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === empData.departmentId
          ? { ...d, employeeCount: d.employeeCount + 1, activeCount: d.activeCount + 1 }
          : d
      )
    );

    // Initial today attendance record (status absent/unregistered until punched)
    logActivity({
      type: 'employee_added',
      title: 'New Employee Registered',
      description: `${newEmp.fullName} (${newEmp.designation}) was enrolled into ${newEmp.departmentName}.`,
      employeeName: newEmp.fullName,
      employeeId: newEmp.id,
      departmentName: newEmp.departmentName,
    });

    showToast('Employee Added', `${newEmp.fullName} was enrolled successfully with ID ${newId}`, 'success');
  };

  const updateEmployee = (id: string, updatedFields: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === id) {
          const dept = departments.find((d) => d.id === updatedFields.departmentId);
          return {
            ...emp,
            ...updatedFields,
            departmentName: dept ? dept.name : (updatedFields.departmentName || emp.departmentName),
          };
        }
        return emp;
      })
    );
    showToast('Employee Updated', 'Employee details were saved successfully.', 'success');
  };

  const deleteEmployee = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    if (!emp) return;

    setEmployees((prev) => prev.filter((e) => e.id !== id));
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === emp.departmentId
          ? {
              ...d,
              employeeCount: Math.max(0, d.employeeCount - 1),
              activeCount: Math.max(0, d.activeCount - 1),
            }
          : d
      )
    );
    showToast('Employee Removed', `${emp.fullName} has been archived.`, 'info');
  };

  // Actions: Department
  const addDepartment = (deptData: Omit<Department, 'id' | 'employeeCount' | 'activeCount' | 'createdAt'>) => {
    const newId = `DEP-0${departments.length + 1}`;
    const newDept: Department = {
      ...deptData,
      id: newId,
      employeeCount: 0,
      activeCount: 0,
      createdAt: TODAY_STR,
    };
    setDepartments((prev) => [...prev, newDept]);
    showToast('Department Created', `${newDept.name} created successfully.`, 'success');
  };

  const updateDepartment = (id: string, fields: Partial<Department>) => {
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, ...fields } : d)));
    showToast('Department Updated', 'Changes were saved.', 'success');
  };

  const deleteDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    showToast('Department Deleted', 'Department was removed.', 'info');
  };

  // Actions: Devices
  const addDevice = (devData: Omit<BiometricDevice, 'id'>) => {
    const newId = `DEV-0${devices.length + 1}`;
    const newDev: BiometricDevice = {
      ...devData,
      id: newId,
      lastSyncTime: 'Just now',
    };
    setDevices((prev) => [...prev, newDev]);
    showToast('Device Configured', `${newDev.name} registered on network.`, 'success');
  };

  const updateDevice = (id: string, fields: Partial<BiometricDevice>) => {
    setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, ...fields } : d)));
    showToast('Device Updated', 'Device settings updated.', 'success');
  };

  const deleteDevice = (id: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    showToast('Device Removed', 'Biometric device deleted.', 'info');
  };

  const syncDevice = async (deviceId: string) => {
    const dev = devices.find((d) => d.id === deviceId);
    if (!dev) return;

    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, status: 'Syncing', isSyncing: true } : d))
    );

    // Simulate network handshake
    await new Promise((res) => setTimeout(res, 1200));

    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId
          ? {
              ...d,
              status: 'Online',
              isSyncing: false,
              lastSyncTime: 'Just now',
              registeredUsersCount: employees.length,
            }
          : d
      )
    );

    logActivity({
      type: 'device_sync',
      title: 'Device Synchronized',
      description: `Biometric terminal '${dev.name}' (${dev.ipAddress}) completed template sync.`,
      deviceName: dev.name,
    });

    showToast('Sync Successful', `${dev.name} synced ${employees.length} biometric templates.`, 'success');
  };

  const syncAllDevices = async () => {
    setDevices((prev) => prev.map((d) => ({ ...d, status: 'Syncing', isSyncing: true })));
    await new Promise((res) => setTimeout(res, 1500));
    setDevices((prev) =>
      prev.map((d) => ({
        ...d,
        status: d.status === 'Offline' ? 'Offline' : 'Online',
        isSyncing: false,
        lastSyncTime: 'Just now',
        registeredUsersCount: employees.length,
      }))
    );
    showToast('All Devices Synced', 'Biometric records synchronized across gateways.', 'success');
  };

  const restartDevice = async (deviceId: string) => {
    const dev = devices.find((d) => d.id === deviceId);
    if (!dev) return;

    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, status: 'Offline' } : d))
    );

    showToast('Reboot Initiated', `Restarting hardware controller on ${dev.name}...`, 'info');

    await new Promise((res) => setTimeout(res, 2000));

    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, status: 'Online', lastSyncTime: 'Just now' } : d))
    );

    showToast('Device Online', `${dev.name} rebooted and connected.`, 'success');
  };

  // Actions: Admin Users
  const addAdminUser = (userData: Omit<AdminUser, 'id' | 'lastLogin'>) => {
    const newId = `USR-0${adminUsers.length + 1}`;
    const newUser: AdminUser = {
      ...userData,
      id: newId,
      lastLogin: 'Never',
    };
    setAdminUsers((prev) => [...prev, newUser]);
    showToast('User Created', `Administrator account created for ${newUser.name}.`, 'success');
  };

  const updateAdminUser = (id: string, fields: Partial<AdminUser>) => {
    setAdminUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...fields } : u)));
    showToast('User Updated', 'User permissions updated.', 'success');
  };

  const deleteAdminUser = (id: string) => {
    setAdminUsers((prev) => prev.filter((u) => u.id !== id));
    showToast('User Deleted', 'User access revoked.', 'info');
  };

  // Actions: Settings
  const updateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    showToast('Settings Saved', 'Office attendance policies and rules updated.', 'success');
  };

  // Biometric Scan Simulation Engine (Prompt #26)
  const simulateBiometricScan = (
    employeeId: string,
    action: 'check_in' | 'check_out' | 'break_start' | 'break_end',
    deviceId = 'DEV-01',
    method: 'Fingerprint' | 'Face ID' | 'RFID' = 'Face ID'
  ) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return { success: false, message: 'Employee not found' };

    const dev = devices.find((d) => d.id === deviceId) || devices[0];
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0]; // "HH:mm:ss"
    const currentMins = now.getHours() * 60 + now.getMinutes();

    // Opening time config (default 09:00 = 540 mins)
    const [openH, openM] = settings.officeOpeningTime.split(':').map(Number);
    const openingMins = openH * 60 + openM;
    const graceMins = settings.gracePeriodMinutes;

    if (action === 'check_in') {
      const existing = attendance.find((a) => a.employeeId === employeeId && a.date === TODAY_STR);

      if (existing && existing.checkIn) {
        return {
          success: false,
          message: `${emp.fullName} has already clocked in today at ${existing.checkIn}.`,
        };
      }

      const isLate = currentMins > openingMins + graceMins;
      const lateMinutes = isLate ? currentMins - openingMins : 0;
      const status: AttendanceStatus = isLate ? 'Late' : 'Working';

      const newRecord: AttendanceRecord = {
        id: existing ? existing.id : `ATT-${Date.now()}`,
        employeeId: emp.id,
        employeeName: emp.fullName,
        departmentName: emp.departmentName,
        date: TODAY_STR,
        checkIn: timeStr,
        checkOut: null,
        workDurationMinutes: 0,
        breakDurationMinutes: 0,
        status: status,
        lateMinutes: lateMinutes,
        earlyCheckoutMinutes: 0,
        overtimeMinutes: 0,
        deviceId: dev.id,
        verificationMethod: method,
      };

      setAttendance((prev) => {
        const filtered = prev.filter((a) => !(a.employeeId === employeeId && a.date === TODAY_STR));
        return [newRecord, ...filtered];
      });

      logActivity({
        type: 'check_in',
        title: isLate ? 'Late Clock-in' : 'Biometric Check-in',
        description: `${emp.fullName} authenticated via ${method} at ${dev.name} (${timeStr})${
          isLate ? ` - Late by ${lateMinutes}m` : ''
        }.`,
        employeeName: emp.fullName,
        employeeId: emp.id,
        departmentName: emp.departmentName,
        deviceName: dev.name,
        method: method,
      });

      showToast(
        isLate ? 'Late Check-in Logged' : 'Biometric Check-in Successful',
        `${emp.fullName} checked in at ${timeStr} via ${method}`,
        isLate ? 'warning' : 'success'
      );

      return { success: true, message: `Checked in successfully at ${timeStr}` };
    }

    if (action === 'check_out') {
      const existing = attendance.find((a) => a.employeeId === employeeId && a.date === TODAY_STR);
      if (!existing || !existing.checkIn) {
        return {
          success: false,
          message: `Cannot check out: ${emp.fullName} has not checked in today.`,
        };
      }

      // Check if currently on active break
      const onBreak = breaks.find(
        (b) => b.employeeId === employeeId && b.date === TODAY_STR && b.status === 'Active'
      );
      if (onBreak) {
        // Automatically close break
        endBreak(onBreak.id);
      }

      // Calculate work duration
      const [inH, inM] = existing.checkIn.split(':').map(Number);
      const checkInMins = inH * 60 + inM;
      const totalMinutesWorked = Math.max(0, currentMins - checkInMins - existing.breakDurationMinutes);

      const [closeH, closeM] = settings.officeClosingTime.split(':').map(Number);
      const closingMins = closeH * 60 + closeM;
      const earlyCheckoutMins = currentMins < closingMins ? closingMins - currentMins : 0;
      const overtimeMins = currentMins > closingMins + settings.attendanceRules.overtimeThresholdMinutes
        ? currentMins - closingMins
        : 0;

      let finalStatus: AttendanceStatus = 'Present';
      if (existing.status === 'Late') {
        finalStatus = 'Late';
      } else if (earlyCheckoutMins > settings.attendanceRules.earlyCheckoutThresholdMinutes) {
        finalStatus = 'Early Checkout';
      }

      const updatedRecord: AttendanceRecord = {
        ...existing,
        checkOut: timeStr,
        workDurationMinutes: totalMinutesWorked,
        status: finalStatus,
        earlyCheckoutMinutes: earlyCheckoutMins,
        overtimeMinutes: overtimeMins,
      };

      setAttendance((prev) =>
        prev.map((r) => (r.id === existing.id ? updatedRecord : r))
      );

      logActivity({
        type: 'check_out',
        title: 'Biometric Check-out',
        description: `${emp.fullName} clocked out at ${timeStr} via ${dev.name}. Worked ${Math.floor(
          totalMinutesWorked / 60
        )}h ${totalMinutesWorked % 60}m.`,
        employeeName: emp.fullName,
        employeeId: emp.id,
        departmentName: emp.departmentName,
        deviceName: dev.name,
        method: method,
      });

      showToast(
        'Check-out Recorded',
        `${emp.fullName} checked out at ${timeStr}. Total: ${Math.floor(
          totalMinutesWorked / 60
        )}h ${totalMinutesWorked % 60}m`,
        'success'
      );

      return { success: true, message: `Checked out successfully at ${timeStr}` };
    }

    if (action === 'break_start') {
      const activeBreak = breaks.find(
        (b) => b.employeeId === employeeId && b.date === TODAY_STR && b.status === 'Active'
      );
      if (activeBreak) {
        return {
          success: false,
          message: `${emp.fullName} is already currently on break (started at ${activeBreak.startTime}).`,
        };
      }

      const newBreak: BreakRecord = {
        id: `BRK-${Date.now()}`,
        employeeId: emp.id,
        employeeName: emp.fullName,
        departmentName: emp.departmentName,
        date: TODAY_STR,
        startTime: timeStr,
        endTime: null,
        durationMinutes: 0,
        status: 'Active',
        type: 'Short Break',
      };

      setBreaks((prev) => [newBreak, ...prev]);

      logActivity({
        type: 'break_start',
        title: 'Break Commenced',
        description: `${emp.fullName} initiated break at ${timeStr} (${dev.name}).`,
        employeeName: emp.fullName,
        employeeId: emp.id,
        departmentName: emp.departmentName,
        deviceName: dev.name,
      });

      showToast('Break Started', `${emp.fullName} started break at ${timeStr}`, 'info');
      return { success: true, message: `Break started at ${timeStr}` };
    }

    if (action === 'break_end') {
      const activeBreak = breaks.find(
        (b) => b.employeeId === employeeId && b.date === TODAY_STR && b.status === 'Active'
      );
      if (!activeBreak) {
        return {
          success: false,
          message: `${emp.fullName} does not have an ongoing active break.`,
        };
      }

      const [sH, sM] = activeBreak.startTime.split(':').map(Number);
      const startMins = sH * 60 + sM;
      const duration = Math.max(1, currentMins - startMins);
      const isOver = duration > settings.breakRules.maxDailyBreakMinutes;

      const updatedBreak: BreakRecord = {
        ...activeBreak,
        endTime: timeStr,
        durationMinutes: duration,
        status: isOver ? 'Overbreak' : 'Completed',
      };

      setBreaks((prev) =>
        prev.map((b) => (b.id === activeBreak.id ? updatedBreak : b))
      );

      // Update break duration on attendance record
      setAttendance((prev) =>
        prev.map((att) => {
          if (att.employeeId === employeeId && att.date === TODAY_STR) {
            return {
              ...att,
              breakDurationMinutes: att.breakDurationMinutes + duration,
            };
          }
          return att;
        })
      );

      logActivity({
        type: 'break_end',
        title: 'Break Concluded',
        description: `${emp.fullName} returned from break at ${timeStr} (${duration} mins).`,
        employeeName: emp.fullName,
        employeeId: emp.id,
        departmentName: emp.departmentName,
        deviceName: dev.name,
      });

      showToast(
        isOver ? 'Break Exceeded Limit' : 'Break Concluded',
        `${emp.fullName} finished break (${duration}m).`,
        isOver ? 'warning' : 'success'
      );

      return { success: true, message: `Break ended at ${timeStr} (${duration}m)` };
    }

    return { success: false, message: 'Invalid action' };
  };

  const manualAttendanceAdjustment = (
    employeeId: string,
    date: string,
    checkIn: string | null,
    checkOut: string | null,
    status: AttendanceStatus,
    notes?: string
  ) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;

    let workDuration = 0;
    if (checkIn && checkOut) {
      const [inH, inM] = checkIn.split(':').map(Number);
      const [outH, outM] = checkOut.split(':').map(Number);
      workDuration = Math.max(0, outH * 60 + outM - (inH * 60 + inM));
    }

    const existing = attendance.find((a) => a.employeeId === employeeId && a.date === date);

    if (existing) {
      setAttendance((prev) =>
        prev.map((r) =>
          r.id === existing.id
            ? {
                ...r,
                checkIn,
                checkOut,
                status,
                workDurationMinutes: workDuration,
                notes: notes || r.notes,
                verificationMethod: 'Manual',
              }
            : r
        )
      );
    } else {
      const newRec: AttendanceRecord = {
        id: `ATT-MANUAL-${Date.now()}`,
        employeeId: emp.id,
        employeeName: emp.fullName,
        departmentName: emp.departmentName,
        date,
        checkIn,
        checkOut,
        workDurationMinutes: workDuration,
        breakDurationMinutes: 0,
        status,
        lateMinutes: 0,
        earlyCheckoutMinutes: 0,
        overtimeMinutes: 0,
        verificationMethod: 'Manual',
        notes,
      };
      setAttendance((prev) => [newRec, ...prev]);
    }

    logActivity({
      type: 'manual_override',
      title: 'Manual Attendance Override',
      description: `HR adjusted attendance record for ${emp.fullName} on ${date}.`,
      employeeName: emp.fullName,
      employeeId: emp.id,
      departmentName: emp.departmentName,
    });

    showToast('Record Updated', `Attendance for ${emp.fullName} updated manually.`, 'success');
  };

  const startBreak = (
    employeeId: string,
    type: 'Lunch' | 'Tea / Coffee' | 'Short Break' | 'Personal',
    notes?: string
  ) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const newBreak: BreakRecord = {
      id: `BRK-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.fullName,
      departmentName: emp.departmentName,
      date: TODAY_STR,
      startTime: timeStr,
      endTime: null,
      durationMinutes: 0,
      status: 'Active',
      type,
      notes,
    };

    setBreaks((prev) => [newBreak, ...prev]);
    showToast('Break Logged', `${emp.fullName} started ${type} at ${timeStr}.`, 'info');
  };

  const endBreak = (breakId: string) => {
    const brk = breaks.find((b) => b.id === breakId);
    if (!brk || brk.status !== 'Active') return;

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const [sH, sM] = brk.startTime.split(':').map(Number);
    const startMins = sH * 60 + sM;
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const duration = Math.max(1, currentMins - startMins);
    const isOver = duration > settings.breakRules.maxDailyBreakMinutes;

    setBreaks((prev) =>
      prev.map((b) =>
        b.id === breakId
          ? {
              ...b,
              endTime: timeStr,
              durationMinutes: duration,
              status: isOver ? 'Overbreak' : 'Completed',
            }
          : b
      )
    );

    // add to attendance record
    setAttendance((prev) =>
      prev.map((att) => {
        if (att.employeeId === brk.employeeId && att.date === brk.date) {
          return {
            ...att,
            breakDurationMinutes: att.breakDurationMinutes + duration,
          };
        }
        return att;
      })
    );

    showToast('Break Ended', `${brk.employeeName} completed break (${duration}m).`, 'success');
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Notifications Updated', 'All marked as read.', 'info');
  };

  const clearNotifications = () => {
    setNotifications([]);
    showToast('Notifications Cleared', 'All alerts removed.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        employees,
        attendance,
        breaks,
        departments,
        devices,
        adminUsers,
        settings,
        notifications,
        activityEvents,
        toasts,
        isSimulatorOpen,
        setIsSimulatorOpen,
        isEnrollmentOpen,
        setIsEnrollmentOpen,
        enrollmentEmployeeId,
        setEnrollmentEmployeeId,
        enrollmentDeviceId,
        setEnrollmentDeviceId,
        openBiometricEnrollment,
        enrollBiometricIdentity,
        isSearchOpen,
        setIsSearchOpen,
        stats,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        addDevice,
        updateDevice,
        deleteDevice,
        syncDevice,
        syncAllDevices,
        restartDevice,
        addAdminUser,
        updateAdminUser,
        deleteAdminUser,
        updateSettings,
        simulateBiometricScan,
        manualAttendanceAdjustment,
        startBreak,
        endBreak,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
