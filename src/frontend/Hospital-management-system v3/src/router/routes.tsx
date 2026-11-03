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

import { LoginPage } from "../features/users/pages/LoginPage";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { PatientsPage } from "../features/patients/pages/PatientsPage";
import { AppointmentsPage } from "../features/appointments/pages/AppointmentsPage";
import { RecordsPage } from "../features/records/pages/RecordsPage";
import { BillingPage } from "../features/billing/pages/BillingPage";
import { DoctorsPage } from "../features/doctors/pages/DoctorsPage";
import { UsersPage } from "../features/users/pages/UsersPage";
import { NotificationsPage } from "../features/notifications/pages/NotificationsPage";
import { AuditPage } from "../features/audit/pages/AuditPage";

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

