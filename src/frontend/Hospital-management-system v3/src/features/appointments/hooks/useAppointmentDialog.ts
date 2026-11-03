import { useState } from 'react';
import { EnrichedAppointment } from '../types/EnrichedAppointment';

export const useAppointmentDialog = () => {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<EnrichedAppointment | null>(null);

  const openScheduleDialog = () => {
    setIsScheduleOpen(true);
  };

  const closeScheduleDialog = () => {
    setIsScheduleOpen(false);
  };

  const openRescheduleDialog = (appt: EnrichedAppointment) => {
    setSelectedAppt(appt);
    setIsRescheduleOpen(true);
  };

  const closeRescheduleDialog = () => {
    setIsRescheduleOpen(false);
    setSelectedAppt(null);
  };

  return {
    isScheduleOpen,
    isRescheduleOpen,
    selectedAppt,
    openScheduleDialog,
    closeScheduleDialog,
    openRescheduleDialog,
    closeRescheduleDialog,
  };
};
