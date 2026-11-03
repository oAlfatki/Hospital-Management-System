import React from 'react';
import { useLanguage } from '@/src/core/providers';
import { Button, Input, Dialog, formatTime } from '@/src/core';
import { UseFormReturn } from 'react-hook-form';
import { IRescheduleAppointmentFormInput } from '../types/IAppointmentFormInput';
import { EnrichedAppointment } from '../types/EnrichedAppointment';
import { AlertTriangle } from 'lucide-react';

interface RescheduleAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAppt: EnrichedAppointment | null;
  form: UseFormReturn<IRescheduleAppointmentFormInput>;
  conflictError: string | null;
  slotSuggestions: string[];
  applySuggestedSlot: (slot: string) => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
}

export const RescheduleAppointmentDialog: React.FC<RescheduleAppointmentDialogProps> = ({
  isOpen,
  onClose,
  selectedAppt,
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
      title={t('rescheduleClinicalVisit')}
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="h-9">
            {t('commonCancel')}
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting} className="h-9">
            {t('applyReschedule')}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-100 dark:border-slate-850">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            {t('reschedulingVisitFor')}
          </p>
          <p className="text-sm font-bold mt-1 text-slate-800 dark:text-slate-200">
            {selectedAppt?.patientName} • ID {selectedAppt?.patientId}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {t('physicianPrefix')} {selectedAppt?.doctorName} ({selectedAppt?.specialty})
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('newVisitDate')}
            type="date"
            {...register('appointmentDate')}
            error={errors.appointmentDate?.message}
            required
          />
          <Input
            label={t('newTimeLabel')}
            type="time"
            {...register('appointmentTime')}
            error={errors.appointmentTime?.message}
            required
          />
        </div>

        {/* Smart suggestions for rescheduling conflicts */}
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
                      className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-emerald-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 hover:border-emerald-500 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded transition-colors cursor-pointer"
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
