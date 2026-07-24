import type { SubmitHandler, UseFormReturn } from "react-hook-form";

import { Button } from "../../../core/components/ui/Button";
import { Dialog } from "../../../core/components/ui/Dialog";
import { Input } from "../../../core/components/ui/Input";
import { Select } from "../../../core/components/ui/Select";
import InputErrorMessage from "../../../core/components/ui/InputErrorMessage";

import { LoadingOverlay } from "../../../core/components/ui/LoadingOverlay";

import { useLanguage } from "../../../core/providers/LanguageProvider";
import type { TranslationKey } from "../../../core/locales/i18n";

import type { IPatientFormInput } from "../types/IRegisterPatientFormInput";

interface PatientDialogProps {
  mode: "create" | "edit";
  isOpen: boolean;
  onClose: () => void;
  form: UseFormReturn<IPatientFormInput>;
  onSubmit: SubmitHandler<IPatientFormInput>;
  isSubmitting: boolean;
}

export const PatientDialog = ({
  mode,
  isOpen,
  onClose,
  form,
  onSubmit,
  isSubmitting,
}: PatientDialogProps) => {
  const { t, language } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        mode === "create"
          ? t("registerNewPatientFile")
          : t("updatePatientProfileDetails")
      }
      footer={
        <div className="flex w-full justify-end gap-3 border-t border-sidebar-border pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t("commonCancel")}
          </Button>

          <Button
            type="submit"
            form="patientForm"
            disabled={isSubmitting}
            className="bg-brand text-white"
          >
            {mode === "create" ? t("saveRecord") : t("applyChanges")}
          </Button>
        </div>
      }
    >
      <div className="relative">
        <LoadingOverlay isLoading={isSubmitting} message={t("commonSaving")} />
        <form
          id="patientForm"
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-x-5 gap-y-1 md:grid-cols-2"
        >
          <Input
            label={t("fullName")}
            placeholder="Ellen Ripley"
            error={
              errors.name ? t(errors.name.message as TranslationKey) : undefined
            }
            {...register("name")}
          />

          <Input
            label={language === "ar" ? "تاريخ الميلاد" : "Date of Birth"}
            type="date"
            error={
              errors.dateOfBirth
                ? t(errors.dateOfBirth.message as TranslationKey)
                : undefined
            }
            {...register("dateOfBirth")}
          />

          <Select
            label={t("genderIdentity")}
            error={
              errors.gender
                ? t(errors.gender.message as TranslationKey)
                : undefined
            }
            options={[
              { value: "Male", label: t("commonMale") },
              { value: "Female", label: t("commonFemale") },
              { value: "Other", label: t("commonOther") },
              {
                value: "Prefer not to say",
                label: t("commonPreferNotToSay"),
              },
            ]}
            {...register("gender")}
          />

          <Input
            label={t("contactPhone")}
            maxLength={10}
            error={
              errors.contactNumber
                ? t(errors.contactNumber.message as TranslationKey)
                : undefined
            }
            {...register("contactNumber")}
          />

          <Input
            label={t("colEmailAddress")}
            type="email"
            error={
              errors.email
                ? t(errors.email.message as TranslationKey)
                : undefined
            }
            {...register("email")}
          />

          <Select
            label={t("patientFileStatus")}
            error={
              errors.status
                ? t(errors.status.message as TranslationKey)
                : undefined
            }
            options={[
              { value: "Active", label: t("commonActive") },
              { value: "Inactive", label: t("commonInactive") },
              { value: "Deceased", label: t("commonDeceased") },
            ]}
            {...register("status")}
          />

          <div className="col-span-2 mb-4">
            <label className="mb-1.5 block text-tiny font-bold uppercase tracking-wider text-text-muted">
              {t("residentialAddress")}
            </label>

            <textarea
              rows={2}
              className="w-full resize-none rounded-md border border-border bg-surface-card px-3.5 py-2.5"
              {...register("address")}
            />

            {errors.address && (
              <InputErrorMessage
                msg={t(errors.address.message as TranslationKey)}
              />
            )}
          </div>

          <div className="col-span-2 mb-4">
            <label className="mb-1.5 block text-tiny font-bold uppercase tracking-wider text-text-muted">
              {t("clinicalMedicalHistory")}
            </label>

            <textarea
              rows={3}
              className="w-full resize-none rounded-md border border-border bg-surface-card px-3.5 py-2.5"
              {...register("medicalHistory")}
            />

            {errors.medicalHistory && (
              <InputErrorMessage
                msg={t(errors.medicalHistory.message as TranslationKey)}
              />
            )}
          </div>
        </form>
      </div>
    </Dialog>
  );
};
