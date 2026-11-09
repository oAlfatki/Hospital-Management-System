import * as yup from 'yup';

export const DoctorSchema = yup.object({
  // name: yup
  //   .string()
  //   .trim()
  //   .required('validationDoctorNameRequired')
  //   .min(3, 'validationDoctorNameMin'),

  departmentId: yup
    .string()
    .required('validationDepartmentRequired'),

  specialty: yup
    .string()
    .trim()
    .required('validationSpecialtyRequired'),

  // contactNumber: yup
  //   .string()
  //   .required('validationContactNumberRequired')
  //   .matches(/^\d{10}$/, 'validationContactNumber'),

  // email: yup
  //   .string()
  //   .required('validationEmailRequired')
  //   .email('validationEmailInvalid'),
userID  :yup
.string()
.required('validationUserRequired'),
  status: yup
    .mixed<'Active' | 'Inactive'>()
    .oneOf(['Active', 'Inactive'])
    .required('validationStatusRequired'),
});

export const DepartmentSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required('validationDepartmentNameRequired')
    .min(2, 'validationDepartmentNameMin'),

  headOfDepartment: yup
    .string()
    .optional(),

  description: yup
    .string()
    .max(500, 'validationDescriptionMax')
    .optional(),
});
