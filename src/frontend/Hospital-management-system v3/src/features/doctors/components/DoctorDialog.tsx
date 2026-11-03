import React, { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Dialog } from '@/src/core/components/ui/Dialog';
import { Input } from '@/src/core/components/ui/Input';
import { Select } from '@/src/core/components/ui/Select';
import { Button } from '@/src/core/components/ui/Button';
import { useLanguage } from '@/src/core/providers/LanguageProvider';
import type { IDoctorFormInput } from '../types/IDoctorFormInput';
import type { Department } from '../types/Department';
import type { Doctor } from '../types/Doctor';

interface DoctorDialogProps {
  mode: 'create' | 'edit';
  isOpen: boolean;
  selectedDoctor: Doctor | null;
  departments: Department[];
  form: UseFormReturn<IDoctorFormInput>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  onClose: () => void;
}

export const DoctorDialog: React.FC<DoctorDialogProps> = ({
  mode,
  isOpen,
  selectedDoctor,
  departments,
  form,
  onSubmit,
  isSubmitting,
  onClose,
}) => {
  const { t } = useLanguage();
  const { register, formState: { errors }, reset } = form;

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && selectedDoctor) {
        reset({
          name: selectedDoctor.name,
          departmentId: selectedDoctor.departmentId,
          specialty: selectedDoctor.specialty,
          contactNumber: selectedDoctor.contactNumber || '',
          email: selectedDoctor.email,
          status: selectedDoctor.status,
        });
      } else if (mode === 'create') {
        reset({
          name: '',
          departmentId: departments[0]?.departmentId || '',
          specialty: '',
          contactNumber: '',
          email: '',
          status: 'Active',
        });
      }
    }
  }, [isOpen, mode, selectedDoctor, reset, departments]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? t('registerNewPhysician') : 'Edit Physician Details'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="h-9">
            {t('commonCancel')}
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting} className="h-9">
            {isSubmitting ? t('commonLoading') : t('saveDoctor')}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label={t('physicianFullName')}
          {...register('name')}
          error={errors.name?.message ? t(errors.name.message as any) : undefined}
          placeholder="Dr. Gregory House"
          required
        />
        <Select
          label={t('assignedDepartment')}
          {...register('departmentId')}
          options={departments.map((d) => ({ value: d.departmentId, label: d.name }))}
          error={errors.departmentId?.message ? t(errors.departmentId.message as any) : undefined}
        />
        <Input
          label={t('specializationField')}
          {...register('specialty')}
          error={errors.specialty?.message ? t(errors.specialty.message as any) : undefined}
          placeholder="e.g. Neurologist, Interventional Cardiologist"
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('contactPhone')}
            {...register('contactNumber')}
            error={errors.contactNumber?.message ? t(errors.contactNumber.message as any) : undefined}
            maxLength={10}
          />
          <Input
            label={t('emailAddress')}
            type="email"
            {...register('email')}
            error={errors.email?.message ? t(errors.email.message as any) : undefined}
            placeholder="house@hms.com"
            required
          />
        </div>
      </form>
    </Dialog>
  );
};
