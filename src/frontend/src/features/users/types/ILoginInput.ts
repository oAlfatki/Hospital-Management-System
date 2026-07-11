import type { TranslationKey } from "../../../core/locales/i18n";

export interface ILoginInput {
  name: "email" | "password";
  label: TranslationKey;
  placeholder: string;
  type: string;
  validation: {
    required?: boolean;
    minLength?: number;
    pattern?: RegExp;
  };
}