import * as yup from "yup";

export const MedicalRecordSchema = yup.object({
  patientId: yup.string().required("patientRequired"),
  diagnosis: yup.string().required("diagnosisRequired"),
  treatment: yup.string(),
  prescriptions: yup.string(),
  status: yup.string().required(),
});

export type ICreateClinicalFileFormInput = yup.InferType<
  typeof MedicalRecordSchema
>;
