import * as yup from "yup";

export const RegisterPatientSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("validationPatientNameRequired")
    .min(3, "validationPatientNameMin"),

  dateOfBirth: yup
    .string()
    .required("validationDateOfBirthRequired")
    .test(
      "not-in-future",
      "validationDateOfBirthFuture",
      (value) => {
        if (!value) return false;
        return new Date(value) <= new Date();
      }
    ),

  gender: yup
    .mixed<"Male" | "Female" | "Other" | "Prefer not to say">()
    .oneOf(["Male", "Female", "Other", "Prefer not to say"])
    .required("validationGenderRequired"),

  contactNumber: yup
    .string()
    .required("validationContactNumberRequired")
    .matches(/^\d{10}$/, "validationContactNumber"),

  email: yup
    .string()
    .email("validationEmail")
    .defined(),


  address: yup
    .string()
    .max(255, "validationAddressMax")
    .defined(),

  medicalHistory: yup
    .string()
    .max(1000, "validationMedicalHistoryMax")
    .defined(),

  status: yup
    .mixed<"Active" | "Inactive" | "Deceased">()
    .oneOf(["Active", "Inactive", "Deceased"])
    .required("validationStatusRequired"),
});