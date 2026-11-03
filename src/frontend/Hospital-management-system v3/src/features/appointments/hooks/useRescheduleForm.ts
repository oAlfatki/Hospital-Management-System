import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { RescheduleAppointmentSchema } from '../validation/RescheduleAppointmentSchema';
import { IRescheduleAppointmentFormInput } from '../types/IAppointmentFormInput';
import { useRescheduleAppointmentMutation } from './useRescheduleAppointment';
import { useLanguage } from '@/src/core/providers';
import { useToast } from '@/src/core';
import { EnrichedAppointment } from '../types/EnrichedAppointment';

interface UseRescheduleFormProps {
  selectedAppt: EnrichedAppointment | null;
  onSuccess: () => void;
}

export const useRescheduleForm = ({ selectedAppt, onSuccess }: UseRescheduleFormProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const rescheduleMutation = useRescheduleAppointmentMutation();

  const [conflictError, setConflictError] = useState<string | null>(null);
  const [slotSuggestions, setSlotSuggestions] = useState<string[]>([]);

  const form = useForm<IRescheduleAppointmentFormInput>({
    resolver: yupResolver(RescheduleAppointmentSchema) as any,
    values: {
      appointmentDate: selectedAppt?.appointmentDate || '',
      appointmentTime: selectedAppt?.appointmentTime || '',
    },
  });

  const onSubmit: SubmitHandler<IRescheduleAppointmentFormInput> = (values) => {
    if (!selectedAppt) return;
    setConflictError(null);
    setSlotSuggestions([]);

    rescheduleMutation.mutate(
      {
        appointmentId: selectedAppt.appointmentId,
        newDate: values.appointmentDate,
        newTime: values.appointmentTime,
      },
      {
        onSuccess: () => {
          toast.success(t('toastAppointmentRescheduled'));
          onSuccess();
        },
        onError: (err: any) => {
          const msg = err.message || t('toastFailedReschedule');
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

  return {
    form,
    conflictError,
    slotSuggestions,
    applySuggestedSlot,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: rescheduleMutation.isPending,
  };
};
