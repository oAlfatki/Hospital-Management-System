import { useForm, type SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { UserSchema } from '../validation/UserSchema';
import { UserMapper } from '../mappers/userMapper';
import { useCreateUser } from './useCreateUser';
import { useUpdateUser } from './useUpdateUser';
import type { User } from '../types/User';
import type { IUserFormInput } from '../types/IUserFormInput';
import { useLanguage } from '@/src/core/providers/LanguageProvider';

interface UseUserFormProps {
  mode: 'create' | 'edit';
  selectedUser: User | null;
  onSuccess: () => void;
}

export function useUserForm({ mode, selectedUser, onSuccess }: UseUserFormProps) {
  const { t } = useLanguage();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const form = useForm<IUserFormInput>({
    resolver: yupResolver(UserSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      role: 'Nurse',
      contactNumber: '',
      department: '',
      status: 'Active',
    },
  });

  const { reset } = form;

  const resetForm = () => {
    reset({
      name: '',
      email: '',
      role: 'Nurse',
      contactNumber: '',
      department: '',
      status: 'Active',
    });
  };

  const loadUser = (user: User) => {
    reset(UserMapper.toFormValues(user));
  };

  const handleFormSubmit: SubmitHandler<IUserFormInput> = async (data) => {
    if (mode === 'create') {
      await createUser.mutateAsync(UserMapper.toCreateRequest(data), {
        onSuccess() {
          toast.success(t('toastStaffUserCreated'));
          onSuccess();
          resetForm();
        },
        onError(error: any) {
          toast.error(error.message || t('toastFailedCreateUser'));
        },
      });
      return;
    }

    if (selectedUser) {
      await updateUser.mutateAsync(UserMapper.toUpdateRequest(selectedUser.userId, data), {
        onSuccess() {
          toast.success(t('toastStaffUserCreated'));
          onSuccess();
        },
        onError(error: any) {
          toast.error(error.message || t('toastFailedUpdateUserStatus'));
        },
      });
    }
  };

  return {
    form,
    resetForm,
    loadUser,
    onSubmit: form.handleSubmit(handleFormSubmit),
    isSubmitting: createUser.isPending || updateUser.isPending,
  };
}
