import React, { useState, useEffect } from 'react';
import { AttendanceRecord, AttendanceStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/ui/Modal';

interface ManualAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit?: AttendanceRecord | null;
}

export const ManualAttendanceModal: React.FC<ManualAttendanceModalProps> = ({
  isOpen,
  onClose,
  recordToEdit,
}) => {
  const { employees, manualAttendanceAdjustment } = useApp();

  const [employeeId, setEmployeeId] = useState(employees[0]?.id || '');
  const [date, setDate] = useState('2026-08-18');
  const [checkIn, setCheckIn] = useState('09:00');
  const [checkOut, setCheckOut] = useState('18:00');
  const [status, setStatus] = useState<AttendanceStatus>('Present');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (recordToEdit) {
      setEmployeeId(recordToEdit.employeeId);
      setDate(recordToEdit.date);
      setCheckIn(recordToEdit.checkIn ? recordToEdit.checkIn.substring(0, 5) : '');
      setCheckOut(recordToEdit.checkOut ? recordToEdit.checkOut.substring(0, 5) : '');
      setStatus(recordToEdit.status);
      setNotes(recordToEdit.notes || '');
    } else {
      setEmployeeId(employees[0]?.id || '');
      setDate('2026-08-18');
      setCheckIn('09:00');
      setCheckOut('18:00');
      setStatus('Present');
      setNotes('');
    }
  }, [recordToEdit, isOpen, employees]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !date) return;

    const formattedCheckIn = checkIn ? `${checkIn}:00` : null;
    const formattedCheckOut = checkOut ? `${checkOut}:00` : null;

    manualAttendanceAdjustment(
      employeeId,
      date,
      formattedCheckIn,
      formattedCheckOut,
      status,
      notes || 'Manual administrative adjustment'
    );

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={recordToEdit ? 'Adjust Attendance Record' : 'Log Manual Attendance Punch'}
      subtitle="Manual time override for missed biometric scans or approved leave"
      maxWidth="lg"
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
            Save Record
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Employee *
          </label>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            disabled={!!recordToEdit}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName} ({emp.id}) - {emp.departmentName}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Attendance Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Present">Present</option>
              <option value="Working">Working (Clocked In)</option>
              <option value="Late">Late Check-in</option>
              <option value="Early Checkout">Early Checkout</option>
              <option value="Absent">Absent</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Check-In Time
            </label>
            <input
              type="time"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Check-Out Time
            </label>
            <input
              type="time"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Reason / Administrative Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Scanned with RFID card due to optical sensor error; or approved half-day leave."
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </form>
    </Modal>
  );
};
