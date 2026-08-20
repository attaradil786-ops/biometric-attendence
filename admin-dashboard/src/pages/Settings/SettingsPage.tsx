import React, { useState } from 'react';
import {
  Settings,
  Building,
  Clock,
  Coffee,
  ShieldCheck,
  Cpu,
  Bell,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Key,
  Lock,
  Copy,
  Eye,
  EyeOff,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth, DEFAULT_MASTER_SECURITY_KEY, ROLE_DEFAULT_PASSWORDS } from '../../context/AuthContext';
import { SystemSettings, Shift } from '../../types';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const { masterSecurityKey, updateMasterSecurityKey, currentUser, allUsers } = useAuth();

  const [formState, setFormState] = useState<SystemSettings>({
    companyName: settings.companyName || 'BioSync Enterprise Technologies Inc.',
    officeLocation: settings.officeLocation || '700 Mission St, 8th Floor, San Francisco, CA 94103',
    timeZone: settings.timeZone || 'America/Los_Angeles (PST - UTC-8)',
    workingDays: settings.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    officeOpeningTime: settings.officeOpeningTime || '09:00',
    officeClosingTime: settings.officeClosingTime || '18:00',
    gracePeriodMinutes: settings.gracePeriodMinutes ?? 15,
    shifts: settings.shifts || [],
    breakRules: {
      maxDailyBreakMinutes: settings.breakRules?.maxDailyBreakMinutes ?? 60,
      maxAllowedBreaksPerDay: settings.breakRules?.maxAllowedBreaksPerDay ?? 3,
      overbreakAlertThresholdMinutes: settings.breakRules?.overbreakAlertThresholdMinutes ?? 15,
      autoDeductUnpaidBreak: settings.breakRules?.autoDeductUnpaidBreak ?? true,
    },
    attendanceRules: {
      lateThresholdMinutes: settings.attendanceRules?.lateThresholdMinutes ?? 15,
      earlyCheckoutThresholdMinutes: settings.attendanceRules?.earlyCheckoutThresholdMinutes ?? 15,
      minWorkingHoursFullDay: settings.attendanceRules?.minWorkingHoursFullDay ?? 8,
      minWorkingHoursHalfDay: settings.attendanceRules?.minWorkingHoursHalfDay ?? 4.5,
      overtimeThresholdMinutes: settings.attendanceRules?.overtimeThresholdMinutes ?? 30,
      requireBiometricForBreak: settings.attendanceRules?.requireBiometricForBreak ?? true,
      autoMarkAbsentAfterHours: settings.attendanceRules?.autoMarkAbsentAfterHours || '12:00',
    },
    biometricSettings: {
      autoSyncIntervalMinutes: settings.biometricSettings?.autoSyncIntervalMinutes ?? 5,
      livePunchLogging: settings.biometricSettings?.livePunchLogging ?? true,
      allowManualAdjustment: settings.biometricSettings?.allowManualAdjustment ?? true,
    },
  });

  const [notificationSettings, setNotificationSettings] = useState({
    lateArrivalAlerts: true,
    deviceOfflineAlerts: true,
    overbreakAlerts: true,
  });

  const [activeTab, setActiveTab] = useState<'office' | 'shifts' | 'breaks' | 'rules' | 'devices' | 'notifications' | 'security'>('office');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Security Key editing state
  const [currentMasterKeyInput, setCurrentMasterKeyInput] = useState(masterSecurityKey);
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [keyUpdateMessage, setKeyUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleUpdateMasterKey = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateMasterSecurityKey(currentMasterKeyInput);
    if (res.success) {
      setKeyUpdateMessage({ type: 'success', text: 'Organization Master Security Key updated successfully!' });
      setTimeout(() => setKeyUpdateMessage(null), 4000);
    } else {
      setKeyUpdateMessage({ type: 'error', text: res.error || 'Failed to update Master Security Key.' });
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(currentMasterKeyInput);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleResetDefaultKey = () => {
    setCurrentMasterKeyInput(DEFAULT_MASTER_SECURITY_KEY);
    updateMasterSecurityKey(DEFAULT_MASTER_SECURITY_KEY);
    setKeyUpdateMessage({ type: 'success', text: `Key reset to default "${DEFAULT_MASTER_SECURITY_KEY}".` });
    setTimeout(() => setKeyUpdateMessage(null), 4000);
  };

  const handleFieldChange = (field: keyof SystemSettings, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBreakRulesChange = (field: keyof SystemSettings['breakRules'], value: any) => {
    setFormState((prev) => ({
      ...prev,
      breakRules: { ...prev.breakRules, [field]: value },
    }));
  };

  const handleAttendanceRulesChange = (field: keyof SystemSettings['attendanceRules'], value: any) => {
    setFormState((prev) => ({
      ...prev,
      attendanceRules: { ...prev.attendanceRules, [field]: value },
    }));
  };

  const handleBiometricSettingsChange = (field: keyof SystemSettings['biometricSettings'], value: any) => {
    setFormState((prev) => ({
      ...prev,
      biometricSettings: { ...prev.biometricSettings, [field]: value },
    }));
  };

  const handleWorkingDayToggle = (day: string) => {
    const current = formState.workingDays;
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    handleFieldChange('workingDays', next);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formState);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            System & Attendance Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure office shifts, biometric grace periods, break policies, and gateway sync parameters
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Save System Configuration
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Configuration saved successfully! All biometric rules and thresholds updated.</span>
        </div>
      )}

      {/* Main Settings Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-60 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-3 space-y-1 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={() => setActiveTab('office')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'office'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Building className="w-4 h-4" />
            Office & Timings
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shifts')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'shifts'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            Shift Schedules ({formState.shifts.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('breaks')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'breaks'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Coffee className="w-4 h-4" />
            Break Policy Rules
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'rules'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Attendance Thresholds
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('devices')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'devices'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Biometric Gateways
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'notifications'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            Notifications & Alerts
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Key className="w-4 h-4 text-amber-500" />
            Security & Registration
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 p-5 sm:p-6">
          {/* Office & Timings */}
          {activeTab === 'office' && (
            <div className="space-y-5 max-w-2xl">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Organization Profile & Operating Timings
                </h3>
                <p className="text-xs text-slate-500">
                  Global organization parameters and standard office hours
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formState.companyName}
                    onChange={(e) => handleFieldChange('companyName', e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Time Zone
                  </label>
                  <select
                    value={formState.timeZone}
                    onChange={(e) => handleFieldChange('timeZone', e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    <option value="America/Los_Angeles (PST - UTC-8)">Pacific Time (PST - UTC-8)</option>
                    <option value="America/New_York (EST - UTC-5)">Eastern Time (EST - UTC-5)</option>
                    <option value="Europe/London (GMT - UTC+0)">London / GMT (UTC+0)</option>
                    <option value="Asia/Tokyo (JST - UTC+9)">Tokyo / JST (UTC+9)</option>
                    <option value="Asia/Dubai (GST - UTC+4)">Dubai / GST (UTC+4)</option>
                    <option value="Asia/Kolkata (IST - UTC+5:30)">India / IST (UTC+5:30)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Headquarters Location
                </label>
                <input
                  type="text"
                  value={formState.officeLocation}
                  onChange={(e) => handleFieldChange('officeLocation', e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              {/* Timings */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Standard Shift Timings
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Opening / In Time
                    </label>
                    <input
                      type="time"
                      value={formState.officeOpeningTime}
                      onChange={(e) => handleFieldChange('officeOpeningTime', e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Closing / Out Time
                    </label>
                    <input
                      type="time"
                      value={formState.officeClosingTime}
                      onChange={(e) => handleFieldChange('officeClosingTime', e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Late Grace Period (Mins)
                    </label>
                    <input
                      type="number"
                      value={formState.gracePeriodMinutes}
                      onChange={(e) => handleFieldChange('gracePeriodMinutes', parseInt(e.target.value) || 0)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Working Days */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Official Working Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => {
                    const isSelected = formState.workingDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleWorkingDayToggle(day)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Shifts */}
          {activeTab === 'shifts' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Organizational Shift Schedules
                </h3>
                <p className="text-xs text-slate-500">
                  Manage roster shifts, start/end windows, and grace periods
                </p>
              </div>

              <div className="space-y-3">
                {formState.shifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {shift.name}
                        </span>
                        {shift.isDefault && (
                          <span className="text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                        {shift.startTime} - {shift.endTime} (Grace: {shift.graceMinutes}m)
                      </p>
                    </div>

                    <div className="text-right text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {shift.type} Shift
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Break Rules */}
          {activeTab === 'breaks' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Break Policy & Overbreak Controls
                </h3>
                <p className="text-xs text-slate-500">
                  Configure maximum break allowances and alert thresholds
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Max Daily Break Duration (Mins)
                  </label>
                  <input
                    type="number"
                    value={formState.breakRules.maxDailyBreakMinutes}
                    onChange={(e) =>
                      handleBreakRulesChange('maxDailyBreakMinutes', parseInt(e.target.value) || 0)
                    }
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Max Allowed Breaks per Shift
                  </label>
                  <input
                    type="number"
                    value={formState.breakRules.maxAllowedBreaksPerDay}
                    onChange={(e) =>
                      handleBreakRulesChange('maxAllowedBreaksPerDay', parseInt(e.target.value) || 0)
                    }
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Overbreak Alert Threshold (Mins)
                  </label>
                  <input
                    type="number"
                    value={formState.breakRules.overbreakAlertThresholdMinutes}
                    onChange={(e) =>
                      handleBreakRulesChange('overbreakAlertThresholdMinutes', parseInt(e.target.value) || 0)
                    }
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                <div className="flex items-end">
                  <label className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between w-full cursor-pointer">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Auto Deduct Unpaid Breaks
                    </span>
                    <input
                      type="checkbox"
                      checked={formState.breakRules.autoDeductUnpaidBreak}
                      onChange={(e) => handleBreakRulesChange('autoDeductUnpaidBreak', e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Thresholds */}
          {activeTab === 'rules' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Attendance Classification Thresholds
                </h3>
                <p className="text-xs text-slate-500">
                  Define minimum hour requirements for full day and half day credits
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Min Hours for Full Day Credit
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formState.attendanceRules.minWorkingHoursFullDay}
                    onChange={(e) =>
                      handleAttendanceRulesChange('minWorkingHoursFullDay', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Min Hours for Half Day Credit
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formState.attendanceRules.minWorkingHoursHalfDay}
                    onChange={(e) =>
                      handleAttendanceRulesChange('minWorkingHoursHalfDay', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Late Arrival Threshold (Mins)
                  </label>
                  <input
                    type="number"
                    value={formState.attendanceRules.lateThresholdMinutes}
                    onChange={(e) =>
                      handleAttendanceRulesChange('lateThresholdMinutes', parseInt(e.target.value) || 0)
                    }
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Overtime Minimum Threshold (Mins)
                  </label>
                  <input
                    type="number"
                    value={formState.attendanceRules.overtimeThresholdMinutes}
                    onChange={(e) =>
                      handleAttendanceRulesChange('overtimeThresholdMinutes', parseInt(e.target.value) || 0)
                    }
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Biometric Gateways */}
          {activeTab === 'devices' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Hardware Gateway Polling Settings
                </h3>
                <p className="text-xs text-slate-500">
                  Configure TCP/IP polling background interval and connection parameters
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Auto-Sync Polling Interval (Mins)
                  </label>
                  <input
                    type="number"
                    value={formState.biometricSettings.autoSyncIntervalMinutes}
                    onChange={(e) =>
                      handleBiometricSettingsChange('autoSyncIntervalMinutes', parseInt(e.target.value) || 1)
                    }
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                <div className="flex items-end">
                  <label className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between w-full cursor-pointer">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Live Hardware Punch Logging
                    </span>
                    <input
                      type="checkbox"
                      checked={formState.biometricSettings.livePunchLogging}
                      onChange={(e) =>
                        handleBiometricSettingsChange('livePunchLogging', e.target.checked)
                      }
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  System Alerts & Email Triggers
                </h3>
                <p className="text-xs text-slate-500">
                  Control which attendance events trigger administrator notifications
                </p>
              </div>

              <div className="space-y-3">
                <label className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      Late Arrival Alerts
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Notify HR when an employee scans in after grace period
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.lateArrivalAlerts}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        lateArrivalAlerts: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>

                <label className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      Biometric Device Offline Alerts
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Send high-priority warning when a terminal gateway loses connection
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.deviceOfflineAlerts}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        deviceOfflineAlerts: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>

                <label className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      Overbreak Violation Alerts
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Notify manager when active meal breaks exceed policy limits
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.overbreakAlerts}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        overbreakAlerts: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Security & Master Registration Key */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-600" />
                  Organization Master Security Key & Access Control
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Protect role signup & unauthorized administrative creation across your organization
                </p>
              </div>

              {keyUpdateMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 border animate-fadeIn ${
                    keyUpdateMessage.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {keyUpdateMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{keyUpdateMessage.text}</span>
                </div>
              )}

              {/* Master Security Key Box */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Sign-Up Security Key Requirement
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Anyone creating an account via the Sign Up portal MUST provide this Master Key. This prevents unauthorized public visitors from creating administrative roles or accessing workforce attendance records.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUpdateMasterKey} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Current Master Security Key
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={isKeyVisible ? 'text' : 'password'}
                        value={currentMasterKeyInput}
                        onChange={(e) => setCurrentMasterKeyInput(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 pr-24"
                        placeholder="Enter new master key..."
                      />
                      <div className="absolute right-2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setIsKeyVisible(!isKeyVisible)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title={isKeyVisible ? 'Hide Key' : 'Show Key'}
                        >
                          {isKeyVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyKey}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Copy Master Key"
                        >
                          {copiedKey ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Update Master Key
                    </button>
                    <button
                      type="button"
                      onClick={handleResetDefaultKey}
                      className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
                    >
                      Reset Default
                    </button>
                  </div>
                </form>
              </div>

              {/* Roles & Credential Summary */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Registered Administrative Accounts ({allUsers.length})
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Role-Based Access Control
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {allUsers.map((user) => (
                    <div key={user.id} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {user.name} {user.id === currentUser?.id && <span className="text-[10px] text-indigo-600 font-normal">(You)</span>}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800/60">
                          {user.role}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          ••••••••
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
