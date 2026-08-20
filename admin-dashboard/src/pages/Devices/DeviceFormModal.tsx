import React, { useState, useEffect } from 'react';
import { BiometricDevice, DeviceStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/ui/Modal';

interface DeviceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceToEdit?: BiometricDevice | null;
}

export const DeviceFormModal: React.FC<DeviceFormModalProps> = ({
  isOpen,
  onClose,
  deviceToEdit,
}) => {
  const { addDevice, updateDevice } = useApp();

  const [name, setName] = useState('');
  const [model, setModel] = useState('ZKTeco ProFace X');
  const [ipAddress, setIpAddress] = useState('192.168.1.150');
  const [port, setPort] = useState(4370);
  const [location, setLocation] = useState('Main Reception');
  const [serialNumber, setSerialNumber] = useState('');
  const [status, setStatus] = useState<DeviceStatus>('Online');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (deviceToEdit) {
      setName(deviceToEdit.name);
      setModel(deviceToEdit.model);
      setIpAddress(deviceToEdit.ipAddress);
      setPort(deviceToEdit.port);
      setLocation(deviceToEdit.location);
      setSerialNumber(deviceToEdit.serialNumber);
      setStatus(deviceToEdit.status);
    } else {
      setName('');
      setModel('ZKTeco ProFace X');
      setIpAddress('192.168.1.150');
      setPort(4370);
      setLocation('Main Reception');
      setSerialNumber(`ZK-${Math.floor(100000 + Math.random() * 900000)}`);
      setStatus('Online');
    }
    setErrors({});
  }, [deviceToEdit, isOpen]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Device name is required';
    if (!ipAddress.trim()) errs.ipAddress = 'IP address is required';
    if (!port) errs.port = 'Communication port is required';
    if (!location.trim()) errs.location = 'Physical installation location is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (deviceToEdit) {
      updateDevice(deviceToEdit.id, {
        name,
        model,
        ipAddress,
        port,
        location,
        serialNumber,
        status,
      });
    } else {
      addDevice({
        name,
        model,
        ipAddress,
        port,
        location,
        serialNumber,
        status,
        type: 'Hybrid (Face + Fingerprint)',
        registeredUsersCount: 18,
        maxCapacity: 1000,
        firmwareVersion: 'v4.2.1-PRO',
        lastSyncTime: 'Just now',
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={deviceToEdit ? 'Edit Gateway Configuration' : 'Register Biometric Terminal'}
      subtitle="Configure network parameters and hardware connection credentials"
      maxWidth="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
          >
            {deviceToEdit ? 'Save Terminal' : 'Add Terminal'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Device Display Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. West Entrance Speed Gate"
            className={`w-full bg-white dark:bg-slate-800 border rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 ${
              errors.name ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
            }`}
          />
          {errors.name && <p className="text-[10px] text-rose-500 mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Hardware Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="ZKTeco ProFace X">ZKTeco ProFace X</option>
              <option value="BioSmart SpeedFace V5">BioSmart SpeedFace V5</option>
              <option value="Anviz FacePass 7">Anviz FacePass 7</option>
              <option value="Suprema BioStation 3">Suprema BioStation 3</option>
              <option value="Hikvision DS-K1T671">Hikvision DS-K1T671</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Hardware Serial Number
            </label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="ZK-88231"
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              IP Address *
            </label>
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="192.168.1.100"
              className={`w-full bg-white dark:bg-slate-800 border rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 ${
                errors.ipAddress ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {errors.ipAddress && <p className="text-[10px] text-rose-500 mt-1">{errors.ipAddress}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Port Number *
            </label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(parseInt(e.target.value) || 4370)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Physical Location *
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ground Floor - Main Lobby Entrance"
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Initial Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as DeviceStatus)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
          >
            <option value="Online">Online / Ready</option>
            <option value="Offline">Offline</option>
            <option value="Syncing">Syncing</option>
          </select>
        </div>
      </form>
    </Modal>
  );
};
