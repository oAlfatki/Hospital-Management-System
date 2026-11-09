import { useState } from 'react';
import { useLanguage } from '@/src/core/providers';
import type { EnrichedAppointment } from '../types/EnrichedAppointment';
export function useAppointmentFilters(appointments: EnrichedAppointment[]) {
  const [search, setSearch] = useState('');
  const { t } = useLanguage();
  const term = search.trim().toLocaleLowerCase();
  const filteredAppointments = appointments.filter(a => [a.appointmentId, a.patientId, a.doctorId, a.patientName, a.doctorName, a.specialty, a.appointmentDate, a.status, t(a.status === 'Cancelled' ? 'commonCancelled' : a.status === 'Rescheduled' ? 'commonRescheduled' : 'commonScheduled')].some(v => v.toLocaleLowerCase().includes(term)));
  return { search, setSearch, filteredAppointments };
}
