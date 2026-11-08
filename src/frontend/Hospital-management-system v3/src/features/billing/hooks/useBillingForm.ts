import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CreateBillSchema } from '../validation/CreateBillSchema';
import { ICreateBillFormInput } from '../types/IBillFormInput';
import { useCreateBillMutation } from './useCreateBill';
import { useLanguage } from '@/src/core/providers';
import { useToast } from '@/src/core';
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
    if (!newItemName.trim() || !newItemCost || isNaN(Number(newItemCost))) {
      toast.error(t('toastInvalidServiceItem'));
      return;
    }
    const updated = [
      ...servicesList,
      { serviceName: newItemName.trim(), cost: Math.abs(Number(newItemCost)) },
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

  // const onSubmit: SubmitHandler<ICreateBillFormInput> = (values) => {
  //   console.log('FORM SUBMITTED:', values);
  //   createBillMutation.mutate(
  //     { ...values, services: servicesList },
  //     {
  //       onSuccess: (createdBill) => {
  //         console.log('BILL CREATED:', createdBill);
  //         toast.success(`${t('toastInvoiceGenerated')} ("${createdBill.billId}")`);
  //         onSuccess();
  //       },
  //       onError: (err: Error) => {
  //         console.error('CREATE BILL ERROR:', err);
  //         toast.error(err.message || t('toastFailedCreateBill'));
  //       },
  //     }
  //   );
  // };
const onSubmit: SubmitHandler<ICreateBillFormInput> = (values) => {
  const grossAmount = values.services.reduce(
    (total, service) => total + service.cost,
    0
  );

  const discount = values.discountAmount;

  const tax = (grossAmount - discount) * (values.taxPercent / 100);

  const patientResponsibility = grossAmount - discount + tax;

  const request: CreateBillRequest = {
    id: '',
    patientID: values.patientId.trim(),
    status: 'Unpaid',
    date: new Date().toISOString(),
    partialPaymentAmount: 0,
    dueDate: new Date(values.dueDate).toISOString(),
    invoice: `INV-${Date.now()}`,
    grossAmount: grossAmount,
    discount: discount,
    insuranceCoverage: 0,
    patientResponsibility: patientResponsibility,
  };

  console.log('REQUEST SENT:', request);

  createBillMutation.mutate(request, {
    onSuccess: (createdBill) => {
      console.log('BILL CREATED:', createdBill);
      toast.success(`${t('toastInvoiceGenerated')} ("${createdBill.billId}")`);
      onSuccess();
    },
    onError: (err: Error) => {
      console.error('CREATE BILL ERROR:', err);
      toast.error(err.message || t('toastFailedCreateBill'));
    },
  });
};
  const resetForm = (patientId = '') => {
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
    isSubmitting: createBillMutation.isPending,
    resetForm,
  };
};
