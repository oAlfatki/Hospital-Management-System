import { Badge } from "../../../core/components/ui/Badge";
import { useLanguage } from "../../../core/providers/LanguageProvider";


interface PatientStatusBadgeProps {
  status: string;
}

export function PatientStatusBadge({ status }: PatientStatusBadgeProps) {
  const { t } = useLanguage();

  switch (status) {
    case "Active":
      return <Badge variant="success">{t("commonActive")}</Badge>;

    case "Inactive":
      return <Badge variant="warning">{t("commonInactive")}</Badge>;

    case "Deceased":
      return <Badge variant="error">{t("commonDeceased")}</Badge>;

    default:
      return null;
  }
}
