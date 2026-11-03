import * as yup from 'yup';

export const RecordPaymentSchema = yup.object().shape({
  billId: yup.string().required('Bill ID is required'),
  amountToPay: yup
    .number()
    .positive('Amount must be greater than zero')
    .required('Payment amount is required'),
});
