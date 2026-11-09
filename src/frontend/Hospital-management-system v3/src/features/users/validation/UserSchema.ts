import * as yup from 'yup';

export const UserSchema = yup.object({
  password: yup.string().when('$mode', { is: 'create', then: schema => schema.required('validationPasswordMin') }).test('password-length', 'validationPasswordMin', value => !value || value.length >= 12),
  name: yup
    .string()
    .trim()
    .required('validationNameRequired')
    .min(2, 'validationNameMin'),

  email: yup
    .string()
    .trim()
    .required('validationEmailRequired')
    .email('validationEmailInvalid'),

  role: yup
    .mixed<'Admin' | 'Doctor' | 'Nurse' | 'Accounts' | 'Management'>()
    .oneOf(['Admin', 'Doctor', 'Nurse', 'Accounts', 'Management'])
    .required('validationRoleRequired'),

  contactNumber: yup
    .string()
    .optional(),

  department: yup
    .string()
    .optional(),

  status: yup
    .mixed<'Active' | 'Inactive'>()
    .oneOf(['Active', 'Inactive'])
    .required('validationStatusRequired'),
});
