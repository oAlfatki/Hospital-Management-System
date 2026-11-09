import React from 'react';
import { useLanguage } from '@/src/core/providers';
import { Button, Input, Dialog, formatCurrency } from '@/src/core';
import { UseFormReturn } from 'react-hook-form';
import { IRecordPaymentFormInput } from '../types/IBillFormInput';
import { EnrichedBill } from '../types/EnrichedBill';

interface RecordPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBill: EnrichedBill | null;
  form: UseFormReturn<IRecordPaymentFormInput>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<unknown>;
  isSubmitting: boolean;
}

export const RecordPaymentDialog: React.FC<RecordPaymentDialogProps> = ({
  isOpen,
  onClose,
  selectedBill,
  form,
  onSubmit,
  isSubmitting,
}) => {
  const { t, language } = useLanguage();
  const { register, formState: { errors } } = form;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('recordPaymentInstallment')}
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="h-9">
            {t('commonCancel')}
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting} className="h-9">
            {t('applyPaymentBtn')}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-lg space-y-1.5 text-xs font-medium">
          <p className="font-bold text-slate-400 uppercase tracking-wider">
            {t('invoicedDetailsLedger')}
          </p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
            {t('colInvoiceID')}: {selectedBill?.billId}
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            {t('patientPrefix')} {selectedBill?.patientName} • ID {selectedBill?.patientId}
          </p>
          <div className="flex justify-between border-t border-slate-150 dark:border-slate-800/80 pt-2 font-semibold">
            <span className="text-slate-500">
              {t('totalInvoicedLabel')}{' '}
              {selectedBill
                ? formatCurrency(selectedBill.totalAmount, language === 'ar' ? 'ar-EG' : 'en-US')
                : ''}
            </span>
            <span className="text-rose-500">
              {t('pendingBalanceLabel')}{' '}
              {selectedBill
                ? formatCurrency(selectedBill.pendingDue, language === 'ar' ? 'ar-EG' : 'en-US')
                : ''}
            </span>
          </div>
        </div>

        <Input
          label={t('paymentAmountLabel')}
          type="number"
          {...register('amountToPay')}
          error={errors.amountToPay?.message}
          min="0.01"
          max={selectedBill?.pendingDue}
          step="0.01"
          placeholder={t('enterPaymentAmountPlaceholder')}
          required
          helperText={t('paymentAmountHelper')}
        />
      </form>
    </Dialog>
  );
};
