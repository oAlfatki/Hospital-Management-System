import * as yup from 'yup';

export const UpdateRecordSchema = yup.object().shape({
  diagnosis: yup.string().min(2, 'Clinical diagnosis description is required').required(),
  treatment: yup.string().min(2, 'Proposed treatment plan is required').required(),
  prescriptions: yup
    .string()
    .min(1, 'Prescriptions list is required (enter None if none)')
    .required(),
  status: yup
    .string()
    .oneOf(['Active', 'Archived'] as const)
    .required(),
});
