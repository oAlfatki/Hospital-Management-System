import { useForm, type SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { DepartmentSchema } from '../validation/DoctorSchema';
import { doctorService } from '../services/doctorService';
import type { IDepartmentFormInput } from '../types/IDepartmentFormInput';
import type { Department } from '../types/Department';
import { useLanguage } from '@/src/core/providers/LanguageProvider';
interface Props { onSuccess: () => void; selectedDepartment: Department | null; }
export function useDepartmentForm({ onSuccess, selectedDepartment }: Props) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: IDepartmentFormInput) => selectedDepartment
      ? doctorService.updateDepartment(selectedDepartment.departmentId, data)
      : doctorService.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(t('toastDepartmentCreated')); onSuccess();
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const form = useForm<IDepartmentFormInput>({ resolver: yupResolver(DepartmentSchema), defaultValues: { name: '', headOfDepartment: '', description: '' } });
  const submit: SubmitHandler<IDepartmentFormInput> = data => mutation.mutate(data);
  return { form, resetForm: () => form.reset(), onSubmit: form.handleSubmit(submit), isSubmitting: mutation.isPending };
}
