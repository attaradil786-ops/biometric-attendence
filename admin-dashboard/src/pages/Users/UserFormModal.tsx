import React, { useState, useEffect } from 'react';
import { AdminUser, UserRole } from '../../types';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/ui/Modal';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: AdminUser | null;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  userToEdit,
}) => {
  const { addAdminUser, updateAdminUser } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Admin');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setEmail(userToEdit.email);
      setPassword(userToEdit.password || '');
      setRole(userToEdit.role);
      setStatus(userToEdit.status);
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('Admin');
      setStatus('Active');
    }
    setErrors({});
  }, [userToEdit, isOpen]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid work email is required';
    if (!userToEdit && password && password.length < 4) errs.password = 'Password must be at least 4 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (userToEdit) {
      updateAdminUser(userToEdit.id, {
        name,
        email,
        role,
        status,
        ...(password ? { password } : {}),
      });
    } else {
      addAdminUser({
        name,
        email,
        role,
        status,
        password: password || 'admin123',
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?w=100&auto=format&fit=crop&q=80`,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={userToEdit ? 'Edit Admin User' : 'Invite New Admin User'}
      subtitle="Grant system access and role-based operational permissions"
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
            {userToEdit ? 'Save Changes' : 'Send Invite'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. David Ross"
            className={`w-full bg-white dark:bg-slate-800 border rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 ${
              errors.name ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
            }`}
          />
          {errors.name && <p className="text-[10px] text-rose-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Work Email Address *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="david.ross@biosync.io"
            className={`w-full bg-white dark:bg-slate-800 border rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 ${
              errors.email ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
            }`}
          />
          {errors.email && <p className="text-[10px] text-rose-500 mt-1">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Admin Role *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="Super Admin">Super Admin (Root Access)</option>
              <option value="Admin">Admin (Full Operational)</option>
              <option value="HR Manager">HR Manager (Staff & Reports)</option>
              <option value="Attendance Manager">Attendance Manager (Time & Shifts)</option>
              <option value="Viewer">Viewer (Read Only)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Account Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Suspended</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {userToEdit ? 'New Password (leave blank to keep existing)' : 'Account Password'}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={userToEdit ? '••••••••' : 'Set account password (min 4 chars)'}
            className={`w-full bg-white dark:bg-slate-800 border rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 ${
              errors.password ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
            }`}
          />
          {errors.password && <p className="text-[10px] text-rose-500 mt-1">{errors.password}</p>}
        </div>
      </form>
    </Modal>
  );
};
