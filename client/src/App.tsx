import type { ReactNode } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { LoadScreen } from './components/LoadScreen';
import { ROUTES } from './constants/routes.constants';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getStoredToken } from './services/api.service';
import { UserRole } from './types/auth.types';
import { AdminDashboardPage } from './pages/admin/AdminDashboard';
import { DashboardPage } from './pages/dashboard';
import { LoginPage } from './pages/login';

function ProtectedShell({ children }: { children: ReactNode }) {
  const token = getStoredToken();
  const { loading } = useAuth();
  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  if (loading) {
    return <LoadScreen />;
  }
  return <>{children}</>;
}

function ModeratorRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (!getStoredToken()) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  if (loading) {
    return <LoadScreen />;
  }
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  if (user.role === UserRole.ADMIN) {
    return <Navigate to={ROUTES.ADMIN} replace />;
  }
  return <>{children}</>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (!getStoredToken()) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  if (loading) {
    return <LoadScreen />;
  }
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  if (user.role !== UserRole.ADMIN) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }
  return <>{children}</>;
}

function PublicOnly({ children }: { children: ReactNode }) {
  const token = getStoredToken();
  const { user, loading } = useAuth();
  if (!token) {
    return <>{children}</>;
  }
  if (loading) {
    return <LoadScreen />;
  }
  if (user) {
    return (
      <Navigate
        to={user.role === UserRole.ADMIN ? ROUTES.ADMIN : ROUTES.DASHBOARD}
        replace
      />
    );
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path={ROUTES.LOGIN}
        element={
          <PublicOnly>
            <LoginPage />
          </PublicOnly>
        }
      />
      <Route path={ROUTES.REGISTER} element={<Navigate to={ROUTES.LOGIN} replace />} />
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedShell>
            <ModeratorRoute>
              <DashboardPage />
            </ModeratorRoute>
          </ProtectedShell>
        }
      />
      <Route
        path={ROUTES.ADMIN}
        element={
          <ProtectedShell>
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          </ProtectedShell>
        }
      />
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
