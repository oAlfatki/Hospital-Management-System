import React from 'react';
import { useLanguage } from '@/src/core/providers';
import { Button, Input, Select, Dialog, formatTime } from '@/src/core';
import { UseFormReturn } from 'react-hook-form';
import { IScheduleAppointmentFormInput } from '../types/IAppointmentFormInput';
import { Patient } from '@/src/features/patients/types/Patient';
import { Doctor } from '@/src/features/doctors/types/Doctor';
import { AlertTriangle } from 'lucide-react';

interface ScheduleAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  doctors: Doctor[];
  form: UseFormReturn<IScheduleAppointmentFormInput>;
  conflictError: string | null;
  slotSuggestions: string[];
  applySuggestedSlot: (slot: string) => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<unknown>;
  isSubmitting: boolean;
}

export const ScheduleAppointmentDialog: React.FC<ScheduleAppointmentDialogProps> = ({
  isOpen,
  onClose,
  patients,
  doctors,
  form,
  conflictError,
  slotSuggestions,
  applySuggestedSlot,
  onSubmit,
  isSubmitting,
}) => {
  const { t, language } = useLanguage();
  const { register, formState: { errors } } = form;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('scheduleClinicalConsultation')}
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="h-9">
            {t('commonCancel')}
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting} className="h-9">
            {t('bookAppointment')}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Patient Selection */}
        <Select
          label={t('selectRegisteredPatient')}
          {...register('patientId')}
          error={errors.patientId?.message}
          options={[
            { value: '', label: t('selectPatientOption') },
            ...patients.map((p) => ({ value: p.patientId, label: `${p.name} (${p.patientId})` })),
          ]}
        />

        {/* Doctor Selection */}
        <Select
          label={t('assignedMedicalDoctor')}
          {...register('doctorId')}
          error={errors.doctorId?.message}
          options={[
            { value: '', label: t('selectPhysicianOption') },
            ...doctors
              .filter((d) => d.status === 'Active')
              .map((d) => ({ value: d.doctorId, label: `${d.name} (${d.specialty})` })),
          ]}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('consultationDate')}
            type="date"
            {...register('appointmentDate')}
            error={errors.appointmentDate?.message}
            required
          />
          <Input
            label={t('timeRangeLabel')}
            type="time"
            {...register('appointmentTime')}
            error={errors.appointmentTime?.message}
            required
          />
        </div>

        <Select
          label={t('durationLabel')}
          {...register('durationMinutes')}
          error={errors.durationMinutes?.message}
          options={[
            { value: '15', label: `15 ${t('commonMinutes')}` },
            { value: '30', label: `30 ${t('commonMinutes')} (${t('commonStandard')})` },
            { value: '45', label: `45 ${t('commonMinutes')}` },
            { value: '60', label: `60 ${t('commonMinutes')}` },
          ]}
        />

        {/* Smart Suggestion box for conflicts */}
        {conflictError && (
          <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">{conflictError}</p>
            </div>

            {slotSuggestions.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  {t('availableAlternativeSlots')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {slotSuggestions.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => applySuggestedSlot(slot)}
                      className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-emerald-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 hover:border-emerald-500 dark:border-slate-800 dark:hover:border-emerald-500/30 text-slate-700 dark:text-slate-300 rounded transition-colors cursor-pointer"
                    >
                      {formatTime(slot, language === 'ar' ? 'ar-EG' : 'en-US')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    </Dialog>
  );
};
