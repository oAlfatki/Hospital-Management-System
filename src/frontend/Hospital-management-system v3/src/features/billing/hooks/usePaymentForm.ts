import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { RecordPaymentSchema } from '../validation/RecordPaymentSchema';
import { IRecordPaymentFormInput } from '../types/IBillFormInput';
import { useRecordPaymentMutation } from './useRecordPayment';
import { useLanguage } from '@/src/core/providers';
import { useToast } from '@/src/core';
import { EnrichedBill } from '../types/EnrichedBill';

interface UsePaymentFormProps {
  selectedBill: EnrichedBill | null;
  onSuccess: () => void;
}

export const usePaymentForm = ({ selectedBill, onSuccess }: UsePaymentFormProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const recordPaymentMutation = useRecordPaymentMutation();

  const form = useForm<IRecordPaymentFormInput>({
    resolver: yupResolver(RecordPaymentSchema) as any,
    values: {
      billId: selectedBill?.billId || '',
      amountToPay: selectedBill?.pendingDue || 0,
    },
  });

  const onSubmit: SubmitHandler<IRecordPaymentFormInput> = (values) => {
    if (!selectedBill) return;
    recordPaymentMutation.mutate(
      {
        billId: values.billId,
        amountToPay: Number(values.amountToPay),
      },
      {
        onSuccess: (updatedBill) => {
          const balanceMsg =
            language === 'ar'
              ? `المتبقي: $${updatedBill.pendingDue}`
              : `Balance remaining: $${updatedBill.pendingDue}`;
          toast.success(`${t('toastRecordedPayment')} ($${values.amountToPay}). ${balanceMsg}`);
          onSuccess();
        },
        onError: (err: Error) => {
          toast.error(err.message || t('toastFailedApplyPayment'));
        },
      }
    );
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: recordPaymentMutation.isPending,
  };
};
