import React, { useState } from 'react';
import {
  Fingerprint,
  ScanFace,
  CreditCard,
  CheckCircle2,
  LogIn,
  LogOut,
  Coffee,
  Play,
  RotateCw,
  Cpu,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { StatusBadge } from '../ui/StatusBadge';

export const BiometricPunchModal: React.FC = () => {
  const {
    isSimulatorOpen,
    setIsSimulatorOpen,
    employees,
    devices,
    attendance,
    breaks,
    simulateBiometricScan,
  } = useApp();

  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [selectedAction, setSelectedAction] = useState<'check_in' | 'check_out' | 'break_start' | 'break_end'>('check_in');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devices[0]?.id || '');
  const [selectedMethod, setSelectedMethod] = useState<'Fingerprint' | 'Face ID' | 'RFID'>('Face ID');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId) || employees[0];
  const todayRecord = attendance.find((a) => a.employeeId === selectedEmpId && a.date === '2026-08-18');
  const activeBreak = breaks.find((b) => b.employeeId === selectedEmpId && b.date === '2026-08-18' && b.status === 'Active');

  const handleExecuteScan = async () => {
    if (!selectedEmpId) return;

    setIsScanning(true);
    setScanResult(null);

    // Simulate realistic hardware scan delay
    await new Promise((res) => setTimeout(res, 800));

    const res = simulateBiometricScan(
      selectedEmpId,
      selectedAction,
      selectedDeviceId,
      selectedMethod
    );

    setIsScanning(false);
    setScanResult(res);
  };

  return (
    <Modal
      isOpen={isSimulatorOpen}
      onClose={() => {
        setIsSimulatorOpen(false);
        setScanResult(null);
      }}
      title="Biometric Hardware Simulator"
      subtitle="Simulate real-time biometric terminal punches to test workforce tracking & events"
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            Hardware gateway active
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsSimulatorOpen(false);
                setScanResult(null);
              }}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleExecuteScan}
              disabled={isScanning}
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 disabled:opacity-50 transition-colors"
            >
              {isScanning ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  Verifying Biometrics...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Transmit Punch Event
                </>
              )}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Step 1: Employee Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
            1. Select Employee
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <select
                value={selectedEmpId}
                onChange={(e) => {
                  setSelectedEmpId(e.target.value);
                  setScanResult(null);
                }}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.id}) - {emp.departmentName}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Employee Card */}
            {selectedEmployee && (
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
                <img
                  src={selectedEmployee.avatarUrl}
                  alt={selectedEmployee.fullName}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {selectedEmployee.fullName}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {selectedEmployee.designation}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] text-slate-400">Current Status</p>
                  <div className="mt-0.5">
                    {activeBreak ? (
                      <StatusBadge type="break" status="Active" size="sm" />
                    ) : todayRecord ? (
                      <StatusBadge type="attendance" status={todayRecord.status} size="sm" />
                    ) : (
                      <StatusBadge type="attendance" status="Absent" size="sm" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Action Type */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
            2. Biometric Transaction Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setSelectedAction('check_in')}
              className={`p-3 rounded-xl border text-left flex flex-col items-center sm:items-start gap-1.5 transition-all ${
                selectedAction === 'check_in'
                  ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-500'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <LogIn className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold">Check-In</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                Clock in for shift
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedAction('check_out')}
              className={`p-3 rounded-xl border text-left flex flex-col items-center sm:items-start gap-1.5 transition-all ${
                selectedAction === 'check_out'
                  ? 'border-indigo-500 bg-indigo-50/70 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-500'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <LogOut className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold">Check-Out</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                End daily work
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedAction('break_start')}
              className={`p-3 rounded-xl border text-left flex flex-col items-center sm:items-start gap-1.5 transition-all ${
                selectedAction === 'break_start'
                  ? 'border-amber-500 bg-amber-50/70 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700 ring-1 ring-amber-500'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Coffee className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-semibold">Start Break</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                Coffee / Lunch
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedAction('break_end')}
              className={`p-3 rounded-xl border text-left flex flex-col items-center sm:items-start gap-1.5 transition-all ${
                selectedAction === 'break_end'
                  ? 'border-sky-500 bg-sky-50/70 text-sky-900 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-700 ring-1 ring-sky-500'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-semibold">End Break</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                Resume working
              </span>
            </button>
          </div>
        </div>

        {/* Step 3: Hardware Terminal & Verification Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              3. Target Biometric Terminal
            </label>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              {devices.map((dev) => (
                <option key={dev.id} value={dev.id}>
                  {dev.name} ({dev.model} - {dev.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              4. Verification Sensor
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('Face ID')}
                className={`py-2 px-2 rounded-lg border text-xs flex items-center justify-center gap-1.5 transition-all ${
                  selectedMethod === 'Face ID'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <ScanFace className="w-3.5 h-3.5" />
                Face ID
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('Fingerprint')}
                className={`py-2 px-2 rounded-lg border text-xs flex items-center justify-center gap-1.5 transition-all ${
                  selectedMethod === 'Fingerprint'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5" />
                Fingerprint
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('RFID')}
                className={`py-2 px-2 rounded-lg border text-xs flex items-center justify-center gap-1.5 transition-all ${
                  selectedMethod === 'RFID'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                RFID
              </button>
            </div>
          </div>
        </div>

        {/* Scan Status Feedback */}
        {scanResult && (
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
              scanResult.success
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
            }`}
          >
            {scanResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <RotateCw className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">
                {scanResult.success ? 'Transaction Verified & Saved' : 'Scan Refused / Disallowed'}
              </p>
              <p className="mt-0.5 opacity-90">{scanResult.message}</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
