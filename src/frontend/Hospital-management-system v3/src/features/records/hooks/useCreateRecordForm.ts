import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CreateRecordSchema } from '../validation/CreateRecordSchema';
import { IRecordFormInput } from '../types/IRecordFormInput';
import { useCreateMedicalRecordMutation } from './useCreateMedicalRecord';
import { useLanguage } from '@/src/core/providers';
import { useToast } from '@/src/core';

interface UseCreateRecordFormProps {
  onSuccess: () => void;
  defaultPatientId?: string;
}

export const useCreateRecordForm = ({
  onSuccess,
  defaultPatientId = '',
}: UseCreateRecordFormProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const createMutation = useCreateMedicalRecordMutation();

  const form = useForm<IRecordFormInput>({
    resolver: yupResolver(CreateRecordSchema) as any,
    defaultValues: {
      patientId: defaultPatientId,
      diagnosis: '',
      treatment: '',
      prescriptions: '',
      status: 'Active',
    },
  });

  const onSubmit: SubmitHandler<IRecordFormInput> = (values) => {
    createMutation.mutate(
      values,
      {
        onSuccess: () => {
          toast.success(t('toastClinicalRecordInitialized'));
          onSuccess();
        },
        onError: (err: Error) => {
          toast.error(err.message || t('toastFailedCreateRecord'));
        },
      }
    );
  };

  const resetForm = (pId = '') => {
    form.reset({
      patientId: pId,
      diagnosis: '',
      treatment: '',
      prescriptions: '',
      status: 'Active',
    });
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: createMutation.isPending,
    resetForm,
  };
};
