import React from 'react';
import { useLanguage } from '@/src/core/providers';
import { Button, Input, Select, Dialog, formatCurrency } from '@/src/core';
import { UseFormReturn } from 'react-hook-form';
import { ICreateBillFormInput } from '../types/IBillFormInput';
import { ServiceItem } from '../types/billing.types';
import { Patient } from '@/src/features/patients/types/Patient';
import { Trash2 } from 'lucide-react';

interface CreateBillDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  form: UseFormReturn<ICreateBillFormInput>;
  servicesList: ServiceItem[];
  newItemName: string;
  setNewItemName: (val: string) => void;
  newItemCost: string;
  setNewItemCost: (val: string) => void;
  addServiceItem: () => void;
  removeServiceItem: (idx: number) => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
}

export const CreateBillDialog: React.FC<CreateBillDialogProps> = ({
  isOpen,
  onClose,
  patients,
  form,
  servicesList,
  newItemName,
  setNewItemName,
  newItemCost,
  setNewItemCost,
  addServiceItem,
  removeServiceItem,
  onSubmit,
  isSubmitting,
}) => {
  const { t, language } = useLanguage();
  const { register, formState: { errors } } = form;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('generateClinicalServicesInvoice')}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="h-9">
            {t('commonCancel')}
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting} className="h-9">
            {t('generateAndDispatchInvoice')}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Select
          label={t('selectPatientFile')}
          {...register('patientId')}
          error={errors.patientId?.message}
          options={[
            { value: '', label: t('selectPatientOption') },
            ...patients.map((p) => ({ value: p.patientId, label: `${p.name} (${p.patientId})` })),
          ]}
        />

        {/* Dynamic Services provided builder */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/45 border border-slate-100 dark:border-slate-850 rounded-lg space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t('dynamicServiceLedgerBuilder')}
          </p>

          <div className="space-y-1.5">
            {servicesList.length === 0 ? (
              <p className="text-xs text-slate-400 italic">{t('noServicesAddedYet')}</p>
            ) : (
              servicesList.map((srv, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-2 rounded"
                >
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {srv.serviceName}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {formatCurrency(srv.cost, language === 'ar' ? 'ar-EG' : 'en-US')}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeServiceItem(idx)}
                      className="text-slate-400 hover:text-rose-500 cursor-pointer"
                      title="Remove service"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800">
            <input
              type="text"
              placeholder={t('serviceNamePlaceholder')}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded outline-none focus:border-emerald-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
            />
            <input
              type="number"
              placeholder={t('costPlaceholder')}
              value={newItemCost}
              onChange={(e) => setNewItemCost(e.target.value)}
              className="w-24 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded outline-none focus:border-emerald-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
            />
            <Button type="button" onClick={addServiceItem} size="sm" className="h-8 text-xs font-semibold">
              {t('addItemBtn')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label={t('taxRateLabel')}
            type="number"
            {...register('taxPercent')}
            error={errors.taxPercent?.message}
            min="0"
          />
          <Input
            label={t('flatDiscountLabel')}
            type="number"
            {...register('discountAmount')}
            error={errors.discountAmount?.message}
            min="0"
          />
          <Input
            label={t('invoiceDueDateLabel')}
            type="date"
            {...register('dueDate')}
            error={errors.dueDate?.message}
            required
          />
        </div>
      </form>
    </Dialog>
  );
};
