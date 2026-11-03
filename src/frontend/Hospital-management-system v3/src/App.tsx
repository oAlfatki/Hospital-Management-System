import React from 'react';
import { AppProviders } from '@/src/core/providers';
import { AppRouter } from '@/src/router';

// Register isolated feature mock endpoints at boot
import '@/src/features/auth/api/authApi';
import '@/src/features/users/api/userApi';
import '@/src/features/patients/api/patientApi';
import '@/src/features/doctors/api/doctorApi';
import '@/src/features/appointments/api/appointmentApi';
import '@/src/features/records/api/recordApi';
import '@/src/features/billing/api/billingApi';
import '@/src/features/notifications/api/notificationApi';
import '@/src/features/audit/api/auditApi';

export default function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
