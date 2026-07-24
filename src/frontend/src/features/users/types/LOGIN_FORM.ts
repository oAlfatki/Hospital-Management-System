import type { ILoginInput } from "./ILoginInput";

export const LOGIN_FORM: ILoginInput[] = [
  {
    name: "email",
    label: 'staffEmailAddress',
    placeholder: "Email",
    type: "email",
    validation: {
      required: true,
      pattern: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
    },
  },
  {
    name: "password",
    label: 'staffSecurityPassword',
    placeholder: "Password",
    type: "password",
    validation: {
      required: true,
      minLength: 6,
    },
  },
];