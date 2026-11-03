import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { UpdateRecordSchema } from '../validation/UpdateRecordSchema';
import { IUpdateRecordFormInput } from '../types/IRecordFormInput';
import { useUpdateMedicalRecordMutation } from './useUpdateMedicalRecord';
import { useLanguage } from '@/src/core/providers';
import { useToast } from '@/src/core';
import { EnrichedMedicalRecord } from '../types/EnrichedMedicalRecord';

interface UseEditRecordFormProps {
  selectedRecord: EnrichedMedicalRecord | null;
  onSuccess: () => void;
}

export const useEditRecordForm = ({ selectedRecord, onSuccess }: UseEditRecordFormProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const updateMutation = useUpdateMedicalRecordMutation();

  const form = useForm<IUpdateRecordFormInput>({
    resolver: yupResolver(UpdateRecordSchema) as any,
    values: {
      diagnosis: selectedRecord?.diagnosis || '',
      treatment: selectedRecord?.treatment || '',
      prescriptions: selectedRecord?.prescriptions || '',
      status: selectedRecord?.status || 'Active',
    },
  });

  const onSubmit: SubmitHandler<IUpdateRecordFormInput> = (values) => {
    if (!selectedRecord) return;
    updateMutation.mutate(
      {
        recordId: selectedRecord.recordId,
        ...values,
      },
      {
        onSuccess: () => {
          toast.success(t('toastMedicalRecordUpdated'));
          onSuccess();
        },
        onError: (err: Error) => {
          toast.error(err.message || t('toastFailedUpdateRecord'));
        },
      }
    );
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: updateMutation.isPending,
  };
};
