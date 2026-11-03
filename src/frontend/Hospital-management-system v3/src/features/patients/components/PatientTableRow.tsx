
import { useLanguage } from "../../../core/providers/LanguageProvider";
import { formatDate } from "../../../core/utils/cn";
import type { Patient } from "../types/Patient";
import { PatientRowActions } from "./PatientRowActions";
import { PatientStatusBadge } from "./PatientStatusBadge";

interface PatientTableRowProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
}

export function PatientTableRow({ patient, onEdit }: PatientTableRowProps) {
  const { language, t } = useLanguage();

  const calculatedAge =
    new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();

  return (
    <tr className="border-b border-border transition-colors hover:bg-surface-hover">
      {/* Patient ID */}
      <td className="px-6 py-5 font-mono text-xs font-bold uppercase text-brand">
        {patient.patientId}
      </td>

      {/* Full Name */}
      <td className="px-6 py-5 font-semibold text-text">{patient.name}</td>

      {/* Date of Birth */}
      <td className="px-6 py-5 text-text-muted">
        {formatDate(patient.dateOfBirth, language === "ar" ? "ar-EG" : "en-US")}

        <span className="ml-2 text-xs text-text-light">
          ({calculatedAge} {t("commonYears")})
        </span>
      </td>

      {/* Gender */}
      <td className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-600">
        {patient.gender === "Male"
          ? t("commonMale")
          : patient.gender === "Female"
            ? t("commonFemale")
            : patient.gender === "Other"
              ? t("commonOther")
              : patient.gender === "Prefer not to say"
                ? t("commonPreferNotToSay")
                : patient.gender}
      </td>

      {/* Phone */}
      <td className="px-6 py-5 text-slate-600">{patient.contactNumber}</td>

      {/* Email */}
      <td className="max-w-55 truncate px-6 py-5 text-slate-600">
        {patient.email || "—"}
      </td>

      {/* Status */}
      <td className="px-6 py-5">
        <PatientStatusBadge status={patient.status} />
      </td>

      {/* Actions */}
      <td className="px-6 py-5">
        <div className="flex justify-center">
          <PatientRowActions patient={patient} onEdit={onEdit} />
        </div>
      </td>
    </tr>
  );
}
