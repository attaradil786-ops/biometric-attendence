import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LoginPage } from './pages/Login/LoginPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { EmployeesPage } from './pages/Employees/EmployeesPage';
import { AttendancePage } from './pages/Attendance/AttendancePage';
import { BreaksPage } from './pages/Breaks/BreaksPage';
import { ReportsPage } from './pages/Reports/ReportsPage';
import { DepartmentsPage } from './pages/Departments/DepartmentsPage';
import { DevicesPage } from './pages/Devices/DevicesPage';
import { UsersPage } from './pages/Users/UsersPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { TeachersListPage } from './pages/Teachers/TeachersListPage';
import { TeacherProfilePage } from './pages/Teachers/TeacherProfilePage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  const app = useApp();
  return <div>{/* app UI */}</div>;
}
