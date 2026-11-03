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

  const [conflictError, setConflictError] = useState<string | null>(null);
  const [slotSuggestions, setSlotSuggestions] = useState<string[]>([]);

  const form = useForm<IScheduleAppointmentFormInput>({
    resolver: yupResolver(ScheduleAppointmentSchema) as any,
    defaultValues: {
      patientId: defaultPatientId,
      doctorId: defaultDoctorId,
      appointmentDate: '2026-06-29',
      appointmentTime: '09:00',
      durationMinutes: 30,
    },
  });

  const onSubmit: SubmitHandler<IScheduleAppointmentFormInput> = (values) => {
    setConflictError(null);
    setSlotSuggestions([]);

    scheduleMutation.mutate(
      {
        ...values,
        durationMinutes: Number(values.durationMinutes),
      },
      {
        onSuccess: () => {
          toast.success(t('toastAppointmentScheduled'));
          onSuccess();
        },
        onError: (err: any) => {
          const msg = err.message || t('toastFailedSchedule');
          setConflictError(msg);
          if (err.suggestions) {
            setSlotSuggestions(err.suggestions);
          }
          toast.error(msg);
        },
      }
    );
  };

  const applySuggestedSlot = (slot: string) => {
    form.setValue('appointmentTime', slot, { shouldValidate: true });
    setConflictError(null);
    setSlotSuggestions([]);
  };

  const resetForm = (pId = '', dId = '') => {
    form.reset({
      patientId: pId,
      doctorId: dId,
      appointmentDate: '2026-06-29',
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
    isSubmitting: scheduleMutation.isPending,
    resetForm,
  };
};
