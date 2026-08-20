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
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Application Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="teachers" element={<TeachersListPage />} />
              <Route path="teachers/:teacherId" element={<TeacherProfilePage />} />
              <Route path="teachers/:teacherId/:tab" element={<TeacherProfilePage />} />
              <Route path="employees" element={<EmployeesPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="breaks" element={<BreaksPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="departments" element={<DepartmentsPage />} />
              <Route path="devices" element={<DevicesPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
