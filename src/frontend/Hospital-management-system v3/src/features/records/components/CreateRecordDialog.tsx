import React from 'react';
import { useLanguage } from '@/src/core/providers';
import { Button, Select, Dialog } from '@/src/core';
import { UseFormReturn } from 'react-hook-form';
import { IRecordFormInput } from '../types/IRecordFormInput';
import { Patient } from '@/src/features/patients/types/Patient';

interface CreateRecordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  form: UseFormReturn<IRecordFormInput>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
}

export const CreateRecordDialog: React.FC<CreateRecordDialogProps> = ({
  isOpen,
  onClose,
  patients,
  form,
  onSubmit,
  isSubmitting,
}) => {
  const { t } = useLanguage();
  const { register, formState: { errors } } = form;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('initializePatientClinicalFile')}
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="h-9">
            {t('commonCancel')}
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting} className="h-9">
            {t('saveClinicalFileFileBtn')}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Select
          label={t('selectRegisteredPatientFile')}
          {...register('patientId')}
          error={errors.patientId?.message}
          options={[
            { value: '', label: t('selectPatientOption') },
            ...patients.map((p) => ({ value: p.patientId, label: `${p.name} (${p.patientId})` })),
          ]}
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            {t('clinicalDiagnosisActive')}
          </label>
          <textarea
            {...register('diagnosis')}
            rows={2}
            placeholder={t('primaryActiveDiagnosticsPlaceholder')}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
          />
          {errors.diagnosis && (
            <p className="text-xs text-rose-500 mt-1">{errors.diagnosis.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            {t('prescribedTreatmentDetails')}
          </label>
          <textarea
            {...register('treatment')}
            rows={3}
            placeholder={t('therapyPlansPlaceholder')}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
          />
          {errors.treatment && (
            <p className="text-xs text-rose-500 mt-1">{errors.treatment.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            {t('activePrescriptionsDrugLists')}
          </label>
          <textarea
            {...register('prescriptions')}
            rows={2}
            placeholder={t('activePrescriptionsPlaceholder')}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 font-mono"
          />
          {errors.prescriptions && (
            <p className="text-xs text-rose-500 mt-1">{errors.prescriptions.message}</p>
          )}
        </div>

        <Select
          label={t('patientFileStatus')}
          {...register('status')}
          error={errors.status?.message}
          options={[
            { value: 'Active', label: t('commonActive') },
            { value: 'Archived', label: t('commonArchived') },
          ]}
        />
      </form>
    </Dialog>
  );
};
