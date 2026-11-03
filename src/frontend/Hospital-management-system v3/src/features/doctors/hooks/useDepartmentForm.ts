import { useForm, type SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { DepartmentSchema } from '../validation/DoctorSchema';
import { useCreateDepartment } from './useCreateDepartment';
import type { IDepartmentFormInput } from '../types/IDepartmentFormInput';
import { useLanguage } from '@/src/core/providers/LanguageProvider';

interface UseDepartmentFormProps {
  onSuccess: () => void;
}

export function useDepartmentForm({ onSuccess }: UseDepartmentFormProps) {
  const { t } = useLanguage();
  const createDepartment = useCreateDepartment();

  const form = useForm<IDepartmentFormInput>({
    resolver: yupResolver(DepartmentSchema) as any,
    defaultValues: {
      name: '',
      headOfDepartment: '',
      description: '',
    },
  });

  const { reset } = form;

  const resetForm = () => {
    reset({
      name: '',
      headOfDepartment: '',
      description: '',
    });
  };

  const handleFormSubmit: SubmitHandler<IDepartmentFormInput> = async (data) => {
    await createDepartment.mutateAsync(data, {
      onSuccess() {
        toast.success(t('toastDepartmentCreated'));
        onSuccess();
        resetForm();
      },
      onError(error: any) {
        toast.error(error.message || t('toastFailedCreateDepartment'));
      },
    });
  };

  return {
    form,
    resetForm,
    onSubmit: form.handleSubmit(handleFormSubmit),
    isSubmitting: createDepartment.isPending,
  };
}
