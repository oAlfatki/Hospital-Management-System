import { useUpdateAppointment } from './useUpdateAppointment';
import type { Appointment } from '../types/appointments.types';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ScheduleAppointmentSchema } from '../validation/ScheduleAppointmentSchema';
import { IScheduleAppointmentFormInput } from '../types/IAppointmentFormInput';
import { useScheduleAppointmentMutation } from './useScheduleAppointment';
import { useLanguage } from '@/src/core/providers';
import { useToast } from '@/src/core';

interface UseAppointmentFormProps {
  onSuccess: () => void;
  defaultPatientId?: string;
  defaultDoctorId?: string;
}

export const useAppointmentForm = ({
  onSuccess,
  defaultPatientId = '',
  defaultDoctorId = '',
}: UseAppointmentFormProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const scheduleMutation = useScheduleAppointmentMutation();
  const updateMutation = useUpdateAppointment();
  const [editingId, setEditingId] = useState<string | null>(null);

  const [conflictError, setConflictError] = useState<string | null>(null);
  const [slotSuggestions, setSlotSuggestions] = useState<string[]>([]);

  const form = useForm<IScheduleAppointmentFormInput>({
    resolver: yupResolver(ScheduleAppointmentSchema) as any,
    defaultValues: {
      patientId: defaultPatientId,
      doctorId: defaultDoctorId,
      appointmentDate: new Date().toLocaleDateString('en-CA'),
      appointmentTime: '09:00',
      durationMinutes: 30,
    },
  });

  const onSubmit: SubmitHandler<IScheduleAppointmentFormInput> = (values) => {
    setConflictError(null);
    setSlotSuggestions([]);

    const request = { ...values, durationMinutes: Number(values.durationMinutes) };
    const callbacks = {
      onSuccess: () => { toast.success(editingId ? t('saveChangesAction') : t('toastAppointmentScheduled')); onSuccess(); },
      onError: (err: Error) => { setConflictError(err.message); toast.error(err.message); },
    };
    if (editingId) updateMutation.mutate({ id: editingId, request }, callbacks);
    else scheduleMutation.mutate(request, callbacks);
  };

  const applySuggestedSlot = (slot: string) => {
    form.setValue('appointmentTime', slot, { shouldValidate: true });
    setConflictError(null);
    setSlotSuggestions([]);
  };

  const loadAppointment = (appointment: Appointment) => {
    setEditingId(appointment.appointmentId);
    form.reset({ patientId: appointment.patientId, doctorId: appointment.doctorId, appointmentDate: appointment.appointmentDate, appointmentTime: appointment.appointmentTime.slice(0, 5), durationMinutes: appointment.durationMinutes });
    setConflictError(null); setSlotSuggestions([]);
  };
  const resetForm = (pId = '', dId = '') => {
    setEditingId(null);
    form.reset({
      patientId: pId,
      doctorId: dId,
      appointmentDate: new Date().toLocaleDateString('en-CA'),
      appointmentTime: '09:00',
      durationMinutes: 30,
    });
    setConflictError(null);
    setSlotSuggestions([]);
  };

  return {
    form,
    conflictError,
    slotSuggestions,
    applySuggestedSlot,
    onSubmit: form.handleSubmit(onSubmit),
    editingId, loadAppointment,
    isSubmitting: scheduleMutation.isPending || updateMutation.isPending,
    resetForm,
  };
};
