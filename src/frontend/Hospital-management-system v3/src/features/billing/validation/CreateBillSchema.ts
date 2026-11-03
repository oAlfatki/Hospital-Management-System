import * as yup from 'yup';

export const CreateBillSchema = yup.object().shape({
  patientId: yup.string().required('Patient selection is required'),
  services: yup
    .array()
    .of(
      yup.object().shape({
        serviceName: yup.string().required('Service name is required'),
        cost: yup.number().min(0, 'Cost must be positive').required(),
      })
    )
    .min(1, 'At least one service item is required')
    .required(),
  taxPercent: yup
    .number()
    .min(0, 'Tax must be positive')
    .max(100, 'Tax cannot exceed 100%')
    .required(),
  discountAmount: yup
    .number()
    .min(0, 'Discount must be positive')
    .required(),
  dueDate: yup.string().required('Due date is required'),
});
