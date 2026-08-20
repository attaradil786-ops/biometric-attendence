import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Fingerprint,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  User,
  Building2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  UserPlus,
  LogIn,
  Info,
  Check,
} from 'lucide-react';
import { useAuth, ROLE_DEFAULT_PASSWORDS } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, signup, forgotPassword, allUsers } = useAuth();
  const navigate = useNavigate();

  // Mode: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpRole, setSignUpRole] = useState<UserRole>('Admin');
  const [signUpDepartment, setSignUpDepartment] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpSecurityKey, setSignUpSecurityKey] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);
  const [showSignUpSecurityKey, setShowSignUpSecurityKey] = useState(false);

  // Feedback State
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<{ success: boolean; message: string } | null>(null);

  const [isDemoPasswordsModalOpen, setIsDemoPasswordsModalOpen] = useState(false);

  const rolesList: { role: UserRole; title: string; description: string; badgeColor: string }[] = [
    {
      role: 'Super Admin',
      title: 'Super Admin',
      description: 'Unrestricted control over system configuration, roles, devices, and settings',
      badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-800/80',
    },
    {
      role: 'Admin',
      title: 'System Admin',
      description: 'Full operational access to staff directory, device terminals, and attendance records',
      badgeColor: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/80',
    },
    {
      role: 'HR Manager',
      title: 'HR Manager',
      description: 'Manage employee enrollments, timesheets, shift leaves, and payroll reports',
      badgeColor: 'bg-sky-950/80 text-sky-300 border-sky-800/80',
    },
    {
      role: 'Attendance Manager',
      title: 'Attendance Manager',
      description: 'Supervise daily biometric punches, shift schedules, overtime, and break logs',
      badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
    },
    {
      role: 'Viewer',
      title: 'Audit Viewer',
      description: 'Read-only access for compliance auditing, live attendance monitoring, and logs',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
    },
  ];

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!signInEmail.trim()) {
      setError('Please enter your work email address.');
      return;
    }

    if (!signInPassword) {
      setError('Please enter your password.');
      return;
    }

    const result = login(signInEmail, signInPassword);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!signUpName.trim()) {
      setError('Please provide your full name.');
      return;
    }

    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      setError('Please provide a valid work email address.');
      return;
    }

    if (!signUpPassword) {
      setError('Please create a password for your account.');
      return;
    }

    if (signUpPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    if (!signUpSecurityKey.trim()) {
      setError('Organization Master Security Key is required to register management roles. Please enter the authorized key.');
      return;
    }

    const result = signup({
      name: signUpName,
      email: signUpEmail,
      role: signUpRole,
      department: signUpDepartment || undefined,
      password: signUpPassword,
      securityKey: signUpSecurityKey,
    });

    if (result.success) {
      setSuccessMessage(`Account authorized and registered as ${signUpRole}! Logging into dashboard...`);
      setTimeout(() => {
        navigate('/');
      }, 600);
    } else {
      setError(result.error || 'Failed to create account. Please verify authorization key.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = forgotPassword(forgotEmail);
    setForgotStatus(res);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 antialiased selection:bg-indigo-500 selection:text-white relative">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg z-10 my-8">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-white shadow-xl shadow-indigo-500/25 mb-3 ring-4 ring-indigo-500/10">
            <Fingerprint className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            BioSync Enterprise
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Biometric Attendance & Workforce Management Terminal
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account (Add Role)</span>
            </button>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ===================== SIGN IN FORM ===================== */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="e.g. admin@biosync.io"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStatus(null);
                      setForgotEmail(signInEmail);
                      setIsForgotModalOpen(true);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="text-slate-400 hover:text-slate-200 absolute right-3.5 top-3 cursor-pointer"
                    aria-label={showSignInPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSignInPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-400">Remember session</span>
                </label>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-indigo-400" />
                  256-bit TLS Encrypted
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer"
              >
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Bottom helpers */}
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>New here or need another role?</span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setError(null);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline underline-offset-2"
                >
                  Create Account & Role
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsDemoPasswordsModalOpen(true)}
                  className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <KeyRound className="w-3 h-3 text-indigo-400" />
                  View Pre-Configured Role Passwords
                </button>
              </div>
            </form>
          )}

          {/* ===================== SIGN UP / ADD ROLE FORM ===================== */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="e.g. Jordan Mitchell"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="e.g. jordan@company.com"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Select System Role & Permissions
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {rolesList.map((r) => {
                    const isSelected = signUpRole === r.role;
                    return (
                      <div
                        key={r.role}
                        onClick={() => setSignUpRole(r.role)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'bg-indigo-950/60 border-indigo-600 text-white'
                            : 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 text-slate-300'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{r.title}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${r.badgeColor}`}
                            >
                              {r.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            {r.description}
                          </p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-600 text-white'
                              : 'border-slate-600 bg-slate-900'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Department (Optional)
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={signUpDepartment}
                    onChange={(e) => setSignUpDepartment(e.target.value)}
                    placeholder="e.g. Operations / HR / Administration"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="Min 4 chars"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="text-slate-400 hover:text-slate-200 absolute right-3 top-2.5 cursor-pointer"
                    >
                      {showSignUpPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type={showSignUpConfirmPassword ? 'text' : 'password'}
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                      className="text-slate-400 hover:text-slate-200 absolute right-3 top-2.5 cursor-pointer"
                    >
                      {showSignUpConfirmPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Organization Master Security Key Protection */}
              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    Organization Master Security Key *
                  </label>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">
                    Required for Auth
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  To prevent unauthorized public signups, registration requires the Organization Master Key (e.g. <code className="text-indigo-300 font-mono font-semibold bg-indigo-900/60 px-1 py-0.5 rounded">BIOSYNC-MASTER-2026</code>).
                </p>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showSignUpSecurityKey ? 'text' : 'password'}
                    value={signUpSecurityKey}
                    onChange={(e) => setSignUpSecurityKey(e.target.value)}
                    placeholder="Enter Organization Master Security Key"
                    className="w-full bg-slate-900 border border-indigo-700/70 rounded-xl pl-9 pr-24 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
                    required
                  />
                  <div className="absolute right-2 top-1.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSignUpSecurityKey('BIOSYNC-MASTER-2026')}
                      className="text-[10px] font-medium text-indigo-300 hover:text-white bg-indigo-800/60 hover:bg-indigo-700 px-2 py-1 rounded transition-colors"
                      title="Autofill default master key for authorized onboarding"
                    >
                      Autofill Key
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSignUpSecurityKey(!showSignUpSecurityKey)}
                      className="text-slate-400 hover:text-slate-200 p-1"
                    >
                      {showSignUpSecurityKey ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all mt-3 cursor-pointer"
              >
                <span>Authorize & Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Already have an account?</span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setError(null);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline underline-offset-2"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          © 2026 BioSync Technologies Inc. All rights reserved.
        </p>
      </div>

      {/* Demo Passwords Reference Modal */}
      {isDemoPasswordsModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-400" />
                Predefined Role Accounts & Passwords
              </h3>
              <button
                type="button"
                onClick={() => setIsDemoPasswordsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer p-1"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Each pre-configured role has its own dedicated password. You can also click{' '}
              <strong className="text-indigo-300 font-medium">Create Account</strong> to register any custom user and role.
            </p>

            <div className="space-y-2.5 mb-5">
              {allUsers.map((u) => {
                const pass = u.password || ROLE_DEFAULT_PASSWORDS[u.role] || 'admin123';
                return (
                  <div
                    key={u.id}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-white">{u.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/50">
                        {u.role}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block mb-0.5">Password:</span>
                      <code className="font-mono font-bold text-emerald-400 bg-emerald-950/70 px-2 py-1 rounded border border-emerald-800/60 text-xs">
                        {pass}
                      </code>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsDemoPasswordsModalOpen(false)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fadeIn">
            <h3 className="text-base font-bold text-white mb-1">
              Reset Password
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your registered work email address to retrieve or reset your password.
            </p>

            {forgotStatus ? (
              <div
                className={`p-3.5 rounded-xl border text-xs mb-4 ${
                  forgotStatus.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {forgotStatus.message}
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@biosync.io"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Send Recovery Link
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => setIsForgotModalOpen(false)}
              className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
