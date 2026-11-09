import React from 'react';
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
} from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import ErrorHandler from "../core/components/errors/ErrorHandler";

import { AuthLayout } from "../core/layouts/AuthLayout";
import { DashboardLayout } from "../core/layouts/DashboardLayout";

const LoginPage = React.lazy(() => import("../features/users/pages/LoginPage").then(m => ({ default: m.LoginPage })));
const DashboardPage = React.lazy(() => import("../features/dashboard/pages/DashboardPage").then(m => ({ default: m.DashboardPage })));
const PatientsPage = React.lazy(() => import("../features/patients/pages/PatientsPage").then(m => ({ default: m.PatientsPage })));
const AppointmentsPage = React.lazy(() => import("../features/appointments/pages/AppointmentsPage").then(m => ({ default: m.AppointmentsPage })));
const RecordsPage = React.lazy(() => import("../features/records/pages/RecordsPage").then(m => ({ default: m.RecordsPage })));
const BillingPage = React.lazy(() => import("../features/billing/pages/BillingPage").then(m => ({ default: m.BillingPage })));
const DoctorsPage = React.lazy(() => import("../features/doctors/pages/DoctorsPage").then(m => ({ default: m.DoctorsPage })));
const UsersPage = React.lazy(() => import("../features/users/pages/UsersPage").then(m => ({ default: m.UsersPage })));
const NotificationsPage = React.lazy(() => import("../features/notifications/pages/NotificationsPage").then(m => ({ default: m.NotificationsPage })));
const AuditPage = React.lazy(() => import("../features/audit/pages/AuditPage").then(m => ({ default: m.AuditPage })));

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Auth Layout */}
      <Route
        path="/auth"
        element={<AuthLayout />}
        errorElement={<ErrorHandler />}
      >
        <Route index element={<LoginPage />} />
        <Route path="login" element={<LoginPage />} />
      </Route>
      <Route path="/login" element={<Navigate to="/auth" replace />} />

      {/* Root / Dashboard Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
        errorElement={<ErrorHandler />}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route
          path="dashboard"
          element={<DashboardPage />}
        />
        <Route
          path="patients"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Doctor', 'Nurse', 'Management']}>
              <PatientsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="appointments"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Doctor', 'Nurse', 'Management']}>
              <AppointmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="records"
          element={
            <ProtectedRoute allowedRoles={['Doctor', 'Nurse']}>
              <RecordsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="billing"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Accounts', 'Management']}>
              <BillingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="doctors"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Management']}>
              <DoctorsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="notifications"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Management']}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="audit"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Management']}>
              <AuditPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Page Not Found / Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </>
  )
);

export default router;
export { router };

