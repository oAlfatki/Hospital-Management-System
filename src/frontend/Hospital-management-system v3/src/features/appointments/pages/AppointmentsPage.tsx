import React, { useMemo } from 'react';
import { useAuth, useLanguage } from '@/src/core/providers';
import { Button, useToast, LoadingState, ErrorState, PageHeader } from '@/src/core';
import { Plus } from 'lucide-react';
import { useAppointments } from '../hooks/useAppointments';
import { useUpdateAppointmentStatusMutation } from '../hooks/useUpdateAppointmentStatus';
import { usePatients } from '@/src/features/patients';
import { useDoctors } from '@/src/features/doctors';

import { useAppointmentDialog } from '../hooks/useAppointmentDialog';
import { useAppointmentForm } from '../hooks/useAppointmentForm';
import { useRescheduleForm } from '../hooks/useRescheduleForm';

import { AppointmentTable } from '../components/AppointmentTable';
import { ScheduleAppointmentDialog } from '../components/ScheduleAppointmentDialog';
import { RescheduleAppointmentDialog } from '../components/RescheduleAppointmentDialog';
import { EnrichedAppointment } from '../types/EnrichedAppointment';

export const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const { data: rawAppointments = [], isLoading: isApptsLoading, error: apptsError } = useAppointments();
  const { data: patientsData, isLoading: isPatientsLoading } = usePatients();
  const patients = patientsData || [];
  const { data: doctors = [], isLoading: isDoctorsLoading } = useDoctors();

  const updateStatusMutation = useUpdateAppointmentStatusMutation();

  const dialog = useAppointmentDialog();

  const enrichedAppointments = useMemo<EnrichedAppointment[]>(() => {
    return rawAppointments.map((a) => {
      const pat = patients.find((p) => p.patientId === a.patientId);
      const doc = doctors.find((d) => d.doctorId === a.doctorId);
      return {
        ...a,
        patientName: pat ? pat.name : t('unknownPatient'),
        doctorName: doc ? doc.name : t('unknownPhysician'),
        specialty: doc ? doc.specialty : t('generalMedicine'),
      };
    });
  }, [rawAppointments, patients, doctors, t]);

  const scheduleForm = useAppointmentForm({
    onSuccess: () => dialog.closeScheduleDialog(),
    defaultPatientId: patients[0]?.patientId || '',
    defaultDoctorId: doctors[0]?.doctorId || '',
  });

  const rescheduleForm = useRescheduleForm({
    selectedAppt: dialog.selectedAppt,
    onSuccess: () => dialog.closeRescheduleDialog(),
  });

  const handleCancelClick = (apptId: string) => {
    if (!user) return;
    if (confirm(t('confirmCancelAppointment'))) {
      updateStatusMutation.mutate(
        { appointmentId: apptId, newStatus: 'Cancelled' },
        {
          onSuccess: () => {
            toast.success(t('toastAppointmentCancelled'));
          },
          onError: (err: Error) => {
            toast.error(err.message || t('toastFailedCancel'));
          },
        }
      );
    }
  };

  if (isApptsLoading || isPatientsLoading || isDoctorsLoading) {
    return <LoadingState message={t('commonLoading')} />;
  }

  if (apptsError) {
    return <ErrorState message={t('commonSomethingWentWrong')} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t('appointments')}
        description={t('appointmentsDesc')}
      >
        <Button
          onClick={() => {
            scheduleForm.resetForm(patients[0]?.patientId || '', doctors[0]?.doctorId || '');
            dialog.openScheduleDialog();
          }}
          className="gap-2 h-9 text-xs"
        >
          <Plus className="h-4 w-4" />
          {t('bookAppointment')}
        </Button>
      </PageHeader>

      {/* Appointment Registry List */}
      <AppointmentTable
        appointments={enrichedAppointments}
        onOpenReschedule={dialog.openRescheduleDialog}
        onCancel={handleCancelClick}
      />

      {/* Dialogs */}
      <ScheduleAppointmentDialog
        isOpen={dialog.isScheduleOpen}
        onClose={dialog.closeScheduleDialog}
        patients={patients}
        doctors={doctors}
        form={scheduleForm.form}
        conflictError={scheduleForm.conflictError}
        slotSuggestions={scheduleForm.slotSuggestions}
        applySuggestedSlot={scheduleForm.applySuggestedSlot}
        onSubmit={scheduleForm.onSubmit}
        isSubmitting={scheduleForm.isSubmitting}
      />

      <RescheduleAppointmentDialog
        isOpen={dialog.isRescheduleOpen}
        onClose={dialog.closeRescheduleDialog}
        selectedAppt={dialog.selectedAppt}
        form={rescheduleForm.form}
        conflictError={rescheduleForm.conflictError}
        slotSuggestions={rescheduleForm.slotSuggestions}
        applySuggestedSlot={rescheduleForm.applySuggestedSlot}
        onSubmit={rescheduleForm.onSubmit}
        isSubmitting={rescheduleForm.isSubmitting}
      />
    </div>
  );
};
