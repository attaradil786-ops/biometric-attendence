import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Search,
  Check,
  X,
  Edit2,
  Trash2,
  Shield,
  Key,
  Lock,
} from 'lucide-react';
import { AdminUser, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { UserFormModal } from './UserFormModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { formatTimeString } from '../../utils/formatters';

interface PermissionRow {
  module: string;
  superAdmin: boolean;
  admin: boolean;
  hrManager: boolean;
  attendanceManager: boolean;
  viewer: boolean;
}

const permissionMatrix: PermissionRow[] = [
  { module: 'Manage Employees & Profiles', superAdmin: true, admin: true, hrManager: true, attendanceManager: false, viewer: false },
  { module: 'View Live Attendance & Punch Feed', superAdmin: true, admin: true, hrManager: true, attendanceManager: true, viewer: true },
  { module: 'Manual Attendance Adjustments / Overrides', superAdmin: true, admin: true, hrManager: true, attendanceManager: true, viewer: false },
  { module: 'Break Tracking & Overbreak Monitoring', superAdmin: true, admin: true, hrManager: true, attendanceManager: true, viewer: true },
  { module: 'Configure Biometric Terminals & Gateways', superAdmin: true, admin: true, hrManager: false, attendanceManager: false, viewer: false },
  { module: 'Office Shifts, Rules & Grace Periods', superAdmin: true, admin: true, hrManager: false, attendanceManager: true, viewer: false },
  { module: 'Generate & Export Payroll Attendance Reports', superAdmin: true, admin: true, hrManager: true, attendanceManager: true, viewer: true },
  { module: 'Manage Admin Accounts & Access Control', superAdmin: true, admin: false, hrManager: false, attendanceManager: false, viewer: false },
];

export const UsersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { adminUsers, deleteAdminUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<AdminUser | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  const filteredUsers = adminUsers.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Admin Users & Access Control (RBAC)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage administrator accounts, authentication credentials, and permission matrices
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setUserToEdit(null);
            setIsFormOpen(true);
          }}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Add Administrator
        </button>
      </div>

      {/* Admin Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search admin users..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <span className="text-xs text-slate-400">
            {filteredUsers.length} Active System Admins
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Login</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {u.name} {currentUser?.id === u.id && <span className="text-[10px] text-indigo-600 font-bold">(You)</span>}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      <Shield className="w-3 h-3" />
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      u.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {u.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    {u.lastLogin || 'Never'}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserToEdit(u);
                          setIsFormOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {currentUser?.id !== u.id && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserToDelete(u);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role-Based Permissions Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Role Permission Matrix
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Granular Operational Privileges
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Permission Capability</th>
                <th className="py-3 px-4 font-semibold text-center">Super Admin</th>
                <th className="py-3 px-4 font-semibold text-center">Admin</th>
                <th className="py-3 px-4 font-semibold text-center">HR Manager</th>
                <th className="py-3 px-4 font-semibold text-center">Attendance Manager</th>
                <th className="py-3 px-4 font-semibold text-center">Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {permissionMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                    {row.module}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.superAdmin ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.admin ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.hrManager ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.attendanceManager ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.viewer ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setUserToEdit(null);
        }}
        userToEdit={userToEdit}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={() => {
          if (userToDelete) {
            deleteAdminUser(userToDelete.id);
          }
        }}
        title="Revoke Admin Access"
        message={`Are you sure you want to revoke system privileges for ${userToDelete?.name}?`}
        confirmText="Revoke Access"
        isDestructive
      />
    </div>
  );
};
