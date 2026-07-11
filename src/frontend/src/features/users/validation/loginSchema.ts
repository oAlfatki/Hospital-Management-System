import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string()
    .email()
    .required("validationEmailRequired")
    .matches(/^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/, "validationEmailInvalid"),
  password: yup
    .string()
    .required("validationPasswordRequired")
    .min(6, "validationPasswordMinLength"),
});
