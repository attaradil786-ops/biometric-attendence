import React, { useState, useEffect } from 'react';
import {
  Fingerprint,
  ScanFace,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  RotateCw,
  Zap,
  ShieldCheck,
  HardDrive,
  Wifi,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  UserCheck,
  Layers,
  Activity,
  Maximize2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Employee, BiometricDevice } from '../../types';

export const BiometricEnrollmentModal: React.FC = () => {
  const {
    isEnrollmentOpen,
    setIsEnrollmentOpen,
    enrollmentEmployeeId,
    setEnrollmentEmployeeId,
    enrollmentDeviceId,
    setEnrollmentDeviceId,
    employees,
    devices,
    enrollBiometricIdentity,
  } = useApp();

  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [enrollmentMode, setEnrollmentMode] = useState<'fingerprint' | 'face' | 'rfidCard' | 'all'>('fingerprint');

  // Interactive Live Scan State
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0); // 0: idle, 1: capturing, 2: processing, 3: completed
  const [scanProgress, setScanProgress] = useState(0);
  const [qualityScore, setQualityScore] = useState(98);
  const [generatedHash, setGeneratedHash] = useState('');
  const [rfidHexCode, setRfidHexCode] = useState('');
  const [accessLevel, setAccessLevel] = useState<'Level 1' | 'Level 2' | 'Level 3'>('Level 2');
  const [copiedHash, setCopiedHash] = useState(false);

  // Sync state with props
  useEffect(() => {
    if (isEnrollmentOpen) {
      if (enrollmentEmployeeId) {
        setSelectedEmpId(enrollmentEmployeeId);
      } else if (employees.length > 0) {
        setSelectedEmpId(employees[0].id);
      }

      if (enrollmentDeviceId) {
        setSelectedDeviceId(enrollmentDeviceId);
      } else if (devices.length > 0) {
        setSelectedDeviceId(devices[0].id);
      }

      setScanStep(0);
      setScanProgress(0);
      setGeneratedHash('');
      setRfidHexCode('');
    }
  }, [isEnrollmentOpen, enrollmentEmployeeId, enrollmentDeviceId, employees, devices]);

  const targetEmployee = employees.find((e) => e.id === selectedEmpId) || employees[0];
  const targetDevice = devices.find((d) => d.id === selectedDeviceId) || devices[0];

  const handleStartCapture = async () => {
    if (!targetEmployee || !targetDevice) return;

    setIsScanning(true);
    setScanStep(1);
    setScanProgress(15);

    // Step 1: Hardware sensor connection
    await new Promise((r) => setTimeout(r, 600));
    setScanProgress(45);
    setScanStep(2);

    // Step 2: Minutiae & 3D vector extraction
    await new Promise((r) => setTimeout(r, 700));
    setScanProgress(80);

    // Step 3: Template verification and cryptographic hashing
    await new Promise((r) => setTimeout(r, 600));
    setScanProgress(100);
    setScanStep(3);
    setIsScanning(false);

    // Generate realistic cryptographic hashes
    const randomHex = Math.random().toString(16).substring(2, 10).toUpperCase() +
      Math.random().toString(16).substring(2, 10).toUpperCase();
    
    if (enrollmentMode === 'fingerprint') {
      setGeneratedHash(`FPT-SHA256-${randomHex}`);
      setQualityScore(Math.floor(95 + Math.random() * 5));
    } else if (enrollmentMode === 'face') {
      setGeneratedHash(`FACE-3D-VEC-${randomHex}`);
      setQualityScore(Math.floor(96 + Math.random() * 4));
    } else if (enrollmentMode === 'rfidCard') {
      const rfidVal = `04A9${randomHex.substring(0, 8)}`;
      setRfidHexCode(rfidVal);
      setGeneratedHash(`RFID-NFC-${rfidVal}`);
      setQualityScore(100);
    } else {
      setGeneratedHash(`MULTI-MODAL-${randomHex}`);
      setRfidHexCode(`04A9${randomHex.substring(0, 8)}`);
      setQualityScore(99);
    }
  };

  const handleCommitEnrollment = () => {
    if (!targetEmployee) return;

    enrollBiometricIdentity({
      employeeId: targetEmployee.id,
      method: enrollmentMode,
      deviceId: targetDevice?.id || 'DEV-01',
      qualityScore: qualityScore,
      templateHash: generatedHash,
      badgeCode: rfidHexCode || undefined,
    });

    handleClose();
  };

  const handleClose = () => {
    setIsEnrollmentOpen(false);
    setEnrollmentEmployeeId(null);
    setEnrollmentDeviceId(null);
    setScanStep(0);
    setScanProgress(0);
    setGeneratedHash('');
  };

  const handleCopyHash = () => {
    if (!generatedHash) return;
    navigator.clipboard.writeText(generatedHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <Modal
      isOpen={isEnrollmentOpen}
      onClose={handleClose}
      title="Biometric Hardware Enrolment Terminal"
      subtitle="Capture new physical biometric identities, generate encrypted feature vectors, and sync across hardware nodes"
      maxWidth="3xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Node: {targetDevice?.name || 'Gateway DEV-01'} (Online)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>

            {scanStep === 3 ? (
              <button
                type="button"
                onClick={handleCommitEnrollment}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Commit & Sync to Hardware
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartCapture}
                disabled={isScanning}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isScanning ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    Scanning Sensor Stream...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Initiate Hardware Capture
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Top Control Bar: Employee & Terminal Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              1. Target Employee Profile
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => {
                setSelectedEmpId(e.target.value);
                setScanStep(0);
                setGeneratedHash('');
              }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.id}) - {emp.departmentName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              2. Physical Hardware Terminal
            </label>
            <select
              value={selectedDeviceId}
              onChange={(e) => {
                setSelectedDeviceId(e.target.value);
                setScanStep(0);
                setGeneratedHash('');
              }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              {devices.map((dev) => (
                <option key={dev.id} value={dev.id}>
                  {dev.name} ({dev.ipAddress}) - {dev.status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Employee Summary Card */}
        {targetEmployee && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl">
            <div className="flex items-center gap-3">
              <img
                src={targetEmployee.avatarUrl}
                alt={targetEmployee.fullName}
                className="w-12 h-12 rounded-xl object-cover border border-indigo-200 dark:border-indigo-800"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {targetEmployee.fullName}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {targetEmployee.designation} • {targetEmployee.departmentName}
                </p>
                <p className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                  ID: {targetEmployee.id} • Biometric UID: {targetEmployee.biometricId}
                </p>
              </div>
            </div>

            {/* Existing Enrolled Credentials Status */}
            <div className="flex items-center gap-2 text-xs">
              <div
                className={`px-2 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 ${
                  targetEmployee.enrolledBiometrics.fingerprint
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>Fingerprint {targetEmployee.enrolledBiometrics.fingerprint ? '✓' : 'Pending'}</span>
              </div>

              <div
                className={`px-2 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 ${
                  targetEmployee.enrolledBiometrics.face
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <ScanFace className="w-3.5 h-3.5" />
                <span>Face ID {targetEmployee.enrolledBiometrics.face ? '✓' : 'Pending'}</span>
              </div>

              <div
                className={`px-2 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 ${
                  targetEmployee.enrolledBiometrics.rfidCard
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>RFID {targetEmployee.enrolledBiometrics.rfidCard ? '✓' : 'Pending'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Modality Selection Tabs */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            3. Choose Biometric Identity Modality to Capture
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setEnrollmentMode('fingerprint');
                setScanStep(0);
                setGeneratedHash('');
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                enrollmentMode === 'fingerprint'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200'
              }`}
            >
              <Fingerprint className="w-5 h-5 mb-2" />
              <p className="text-xs font-bold">Fingerprint Scanner</p>
              <p
                className={`text-[10px] mt-0.5 ${
                  enrollmentMode === 'fingerprint' ? 'text-indigo-100' : 'text-slate-400'
                }`}
              >
                Capacitive Ridge & Minutiae
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setEnrollmentMode('face');
                setScanStep(0);
                setGeneratedHash('');
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                enrollmentMode === 'face'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200'
              }`}
            >
              <ScanFace className="w-5 h-5 mb-2" />
              <p className="text-xs font-bold">3D Face Mesh</p>
              <p
                className={`text-[10px] mt-0.5 ${
                  enrollmentMode === 'face' ? 'text-indigo-100' : 'text-slate-400'
                }`}
              >
                AI 128-pt Landmark Vector
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setEnrollmentMode('rfidCard');
                setScanStep(0);
                setGeneratedHash('');
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                enrollmentMode === 'rfidCard'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200'
              }`}
            >
              <CreditCard className="w-5 h-5 mb-2" />
              <p className="text-xs font-bold">RFID Smart Card</p>
              <p
                className={`text-[10px] mt-0.5 ${
                  enrollmentMode === 'rfidCard' ? 'text-indigo-100' : 'text-slate-400'
                }`}
              >
                13.56 MHz NFC / UID Tag
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setEnrollmentMode('all');
                setScanStep(0);
                setGeneratedHash('');
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                enrollmentMode === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200'
              }`}
            >
              <Layers className="w-5 h-5 mb-2" />
              <p className="text-xs font-bold">Multi-Modal Suite</p>
              <p
                className={`text-[10px] mt-0.5 ${
                  enrollmentMode === 'all' ? 'text-indigo-100' : 'text-slate-400'
                }`}
              >
                Face + Fingerprint + RFID
              </p>
            </button>
          </div>
        </div>

        {/* Live Interactive Hardware Sensor Capture Viewport */}
        <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-6 text-white overflow-hidden shadow-inner min-h-[220px] flex flex-col items-center justify-center">
          {/* Grid Background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
              backgroundSize: '16px 16px',
            }}
          />

          {/* Mode 1: Fingerprint Sensor */}
          {enrollmentMode === 'fingerprint' && (
            <div className="relative z-10 flex flex-col items-center text-center space-y-3">
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-indigo-950/80 border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/20">
                {isScanning && (
                  <>
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-ping opacity-30" />
                    <div className="absolute inset-0 rounded-full border-t-2 border-emerald-400 animate-spin" />
                  </>
                )}
                <Fingerprint
                  className={`w-12 h-12 transition-all ${
                    scanStep === 3
                      ? 'text-emerald-400 scale-110'
                      : isScanning
                      ? 'text-indigo-300 animate-pulse'
                      : 'text-indigo-400'
                  }`}
                />
              </div>

              <div>
                <p className="text-sm font-bold text-white">
                  {scanStep === 3
                    ? '✓ Fingerprint Minutiae Successfully Acquired'
                    : isScanning
                    ? 'Reading Optical Ridges & Minutiae Points...'
                    : 'Optical Capacitive Sensor Ready'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {scanStep === 3
                    ? `Quality Score: ${qualityScore}% • 34 Minutiae Points Extracted`
                    : 'Place employee finger firmly on the terminal sensor glass'}
                </p>
              </div>
            </div>
          )}

          {/* Mode 2: 3D Face ID */}
          {enrollmentMode === 'face' && (
            <div className="relative z-10 flex flex-col items-center text-center space-y-3">
              <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-indigo-950/80 border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/20">
                {isScanning && (
                  <div className="absolute inset-2 border border-dashed border-emerald-400 rounded-xl animate-pulse" />
                )}
                <ScanFace
                  className={`w-12 h-12 transition-all ${
                    scanStep === 3
                      ? 'text-emerald-400 scale-110'
                      : isScanning
                      ? 'text-indigo-300 animate-pulse'
                      : 'text-indigo-400'
                  }`}
                />
              </div>

              <div>
                <p className="text-sm font-bold text-white">
                  {scanStep === 3
                    ? '✓ 3D Facial Mesh Biometric Vector Extracted'
                    : isScanning
                    ? 'Aligning 128 Face Landmarks & Liveness Detection...'
                    : 'HD Biometric Camera Active'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {scanStep === 3
                    ? `Confidence: ${qualityScore}% • Anti-Spoof Confirmed • Vector Normalization OK`
                    : 'Position subject directly facing the terminal camera sensor'}
                </p>
              </div>
            </div>
          )}

          {/* Mode 3: RFID Card */}
          {enrollmentMode === 'rfidCard' && (
            <div className="relative z-10 flex flex-col items-center text-center space-y-3">
              <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-indigo-950/80 border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/20">
                {isScanning && (
                  <div className="absolute -inset-2 rounded-2xl border-2 border-emerald-400/60 animate-ping" />
                )}
                <CreditCard
                  className={`w-12 h-12 transition-all ${
                    scanStep === 3
                      ? 'text-emerald-400 scale-110'
                      : isScanning
                      ? 'text-indigo-300 animate-pulse'
                      : 'text-indigo-400'
                  }`}
                />
              </div>

              <div>
                <p className="text-sm font-bold text-white">
                  {scanStep === 3
                    ? '✓ Smart Card Proximity Tag Registered'
                    : isScanning
                    ? 'Detecting 13.56 MHz RFID Transponder Frequency...'
                    : 'RFID / NFC Card Reader Listening'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {scanStep === 3
                    ? `UID: ${rfidHexCode} • Access Clearance: ${accessLevel}`
                    : 'Tap physical badge or keyfob against the gateway reader'}
                </p>
              </div>
            </div>
          )}

          {/* Mode 4: Multi-Modal Suite */}
          {enrollmentMode === 'all' && (
            <div className="relative z-10 flex flex-col items-center text-center space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-300">
                  <ScanFace className="w-6 h-6" />
                </div>
                <div className="p-3 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-300">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <div className="p-3 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-300">
                  <CreditCard className="w-6 h-6" />
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-white">
                  {scanStep === 3
                    ? '✓ Multi-Modal Triple Biometric Identity Acquired'
                    : isScanning
                    ? 'Orchestrating Triple Hardware Sensors...'
                    : 'Multi-Modal Gateway Ready'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {scanStep === 3
                    ? `Face Mesh + Fingerprint Ridge + RFID Tag Synced (${qualityScore}% Match)`
                    : 'Simultaneous Face, Fingerprint and Badge registration sequence'}
                </p>
              </div>
            </div>
          )}

          {/* Progress Bar during scan */}
          {isScanning && (
            <div className="w-full max-w-xs mt-4">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 text-center mt-1 font-mono">
                Acquiring Hardware Stream {scanProgress}%
              </p>
            </div>
          )}
        </div>

        {/* Step 3: Success Certificate & Cryptographic Details */}
        {scanStep === 3 && generatedHash && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h5 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Biometric Identity Hardware Encryption Certificate
                </h5>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                {qualityScore}% Quality Confirmed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 bg-white dark:bg-slate-900/90 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Cryptographic Biometric Template Hash
                </span>
                <div className="flex items-center justify-between font-mono text-xs text-slate-900 dark:text-white">
                  <span className="truncate">{generatedHash}</span>
                  <button
                    type="button"
                    onClick={handleCopyHash}
                    className="p-1 text-slate-400 hover:text-indigo-600 ml-2 shrink-0 cursor-pointer"
                    title="Copy Template Hash"
                  >
                    {copiedHash ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-2.5 bg-white dark:bg-slate-900/90 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Target Gateway Hardware Synchronization
                </span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  {targetDevice?.name} ({targetDevice?.ipAddress}) • 4 Nodes Replicating
                </p>
              </div>
            </div>

            <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
              Click <strong>"Commit & Sync to Hardware"</strong> to write this template into the employee profile and propagate to all biometric network gateways.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
