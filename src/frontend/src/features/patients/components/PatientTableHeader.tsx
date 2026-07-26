import { useLanguage } from "../../../core/providers/LanguageProvider";

export function PatientTableHeader() {
  const { language, t } = useLanguage();

  return (
    <thead>
      <tr className="border-b border-border bg-surface-muted text-tiny font-bold uppercase tracking-wider text-text-muted">
        <th className="px-6 py-4">
          {language === "ar" ? "معرف المريض" : "Patient ID"}
        </th>
        <th className="px-6 py-4">{t("fullName")}</th>
        <th className="px-6 py-4">{t("colDateOfBirthAge")}</th>
        <th className="px-6 py-4">{t("colGender")}</th>
        <th className="px-6 py-4">{t("colContactNumber")}</th>
        <th className="px-6 py-4">{t("colEmailAddress")}</th>
        <th className="px-6 py-4">{t("commonStatus")}</th>
        <th className="px-6 py-4 text-center">{t("colActions")}</th>
      </tr>
    </thead>
  );
}
