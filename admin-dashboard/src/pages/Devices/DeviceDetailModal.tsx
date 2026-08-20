import React from 'react';
import {
  Cpu,
  Activity,
  HardDrive,
  Wifi,
  RotateCw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
} from 'lucide-react';
import { BiometricDevice } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatDateString } from '../../utils/formatters';

interface DeviceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: BiometricDevice | null;
  onSync: (deviceId: string) => void;
}

export const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({
  isOpen,
  onClose,
  device,
  onSync,
}) => {
  if (!device) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={device.name}
      subtitle={`${device.model} • ${device.ipAddress}:${device.port}`}
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-slate-400">
            Last Ping: {device.lastPing || '3 seconds ago'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onSync(device.id);
              }}
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Force Gateway Sync
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Hardware Status Strip */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {device.name}
              </p>
              <p className="text-[11px] text-slate-500">
                Serial: {device.serialNumber} • Location: {device.location}
              </p>
            </div>
          </div>

          <StatusBadge type="device" status={device.status} />
        </div>

        {/* Hardware Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Firmware:</span>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {device.firmwareVersion || 'v4.2.1-PRO'}
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Templates Cached:</span>
            <p className="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
              {device.registeredTemplates} Enrolled
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Network Latency:</span>
            <p className="font-bold text-emerald-600 mt-0.5">
              {device.status === 'Online' ? '12 ms (Stable)' : 'Unreachable'}
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Communication:</span>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              TCP/IP Port {device.port}
            </p>
          </div>
        </div>

        {/* Recent Device Sync History */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Telemetry & Biometric Transaction Logs
          </h4>
          <div className="bg-slate-900 text-slate-300 font-mono text-[11px] p-3.5 rounded-xl space-y-1.5 overflow-y-auto max-h-40">
            <p className="text-emerald-400">
              [2026-08-18 10:14:02] TCP Handshake verified on {device.ipAddress}:{device.port}
            </p>
            <p className="text-slate-400">
              [2026-08-18 10:14:03] Polling local transaction cache... 0 pending punches
            </p>
            <p className="text-slate-400">
              [2026-08-18 10:14:04] Template hash matching algorithm v2 (18 users synchronized)
            </p>
            <p className="text-sky-400">
              [2026-08-18 10:14:05] Hardware status heartbeat OK. Sensor optics clean.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
