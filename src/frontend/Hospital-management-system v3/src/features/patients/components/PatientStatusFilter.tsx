import { Filter } from "lucide-react";
import { useLanguage } from "../../../core/providers/LanguageProvider";

type PatientStatusType = "Active" | "Inactive" | "Deceased";

interface PatientStatusFilterProps {
  value: PatientStatusType | "All";
  onChange: (value: PatientStatusType | "All") => void;
}

export const PatientStatusFilter = ({
  value,
  onChange,
}: PatientStatusFilterProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-3">
      <Filter className="h-4 w-4 text-text-light" />

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value as PatientStatusType | "All")
        }
        className="
          w-52
          rounded-md
          border
          border-border
          bg-surface-card
          px-3
          py-2.5
          text-sm
          text-text
          outline-none
          transition-all
          duration-normal
          focus:border-brand
          focus:ring-2
          focus:ring-brand/15
        "
      >
        <option value="All">{t("commonAllStatuses")}</option>
        <option value="Active">{t("commonActive")}</option>
        <option value="Inactive">{t("commonInactive")}</option>
        <option value="Deceased">{t("commonDeceased")}</option>
      </select>
    </div>
  );
};