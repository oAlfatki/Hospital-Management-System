import React, { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Dialog } from '@/src/core/components/ui/Dialog';
import { Input } from '@/src/core/components/ui/Input';
import { Select } from '@/src/core/components/ui/Select';
import { Button } from '@/src/core/components/ui/Button';
import { useLanguage } from '@/src/core/providers/LanguageProvider';
import type { IDepartmentFormInput } from '../types/IDepartmentFormInput';
import type { Doctor } from '../types/Doctor';

import type { Department } from '../types/Department';

interface DepartmentDialogProps {
  selectedDepartment: Department | null;
  isOpen: boolean;
  doctors: Doctor[];
  form: UseFormReturn<IDepartmentFormInput>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  onClose: () => void;
}

export const DepartmentDialog: React.FC<DepartmentDialogProps> = ({
  isOpen,
  selectedDepartment,
  doctors,
  form,
  onSubmit,
  isSubmitting,
  onClose,
}) => {
  const { t, language } = useLanguage();
  const { register, formState: { errors }, reset } = form;

  useEffect(() => {
    if (isOpen) {
      reset({
        name: selectedDepartment?.name || '',
        headOfDepartment: selectedDepartment?.headOfDepartment || '',
        description: selectedDepartment?.description || '',
      });
    }
  }, [isOpen, selectedDepartment, reset]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={selectedDepartment ? (language === 'ar' ? 'تعديل القسم' : 'Edit department') : t('configureNewClinicalDepartment')}
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="h-9">
            {t('commonCancel')}
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting} className="h-9">
            {isSubmitting ? t('commonLoading') : selectedDepartment ? (language === 'ar' ? 'حفظ' : 'Save') : t('createDepartment')}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label={t('departmentName')}
          {...register('name')}
          error={errors.name?.message ? t(errors.name.message as any) : undefined}
          placeholder="e.g. Neurology, Oncology"
          required
        />
        <Select
          label={t('headOfDepartmentLabel')}
          {...register('headOfDepartment')}
          options={[
            { value: '', label: t('unassignedLabel') },
            ...doctors
              .filter((d) => d.status === 'Active' && d.departmentId === selectedDepartment?.departmentId)
              .map((d) => ({ value: d.doctorId, label: d.name })),
          ]}
        />
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            {t('departmentDescription')}
          </label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder={t('clinicalOperationalScopePlaceholder')}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
          />
        </div>
      </form>
    </Dialog>
  );
};
