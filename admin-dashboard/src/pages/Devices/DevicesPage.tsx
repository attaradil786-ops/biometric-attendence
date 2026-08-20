import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  RotateCw,
  Search,
  Wifi,
  WifiOff,
  Server,
  HardDrive,
  Eye,
  Edit2,
  Trash2,
  Power,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ScanFace,
} from 'lucide-react';
import { BiometricDevice } from '../../types';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DeviceFormModal } from './DeviceFormModal';
import { DeviceDetailModal } from './DeviceDetailModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { formatTimeString } from '../../utils/formatters';

export const DevicesPage: React.FC = () => {
  const {
    devices,
    syncDevice,
    syncAllDevices,
    restartDevice,
    deleteDevice,
    openBiometricEnrollment,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deviceToEdit, setDeviceToEdit] = useState<BiometricDevice | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDeviceForDetail, setSelectedDeviceForDetail] = useState<BiometricDevice | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<BiometricDevice | null>(null);

  const onlineCount = devices.filter((d) => d.status === 'Online').length;
  const offlineCount = devices.filter((d) => d.status === 'Offline').length;

  const filteredDevices = devices.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.ipAddress.toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q) ||
      d.model.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    await syncAllDevices();
    setIsSyncingAll(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Biometric Devices & Hardware Gateways
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor physical time attendance terminals, biometric template caches, and network connectivity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openBiometricEnrollment(undefined, devices[0]?.id)}
            className="px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 rounded-xl hover:bg-emerald-100 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <ScanFace className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Hardware Enrollment Terminal
          </button>
          <button
            type="button"
            onClick={handleSyncAll}
            disabled={isSyncingAll}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
            {isSyncingAll ? 'Synchronizing All...' : 'Sync All Gateways'}
          </button>
          <button
            type="button"
            onClick={() => {
              setDeviceToEdit(null);
              setIsFormOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Biometric Terminal
          </button>
        </div>
      </div>

      {/* Network Status Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">
              Total Terminals
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {devices.length} Nodes
            </p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">
              Online & Ready
            </p>
            <p className="text-xl font-bold text-emerald-600">
              {onlineCount} Gateways
            </p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
            <WifiOff className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">
              Offline Nodes
            </p>
            <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
              {offlineCount} Terminals
            </p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">
              Synced Templates
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              18 Profiles
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search terminal name, IP, location..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="all">All Gateways</option>
            <option value="Online">Online Only</option>
            <option value="Offline">Offline Only</option>
          </select>
        </div>
      </div>

      {/* Device Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredDevices.map((dev) => {
          return (
            <div
              key={dev.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      dev.status === 'Online'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                    }`}>
                      {dev.status === 'Online' ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {dev.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {dev.location}
                      </p>
                    </div>
                  </div>

                  <StatusBadge type="device" status={dev.status} />
                </div>

                {/* Device Specifications Grid */}
                <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs my-3">
                  <div>
                    <span className="text-slate-400 text-[11px]">IP & Port:</span>
                    <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {dev.ipAddress}:{dev.port}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Hardware Model:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                      {dev.model}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Enrolled Templates:</span>
                    <p className="font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {dev.registeredUsersCount || dev.registeredTemplates || 18} templates
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Last Sync:</span>
                    <p className="font-mono text-slate-600 dark:text-slate-300 mt-0.5">
                      {dev.lastSyncTime || dev.lastSync || 'Just now'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => openBiometricEnrollment(undefined, dev.id)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Enroll an employee on this specific terminal"
                  >
                    <ScanFace className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Enroll
                  </button>

                  <button
                    type="button"
                    onClick={() => syncDevice(dev.id)}
                    disabled={dev.status === 'Syncing'}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${dev.status === 'Syncing' ? 'animate-spin' : ''}`} />
                    Sync
                  </button>

                  <button
                    type="button"
                    onClick={() => restartDevice(dev.id)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Soft restart device gateway"
                  >
                    <Power className="w-3.5 h-3.5" />
                    Restart
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDeviceForDetail(dev);
                      setIsDetailOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="View Diagnostics"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeviceToEdit(dev);
                      setIsFormOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Edit Configuration"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeviceToDelete(dev);
                      setIsDeleteOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Remove Terminal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Modal */}
      <DeviceFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setDeviceToEdit(null);
        }}
        deviceToEdit={deviceToEdit}
      />

      {/* Detail Modal */}
      <DeviceDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedDeviceForDetail(null);
        }}
        device={selectedDeviceForDetail}
        onSync={(id) => syncDevice(id)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeviceToDelete(null);
        }}
        onConfirm={() => {
          if (deviceToDelete) {
            deleteDevice(deviceToDelete.id);
          }
        }}
        title="Remove Terminal Gateway"
        message={`Are you sure you want to remove ${deviceToDelete?.name} (${deviceToDelete?.ipAddress})? Live attendance sync from this physical terminal will be suspended.`}
        confirmText="Remove Terminal"
        isDestructive
      />
    </div>
  );
};
