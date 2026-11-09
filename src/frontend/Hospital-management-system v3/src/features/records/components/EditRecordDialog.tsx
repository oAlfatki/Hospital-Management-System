import React from 'react';
import { useLanguage } from '@/src/core/providers';
import { Button, Select, Dialog } from '@/src/core';
import { UseFormReturn } from 'react-hook-form';
import { IUpdateRecordFormInput } from '../types/IRecordFormInput';
import { EnrichedMedicalRecord } from '../types/EnrichedMedicalRecord';

interface EditRecordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRecord: EnrichedMedicalRecord | null;
  form: UseFormReturn<IUpdateRecordFormInput>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<unknown>;
  isSubmitting: boolean;
}

export const EditRecordDialog: React.FC<EditRecordDialogProps> = ({
  isOpen,
  onClose,
  selectedRecord,
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
      title={t('updatePatientMedicalFile')}
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="h-9">
            {t('commonCancel')}
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting} className="h-9">
            {t('compileUpdateBtn')}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-lg">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            {t('editingMedicalRecordFor')}
          </p>
          <p className="text-sm font-bold mt-1 text-slate-800 dark:text-slate-200">
            {selectedRecord?.patientName} • ID {selectedRecord?.patientId}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">
            {t('currentVersionPrefix')} v{selectedRecord?.version}
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            {t('clinicalDiagnosisActive')}
          </label>
          <textarea
            {...register('diagnosis')}
            rows={2}
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
