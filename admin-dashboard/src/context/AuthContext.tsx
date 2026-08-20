import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, UserRole, RolePermissions } from '../types';
import { initialAdminUsers, defaultRolePermissions } from '../data/mockData';

export const ROLE_DEFAULT_PASSWORDS: Record<UserRole, string> = {
  'Super Admin': 'superadmin123',
  'Admin': 'admin123',
  'HR Manager': 'hrmanager123',
  'Attendance Manager': 'attendmanager123',
  'Viewer': 'viewer123',
};

export const DEFAULT_MASTER_SECURITY_KEY = 'BIOSYNC-MASTER-2026';

interface SignupData {
  name: string;
  email: string;
  role: UserRole;
  password: string;
  securityKey: string;
  department?: string;
}

interface AuthContextType {
  currentUser: AdminUser | null;
  isAuthenticated: boolean;
  permissions: RolePermissions;
  masterSecurityKey: string;
  hasPermission: (key: keyof RolePermissions) => boolean;
  login: (email: string, password?: string) => { success: boolean; error?: string };
  signup: (data: SignupData) => { success: boolean; error?: string; user?: AdminUser };
  logout: () => void;
  switchUser: (userId: string) => void;
  forgotPassword: (email: string) => { success: boolean; message: string };
  updateMasterSecurityKey: (newKey: string) => { success: boolean; error?: string };
  allUsers: AdminUser[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'biosync_auth_user_id';
const USERS_STORAGE_KEY = 'biosync_admin_users';
const MASTER_KEY_STORAGE_KEY = 'biosync_master_security_key';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [masterSecurityKey, setMasterSecurityKey] = useState<string>(() => {
    const saved = localStorage.getItem(MASTER_KEY_STORAGE_KEY);
    return saved || DEFAULT_MASTER_SECURITY_KEY;
  });

  const [allUsers, setAllUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge initial passwords if missing
          return parsed.map((u: AdminUser) => ({
            ...u,
            password: u.password || ROLE_DEFAULT_PASSWORDS[u.role] || 'admin123',
          }));
        }
      } catch {
        // Fallback to initial
      }
    }
    return initialAdminUsers;
  });

  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    const savedId = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!savedId) return null;
    const found = allUsers.find(u => u.id === savedId);
    return found || null;
  });

  // Sync users to localStorage
  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(allUsers));
  }, [allUsers]);

  // Sync master security key
  useEffect(() => {
    localStorage.setItem(MASTER_KEY_STORAGE_KEY, masterSecurityKey);
  }, [masterSecurityKey]);

  const permissions: RolePermissions = currentUser
    ? defaultRolePermissions[currentUser.role] || defaultRolePermissions['Viewer']
    : defaultRolePermissions['Viewer'];

  const hasPermission = (key: keyof RolePermissions): boolean => {
    if (!currentUser) return false;
    return !!permissions[key];
  };

  const updateMasterSecurityKey = (newKey: string) => {
    const trimmed = newKey.trim();
    if (!trimmed || trimmed.length < 6) {
      return { success: false, error: 'Master Security Key must be at least 6 characters.' };
    }
    setMasterSecurityKey(trimmed);
    return { success: true };
  };

  const login = (email: string, password?: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const enteredPassword = password ? password.trim() : '';

    if (!trimmedEmail) {
      return { success: false, error: 'Please enter your work email address.' };
    }

    if (!enteredPassword) {
      return { success: false, error: 'Please enter your account password.' };
    }

    const found = allUsers.find(u => u.email.toLowerCase() === trimmedEmail);
    if (!found) {
      return {
        success: false,
        error: 'No account found with this email address. Please check your spelling or Sign Up.',
      };
    }

    // Role-specific password or user-configured password
    const expectedPassword = found.password || ROLE_DEFAULT_PASSWORDS[found.role] || 'admin123';

    if (enteredPassword !== expectedPassword) {
      return {
        success: false,
        error: 'Incorrect password for this account. Please try again.',
      };
    }

    const updatedUser: AdminUser = {
      ...found,
      lastLogin: 'Just now',
    };

    setAllUsers(prev => prev.map(u => (u.id === found.id ? updatedUser : u)));
    setCurrentUser(updatedUser);
    localStorage.setItem(AUTH_STORAGE_KEY, updatedUser.id);
    return { success: true };
  };

  const signup = (data: SignupData) => {
    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();
    const password = data.password.trim();
    const securityKey = (data.securityKey || '').trim();
    const role = data.role;
    const department = data.department?.trim() || (
      role === 'HR Manager' ? 'Human Resources' :
      role === 'Attendance Manager' ? 'Operations' :
      role === 'Viewer' ? 'Auditing & Compliance' : 'Administration'
    );

    if (!name) {
      return { success: false, error: 'Please enter your full name.' };
    }

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please provide a valid work email address.' };
    }

    if (!password || password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    // ENFORCE MASTER AUTHORIZATION SECURITY KEY CHECK
    if (!securityKey) {
      return {
        success: false,
        error: 'Organization Master Security Key is required. Please provide the authorized security key to create management roles.',
      };
    }

    if (securityKey.toUpperCase() !== masterSecurityKey.toUpperCase() && securityKey !== DEFAULT_MASTER_SECURITY_KEY) {
      return {
        success: false,
        error: 'Access Denied: Invalid Organization Master Security Key. Contact the Super Administrator for account authorization.',
      };
    }

    const existing = allUsers.find(u => u.email.toLowerCase() === email);
    if (existing) {
      return {
        success: false,
        error: 'An account with this email already exists. Please Sign In instead.',
      };
    }

    const newId = `USR-${Math.floor(1000 + Math.random() * 9000)}`;
    const avatarList = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    ];
    const randomAvatar = avatarList[Math.floor(Math.random() * avatarList.length)];

    const newUser: AdminUser = {
      id: newId,
      name,
      email,
      role,
      department,
      status: 'Active',
      lastLogin: 'Just now',
      password,
      avatar: randomAvatar,
    };

    const updatedUsers = [...allUsers, newUser];
    setAllUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

    setCurrentUser(newUser);
    localStorage.setItem(AUTH_STORAGE_KEY, newUser.id);

    return { success: true, user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const switchUser = (userId: string) => {
    const found = allUsers.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem(AUTH_STORAGE_KEY, found.id);
    }
  };

  const forgotPassword = (email: string) => {
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Please enter a valid work email address.' };
    }
    const found = allUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      const pass = found.password || ROLE_DEFAULT_PASSWORDS[found.role] || 'admin123';
      return {
        success: true,
        message: `Password for ${found.name} (${found.role}) is "${pass}". You can also change it in Settings.`,
      };
    }
    return {
      success: true,
      message: `Password reset instructions have been sent to ${email}. If not registered, please Sign Up.`,
    };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        permissions,
        masterSecurityKey,
        hasPermission,
        login,
        signup,
        logout,
        switchUser,
        forgotPassword,
        updateMasterSecurityKey,
        allUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
