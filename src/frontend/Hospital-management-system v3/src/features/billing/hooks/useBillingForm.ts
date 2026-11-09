import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CreateBillSchema } from '../validation/CreateBillSchema';
import { ICreateBillFormInput } from '../types/IBillFormInput';
import { useCreateBillMutation } from './useCreateBill';
import { useLanguage } from '@/src/core/providers';
import { useToast } from '@/src/core';
import { useUpdateBill } from './useUpdateBill';
import type { Bill } from '../types/billing.types';
import { useState } from 'react';
import { ServiceItem } from '../types/billing.types';

interface UseBillingFormProps {
  onSuccess: () => void;
  defaultPatientId?: string;
}

export const useBillingForm = ({ onSuccess, defaultPatientId = '' }: UseBillingFormProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const createBillMutation = useCreateBillMutation();
  const updateBillMutation = useUpdateBill();
  const [editingId, setEditingId] = useState<string | null>(null);

  const [servicesList, setServicesList] = useState<ServiceItem[]>([
    { serviceName: 'General Consultation', cost: 150 },
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCost, setNewItemCost] = useState('');

  const form = useForm<ICreateBillFormInput>({
    resolver: yupResolver(CreateBillSchema) as any,
    defaultValues: {
      patientId: defaultPatientId,
      services: servicesList,
      taxPercent: 5,
      discountAmount: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  });

  const addServiceItem = () => {
    if (!newItemName.trim() || !newItemCost || !Number.isFinite(Number(newItemCost)) || Number(newItemCost) <= 0) {
      toast.error(t('toastInvalidServiceItem'));
      return;
    }
    const updated = [
      ...servicesList,
      { serviceName: newItemName.trim(), cost: Number(newItemCost) },
    ];
    setServicesList(updated);
    form.setValue('services', updated, { shouldValidate: true });
    setNewItemName('');
    setNewItemCost('');
  };

  const removeServiceItem = (idx: number) => {
    const updated = servicesList.filter((_, i) => i !== idx);
    setServicesList(updated);
    form.setValue('services', updated, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<ICreateBillFormInput> = (values) => {
    const request = { ...values, services: servicesList };
    const callbacks = {
      onSuccess: () => { toast.success(editingId ? t('saveChangesAction') : t('toastInvoiceGenerated')); onSuccess(); },
      onError: (err: Error) => toast.error(err.message),
    };
    if (editingId) updateBillMutation.mutate({ id: editingId, request }, callbacks);
    else createBillMutation.mutate(request, callbacks);
  };

  const loadBill = (bill: Bill) => {
    setEditingId(bill.billId); setServicesList(bill.services.map(item => ({ ...item })));
    setNewItemName(''); setNewItemCost('');
    form.reset({ patientId: bill.patientId, services: bill.services, taxPercent: bill.taxPercent, discountAmount: bill.discountAmount, dueDate: bill.dueDate.slice(0, 10) });
  };
  const resetForm = (patientId = '') => {
    setEditingId(null);
    setServicesList([{ serviceName: 'General Consultation', cost: 150 }]);
    setNewItemName('');
    setNewItemCost('');
    form.reset({
      patientId,
      services: [{ serviceName: 'General Consultation', cost: 150 }],
      taxPercent: 5,
      discountAmount: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  };

  return {
    form,
    servicesList,
    newItemName,
    setNewItemName,
    newItemCost,
    setNewItemCost,
    addServiceItem,
    removeServiceItem,
    onSubmit: form.handleSubmit(onSubmit),
    editingId, loadBill,
    isSubmitting: createBillMutation.isPending || updateBillMutation.isPending,
    resetForm,
  };
};
