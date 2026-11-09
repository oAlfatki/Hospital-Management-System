import React, { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Key } from 'lucide-react';
import { Dialog } from '@/src/core/components/ui/Dialog';
import { Input } from '@/src/core/components/ui/Input';
import { Select } from '@/src/core/components/ui/Select';
import { Button } from '@/src/core/components/ui/Button';
import { useLanguage } from '@/src/core/providers/LanguageProvider';
import type { IUserFormInput } from '../types/IUserFormInput';
import type { User } from '../types/User';

interface UserDialogProps {
  mode: 'create' | 'edit';
  isOpen: boolean;
  selectedUser: User | null;
  form: UseFormReturn<IUserFormInput>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  onClose: () => void;
}

export const UserDialog: React.FC<UserDialogProps> = ({
  mode,
  isOpen,
  selectedUser,
  form,
  onSubmit,
  isSubmitting,
  onClose,
}) => {
  const { t, language } = useLanguage();
  const { register, formState: { errors }, reset } = form;

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && selectedUser) {
        reset({
          password: '',
          name: selectedUser.name,
          email: selectedUser.email,
          role: selectedUser.role,
          contactNumber: selectedUser.contactNumber || '',
          department: selectedUser.department || '',
          status: selectedUser.status,
        });
      } else if (mode === 'create') {
        reset({
          password: '',
          name: '',
          email: '',
          role: 'Nurse',
          contactNumber: '',
          department: '',
          status: 'Active',
        });
      }
    }
  }, [isOpen, mode, selectedUser, reset]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? t('addStaffUserAccount') : 'Edit Staff Account'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="h-9">
            {t('commonCancel')}
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting} className="h-9">
            {isSubmitting ? t('commonLoading') : mode === 'edit' ? (language === 'ar' ? 'حفظ التغييرات' : 'Save changes') : t('addStaffAccount')}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label={t('fullName')}
          {...register('name')}
          error={errors.name?.message ? t(errors.name.message as any) : undefined}
          placeholder="John Doe"
          required
        />
        <Input
          label={t('loginEmailAddress')}
          type="email"
          {...register('email')}
          error={errors.email?.message ? t(errors.email.message as any) : undefined}
          placeholder="johndoe@hms.com"
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label={t('staffRole')}
            {...register('role')}
            options={[
              { value: 'Admin', label: language === 'ar' ? 'مدير (Admin)' : 'Admin' },
              { value: 'Doctor', label: language === 'ar' ? 'طبيب (Doctor)' : 'Doctor' },
              { value: 'Nurse', label: language === 'ar' ? 'ممرض (Nurse)' : 'Nurse' },
              { value: 'Accounts', label: language === 'ar' ? 'حسابات (Accounts)' : 'Accounts' },
              { value: 'Management', label: language === 'ar' ? 'إدارة (Management)' : 'Management' },
            ]}
          />
          <Input
            label={t('contactPhone')}
            {...register('contactNumber')}
            error={errors.contactNumber?.message ? t(errors.contactNumber.message as any) : undefined}
            maxLength={10}
          />
        </div>
        <Input
          label={language === 'ar' ? 'كلمة المرور (12 حرفًا على الأقل)' : 'Password (at least 12 characters)'}
          type="password"
          autoComplete="new-password"
          {...register('password', { required: mode === 'create' })}
          error={errors.password?.message ? t(errors.password.message as any) : undefined}
          required={mode === 'create'}
        />
      </form>
    </Dialog>
  );
};
