import { useForm, type SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { DoctorSchema } from '../validation/DoctorSchema';
import { DoctorMapper } from '../mappers/doctorMapper';
import { useCreateDoctor } from './useCreateDoctor';
import { useUpdateDoctor } from './useUpdateDoctor';
import type { Doctor } from '../types/Doctor';
import type { IDoctorFormInput } from '../types/IDoctorFormInput';
import { useLanguage } from '@/src/core/providers/LanguageProvider';

interface UseDoctorFormProps {
  mode: 'create' | 'edit';
  selectedDoctor: Doctor | null;
  onSuccess: () => void;
}

export function useDoctorForm({ mode, selectedDoctor, onSuccess }: UseDoctorFormProps) {
  const { t } = useLanguage();
  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();

  const form = useForm<IDoctorFormInput>({
    resolver: yupResolver(DoctorSchema),
    defaultValues: {
      name: '',
      departmentId: '',
      specialty: '',
      contactNumber: '',
      email: '',
      status: 'Active',
    },
  });

  const { reset } = form;

  const resetForm = () => {
    reset({
      name: '',
      departmentId: '',
      specialty: '',
      contactNumber: '',
      email: '',
      status: 'Active',
    });
  };

  const loadDoctor = (doc: Doctor) => {
    reset(DoctorMapper.toDoctorFormValues(doc));
  };

  const handleFormSubmit: SubmitHandler<IDoctorFormInput> = async (data) => {
    if (mode === 'create') {
      createDoctor.mutate(DoctorMapper.toCreateRequest(data), {
        onSuccess() {
          toast.success(t('toastPhysicianRegistered'));
          onSuccess();
          resetForm();
        },
        onError(error: any) {
          toast.error(error.message || t('toastFailedAddDoctor'));
        },
      });
      return;
    }

    if (selectedDoctor) {
      updateDoctor.mutate(
        DoctorMapper.toUpdateRequest(selectedDoctor.doctorId, data),
        {
          onSuccess() {
            toast.success(t('toastPhysicianRegistered'));
            onSuccess();
          },
          onError(error: any) {
            toast.error(error.message || t('toastFailedAddDoctor'));
          },
        }
      );
    }
  };

  return {
    form,
    resetForm,
    loadDoctor,
    onSubmit: form.handleSubmit(handleFormSubmit),
    isSubmitting: createDoctor.isPending || updateDoctor.isPending,
  };
}
